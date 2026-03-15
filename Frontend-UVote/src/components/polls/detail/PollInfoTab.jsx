import { motion } from "framer-motion";
import { FiBookOpen, FiCheckCircle, FiMapPin, FiUser } from "react-icons/fi";

function coverObjectPosition(poll) {
   const pos = Number(poll?.coverPos);
   const y = Number.isFinite(pos) ? Math.max(0, Math.min(100, pos)) : 50;
   return `50% ${y}%`;
}

export default function PollInfoTab({
   poll,
   options,
   status,
   creatorName,
   campusName,
   carreraName,
   fechaApertura,
   fechaCierre,
   isAuthenticated,
   isOwner,
   hasVoted,
   submittingVote,
   handleVote,
   getVoteButtonText,
   getVoteButtonTitle,
}) {
   if (!poll) return null;

   return (
      <motion.div
         key="tab-info"
         initial={{ opacity: 0, y: 6 }}
         animate={{ opacity: 1, y: 0 }}
         exit={{ opacity: 0, y: 6 }}
      >
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
                     const voteDisabled = submittingVote || status.key !== "open" || isOwner || hasVoted;

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
   );
}