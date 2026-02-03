const { Book, Member, Transaction, sequelize, User } = require('../models');
const { Op } = require('sequelize');

// @desc    Get dashboard statistics
// @route   GET /api/dashboard/stats
// @access  Private
const getStats = async (req, res) => {
    try {
        // Count totals
        const totalBooks = await Book.count({ where: { isActive: true } });
        const totalMembers = await Member.count({ where: { isActive: true } });
        const totalTransactions = await Transaction.count();

        // Get active issues
        const activeIssues = await Transaction.count({ where: { status: 'issued' } });

        // Get overdue books
        const overdueBooks = await Transaction.count({
            where: {
                status: { [Op.in]: ['issued', 'overdue'] },
                dueDate: { [Op.lt]: new Date() }
            }
        });

        // Get available books count
        const availableBooks = await Book.sum('availableCopies', { where: { isActive: true } }) || 0;

        // Get today's statistics
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        const todayIssues = await Transaction.count({
            where: {
                issueDate: { [Op.gte]: today, [Op.lt]: tomorrow }
            }
        });

        const todayReturns = await Transaction.count({
            where: {
                returnDate: { [Op.gte]: today, [Op.lt]: tomorrow }
            }
        });

        // Get pending fines
        const pendingFines = await Transaction.sum('fine', {
            where: {
                fine: { [Op.gt]: 0 },
                finePaid: false
            }
        }) || 0;

        res.json({
            totalBooks,
            totalMembers,
            totalTransactions,
            activeIssues,
            overdueBooks,
            availableBooks,
            todayIssues,
            todayReturns,
            pendingFines
        });
    } catch (error) {
        console.error('Stats error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// @desc    Get recent activity
// @route   GET /api/dashboard/recent
// @access  Private
const getRecentActivity = async (req, res) => {
    try {
        const recentTransactions = await Transaction.findAll({
            include: [
                { model: Book, attributes: ['title', 'author'] },
                { model: Member, attributes: ['name', 'membershipId'] },
                { model: User, as: 'issuer', attributes: ['name'] }
            ],
            order: [['createdAt', 'DESC']],
            limit: 10
        });

        const data = recentTransactions.map(t => {
            const td = t.toJSON();
            td._id = t.id;
            td.issuedBy = td.issuer;
            return td;
        });

        res.json(data);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// @desc    Get category statistics
// @route   GET /api/dashboard/categories
// @access  Private
const getCategoryStats = async (req, res) => {
    try {
        const categoryStats = await Book.findAll({
            attributes: [
                ['category', '_id'], // Map category to _id for frontend compatibility
                [sequelize.fn('COUNT', sequelize.col('id')), 'count'],
                [sequelize.fn('SUM', sequelize.col('totalCopies')), 'totalCopies'],
                [sequelize.fn('SUM', sequelize.col('availableCopies')), 'availableCopies']
            ],
            where: { isActive: true },
            group: ['category'],
            order: [[sequelize.literal('count'), 'DESC']]
        });

        res.json(categoryStats);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// @desc    Get monthly statistics
// @route   GET /api/dashboard/monthly
// @access  Private
const getMonthlyStats = async (req, res) => {
    try {
        const sixMonthsAgo = new Date();
        sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
        sixMonthsAgo.setDate(1); // Start from beginning of that month

        // PostgreSQL extraction
        const monthlyStats = await Transaction.findAll({
            attributes: [
                [sequelize.fn('EXTRACT', sequelize.literal('YEAR FROM "createdAt"')), 'year'],
                [sequelize.fn('EXTRACT', sequelize.literal('MONTH FROM "createdAt"')), 'month'],
                [sequelize.fn('COUNT', sequelize.col('id')), 'issues'],
                // Conditional sum for returns is tricky in simple findAll, easier with raw query or case
                // Using literal for conditional count
                [sequelize.literal(`SUM(CASE WHEN status = 'returned' THEN 1 ELSE 0 END)`), 'returns'],
                [sequelize.fn('SUM', sequelize.col('fine')), 'fines']
            ],
            where: {
                createdAt: { [Op.gte]: sixMonthsAgo }
            },
            group: [sequelize.fn('EXTRACT', sequelize.literal('YEAR FROM "createdAt"')), sequelize.fn('EXTRACT', sequelize.literal('MONTH FROM "createdAt"'))],
            order: [
                [sequelize.fn('EXTRACT', sequelize.literal('YEAR FROM "createdAt"')), 'ASC'],
                [sequelize.fn('EXTRACT', sequelize.literal('MONTH FROM "createdAt"')), 'ASC']
            ]
        });

        // Format for frontend
        const result = monthlyStats.map(stat => {
            const s = stat.toJSON();
            return {
                _id: { year: parseInt(s.year), month: parseInt(s.month) },
                issues: parseInt(s.issues),
                returns: parseInt(s.returns),
                fines: parseFloat(s.fines || 0)
            };
        });

        res.json(result);
    } catch (error) {
        console.error('Monthly stats error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

module.exports = { getStats, getRecentActivity, getCategoryStats, getMonthlyStats };
