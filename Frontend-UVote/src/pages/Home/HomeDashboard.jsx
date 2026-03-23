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
   FiCalendar,
   FiMoon,
   FiSun,
   FiSunset,
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
         </button>

         <div className="uv-home-page-info">
            {page} / {totalPages}
         </div>

         <button
            type="button"
            className="uv-home-page-btn"
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
         >
            <FiChevronRight />
         </button>
      </div>
   );
}

function DashboardGreeting({ userName, currentTime, nextClosingPoll }) {
   const hour = currentTime.getHours();

   let greeting = "Buenas Noches";
   let icon = <FiMoon />;

   if (hour >= 5 && hour < 12) {
      greeting = "Buenos Días";
      icon = <FiSun />;
   } else if (hour >= 12 && hour < 18) {
      greeting = "Buenas Tardes";
      icon = <FiSunset />;
   }

   const formattedTime = currentTime.toLocaleTimeString("es-CR", {
      hour: "2-digit",
      minute: "2-digit",
   });

   return (
      <section className="uv-dashboard-welcome">
         <div className="uv-dashboard-welcome-main uv-dashboard-module">
            <div className="uv-dashboard-welcome-badge">
               <span className="uv-dashboard-welcome-icon">{icon}</span>
               <span>Panel principal</span>
            </div>

            <h1>
               {greeting}, <span>{userName || "Usuario"}</span>
            </h1>

            <p>
               Revisa tus votaciones, consulta métricas y mantén el control de tu
               actividad desde un solo espacio.
            </p>
         </div>

         <div className="uv-dashboard-welcome-side">
            <article className="uv-dashboard-info-card uv-dashboard-module">
               <div className="uv-dashboard-info-card-head">
                  <FiClock />
                  <span>Hora actual</span>
               </div>
               <strong>{formattedTime}</strong>
               <small>Actualizada en tiempo real</small>
            </article>

            <article className="uv-dashboard-info-card uv-dashboard-module">
               <div className="uv-dashboard-info-card-head">
                  <FiCalendar />
                  <span>Próxima votación a cerrar</span>
               </div>
               <strong>{nextClosingPoll?.nombre || "Sin cierres próximos"}</strong>
               <small>
                  {nextClosingPoll?.fechaCierre
                     ? `Cierra el ${formatDateShort(nextClosingPoll.fechaCierre)}`
                     : "Aparecerá aquí cuando tengas una votación programada"}
               </small>
            </article>
         </div>
      </section>
   );
}

function MetricsPieChart({ options, totalVotes }) {
   const palette = [
      "#302f2c",
      "#5b554f",
      "#8b847c",
      "#b4aca2",
      "#d9d3c8",
      "#c8bbb0",
   ];

   const segments = options.map((option, index) => ({
      ...option,
      color: palette[index % palette.length],
   }));

   let start = 0;
   const gradientParts = segments.map((segment) => {
      const end = start + segment.percent;
      const part = `${segment.color} ${start}% ${end}%`;
      start = end;
      return part;
   });

   const background =
      segments.length > 0
         ? `conic-gradient(${gradientParts.join(", ")})`
         : "conic-gradient(#d9d3c8 0% 100%)";

   return (
      <div className="uv-metrics-chart-pie-layout">
         <div className="uv-metrics-pie-wrap">
            <div
               className="uv-metrics-pie"
               style={{ background }}
               aria-label="Gráfico circular de resultados"
            >
               <div className="uv-metrics-pie-hole">
                  <span>Total</span>
                  <strong>{totalVotes}</strong>
               </div>
            </div>
         </div>

         <div className="uv-metrics-legend">
            {segments.map((segment) => (
               <div key={segment.id} className="uv-metrics-legend-item">
                  <span
                     className="uv-metrics-legend-dot"
                     style={{ background: segment.color }}
                  />
                  <div className="uv-metrics-legend-copy">
                     <strong>{segment.label}</strong>
                     <small>
                        {segment.votes} voto{segment.votes === 1 ? "" : "s"} ·{" "}
                        {segment.percent}%
                     </small>
                  </div>
               </div>
            ))}
         </div>
      </div>
   );
}

function MetricsBarChart({ options }) {
   return (
      <div className="uv-metrics-chart">
         {options.length === 0 ? (
            <div className="uv-home-empty-box">
               Esta votación todavía no tiene datos para graficar.
            </div>
         ) : (
            options.map((option) => (
               <div className="uv-metrics-bar-row" key={option.id}>
                  <div className="uv-metrics-bar-head">
                     <span>{option.label}</span>
                     <strong>
                        {option.votes} voto{option.votes === 1 ? "" : "s"} ·{" "}
                        {option.percent}%
                     </strong>
                  </div>

                  <div className="uv-metrics-bar-track">
                     <div
                        className="uv-metrics-bar-fill"
                        style={{ width: `${option.percent}%` }}
                     />
                  </div>
               </div>
            ))
         )}
      </div>
   );
}

function PollRangeCalendar({ poll }) {
   const months = [
      "Enero",
      "Febrero",
      "Marzo",
      "Abril",
      "Mayo",
      "Junio",
      "Julio",
      "Agosto",
      "Septiembre",
      "Octubre",
      "Noviembre",
      "Diciembre",
   ];

   const weekdays = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];

   const startDate = poll?.fechaInicio ? new Date(poll.fechaInicio) : null;
   const endDate = poll?.fechaCierre ? new Date(poll.fechaCierre) : null;

   const baseDate = startDate || new Date();
   const year = baseDate.getFullYear();
   const month = baseDate.getMonth();

   const firstDay = new Date(year, month, 1);
   const lastDay = new Date(year, month + 1, 0);

   const mondayBasedStart = (firstDay.getDay() + 6) % 7;
   const totalDays = lastDay.getDate();

   const cells = [];

   for (let i = 0; i < mondayBasedStart; i += 1) {
      cells.push({ type: "empty", key: `e-${i}` });
   }

   for (let day = 1; day <= totalDays; day += 1) {
      const cellDate = new Date(year, month, day);
      const isStart =
         startDate &&
         cellDate.toDateString() === new Date(startDate).toDateString();

      const isEnd =
         endDate && cellDate.toDateString() === new Date(endDate).toDateString();

      const isInRange =
         startDate &&
         endDate &&
         cellDate >=
            new Date(
               startDate.getFullYear(),
               startDate.getMonth(),
               startDate.getDate()
            ) &&
         cellDate <=
            new Date(endDate.getFullYear(), endDate.getMonth(), endDate.getDate());

      const isToday = cellDate.toDateString() === new Date().toDateString();

      cells.push({
         type: "day",
         key: `d-${day}`,
         day,
         isStart,
         isEnd,
         isInRange,
         isToday,
      });
   }

   return (
      <section className="uv-calendar-card uv-dashboard-module">
         <div className="uv-calendar-left">
            <span className="uv-calendar-kicker">Calendario</span>

            <div className="uv-calendar-day-number">
               {startDate ? String(startDate.getDate()).padStart(2, "0") : "--"}
            </div>

            <div className="uv-calendar-day-label">
               {startDate
                  ? startDate.toLocaleDateString("es-CR", { weekday: "long" })
                  : "sin fecha"}
            </div>

            <div className="uv-calendar-events">
               <strong>Rango de votación</strong>
               <p>{poll?.nombre || "Selecciona una votación"}</p>
            </div>

            <div className="uv-calendar-range-summary">
               <div>
                  <span>Inicio</span>
                  <strong>{formatDateShort(poll?.fechaInicio)}</strong>
               </div>
               <div>
                  <span>Cierre</span>
                  <strong>{formatDateShort(poll?.fechaCierre)}</strong>
               </div>
            </div>
         </div>

         <div className="uv-calendar-right">
            <div className="uv-calendar-top">
               <strong>
                  {months[month]} {year}
               </strong>
               <span>Vigencia de la encuesta</span>
            </div>

            <div className="uv-calendar-weekdays">
               {weekdays.map((day) => (
                  <span key={day}>{day}</span>
               ))}
            </div>

            <div className="uv-calendar-grid">
               {cells.map((cell) =>
                  cell.type === "empty" ? (
                     <div key={cell.key} className="uv-calendar-cell uv-calendar-cell--empty" />
                  ) : (
                     <div
                        key={cell.key}
                        className={[
                           "uv-calendar-cell",
                           cell.isInRange ? "is-in-range" : "",
                           cell.isStart ? "is-start" : "",
                           cell.isEnd ? "is-end" : "",
                           cell.isToday ? "is-today" : "",
                        ]
                           .join(" ")
                           .trim()}
                     >
                        <span>{cell.day}</span>
                     </div>
                  )
               )}
            </div>
         </div>
      </section>
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
   const [chartType, setChartType] = useState("bar");
   const [currentTime, setCurrentTime] = useState(new Date());

   const [metricResults, setMetricResults] = useState([]);
   const [loadingMetricResults, setLoadingMetricResults] = useState(false);
   const [metricResultsError, setMetricResultsError] = useState("");

   const authUserId = useMemo(() => usuario?.id ?? usuario?.usuarioId ?? null, [usuario]);

   const userName = useMemo(() => {
      return (
         usuario?.nombre ||
         usuario?.nombreUsuario ||
         usuario?.username ||
         usuario?.correo?.split?.("@")?.[0] ||
         "Usuario"
      );
   }, [usuario]);

   useEffect(() => {
      const timer = setInterval(() => {
         setCurrentTime(new Date());
      }, 60000);

      return () => clearInterval(timer);
   }, []);

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

   const nextClosingPoll = useMemo(() => {
      const now = new Date();

      return [...myCreatedPolls]
         .filter((poll) => {
            if (!poll?.fechaCierre) return false;
            const closeDate = new Date(poll.fechaCierre);
            return closeDate > now;
         })
         .sort(
            (a, b) => new Date(a.fechaCierre).getTime() - new Date(b.fechaCierre).getTime()
         )[0];
   }, [myCreatedPolls]);

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

   useEffect(() => {
      let ignore = false;

      const loadMetricResults = async () => {
         if (!metricPoll?.id) {
            setMetricResults([]);
            setMetricResultsError("");
            return;
         }

         setLoadingMetricResults(true);
         setMetricResultsError("");

         try {
            const res = await votesApi.results(metricPoll.id);
            const data = Array.isArray(res?.data) ? res.data : [];

            if (!ignore) setMetricResults(data);
         } catch (err) {
            if (!ignore) {
               setMetricResults([]);
               setMetricResultsError(
                  err?.response?.data?.message ||
                     "No se pudieron cargar las métricas de la encuesta."
               );
            }
         } finally {
            if (!ignore) setLoadingMetricResults(false);
         }
      };

      loadMetricResults();

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
         (acc, option) => acc + option.votes,
         0
      );

      const options = normalizedOptions.map((option) => ({
         ...option,
         percent: totalVotes > 0 ? Math.round((option.votes / totalVotes) * 100) : 0,
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

   return (
      <section className="uv-dashboard-shell">
         <div className="uv-dashboard">
            <DashboardGreeting
               userName={userName}
               currentTime={currentTime}
               nextClosingPoll={nextClosingPoll}
            />

            <div className="uv-dashboard-stats">
               <StatCard
                  icon={<FiLayers />}
                  label="Creadas"
                  value={stats.total}
                  hint="Total"
                  tone="total"
               />
               <StatCard
                  icon={<FiPlayCircle />}
                  label="Activas"
                  value={stats.open}
                  hint="En curso"
                  tone="open"
               />
               <StatCard
                  icon={<FiClock />}
                  label="Pendientes"
                  value={stats.pending}
                  hint="Por iniciar"
                  tone="pending"
               />
               <StatCard
                  icon={<FiCheckCircle />}
                  label="Cerradas"
                  value={stats.closed}
                  hint="Finalizadas"
                  tone="closed"
               />
            </div>

            <div className="uv-dashboard-main">
               <div className="uv-dashboard-main-left">
                  <section className="uv-dashboard-panel uv-dashboard-panel--metrics uv-dashboard-module">
                     <div className="uv-dashboard-panel-head uv-dashboard-panel-head--metrics">
                        <div>
                           <h2>Métricas de tus votaciones</h2>
                           <p>
                              Explora resultados, cambia de visualización y consulta
                              el comportamiento de cada encuesta.
                           </p>
                        </div>

                        <div className="uv-metrics-head-actions">
                           <div className="uv-metrics-chart-switcher">
                              <button
                                 type="button"
                                 className={`uv-metrics-chart-type-btn ${
                                    chartType === "bar" ? "is-active" : ""
                                 }`}
                                 onClick={() => setChartType("bar")}
                              >
                                 <FiBarChart2 />
                                 Barras
                              </button>

                              <button
                                 type="button"
                                 className={`uv-metrics-chart-type-btn ${
                                    chartType === "pie" ? "is-active" : ""
                                 }`}
                                 onClick={() => setChartType("pie")}
                              >
                                 <FiPieChart />
                                 Pastel
                              </button>
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
                                    key={metricData.poll?.id || currentMetricIndex}
                                    className="uv-metrics-slide"
                                    custom={direction}
                                    initial={{ opacity: 0, x: direction > 0 ? 40 : -40 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: direction > 0 ? -40 : 40 }}
                                    transition={{ duration: 0.25, ease: "easeOut" }}
                                 >
                                    <div className="uv-metrics-layout">
                                       <div className="uv-metrics-side-info">
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

                                                <div className="uv-metrics-mini-stat">
                                                   <span>Inicio</span>
                                                   <strong>
                                                      {formatDateShort(metricData.poll?.fechaInicio)}
                                                   </strong>
                                                </div>

                                                <div className="uv-metrics-mini-stat">
                                                   <span>Cierre</span>
                                                   <strong>
                                                      {formatDateShort(metricData.poll?.fechaCierre)}
                                                   </strong>
                                                </div>
                                             </div>
                                          </div>
                                       </div>

                                       <div className="uv-metrics-visual-panel">
                                          <div className="uv-metrics-visual-head">
                                             <div>
                                                <span className="uv-metrics-visual-kicker">
                                                   <FiTrendingUp />
                                                   Visualización
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

                           <PollRangeCalendar poll={metricData.poll} />
                        </>
                     )}
                  </section>
               </div>

               <aside className="uv-dashboard-main-right">
                  <section className="uv-dashboard-panel uv-dashboard-module uv-dashboard-panel--compact">
                     <div className="uv-dashboard-panel-head">
                        <div>
                           <h2>Votaciones creadas</h2>
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
                                                <span
                                                   className={`uv-home-mini-pill uv-home-mini-pill--${status.key}`}
                                                >
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

                  <section className="uv-dashboard-panel uv-dashboard-module uv-dashboard-panel--compact">
                     <div className="uv-dashboard-panel-head">
                        <div>
                           <h2>Participaste</h2>
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
                                                   <span>{formatDateShort(poll?.fechaInicio)}</span>
                                                </div>
                                             </td>
                                             <td>
                                                <span
                                                   className={`uv-home-mini-pill uv-home-mini-pill--${status.key}`}
                                                >
                                                   {status.label}
                                                </span>
                                             </td>
                                             <td>
                                                <button
                                                   type="button"
                                                   className="uv-dashboard-inline-btn"
                                                   onClick={() => navigate(`/encuestas/${poll.id}`)}
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
               </aside>
            </div>
         </div>
      </section>
   );
}