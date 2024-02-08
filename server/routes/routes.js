const express = require("express");
const { projectRouter } = require("./projects");
const { taskRouter } = require("./tasks");
const { invitationRouter } = require("./invitations");
const { notificationRouter } = require("./notifications");
const { surveyRouter } = require("./surveys");
const { excalidrawRouter } = require("./excalidraws");
const router = express.Router();

router.use("/projects", projectRouter);
router.use("/tasks", taskRouter);
router.use("/invitations", invitationRouter);
router.use("/notifications", notificationRouter);
router.use("/surveys", surveyRouter);
router.use("/excalidraws", excalidrawRouter);

module.exports = {
  router,
};
