const express = require("express");
const {
  getNotifications,
  markNotificationRead,
} = require("../controllers/notifications");
const notificationRouter = express.Router();

notificationRouter.get("/", getNotifications);
notificationRouter.patch("/:notificationId", markNotificationRead);

module.exports = {
  notificationRouter,
};
