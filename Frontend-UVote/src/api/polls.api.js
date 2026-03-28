import { api } from "./axios";

export const pollsApi = {
   // Público
   list: (params = {}) => api.get("/encuestas", { params }),
   getById: (id) => api.get(`/encuestas/${id}`),

   // Requiere JWT
   create: (payload) => api.post("/encuestas", payload),
   close: (id) => api.post(`/encuestas/${id}/cerrar`),
   listByCreadorId: (id, params = {}) => api.get(`/encuestas/creador/${id}`, { params }),

};
