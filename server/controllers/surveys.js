const Notification = require("../models/Notification");
const Project = require("../models/Project");
const Survey = require("../models/Survey");
const SurveyAnswer = require("../models/SurveyAnswer");

const getSurvey = async (req, res) => {
  try {
    const survey = await Survey.findById(req.params.surveyId);
    return res.status(200).json(survey);
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      code: "INTERNAL SERVER ERROR",
      error: err.message,
      message: `An error occured while fetching the survey.`,
    });
  }
};

const createSurvey = async (req, res) => {
  try {
    const { title, description, projectId, choices } = req.body;

    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({
        code: "NOT_FOUND",
        error: "Project not found",
        message: "The specified project does not exist.",
      });
    }

    const newSurvey = new Survey({
      title,
      description,
      projectId,
      createdBy: req.user._id,
      choices,
    });
    const savedSurvey = await newSurvey.save();

    const projectMembers = project.members.filter(
      (member) => member.user.toString() !== req.user._id.toString()
    );

    const notifications = projectMembers.map((member) => {
      return new Notification({
        userId: member.user,
        title: `A new survey "${title}" has been created in the project "${project.name}"`,
        contentId: savedSurvey._id,
        type: "survey",
        projectId,
      });
    });

    await Notification.insertMany(notifications);
    return res.status(201).json(savedSurvey);
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      code: "INTERNAL SERVER ERROR",
      error: err.message,
      message: `An error occured while creating the survey.`,
    });
  }
};

const patchSurvey = async (req, res) => {
  try {
    const survey = await Survey.findById(req.params.surveyId);

    if (!survey) {
      return res.status(404).json({ message: "Survey not found" });
    }

    survey.open = false;
    const updatedSurvey = await survey.save();

    const projectId = survey.projectId;
    const project = await Project.findById(projectId);

    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    const projectMembers = project.members.filter(
      (member) => String(member.user) !== String(req.user._id)
    );

    projectMembers.forEach(async (member) => {
      const notification = new Notification({
        userId: member.user,
        type: "survey",
        contentId: survey._id,
        title: `Survey "${survey.title}" has just been closed. See the results`,
        projectId,
      });

      await notification.save();
    });
    return res.status(200).json(updatedSurvey);
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      code: "INTERNAL SERVER ERROR",
      error: err.message,
      message: `An error occured while closing the survey.`,
    });
  }
};

const fetchSurveyAnswers = async (req, res) => {
  try {
    const answers = await SurveyAnswer.find({
      surveyId: req.params.surveyId,
    });
    res.status(200).json(answers);
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      code: "INTERNAL SERVER ERROR",
      error: err.message,
      message: `An error occured while fetching the answers.`,
    });
  }
};

const submitSurveyAnswer = async (req, res) => {
  try {
    const { choiceId } = req.body;
    const survey = await Survey.findById(req.params.surveyId);
    if (!survey) {
      return res.status(404).json({ error: "Survey not found" });
    }

    let answer = await SurveyAnswer.findOne({
      surveyId: req.params.surveyId,
      userId: req.user._id,
    });

    if (answer) {
      answer.choiceId = choiceId;
    } else {
      answer = new SurveyAnswer({
        surveyId: req.params.surveyId,
        userId: req.user._id,
        choiceId,
      });
    }

    const validChoice = survey.choices.some((c) => c.id === choiceId);

    if (!validChoice) {
      return res.status(400).json({ error: "Invalid choice selected" });
    }

    await answer.save();
    res.status(201).json(answer);
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      code: "INTERNAL SERVER ERROR",
      error: err.message,
      message: `An error occured while saving the response.`,
    });
  }
};

const deleteSurvey = async (req, res) => {
  try {
    const survey = await Survey.findById(req.params.surveyId);

    if (!survey) {
      return res.status(202).json({
        data: null,
      });
    }

    await survey.deleteOne();
    res.status(202).json({
      data: null,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      code: "INTERNAL SERVER ERROR",
      error: err.message,
      message: `An error occured while deleting the survey.`,
    });
  }
};

module.exports = {
  getSurvey,
  createSurvey,
  patchSurvey,
  fetchSurveyAnswers,
  submitSurveyAnswer,
  deleteSurvey,
};
