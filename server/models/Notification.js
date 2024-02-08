const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema(
  {
    projectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Project",
    },
    contentId: {
      type: String // ref to the content (i.e. postId, surveyId)
    },
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
    },
    type: {
      type: String,
      enum: [
        "team_invitation",
        "info",
        "task_assignment",
        "announcements",
        "survey"
      ],
      required: true,
    },
    read: {
      type: Boolean,
      default: false
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Notification", notificationSchema);
