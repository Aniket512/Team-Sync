const express = require("express");
const { getProjectAnalytics } = require("../controllers/analytics");
const analyticsRouter = express.Router();

analyticsRouter.get("/:projectId", getProjectAnalytics);

module.exports = {
  analyticsRouter,
};