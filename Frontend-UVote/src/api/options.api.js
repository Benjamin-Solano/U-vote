import { api } from "./axios";

export const optionsApi = {
   listByEncuesta: (encuestaId) => api.get(`/encuestas/${encuestaId}/opciones`),
   create: (encuestaId, payload) => api.post(`/encuestas/${encuestaId}/opciones`, payload),
   delete: (opcionId) => api.delete(`/opciones/${opcionId}`),
};
