const Invitation = require("../models/Invitation");
const Notification = require("../models/Notification");
const Project = require("../models/Project");
const User = require("../models/User");
const { sendNotification } = require("../utils/sendNotification");

const getInvitations = async (req, res) => {
  try {
    const invitations = await Invitation.find({
      userId: req.user._id,
      status: "pending",
    }).populate({
      path: "projectId",
      select: "name",
    });
    return res.status(200).send(invitations);
  } catch (err) {
    console.error(err);
    return res.status(500).send({
      success: false,
      error: err.message,
      message: "An error occured while fetching the invitations",
    });
  }
};

const sendInvitation = async (req, res) => {
  try {
    const { projectId, email } = req.body;
    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).send({
        success: false,
        message: "Project not found with the provided ID",
      });
    }

    const recipientUser = await User.findOne({ email });
    if (!recipientUser) {
      return res.status(404).send({
        success: false,
        message: "User not found with the provided email",
      });
    }

    const existingInvitation = await Invitation.findOne({
      projectId: projectId,
      userId: recipientUser,
      status: { $in: ["pending", "accepted"] },
    });

    if (existingInvitation) {
      return res.status(400).send({
        success: false,
        message: "Invitation already sent or accepted for the user and project",
      });
    }

    const invitation = new Invitation({
      projectId: projectId,
      userId: recipientUser,
    });

    const savedInvitation = await invitation.save();

    const notification = new Notification({
      projectId: projectId,
      userId: recipientUser._id,
      title: `You have received an invitation for project ${project.name}`,
      type: "team_invitation",
    });

    await notification.save();
    sendNotification(notification);
    return res.status(200).send(savedInvitation);
  } catch (err) {
    console.error(err);
    return res.status(500).send({
      success: false,
      error: err.message,
      message: "An error occured while sending invitation",
    });
  }
};

const handleInvitation = async (req, res) => {
  try {
    const { decision } = req.body;

    const invitation = await Invitation.findById(req.params.id).populate(
      "projectId"
    );
    if (!invitation) {
      return res
        .status(404)
        .json({ success: false, message: "Invitation not found" });
    }

    const project = invitation.projectId;
    if (decision === "accept") {
      invitation.status = "accepted";

      if (!project) {
        return res
          .status(404)
          .json({ success: false, message: "Project not found" });
      }

      project.members.push({
        user: req.user._id,
        isAdmin: false,
      });
      await project.save();
    } else if (decision === "reject") {
      invitation.status = "rejected";
    } else {
      return res
        .status(400)
        .json({ success: false, message: "Invalid decision" });
    }
    await invitation.save();

    const user = await User.findById(req.user._id);

    const notification = new Notification({
      userId: project.createdBy,
      title: `Your invitation for project ${project.name} has been ${decision}ed by ${user.name}`,
      type: "info",
    });

    await notification.save();
    sendNotification(notification);
    return res.status(200).json({
      success: true,
      message: `Invitation ${decision}ed successfully`,
    });
  } catch (err) {
    console.error(err);
    return res
      .status(500)
      .json({ success: false, message: "Error handling invitation" });
  }
};

module.exports = {
  getInvitations,
  sendInvitation,
  handleInvitation,
};
