const Joi = require("joi");

const createTaskSchema = Joi.object({
  name: Joi.string().required().max(100),
  description: Joi.string().allow("").max(1000),
  deadline: Joi.date().iso(),
  projectId: Joi.string().required().pattern(/^[0-9a-fA-F]{24}$/),
}).unknown(false);

const patchTaskSchema = Joi.object({
  description: Joi.string().allow("").max(1000),
  status: Joi.string().valid("to-do", "in-progress", "completed", "on-hold"),
  deadline: Joi.date().iso(),
  assignees: Joi.array().items(
    Joi.string().pattern(/^[0-9a-fA-F]{24}$/)
  ),
}).unknown(false);

const addTaskCommentSchema = Joi.object({
  comment: Joi.string().required().max(500),
}).unknown(false);

module.exports = {
  createTaskSchema,
  patchTaskSchema,
  addTaskCommentSchema,
};
