import { api } from "./axios";

export const pollsApi = {
   list: () => api.get("/encuestas"),
   getById: (id) => api.get(`/encuestas/${id}`),

   create: (payload) => api.post("/encuestas", payload),
   delete: (id) => api.delete(`/encuestas/${id}`),
   close: (id) => api.post(`/encuestas/${id}/cerrar`),
};
