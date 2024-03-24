const express = require("express");
const { projectRouter } = require("./projects.routes");
const { taskRouter } = require("./tasks.routes");
const { invitationRouter } = require("./invitations.routes");
const { notificationRouter } = require("./notifications.routes");
const { surveyRouter } = require("./surveys.routes");
const { excalidrawRouter } = require("./excalidraws.routes");
const { messageRouter } = require("./messages.routes");
const router = express.Router();

router.use("/projects", projectRouter);
router.use("/tasks", taskRouter);
router.use("/invitations", invitationRouter);
router.use("/notifications", notificationRouter);
router.use("/surveys", surveyRouter);
router.use("/excalidraws", excalidrawRouter);
router.use("/messages", messageRouter);

module.exports = {
  router,
};
