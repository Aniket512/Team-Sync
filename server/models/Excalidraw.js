const mongoose = require("mongoose");

const excalidrawSchema = new mongoose.Schema({
  projectId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Project",
  },
  elements: Object,
});

module.exports = mongoose.model("Excalidraw", excalidrawSchema);
