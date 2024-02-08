const Excalidraw = require("../models/Excalidraw");
const Invitation = require("../models/Invitation");
const Project = require("../models/Project");
const Survey = require("../models/Survey");
const Task = require("../models/Task");

const getProjects = async (req, res) => {
  try {
    const projects = await Project.find({
      "members.user": req.user._id,
    }).select("name description isActive");
    return res.status(200).json(projects);
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      code: "INTERNAL SERVER ERROR",
      error: err.message,
      message: `An error occured while fetching the projects.`,
    });
  }
};

const createProject = async (req, res) => {
  try {
    const { name, description, projectType } = req.body;
    const newProject = new Project({
      name,
      description,
      projectType,
      createdBy: req.user._id,
      members: [
        {
          user: req.user._id,
          isAdmin: true,
        },
      ],
    });
    const savedProject = await newProject.save();
    res.status(201).json(savedProject);
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      code: "INTERNAL SERVER ERROR",
      message: `An error occured while creating the project. ${err.message}`,
    });
  }
};

const patchProject = async (req, res) => {
  try {
    const updateData = req.body;
    const project = await Project.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
    });

    if (!project) {
      return res.status(404).json({
        code: "NOT FOUND",
        message: "Project not found.",
      });
    }

    await project.save();

    res.status(200).json(project);
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      code: "INTERNAL SERVER ERROR",
      message: `An error occured while updating the project. ${err.message}`,
    });
  }
};

const getProjectDetails = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id).populate(
      "members.user"
    );

    if (project === null) {
      return res.status(404).json({
        message: "Project not found.",
      });
    }

    const invitationsCount = await Invitation.find({
      projectId: req.params.id,
      status: "pending",
    }).countDocuments();

    const response = {
      ...project.toObject(),
      pendingInvites: invitationsCount,
    };
    res.status(200).json(response);
  } catch (err) {
    return res.status(500).send({
      success: false,
      error: err.message,
      message: "An error occured while fetching the project details.",
    });
  }
};
const deleteProject = async (req, res) => {};

const getProjectTasks = async (req, res) => {
  try {
    const tasks = await Task.find({
      projectId: req.params.id,
    });

    res.status(200).json(tasks);
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      code: "INTERNAL SERVER ERROR",
      message: `An error occured while fetching the tasks. ${err.message}`,
    });
  }
};

const getProjectSurveys = async (req, res) => {
  try {
    const surveys = await Survey.find({
      projectId: req.params.id,
    });
    return res.status(200).json(surveys);
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      code: "INTERNAL SERVER ERROR",
      error: err.message,
      message: `An error occured while fetching the surveys.`,
    });
  }
};

const getProjectExcalidraws = async (req, res) => {
  try {
    const excalidraw = await Excalidraw.findOne({projectId: req.params.id});
    return res.status(200).json(excalidraw);
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      code: "INTERNAL SERVER ERROR",
      error: err.message,
      message: `An error occured while fetching the whiteboard.`,
    });
  }
};

module.exports = {
  getProjects,
  createProject,
  patchProject,
  deleteProject,
  getProjectTasks,
  getProjectDetails,
  getProjectSurveys,
  getProjectExcalidraws,
};
