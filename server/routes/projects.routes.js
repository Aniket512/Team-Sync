const express = require("express");
const {
  createProject,
  patchProject,
  getProjectDetails,
  getProjectTasks,
  getProjects,
  getProjectSurveys,
  getProjectExcalidraws,
} = require("../controllers/projects");
const projectRouter = express.Router();

projectRouter.get("/", getProjects);
projectRouter.post("/", createProject);
projectRouter.get("/:id", getProjectDetails);
projectRouter.patch("/:id", patchProject);
projectRouter.get("/:id/tasks", getProjectTasks);
projectRouter.get("/:id/surveys", getProjectSurveys);
projectRouter.get("/:id/excalidraws", getProjectExcalidraws);

module.exports = {
  projectRouter,
};
