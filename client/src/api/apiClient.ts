import axios from "axios";
import { getAccessToken, isUserLoggedIn, setUserLoggedOut } from "../configs/auth";

const BASE_API_URL =
  process.env.API_URL || "https://team-sync-api.vercel.app/api";

const handleUnauthorizedError = (error: any) => {
  if (error?.response?.status === 401) {
    if (isUserLoggedIn()) {
      setUserLoggedOut();
    }
    window.location.href = "/login";
  }
  return Promise.reject(error);
};

const addAuthHeader = (config: any) => {
  const token = getAccessToken();

  if (token) {
    config.headers = {
      ...config.headers,
      Authorization: `Bearer ${token}`,
    };
  }

  return config;
};

const apiClient = axios.create({
  baseURL: BASE_API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

apiClient.interceptors.request.use(addAuthHeader, (error) => Promise.reject(error));
apiClient.interceptors.response.use((response) => response, handleUnauthorizedError);

axios.interceptors.request.use(addAuthHeader, (error) => Promise.reject(error));
axios.interceptors.response.use((response) => response, handleUnauthorizedError);

export default apiClient;
