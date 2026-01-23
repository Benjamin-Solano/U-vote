import { api } from "./axios";

export const authApi = {
   login: (payload) => api.post("/auth/login", payload),
   register: (payload) => api.post("/usuarios", payload),

};
