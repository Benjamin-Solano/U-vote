import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
   FiArrowLeft,
   FiBarChart2,
   FiInfo,
   FiShare2,
   FiUsers,
} from "react-icons/fi";
import { AnimatePresence, motion } from "framer-motion";

import { pollsApi } from "../../api/polls.api";
import { optionsApi } from "../../api/options.api";
import { votesApi } from "../../api/votes.api";
import { pollAuthorizedEmailsApi } from "../../api/pollAuthorizedEmails.api";
import { useAuth } from "../../auth/useAuth";

import PollInfoTab from "../../components/polls/detail/PollInfoTab";
import PollStatsTab from "../../components/polls/detail/PollStatsTab";
import PollParticipantsTab from "../../components/polls/detail/PollParticipantsTab";
import PollShareTab from "../../components/polls/detail/PollShareTab";

import "./pollDetail.css";

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

function normalizeServerMessage(e) {
   const apiMsg = e?.response?.data?.message;
   const raw = apiMsg || e?.message || "Ocurrió un error";
   return String(raw);
}

function voteFriendlyMessage(serverMsg) {
   const s = String(serverMsg || "").toLowerCase();

   if (/ya\s+ha\s+votad/.test(s) || /ya\s+vot/.test(s) || /already\s+voted/.test(s) || /voto\s+duplic/.test(s)) {
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

export default function PollDetail() {
   const { id } = useParams();
   const encuestaId = Number(id);
   const navigate = useNavigate();

   const { isAuthenticated, usuario } = useAuth();

   const [poll, setPoll] = useState(null);
   const [options, setOptions] = useState([]);
   const [results, setResults] = useState([]);
   const [participants, setParticipants] = useState([]);
   const [participation, setParticipation] = useState(null);

   const [loading, setLoading] = useState(true);
   const [submittingVote, setSubmittingVote] = useState(false);
   const [loadingStats, setLoadingStats] = useState(false);
   const [loadingParticipants, setLoadingParticipants] = useState(false);

   const [notice, setNotice] = useState(null);
   const [activeTab, setActiveTab] = useState("info");
   const [chartType, setChartType] = useState("vertical");
   const [participationChartType, setParticipationChartType] = useState("pie");
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

   const participationData = useMemo(() => {
      const totalAutorizados = Number(participation?.totalAutorizados || 0);
      const totalYaVotaron = Number(participation?.totalYaVotaron || 0);
      const totalPendientes =
         Number(participation?.totalPendientes ?? totalAutorizados - totalYaVotaron);

      if (totalAutorizados <= 0) return [];

      return [
         {
            name: "Ya votaron",
            votos: totalYaVotaron,
            pct: totalAutorizados > 0 ? Math.round((totalYaVotaron * 100) / totalAutorizados) : 0,
            color: "rgba(199, 232, 213, 0.95)",
         },
         {
            name: "Pendientes",
            votos: totalPendientes,
            pct: totalAutorizados > 0 ? Math.round((totalPendientes * 100) / totalAutorizados) : 0,
            color: "rgba(255, 221, 193, 0.95)",
         },
      ];
   }, [participation]);

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

   const pollUrl = `${window.location.origin}/encuestas/${encuestaId}`;

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
         const [votesRes, participationRes] = await Promise.all([
            votesApi.results(encuestaId),
            pollAuthorizedEmailsApi.participation(encuestaId),
         ]);

         setResults(Array.isArray(votesRes.data) ? votesRes.data : []);
         setParticipation(participationRes?.data ?? null);
      } catch (e) {
         setNotice({ kind: "error", text: normalizeServerMessage(e) || "Error cargando resultados" });
      } finally {
         setLoadingStats(false);
      }
   }

   async function loadParticipants() {
      if (!canViewStats) return;
      setLoadingParticipants(true);
      setNotice(null);

      try {
         const [listRes, participationRes] = await Promise.all([
            pollAuthorizedEmailsApi.list(encuestaId),
            pollAuthorizedEmailsApi.participation(encuestaId),
         ]);

         setParticipants(Array.isArray(listRes.data) ? listRes.data : []);
         setParticipation(participationRes?.data ?? null);
      } catch (e) {
         setNotice({ kind: "error", text: normalizeServerMessage(e) || "Error cargando participantes autorizados" });
      } finally {
         setLoadingParticipants(false);
      }
   }

   useEffect(() => {
      if (!Number.isFinite(encuestaId)) return;
      loadPollAndOptions();
   }, [encuestaId]);

   useEffect(() => {
      if (activeTab === "stats") loadStats();
      if (activeTab === "participants") loadParticipants();
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

         if (activeTab === "participants" && canViewStats) {
            await loadParticipants();
         }
      } catch (e) {
         const serverMsg = normalizeServerMessage(e);

         if (/ya\s+ha\s+votad/i.test(serverMsg) || /ya\s+vot/i.test(serverMsg) || /already\s+voted/i.test(serverMsg)) {
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

   const fechaApertura = formatMaybeDate(
      poll.fechaApertura ?? poll.fechaInicio ?? poll.inicio ?? poll.createdAt
   );
   const fechaCierre = formatMaybeDate(
      poll.fechaCierre ?? poll.cierre ?? poll.closedAt
   );

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

            {/* ---- Masthead editorial ---- */}
            <div className="uv-detail-masthead">
               <div className="uv-detail-mh-rule uv-detail-mh-rule--thick" />
               <p className="uv-detail-mh-kicker">{campusName} · {carreraName}</p>
               <h1 className="uv-detail-mh-title">{poll.nombre}</h1>
               <div className="uv-detail-mh-rule uv-detail-mh-rule--double" />
               <div className="uv-detail-mh-meta">
                  <span>Por: {creatorName}</span>
                  <span className={`uv-detail-badge uv-detail-badge--${status.key}`}>{status.label}</span>
                  <span>{fechaApertura} — {fechaCierre}</span>
               </div>
            </div>

            <div className="uv-tabs-shell">
               <div className="uv-tabs" role="tablist" aria-label="Secciones de la votación">
                  <button
                     type="button"
                     className={`uv-tab ${activeTab === "info" ? "active" : ""}`}
                     onClick={() => setActiveTab("info")}
                     role="tab"
                     aria-selected={activeTab === "info"}
                  >
                     <FiInfo />
                     <span>Información</span>
                  </button>

                  {canViewStats && (
                     <button
                        type="button"
                        className={`uv-tab ${activeTab === "stats" ? "active" : ""}`}
                        onClick={() => setActiveTab("stats")}
                        role="tab"
                        aria-selected={activeTab === "stats"}
                     >
                        <FiBarChart2 />
                        <span>Estadísticas</span>
                     </button>
                  )}

                  {canViewStats && (
                     <button
                        type="button"
                        className={`uv-tab ${activeTab === "participants" ? "active" : ""}`}
                        onClick={() => setActiveTab("participants")}
                        role="tab"
                        aria-selected={activeTab === "participants"}
                     >
                        <FiUsers />
                        <span>Participantes</span>
                     </button>
                  )}

                  <button
                     type="button"
                     className={`uv-tab ${activeTab === "share" ? "active" : ""}`}
                     onClick={() => setActiveTab("share")}
                     role="tab"
                     aria-selected={activeTab === "share"}
                  >
                     <FiShare2 />
                     <span>Compartir</span>
                  </button>
               </div>
            </div>

            <AnimatePresence mode="wait">
               {activeTab === "info" && (
                  <PollInfoTab
                     poll={poll}
                     options={options}
                     status={status}
                     creatorName={creatorName}
                     campusName={campusName}
                     carreraName={carreraName}
                     fechaApertura={fechaApertura}
                     fechaCierre={fechaCierre}
                     isAuthenticated={isAuthenticated}
                     isOwner={isOwner}
                     hasVoted={hasVoted}
                     submittingVote={submittingVote}
                     handleVote={handleVote}
                     getVoteButtonText={getVoteButtonText}
                     getVoteButtonTitle={getVoteButtonTitle}
                  />
               )}

               {activeTab === "stats" && canViewStats && (
                  <PollStatsTab
                     loadingStats={loadingStats}
                     chartData={chartData}
                     totalVotes={totalVotes}
                     chartType={chartType}
                     setChartType={setChartType}
                     participationData={participationData}
                     participationChartType={participationChartType}
                     setParticipationChartType={setParticipationChartType}
                  />
               )}

               {activeTab === "participants" && canViewStats && (
                  <PollParticipantsTab
                     pollName={poll?.nombre}
                     rows={participants}
                     loading={loadingParticipants}
                  />
               )}

               {activeTab === "share" && (
                  <PollShareTab
                     pollName={poll?.nombre}
                     pollUrl={pollUrl}
                     onNotice={setNotice}
                  />
               )}
            </AnimatePresence>
         </motion.div>
      </div>
   );
}