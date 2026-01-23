import { useEffect, useState } from "react";
import { authApi } from "../api/auth.api";
import { AuthContext } from "./authContext";

export function AuthProvider({ children }) {
   const [token, setToken] = useState(null);
   const [usuario, setUsuario] = useState(null);
   const [loading, setLoading] = useState(true);

   useEffect(() => {
      const storedToken = localStorage.getItem("token");
      const storedUser = localStorage.getItem("usuario");

      if (storedToken) setToken(storedToken);
      if (storedUser) setUsuario(JSON.parse(storedUser));

      setLoading(false);
   }, []);

   const login = async (correo, contrasena) => {
      const res = await authApi.login({ correo, contrasena });

      const newToken = res?.data?.token;
      const newUser = res?.data?.usuario;

      if (!newToken || !newUser) {
         throw new Error("Respuesta inválida del servidor");
      }

      localStorage.setItem("token", newToken);
      localStorage.setItem("usuario", JSON.stringify(newUser));

      setToken(newToken);
      setUsuario(newUser);
   };

   const logout = () => {
      localStorage.removeItem("token");
      localStorage.removeItem("usuario");
      setToken(null);
      setUsuario(null);
   };

   const value = {
      token,
      usuario,
      isAuthenticated: !!token,
      login,
      logout,
   };

   if (loading) return null;

   return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
