const mongoose = require("mongoose");

const SurveyAnswerSchema = new mongoose.Schema({
  surveyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Survey",
    required: true,
  },
  choiceId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Survey.choices",
    required: true,
  },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
});

module.exports = mongoose.model("SurveyAnswer", SurveyAnswerSchema);
