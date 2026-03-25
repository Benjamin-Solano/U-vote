import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "./useAuth";

/**
 * Redirige a "/" si el usuario ya tiene sesión activa.
 * Usado para /login, /register y /verify.
 */
export default function GuestRoute() {
   const { isAuthenticated } = useAuth();

   if (isAuthenticated) {
      return <Navigate to="/" replace />;
   }

   return <Outlet />;
}
