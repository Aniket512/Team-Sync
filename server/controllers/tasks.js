const Notification = require("../models/Notification");
const Task = require("../models/Task");

const createTask = async (req, res) => {
  try {
    const { name, description, deadline, projectId } = req.body;

    if (!projectId) {
      return res.status(403).json({
        message: "Project id is required.",
      });
    }

    const newTask = new Task({
      name,
      description,
      deadline,
      projectId,
      createdBy: req.user._id,
    });
    const task = await newTask.save();
    res.status(201).json(task);
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      code: "INTERNAL SERVER ERROR",
      message: `An error occured while creating the task. ${err.message}`,
    });
  }
};

const patchTask = async (req, res) => {
  try {
    const { description, status, deadline, assignees } = req.body;

    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    if (description) task.description = description;
    if (status) task.status = status;
    if (deadline) task.deadline = deadline;
    if (assignees) task.assignees = assignees;

    const updatedTask = await task.save();

    let newNotification = {};
    if (assignees) {
      for (const userId of assignees) {
        const existingNotification = await Notification.findOne({
          projectId: task.projectId,
          userId,
          contentId: task._id,
          read: false,
          type: "task_assignment",
        });

        if (!existingNotification) {
          const notification = new Notification({
            projectId: task.projectId,
            userId,
            contentId: task._id,
            title: `You have been assigned a new task "${task.name}"`,
            type: "task_assignment",
          });
          await notification.save();
          newNotification = notification;
        }
      }
    }
    await updatedTask.populate("assignees comments.user");
    return res.status(200).json({ task: updatedTask, notification: newNotification });
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      code: "INTERNAL SERVER ERROR",
      error: err.message,
      message: `An error occured while updating the task.`,
    });
  }
};

const deleteTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(202).json({
        data: null,
      });
    }

    await task.remove();
    res.status(202).json({
      data: null,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      code: "INTERNAL SERVER ERROR",
      message: `An error occured while deleting the task. ${err.message}`,
    });
  }
};

const addTaskComment = async (req, res) => {
  try {
    const { comment } = req.body;

    const task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    task.comments.push({
      text: comment,
      user: req.user._id,
    });

    const updatedTask = await task.save();
    await updatedTask.populate("comments.user");
    return res.status(200).json({ task: updatedTask });
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      code: "INTERNAL SERVER ERROR",
      message: `An error occured while adding the comment. ${err.message}`,
    });
  }
};

const getTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id).populate(
      "comments.user assignees"
    );

    if (task === null) {
      return res.status(404).json({
        message: "Task not found.",
      });
    }

    res.status(200).json(task);
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      error: err.message,
      message: `An error occured while adding the comment.`,
    });
  }
};

module.exports = {
  createTask,
  patchTask,
  deleteTask,
  getTask,
  addTaskComment,
};
