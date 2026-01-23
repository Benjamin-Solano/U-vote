import "./home.css";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { FiPlus, FiBarChart2, FiShare2 } from "react-icons/fi";

const fadeUp = {
   hidden: { opacity: 0, y: 14 },
   show: { opacity: 1, y: 0 },
};

function Home() {
   return (
      <main className="uv-home">
         <div className="container">
            <motion.section
               className="uv-hero"
               initial="hidden"
               animate="show"
               variants={fadeUp}
               transition={{ duration: 0.35, ease: "easeOut" }}
            >
               <h1 className="uv-hero-title">Crea encuestas de forma simple</h1>
               <p className="uv-hero-sub">
                  Diseña, comparte y analiza encuestas en minutos. Minimalista, claro y enfocado en lo importante.
               </p>

               <div className="uv-hero-actions">
                  <Link className="btn btn-primary pill" to="/login">
                     Comenzar
                  </Link>
                  <Link className="btn pill" to="/about">
                     Ver About
                  </Link>
               </div>
            </motion.section>

            <section className="uv-features">
               <motion.h2
                  className="uv-section-title"
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.4 }}
                  transition={{ duration: 0.3, ease: "easeOut" }}
               >
                  ¿Por qué elegirnos?
               </motion.h2>

               <motion.div
                  className="uv-grid"
                  initial="hidden"
                  whileInView="show"
                  viewport={{ once: true, amount: 0.25 }}
                  transition={{ staggerChildren: 0.08 }}
               >
                  <motion.article className="card uv-feature" variants={fadeUp} transition={{ duration: 0.3 }}>
                     <div className="uv-feature-icon">
                        <FiPlus />
                     </div>
                     <div>
                        <h3 className="uv-feature-title">Fácil de usar</h3>
                        <p className="uv-feature-text">
                           Interfaz clara para crear encuestas sin complicaciones.
                        </p>
                     </div>
                  </motion.article>

                  <motion.article className="card uv-feature" variants={fadeUp} transition={{ duration: 0.3 }}>
                     <div className="uv-feature-icon">
                        <FiBarChart2 />
                     </div>
                     <div>
                        <h3 className="uv-feature-title">Análisis detallado</h3>
                        <p className="uv-feature-text">
                           Resultados y métricas listos para tomar decisiones.
                        </p>
                     </div>
                  </motion.article>

                  <motion.article className="card uv-feature" variants={fadeUp} transition={{ duration: 0.3 }}>
                     <div className="uv-feature-icon">
                        <FiShare2 />
                     </div>
                     <div>
                        <h3 className="uv-feature-title">Comparte fácilmente</h3>
                        <p className="uv-feature-text">
                           Comparte por enlace y empieza a recolectar votos.
                        </p>
                     </div>
                  </motion.article>
               </motion.div>
            </section>
         </div>
      </main>
   );
}

export default Home;
