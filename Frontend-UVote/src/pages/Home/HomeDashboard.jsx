import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import {
   FiCheckCircle,
   FiChevronLeft,
   FiChevronRight,
   FiClock,
   FiLayers,
   FiPieChart,
   FiBarChart2,
   FiPlayCircle,
   FiTrendingUp,
   FiEdit3,
   FiThumbsUp,
} from "react-icons/fi";

import { useAuth } from "../../auth/useAuth";
import { pollsApi } from "../../api/polls.api";
import { votesApi } from "../../api/votes.api";
import {
   PAGE_SIZE,
   formatDateShort,
   getPollStatus,
   paginate,
} from "../../utils/home.utils";
import { extractList } from "../../utils/api.utils";

import {
   StatCard,
   TablePagination,
   DashboardGreeting,
   MetricsPieChart,
   MetricsBarChart,
   MonthlyCalendar,
} from "./components";

/* =========================================================
   HomeDashboard – componente principal
   ========================================================= */

export default function HomeDashboard() {
   const navigate = useNavigate();
   const { usuario } = useAuth();

   /* ---- Estado ---- */
   const [polls, setPolls] = useState([]);
   const [loadingPolls, setLoadingPolls] = useState(true);
   const [pollsError, setPollsError] = useState("");

   const [createdPage, setCreatedPage] = useState(1);
   const [votedPage, setVotedPage] = useState(1);
   const [currentMetricIndex, setCurrentMetricIndex] = useState(0);
   const [direction, setDirection] = useState(1);
   const [chartType, setChartType] = useState("bar");
   const [currentTime, setCurrentTime] = useState(new Date());

   const [metricResults, setMetricResults] = useState([]);
   const [loadingMetricResults, setLoadingMetricResults] = useState(false);
   const [metricResultsError, setMetricResultsError] = useState("");

   /* ---- Derivados de usuario ---- */
   const authUserId = useMemo(
      () => usuario?.id ?? usuario?.usuarioId ?? null,
      [usuario]
   );

   const userName = useMemo(() => {
      return (
         usuario?.nombre ||
         usuario?.nombreUsuario ||
         usuario?.username ||
         usuario?.correo?.split?.("@")?.[0] ||
         "Usuario"
      );
   }, [usuario]);

   /* ---- Reloj ---- */
   useEffect(() => {
      const timer = setInterval(() => setCurrentTime(new Date()), 60000);
      return () => clearInterval(timer);
   }, []);

   /* ---- Carga de encuestas ---- */
   useEffect(() => {
      let ignore = false;

      const loadPolls = async () => {
         setLoadingPolls(true);
         setPollsError("");

         try {
            const res = await pollsApi.list({ size: 1000 });
            if (!ignore) setPolls(extractList(res?.data));
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

   /* ---- Derivados de encuestas ---- */
   const myCreatedPolls = useMemo(() => {
      if (!authUserId) return [];
      return polls
         .filter((p) => Number(p?.usuarioId) === Number(authUserId))
         .sort((a, b) => Number(b?.id || 0) - Number(a?.id || 0));
   }, [polls, authUserId]);

   const myVotedPolls = useMemo(() => {
      if (!authUserId) return [];
      return polls
         .filter(
            (p) =>
               Boolean(p?.yaVoto) &&
               Number(p?.usuarioId) !== Number(authUserId)
         )
         .sort((a, b) => Number(b?.id || 0) - Number(a?.id || 0));
   }, [polls, authUserId]);

   const nextClosingPoll = useMemo(() => {
      const now = new Date();
      return [...myCreatedPolls]
         .filter((p) => p?.fechaCierre && new Date(p.fechaCierre) > now)
         .sort(
            (a, b) =>
               new Date(a.fechaCierre).getTime() -
               new Date(b.fechaCierre).getTime()
         )[0];
   }, [myCreatedPolls]);

   /* ---- Paginación ---- */
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

   /* ---- Stats ---- */
   const stats = useMemo(() => {
      const base = {
         total: myCreatedPolls.length,
         open: 0,
         pending: 0,
         closed: 0,
      };

      myCreatedPolls.forEach((p) => {
         const s = getPollStatus(p);
         if (s.key === "open") base.open += 1;
         if (s.key === "pending") base.pending += 1;
         if (s.key === "closed") base.closed += 1;
      });

      return base;
   }, [myCreatedPolls]);

   /* ---- Métricas ---- */
   const metricPoll = myCreatedPolls[currentMetricIndex] ?? null;

   useEffect(() => {
      let ignore = false;

      const load = async () => {
         if (!metricPoll?.id) {
            setMetricResults([]);
            setMetricResultsError("");
            return;
         }

         setLoadingMetricResults(true);
         setMetricResultsError("");

         try {
            const res = await votesApi.results(metricPoll.id);
            if (!ignore)
               setMetricResults(Array.isArray(res?.data) ? res.data : []);
         } catch (err) {
            if (!ignore) {
               setMetricResults([]);
               setMetricResultsError(
                  err?.response?.data?.message ||
                     "No se pudieron cargar las métricas."
               );
            }
         } finally {
            if (!ignore) setLoadingMetricResults(false);
         }
      };

      load();
      return () => {
         ignore = true;
      };
   }, [metricPoll?.id]);

   const metricData = useMemo(() => {
      if (!metricPoll) return null;

      const safeResults = Array.isArray(metricResults) ? metricResults : [];

      const normalizedOptions = safeResults.map((item, index) => {
         const votes = Number(
            item?.cantidadVotos ??
               item?.totalVotos ??
               item?.votos ??
               item?.voteCount ??
               item?.cantidad ??
               0
         );

         return {
            id: item?.opcionId ?? item?.id ?? index + 1,
            label:
               item?.opcionNombre ??
               item?.nombre ??
               item?.titulo ??
               item?.descripcion ??
               `Opción ${index + 1}`,
            votes: Number.isFinite(votes) ? votes : 0,
         };
      });

      const totalVotes = normalizedOptions.reduce(
         (acc, o) => acc + o.votes,
         0
      );

      const options = normalizedOptions.map((o) => ({
         ...o,
         percent:
            totalVotes > 0
               ? Math.round((o.votes / totalVotes) * 100)
               : 0,
      }));

      const leader =
         options.length > 0
            ? [...options].sort((a, b) => b.votes - a.votes)[0]
            : null;

      return {
         poll: metricPoll,
         totalVotes,
         options,
         leader,
         status: getPollStatus(metricPoll),
      };
   }, [metricPoll, metricResults]);

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

   /* =========================================================
      Render

      uv-dashboard-main (grid 2 cols)
        ├ LEFT  (flex column)
        │   ├ Métricas + carrusel
        │   └ Calendario compacto
        └ RIGHT (grid 1fr 1fr)
            ├ Votaciones creadas
            └ Participaste
      ========================================================= */

   return (
      <section className="uv-dashboard-shell">
         <div className="uv-dashboard">
            <DashboardGreeting
               userName={userName}
               currentTime={currentTime}
               nextClosingPoll={nextClosingPoll}
            />

            {/* Stats */}
            <div className="uv-dashboard-stats">
               <StatCard icon={<FiLayers />} label="Creadas" value={stats.total} hint="Total" tone="total" />
               <StatCard icon={<FiPlayCircle />} label="Activas" value={stats.open} hint="En curso" tone="open" />
               <StatCard icon={<FiClock />} label="Pendientes" value={stats.pending} hint="Por iniciar" tone="pending" />
               <StatCard icon={<FiCheckCircle />} label="Cerradas" value={stats.closed} hint="Finalizadas" tone="closed" />
            </div>

            {/* Grid principal */}
            <div className="uv-dashboard-main">
               {/* COL IZQ – métricas + calendario */}
               <div className="uv-dashboard-main-left">
                  <section className="uv-dashboard-panel uv-dashboard-panel--metrics uv-dashboard-module">
                     <div className="uv-dashboard-panel-head uv-dashboard-panel-head--metrics">
                        <div>
                           <h2>
                              <FiBarChart2 className="uv-title-icon" />
                              Métricas de tus votaciones
                           </h2>
                           <p>
                              Explora resultados, cambia de visualización y consulta
                              el comportamiento de cada encuesta.
                           </p>
                        </div>

                        <div className="uv-metrics-head-actions">
                           <div className="uv-metrics-chart-switcher">
                              <button
                                 type="button"
                                 className={`uv-metrics-chart-type-btn ${chartType === "bar" ? "is-active" : ""}`}
                                 onClick={() => setChartType("bar")}
                              >
                                 <FiBarChart2 /> Barras
                              </button>
                              <button
                                 type="button"
                                 className={`uv-metrics-chart-type-btn ${chartType === "pie" ? "is-active" : ""}`}
                                 onClick={() => setChartType("pie")}
                              >
                                 <FiPieChart /> Pastel
                              </button>
                           </div>

                           {myCreatedPolls.length > 1 && (
                              <div className="uv-metrics-nav">
                                 <button type="button" className="uv-metrics-nav-btn" onClick={handlePrevMetric}>
                                    <FiChevronLeft />
                                 </button>
                                 <button type="button" className="uv-metrics-nav-btn" onClick={handleNextMetric}>
                                    <FiChevronRight />
                                 </button>
                              </div>
                           )}
                        </div>
                     </div>

                     {loadingPolls || loadingMetricResults ? (
                        <div className="uv-home-table-skeleton-wrap">
                           {Array.from({ length: 3 }).map((_, i) => (
                              <div key={i} className="uv-home-table-skeleton" />
                           ))}
                        </div>
                     ) : pollsError || metricResultsError ? (
                        <div className="uv-home-alert">
                           {pollsError || metricResultsError}
                        </div>
                     ) : !metricData ? (
                        <div className="uv-home-empty-box">
                           Cuando crees votaciones, aquí podrás ver sus métricas.
                        </div>
                     ) : (
                        <>
                           <div className="uv-metrics-carousel">
                              <AnimatePresence mode="wait" custom={direction}>
                                 <motion.div
                                    key={metricData.poll?.id ?? "empty"}
                                    className="uv-metrics-slide"
                                    custom={direction}
                                    initial={{ opacity: 0, x: direction * 40 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: direction * -40 }}
                                    transition={{ duration: 0.28 }}
                                 >
                                    <div className="uv-metrics-layout">
                                       <div className="uv-metrics-hero">
                                          <div className="uv-metrics-hero-main">
                                             <span className={`uv-home-mini-pill uv-home-mini-pill--${metricData.status.key}`}>
                                                {metricData.status.label}
                                             </span>
                                             <h3>{metricData.poll?.nombre || "Sin nombre"}</h3>
                                             <p>{metricData.poll?.descripcion || "Sin descripción disponible."}</p>
                                          </div>

                                          <div className="uv-metrics-hero-meta">
                                             <div className="uv-metrics-mini-stat">
                                                <span>Total de votos</span>
                                                <strong>{metricData.totalVotes}</strong>
                                             </div>
                                             <div className="uv-metrics-mini-stat">
                                                <span>Opción líder</span>
                                                <strong>{metricData.leader?.label || "Sin datos"}</strong>
                                             </div>
                                             <div className="uv-metrics-mini-stat">
                                                <span>Inicio</span>
                                                <strong>{formatDateShort(metricData.poll?.fechaInicio)}</strong>
                                             </div>
                                             <div className="uv-metrics-mini-stat">
                                                <span>Cierre</span>
                                                <strong>{formatDateShort(metricData.poll?.fechaCierre)}</strong>
                                             </div>
                                          </div>
                                       </div>

                                       <div className="uv-metrics-visual-panel">
                                          <div className="uv-metrics-visual-head">
                                             <div>
                                                <span className="uv-metrics-visual-kicker">
                                                   <FiTrendingUp /> Visualización
                                                </span>
                                                <h4>
                                                   {chartType === "bar"
                                                      ? "Comparativa por opción"
                                                      : "Distribución de votos"}
                                                </h4>
                                             </div>
                                             <div className="uv-metrics-summary-card-inline">
                                                <span>Opciones</span>
                                                <strong>{metricData.options.length}</strong>
                                             </div>
                                          </div>

                                          {chartType === "bar" ? (
                                             <MetricsBarChart options={metricData.options} />
                                          ) : (
                                             <MetricsPieChart
                                                options={metricData.options}
                                                totalVotes={metricData.totalVotes}
                                             />
                                          )}
                                       </div>
                                    </div>
                                 </motion.div>
                              </AnimatePresence>
                           </div>

                           {myCreatedPolls.length > 1 && (
                              <div className="uv-metrics-dots">
                                 {myCreatedPolls.map((poll, index) => (
                                    <button
                                       key={poll.id}
                                       type="button"
                                       className={`uv-metrics-dot ${currentMetricIndex === index ? "is-active" : ""}`}
                                       onClick={() => {
                                          setDirection(index > currentMetricIndex ? 1 : -1);
                                          setCurrentMetricIndex(index);
                                       }}
                                       aria-label={`Ver métricas de ${poll?.nombre || "votación"}`}
                                    />
                                 ))}
                              </div>
                           )}
                        </>
                     )}
                  </section>

                  {/* Calendario – misma columna que métricas */}
                  <MonthlyCalendar polls={myCreatedPolls} />
               </div>

               {/* COL DER – tablas */}
               <aside className="uv-dashboard-main-right">
                  {/* Creadas */}
                  <section className="uv-dashboard-panel uv-dashboard-module uv-dashboard-panel--compact">
                     <div className="uv-dashboard-panel-head uv-dashboard-panel-head--dark">
                        <div>
                           <h2>
                              <FiEdit3 className="uv-title-icon" />
                              Votaciones creadas
                           </h2>
                           <p>Tus más recientes.</p>
                        </div>
                     </div>

                     {loadingPolls ? (
                        <div className="uv-home-table-skeleton-wrap">
                           {Array.from({ length: 3 }).map((_, i) => (
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
                           <div className="uv-dashboard-table-wrap uv-dashboard-table-wrap--compact">
                              <table className="uv-dashboard-table uv-dashboard-table--compact">
                                 <thead>
                                    <tr>
                                       <th>Nombre</th>
                                       <th>Estado</th>
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
                                                      {formatDateShort(poll?.fechaInicio)} —{" "}
                                                      {formatDateShort(poll?.fechaCierre)}
                                                   </span>
                                                </div>
                                             </td>
                                             <td>
                                                <span className={`uv-home-mini-pill uv-home-mini-pill--${status.key}`}>
                                                   {status.label}
                                                </span>
                                             </td>
                                             <td>
                                                <button
                                                   type="button"
                                                   className="uv-dashboard-inline-btn"
                                                   onClick={() => navigate(`/encuestas/${poll.id}`)}
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

                  {/* Participadas */}
                  <section className="uv-dashboard-panel uv-dashboard-module uv-dashboard-panel--compact">
                     <div className="uv-dashboard-panel-head uv-dashboard-panel-head--dark">
                        <div>
                           <h2>
                              <FiThumbsUp className="uv-title-icon" />
                              Participaste
                           </h2>
                           <p>Encuestas donde ya votaste.</p>
                        </div>
                     </div>

                     {loadingPolls ? (
                        <div className="uv-home-table-skeleton-wrap">
                           {Array.from({ length: 3 }).map((_, i) => (
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
                           <div className="uv-dashboard-table-wrap uv-dashboard-table-wrap--compact">
                              <table className="uv-dashboard-table uv-dashboard-table--compact">
                                 <thead>
                                    <tr>
                                       <th>Nombre</th>
                                       <th>Estado</th>
                                       <th>Acción</th>
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
                                                      {formatDateShort(poll?.fechaInicio)} —{" "}
                                                      {formatDateShort(poll?.fechaCierre)}
                                                   </span>
                                                </div>
                                             </td>
                                             <td>
                                                <span className={`uv-home-mini-pill uv-home-mini-pill--${status.key}`}>
                                                   {status.label}
                                                </span>
                                             </td>
                                             <td>
                                                <button
                                                   type="button"
                                                   className="uv-dashboard-inline-btn"
                                                   onClick={() => navigate(`/encuestas/${poll.id}`)}
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
                              page={votedPage}
                              totalPages={votedTotalPages}
                              setPage={setVotedPage}
                           />
                        </>
                     )}
                  </section>
               </aside>
            </div>
         </div>
      </section>
   );
}
