import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
   FiArrowRight,
   FiBarChart2,
   FiCheckCircle,
   FiGrid,
   FiStar,
   FiTrendingUp,
   FiUsers,
} from "react-icons/fi";

import logo from "../../assets/U-VoteLogo.png";
import logoW from "../../assets/U-VoteLogoW.png";
import { useTheme } from "../../context/ThemeContext";

/* =========================================================
   Animaciones bidireccionales (entrada + salida al hacer scroll)
   Cada variante "hidden" incluye transition para que la
   desaparición sea animada, no instantánea.
   ========================================================= */

const EASE_IN  = [0.4, 0, 1, 1];
const EASE_OUT = [0.16, 1, 0.3, 1];

const heroFade = {
   hidden: { opacity: 0, y: 30, transition: { duration: 0.4, ease: EASE_IN } },
   show:   { opacity: 1, y: 0,  transition: { duration: 0.6, ease: "easeOut" } },
};

const heroStagger = {
   hidden: {},
   show: { transition: { staggerChildren: 0.14 } },
};

const sectionSlideUp = {
   hidden: { opacity: 0, y: 80,  transition: { duration: 0.45, ease: EASE_IN } },
   show:   { opacity: 1, y: 0,   transition: { duration: 0.7,  ease: EASE_OUT } },
};

const sectionSlideLeft = {
   hidden: { opacity: 0, x: -60, transition: { duration: 0.4, ease: EASE_IN } },
   show:   { opacity: 1, x: 0,   transition: { duration: 0.65, ease: EASE_OUT } },
};

const sectionZoomIn = {
   hidden: { opacity: 0, scale: 0.88, transition: { duration: 0.4, ease: EASE_IN } },
   show:   { opacity: 1, scale: 1,    transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] } },
};

const cardPop = {
   hidden: { opacity: 0, y: 60, scale: 0.92, transition: { duration: 0.35, ease: EASE_IN } },
   show:   { opacity: 1, y: 0,  scale: 1,    transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] } },
};

const staggerCards = {
   hidden: { transition: { staggerChildren: 0.08, staggerDirection: -1 } },
   show:   { transition: { staggerChildren: 0.18 } },
};

/* Logo flotante – animación infinita sutil */
const floatingLogo = {
   animate: {
      y: [0, -10, 0],
      transition: {
         duration: 3,
         repeat: Infinity,
         ease: "easeInOut",
      },
   },
};

/* =========================================================
   Componente
   ========================================================= */

export default function HomeLanding() {
   const { theme } = useTheme();
   const today = new Date();
   const editionDate = today.toLocaleDateString("es-CR", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
   });

   return (
      <div className="uv-paper">
         {/* ============================================================
             MASTHEAD – cabecera de periódico
             ============================================================ */}
         <motion.header
            className="uv-paper-masthead"
            initial="hidden"
            whileInView="show"
            viewport={{ amount: 0.15 }}
            variants={heroStagger}
         >
            <motion.div className="uv-paper-dateline" variants={heroFade}>
               <span>Edición Especial</span>
               <span className="uv-paper-dot">·</span>
               <span className="uv-paper-date-text">{editionDate}</span>
            </motion.div>

            <motion.div className="uv-paper-brand" variants={heroFade}>
               <div className="uv-paper-rule uv-paper-rule--thick" />

               {/* Logo único centrado con animación flotante */}
               <motion.div
                  className="uv-paper-logo-wrap"
                  variants={floatingLogo}
                  animate="animate"
               >
                  <img
                     src={theme === "dark" ? logoW : logo}
                     alt="U-Vote"
                     className="uv-paper-logo"
                  />
               </motion.div>

               <h1 className="uv-paper-title">U-Vote</h1>

               <p className="uv-paper-tagline">
                  La plataforma universitaria de votaciones digitales
               </p>

               <div className="uv-paper-rule uv-paper-rule--double" />
            </motion.div>

            <motion.div className="uv-paper-meta-row" variants={heroFade}>
               <span>V.2.0.9 · N.º 404</span>
               <span>San José, Costa Rica</span>
               <span>Voto Estudiantil</span>
            </motion.div>
         </motion.header>

         {/* ============================================================
             HEADLINE – artículo principal
             ============================================================ */}
         <motion.section
            className="uv-paper-headline"
            initial="hidden"
            whileInView="show"
            viewport={{ amount: 0.15 }}
            variants={heroStagger}
         >
            <motion.h2 className="uv-paper-headline-title" variants={heroFade}>
               Crea, comparte y analiza votaciones con total transparencia
            </motion.h2>

            <motion.p className="uv-paper-headline-lead" variants={heroFade}>
               U-Vote transforma la manera en que las comunidades universitarias organizan
               sus procesos de decisión colectiva — desde elecciones estudiantiles hasta
               encuestas de retroalimentación, todo en una sola plataforma.
            </motion.p>

            <motion.div className="uv-paper-headline-actions" variants={heroFade}>
               <Link className="uv-paper-btn uv-paper-btn--primary" to="/register">
                  Crear Cuenta
                  <FiArrowRight />
               </Link>
               <Link className="uv-paper-btn uv-paper-btn--ghost" to="/login">
                  Ya tengo cuenta
               </Link>
            </motion.div>
         </motion.section>

         <div className="uv-paper-rule uv-paper-rule--section" />

         {/* ============================================================
             BENEFICIOS – slide-up con stagger fuerte
             ============================================================ */}
         <motion.section
            className="uv-paper-columns"
            initial="hidden"
            whileInView="show"
            viewport={{ amount: 0.08 }}
            variants={staggerCards}
         >
            <motion.div className="uv-paper-col-header" variants={sectionSlideLeft}>
               <span className="uv-paper-kicker">Beneficios</span>
               <div className="uv-paper-rule uv-paper-rule--thin" />
            </motion.div>

            <div className="uv-paper-col-grid">
               <motion.article className="uv-paper-article" variants={cardPop}>
                  <div className="uv-paper-article-icon">
                     <FiGrid />
                  </div>
                  <h3>Creación intuitiva</h3>
                  <p>
                     Diseña votaciones con campos claros, fechas definidas y opciones
                     bien organizadas. La interfaz guía cada paso del proceso sin
                     necesidad de capacitación previa.
                  </p>
               </motion.article>

               <motion.article className="uv-paper-article" variants={cardPop}>
                  <div className="uv-paper-article-icon">
                     <FiUsers />
                  </div>
                  <h3>Participación sencilla</h3>
                  <p>
                     Los votantes encuentran, entienden y emiten su voto rápidamente.
                     Un enlace compartido basta para invitar a toda la comunidad
                     a participar del proceso.
                  </p>
               </motion.article>

               <motion.article className="uv-paper-article" variants={cardPop}>
                  <div className="uv-paper-article-icon">
                     <FiTrendingUp />
                  </div>
                  <h3>Resultados comprensibles</h3>
                  <p>
                     Observa métricas y tendencias sin complicaciones. Gráficos de
                     barras y pastel presentan la información de forma visual y directa
                     para una toma de decisiones informada.
                  </p>
               </motion.article>
            </div>
         </motion.section>

         <div className="uv-paper-rule uv-paper-rule--section" />

         {/* ============================================================
             PULL QUOTE – zoom-in dramático
             ============================================================ */}
         <motion.section
            className="uv-paper-pullquote"
            initial="hidden"
            whileInView="show"
            viewport={{ amount: 0.2 }}
            variants={sectionZoomIn}
         >
            <blockquote>
               <p>
                  "La estética minimalista de U-Vote ayuda a concentrarse en la
                  acción principal: <strong>votar.</strong>"
               </p>
            </blockquote>
         </motion.section>

         <div className="uv-paper-rule uv-paper-rule--section" />

         {/* ============================================================
             SERVICIOS – slide-up con stagger
             ============================================================ */}
         <motion.section
            className="uv-paper-services"
            initial="hidden"
            whileInView="show"
            viewport={{ amount: 0.08 }}
            variants={staggerCards}
         >
            <motion.div className="uv-paper-col-header" variants={sectionSlideLeft}>
               <span className="uv-paper-kicker">¿Qué puedes hacer?</span>
               <div className="uv-paper-rule uv-paper-rule--thin" />
            </motion.div>

            <div className="uv-paper-services-grid">
               <motion.div className="uv-paper-service" variants={cardPop}>
                  <span className="uv-paper-service-num">01</span>
                  <div>
                     <h4>Crear votaciones</h4>
                     <p>
                        Configura nombre, descripción, fechas y opciones en una
                        interfaz enfocada en productividad.
                     </p>
                  </div>
               </motion.div>

               <motion.div className="uv-paper-service" variants={cardPop}>
                  <span className="uv-paper-service-num">02</span>
                  <div>
                     <h4>Compartir y participar</h4>
                     <p>
                        Lleva la votación a otros usuarios de manera directa
                        con un simple enlace o código QR.
                     </p>
                  </div>
               </motion.div>

               <motion.div className="uv-paper-service" variants={cardPop}>
                  <span className="uv-paper-service-num">03</span>
                  <div>
                     <h4>Analizar resultados</h4>
                     <p>
                        Consulta estados, totales y comportamiento con métricas
                        visuales en tiempo real.
                     </p>
                  </div>
               </motion.div>
            </div>
         </motion.section>

         <div className="uv-paper-rule uv-paper-rule--section" />

         {/* ============================================================
             TESTIMONIOS – slide-up con stagger
             ============================================================ */}
         <motion.section
            className="uv-paper-social"
            initial="hidden"
            whileInView="show"
            viewport={{ amount: 0.08 }}
            variants={staggerCards}
         >
            <motion.div className="uv-paper-col-header" variants={sectionSlideLeft}>
               <span className="uv-paper-kicker">Voces de la comunidad</span>
               <div className="uv-paper-rule uv-paper-rule--thin" />
            </motion.div>

            <div className="uv-paper-social-grid">
               <motion.blockquote className="uv-paper-testimonial" variants={cardPop}>
                  <p>
                     "La interfaz permite entender rápido qué votar y cómo
                     seguir el resultado."
                  </p>
                  <footer>
                     <FiUsers className="uv-paper-testimonial-icon" />
                     Participación clara
                  </footer>
               </motion.blockquote>

               <motion.blockquote className="uv-paper-testimonial" variants={cardPop}>
                  <p>
                     "La lectura de estados, fechas y resultados mejora
                     la administración de cada votación."
                  </p>
                  <footer>
                     <FiBarChart2 className="uv-paper-testimonial-icon" />
                     Métricas visibles
                  </footer>
               </motion.blockquote>

               <motion.blockquote className="uv-paper-testimonial" variants={cardPop}>
                  <p>
                     "El flujo ordenado reduce la complejidad y permite
                     concentrarse en lo esencial."
                  </p>
                  <footer>
                     <FiCheckCircle className="uv-paper-testimonial-icon" />
                     Flujo ordenado
                  </footer>
               </motion.blockquote>
            </div>
         </motion.section>

         <div className="uv-paper-rule uv-paper-rule--thick" />

         {/* ============================================================
             CTA FINAL – zoom-in
             ============================================================ */}
         <motion.section
            className="uv-paper-cta"
            initial="hidden"
            whileInView="show"
            viewport={{ amount: 0.2 }}
            variants={staggerCards}
         >
            <motion.div variants={sectionZoomIn}>
               <h2>Empieza a crear votaciones con U-Vote.</h2>
               <p>
                  Centraliza tus procesos de votación en una experiencia moderna,
                  clara y persuasiva. La primera edición de tu democracia digital
                  comienza hoy.
               </p>
            </motion.div>

            <motion.div className="uv-paper-cta-actions" variants={sectionSlideUp}>
               <Link className="uv-paper-btn uv-paper-btn--primary" to="/register">
                  Crear mi cuenta
                  <FiArrowRight />
               </Link>
            </motion.div>
         </motion.section>

         <div className="uv-paper-colophon">
            <span>FIN DE LA EDICIÓN</span>
         </div>
      </div>
   );
}