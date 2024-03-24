import React from "react";
import { Navigate, createBrowserRouter } from "react-router-dom";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Projects from "./pages/Projects";
import { DashboardLayout } from "./pages/DashboardLayout";
import Invitations from "./pages/Invitations";
import Dashboard from "./components/Dashboard/Dashboard";
import Tasks from "./pages/Tasks";
import Settings from "./pages/Settings";
import Survey from "./pages/Survey";
import { DetailedSurvey } from "./pages/DetailedSurvey";
import { DetailedTask } from "./pages/DetailedTask";
import Collab from "./pages/Collab";
import Chat from "./pages/Chat";

export const router = createBrowserRouter([
  {
    path: "",
    element: <Home />,
  },
  {
    path: "login",
    element: <Login />,
  },
  {
    path: "projects",
    element: <Projects />,
  },
  {
    path: "invitations",
    element: <Invitations />,
  },
  {
    path: "projects/:projectId",
    element: <DashboardLayout />,
    children: [
      {
        path: "",
        element: <Navigate to="/dashboard" replace />,
      },
      {
        path: "dashboard",
        element: <Dashboard />,
      },
      {
        path: "chat",
        element: <Chat />,
      },
      {
        path: "collab",
        element: <Collab />,
      },
      {
        path: "tasks",
        element: <Tasks />,
      },
      {
        path: "tasks/:taskId",
        element: <DetailedTask />,
      },
      {
        path: "surveys",
        element: <Survey />,
      },
      {
        path: "surveys/:surveyId",
        element: <DetailedSurvey />,
      },
      {
        path: "settings",
        element: <Settings />,
      },
    ],
  },
]);
