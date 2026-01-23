import { api } from "./axios";

export const votesApi = {
   vote: (pollId, payload) =>
      api.post(`/encuestas/${pollId}/votos`, payload),

   results: (pollId) =>
      api.get(`/encuestas/${pollId}/resultados`),
};
