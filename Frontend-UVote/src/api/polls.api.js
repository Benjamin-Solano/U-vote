import { api } from "./axios";

export const pollsApi = {
   list: () => api.get("/encuestas"),
   getById: (id) => api.get(`/encuestas/${id}`),

   create: (payload) => api.post("/encuestas", payload),
   delete: (id) => api.delete(`/encuestas/${id}`),
   close: (id) => api.post(`/encuestas/${id}/cerrar`),


   // Ajusta a tu endpoint real:
   listByCreadorId: (creadorId) => api.get(`/polls?creadorId=${creadorId}`),
};
