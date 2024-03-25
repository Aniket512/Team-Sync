import { getAccessToken } from '../configs/auth';

export const BASE_URL =
  process.env.BASE_URL || 'http://localhost:5000'

export const API_URL =
  process.env.API_URL || 'http://localhost:5000/api';

export function loginUrl() {
  return `${BASE_URL}/auth/login`;
}

export function getProjects() {
  return `${API_URL}/projects`;
}

export function getOrUpdateProject(projectId: string) {
  return `${API_URL}/projects/${projectId}`;
}

export function getTasks(projectId: string) {
  return `${API_URL}/projects/${projectId}/tasks`;
}

export function addTask() {
  return `${API_URL}/tasks`;
}

export function getOrUpdateTask(taskId: string) {
  return `${API_URL}/tasks/${taskId}`;
}

export function addTaskComment(taskId: string) {
  return `${API_URL}/tasks/${taskId}/comments`;
}

export function markNotificationRead(notificationId: string) {
  return `${API_URL}/notifications/${notificationId}`;
}

export function getNotifications() {
  return `${API_URL}/notifications`;
}

export function getInvitations() {
  return `${API_URL}/invitations`;
}

export function getSurveys(projectId: string) {
  return `${API_URL}/projects/${projectId}/surveys`;
}

export function getExcalidraws(projectId: string) {
  return `${API_URL}/projects/${projectId}/excalidraws`;
}

export function createSurvey() {
  return `${API_URL}/surveys`;
}

export function getOrUpdateSurvey(surveyId: string) {
  return `${API_URL}/surveys/${surveyId}`;
}

export function getOrSubmitSurveyAnswers(surveyId: string) {
  return `${API_URL}/surveys/${surveyId}/survey-answers`;
}

export function handleInvitation(invitationId: string) {
  return `${API_URL}/invitations/${invitationId}`;
}

export function sendMessage() {
  return `${API_URL}/messages/add-message`;
}

export function getMessagesRoute() {
  return `${API_URL}/messages`;
}

export function getHeaders() {
  return {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': '*',
    access_token: getAccessToken(),
  };
}

