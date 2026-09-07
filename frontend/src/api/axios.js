// This file creates one Axios instance that all our pages can reuse.
// It automatically points to our backend server.

import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:5000/api",
});

// This automatically attaches the JWT token (if we have one saved)
// to every request, so we don't have to do it manually every time.
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
