const mongoose = require("mongoose");

const MessageSchema = mongoose.Schema(
  {
    message: {
      type: String,
      required: true
    },
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    projectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Project",
      required: true,
    },
    segments: [{
      type: {
        type: String,
        enum: ["text", "mention", "task"],
        required: true,
      },
      value: { type: String, default: "" },
      userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
      taskId: { type: mongoose.Schema.Types.ObjectId, ref: "Task", default: null },
    }],
  },
  {
    timestamps: true,
  }
);

// Speeds up paginated chat queries: filter by project, sort/cursor by createdAt
MessageSchema.index({ projectId: 1, createdAt: -1 });

module.exports = mongoose.model("Message", MessageSchema);
