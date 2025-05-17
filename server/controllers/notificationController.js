const Notification = require('../models/Notification');

// Get all notifications for the current user
const getUserNotifications = async (req, res) => {
  try {
    const userId = req.user._id;
    
    // Get all notifications for the user
    const notifications = await Notification.find({ recipient: userId })
      .populate('sender', 'name email profilePicture')
      .populate('project', 'title')
      .populate('task', 'title')
      .sort({ createdAt: -1 })
      .limit(50);
    
    res.json(notifications);
  } catch (error) {
    console.error('Get user notifications error:', error.message);
    res.status(500).json({ error: 'Server error' });
  }
};

// Mark notification as read
const markAsRead = async (req, res) => {
  try {
    const { notificationId } = req.params;
    const userId = req.user._id;
    
    // Find notification and check if user is the recipient
    const notification = await Notification.findOne({
      _id: notificationId,
      recipient: userId
    });
    
    if (!notification) {
      return res.status(404).json({ error: 'Notification not found or unauthorized' });
    }
    
    // Mark as read
    notification.read = true;
    await notification.save();
    
    res.json(notification);
  } catch (error) {
    console.error('Mark notification as read error:', error.message);
    res.status(500).json({ error: 'Server error' });
  }
};

// Mark all notifications as read
const markAllAsRead = async (req, res) => {
  try {
    const userId = req.user._id;
    
    // Update all unread notifications for the user
    const result = await Notification.updateMany(
      { recipient: userId, read: false },
      { $set: { read: true } }
    );
    
    res.json({ message: 'All notifications marked as read', count: result.modifiedCount });
  } catch (error) {
    console.error('Mark all notifications as read error:', error.message);
    res.status(500).json({ error: 'Server error' });
  }
};

// Delete a notification
const deleteNotification = async (req, res) => {
  try {
    const { notificationId } = req.params;
    const userId = req.user._id;
    
    // Find notification and check if user is the recipient
    const notification = await Notification.findOne({
      _id: notificationId,
      recipient: userId
    });
    
    if (!notification) {
      return res.status(404).json({ error: 'Notification not found or unauthorized' });
    }
    
    await Notification.findByIdAndDelete(notificationId);
    
    res.json({ message: 'Notification deleted successfully' });
  } catch (error) {
    console.error('Delete notification error:', error.message);
    res.status(500).json({ error: 'Server error' });
  }
};

// Create a notification (internal use only)
const createNotification = async (data) => {
  try {
    const notification = new Notification(data);
    await notification.save();
    return notification;
  } catch (error) {
    console.error('Create notification error:', error.message);
    return null;
  }
};

module.exports = {
  getUserNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  createNotification
}; 