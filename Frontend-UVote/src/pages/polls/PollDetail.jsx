import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { FiArrowLeft, FiBarChart2, FiCheckCircle, FiLock, FiPlus, FiTrash2 } from "react-icons/fi";

import { pollsApi } from "../../api/polls.api";
import { optionsApi } from "../../api/options.api";
import { votesApi } from "../../api/votes.api";
import { useAuth } from "../../auth/useAuth";

import "./polls.css";

export default function PollDetail() {
   const { id } = useParams();
   const encuestaId = Number(id);
   const navigate = useNavigate();

   const { isAuthenticated, usuario } = useAuth();

   const [poll, setPoll] = useState(null);
   const [options, setOptions] = useState([]);
   const [results, setResults] = useState([]);
   const [showResults, setShowResults] = useState(false);

   const [loading, setLoading] = useState(true);
   const [submittingVote, setSubmittingVote] = useState(false);
   const [closing, setClosing] = useState(false);

   // Opciones: crear/eliminar
   const [adding, setAdding] = useState(false);
   const [deletingId, setDeletingId] = useState(null);

   const [err, setErr] = useState("");

   // Form nueva opción
   const [optNombre, setOptNombre] = useState("");
   const [optDesc, setOptDesc] = useState("");
   const [optImg, setOptImg] = useState("");
   const [optOrden, setOptOrden] = useState("");

   const authUserId = useMemo(() => usuario?.id ?? usuario?.usuarioId ?? null, [usuario]);

   const isOwner = useMemo(() => {
      if (!poll || !authUserId) return false;
      return Number(authUserId) === Number(poll.usuarioId);
   }, [poll, authUserId]);

   const canManageOptions = isAuthenticated && isOwner && poll && !poll.cerrada;

   const totalVotes = useMemo(() => {
      return results.reduce((acc, r) => acc + Number(r.votos || 0), 0);
   }, [results]);

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

         optionsData.sort((a, b) => {
            const ao = a.orden ?? 999999;
            const bo = b.orden ?? 999999;
            return ao - bo;
         });

         setPoll(pollData);
         setOptions(optionsData);

         if (pollData?.cerrada) {
            setShowResults(true);
            const r = await votesApi.results(encuestaId);
            setResults(Array.isArray(r.data) ? r.data : []);
         }
      } catch (e) {
         setErr(e?.response?.data?.message || e.message || "Error cargando la encuesta");
      } finally {
         setLoading(false);
      }
   }

   async function reloadOptions() {
      const optionsRes = await optionsApi.listByEncuesta(encuestaId);
      const optionsData = Array.isArray(optionsRes.data) ? optionsRes.data : [];

      optionsData.sort((a, b) => {
         const ao = a.orden ?? 999999;
         const bo = b.orden ?? 999999;
         return ao - bo;
      });

      setOptions(optionsData);
   }

   useEffect(() => {
      if (!Number.isFinite(encuestaId)) return;
      loadPollAndOptions();
      // eslint-disable-next-line react-hooks/exhaustive-deps
   }, [encuestaId]);

   async function toggleResults() {
      const next = !showResults;
      setShowResults(next);

      if (next) {
         try {
            const r = await votesApi.results(encuestaId);
            setResults(Array.isArray(r.data) ? r.data : []);
         } catch (e) {
            setErr(e?.response?.data?.message || e.message || "Error cargando resultados");
         }
      }
   }

   async function handleVote(opcionId) {
      if (!isAuthenticated) return navigate("/login");
      if (poll?.cerrada) return;

      setSubmittingVote(true);
      setErr("");

      try {
         await votesApi.vote(encuestaId, opcionId);
         setShowResults(true);
         const r = await votesApi.results(encuestaId);
         setResults(Array.isArray(r.data) ? r.data : []);
      } catch (e) {
         setErr(e?.response?.data?.message || e.message || "No se pudo registrar el voto");
      } finally {
         setSubmittingVote(false);
      }
   }

   async function handleClosePoll() {
      setClosing(true);
      setErr("");

      try {
         const res = await pollsApi.close(encuestaId);
         setPoll(res.data);

         setShowResults(true);
         const r = await votesApi.results(encuestaId);
         setResults(Array.isArray(r.data) ? r.data : []);
      } catch (e) {
         setErr(e?.response?.data?.message || e.message || "No se pudo cerrar la encuesta");
      } finally {
         setClosing(false);
      }
   }

   // ====== OPCIONES (CRUD) ======
   const canAddOption =
      canManageOptions && optNombre.trim().length > 0 && optDesc.trim().length > 0 && !adding;

   async function handleAddOption(e) {
      e.preventDefault();
      if (!canAddOption) return;

      setAdding(true);
      setErr("");

      try {
         const ordenParsed = optOrden.trim() === "" ? null : Number.parseInt(optOrden.trim(), 10);

         const payload = {
            nombre: optNombre.trim(),
            descripcion: optDesc.trim(),
            imagenUrl: optImg.trim() || null,
            orden: Number.isFinite(ordenParsed) ? ordenParsed : null,
         };

         await optionsApi.create(encuestaId, payload);

         setOptNombre("");
         setOptDesc("");
         setOptImg("");
         setOptOrden("");

         await reloadOptions();
      } catch (e2) {
         setErr(e2?.response?.data?.message || e2.message || "No se pudo crear la opción");
      } finally {
         setAdding(false);
      }
   }

   async function handleDeleteOption(opcionId) {
      if (!canManageOptions) return;

      const ok = window.confirm("¿Eliminar esta opción? Esta acción no se puede deshacer.");
      if (!ok) return;

      setDeletingId(opcionId);
      setErr("");

      try {
         await optionsApi.delete(opcionId);
         await reloadOptions();
      } catch (e2) {
         setErr(e2?.response?.data?.message || e2.message || "No se pudo eliminar la opción");
      } finally {
         setDeletingId(null);
      }
   }

   // ============================
   // UI (con ficha contenedora)
   // ============================
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

   return (
      <div className="uv-polls-scope uv-detail-wrap">
         <div className="uv-detail-card">
            <div className="uv-polls-head" style={{ alignItems: "center" }}>
               <button className="uv-btn" onClick={() => navigate(-1)}>
                  <FiArrowLeft /> Volver
               </button>

               <div className="uv-polls-actions">
                  <button className="uv-btn" onClick={toggleResults}>
                     <FiBarChart2 /> {showResults ? "Ocultar resultados" : "Ver resultados"}
                  </button>

                  {isAuthenticated && isOwner && !poll.cerrada && (
                     <button
                        className="uv-btn uv-btn-dark"
                        onClick={handleClosePoll}
                        disabled={closing}
                        title="Cerrar encuesta"
                     >
                        <FiLock /> {closing ? "Cerrando…" : "Cerrar"}
                     </button>
                  )}
               </div>
            </div>

            {err && (
               <div className="uv-polls-error" style={{ marginTop: 12 }}>
                  {err}
               </div>
            )}

            {/* Card info encuesta */}
            <div className="uv-poll-card" style={{ marginTop: 12, cursor: "default" }}>
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
            </div>

            {/* Gestión de opciones (solo owner) */}
            {canManageOptions && (
               <div className="uv-poll-card" style={{ marginTop: 14, cursor: "default" }}>
                  <div className="uv-poll-card-top">
                     <div className="uv-poll-name" style={{ fontSize: 16 }}>
                        Administrar opciones
                     </div>
                     <span className="uv-pills">Creador</span>
                  </div>

                  <form onSubmit={handleAddOption} style={{ marginTop: 12, display: "grid", gap: 12 }}>
                     <div style={{ display: "grid", gap: 6 }}>
                        <label style={{ fontSize: 13, color: "rgba(48,47,44,0.85)", fontWeight: 600 }}>
                           Nombre de la opción (requerido)
                        </label>
                        <input
                           value={optNombre}
                           onChange={(e) => setOptNombre(e.target.value)}
                           placeholder="Ej: Perros"
                           maxLength={100}
                           className="uv-input"
                        />
                     </div>

                     <div style={{ display: "grid", gap: 6 }}>
                        <label style={{ fontSize: 13, color: "rgba(48,47,44,0.85)", fontWeight: 600 }}>
                           Descripción (requerido)
                        </label>
                        <textarea
                           value={optDesc}
                           onChange={(e) => setOptDesc(e.target.value)}
                           placeholder="Detalles de la opción…"
                           maxLength={500}
                           className="uv-textarea"
                           rows={3}
                        />
                     </div>

                     <div style={{ display: "grid", gap: 12, gridTemplateColumns: "1fr 1fr" }}>
                        <div style={{ display: "grid", gap: 6 }}>
                           <label style={{ fontSize: 13, color: "rgba(48,47,44,0.85)", fontWeight: 600 }}>
                              Imagen URL (opcional)
                           </label>
                           <input
                              value={optImg}
                              onChange={(e) => setOptImg(e.target.value)}
                              placeholder="https://..."
                              className="uv-input"
                           />
                        </div>

                        <div style={{ display: "grid", gap: 6 }}>
                           <label style={{ fontSize: 13, color: "rgba(48,47,44,0.85)", fontWeight: 600 }}>
                              Orden (opcional)
                           </label>
                           <input
                              value={optOrden}
                              onChange={(e) => setOptOrden(e.target.value)}
                              placeholder="Ej: 1"
                              className="uv-input"
                              inputMode="numeric"
                           />
                        </div>
                     </div>

                     <button
                        className="uv-btn uv-btn-dark"
                        type="submit"
                        disabled={!canAddOption}
                        style={{ justifyContent: "center" }}
                     >
                        <FiPlus />
                        {adding ? "Agregando…" : "Agregar opción"}
                     </button>
                  </form>
               </div>
            )}

            {/* Opciones / Votación */}
            <div style={{ marginTop: 14 }}>
               <h2 style={{ margin: "10px 0", color: "#302f2c", fontSize: 18 }}>Opciones</h2>

               {options.length === 0 ? (
                  <div className="uv-polls-state">Esta encuesta no tiene opciones todavía.</div>
               ) : (
                  <div className="uv-polls-grid" style={{ gridTemplateColumns: "repeat(2, 1fr)" }}>
                     {options.map((o) => {
                        const voteDisabled = submittingVote || poll.cerrada;
                        const showDelete = canManageOptions;

                        return (
                           <div key={o.id} className="uv-poll-card" style={{ cursor: "default" }}>
                              <div className="uv-poll-card-top">
                                 <div className="uv-poll-name">{o.nombre}</div>

                                 <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                                    {typeof o.orden === "number" && (
                                       <span className="uv-pills">#{o.orden}</span>
                                    )}

                                    {showDelete && (
                                       <button
                                          type="button"
                                          className="uv-btn"
                                          onClick={() => handleDeleteOption(o.id)}
                                          disabled={deletingId === o.id}
                                          title="Eliminar opción"
                                          style={{ padding: "8px 10px" }}
                                       >
                                          <FiTrash2 />
                                       </button>
                                    )}
                                 </div>
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
                                       style={{ fontSize: 12, color: "rgba(48,47,44,0.75)" }}
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
                                 <div style={{ marginTop: 10, fontSize: 12, color: "rgba(48,47,44,0.7)" }}>
                                    Debes iniciar sesión para votar.
                                 </div>
                              )}
                           </div>
                        );
                     })}
                  </div>
               )}
            </div>

            {/* Resultados */}
            {showResults && (
               <div style={{ marginTop: 18 }}>
                  <h2 style={{ margin: "10px 0", color: "#302f2c", fontSize: 18 }}>Resultados</h2>

                  {results.length === 0 ? (
                     <div className="uv-polls-state">Aún no hay votos registrados.</div>
                  ) : (
                     <div className="uv-poll-card" style={{ cursor: "default" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
                           <div style={{ color: "#302f2c", fontWeight: 700 }}>Total votos</div>
                           <div style={{ color: "rgba(48,47,44,0.8)" }}>{totalVotes}</div>
                        </div>

                        <div style={{ marginTop: 12, display: "grid", gap: 10 }}>
                           {results.map((r) => {
                              const votos = Number(r.votos || 0);
                              const pct = totalVotes > 0 ? Math.round((votos * 100) / totalVotes) : 0;

                              return (
                                 <div key={r.opcionId} style={{ display: "grid", gap: 6 }}>
                                    <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
                                       <div style={{ color: "#302f2c", fontWeight: 600 }}>{r.nombre}</div>
                                       <div style={{ color: "rgba(48,47,44,0.8)" }}>
                                          {votos} ({pct}%)
                                       </div>
                                    </div>

                                    <div
                                       style={{
                                          height: 10,
                                          borderRadius: 999,
                                          background: "rgba(48,47,44,0.10)",
                                          overflow: "hidden",
                                       }}
                                    >
                                       <div
                                          style={{
                                             height: "100%",
                                             width: `${pct}%`,
                                             background: "#302f2c",
                                          }}
                                       />
                                    </div>
                                 </div>
                              );
                           })}
                        </div>
                     </div>
                  )}
               </div>
            )}
         </div>
      </div>
   );
}
