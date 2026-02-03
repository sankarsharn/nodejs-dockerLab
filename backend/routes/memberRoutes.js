const express = require('express');
const router = express.Router();
const {
    getAllMembers,
    getMemberById,
    addMember,
    updateMember,
    deleteMember,
    getMemberHistory
} = require('../controllers/memberController');
const { protect, staffOnly, adminOnly } = require('../middleware/authMiddleware');

// All routes are protected and staff only (students can't manage members)
router.use(protect);
router.use(staffOnly);

router.get('/', getAllMembers);
router.get('/:id', getMemberById);
router.get('/:id/history', getMemberHistory);
router.post('/', addMember);
router.put('/:id', updateMember);
router.delete('/:id', adminOnly, deleteMember);

module.exports = router;
