import { api } from "./axios";

export const authApi = {
   login: (payload) => api.post("/auth/login", payload),
   logout: () => api.post("/auth/logout"),
   verifyCode: (payload) => api.post("/auth/verify-code", payload),
   resendCode: (payload) => api.post("/auth/resend-code", payload),
};
