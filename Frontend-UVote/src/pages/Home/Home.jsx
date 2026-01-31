import "./home.css";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { FiPlus, FiShare2, FiBarChart2 } from "react-icons/fi";

const container = {
   hidden: {},
   show: {
      transition: {
         staggerChildren: 0.08,
      },
   },
};

const fadeUp = {
   hidden: { opacity: 0, y: 14 },
   show: { opacity: 1, y: 0, transition: { duration: 0.35, ease: "easeOut" } },
};

export default function Home() {
   return (
      <main className="uv-home">
         <div className="container">
            {/* ================= HERO ================= */}
            <motion.section
               className="uv-hero"
               initial="hidden"
               animate="show"
               variants={fadeUp}
            >
               <h1 className="uv-hero-title">Crea encuestas de forma simple</h1>
               <p className="uv-hero-sub">
                  Diseña, comparte y analiza encuestas en minutos. Claro, rápido y sin distracciones.
               </p>

               <div className="uv-hero-actions">
                  <Link className="btn btn-primary pill" to="/encuestas/crear">
                     Comenzar
                  </Link>
               </div>

               <div className="uv-hero-note">
                  <span className="uv-hero-note-dot" />
                  Crea una encuesta, comparte el enlace y visualiza estadísticas en tiempo real.
               </div>
            </motion.section>

            {/* ================= FEATURES ================= */}
            <section className="uv-features">
               <motion.h2
                  className="uv-section-title"
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.4 }}
                  transition={{ duration: 0.3, ease: "easeOut" }}
               >
                  ¿Por qué usar U-Vote?
               </motion.h2>

               <motion.div
                  className="uv-grid"
                  variants={container}
                  initial="hidden"
                  whileInView="show"
                  viewport={{ once: true, amount: 0.25 }}
               >
                  <motion.article className="uv-feature dark" variants={fadeUp} tabIndex={0}>
                     <div className="uv-feature-icon dark">
                        <FiPlus />
                     </div>
                     <div>
                        <h3 className="uv-feature-title">Creación rápida</h3>
                        <p className="uv-feature-text">
                           Publica encuestas en minutos con una interfaz clara.
                        </p>
                     </div>
                  </motion.article>

                  <motion.article className="uv-feature dark" variants={fadeUp} tabIndex={0}>
                     <div className="uv-feature-icon dark">
                        <FiShare2 />
                     </div>
                     <div>
                        <h3 className="uv-feature-title">Comparte fácilmente</h3>
                        <p className="uv-feature-text">
                           Llega a mas personas compartiendo un solo link.
                        </p>
                     </div>
                  </motion.article>

                  <motion.article className="uv-feature dark" variants={fadeUp} tabIndex={0}>
                     <div className="uv-feature-icon dark">
                        <FiBarChart2 />
                     </div>
                     <div>
                        <h3 className="uv-feature-title">Resultados claros</h3>
                        <p className="uv-feature-text">
                           Visualiza estadísticas y tendencias de forma intuitiva.
                        </p>
                     </div>
                  </motion.article>
               </motion.div>

            </section>
         </div>
      </main>
   );
}
