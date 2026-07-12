const Joi = require("joi");

const createInvitationSchema = Joi.object({
  email: Joi.string().email().required(),
  projectId: Joi.string().required().pattern(/^[0-9a-fA-F]{24}$/),
  role: Joi.string().valid("admin", "member").default("member"),
}).unknown(false);

module.exports = {
  createInvitationSchema,
};
