const Joi = require("joi");

const createSurveySchema = Joi.object({
  name: Joi.string().required().max(100),
  description: Joi.string().allow("").max(1000),
  questions: Joi.array()
    .items(
      Joi.object({
        question: Joi.string().required().max(500),
        type: Joi.string().valid("text", "radio", "checkbox", "rating"),
        options: Joi.array().items(Joi.string().max(100)),
      })
    )
    .required(),
  projectId: Joi.string().required().pattern(/^[0-9a-fA-F]{24}$/),
}).unknown(false);

const patchSurveySchema = Joi.object({
  name: Joi.string().max(100),
  description: Joi.string().allow("").max(1000),
  questions: Joi.array().items(
    Joi.object({
      question: Joi.string().required().max(500),
      type: Joi.string().valid("text", "radio", "checkbox", "rating"),
      options: Joi.array().items(Joi.string().max(100)),
    })
  ),
}).unknown(false);

const submitSurveyAnswerSchema = Joi.object({
  choiceId: Joi.string().required(),
}).unknown(false);

module.exports = {
  createSurveySchema,
  patchSurveySchema,
  submitSurveyAnswerSchema,
};
