import { api } from "./axios";

export const usersApi = {
   create: (payload) => api.post("/usuarios", payload),
   list: () => api.get("/usuarios"),
   getById: (id) => api.get(`/usuarios/${id}`),

   // si ya lo tienes por nombre:
   getByNombreUsuario: (nombreUsuario) =>
      api.get(`/usuarios/nombre/${encodeURIComponent(nombreUsuario)}`),

   // editar usuario (ajusta endpoint según tu backend)
   updateNombreUsuario: (id, payload) =>
      api.put(`/usuarios/id/${id}`, payload),
};
