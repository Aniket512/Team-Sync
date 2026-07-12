const Joi = require("joi");

const createProjectSchema = Joi.object({
  name: Joi.string().required().max(100).messages({
    "string.max": "Project name must be less than 100 characters",
  }),
  description: Joi.string().allow("").max(500),
  projectType: Joi.string().allow("").max(50),
}).unknown(false);

const patchProjectSchema = Joi.object({
  name: Joi.string().max(100),
  description: Joi.string().allow("").max(500),
  projectType: Joi.string().allow("").max(50),
  isActive: Joi.boolean(),
}).unknown(false);

module.exports = {
  createProjectSchema,
  patchProjectSchema,
};
