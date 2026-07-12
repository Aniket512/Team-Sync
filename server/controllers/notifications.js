const Notification = require("../models/Notification");
const logger = require("../utils/logger");

const getNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({
      userId: req.user._id,
      read: false,
    }).sort({ createdAt: -1 });
    return res.status(200).send(notifications);
  } catch (err) {
    logger.error("Failed to fetch notifications", { message: err.message });
    return res.status(500).send({
      success: false,
      error: err.message,
      message: "An error occured while fetching the notifications",
    });
  }
};

const markNotificationRead = async (req, res) => {
  try {
    const { notificationId } = req.params;

    const notification = await Notification.findById(notificationId);

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: "Notification not found",
      });
    }

    notification.read = true;
    await notification.save();

    return res.status(200).json({
      success: true,
      message: "Notification marked as read",
    });
  } catch (error) {
    logger.error("Failed to mark notification as read", { message: error.message });
    return res.status(500).json({
      success: false,
      error: error.message,
      message: "An error occurred while marking the notification as read",
    });
  }
};

module.exports = {
  getNotifications,
  markNotificationRead,
};
