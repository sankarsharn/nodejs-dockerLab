const { Book } = require('../models');
const { Op } = require('sequelize');

// @desc    Get all books
// @route   GET /api/books
// @access  Private
const getAllBooks = async (req, res) => {
    try {
        const { page = 1, limit = 10, category, search, available } = req.query;

        let whereClause = { isActive: true };

        // Filter by category
        if (category) {
            whereClause.category = category;
        }

        // Filter by availability
        if (available === 'true') {
            whereClause.availableCopies = { [Op.gt]: 0 };
        }

        // Search functionality
        if (search) {
            whereClause[Op.or] = [
                { title: { [Op.iLike]: `%${search}%` } }, // PostgreSQL case-insensitive like
                { author: { [Op.iLike]: `%${search}%` } },
                { isbn: { [Op.iLike]: `%${search}%` } }
            ];
        }

        const { count, rows: books } = await Book.findAndCountAll({
            where: whereClause,
            limit: parseInt(limit),
            offset: (parseInt(page) - 1) * parseInt(limit),
            order: [['createdAt', 'DESC']]
        });

        // Map _id for frontend compatibility
        const booksData = books.map(book => {
            const b = book.toJSON();
            b._id = book.id;
            return b;
        });

        res.json({
            books: booksData,
            totalPages: Math.ceil(count / limit),
            currentPage: parseInt(page),
            totalBooks: count
        });
    } catch (error) {
        console.error('Error fetching books:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// @desc    Get single book
// @route   GET /api/books/:id
// @access  Private
const getBookById = async (req, res) => {
    try {
        const book = await Book.findByPk(req.params.id);

        if (!book) {
            return res.status(404).json({ message: 'Book not found' });
        }

        // Map _id
        const bookData = book.toJSON();
        bookData._id = book.id;

        res.json(bookData);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// @desc    Add new book
// @route   POST /api/books
// @access  Private
const addBook = async (req, res) => {
    try {
        const { title, author, isbn, category, publisher, publishedYear, description, totalCopies, location, coverImage } = req.body;

        // Check if book with same ISBN exists
        const bookExists = await Book.findOne({ where: { isbn } });
        if (bookExists) {
            return res.status(400).json({ message: 'Book with this ISBN already exists' });
        }

        const book = await Book.create({
            title,
            author,
            isbn,
            category,
            publisher,
            publishedYear,
            description,
            totalCopies,
            location,
            coverImage
        });

        const bookData = book.toJSON();
        bookData._id = book.id;

        res.status(201).json(bookData);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// @desc    Update book
// @route   PUT /api/books/:id
// @access  Private
const updateBook = async (req, res) => {
    try {
        const book = await Book.findByPk(req.params.id);

        if (!book) {
            return res.status(404).json({ message: 'Book not found' });
        }

        // Update fields
        // Sequelize update method is safer, but direct assignment + save also works and triggers hooks
        Object.keys(req.body).forEach(key => {
            if (req.body[key] !== undefined) {
                book[key] = req.body[key];
            }
        });

        const updatedBook = await book.save();

        const bookData = updatedBook.toJSON();
        bookData._id = updatedBook.id;

        res.json(bookData);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// @desc    Delete book (soft delete)
// @route   DELETE /api/books/:id
// @access  Private/Admin
const deleteBook = async (req, res) => {
    try {
        const book = await Book.findByPk(req.params.id);

        if (!book) {
            return res.status(404).json({ message: 'Book not found' });
        }

        book.isActive = false;
        await book.save();

        res.json({ message: 'Book removed successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// @desc    Get book categories
// @route   GET /api/books/categories
// @access  Private
const getCategories = async (req, res) => {
    try {
        const categories = ['Fiction', 'Non-Fiction', 'Science', 'Technology', 'History', 'Biography', 'Literature', 'Philosophy', 'Art', 'Other'];
        res.json(categories);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

module.exports = { getAllBooks, getBookById, addBook, updateBook, deleteBook, getCategories };
