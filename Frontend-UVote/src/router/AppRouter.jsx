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
      <div className="container uv-notfound">
         <hr className="uv-notfound-rule-top" />
         <p className="uv-notfound-eyebrow">Error · 404</p>
         <h1 className="uv-notfound-title">Página no encontrada</h1>
         <hr className="uv-notfound-rule-double" />
         <p className="uv-notfound-body">
            La dirección que buscas no existe o fue removida. Verifica la URL o vuelve al inicio.
         </p>
         <a href="/" className="uv-notfound-btn">Volver al inicio</a>
      </div>
   );
}

export default function AppRouter() {
   return (
      <Suspense fallback={
         <div className="container uv-suspense-loader">Cargando…</div>
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
