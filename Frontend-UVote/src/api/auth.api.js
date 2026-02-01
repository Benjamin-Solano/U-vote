import { api } from "./axios";

export const authApi = {
   login: (payload) => api.post("/auth/login", payload),


   status: (correo) => api.get("/auth/status", { params: { correo } }),


   verifyCode: (payload) => api.post("/auth/verify-code", payload),


   resendCode: (payload) => api.post("/auth/resend-code", payload),
};
