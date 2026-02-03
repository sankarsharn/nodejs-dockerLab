const express = require('express');
const router = express.Router();
const {
    issueBook,
    returnBook,
    getAllTransactions,
    getOverdueBooks,
    payFine,
    getMyTransactions
} = require('../controllers/transactionController');
const { protect, staffOnly } = require('../middleware/authMiddleware');

// All routes are protected
router.use(protect);

// Student can view their own transactions
router.get('/my', getMyTransactions);

// Staff can view all transactions
router.get('/', staffOnly, getAllTransactions);
router.get('/overdue', staffOnly, getOverdueBooks);

// Only staff can issue/return books
router.post('/issue', staffOnly, issueBook);
router.post('/return/:id', staffOnly, returnBook);
router.put('/:id/pay-fine', staffOnly, payFine);

module.exports = router;
