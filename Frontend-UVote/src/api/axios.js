import axios from "axios";

export const api = axios.create({
   baseURL: import.meta.env.VITE_API_URL, // ✅ debe ser http://localhost:8080/api
   headers: { "Content-Type": "application/json" },
});

// (Opcional) Si usas token en AuthProvider, puedes meter interceptor aquí:
api.interceptors.request.use((config) => {
   const token = localStorage.getItem("token");
   if (token) config.headers.Authorization = `Bearer ${token}`;
   return config;
});
