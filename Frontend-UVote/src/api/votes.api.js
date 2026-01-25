import { api } from "./axios";

export const votesApi = {
   vote: (encuestaId, opcionId) => api.post(`/encuestas/${encuestaId}/votos`, { opcionId }),
   results: (encuestaId) => api.get(`/encuestas/${encuestaId}/resultados`),
};
