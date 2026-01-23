import { api } from "./axios";

export const usersApi = {
   create: (payload) => api.post("/usuarios", payload),
   list: () => api.get("/usuarios"),
   getById: (id) => api.get(`/usuarios/${id}`),
};
