import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
   FiActivity,
   FiBarChart2,
   FiCheckCircle,
   FiGrid,
   FiPlus,
   FiSend,
   FiStar,
   FiTrendingUp,
   FiUsers,
} from "react-icons/fi";

const container = {
   hidden: {},
   show: {
      transition: {
         staggerChildren: 0.08,
      },
   },
};

const fadeUp = {
   hidden: { opacity: 0, y: 18 },
   show: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.35, ease: "easeOut" },
   },
};

export default function HomeLanding() {
   return (
      <>
         <section className="uv-home-hero">
            <motion.div
               className="uv-home-hero-grid"
               initial="hidden"
               animate="show"
               variants={container}
            >
               <motion.div className="uv-home-hero-copy" variants={fadeUp}>
                  <span className="uv-home-eyebrow">
                     <FiStar />
                     Plataforma universitaria de votaciones
                  </span>

                  <h1 className="uv-home-main-title">
                     Crea, comparte y analiza votaciones con una experiencia clara y moderna.
                  </h1>

                  <p className="uv-home-main-sub">
                     U-Vote te permite lanzar votaciones en minutos, compartirlas fácilmente
                     y visualizar resultados de forma profesional, ordenada y simple.
                  </p>

                  <div className="uv-home-main-actions">
                     <Link className="btn btn-primary pill" to="/register">
                        Comenzar
                     </Link>

                     <Link className="btn btn-secondary pill" to="/login">
                        Iniciar sesión
                     </Link>
                  </div>

                  <div className="uv-home-hero-inline">
                     <div className="uv-home-inline-chip">
                        <FiCheckCircle />
                        Creación rápida
                     </div>
                     <div className="uv-home-inline-chip">
                        <FiSend />
                        Compartir por enlace
                     </div>
                     <div className="uv-home-inline-chip">
                        <FiBarChart2 />
                        Métricas visuales
                     </div>
                  </div>
               </motion.div>

               <motion.div className="uv-home-hero-preview" variants={fadeUp}>
                  <div className="uv-home-preview-window">
                     <div className="uv-home-preview-topbar">
                        <span />
                        <span />
                        <span />
                     </div>

                     <div className="uv-home-preview-body">
                        <div className="uv-home-preview-panel uv-home-preview-panel--hero">
                           <div className="uv-home-preview-text">
                              <div className="uv-home-preview-line uv-home-preview-line--lg" />
                              <div className="uv-home-preview-line uv-home-preview-line--sm" />
                           </div>
                           <div className="uv-home-preview-art" />
                        </div>

                        <div className="uv-home-preview-panel">
                           <div className="uv-home-preview-mini-cards">
                              <div className="uv-home-preview-mini-card" />
                              <div className="uv-home-preview-mini-card" />
                              <div className="uv-home-preview-mini-card" />
                           </div>
                        </div>

                        <div className="uv-home-preview-panel">
                           <div className="uv-home-preview-table">
                              <div className="uv-home-preview-row" />
                              <div className="uv-home-preview-row" />
                              <div className="uv-home-preview-row" />
                           </div>
                        </div>
                     </div>
                  </div>
               </motion.div>
            </motion.div>
         </section>

         <section className="uv-home-section">
            <div className="uv-home-section-head">
               <span className="uv-home-section-kicker">Beneficios</span>
               <h2 className="uv-home-section-title">
                  Enfocados en resolver la gestión de votaciones de forma simple.
               </h2>
               <p className="uv-home-section-sub">
                  U-Vote reduce fricción tanto para quien crea como para quien participa.
               </p>
            </div>

            <motion.div
               className="uv-home-benefits-grid"
               variants={container}
               initial="hidden"
               whileInView="show"
               viewport={{ once: true, amount: 0.2 }}
            >
               <motion.article className="uv-home-info-card" variants={fadeUp}>
                  <div className="uv-home-info-icon">
                     <FiPlus />
                  </div>
                  <h3>Creación intuitiva</h3>
                  <p>
                     Diseña votaciones con campos claros, fechas definidas y opciones bien organizadas.
                  </p>
               </motion.article>

               <motion.article className="uv-home-info-card" variants={fadeUp}>
                  <div className="uv-home-info-icon">
                     <FiUsers />
                  </div>
                  <h3>Participación sencilla</h3>
                  <p>
                     Facilita que tus usuarios encuentren, entiendan y emitan su voto rápidamente.
                  </p>
               </motion.article>

               <motion.article className="uv-home-info-card" variants={fadeUp}>
                  <div className="uv-home-info-icon">
                     <FiTrendingUp />
                  </div>
                  <h3>Resultados comprensibles</h3>
                  <p>
                     Observa métricas y tendencias sin complicaciones, con una lectura visual directa.
                  </p>
               </motion.article>
            </motion.div>
         </section>

         <section className="uv-home-section uv-home-section--alt">
            <div className="uv-home-section-head">
               <span className="uv-home-section-kicker">Prueba social</span>
               <h2 className="uv-home-section-title">
                  Diseñado para transmitir orden, confianza y claridad.
               </h2>
               <p className="uv-home-section-sub">
                  Una experiencia limpia genera más participación y mejor percepción del sistema.
               </p>
            </div>

            <div className="uv-home-social-grid">
               <article className="uv-home-social-card">
                  <div className="uv-home-social-badge">
                     <FiUsers />
                     Participación clara
                  </div>
                  <p>
                     “La interfaz permite entender rápido qué votar y cómo seguir el resultado.”
                  </p>
               </article>

               <article className="uv-home-social-card">
                  <div className="uv-home-social-badge">
                     <FiActivity />
                     Métricas visibles
                  </div>
                  <p>
                     “La lectura de estados, fechas y resultados mejora la administración de cada votación.”
                  </p>
               </article>

               <article className="uv-home-social-card">
                  <div className="uv-home-social-badge">
                     <FiCheckCircle />
                     Flujo ordenado
                  </div>
                  <p>
                     “La estética minimalista de U-Vote ayuda a concentrarse en la acción principal: votar.”
                  </p>
               </article>
            </div>
         </section>

         <section className="uv-home-section">
            <div className="uv-home-section-head">
               <span className="uv-home-section-kicker">Servicio / Producto</span>
               <h2 className="uv-home-section-title">
                  Lo esencial para administrar votaciones desde una sola plataforma.
               </h2>
            </div>

            <div className="uv-home-services-grid">
               <article className="uv-home-service-card">
                  <div className="uv-home-service-icon">
                     <FiGrid />
                  </div>
                  <h3>Crear votaciones</h3>
                  <p>
                     Configura nombre, descripción, fechas y opciones en una interfaz enfocada en productividad.
                  </p>
               </article>

               <article className="uv-home-service-card">
                  <div className="uv-home-service-icon">
                     <FiSend />
                  </div>
                  <h3>Compartir y participar</h3>
                  <p>
                     Lleva la votación a otros usuarios de manera directa y sin pasos innecesarios.
                  </p>
               </article>

               <article className="uv-home-service-card">
                  <div className="uv-home-service-icon">
                     <FiBarChart2 />
                  </div>
                  <h3>Analizar resultados</h3>
                  <p>
                     Consulta estados, totales y comportamiento de tus votaciones con métricas visuales.
                  </p>
               </article>
            </div>
         </section>

         <section className="uv-home-cta">
            <div className="uv-home-cta-content">
               <div>
                  <span className="uv-home-section-kicker">Llamado a la acción</span>
                  <h2>Empieza a crear votaciones con U-Vote.</h2>
                  <p>
                     Centraliza tus procesos de votación en una experiencia moderna, clara y persuasiva.
                  </p>
               </div>

               <div className="uv-home-cta-actions">
                  <Link className="btn btn-primary pill" to="/register">
                     Comenzar
                  </Link>
               </div>
            </div>
         </section>
      </>
   );
}