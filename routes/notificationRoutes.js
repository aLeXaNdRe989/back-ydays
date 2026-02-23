const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notificationController');
const { protect } = require('../middlewares/authMiddleware');

router.get('/', protect, notificationController.getMesNotifications);
router.patch('/lire-tout', protect, notificationController.markAllAsRead);
router.patch('/:id/lue', protect, notificationController.markAsRead);

module.exports = router;
