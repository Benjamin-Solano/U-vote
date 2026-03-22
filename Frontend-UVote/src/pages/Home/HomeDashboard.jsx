import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import {
   FiCheckCircle,
   FiChevronLeft,
   FiChevronRight,
   FiClock,
   FiLayers,
   FiPlayCircle,
   FiTrendingUp,
   FiUsers,
} from "react-icons/fi";

import { useAuth } from "../../auth/useAuth";
import { pollsApi } from "../../api/polls.api";
import {
   PAGE_SIZE,
   buildPollMetrics,
   formatDateShort,
   getPollStatus,
   getPollTotalVotes,
   paginate,
} from "../../utils/home.utils";

function StatCard({ icon, label, value, hint, tone }) {
   return (
      <article className={`uv-stat-card uv-stat-card--${tone}`}>
         <div className={`uv-stat-card-icon uv-stat-card-icon--${tone}`}>{icon}</div>

         <div className="uv-stat-card-body">
            <span className="uv-stat-card-label">{label}</span>
            <strong className="uv-stat-card-value">{value}</strong>
            <small className="uv-stat-card-hint">{hint}</small>
         </div>
      </article>
   );
}

function TablePagination({ page, totalPages, setPage }) {
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
}

export default function HomeDashboard() {
   const navigate = useNavigate();
   const { usuario } = useAuth();

   const [polls, setPolls] = useState([]);
   const [loadingPolls, setLoadingPolls] = useState(true);
   const [pollsError, setPollsError] = useState("");

   const [createdPage, setCreatedPage] = useState(1);
   const [votedPage, setVotedPage] = useState(1);
   const [currentMetricIndex, setCurrentMetricIndex] = useState(0);
   const [direction, setDirection] = useState(1);

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

            if (!ignore) setPolls(data);
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

   useEffect(() => {
      if (currentMetricIndex > Math.max(0, myCreatedPolls.length - 1)) {
         setCurrentMetricIndex(Math.max(0, myCreatedPolls.length - 1));
      }
   }, [currentMetricIndex, myCreatedPolls.length]);

   const stats = useMemo(() => {
      const base = {
         total: myCreatedPolls.length,
         open: 0,
         pending: 0,
         closed: 0,
      };

      myCreatedPolls.forEach((poll) => {
         const status = getPollStatus(poll);

         if (status.key === "open") base.open += 1;
         if (status.key === "pending") base.pending += 1;
         if (status.key === "closed") base.closed += 1;
      });

      return base;
   }, [myCreatedPolls]);

   const metricPoll = myCreatedPolls[currentMetricIndex] ?? null;
   const metricData = buildPollMetrics(metricPoll);

   const handlePrevMetric = () => {
      setDirection(-1);
      setCurrentMetricIndex((prev) =>
         prev === 0 ? myCreatedPolls.length - 1 : prev - 1
      );
   };

   const handleNextMetric = () => {
      setDirection(1);
      setCurrentMetricIndex((prev) =>
         prev === myCreatedPolls.length - 1 ? 0 : prev + 1
      );
   };

   return (
      <section className="uv-dashboard-shell">
         <div className="uv-dashboard">
            <div className="uv-dashboard-stats">
               <StatCard
                  icon={<FiLayers />}
                  label="Votaciones creadas"
                  value={stats.total}
                  hint="Total acumulado"
                  tone="total"
               />
               <StatCard
                  icon={<FiPlayCircle />}
                  label="Votaciones activas"
                  value={stats.open}
                  hint="Actualmente en curso"
                  tone="open"
               />
               <StatCard
                  icon={<FiClock />}
                  label="Votaciones pendientes"
                  value={stats.pending}
                  hint="Aún no inician"
                  tone="pending"
               />
               <StatCard
                  icon={<FiCheckCircle />}
                  label="Votaciones cerradas"
                  value={stats.closed}
                  hint="Ya finalizadas"
                  tone="closed"
               />
            </div>

            <div className="uv-dashboard-main">
               <div className="uv-dashboard-main-left">
                  <section className="uv-dashboard-panel">
                     <div className="uv-dashboard-panel-head">
                        <div>
                           <h2>Votaciones creadas</h2>
                           <p>Tabla con tus votaciones más recientes.</p>
                        </div>
                     </div>

                     {loadingPolls ? (
                        <div className="uv-home-table-skeleton-wrap">
                           {Array.from({ length: 4 }).map((_, i) => (
                              <div key={i} className="uv-home-table-skeleton" />
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
                           <div className="uv-dashboard-table-wrap">
                              <table className="uv-dashboard-table">
                                 <thead>
                                    <tr>
                                       <th>Nombre</th>
                                       <th>Estado</th>
                                       <th>Inicio</th>
                                       <th>Cierre</th>
                                       <th>Votos</th>
                                       <th>Acción</th>
                                    </tr>
                                 </thead>
                                 <tbody>
                                    {createdPageItems.map((poll) => {
                                       const status = getPollStatus(poll);

                                       return (
                                          <tr key={poll.id}>
                                             <td>
                                                <div className="uv-dashboard-table-main">
                                                   <strong>{poll?.nombre || "Sin nombre"}</strong>
                                                   <span>
                                                      {poll?.descripcion || "Sin descripción."}
                                                   </span>
                                                </div>
                                             </td>
                                             <td>
                                                <span
                                                   className={`uv-home-mini-pill uv-home-mini-pill--${status.key}`}
                                                >
                                                   {status.label}
                                                </span>
                                             </td>
                                             <td>{formatDateShort(poll?.fechaInicio)}</td>
                                             <td>{formatDateShort(poll?.fechaCierre)}</td>
                                             <td>{getPollTotalVotes(poll)}</td>
                                             <td>
                                                <button
                                                   type="button"
                                                   className="uv-dashboard-inline-btn"
                                                   onClick={() =>
                                                      navigate(`/encuestas/${poll.id}`)
                                                   }
                                                >
                                                   Ver
                                                </button>
                                             </td>
                                          </tr>
                                       );
                                    })}
                                 </tbody>
                              </table>
                           </div>

                           <TablePagination
                              page={createdPage}
                              totalPages={createdTotalPages}
                              setPage={setCreatedPage}
                           />
                        </>
                     )}
                  </section>

                  <section className="uv-dashboard-panel">
                     <div className="uv-dashboard-panel-head">
                        <div>
                           <h2>Votaciones en las que participaste</h2>
                           <p>Tabla con tus participaciones registradas.</p>
                        </div>
                     </div>

                     {loadingPolls ? (
                        <div className="uv-home-table-skeleton-wrap">
                           {Array.from({ length: 4 }).map((_, i) => (
                              <div key={i} className="uv-home-table-skeleton" />
                           ))}
                        </div>
                     ) : pollsError ? (
                        <div className="uv-home-alert">{pollsError}</div>
                     ) : myVotedPolls.length === 0 ? (
                        <div className="uv-home-empty-box">
                           Aún no has participado en otras votaciones.
                        </div>
                     ) : (
                        <>
                           <div className="uv-dashboard-table-wrap">
                              <table className="uv-dashboard-table">
                                 <thead>
                                    <tr>
                                       <th>Nombre</th>
                                       <th>Estado</th>
                                       <th>Fecha</th>
                                       <th>Detalle</th>
                                    </tr>
                                 </thead>
                                 <tbody>
                                    {votedPageItems.map((poll) => {
                                       const status = getPollStatus(poll);

                                       return (
                                          <tr key={poll.id}>
                                             <td>
                                                <div className="uv-dashboard-table-main">
                                                   <strong>{poll?.nombre || "Sin nombre"}</strong>
                                                   <span>
                                                      {poll?.campusNombre || "Sin campus"} ·{" "}
                                                      {poll?.carreraNombre || "Sin carrera"}
                                                   </span>
                                                </div>
                                             </td>
                                             <td>
                                                <span
                                                   className={`uv-home-mini-pill uv-home-mini-pill--${status.key}`}
                                                >
                                                   {status.label}
                                                </span>
                                             </td>
                                             <td>{formatDateShort(poll?.fechaInicio)}</td>
                                             <td>
                                                <button
                                                   type="button"
                                                   className="uv-dashboard-inline-btn"
                                                   onClick={() =>
                                                      navigate(`/encuestas/${poll.id}`)
                                                   }
                                                >
                                                   Abrir
                                                </button>
                                             </td>
                                          </tr>
                                       );
                                    })}
                                 </tbody>
                              </table>
                           </div>

                           <TablePagination
                              page={votedPage}
                              totalPages={votedTotalPages}
                              setPage={setVotedPage}
                           />
                        </>
                     )}
                  </section>
               </div>

               <aside className="uv-dashboard-main-right">
                  <section className="uv-dashboard-panel uv-dashboard-panel--metrics">
                     <div className="uv-dashboard-panel-head">
                        <div>
                           <h2>Métricas de tus votaciones</h2>
                           <p>Carrusel con resultados de tus votaciones creadas.</p>
                        </div>

                        {myCreatedPolls.length > 1 ? (
                           <div className="uv-metrics-nav">
                              <button
                                 type="button"
                                 className="uv-metrics-nav-btn"
                                 onClick={handlePrevMetric}
                              >
                                 <FiChevronLeft />
                              </button>

                              <button
                                 type="button"
                                 className="uv-metrics-nav-btn"
                                 onClick={handleNextMetric}
                              >
                                 <FiChevronRight />
                              </button>
                           </div>
                        ) : null}
                     </div>

                     {loadingPolls ? (
                        <div className="uv-home-table-skeleton-wrap">
                           {Array.from({ length: 3 }).map((_, i) => (
                              <div key={i} className="uv-home-table-skeleton" />
                           ))}
                        </div>
                     ) : pollsError ? (
                        <div className="uv-home-alert">{pollsError}</div>
                     ) : !metricData ? (
                        <div className="uv-home-empty-box">
                           Cuando crees votaciones, aquí podrás ver sus métricas.
                        </div>
                     ) : (
                        <>
                           <div className="uv-metrics-carousel">
                              <AnimatePresence mode="wait" custom={direction}>
                                 <motion.div
                                    key={metricData.poll?.id || currentMetricIndex}
                                    className="uv-metrics-slide"
                                    custom={direction}
                                    initial={{
                                       opacity: 0,
                                       x: direction > 0 ? 52 : -52,
                                    }}
                                    animate={{
                                       opacity: 1,
                                       x: 0,
                                    }}
                                    exit={{
                                       opacity: 0,
                                       x: direction > 0 ? -52 : 52,
                                    }}
                                    transition={{ duration: 0.28, ease: "easeOut" }}
                                 >
                                    <div className="uv-metrics-hero">
                                       <div className="uv-metrics-hero-main">
                                          <span
                                             className={`uv-home-mini-pill uv-home-mini-pill--${metricData.status.key}`}
                                          >
                                             {metricData.status.label}
                                          </span>

                                          <h3>{metricData.poll?.nombre || "Sin nombre"}</h3>

                                          <p>
                                             {metricData.poll?.descripcion ||
                                                "Sin descripción para esta votación."}
                                          </p>
                                       </div>

                                       <div className="uv-metrics-hero-meta">
                                          <div className="uv-metrics-mini-stat">
                                             <span>Total de votos</span>
                                             <strong>{metricData.totalVotes}</strong>
                                          </div>

                                          <div className="uv-metrics-mini-stat">
                                             <span>Opción líder</span>
                                             <strong>
                                                {metricData.leader?.label || "Sin datos"}
                                             </strong>
                                          </div>
                                       </div>
                                    </div>

                                    <div className="uv-metrics-summary-grid">
                                       <div className="uv-metrics-summary-card">
                                          <span>Inicio</span>
                                          <strong>
                                             {formatDateShort(metricData.poll?.fechaInicio)}
                                          </strong>
                                       </div>

                                       <div className="uv-metrics-summary-card">
                                          <span>Cierre</span>
                                          <strong>
                                             {formatDateShort(metricData.poll?.fechaCierre)}
                                          </strong>
                                       </div>

                                       <div className="uv-metrics-summary-card">
                                          <span>Opciones</span>
                                          <strong>{metricData.options.length}</strong>
                                       </div>
                                    </div>

                                    <div className="uv-metrics-chart">
                                       {metricData.options.length === 0 ? (
                                          <div className="uv-home-empty-box">
                                             Esta votación no tiene datos de opciones para graficar aún.
                                          </div>
                                       ) : (
                                          metricData.options.map((option) => (
                                             <div className="uv-metrics-bar-row" key={option.id}>
                                                <div className="uv-metrics-bar-head">
                                                   <span>{option.label}</span>
                                                   <strong>
                                                      {option.votes} voto
                                                      {option.votes === 1 ? "" : "s"} ·{" "}
                                                      {option.percent}%
                                                   </strong>
                                                </div>

                                                <div className="uv-metrics-bar-track">
                                                   <div
                                                      className="uv-metrics-bar-fill"
                                                      style={{
                                                         width: `${option.percent}%`,
                                                      }}
                                                   />
                                                </div>
                                             </div>
                                          ))
                                       )}
                                    </div>
                                 </motion.div>
                              </AnimatePresence>
                           </div>

                           {myCreatedPolls.length > 1 ? (
                              <div className="uv-metrics-dots">
                                 {myCreatedPolls.map((poll, index) => (
                                    <button
                                       key={poll.id}
                                       type="button"
                                       className={`uv-metrics-dot ${
                                          currentMetricIndex === index ? "is-active" : ""
                                       }`}
                                       onClick={() => {
                                          setDirection(index > currentMetricIndex ? 1 : -1);
                                          setCurrentMetricIndex(index);
                                       }}
                                       aria-label={`Ver métricas de ${poll?.nombre || "votación"}`}
                                    />
                                 ))}
                              </div>
                           ) : null}
                        </>
                     )}
                  </section>
               </aside>
            </div>
         </div>
      </section>
   );
}