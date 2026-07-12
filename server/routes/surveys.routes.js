const express = require("express");
const {
  createSurvey,
  fetchSurveyAnswers,
  getSurvey,
  submitSurveyAnswer,
  deleteSurvey,
  patchSurvey,
} = require("../controllers/surveys");
const { validateRequest } = require("../middlewares/validateRequest");
const {
  createSurveySchema,
  patchSurveySchema,
  submitSurveyAnswerSchema,
} = require("../validations");
const surveyRouter = express.Router();

surveyRouter.post("/", validateRequest(createSurveySchema), createSurvey);
surveyRouter.get("/:surveyId", getSurvey);
surveyRouter.patch("/:surveyId", validateRequest(patchSurveySchema), patchSurvey);
surveyRouter.get("/:surveyId/survey-answers", fetchSurveyAnswers);
surveyRouter.post("/:surveyId/survey-answers", validateRequest(submitSurveyAnswerSchema), submitSurveyAnswer);
surveyRouter.delete("/:surveyId", deleteSurvey);

module.exports = {
  surveyRouter,
};
