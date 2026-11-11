import axios, { isAxiosError } from "axios";

const api = axios.create({ baseURL: "/api" });
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("smartlearning-token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export function getApiErrorMessage(error: unknown, fallback: string): string {
  if (isAxiosError<{ error?: string }>(error) && error.response?.data.error) {
    return error.response.data.error;
  }
  return fallback;
}

export default api;
