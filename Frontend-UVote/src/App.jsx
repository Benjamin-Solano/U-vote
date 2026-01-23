import { Routes, Route, Navigate } from "react-router-dom";

import Login from "./pages/Login";
import Register from "./pages/Register";
import Polls from "./pages/Polls";
import PollDetail from "./pages/PollDetail";

function App() {
  return (
    <Routes>
      {/* Ruta raíz */}
      <Route path="/" element={<Navigate to="/polls" />} />

      {/* Públicas */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/polls" element={<Polls />} />
      <Route path="/polls/:id" element={<PollDetail />} />

      {/* Fallback */}
      <Route path="*" element={<h2>Página no encontrada</h2>} />
    </Routes>
  );
}

export default App;
