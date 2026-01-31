import { motion } from "framer-motion";

import "./login.css";

/**
 * AuthCard
 * - Reutiliza el mismo layout/estilo para Login y Register.
 * - Mantiene el mismo diseño actual (mismas clases CSS).
 */
export default function AuthCard({ logo, leftSubtitle, title, subtitle, children }) {
   return (
      <div className="uv-login-page">
         <motion.section
            className="uv-login-card"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35 }}
         >
            {/* Panel izquierdo */}
            <div className="uv-login-left" aria-hidden="true">
               <div className="uv-login-left-inner">
                  {/* Logo con animación sutil */}
                  <motion.img
                     className="uv-login-logo"
                     src={logo}
                     alt="U-Vote"
                     initial={{ y: 0, scale: 1 }}
                     animate={{ y: [0, -6, 0], scale: [1, 1.012, 1] }}
                     transition={{ duration: 4.2, repeat: Infinity, ease: "easeInOut" }}
                     whileHover={{ scale: 1.03, rotate: -0.4 }}
                     whileTap={{ scale: 0.995 }}
                     draggable={false}
                  />

                  {leftSubtitle ? <p className="uv-login-left-sub">{leftSubtitle}</p> : null}
               </div>
            </div>

            {/* Panel derecho */}
            <div className="uv-login-right">
               <div className="uv-login-header">
                  <h1>{title}</h1>
                  {subtitle ? <p>{subtitle}</p> : null}
               </div>

               {children}
            </div>
         </motion.section>
      </div>
   );
}
