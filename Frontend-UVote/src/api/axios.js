import axios from "axios";

const baseURL = import.meta.env.VITE_API_URL;

export const api = axios.create({
   baseURL,
   timeout: 15000,
   headers: {
      "Content-Type": "application/json",
   },
});

api.interceptors.request.use(
   (config) => {
      const token = localStorage.getItem("token");

      config.headers = config.headers ?? {};

      if (token) {
         config.headers.Authorization = `Bearer ${token}`;
      }

      return config;
   },
   (error) => Promise.reject(error)
);