import { motion } from "framer-motion";
import { FaLinkedin, FaGithub, FaInstagram } from "react-icons/fa";
import { Link } from "react-router-dom";
import "./footer.css";

import logo from "../../assets/U-VoteLogoW.png";

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
               <div className="uv-footer-title">
                  <img src={logo} alt="U-Vote" className="uv-brand-logo" />
                  U-Vote
               </div>
            </div>

            <div className="uv-footer-cols">
               <div>
                  <div className="uv-footer-h">Enlaces</div>
                  <Link className="uv-footer-link" to="/">Inicio</Link>
                  <Link className="uv-footer-link" to="/about">Sobre el desarrollador</Link>
                  <Link className="uv-footer-link" to="/login">Iniciar Sesión</Link>
               </div>

               <div>
                  <div className="uv-footer-h">Síguenos</div>
                  <div className="uv-social">
                     <a
                        href="https://www.instagram.com/benjamiinn.exe/"
                        target="_blank"
                        rel="noreferrer"
                        className="uv-social-btn"
                        aria-label="Instagram del desarrollador"
                     >
                        <FaInstagram />
                        
                     </a>

                     <a
                        href="https://github.com/Benjamin-Solano"
                        target="_blank"
                        rel="noreferrer"
                        className="uv-social-btn"
                        aria-label="Github del desarrollador"
                     >
                        <FaGithub />
                        
                     </a>

                     <a
                        href="https://www.linkedin.com/in/inng-benjamin-solano/"
                        target="_blank"
                        rel="noreferrer"
                        className="uv-social-btn"
                        aria-label="LinkedIn del desarrollador"
                     >
                     <FaLinkedin/>
                     
                     </a>
                  </div>
               </div>
            </div>
         </div>

         <div className="uv-footer-bottom">
            <div className="container uv-footer-bottom-inner">
               <span>© {new Date().getFullYear()} U-Vote. Todos los derechos reservados.</span>
            </div>
         </div>
      </motion.footer>
   );
}

export default Footer;