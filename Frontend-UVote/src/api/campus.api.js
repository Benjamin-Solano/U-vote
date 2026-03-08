import { api } from "./axios";

export const campusApi = {
   list: () => api.get("/campus"),
   getCarrerasByCampus: (campusId) => api.get(`/campus/${campusId}/carreras`),
};