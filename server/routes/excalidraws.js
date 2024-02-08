const express = require("express");
const { getExcalidraw } = require("../controllers/excalidraws");
const excalidrawRouter = express.Router();

excalidrawRouter.get("/", getExcalidraw);
// excalidrawRouter.post("/", sendInvitation);
// excalidrawRouter.patch("/:id", handleInvitation);

module.exports = {
  excalidrawRouter,
};
