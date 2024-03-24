const express = require("express");
const { getExcalidraw } = require("../controllers/excalidraws");
const excalidrawRouter = express.Router();

excalidrawRouter.get("/", getExcalidraw);

module.exports = {
  excalidrawRouter,
};
