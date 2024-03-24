const express = require('express');
const {
  createTask,
  patchTask,
  deleteTask,
  getTask,
  addTaskComment,
} = require('../controllers/tasks');
const taskRouter = express.Router();

taskRouter.post('/', createTask);
taskRouter.patch('/:id', patchTask);
taskRouter.delete('/:id', deleteTask);
taskRouter.post('/:id/comments', addTaskComment);
taskRouter.get('/:id', getTask);

module.exports = {
  taskRouter,
};