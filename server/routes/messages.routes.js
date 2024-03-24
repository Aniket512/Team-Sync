const express = require("express");
const { getMessages, addMessage } = require("../controllers/messages");
const messageRouter = express.Router();

messageRouter.post("/", getMessages);
messageRouter.post("/add-message", addMessage);

module.exports = {
  messageRouter,
};
