import { api } from "./axios";

export const pollAuthorizedEmailsApi = {
   uploadExcel(encuestaId, file) {
      const formData = new FormData();
      formData.append("file", file);

      return api.post(`/encuestas/${encuestaId}/correos-autorizados`, formData, {
         headers: {
            "Content-Type": "multipart/form-data",
         },
      });
   },

   list(encuestaId) {
      return api.get(`/encuestas/${encuestaId}/correos-autorizados`);
   },

   participation(encuestaId) {
      return api.get(`/encuestas/${encuestaId}/participacion`);
   },
};
