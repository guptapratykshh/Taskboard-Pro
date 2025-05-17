const express = require('express');
const router = express.Router();
const { 
  getUserNotifications, 
  markAsRead, 
  markAllAsRead, 
  deleteNotification 
} = require('../controllers/notificationController');
const { authenticate } = require('../middlewares/auth');

// Apply authentication middleware to all routes
router.use(authenticate);

// Get all notifications for the current user
router.get('/', getUserNotifications);

// Mark notification as read
router.put('/:notificationId/read', markAsRead);

// Mark all notifications as read
router.put('/read-all', markAllAsRead);

// Delete a notification
router.delete('/:notificationId', deleteNotification);

module.exports = router; 