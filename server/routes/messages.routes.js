const express = require("express");
const { getMessages, addMessage } = require("../controllers/messages");
const { validateRequest } = require("../middlewares/validateRequest");
const { createMessageSchema } = require("../validations");
const messageRouter = express.Router();

messageRouter.post("/", getMessages);
messageRouter.post("/add-message", validateRequest(createMessageSchema), addMessage);

module.exports = {
  messageRouter,
};
