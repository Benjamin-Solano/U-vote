import { useEffect, useMemo, useRef, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { FiHome, FiInfo, FiPlusCircle, FiLogIn, FiLogOut, FiSearch } from "react-icons/fi";
import "./navbar.css";

import { useAuth } from "../../auth/useAuth";
import logo from "../../assets/U-VoteLogo.png";


export default function Navbar() {
   const { isAuthenticated, usuario, logout } = useAuth();
   const navigate = useNavigate();

   const [open, setOpen] = useState(false);
   const menuRef = useRef(null);

   const linkClass = ({ isActive }) => `uv-link ${isActive ? "active" : ""}`;

   const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:8080";

   const fotoSrc = useMemo(() => {
      const path = usuario?.fotoPerfil;
      if (!path) return "";
      if (path.startsWith("http://") || path.startsWith("https://")) return path;
      return `${BACKEND_URL}${path}`;
   }, [usuario?.fotoPerfil, BACKEND_URL]);

   const initial = useMemo(() => {
      const n = (usuario?.nombreUsuario || "").trim();
      return n ? n.slice(0, 1).toUpperCase() : "U";
   }, [usuario?.nombreUsuario]);

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
            <NavLink to="/" className="uv-brand" aria-label="Ir al inicio">
               <img
                  src={logo}
                  alt="U-Vote"
                  className="uv-brand-logo"
               />
               <span className="uv-brand-text">U-Vote</span>
            </NavLink>


            <nav className="uv-links" aria-label="Navegación principal">
               <NavLink to="/" className={linkClass}>
                  <FiHome /> Inicio
               </NavLink>

               <NavLink to="/about" className={linkClass}>
                  <FiInfo /> About
               </NavLink>


               <NavLink to="/encuestas/buscar" className={linkClass}>
                  <FiSearch /> Buscar Encuestas
               </NavLink>
               <NavLink
                  to={isAuthenticated ? "/encuestas/crear" : "/login"}
                  className={linkClass}
               >
                  <FiPlusCircle /> Crear Encuesta
               </NavLink>
               {/* Derecha */}
               {!isAuthenticated ? (
                  <NavLink to="/login" className={`${linkClass({ isActive: false })} uv-link-primary`}>
                     <FiLogIn /> Iniciar Sesión
                  </NavLink>
               ) : (
                  <div className="uv-user" ref={menuRef}>
                     <button
                        type="button"
                        className={`uv-user-btn ${open ? "open" : ""}`}
                        onClick={() => setOpen((v) => !v)}
                        aria-haspopup="menu"
                        aria-expanded={open}
                     >
                        <span className="uv-avatar-nav" aria-hidden="true">
                           {fotoSrc ? (
                              <img src={fotoSrc} alt="" />
                           ) : (
                              <span className="uv-avatar-fallback">{initial}</span>
                           )}
                        </span>

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
                              role="menuitem"
                           >
                              Perfil
                           </button>

                           <div className="uv-user-sep" />

                           <button
                              type="button"
                              className="uv-user-item danger"
                              onClick={handleLogout}
                              role="menuitem"
                           >
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
