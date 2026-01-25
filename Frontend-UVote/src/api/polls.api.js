import { api } from "./axios";

export const pollsApi = {
   // Público
   list: () => api.get("/encuestas"),
   getById: (id) => api.get(`/encuestas/${id}`),

   // Requiere JWT
   create: (payload) => api.post("/encuestas", payload),
   close: (id) => api.post(`/encuestas/${id}/cerrar`),
   listByCreadorId: (id) => api.get(`/encuestas/creador/${id}`),

};


