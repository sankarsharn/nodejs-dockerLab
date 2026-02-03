const express = require('express');
const router = express.Router();
const {
    getAllBooks,
    getBookById,
    addBook,
    updateBook,
    deleteBook,
    getCategories
} = require('../controllers/bookController');
const { protect, staffOnly, adminOnly } = require('../middleware/authMiddleware');

// All routes are protected
router.use(protect);

// Everyone can view books
router.get('/categories', getCategories);
router.get('/', getAllBooks);
router.get('/:id', getBookById);

// Only staff (admin/librarian) can add/edit books
router.post('/', staffOnly, addBook);
router.put('/:id', staffOnly, updateBook);
router.delete('/:id', adminOnly, deleteBook);

module.exports = router;
