import React from "react";
import "./about.css";
import { FaInstagram, FaGithub, FaLinkedinIn } from "react-icons/fa";
import developerPhoto from "../../assets/desarrolladorFoto.jpeg";

function About() {
   return (
      <section className="uv-about-page">
         <div className="uv-about-wrapper">
            <article className="uv-about-card">
               <div className="uv-about-left">
                  <div className="uv-about-photo-shell">
                     <img
                        src={developerPhoto}
                        alt="Desarrollador de U-Vote"
                        className="uv-about-photo"
                     />
                  </div>
               </div>

               <div className="uv-about-right">
                  <span className="uv-about-badge">Desarrollador</span>

                  <h1 className="uv-about-name">Benjamín Solano Ortega</h1>

                  <p className="uv-about-role">
                     Estudiante de Ingeniería en Sistemas · Full Stack Developer
                  </p>

                  <div className="uv-about-divider" />

                  <div className="uv-about-description">
                     <p>
                        Soy estudiante de Ingeniería en Sistemas con enfoque en desarrollo
                        Full Stack. He trabajado con tecnologías como Java, C#, .NET,
                        React, PostgreSQL y MySQL, combinando lógica, diseño y experiencia
                        de usuario en soluciones modernas.
                     </p>

                     <p>
                        Me interesa construir software con una estética limpia, buena
                        arquitectura y una experiencia intuitiva. También he participado en
                        competencias de programación como ICPC y torneos universitarios,
                        fortaleciendo mi capacidad para resolver problemas bajo presión.
                     </p>
                  </div>

                  <blockquote className="uv-about-quote">
                     “El minimalismo no es la falta de algo. Es simplemente la cantidad
                     perfecta de algo.”
                     <span>– Nicholas Burroughs</span>
                  </blockquote>

                  <div className="uv-about-socials">
                     <a
                        href="https://www.instagram.com/"
                        target="_blank"
                        rel="noreferrer"
                        className="uv-social-btn"
                        aria-label="Instagram del desarrollador"
                     >
                        <FaInstagram />
                        <span>Instagram</span>
                     </a>

                     <a
                        href="https://github.com/Benjamin-Solano"
                        target="_blank"
                        rel="noreferrer"
                        className="uv-social-btn"
                        aria-label="Github del desarrollador"
                     >
                        <FaGithub />
                        <span>GitHub</span>
                     </a>

                     <a
                        href="https://www.linkedin.com/in/inng-benjamin-solano/"
                        target="_blank"
                        rel="noreferrer"
                        className="uv-social-btn"
                        aria-label="LinkedIn del desarrollador"
                     >
                        <FaLinkedinIn />
                        <span>LinkedIn</span>
                     </a>
                  </div>
               </div>
            </article>
         </div>
      </section>
   );
}

export default About;