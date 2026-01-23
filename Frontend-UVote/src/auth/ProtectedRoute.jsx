import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "./useAuth";

function ProtectedRoute() {
   const { isAuthenticated } = useAuth();
   const location = useLocation();

   if (!isAuthenticated) {
      // Guarda dónde intentaba entrar para volver luego
      return <Navigate to="/login" replace state={{ from: location }} />;
   }

   // Si está logueado, permite entrar a las rutas hijas
   return <Outlet />;
}

export default ProtectedRoute;
