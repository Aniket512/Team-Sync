const express = require("express");
const {
  sendInvitation,
  getInvitations,
  handleInvitation,
} = require("../controllers/invitations");
const { validateRequest } = require("../middlewares/validateRequest");
const { createInvitationSchema } = require("../validations");
const invitationRouter = express.Router();

invitationRouter.get("/", getInvitations);
invitationRouter.post("/", validateRequest(createInvitationSchema), sendInvitation);
invitationRouter.patch("/:id", handleInvitation);

module.exports = {
  invitationRouter,
};
