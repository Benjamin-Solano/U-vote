import { api } from "./axios";

export const usersApi = {
   create: (payload) => api.post("/usuarios", payload),
   list: () => api.get("/usuarios"),
   getById: (id) => api.get(`/usuarios/${id}`),

   getByNombreUsuario: (nombreUsuario) =>
      api.get(`/usuarios/nombre/${encodeURIComponent(nombreUsuario)}`),

   updateNombreUsuario: (id, payload) =>
      api.put(`/usuarios/id/${id}`, payload),

   uploadFotoPerfil: (id, file) => {
      const form = new FormData();
      form.append("file", file);

      return api.post(`/usuarios/id/${id}/foto`, form, {
         headers: { "Content-Type": "multipart/form-data" },
      });
   },

   updateUsuario: (id, payload) => api.put(`/usuarios/id/${id}`, payload),

};
