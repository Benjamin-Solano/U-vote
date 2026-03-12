import { Routes, Route, Navigate, useLocation } from "react-router-dom";

import Home from "../pages/Home/Home";
import Login from "../pages/Auth/Login";
import Register from "../pages/Auth/Register";
import VerifyCode from "../pages/Auth/VerifyCode";

import PollDetail from "../pages/Polls/PollDetail";
import CreatePoll from "../pages/Polls/CreatePoll";
import VoteConfirmation from "../pages/Polls/VoteConfirmation";
import PollExplorer from "../pages/Polls/PollExplorer";

import ProtectedRoute from "../auth/ProtectedRoute";
import Profile from "../pages/Profile/Profile";
import About from './pages/about/About';

function PollsIdRedirect() {
   const location = useLocation();

   const next = location.pathname.replace("/polls/", "/encuestas/");
   return <Navigate to={next} replace />;
}

export default function AppRouter() {
   return (
      <Routes>
         <Route path="/" element={<Home />} />
         <Route
            path="/about"
            element={<div className="container" style={{ padding: 24 }}>About (pendiente)</div>}
         />

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
         <Route path="/about" element={<About />} />
         <Route
            path="*"
            element={<div className="container" style={{ padding: 24 }}>404 - No encontrado</div>}
         />
      </Routes>
   );
}