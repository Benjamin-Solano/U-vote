import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
   FiArrowLeft,
   FiBookOpen,
   FiCheckCircle,
   FiHome,
   FiMapPin,
   FiShare2,
   FiUser,
} from "react-icons/fi";
import { AnimatePresence, motion } from "framer-motion";

import { pollsApi } from "../../api/polls.api";
import { optionsApi } from "../../api/options.api";
import { votesApi } from "../../api/votes.api";
import { useAuth } from "../../auth/useAuth";

import "./pollDetail.css";

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

const VOTE_CONFIRMATION_KEY = "uv_vote_confirmation";

function formatMaybeDate(v) {
   if (!v) return "—";
   const d = new Date(v);
   if (!Number.isFinite(d.getTime())) return String(v);
   return d.toLocaleString();
}

function safeDate(v) {
   if (!v) return null;
   const d = new Date(v);
   return Number.isFinite(d.getTime()) ? d : null;
}

function getPollStatus(poll) {
   const now = new Date();

   const inicio = safeDate(poll?.fechaInicio ?? poll?.fechaApertura ?? poll?.inicio);
   const cierre = safeDate(poll?.fechaCierre ?? poll?.cierre);

   const isPending = inicio ? now.getTime() < inicio.getTime() : false;
   if (isPending) return { key: "pending", label: "Pendiente" };

   if (poll?.cerrada === true) return { key: "closed", label: "Cerrada" };

   const isClosedByTime = cierre ? now.getTime() >= cierre.getTime() : false;
   if (isClosedByTime) return { key: "closed", label: "Cerrada" };

   return { key: "open", label: "Activa" };
}

function clampLabel(s, max = 14) {
   const t = String(s ?? "");
   if (t.length <= max) return t;
   return `${t.slice(0, max)}…`;
}

function coverObjectPosition(poll) {
   const pos = Number(poll?.coverPos);
   const y = Number.isFinite(pos) ? Math.max(0, Math.min(100, pos)) : 50;
   return `50% ${y}%`;
}

function normalizeServerMessage(e) {
   const apiMsg = e?.response?.data?.message;
   const raw = apiMsg || e?.message || "Ocurrió un error";
   return String(raw);
}

function voteFriendlyMessage(serverMsg) {
   const s = String(serverMsg || "").toLowerCase();

   if (
      /ya\s+ha\s+votad/.test(s) ||
      /ya\s+vot/.test(s) ||
      /already\s+voted/.test(s) ||
      /voto\s+duplic/.test(s)
   ) {
      return "Ya habías votado en esta votación.";
   }

   if (/cerrad/.test(s) || /closed/.test(s) || /finaliz/.test(s)) {
      return "Esta votación está cerrada. No es posible votar.";
   }

   if (/no\s+autoriz/.test(s) || /unauthoriz/.test(s) || /forbidden/.test(s) || /403/.test(s)) {
      return "No tienes permisos para votar en esta votación.";
   }

   if (/no\s+encontr/.test(s) || /not\s+found/.test(s) || /404/.test(s)) {
      return "No se encontró la votación u opción seleccionada.";
   }

   return "No se pudo registrar el voto. Intenta de nuevo.";
}

async function copyToClipboard(text) {
   if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text);
      return true;
   }

   const ta = document.createElement("textarea");
   ta.value = text;
   ta.setAttribute("readonly", "");
   ta.style.position = "fixed";
   ta.style.top = "-1000px";
   ta.style.opacity = "0";
   document.body.appendChild(ta);
   ta.select();
   const ok = document.execCommand("copy");
   document.body.removeChild(ta);
   return ok;
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
               <Bar dataKey="votos" radius={[8, 8, 0, 0]}>
                  {data.map((d, i) => (
                     <Cell key={i} fill={d.color} />
                  ))}
               </Bar>
            </BarChart>
         </ResponsiveContainer>
      </div>
   );
}

function HorizontalBars({ data }) {
   return (
      <div className="uv-chart-shell">
         <ResponsiveContainer width="100%" height={320}>
            <BarChart data={data} layout="vertical" margin={{ top: 10, right: 18, bottom: 10, left: 32 }}>
               <CartesianGrid strokeDasharray="3 3" />
               <XAxis type="number" tick={{ fontSize: 12 }} allowDecimals={false} />
               <YAxis
                  type="category"
                  dataKey="name"
                  tick={{ fontSize: 12 }}
                  width={120}
                  tickFormatter={(v) => clampLabel(v, 16)}
               />
               <Tooltip content={<TooltipBox />} />
               <Bar dataKey="votos" radius={[0, 8, 8, 0]}>
                  {data.map((d, i) => (
                     <Cell key={i} fill={d.color} />
                  ))}
               </Bar>
            </BarChart>
         </ResponsiveContainer>
      </div>
   );
}

function PieResults({ data }) {
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
                  {data.map((d, i) => (
                     <Cell key={i} fill={d.color} />
                  ))}
               </Pie>
            </PieChart>
         </ResponsiveContainer>

         <div className="uv-pie-legend">
            {data.map((d, i) => (
               <div className="uv-pie-item" key={`${d.name}-${i}`}>
                  <span className="uv-dot" style={{ background: d.color }} />
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

   const [notice, setNotice] = useState(null);
   const [activeTab, setActiveTab] = useState("info");
   const [chartType, setChartType] = useState("vertical");
   const [hasVoted, setHasVoted] = useState(false);

   const authUserId = useMemo(() => usuario?.id ?? usuario?.usuarioId ?? null, [usuario]);

   const isOwner = useMemo(() => {
      if (!poll || !authUserId) return false;
      return Number(authUserId) === Number(poll.usuarioId);
   }, [poll, authUserId]);

   const canViewStats = isAuthenticated && isOwner;

   const totalVotes = useMemo(() => {
      return results.reduce((acc, r) => acc + Number(r.votos || 0), 0);
   }, [results]);

   const PASTELS = useMemo(
      () => [
         "rgba(186, 220, 255, 0.95)",
         "rgba(199, 232, 213, 0.95)",
         "rgba(255, 221, 193, 0.95)",
         "rgba(255, 199, 223, 0.95)",
         "rgba(226, 211, 255, 0.95)",
         "rgba(255, 245, 179, 0.95)",
         "rgba(202, 233, 255, 0.95)",
         "rgba(216, 245, 227, 0.95)",
      ],
      []
   );

   const chartData = useMemo(() => {
      const base = (Array.isArray(results) ? results : []).map((r) => ({
         name: r.nombre ?? "Opción",
         votos: Number(r.votos || 0),
      }));

      base.sort((a, b) => b.votos - a.votos);

      return base.map((d, i) => ({
         ...d,
         pct: totalVotes > 0 ? Math.round((d.votos * 100) / totalVotes) : 0,
         color: PASTELS[i % PASTELS.length],
      }));
   }, [results, totalVotes, PASTELS]);

   const status = useMemo(() => getPollStatus(poll), [poll]);

   const creatorName = useMemo(() => {
      return (
         poll?.usuarioNombre ||
         poll?.creadorNombre ||
         poll?.nombreCreador ||
         poll?.nombreUsuarioCreador ||
         "No disponible"
      );
   }, [poll]);

   const campusName = useMemo(() => {
      return poll?.campusNombre || "Sin campus";
   }, [poll]);

   const carreraName = useMemo(() => {
      return poll?.carreraNombre || "Sin carrera";
   }, [poll]);

   async function loadPollAndOptions() {
      setLoading(true);
      setNotice(null);

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

         setHasVoted(
            Boolean(
               pollData?.yaVoto ??
               pollData?.yaHaVotado ??
               pollData?.usuarioYaVoto ??
               pollData?.votadaPorUsuarioActual ??
               false
            )
         );
      } catch (e) {
         setNotice({ kind: "error", text: normalizeServerMessage(e) || "Error cargando la votación" });
      } finally {
         setLoading(false);
      }
   }

   async function loadStats() {
      if (!canViewStats) return;
      setLoadingStats(true);
      setNotice(null);

      try {
         const r = await votesApi.results(encuestaId);
         setResults(Array.isArray(r.data) ? r.data : []);
      } catch (e) {
         setNotice({ kind: "error", text: normalizeServerMessage(e) || "Error cargando resultados" });
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
      if (!isAuthenticated) {
         navigate("/login");
         return;
      }

      if (isOwner) {
         setNotice({ kind: "info", text: "No puedes votar en una votación creada por ti." });
         return;
      }

      if (hasVoted) {
         setNotice({ kind: "info", text: "Ya has votado en esta votación." });
         return;
      }

      if (status.key === "closed") {
         setNotice({ kind: "error", text: "Esta votación está cerrada. No es posible votar." });
         return;
      }

      if (status.key === "pending") {
         setNotice({ kind: "info", text: "Esta votación aún no ha iniciado. Vuelve cuando llegue la fecha de apertura." });
         return;
      }

      setSubmittingVote(true);
      setNotice(null);

      try {
         await votesApi.vote(encuestaId, opcionId);

         setHasVoted(true);

         if (!isOwner) {
            sessionStorage.setItem(
               VOTE_CONFIRMATION_KEY,
               JSON.stringify({
                  encuestaId,
                  nombreEncuesta: poll?.nombre ?? "Votación",
               })
            );
            navigate(`/encuestas/${encuestaId}/confirmacion-voto`, { replace: true });
            return;
         }

         setNotice({ kind: "success", text: "Voto exitoso." });

         if (activeTab === "stats" && canViewStats) {
            await loadStats();
         }
      } catch (e) {
         const serverMsg = normalizeServerMessage(e);

         if (
            /ya\s+ha\s+votad/i.test(serverMsg) ||
            /ya\s+vot/i.test(serverMsg) ||
            /already\s+voted/i.test(serverMsg)
         ) {
            setHasVoted(true);
         }

         setNotice({ kind: "error", text: voteFriendlyMessage(serverMsg) });
      } finally {
         setSubmittingVote(false);
      }
   }

   async function handleShare() {
      try {
         const url = window.location.href;
         const ok = await copyToClipboard(url);
         if (!ok) throw new Error("No se pudo copiar.");
         setNotice({ kind: "success", text: "Link copiado al portapapeles." });
      } catch {
         setNotice({
            kind: "error",
            text: "No se pudo copiar el link. Copia la URL desde la barra del navegador.",
         });
      }
   }

   function getVoteButtonText() {
      if (isOwner) return "No puedes votar";
      if (hasVoted) return "Ya has votado";
      if (status.key === "closed") return "Votación cerrada";
      if (status.key === "pending") return "Aún no inicia";
      if (submittingVote) return "Votando…";
      return "Votar";
   }

   function getVoteButtonTitle() {
      if (isOwner) return "El creador no puede votar en su propia votación";
      if (hasVoted) return "Ya registraste tu voto en esta votación";
      if (status.key === "closed") return "La votación está cerrada";
      if (status.key === "pending") return "La votación aún no ha iniciado";
      if (!isAuthenticated) return "Inicia sesión para votar";
      return "Votar";
   }

   const pageMotion = {
      initial: { opacity: 0, y: 8 },
      animate: { opacity: 1, y: 0, transition: { duration: 0.22, ease: "easeOut" } },
      exit: { opacity: 0, y: 6, transition: { duration: 0.16 } },
   };

   const fadeMotion = {
      initial: { opacity: 0, y: 6 },
      animate: { opacity: 1, y: 0, transition: { duration: 0.18, ease: "easeOut" } },
      exit: { opacity: 0, y: 6, transition: { duration: 0.14 } },
   };

   if (loading) {
      return (
         <div className="uv-polldetail-scope uv-detail-wrap">
            <div className="uv-detail-card">
               <div className="uv-polls-state">Cargando…</div>
            </div>
         </div>
      );
   }

   if (!poll) {
      return (
         <div className="uv-polldetail-scope uv-detail-wrap">
            <motion.div className="uv-detail-card" {...pageMotion}>
               <button className="uv-btn" onClick={() => navigate(-1)}>
                  <FiArrowLeft /> Volver
               </button>

               {notice?.kind === "error" && (
                  <motion.div className="uv-alert uv-alert-error" {...fadeMotion}>
                     {notice.text}
                  </motion.div>
               )}
            </motion.div>
         </div>
      );
   }

   const fechaApertura = formatMaybeDate(poll.fechaApertura ?? poll.fechaInicio ?? poll.inicio ?? poll.createdAt);
   const fechaCierre = formatMaybeDate(poll.fechaCierre ?? poll.cierre ?? poll.closedAt);

   return (
      <div className="uv-polldetail-scope uv-detail-wrap">
         <motion.div className="uv-detail-card" {...pageMotion}>
            <div className="uv-polls-head">
               <button className="uv-btn" onClick={() => navigate(-1)}>
                  <FiArrowLeft /> Volver
               </button>

               <div className="uv-detail-actions">
                  <button className="uv-btn uv-btn-share" onClick={handleShare} title="Copiar link de la votación">
                     <FiShare2 />
                     Compartir
                  </button>
               </div>
            </div>

            <AnimatePresence mode="wait">
               {notice && (
                  <motion.div
                     key={`${notice.kind}:${notice.text}`}
                     className={`uv-alert ${
                        notice.kind === "error"
                           ? "uv-alert-error"
                           : notice.kind === "success"
                              ? "uv-alert-success"
                              : "uv-alert-info"
                     }`}
                     {...fadeMotion}
                  >
                     {notice.text}
                  </motion.div>
               )}
            </AnimatePresence>

            <div className="uv-tabs" role="tablist" aria-label="Secciones de la votación">
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

            <AnimatePresence mode="wait">
               {activeTab === "info" && (
                  <motion.div key="tab-info" {...fadeMotion}>
                     {poll.imagenUrl?.trim() && (
                        <div className="uv-detail-cover">
                           <img
                              src={poll.imagenUrl}
                              alt="Portada de la votación"
                              className="uv-detail-cover-img"
                              style={{ objectPosition: coverObjectPosition(poll) }}
                              loading="lazy"
                              decoding="async"
                           />
                        </div>
                     )}

                     <div className="uv-poll-card uv-flat" style={{ marginTop: 14, cursor: "default" }}>
                        <div className="uv-poll-card-top">
                           <div className="uv-poll-name uv-poll-name-lg">{poll.nombre}</div>
                           <span className={`uv-pills ${status.key}`}>{status.label}</span>
                        </div>

                        <div className="uv-poll-desc uv-poll-desc-lg">
                           {poll.descripcion?.trim() ? poll.descripcion : "Sin descripción."}
                        </div>

                        <div className="uv-poll-meta-row">
                           <span>Apertura: {fechaApertura}</span>
                           <span>Cierre: {fechaCierre}</span>
                        </div>

                        <div className="uv-detail-meta-grid">
                           <div className="uv-detail-meta-item">
                              <span className="uv-detail-meta-label">
                                 <FiUser /> Creador
                              </span>
                              <span className="uv-detail-meta-value">{creatorName}</span>
                           </div>

                           <div className="uv-detail-meta-item">
                              <span className="uv-detail-meta-label">
                                 <FiMapPin /> Campus
                              </span>
                              <span className="uv-detail-meta-value">{campusName}</span>
                           </div>

                           <div className="uv-detail-meta-item">
                              <span className="uv-detail-meta-label">
                                 <FiBookOpen /> Carrera
                              </span>
                              <span className="uv-detail-meta-value">{carreraName}</span>
                           </div>
                        </div>
                     </div>

                     <div style={{ marginTop: 14 }}>
                        <h2 className="uv-detail-h2">Opciones</h2>

                        {options.length === 0 ? (
                           <div className="uv-polls-state">Esta votación no tiene opciones todavía.</div>
                        ) : (
                           <div className="uv-detail-grid-2">
                              {options.map((o) => {
                                 const voteDisabled =
                                    submittingVote ||
                                    status.key !== "open" ||
                                    isOwner ||
                                    hasVoted;

                                 return (
                                    <motion.div
                                       key={o.id}
                                       className="uv-poll-card uv-flat"
                                       style={{ cursor: "default" }}
                                       initial={{ opacity: 0, y: 6 }}
                                       animate={{ opacity: 1, y: 0, transition: { duration: 0.16 } }}
                                    >
                                       <div className="uv-poll-card-top">
                                          <div className="uv-poll-name">{o.nombre}</div>
                                          {typeof o.orden === "number" && <span className="uv-pills">#{o.orden}</span>}
                                       </div>

                                       <div className="uv-poll-desc">
                                          {o.descripcion?.trim() ? o.descripcion : "Sin descripción."}
                                       </div>

                                       {o.imagenUrl?.trim() && (
                                          <div className="uv-option-media">
                                             <img
                                                src={o.imagenUrl}
                                                alt={`Imagen de ${o.nombre || "opción"}`}
                                                className="uv-option-img"
                                                loading="lazy"
                                                decoding="async"
                                             />
                                          </div>
                                       )}

                                       <button
                                          className={`uv-btn uv-btn-dark uv-vote-btn ${
                                             isOwner || hasVoted ? "uv-vote-btn-disabled-msg" : ""
                                          }`}
                                          style={{ width: "100%", justifyContent: "center", marginTop: 10 }}
                                          disabled={voteDisabled}
                                          onClick={() => handleVote(o.id)}
                                          title={getVoteButtonTitle()}
                                       >
                                          <FiCheckCircle />
                                          {getVoteButtonText()}
                                       </button>

                                       {!isAuthenticated && status.key === "open" && !hasVoted && !isOwner && (
                                          <div className="uv-hint" style={{ marginTop: 10 }}>
                                             Debes iniciar sesión para votar.
                                          </div>
                                       )}

                                       {isOwner && (
                                          <div className="uv-hint uv-hint-block">
                                             Como creador, no puedes votar en tu propia votación.
                                          </div>
                                       )}

                                       {hasVoted && !isOwner && (
                                          <div className="uv-hint uv-hint-block">
                                             Tu voto ya fue registrado en esta votación.
                                          </div>
                                       )}
                                    </motion.div>
                                 );
                              })}
                           </div>
                        )}
                     </div>
                  </motion.div>
               )}

               {activeTab === "stats" && canViewStats && (
                  <motion.div key="tab-stats" {...fadeMotion}>
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
                                          <div style={{ width: `${r.pct}%`, background: r.color }} />
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
                  </motion.div>
               )}
            </AnimatePresence>
         </motion.div>
      </div>
   );
}