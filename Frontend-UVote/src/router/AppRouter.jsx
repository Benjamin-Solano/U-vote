import { Routes, Route, Navigate, useLocation } from "react-router-dom";

import Home from "../pages/Home/Home";
import Login from "../pages/Auth/Login";
import Register from "../pages/Auth/Register";


import PollDetail from "../pages/Polls/PollDetail";
import CreatePoll from "../pages/Polls/CreatePoll";


import ProtectedRoute from "../auth/ProtectedRoute";
import Profile from "../pages/Profile/Profile";

function PollsIdRedirect() {
   const location = useLocation();
   // /polls/123 -> /encuestas/123
   const next = location.pathname.replace("/polls/", "/encuestas/");
   return <Navigate to={next} replace />;
}

export default function AppRouter() {
   return (
      <Routes>
         {/* Públicas */}
         <Route path="/" element={<Home />} />
         <Route
            path="/about"
            element={<div className="container" style={{ padding: 24 }}>About (pendiente)</div>}
         />
         <Route path="/login" element={<Login />} />
         <Route path="/register" element={<Register />} />

         {/* Encuestas (público: solo búsqueda + detalle) */}
         <Route path="/encuestas" element={<Navigate to="/encuestas/buscar" replace />} />
         <Route path="/encuestas/:id" element={<PollDetail />} />

         {/* Compatibilidad */}
         <Route path="/polls" element={<Navigate to="/encuestas/buscar" replace />} />
         <Route path="/polls/:id" element={<PollsIdRedirect />} />

         {/* Protegidas */}
         <Route element={<ProtectedRoute />}>
            <Route path="/encuestas/crear" element={<CreatePoll />} />
            <Route path="/perfil" element={<Profile />} />

         </Route>

         {/* 404 */}
         <Route
            path="*"
            element={<div className="container" style={{ padding: 24 }}>404 - No encontrado</div>}
         />
      </Routes>
   );
}
