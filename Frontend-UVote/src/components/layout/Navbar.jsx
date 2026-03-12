import { useEffect, useMemo, useRef, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { FiCompass, FiHome, FiLogIn, FiLogOut, FiPlusCircle, FiUser } from "react-icons/fi";
import "./navbar.css";

import { useAuth } from "../../auth/useAuth";
import logo from "../../assets/U-VoteLogo.png";

export default function Navbar() {
   const { isAuthenticated, usuario, logout } = useAuth();
   const navigate = useNavigate();

   const [open, setOpen] = useState(false);
   const menuRef = useRef(null);

   const linkClass = ({ isActive }) => `uv-link ${isActive ? "active" : ""}`;

   const fotoSrc = useMemo(() => {
      const foto = usuario?.fotoPerfil;
      if (!foto || typeof foto !== "string") return "";

      // Nuevo formato: base64 guardado en BD
      if (foto.startsWith("data:image/")) return foto;

      // Compatibilidad por si aún existe alguna URL absoluta vieja
      if (foto.startsWith("http://") || foto.startsWith("https://")) return foto;

      // Si viniera una ruta relativa antigua, no la usamos ya
      return "";
   }, [usuario?.fotoPerfil]);

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
            <NavLink to="/" className="uv-brand" aria-label="Ir al inicio">
               <img src={logo} alt="U-Vote" className="uv-brand-logo" />
            </NavLink>

            <nav className="uv-links" aria-label="Navegación principal">
               <NavLink to="/" className={linkClass}>
                  <FiHome />
                  <span className="uv-link-label">Inicio</span>
               </NavLink>

               <NavLink to="/encuestas/buscar" className={linkClass}>
                  <FiCompass />
                  <span className="uv-link-label">Explorar</span>
               </NavLink>

               <NavLink
                  to={isAuthenticated ? "/encuestas/crear" : "/login"}
                  className={linkClass}
               >
                  <FiPlusCircle />
                  <span className="uv-link-label">Crear Encuesta</span>
               </NavLink>

               {!isAuthenticated ? (
                  <NavLink
                     to="/login"
                     className={`${linkClass({ isActive: false })} uv-link-primary`}
                  >
                     <FiLogIn />
                     <span className="uv-link-label">Iniciar Sesión</span>
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
                              <FiUser />
                              <span>Perfil</span>
                           </button>

                           <div className="uv-user-sep" />

                           <button
                              type="button"
                              className="uv-user-item danger"
                              onClick={handleLogout}
                              role="menuitem"
                           >
                              <FiLogOut />
                              <span>Cerrar sesión</span>
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