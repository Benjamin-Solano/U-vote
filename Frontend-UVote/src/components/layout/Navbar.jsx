import { useEffect, useRef, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { FiHome, FiInfo, FiPlusCircle, FiLogIn, FiUser, FiLogOut } from "react-icons/fi";
import "./navbar.css";

import { useAuth } from "../../auth/useAuth";

export default function Navbar() {
   const { isAuthenticated, usuario, logout } = useAuth();
   const navigate = useNavigate();

   const [open, setOpen] = useState(false);
   const menuRef = useRef(null);

   const linkClass = ({ isActive }) => `uv-link ${isActive ? "active" : ""}`;

   useEffect(() => {
      const onDocClick = (e) => {
         if (!menuRef.current) return;
         if (!menuRef.current.contains(e.target)) setOpen(false);
      };
      document.addEventListener("mousedown", onDocClick);
      return () => document.removeEventListener("mousedown", onDocClick);
   }, []);

   const handleLogout = () => {
      logout();
      setOpen(false);
      navigate("/", { replace: true });
   };

   return (
      <header className="uv-nav">
         <div className="container uv-nav-inner">
            {/* Brand */}
            <NavLink to="/" className="uv-brand">
               <span className="uv-brand-badge">u</span>
               <span className="uv-brand-text">U-Vote</span>
            </NavLink>

            <nav className="uv-links">
               <NavLink to="/" className={linkClass}>
                  <FiHome /> Inicio
               </NavLink>

               <NavLink to="/about" className={linkClass}>
                  <FiInfo /> About
               </NavLink>

               <NavLink to="/polls" className={linkClass}>
                  <FiPlusCircle /> Crear Encuesta
               </NavLink>

               {/* Derecha: si NO hay sesión */}
               {!isAuthenticated ? (
                  <NavLink to="/login" className={linkClass}>
                     <FiLogIn /> Iniciar Sesión
                  </NavLink>
               ) : (
                  // ✅ Si hay sesión: menú de usuario
                  <div className="uv-user" ref={menuRef}>
                     <button
                        type="button"
                        className="uv-user-btn"
                        onClick={() => setOpen((v) => !v)}
                     >
                        <FiUser />
                        <span className="uv-user-name">
                           {usuario?.nombreUsuario ?? "Mi cuenta"}
                        </span>
                     </button>

                     {open && (
                        <div className="uv-user-menu" role="menu">
                           <button
                              type="button"
                              className="uv-user-item"
                              onClick={() => {
                                 setOpen(false);
                                 navigate("/perfil");
                              }}
                           >
                              <FiUser /> Perfil
                           </button>

                           <div className="uv-user-sep" />

                           <button type="button" className="uv-user-item" onClick={handleLogout}>
                              <FiLogOut /> Cerrar sesión
                           </button>
                        </div>
                     )}
                  </div>
               )}
            </nav>
         </div>
      </header>
   );
}
