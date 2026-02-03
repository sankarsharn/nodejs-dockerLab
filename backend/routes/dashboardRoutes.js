const express = require('express');
const router = express.Router();
const {
    getStats,
    getRecentActivity,
    getCategoryStats,
    getMonthlyStats
} = require('../controllers/dashboardController');
const { protect } = require('../middleware/authMiddleware');

// All routes are protected
router.use(protect);

router.get('/stats', getStats);
router.get('/recent', getRecentActivity);
router.get('/categories', getCategoryStats);
router.get('/monthly', getMonthlyStats);

module.exports = router;
