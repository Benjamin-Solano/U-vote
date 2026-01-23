import { api } from "./axios";

export const usersApi = {
   list: () => api.get("/usuarios"),
   create: (payload) => api.post("/usuarios", payload),
   getById: (id) => api.get(`/usuarios/${id}`),
};
// Modificar privacidad m[as adelante...
