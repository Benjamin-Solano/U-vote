import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { FiArrowLeft, FiCheckCircle } from "react-icons/fi";

import { pollsApi } from "../../api/polls.api";
import { optionsApi } from "../../api/options.api";
import { votesApi } from "../../api/votes.api";
import { useAuth } from "../../auth/useAuth";

import {
   ResponsiveContainer,
   BarChart,
   Bar,
   XAxis,
   YAxis,
   CartesianGrid,
   Tooltip,
   PieChart,
   Pie,
   Cell,
} from "recharts";

import "./polls.css";

function formatMaybeDate(v) {
   if (!v) return "—";
   const d = new Date(v);
   if (!Number.isFinite(d.getTime())) return String(v);
   return d.toLocaleString();
}

function clampLabel(s, max = 14) {
   const t = String(s ?? "");
   if (t.length <= max) return t;
   return `${t.slice(0, max)}…`;
}

function TooltipBox({ active, payload, label }) {
   if (!active || !payload?.length) return null;
   const v = payload[0]?.value ?? 0;

   return (
      <div className="uv-chart-tooltip">
         <div className="uv-tt-title">{label}</div>
         <div className="uv-tt-val">{v} votos</div>
      </div>
   );
}

function VerticalBars({ data }) {
   return (
      <div className="uv-chart-shell">
         <ResponsiveContainer width="100%" height={320}>
            <BarChart data={data} margin={{ top: 10, right: 18, bottom: 12, left: 6 }}>
               <CartesianGrid strokeDasharray="3 3" />
               <XAxis dataKey="name" tick={{ fontSize: 12 }} interval={0} tickFormatter={(v) => clampLabel(v, 12)} />
               <YAxis tick={{ fontSize: 12 }} allowDecimals={false} />
               <Tooltip content={<TooltipBox />} />
               <Bar dataKey="votos" radius={[8, 8, 0, 0]} />
            </BarChart>
         </ResponsiveContainer>
      </div>
   );
}

function HorizontalBars({ data }) {
   // layout="vertical" usa X como valores y Y como categorías
   return (
      <div className="uv-chart-shell">
         <ResponsiveContainer width="100%" height={320}>
            <BarChart data={data} layout="vertical" margin={{ top: 10, right: 18, bottom: 10, left: 32 }}>
               <CartesianGrid strokeDasharray="3 3" />
               <XAxis type="number" tick={{ fontSize: 12 }} allowDecimals={false} />
               <YAxis type="category" dataKey="name" tick={{ fontSize: 12 }} width={120} tickFormatter={(v) => clampLabel(v, 16)} />
               <Tooltip content={<TooltipBox />} />
               <Bar dataKey="votos" radius={[0, 8, 8, 0]} />
            </BarChart>
         </ResponsiveContainer>
      </div>
   );
}

function PieResults({ data }) {
   const COLORS = [
      "rgba(48,47,44,0.92)",
      "rgba(48,47,44,0.72)",
      "rgba(48,47,44,0.52)",
      "rgba(48,47,44,0.35)",
      "rgba(48,47,44,0.22)",
      "rgba(48,47,44,0.14)",
   ];

   return (
      <div className="uv-chart-shell">
         <ResponsiveContainer width="100%" height={320}>
            <PieChart>
               <Tooltip
                  content={({ active, payload }) => {
                     if (!active || !payload?.length) return null;
                     const p = payload[0]?.payload;
                     return (
                        <div className="uv-chart-tooltip">
                           <div className="uv-tt-title">{p?.name}</div>
                           <div className="uv-tt-val">{p?.votos} votos</div>
                           <div className="uv-tt-sub">{p?.pct}%</div>
                        </div>
                     );
                  }}
               />
               <Pie
                  data={data}
                  dataKey="votos"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={110}
                  innerRadius={55}
                  paddingAngle={2}
                  stroke="rgba(48,47,44,0.10)"
               >
                  {data.map((_, i) => (
                     <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
               </Pie>
            </PieChart>
         </ResponsiveContainer>

         {/* Leyenda minimalista (sin librería extra) */}
         <div className="uv-pie-legend">
            {data.map((d, i) => (
               <div className="uv-pie-item" key={d.name}>
                  <span className="uv-dot" style={{ background: COLORS[i % COLORS.length] }} />
                  <span className="uv-pie-name">{d.name}</span>
                  <span className="uv-pie-val">{d.votos}</span>
               </div>
            ))}
         </div>
      </div>
   );
}

export default function PollDetail() {
   const { id } = useParams();
   const encuestaId = Number(id);
   const navigate = useNavigate();

   const { isAuthenticated, usuario } = useAuth();

   const [poll, setPoll] = useState(null);
   const [options, setOptions] = useState([]);

   const [results, setResults] = useState([]);
   const [loading, setLoading] = useState(true);
   const [submittingVote, setSubmittingVote] = useState(false);
   const [loadingStats, setLoadingStats] = useState(false);

   const [err, setErr] = useState("");

   // Tabs + charts
   const [activeTab, setActiveTab] = useState("info"); // "info" | "stats"
   const [chartType, setChartType] = useState("vertical"); // "vertical" | "horizontal" | "pie"

   const authUserId = useMemo(() => usuario?.id ?? usuario?.usuarioId ?? null, [usuario]);

   const isOwner = useMemo(() => {
      if (!poll || !authUserId) return false;
      return Number(authUserId) === Number(poll.usuarioId);
   }, [poll, authUserId]);

   const canViewStats = isAuthenticated && isOwner;

   const totalVotes = useMemo(() => {
      return results.reduce((acc, r) => acc + Number(r.votos || 0), 0);
   }, [results]);

   const chartData = useMemo(() => {
      const base = (Array.isArray(results) ? results : []).map((r) => ({
         name: r.nombre ?? "Opción",
         votos: Number(r.votos || 0),
      }));

      // ordena desc para que la lectura sea mejor
      base.sort((a, b) => b.votos - a.votos);

      // añade porcentajes para pastel/tooltip
      return base.map((d) => ({
         ...d,
         pct: totalVotes > 0 ? Math.round((d.votos * 100) / totalVotes) : 0,
      }));
   }, [results, totalVotes]);

   async function loadPollAndOptions() {
      setLoading(true);
      setErr("");

      try {
         const [pollRes, optionsRes] = await Promise.all([
            pollsApi.getById(encuestaId),
            optionsApi.listByEncuesta(encuestaId),
         ]);

         const pollData = pollRes.data;
         const optionsData = Array.isArray(optionsRes.data) ? optionsRes.data : [];

         optionsData.sort((a, b) => (a.orden ?? 999999) - (b.orden ?? 999999));

         setPoll(pollData);
         setOptions(optionsData);
      } catch (e) {
         setErr(e?.response?.data?.message || e.message || "Error cargando la encuesta");
      } finally {
         setLoading(false);
      }
   }

   async function loadStats() {
      if (!canViewStats) return;
      setLoadingStats(true);
      setErr("");

      try {
         const r = await votesApi.results(encuestaId);
         setResults(Array.isArray(r.data) ? r.data : []);
      } catch (e) {
         setErr(e?.response?.data?.message || e.message || "Error cargando resultados");
      } finally {
         setLoadingStats(false);
      }
   }

   useEffect(() => {
      if (!Number.isFinite(encuestaId)) return;
      loadPollAndOptions();
      // eslint-disable-next-line react-hooks/exhaustive-deps
   }, [encuestaId]);

   useEffect(() => {
      if (activeTab === "stats") loadStats();
      // eslint-disable-next-line react-hooks/exhaustive-deps
   }, [activeTab, canViewStats, encuestaId]);

   async function handleVote(opcionId) {
      if (!isAuthenticated) return navigate("/login");
      if (poll?.cerrada) return;

      setSubmittingVote(true);
      setErr("");

      try {
         await votesApi.vote(encuestaId, opcionId);
      } catch (e) {
         setErr(e?.response?.data?.message || e.message || "No se pudo registrar el voto");
      } finally {
         setSubmittingVote(false);
      }
   }

   if (loading) {
      return (
         <div className="uv-polls-scope uv-detail-wrap">
            <div className="uv-detail-card">
               <div className="uv-polls-state">Cargando…</div>
            </div>
         </div>
      );
   }

   if (!poll) {
      return (
         <div className="uv-polls-scope uv-detail-wrap">
            <div className="uv-detail-card">
               <button className="uv-btn" onClick={() => navigate(-1)}>
                  <FiArrowLeft /> Volver
               </button>

               {err && (
                  <div className="uv-polls-error" style={{ marginTop: 12 }}>
                     {err}
                  </div>
               )}
            </div>
         </div>
      );
   }

   const fechaApertura = formatMaybeDate(
      poll.fechaApertura ?? poll.fechaInicio ?? poll.inicio ?? poll.createdAt
   );
   const fechaCierre = formatMaybeDate(poll.fechaCierre ?? poll.cierre ?? poll.closedAt);

   return (
      <div className="uv-polls-scope uv-detail-wrap">
         <div className="uv-detail-card">
            {/* Head */}
            <div className="uv-polls-head" style={{ alignItems: "center" }}>
               <button className="uv-btn" onClick={() => navigate(-1)}>
                  <FiArrowLeft /> Volver
               </button>

               <div className="uv-polls-actions" />
            </div>

            {err && (
               <div className="uv-polls-error" style={{ marginTop: 12 }}>
                  {err}
               </div>
            )}

            {/* Tabs */}
            <div className="uv-tabs" role="tablist" aria-label="Secciones de la encuesta">
               <button
                  type="button"
                  className={`uv-tab ${activeTab === "info" ? "active" : ""}`}
                  onClick={() => setActiveTab("info")}
                  role="tab"
                  aria-selected={activeTab === "info"}
               >
                  Información
               </button>

               {canViewStats && (
                  <button
                     type="button"
                     className={`uv-tab ${activeTab === "stats" ? "active" : ""}`}
                     onClick={() => setActiveTab("stats")}
                     role="tab"
                     aria-selected={activeTab === "stats"}
                  >
                     Estadísticas
                  </button>
               )}
            </div>

            {/* TAB: INFO */}
            {activeTab === "info" && (
               <>
                  <div className="uv-poll-card uv-flat" style={{ marginTop: 14, cursor: "default" }}>
                     <div className="uv-poll-card-top">
                        <div className="uv-poll-name" style={{ fontSize: 18 }}>
                           {poll.nombre}
                        </div>

                        <span className={`uv-pills ${poll.cerrada ? "closed" : "open"}`}>
                           {poll.cerrada ? "Cerrada" : "Activa"}
                        </span>
                     </div>

                     <div className="uv-poll-desc" style={{ marginTop: 10 }}>
                        {poll.descripcion?.trim() ? poll.descripcion : "Sin descripción."}
                     </div>

                     <div className="uv-poll-meta-row" style={{ marginTop: 12 }}>
                        <span>Apertura: {fechaApertura}</span>
                        <span>Cierre: {fechaCierre}</span>
                     </div>
                  </div>

                  <div style={{ marginTop: 14 }}>
                     <h2 className="uv-detail-h2">Opciones</h2>

                     {options.length === 0 ? (
                        <div className="uv-polls-state">Esta encuesta no tiene opciones todavía.</div>
                     ) : (
                        <div className="uv-polls-grid uv-detail-grid-2">
                           {options.map((o) => {
                              const voteDisabled = submittingVote || poll.cerrada;

                              return (
                                 <div key={o.id} className="uv-poll-card uv-flat" style={{ cursor: "default" }}>
                                    <div className="uv-poll-card-top">
                                       <div className="uv-poll-name">{o.nombre}</div>

                                       {typeof o.orden === "number" && (
                                          <span className="uv-pills">#{o.orden}</span>
                                       )}
                                    </div>

                                    <div className="uv-poll-desc">
                                       {o.descripcion?.trim() ? o.descripcion : "Sin descripción."}
                                    </div>

                                    {o.imagenUrl?.trim() && (
                                       <div style={{ marginTop: 10 }}>
                                          <a
                                             href={o.imagenUrl}
                                             target="_blank"
                                             rel="noreferrer"
                                             className="uv-muted-link"
                                          >
                                             Ver imagen
                                          </a>
                                       </div>
                                    )}

                                    <button
                                       className="uv-btn uv-btn-dark"
                                       style={{ width: "100%", justifyContent: "center", marginTop: 10 }}
                                       disabled={voteDisabled}
                                       onClick={() => handleVote(o.id)}
                                       title={
                                          poll.cerrada
                                             ? "La encuesta está cerrada"
                                             : !isAuthenticated
                                                ? "Inicia sesión para votar"
                                                : "Votar"
                                       }
                                    >
                                       <FiCheckCircle />
                                       {poll.cerrada ? "Encuesta cerrada" : submittingVote ? "Votando…" : "Votar"}
                                    </button>

                                    {!isAuthenticated && !poll.cerrada && (
                                       <div className="uv-hint" style={{ marginTop: 10 }}>
                                          Debes iniciar sesión para votar.
                                       </div>
                                    )}
                                 </div>
                              );
                           })}
                        </div>
                     )}
                  </div>
               </>
            )}

            {/* TAB: STATS */}
            {activeTab === "stats" && canViewStats && (
               <div style={{ marginTop: 14 }}>
                  <div className="uv-poll-card uv-flat" style={{ cursor: "default" }}>
                     <div className="uv-stats-head">
                        <div className="uv-stats-title">Resumen</div>
                        <div className="uv-stats-total">
                           <span>Total votos</span>
                           <strong>{totalVotes}</strong>
                        </div>
                     </div>

                     {loadingStats ? (
                        <div className="uv-polls-state" style={{ marginTop: 12 }}>
                           Cargando estadísticas…
                        </div>
                     ) : results.length === 0 ? (
                        <div className="uv-polls-state" style={{ marginTop: 12 }}>
                           Aún no hay votos registrados.
                        </div>
                     ) : (
                        <div className="uv-results-list">
                           {chartData.map((r) => (
                              <div key={r.name} className="uv-result-row">
                                 <div className="uv-result-head">
                                    <div className="uv-result-name">{r.name}</div>
                                    <div className="uv-result-val">
                                       {r.votos} <span>({r.pct}%)</span>
                                    </div>
                                 </div>

                                 <div className="uv-bar">
                                    <div style={{ width: `${r.pct}%` }} />
                                 </div>
                              </div>
                           ))}
                        </div>
                     )}
                  </div>

                  <div className="uv-poll-card uv-flat" style={{ marginTop: 14, cursor: "default" }}>
                     <div className="uv-stats-head">
                        <div className="uv-stats-title">Gráficas</div>

                        <div className="uv-chart-toolbar" role="group" aria-label="Tipo de gráfica">
                           <button
                              type="button"
                              className={`uv-chip ${chartType === "vertical" ? "active" : ""}`}
                              onClick={() => setChartType("vertical")}
                              disabled={loadingStats || chartData.length === 0}
                           >
                              Barras Verticales
                           </button>
                           <button
                              type="button"
                              className={`uv-chip ${chartType === "horizontal" ? "active" : ""}`}
                              onClick={() => setChartType("horizontal")}
                              disabled={loadingStats || chartData.length === 0}
                           >
                              Barras Horizontales
                           </button>
                           <button
                              type="button"
                              className={`uv-chip ${chartType === "pie" ? "active" : ""}`}
                              onClick={() => setChartType("pie")}
                              disabled={loadingStats || chartData.length === 0}
                           >
                              Pastel
                           </button>
                        </div>
                     </div>

                     <div className="uv-chart-box">
                        {loadingStats ? (
                           <div className="uv-chart-empty">Cargando gráfica…</div>
                        ) : chartData.length === 0 ? (
                           <div className="uv-chart-empty">No hay datos para graficar.</div>
                        ) : chartType === "vertical" ? (
                           <VerticalBars data={chartData} />
                        ) : chartType === "horizontal" ? (
                           <HorizontalBars data={chartData} />
                        ) : (
                           <PieResults data={chartData} />
                        )}
                     </div>
                  </div>
               </div>
            )}
         </div>
      </div>
   );
}
