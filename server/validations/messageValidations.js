const Joi = require("joi");

const objectId = Joi.string().pattern(/^[0-9a-fA-F]{24}$/);

const createMessageSchema = Joi.object({
  from: objectId.required(),
  message: Joi.string().required().max(2000),
  projectId: objectId.required(),
  mentionedUsers: Joi.array().items(objectId).optional(),
  linkedTask: objectId.allow(null).optional(),
  linkedTasks: Joi.array().items(objectId).optional(),
}).unknown(false);

module.exports = {
  createMessageSchema,
};
