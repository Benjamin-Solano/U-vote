import { api } from "./axios";

export const optionsApi = {
   listByPoll: (pollId) =>
      api.get(`/encuestas/${pollId}/opciones`),

   create: (pollId, payload) =>
      api.post(`/encuestas/${pollId}/opciones`, payload),

   remove: (optionId) =>
      api.delete(`/opciones/${optionId}`),
};
