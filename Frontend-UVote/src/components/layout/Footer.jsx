import { motion } from "framer-motion";
import { FiFacebook, FiTwitter, FiInstagram, FiLinkedin } from "react-icons/fi";
import "./footer.css";

function Footer() {
   return (
      <motion.footer
         className="uv-footer"
         initial={{ opacity: 0, y: 14 }}
         whileInView={{ opacity: 1, y: 0 }}
         viewport={{ once: true, amount: 0.2 }}
         transition={{ duration: 0.3, ease: "easeOut" }}
      >
         <div className="container uv-footer-inner">
            <div className="uv-footer-brand">
               <div className="uv-footer-title">U-Vote</div>
               <div className="uv-footer-sub">
                  Plataforma minimalista para crear y gestionar encuestas.
               </div>
            </div>

            <div className="uv-footer-cols">
               <div>
                  <div className="uv-footer-h">Enlaces</div>
                  <a className="uv-footer-link" href="/">Inicio</a>
                  <a className="uv-footer-link" href="/about">About</a>
                  <a className="uv-footer-link" href="/login">Iniciar Sesión</a>
               </div>

               <div>
                  <div className="uv-footer-h">Síguenos</div>
                  <div className="uv-social">
                     <a className="uv-social-btn" href="#" aria-label="Facebook"><FiFacebook /></a>
                     <a className="uv-social-btn" href="#" aria-label="Twitter"><FiTwitter /></a>
                     <a className="uv-social-btn" href="#" aria-label="Instagram"><FiInstagram /></a>
                     <a className="uv-social-btn" href="#" aria-label="LinkedIn"><FiLinkedin /></a>
                  </div>
               </div>
            </div>
         </div>

         <div className="uv-footer-bottom">
            <div className="container uv-footer-bottom-inner">
               <span>© {new Date().getFullYear()} U-Vote. Todos los derechos reservados.</span>
               <span className="uv-footer-dot">•</span>
               <span>Hecho con #efede3 y #302f2c</span>
            </div>
         </div>
      </motion.footer>
   );
}

export default Footer;
