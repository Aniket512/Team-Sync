const express = require('express');
const {
  createTask,
  patchTask,
  deleteTask,
  getTask,
  addTaskComment,
} = require('../controllers/tasks');
const { validateRequest } = require('../middlewares/validateRequest');
const {
  createTaskSchema,
  patchTaskSchema,
  addTaskCommentSchema,
} = require('../validations');
const taskRouter = express.Router();

taskRouter.post('/', validateRequest(createTaskSchema), createTask);
taskRouter.patch('/:id', validateRequest(patchTaskSchema), patchTask);
taskRouter.delete('/:id', deleteTask);
taskRouter.post('/:id/comments', validateRequest(addTaskCommentSchema), addTaskComment);
taskRouter.get('/:id', getTask);

module.exports = {
  taskRouter,
};