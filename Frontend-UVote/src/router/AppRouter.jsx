import { lazy, Suspense } from "react";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";

import ProtectedRoute from "../auth/ProtectedRoute";

const Home            = lazy(() => import("../pages/Home/Home"));
const Login           = lazy(() => import("../pages/Auth/Login"));
const Register        = lazy(() => import("../pages/Auth/Register"));
const VerifyCode      = lazy(() => import("../pages/Auth/VerifyCode"));
const PollDetail      = lazy(() => import("../pages/Polls/PollDetail"));
const CreatePoll      = lazy(() => import("../pages/Polls/CreatePoll"));
const VoteConfirmation = lazy(() => import("../pages/Polls/VoteConfirmation"));
const PollExplorer    = lazy(() => import("../pages/Polls/PollExplorer"));
const Profile         = lazy(() => import("../pages/Profile/Profile"));
const About           = lazy(() => import("../pages/About/About"));

function PollsIdRedirect() {
   const location = useLocation();

   const next = location.pathname.replace("/polls/", "/encuestas/");
   return <Navigate to={next} replace />;
}

export default function AppRouter() {
   return (
      <Suspense fallback={<div className="container" style={{ padding: 24 }}>Cargando…</div>}>
         <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/about" element={<About />} />

            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/verify" element={<VerifyCode />} />

            <Route path="/encuestas" element={<Navigate to="/encuestas/buscar" replace />} />
            <Route path="/encuestas/buscar" element={<PollExplorer />} />
            <Route path="/encuestas/:id" element={<PollDetail />} />
            <Route path="/encuestas/:id/confirmacion-voto" element={<VoteConfirmation />} />

            <Route path="/polls" element={<Navigate to="/encuestas/buscar" replace />} />
            <Route path="/polls/:id" element={<PollsIdRedirect />} />

            <Route element={<ProtectedRoute />}>
               <Route path="/encuestas/crear" element={<CreatePoll />} />
               <Route path="/perfil" element={<Profile />} />
            </Route>

            <Route
               path="*"
               element={<div className="container" style={{ padding: 24 }}>404 - No encontrado</div>}
            />
         </Routes>
      </Suspense>
   );
}
