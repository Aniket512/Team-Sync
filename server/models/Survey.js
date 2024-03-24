const mongoose = require("mongoose");

const SurveySchema = new mongoose.Schema(
  {
    projectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Project",
      required: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    description: {
      type: String,
      default: null,
    },
    open: {
      type: Boolean,
      required: true,
      default: true
    },
    title: {
      type: String,
      required: true,
    },
    choices: [
      {
        text: { type: String, required: true },
      },
    ],
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Survey", SurveySchema);
