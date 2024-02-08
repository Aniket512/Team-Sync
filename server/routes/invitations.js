const express = require("express");
const {
  sendInvitation,
  getInvitations,
  handleInvitation,
} = require("../controllers/invitations");
const invitationRouter = express.Router();

invitationRouter.get("/", getInvitations);
invitationRouter.post("/", sendInvitation);
invitationRouter.patch("/:id", handleInvitation);

module.exports = {
  invitationRouter,
};
