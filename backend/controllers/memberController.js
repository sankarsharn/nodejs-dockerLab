const { Member, Transaction, Book, User } = require('../models');
const { Op } = require('sequelize');

// @desc    Get all members
// @route   GET /api/members
// @access  Private
const getAllMembers = async (req, res) => {
    try {
        const { page = 1, limit = 10, search, membershipType, active } = req.query;

        let whereClause = {};

        // Filter by active status
        if (active !== undefined) {
            whereClause.isActive = active === 'true';
        }

        // Filter by membership type
        if (membershipType) {
            whereClause.membershipType = membershipType;
        }

        // Search functionality
        if (search) {
            whereClause[Op.or] = [
                { name: { [Op.iLike]: `%${search}%` } },
                { email: { [Op.iLike]: `%${search}%` } },
                { membershipId: { [Op.iLike]: `%${search}%` } }
            ];
        }

        const { count, rows: members } = await Member.findAndCountAll({
            where: whereClause,
            limit: parseInt(limit),
            offset: (parseInt(page) - 1) * parseInt(limit),
            order: [['createdAt', 'DESC']],
            // Include active transactions to simulate booksIssued
            include: [{
                model: Transaction,
                where: { status: 'issued' },
                required: false, // Left join to allow members without issues
                include: [Book]
            }]
        });

        // Map _id and booksIssued structure
        const membersData = members.map(member => {
            const m = member.toJSON();
            m._id = member.id;
            // Map Transactions to booksIssued containing book info
            m.booksIssued = member.Transactions ? member.Transactions.map(t => t.Book) : [];
            return m;
        });

        res.json({
            members: membersData,
            totalPages: Math.ceil(count / limit),
            currentPage: parseInt(page),
            totalMembers: count
        });
    } catch (error) {
        console.error('Error fetching members:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// @desc    Get single member
// @route   GET /api/members/:id
// @access  Private
const getMemberById = async (req, res) => {
    try {
        const member = await Member.findByPk(req.params.id, {
            include: [{
                model: Transaction,
                where: { status: 'issued' },
                required: false,
                include: [Book]
            }]
        });

        if (!member) {
            return res.status(404).json({ message: 'Member not found' });
        }

        const memberData = member.toJSON();
        memberData._id = member.id;
        memberData.booksIssued = member.Transactions ? member.Transactions.map(t => t.Book) : [];

        res.json(memberData);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// @desc    Add new member
// @route   POST /api/members
// @access  Private
const addMember = async (req, res) => {
    try {
        const { name, email, phone, address, membershipType, membershipExpiry } = req.body;

        // Check if member exists
        const memberExists = await Member.findOne({ where: { email } });
        if (memberExists) {
            return res.status(400).json({ message: 'Member with this email already exists' });
        }

        // Calculate expiry date if not provided (1 year from now)
        const expiry = membershipExpiry || new Date(Date.now() + 365 * 24 * 60 * 60 * 1000);

        const member = await Member.create({
            name,
            email,
            phone,
            address,
            membershipType,
            membershipExpiry: expiry
        });

        const memberData = member.toJSON();
        memberData._id = member.id;
        memberData.booksIssued = [];

        res.status(201).json(memberData);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// @desc    Update member
// @route   PUT /api/members/:id
// @access  Private
const updateMember = async (req, res) => {
    try {
        const member = await Member.findByPk(req.params.id);

        if (!member) {
            return res.status(404).json({ message: 'Member not found' });
        }

        // Update fields
        Object.keys(req.body).forEach(key => {
            if (req.body[key] !== undefined) {
                member[key] = req.body[key];
            }
        });

        const updatedMember = await member.save();

        const memberData = updatedMember.toJSON();
        memberData._id = updatedMember.id;

        res.json(memberData);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// @desc    Delete member (soft delete)
// @route   DELETE /api/members/:id
// @access  Private/Admin
const deleteMember = async (req, res) => {
    try {
        const member = await Member.findByPk(req.params.id);

        if (!member) {
            return res.status(404).json({ message: 'Member not found' });
        }

        // Check if member has any issued books
        const activeIssuesCount = await Transaction.count({
            where: {
                memberId: member.id,
                status: 'issued'
            }
        });

        if (activeIssuesCount > 0) {
            return res.status(400).json({ message: 'Cannot delete member with issued books' });
        }

        member.isActive = false;
        await member.save();

        res.json({ message: 'Member removed successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// @desc    Get member transaction history
// @route   GET /api/members/:id/history
// @access  Private
const getMemberHistory = async (req, res) => {
    try {
        const transactions = await Transaction.findAll({
            where: { memberId: req.params.id },
            include: [
                { model: Book, attributes: ['title', 'author', 'isbn'] },
                { model: User, as: 'issuer', attributes: ['name'] }
            ],
            order: [['createdAt', 'DESC']]
        });

        const transactionsData = transactions.map(t => {
            const td = t.toJSON();
            td._id = t.id;
            return td;
        });

        res.json(transactionsData);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

module.exports = { getAllMembers, getMemberById, addMember, updateMember, deleteMember, getMemberHistory };
