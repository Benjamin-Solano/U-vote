import "./home.css";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
   FiBarChart2,
   FiChevronLeft,
   FiChevronRight,
   FiPlus,
   FiShare2,
} from "react-icons/fi";
import { useEffect, useMemo, useState } from "react";

import { useAuth } from "../../auth/useAuth";
import { pollsApi } from "../../api/polls.api";

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

const PAGE_SIZE = 5;

function getPollStatus(poll) {
   const now = new Date();

   const inicio = poll?.fechaInicio ? new Date(poll.fechaInicio) : null;
   const cierre = poll?.fechaCierre ? new Date(poll.fechaCierre) : null;

   if (inicio && !Number.isNaN(inicio.getTime()) && now < inicio) {
      return { key: "pending", label: "Pendiente" };
   }

   if (cierre && !Number.isNaN(cierre.getTime()) && now >= cierre) {
      return { key: "closed", label: "Cerrada" };
   }

   return { key: "open", label: "Activa" };
}

function formatDateShort(value) {
   if (!value) return "—";
   const d = new Date(value);
   if (Number.isNaN(d.getTime())) return "—";
   return d.toLocaleDateString();
}

function paginate(items, page, pageSize) {
   const start = (page - 1) * pageSize;
   return items.slice(start, start + pageSize);
}

export default function Home() {
   const navigate = useNavigate();
   const { isAuthenticated, usuario } = useAuth();

   const [polls, setPolls] = useState([]);
   const [loadingPolls, setLoadingPolls] = useState(true);
   const [pollsError, setPollsError] = useState("");

   const [createdPage, setCreatedPage] = useState(1);
   const [votedPage, setVotedPage] = useState(1);

   const authUserId = useMemo(() => usuario?.id ?? usuario?.usuarioId ?? null, [usuario]);

   useEffect(() => {
      let ignore = false;

      const loadPolls = async () => {
         setLoadingPolls(true);
         setPollsError("");

         try {
            const res =
               typeof pollsApi.list === "function"
                  ? await pollsApi.list()
                  : await pollsApi.getAll();

            const data = Array.isArray(res?.data) ? res.data : [];

            if (!ignore) {
               setPolls(data);
            }
         } catch (err) {
            if (!ignore) {
               setPolls([]);
               setPollsError(
                  err?.response?.data?.message ||
                  "No se pudieron cargar las votaciones."
               );
            }
         } finally {
            if (!ignore) setLoadingPolls(false);
         }
      };

      loadPolls();

      return () => {
         ignore = true;
      };
   }, []);

   const myCreatedPolls = useMemo(() => {
      if (!authUserId) return [];
      return polls
         .filter((poll) => Number(poll?.usuarioId) === Number(authUserId))
         .sort((a, b) => Number(b?.id || 0) - Number(a?.id || 0));
   }, [polls, authUserId]);

   const myVotedPolls = useMemo(() => {
      if (!authUserId) return [];
      return polls
         .filter(
            (poll) =>
               Boolean(poll?.yaVoto) &&
               Number(poll?.usuarioId) !== Number(authUserId)
         )
         .sort((a, b) => Number(b?.id || 0) - Number(a?.id || 0));
   }, [polls, authUserId]);

   const createdTotalPages = useMemo(
      () => Math.max(1, Math.ceil(myCreatedPolls.length / PAGE_SIZE)),
      [myCreatedPolls.length]
   );

   const votedTotalPages = useMemo(
      () => Math.max(1, Math.ceil(myVotedPolls.length / PAGE_SIZE)),
      [myVotedPolls.length]
   );

   const createdPageItems = useMemo(
      () => paginate(myCreatedPolls, createdPage, PAGE_SIZE),
      [myCreatedPolls, createdPage]
   );

   const votedPageItems = useMemo(
      () => paginate(myVotedPolls, votedPage, PAGE_SIZE),
      [myVotedPolls, votedPage]
   );

   useEffect(() => {
      if (createdPage > createdTotalPages) setCreatedPage(createdTotalPages);
   }, [createdPage, createdTotalPages]);

   useEffect(() => {
      if (votedPage > votedTotalPages) setVotedPage(votedTotalPages);
   }, [votedPage, votedTotalPages]);

   const renderPagination = (page, totalPages, setPage) => {
      if (totalPages <= 1) return null;

      return (
         <div className="uv-home-pagination">
            <button
               type="button"
               className="uv-home-page-btn"
               onClick={() => setPage((p) => Math.max(1, p - 1))}
               disabled={page === 1}
            >
               <FiChevronLeft />
               Anterior
            </button>

            <div className="uv-home-page-info">
               Página <strong>{page}</strong> de <strong>{totalPages}</strong>
            </div>

            <button
               type="button"
               className="uv-home-page-btn"
               onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
               disabled={page === totalPages}
            >
               Siguiente
               <FiChevronRight />
            </button>
         </div>
      );
   };

   return (
      <main className="uv-home">
         <div className="container">
            <motion.section
               className="uv-hero"
               initial="hidden"
               animate="show"
               variants={fadeUp}
            >
               <h1 className="uv-hero-title">Crea votaciones de forma simple</h1>
               <p className="uv-hero-sub">
                  Diseña, comparte y analiza votaciones en minutos. Claro, rápido y sin distracciones.
               </p>

               <div className="uv-hero-actions">
                  <Link className="btn btn-primary pill" to="/encuestas/crear">
                     Comenzar
                  </Link>
               </div>

               <div className="uv-hero-note">
                  <span className="uv-hero-note-dot" />
                  Crea una votación, comparte el enlace y visualiza estadísticas en tiempo real.
               </div>
            </motion.section>

            {isAuthenticated && (
               <section className="uv-home-personal">
                  <div className="uv-home-personal-grid">
                     <div className="uv-home-personal-box">
                        <div className="uv-home-block-head">
                           <div>
                              <h2 className="uv-section-title uv-section-title-left">
                                 <FiPlus />
                                 Votaciones creadas por mí
                              </h2>
                              <p className="uv-home-block-sub">
                                 Tus votaciones más recientes.
                              </p>
                           </div>
                        </div>

                        {loadingPolls ? (
                           <div className="uv-home-mini-list">
                              {Array.from({ length: 3 }).map((_, i) => (
                                 <div key={i} className="uv-home-mini-item uv-home-mini-item--skeleton" />
                              ))}
                           </div>
                        ) : pollsError ? (
                           <div className="uv-home-alert">{pollsError}</div>
                        ) : myCreatedPolls.length === 0 ? (
                           <div className="uv-home-empty-box">
                              Aún no has creado votaciones.
                           </div>
                        ) : (
                           <>
                              <div className="uv-home-mini-list">
                                 {createdPageItems.map((poll) => {
                                    const status = getPollStatus(poll);

                                    return (
                                       <button
                                          key={poll.id}
                                          type="button"
                                          className="uv-home-mini-item"
                                          onClick={() => navigate(`/encuestas/${poll.id}`)}
                                       >
                                          <div className="uv-home-mini-main">
                                             <strong>{poll.nombre}</strong>
                                             <span>{poll?.descripcion || "Sin descripción."}</span>
                                          </div>

                                          <div className="uv-home-mini-side">
                                             <span className={`uv-home-mini-pill uv-home-mini-pill--${status.key}`}>
                                                {status.label}
                                             </span>
                                             <small>{formatDateShort(poll?.fechaInicio)}</small>
                                          </div>
                                       </button>
                                    );
                                 })}
                              </div>

                              {renderPagination(createdPage, createdTotalPages, setCreatedPage)}
                           </>
                        )}
                     </div>

                     <div className="uv-home-personal-box">
                        <div className="uv-home-block-head">
                           <div>
                              <h2 className="uv-section-title uv-section-title-left">
                                 <FiBarChart2 />
                                 Votaciones en las que he votado
                              </h2>
                              <p className="uv-home-block-sub">
                                 Actividad reciente de tus participaciones.
                              </p>
                           </div>
                        </div>

                        {loadingPolls ? (
                           <div className="uv-home-mini-list">
                              {Array.from({ length: 3 }).map((_, i) => (
                                 <div key={i} className="uv-home-mini-item uv-home-mini-item--skeleton" />
                              ))}
                           </div>
                        ) : pollsError ? (
                           <div className="uv-home-alert">{pollsError}</div>
                        ) : myVotedPolls.length === 0 ? (
                           <div className="uv-home-empty-box">
                              Aún no has votado en votaciones.
                           </div>
                        ) : (
                           <>
                              <div className="uv-home-mini-list">
                                 {votedPageItems.map((poll) => {
                                    const status = getPollStatus(poll);

                                    return (
                                       <button
                                          key={poll.id}
                                          type="button"
                                          className="uv-home-mini-item"
                                          onClick={() => navigate(`/encuestas/${poll.id}`)}
                                       >
                                          <div className="uv-home-mini-main">
                                             <strong>{poll.nombre}</strong>
                                             <span>
                                                {poll?.campusNombre || "Sin campus"} · {poll?.carreraNombre || "Sin carrera"}
                                             </span>
                                          </div>

                                          <div className="uv-home-mini-side">
                                             <span className={`uv-home-mini-pill uv-home-mini-pill--${status.key}`}>
                                                {status.label}
                                             </span>
                                             <small>Ya votaste</small>
                                          </div>
                                       </button>
                                    );
                                 })}
                              </div>

                              {renderPagination(votedPage, votedTotalPages, setVotedPage)}
                           </>
                        )}
                     </div>
                  </div>
               </section>
            )}

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
                           Publica votaciones en minutos con una interfaz clara.
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