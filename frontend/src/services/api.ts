import axios, { type AxiosRequestHeaders } from "axios";

const baseURL = (import.meta.env["VITE_API_URL"] as string) || "/api";

const api = axios.create({
  baseURL,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  const headers = config.headers as AxiosRequestHeaders | undefined;

  if (token) {
    config.headers = {
      ...headers,
      Authorization: `Bearer ${token}`,
    } as AxiosRequestHeaders;
  }

  if (config.data instanceof FormData) {
    if (config.headers) {
      delete (config.headers as AxiosRequestHeaders)["Content-Type"];
    }
  } else {
    config.headers = {
      ...(config.headers as AxiosRequestHeaders),
      "Content-Type": "application/json",
    } as AxiosRequestHeaders;
  }

  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export default api;
