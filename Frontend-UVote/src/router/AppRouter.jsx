import { lazy, Suspense } from "react";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";

import ProtectedRoute from "../auth/ProtectedRoute";
import GuestRoute from "../auth/GuestRoute";

const Home             = lazy(() => import("../pages/Home/Home"));
const Login            = lazy(() => import("../pages/Auth/Login"));
const Register         = lazy(() => import("../pages/Auth/Register"));
const VerifyCode       = lazy(() => import("../pages/Auth/VerifyCode"));
const PollDetail       = lazy(() => import("../pages/Polls/PollDetail"));
const CreatePoll       = lazy(() => import("../pages/Polls/CreatePoll"));
const VoteConfirmation = lazy(() => import("../pages/Polls/VoteConfirmation"));
const PollExplorer     = lazy(() => import("../pages/Polls/PollExplorer"));
const Profile          = lazy(() => import("../pages/Profile/Profile"));
const About            = lazy(() => import("../pages/About/About"));

function PollsIdRedirect() {
   const location = useLocation();
   const next = location.pathname.replace("/polls/", "/encuestas/");
   return <Navigate to={next} replace />;
}

function NotFound() {
   return (
      <div className="container" style={{ padding: "48px 16px 80px" }}>
         <hr style={{ height: 4, background: "#302f2c", border: "none", margin: "0 0 12px" }} />
         <p style={{ fontSize: "0.74rem", letterSpacing: "0.16em", textTransform: "uppercase", fontWeight: 800, color: "rgba(48,47,44,0.44)", margin: "0 0 6px" }}>
            Error · 404
         </p>
         <h1 style={{ fontSize: "clamp(2rem,5vw,3.6rem)", fontWeight: 900, fontStyle: "italic", letterSpacing: "-0.03em", color: "#302f2c", margin: "0 0 16px", lineHeight: 1 }}>
            Página no encontrada
         </h1>
         <hr style={{ height: 1, background: "#302f2c", border: "none", margin: "0 0 20px", boxShadow: "0 3px 0 0 #efede3, 0 4px 0 0 #302f2c" }} />
         <p style={{ color: "#4a4745", fontSize: "0.96rem", lineHeight: 1.6, maxWidth: 480, margin: "0 0 24px" }}>
            La dirección que buscas no existe o fue removida. Verifica la URL o vuelve al inicio.
         </p>
         <a href="/" style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "10px 18px", background: "#302f2c", color: "#efede3", borderRadius: 2, fontWeight: 800, fontSize: "0.88rem", letterSpacing: "0.04em", textDecoration: "none", border: "1.5px solid #302f2c" }}>
            Volver al inicio
         </a>
      </div>
   );
}

export default function AppRouter() {
   return (
      <Suspense fallback={
         <div className="container" style={{ padding: "28px 16px", color: "rgba(48,47,44,0.5)", fontSize: "0.9rem", fontWeight: 600 }}>
            Cargando…
         </div>
      }>
         <Routes>
            {/* Públicas */}
            <Route path="/" element={<Home />} />
            <Route path="/about" element={<About />} />
            <Route path="/encuestas" element={<Navigate to="/encuestas/buscar" replace />} />
            <Route path="/encuestas/buscar" element={<PollExplorer />} />
            <Route path="/encuestas/:id" element={<PollDetail />} />
            <Route path="/encuestas/:id/confirmacion-voto" element={<VoteConfirmation />} />

            {/* Redirecciones legado */}
            <Route path="/polls" element={<Navigate to="/encuestas/buscar" replace />} />
            <Route path="/polls/:id" element={<PollsIdRedirect />} />

            {/* Solo para usuarios NO autenticados */}
            <Route element={<GuestRoute />}>
               <Route path="/login" element={<Login />} />
               <Route path="/register" element={<Register />} />
               <Route path="/verify" element={<VerifyCode />} />
            </Route>

            {/* Solo para usuarios autenticados */}
            <Route element={<ProtectedRoute />}>
               <Route path="/encuestas/crear" element={<CreatePoll />} />
               <Route path="/encuestas/:id/editar" element={<CreatePoll />} />
               <Route path="/perfil" element={<Profile />} />
            </Route>

            {/* 404 */}
            <Route path="*" element={<NotFound />} />
         </Routes>
      </Suspense>
   );
}
