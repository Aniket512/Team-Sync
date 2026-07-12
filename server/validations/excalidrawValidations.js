const Joi = require("joi");

const createExcalidrawSchema = Joi.object({
  projectId: Joi.string().required().pattern(/^[0-9a-fA-F]{24}$/),
  name: Joi.string().required().max(100),
}).unknown(false);

const saveExcalidrawSchema = Joi.object({
  elements: Joi.array().required(),
  appState: Joi.object(),
  files: Joi.object(),
}).unknown(false);

module.exports = {
  createExcalidrawSchema,
  saveExcalidrawSchema,
};
