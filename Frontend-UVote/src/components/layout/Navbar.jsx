import { Link, NavLink } from "react-router-dom";
import { motion } from "framer-motion";
import { FiHome, FiInfo, FiPlusCircle, FiLogIn } from "react-icons/fi";
import "./navbar.css";

function Navbar() {
   return (
      <motion.header
         className="uv-nav"
         initial={{ opacity: 0, y: -8 }}
         animate={{ opacity: 1, y: 0 }}
         transition={{ duration: 0.25, ease: "easeOut" }}
      >
         <div className="container uv-nav-inner">
            <Link to="/" className="uv-brand">
               <span className="uv-brand-badge">U</span>
               <span className="uv-brand-text">U-Vote</span>
            </Link>

            <nav className="uv-links">
               <NavLink to="/" className="uv-link">
                  <FiHome size={16} /> Inicio
               </NavLink>

               <NavLink to="/about" className="uv-link">
                  <FiInfo size={16} /> About
               </NavLink>

               <NavLink to="/admin/polls" className="uv-link">
                  <FiPlusCircle size={16} /> Crear Encuesta
               </NavLink>

               <NavLink to="/login" className="btn btn-primary pill">
                  <FiLogIn size={16} /> Iniciar Sesión
               </NavLink>
            </nav>
         </div>
      </motion.header>
   );
}

export default Navbar;
