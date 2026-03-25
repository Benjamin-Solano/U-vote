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

api.interceptors.response.use(
   (response) => response,
   (error) => {
      if (error.response?.status === 401) {
         localStorage.removeItem("token");
         localStorage.removeItem("usuario");
         if (!window.location.pathname.startsWith("/login")) {
            window.location.href = "/login";
         }
      }
      return Promise.reject(error);
   }
);