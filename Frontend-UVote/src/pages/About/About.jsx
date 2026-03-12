import React from 'react';
import './About.css';
import { FaInstagram, FaGithub, FaLinkedinIn } from 'react-icons/fa';
import developerPhoto from '../../assets/desarrolladorFoto.jpeg';

export default function About() {
  return (
    <section className="uv-about-page">
      <div className="uv-about-wrapper">
        <article className="uv-about-card">
          <div className="uv-about-cover" />

          <div className="uv-about-photo-wrap">
            <img
              src={developerPhoto}
              alt="Desarrollador de U-Vote"
              className="uv-about-photo"
            />
          </div>

          <div className="uv-about-content">
            <span className="uv-about-badge">Desarrollador</span>

            <h1 className="uv-about-name">Benjamín Herrera</h1>
            <p className="uv-about-role">
              Estudiante de Ingeniería en Sistemas · Full Stack Developer
            </p>

            <div className="uv-about-divider" />

            <div className="uv-about-description">
              <p>
                Soy estudiante de Ingeniería en Sistemas con una sólida formación
                en desarrollo Full Stack, combinando experiencia práctica en Java,
                C#, .NET, React, PostgreSQL y MySQL. Me apasiona el diseño de
                software moderno y minimalista, la resolución de problemas
                complejos y la mejora continua de la experiencia de usuario.
              </p>

              <p>
                He participado en competencias de alto nivel como el International
                Collegiate Programming Contest (ICPC) y torneos internos de
                programación de la Universidad Nacional de Costa Rica,
                demostrando mi compromiso con la excelencia técnica y el trabajo
                en equipo bajo presión.
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
                className="uv-social-btn uv-social-btn--instagram"
                aria-label="Instagram"
              >
                <FaInstagram />
                <span>Instagram</span>
              </a>

              <a
                href="https://github.com/"
                target="_blank"
                rel="noreferrer"
                className="uv-social-btn uv-social-btn--github"
                aria-label="GitHub"
              >
                <FaGithub />
                <span>GitHub</span>
              </a>

              <a
                href="https://www.linkedin.com/"
                target="_blank"
                rel="noreferrer"
                className="uv-social-btn uv-social-btn--linkedin"
                aria-label="LinkedIn"
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