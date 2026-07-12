/**
 * Centralized validation schemas export
 * Import schemas from here: const { createProjectSchema } = require("../validations");
 */

const {
  createProjectSchema,
  patchProjectSchema,
} = require("./projectValidations");

const {
  createTaskSchema,
  patchTaskSchema,
  addTaskCommentSchema,
} = require("./taskValidations");

const {
  createSurveySchema,
  patchSurveySchema,
  submitSurveyAnswerSchema,
} = require("./surveyValidations");

const { createInvitationSchema } = require("./invitationValidations");

const { createMessageSchema } = require("./messageValidations");

const {
  createExcalidrawSchema,
  saveExcalidrawSchema,
} = require("./excalidrawValidations");

module.exports = {
  // Projects
  createProjectSchema,
  patchProjectSchema,
  // Tasks
  createTaskSchema,
  patchTaskSchema,
  addTaskCommentSchema,
  // Surveys
  createSurveySchema,
  patchSurveySchema,
  submitSurveyAnswerSchema,
  // Invitations
  createInvitationSchema,
  // Messages
  createMessageSchema,
  // Excalidraws
  createExcalidrawSchema,
  saveExcalidrawSchema,
};
