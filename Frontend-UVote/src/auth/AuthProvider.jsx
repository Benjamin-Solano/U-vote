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

      if (storedToken && typeof storedToken === "string" && storedToken.length > 0) {
         setToken(storedToken);
      }

      if (storedUser) {
         try {
            const parsed = JSON.parse(storedUser);
            if (parsed && typeof parsed === "object") {
               setUsuario(parsed);
            } else {
               localStorage.removeItem("usuario");
            }
         } catch {
            localStorage.removeItem("token");
            localStorage.removeItem("usuario");
         }
      }

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

   const logout = async () => {
      try {
         await authApi.logout();
      } catch (_) {
         // Si falla (token expirado, red caída), igual limpiamos local
      }

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
