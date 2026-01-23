import { Routes, Route, Navigate } from "react-router-dom";


import Login from "./pages/Login";
import Register from "./pages/Register";
import Polls from "./pages/polls/Polls";
import PollDetail from "./pages/polls/PollDetail";
import AdminPolls from "./pages/admin/AdminPolls";

import ProtectedRoute from "./auth/ProtectedRoute";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/polls" replace />} />

      {/* Públicas */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* Públicas (según tu SecurityConfig, GET encuestas es público) */}
      <Route path="/polls" element={<Polls />} />
      <Route path="/polls/:id" element={<PollDetail />} />

      {/* Protegidas */}
      <Route element={<ProtectedRoute />}>
        <Route path="/admin/polls" element={<AdminPolls />} />
        {/* aquí luego metemos crear/editar opciones, etc */}
      </Route>

      <Route path="*" element={<h2>Página no encontrada</h2>} />
    </Routes>
  );
}

export default App;
