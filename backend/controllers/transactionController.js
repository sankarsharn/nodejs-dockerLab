const { Transaction, Book, Member, User } = require('../models');
const { Op } = require('sequelize');

// @desc    Issue a book
// @route   POST /api/transactions/issue
// @access  Private
const issueBook = async (req, res) => {
    try {
        const { bookId, memberId, dueDate } = req.body;

        // Find book and member
        const book = await Book.findByPk(bookId);
        const member = await Member.findByPk(memberId);

        if (!book) {
            return res.status(404).json({ message: 'Book not found' });
        }

        if (!member) {
            return res.status(404).json({ message: 'Member not found' });
        }

        // Check if book is available
        if (book.availableCopies <= 0) {
            return res.status(400).json({ message: 'No copies available for this book' });
        }

        // Check if member can borrow more books
        // Count active transactions
        const activeIssuesCount = await Transaction.count({
            where: {
                memberId: member.id,
                status: 'issued'
            }
        });

        if (activeIssuesCount >= member.maxBooksAllowed) {
            return res.status(400).json({ message: 'Member has reached maximum books limit' });
        }

        // Check if membership is active
        if (!member.isActive || new Date() > member.membershipExpiry) {
            return res.status(400).json({ message: 'Member membership is expired or inactive' });
        }

        // Check if member already has this book
        const existingIssue = await Transaction.findOne({
            where: {
                memberId: member.id,
                bookId: book.id,
                status: 'issued'
            }
        });

        if (existingIssue) {
            return res.status(400).json({ message: 'Member already has this book issued' });
        }

        // Calculate due date (default 14 days)
        const defaultDays = parseInt(process.env.DEFAULT_ISSUE_DAYS) || 14;
        const calculatedDueDate = dueDate || new Date(Date.now() + defaultDays * 24 * 60 * 60 * 1000);

        // Create transaction
        // Using Sequelize create, foreign keys are bookId, memberId, issuedBy
        const transaction = await Transaction.create({
            bookId: book.id,
            memberId: member.id,
            issuedBy: req.user.id,
            dueDate: calculatedDueDate,
            issueDate: new Date(),
            status: 'issued'
        });

        // Update book available copies
        book.availableCopies -= 1;
        await book.save();

        // Return populated transaction
        const populatedTransaction = await Transaction.findByPk(transaction.id, {
            include: [
                { model: Book, attributes: ['title', 'author', 'isbn'] },
                { model: Member, attributes: ['name', 'membershipId'] },
                { model: User, as: 'issuer', attributes: ['name'] }
            ]
        });

        const transactionData = populatedTransaction.toJSON();
        transactionData._id = transaction.id;
        // Map nested objects if needed, but Sequelize structure is slightly different (Book object instead of book field replacement)
        // Frontend likely expects `transaction.book.title`, which works.
        // Frontend might expect `transaction.issuedBy.name` but we have `transaction.issuer.name` due to alias.
        // Let's remap for compatibility.
        transactionData.issuedBy = transactionData.issuer;

        res.status(201).json(transactionData);
    } catch (error) {
        console.error('Issue book error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// @desc    Return a book
// @route   POST /api/transactions/return/:id
// @access  Private
const returnBook = async (req, res) => {
    try {
        const transaction = await Transaction.findByPk(req.params.id);

        if (!transaction) {
            return res.status(404).json({ message: 'Transaction not found' });
        }

        if (transaction.status === 'returned') {
            return res.status(400).json({ message: 'Book already returned' });
        }

        // Update transaction
        transaction.returnDate = new Date();
        transaction.status = 'returned';

        // Calculate fine if overdue
        const finePerDay = parseInt(process.env.FINE_PER_DAY) || 5;
        // Ensure calculateFine logic works with instance
        transaction.calculateFine(finePerDay);

        await transaction.save();

        // Update book available copies
        const book = await Book.findByPk(transaction.bookId);
        if (book) {
            book.availableCopies += 1;
            await book.save();
        }

        // Return populated transaction
        const populatedTransaction = await Transaction.findByPk(transaction.id, {
            include: [
                { model: Book, attributes: ['title', 'author', 'isbn'] },
                { model: Member, attributes: ['name', 'membershipId'] }
            ]
        });

        const transactionData = populatedTransaction.toJSON();
        transactionData._id = transaction.id;

        res.json({
            transaction: transactionData,
            fine: transaction.fine,
            message: transaction.fine > 0
                ? `Book returned with fine of ₹${transaction.fine}`
                : 'Book returned successfully'
        });
    } catch (error) {
        console.error('Return book error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// @desc    Get all transactions
// @route   GET /api/transactions
// @access  Private
const getAllTransactions = async (req, res) => {
    try {
        const { page = 1, limit = 10, status, memberId, bookId } = req.query;

        let whereClause = {};

        if (status) {
            whereClause.status = status;
        }

        if (memberId) {
            whereClause.memberId = memberId;
        }

        if (bookId) {
            whereClause.bookId = bookId;
        }

        const { count, rows: transactions } = await Transaction.findAndCountAll({
            where: whereClause,
            limit: parseInt(limit),
            offset: (parseInt(page) - 1) * parseInt(limit),
            order: [['createdAt', 'DESC']],
            include: [
                { model: Book, attributes: ['title', 'author', 'isbn'] },
                { model: Member, attributes: ['name', 'membershipId', 'email'] },
                { model: User, as: 'issuer', attributes: ['name'] }
            ]
        });

        // Update overdue statuses (This is inefficient to do on every fetch, but kept for logic parity)
        // Better to run a cron job or check on access.
        // Here we just modify the returned list or update DB? Original updated DB.
        for (let transaction of transactions) {
            if (transaction.status === 'issued' && new Date() > transaction.dueDate) {
                transaction.status = 'overdue';
                await transaction.save();
            }
        }

        const transactionsData = transactions.map(t => {
            const td = t.toJSON();
            td._id = t.id;
            // Map issuer to issuedBy for compatibility
            td.issuedBy = td.issuer;
            return td;
        });

        res.json({
            transactions: transactionsData,
            totalPages: Math.ceil(count / limit),
            currentPage: parseInt(page),
            totalTransactions: count
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// @desc    Get overdue books
// @route   GET /api/transactions/overdue
// @access  Private
const getOverdueBooks = async (req, res) => {
    try {
        // Find overdue via DB query
        const overdueTransactions = await Transaction.findAll({
            where: {
                status: { [Op.in]: ['issued', 'overdue'] },
                dueDate: { [Op.lt]: new Date() }
            },
            include: [
                { model: Book, attributes: ['title', 'author', 'isbn'] },
                { model: Member, attributes: ['name', 'membershipId', 'email', 'phone'] }
            ],
            order: [['dueDate', 'ASC']]
        });

        // Update statuses
        for (let transaction of overdueTransactions) {
            if (transaction.status === 'issued') {
                transaction.status = 'overdue';
                await transaction.save();
            }
        }

        const overdueData = overdueTransactions.map(t => {
            const td = t.toJSON();
            td._id = t.id;
            return td;
        });

        res.json(overdueData);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// @desc    Pay fine
// @route   PUT /api/transactions/:id/pay-fine
// @access  Private
const payFine = async (req, res) => {
    try {
        const transaction = await Transaction.findByPk(req.params.id);

        if (!transaction) {
            return res.status(404).json({ message: 'Transaction not found' });
        }

        if (transaction.fine <= 0) {
            return res.status(400).json({ message: 'No fine to pay' });
        }

        transaction.finePaid = true;
        await transaction.save();

        const transactionData = transaction.toJSON();
        transactionData._id = transaction.id;

        res.json({ message: 'Fine paid successfully', transaction: transactionData });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// @desc    Get current user's transactions (for students)
// @route   GET /api/transactions/my
// @access  Private
const getMyTransactions = async (req, res) => {
    try {
        const { page = 1, limit = 10, status } = req.query;

        // Find member by user email
        const member = await Member.findOne({ where: { email: req.user.email } });

        if (!member) {
            return res.json({
                transactions: [],
                totalPages: 0,
                currentPage: 1,
                totalTransactions: 0,
                message: 'No member profile found for your account'
            });
        }

        let whereClause = { memberId: member.id };

        if (status) {
            whereClause.status = status;
        }

        const { count, rows: transactions } = await Transaction.findAndCountAll({
            where: whereClause,
            limit: parseInt(limit),
            offset: (parseInt(page) - 1) * parseInt(limit),
            order: [['createdAt', 'DESC']],
            include: [
                { model: Book, attributes: ['title', 'author', 'isbn', 'category'] },
                { model: Member, attributes: ['name', 'membershipId'] } // Not strictly needed as it's self, but good for completeness
            ]
        });

        const transactionsData = transactions.map(t => {
            const td = t.toJSON();
            td._id = t.id;
            return td;
        });

        res.json({
            transactions: transactionsData,
            totalPages: Math.ceil(count / limit),
            currentPage: parseInt(page),
            totalTransactions: count
        });
    } catch (error) {
        console.error('Error fetching my transactions:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

module.exports = { issueBook, returnBook, getAllTransactions, getOverdueBooks, payFine, getMyTransactions };
