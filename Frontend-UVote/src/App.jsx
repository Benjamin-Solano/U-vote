import { Routes, Route } from "react-router-dom";

import Navbar from "./components/layout/Navbar";
import Footer from "./components/layout/Footer";

import Home from "./pages/Home/Home";
import Login from "./pages/Auth/Login";
import Register from "./pages/Auth/Register";

import Polls from "./pages/Polls/Polls";
import PollDetail from "./pages/Polls/PollDetail";

import AdminPolls from "./pages/Admin/AdminPolls";
import ProtectedRoute from "./auth/ProtectedRoute";

function App() {
  return (
    <div className="app-layout">
      <Navbar />

      <main className="app-content">
        <Routes>
          {/* Públicas */}
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<div className="container" style={{ padding: 24 }}>About (pendiente)</div>} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* (Por backend: GET encuestas es público) */}
          <Route path="/polls" element={<Polls />} />
          <Route path="/polls/:id" element={<PollDetail />} />

          {/* Protegidas */}
          <Route element={<ProtectedRoute />}>
            <Route path="/admin/polls" element={<AdminPolls />} />
          </Route>

          {/* 404 */}
          <Route path="*" element={<div className="container" style={{ padding: 24 }}>404 - No encontrado</div>} />
        </Routes>
      </main>

      <Footer />
    </div>
  );
}

export default App;
