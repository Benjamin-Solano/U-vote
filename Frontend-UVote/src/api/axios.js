import axios from "axios";

export const api = axios.create({
   baseURL: import.meta.env.VITE_API_URL, // http://localhost:8080/api
   timeout: 15000, // 15s
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
