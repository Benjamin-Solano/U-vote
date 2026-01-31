import { api } from "./axios";

export const authApi = {
   login: (payload) => api.post("/auth/login", payload),

   // ✅ Status OTP
   status: (correo) => api.get("/auth/status", { params: { correo } }),

   // ✅ Verificar OTP
   verifyCode: (payload) => api.post("/auth/verify-code", payload),

   // ✅ Reenviar OTP
   resendCode: (payload) => api.post("/auth/resend-code", payload),
};
