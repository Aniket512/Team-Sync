const Excalidraw = require("../models/Excalidraw");
const logger = require("../utils/logger");

const getExcalidraw = async (req, res) => {
  try {
    const excalidraw = await Excalidraw.findById(req.body.projectId);
    return res.status(200).json(excalidraw);
  } catch (err) {
    logger.error("Failed to fetch excalidraw", { message: err.message });
    return res.status(500).json({
      code: "INTERNAL SERVER ERROR",
      error: err.message,
      message: `An error occured while fetching the whiteboard.`,
    });
  }
};

module.exports = {
  getExcalidraw,
};
