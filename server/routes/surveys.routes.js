const express = require("express");
const {
  createSurvey,
  fetchSurveyAnswers,
  getSurvey,
  submitSurveyAnswer,
  deleteSurvey,
  patchSurvey,
} = require("../controllers/surveys");
const surveyRouter = express.Router();

surveyRouter.post("/", createSurvey);
surveyRouter.get("/:surveyId", getSurvey);
surveyRouter.patch("/:surveyId", patchSurvey);
surveyRouter.get("/:surveyId/survey-answers", fetchSurveyAnswers);
surveyRouter.post("/:surveyId/survey-answers", submitSurveyAnswer);
surveyRouter.delete("/:surveyId", deleteSurvey);

module.exports = {
  surveyRouter,
};
