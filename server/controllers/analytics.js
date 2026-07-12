const Task = require("../models/Task");
const Message = require("../models/Message");
const Survey = require("../models/Survey");
const SurveyAnswer = require("../models/SurveyAnswer");
const logger = require("../utils/logger");

const getProjectAnalytics = async (req, res) => {
  try {
    const { projectId } = req.params;

    if (!projectId) {
      return res.status(400).json({ message: "Project ID is required" });
    }

    // Fetch all tasks for the project
    const tasks = await Task.find({ projectId }).lean();

    // Task analytics
    const tasksByStatus = {};
    let completedTasks = 0;

    tasks.forEach((task) => {
      const status = task.status || "backlog";
      tasksByStatus[status] = (tasksByStatus[status] || 0) + 1;
      if (status === "done") completedTasks++;
    });

    // Fetch all messages for the project
    const messages = await Message.find({ projectId }).lean();

    // Message analytics
    const messagesByDay = {};
    messages.forEach((msg) => {
      if (msg.createdAt) {
        const day = new Date(msg.createdAt).toISOString().split("T")[0];
        messagesByDay[day] = (messagesByDay[day] || 0) + 1;
      }
    });

    // Find most active chat day
    const mostActiveDay = Object.entries(messagesByDay).sort(
      ([, a], [, b]) => b - a
    )[0]?.[0] || null;

    // Survey stats — open/closed, per-survey response counts + choice breakdown
    const surveys = await Survey.find({ projectId }).lean();
    const totalSurveys = surveys.length;
    const openSurveys = surveys.filter((s) => s.open).length;
    const closedSurveys = totalSurveys - openSurveys;

    const project = await require("../models/Project")
      .findById(projectId)
      .select("members")
      .lean();
    const totalMembers = project?.members?.length || 1;

    let totalSurveyAnswers = 0;
    const surveyBreakdown = [];

    for (const survey of surveys) {
      const answers = await SurveyAnswer.find({ surveyId: survey._id }).lean();
      totalSurveyAnswers += answers.length;

      // Unique respondents (one vote per user is typical)
      const uniqueRespondents = new Set(
        answers.map((a) => String(a.userId))
      ).size;

      // Votes per choice
      const choiceCounts = {};
      for (const choice of survey.choices || []) {
        choiceCounts[String(choice._id)] = {
          text: choice.text,
          count: 0,
        };
      }
      for (const answer of answers) {
        const key = String(answer.choiceId);
        if (!choiceCounts[key]) {
          choiceCounts[key] = { text: "Unknown", count: 0 };
        }
        choiceCounts[key].count += 1;
      }

      const choices = Object.values(choiceCounts);
      const participation =
        totalMembers > 0
          ? Math.min(Math.round((uniqueRespondents / totalMembers) * 100), 100)
          : 0;

      surveyBreakdown.push({
        _id: survey._id,
        title: survey.title,
        open: survey.open,
        responseCount: answers.length,
        uniqueRespondents,
        participation,
        choices,
        createdAt: survey.createdAt,
      });
    }

    // Newest surveys first for the overview list
    surveyBreakdown.sort(
      (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
    );

    // Overall reach: all answers / (surveys × members)
    const surveyParticipationRate =
      totalSurveys > 0
        ? Math.min(
            Math.round(
              (totalSurveyAnswers / (totalSurveys * totalMembers)) * 100
            ),
            100
          )
        : 0;

    const avgResponsesPerSurvey =
      totalSurveys > 0
        ? Math.round((totalSurveyAnswers / totalSurveys) * 10) / 10
        : 0;

    const openTasks = tasks.length - completedTasks;
    const completionRate =
      tasks.length > 0
        ? Math.round((completedTasks / tasks.length) * 100)
        : 0;

    return res.status(200).json({
      totalTasks: tasks.length,
      completedTasks,
      openTasks,
      completionRate,
      tasksByStatus,
      totalMessages: messages.length,
      messagesByDay,
      mostActiveDay,
      // Survey overview
      totalSurveys,
      openSurveys,
      closedSurveys,
      totalSurveyAnswers,
      avgResponsesPerSurvey,
      surveyParticipationRate,
      surveyBreakdown,
      totalMembers,
    });
  } catch (err) {
    logger.error("Failed to fetch project analytics", {
      message: err.message,
    });
    return res.status(500).json({
      code: "INTERNAL SERVER ERROR",
      error: err.message,
      message: "An error occurred while fetching project analytics.",
    });
  }
};

module.exports = {
  getProjectAnalytics,
};