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
const { validateRequest } = require("../middlewares/validateRequest");
const {
  createProjectSchema,
  patchProjectSchema,
} = require("../validations");
const projectRouter = express.Router();

projectRouter.get("/", getProjects);
projectRouter.post("/", validateRequest(createProjectSchema), createProject);
projectRouter.get("/:id", getProjectDetails);
projectRouter.patch("/:id", validateRequest(patchProjectSchema), patchProject);
projectRouter.get("/:id/tasks", getProjectTasks);
projectRouter.get("/:id/surveys", getProjectSurveys);
projectRouter.get("/:id/excalidraws", getProjectExcalidraws);

module.exports = {
  projectRouter,
};
