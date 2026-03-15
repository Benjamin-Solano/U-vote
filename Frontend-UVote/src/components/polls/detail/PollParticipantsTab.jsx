import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
   FiCheckCircle,
   FiChevronLeft,
   FiChevronRight,
   FiClock,
   FiFileText,
   FiFilter,
   FiRotateCcw,
   FiSearch,
   FiUsers,
} from "react-icons/fi";
import {
   exportParticipantsToCsv,
   exportParticipantsToPdf,
} from "../../../utils/pollDetailExport";

const PAGE_SIZE = 10;

function escapeRegExp(text) {
   return String(text).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function highlightMatch(text, query) {
   const value = String(text ?? "");
   const q = String(query ?? "").trim();

   if (!q) return value;

   const regex = new RegExp(`(${escapeRegExp(q)})`, "ig");
   const parts = value.split(regex);

   return parts.map((part, index) =>
      regex.test(part) ? (
         <mark key={`${part}-${index}`} className="uv-highlight">
            {part}
         </mark>
      ) : (
         <span key={`${part}-${index}`}>{part}</span>
      )
   );
}

export default function PollParticipantsTab({
   pollName,
   rows = [],
   loading = false,
}) {
   const [query, setQuery] = useState("");
   const [sortDirection, setSortDirection] = useState("asc");
   const [voteFilter, setVoteFilter] = useState("all");
   const [page, setPage] = useState(1);

   const filteredRows = useMemo(() => {
      let data = Array.isArray(rows) ? [...rows] : [];

      const q = query.trim().toLowerCase();
      if (q) {
         data = data.filter((row) =>
            String(row.correo ?? "").toLowerCase().includes(q)
         );
      }

      if (voteFilter === "only-voted") {
         data = data.filter((row) => row.yaVoto);
      } else if (voteFilter === "only-pending") {
         data = data.filter((row) => !row.yaVoto);
      }

      data.sort((a, b) => {
         if (voteFilter === "voted-first") {
            const byVote = Number(b.yaVoto) - Number(a.yaVoto);
            if (byVote !== 0) return byVote;
         }

         if (voteFilter === "pending-first") {
            const byVote = Number(a.yaVoto) - Number(b.yaVoto);
            if (byVote !== 0) return byVote;
         }

         const left = String(a.correo ?? "").toLowerCase();
         const right = String(b.correo ?? "").toLowerCase();

         return sortDirection === "asc"
            ? left.localeCompare(right)
            : right.localeCompare(left);
      });

      return data;
   }, [rows, query, sortDirection, voteFilter]);

   const total = rows.length;
   const voted = rows.filter((r) => r.yaVoto).length;
   const pending = total - voted;
   const participationPct = total > 0 ? Math.round((voted * 100) / total) : 0;
   const usaListaExcel = total > 0;

   const totalFiltered = filteredRows.length;
   const totalPages = Math.max(1, Math.ceil(totalFiltered / PAGE_SIZE));
   const safePage = Math.min(page, totalPages);
   const startIndex = (safePage - 1) * PAGE_SIZE;
   const paginatedRows = filteredRows.slice(startIndex, startIndex + PAGE_SIZE);

   useEffect(() => {
      if (page > totalPages) {
         setPage(1);
      }
   }, [page, totalPages]);

   function handleChangeQuery(value) {
      setQuery(value);
      setPage(1);
   }

   function handleChangeSort(value) {
      setSortDirection(value);
      setPage(1);
   }

   function handleChangeVoteFilter(value) {
      setVoteFilter(value);
      setPage(1);
   }

   function handleClearFilters() {
      setQuery("");
      setSortDirection("asc");
      setVoteFilter("all");
      setPage(1);
   }

   return (
      <motion.div
         key="tab-participants"
         initial={{ opacity: 0, y: 6 }}
         animate={{ opacity: 1, y: 0 }}
         exit={{ opacity: 0, y: 6 }}
      >
         <div
            className="uv-poll-card uv-flat uv-admin-panel"
            style={{ marginTop: 14, cursor: "default" }}
         >
            <div className="uv-admin-panel-head">
               <div className="uv-admin-panel-title-wrap">
                  <div className="uv-admin-panel-icon">
                     <FiUsers />
                  </div>

                  <div className="uv-admin-panel-copy">
                     <div className="uv-stats-title">Participantes autorizados</div>
                     <div className="uv-participants-sub">
                        Control de correos cargados desde Excel y estado de participación.
                     </div>

                     <div className="uv-participants-badges">
                        <span
                           className={`uv-participants-badge ${
                              usaListaExcel ? "active" : "inactive"
                           }`}
                        >
                           {usaListaExcel ? "Lista Excel activa" : "Sin lista Excel"}
                        </span>

                        <span className="uv-participants-badge soft">
                           {total} autorizado{total === 1 ? "" : "s"}
                        </span>
                     </div>
                  </div>
               </div>

               <div className="uv-participants-export">
                  <button
                     type="button"
                     className="uv-btn"
                     onClick={() => exportParticipantsToCsv(filteredRows, pollName)}
                     disabled={filteredRows.length === 0}
                  >
                     <FiFileText />
                     Exportar CSV
                  </button>

                  <button
                     type="button"
                     className="uv-btn"
                     onClick={() => exportParticipantsToPdf(filteredRows, pollName)}
                     disabled={filteredRows.length === 0}
                  >
                     <FiFileText />
                     Exportar PDF
                  </button>
               </div>
            </div>

            <div className="uv-admin-kpis uv-admin-kpis-compact">
               <div className="uv-admin-kpi">
                  <div className="uv-admin-kpi-top">
                     <span className="uv-admin-kpi-icon">
                        <FiUsers />
                     </span>
                     <span className="uv-admin-kpi-label">Total autorizados</span>
                  </div>
                  <strong>{total}</strong>
               </div>

               <div className="uv-admin-kpi">
                  <div className="uv-admin-kpi-top">
                     <span className="uv-admin-kpi-icon success">
                        <FiCheckCircle />
                     </span>
                     <span className="uv-admin-kpi-label">Ya votaron</span>
                  </div>
                  <strong>{voted}</strong>
               </div>

               <div className="uv-admin-kpi">
                  <div className="uv-admin-kpi-top">
                     <span className="uv-admin-kpi-icon warning">
                        <FiClock />
                     </span>
                     <span className="uv-admin-kpi-label">Pendientes</span>
                  </div>
                  <strong>{pending}</strong>
               </div>

               <div className="uv-admin-kpi">
                  <div className="uv-admin-kpi-top">
                     <span className="uv-admin-kpi-icon dark">
                        <FiFilter />
                     </span>
                     <span className="uv-admin-kpi-label">Participación</span>
                  </div>
                  <strong>{participationPct}%</strong>
               </div>
            </div>

            <div className="uv-participants-toolbar uv-participants-toolbar-admin">
               <div className="uv-participants-search">
                  <FiSearch />
                  <input
                     type="text"
                     value={query}
                     onChange={(e) => handleChangeQuery(e.target.value)}
                     placeholder="Buscar por correo..."
                  />
               </div>

               <select
                  className="uv-participants-select"
                  value={sortDirection}
                  onChange={(e) => handleChangeSort(e.target.value)}
               >
                  <option value="asc">Correo A → Z</option>
                  <option value="desc">Correo Z → A</option>
               </select>

               <select
                  className="uv-participants-select"
                  value={voteFilter}
                  onChange={(e) => handleChangeVoteFilter(e.target.value)}
               >
                  <option value="all">Todos</option>
                  <option value="voted-first">Primero los que votaron</option>
                  <option value="pending-first">Primero los pendientes</option>
                  <option value="only-voted">Solo los que votaron</option>
                  <option value="only-pending">Solo pendientes</option>
               </select>
            </div>

            <div className="uv-participants-meta">
               <div className="uv-participants-meta-text">
                  Mostrando <strong>{totalFiltered}</strong> resultado
                  {totalFiltered === 1 ? "" : "s"}
                  {query.trim() ? (
                     <>
                        {" "}
                        para <span className="uv-meta-query">“{query.trim()}”</span>
                     </>
                  ) : null}
               </div>

               <button
                  type="button"
                  className="uv-btn uv-btn-soft"
                  onClick={handleClearFilters}
                  disabled={!query && sortDirection === "asc" && voteFilter === "all"}
               >
                  <FiRotateCcw />
                  Limpiar filtros
               </button>
            </div>

            <div className="uv-participants-table-wrap uv-participants-table-wrap-admin">
               {loading ? (
                  <div className="uv-polls-state">Cargando participantes…</div>
               ) : filteredRows.length === 0 ? (
                  <div className="uv-polls-state">
                     No hay participantes autorizados para mostrar.
                  </div>
               ) : (
                  <>
                     <div className="uv-participants-table-desktop">
                        <table className="uv-participants-table">
                           <thead>
                              <tr>
                                 <th>#</th>
                                 <th>Correo institucional</th>
                                 <th>Estado</th>
                              </tr>
                           </thead>
                           <tbody>
                              {paginatedRows.map((row, index) => (
                                 <tr key={`${row.correo}-${index}`}>
                                    <td>{startIndex + index + 1}</td>
                                    <td>
                                       <div className="uv-participant-mail-cell">
                                          <span className="uv-participant-mail-main">
                                             {highlightMatch(row.correo, query)}
                                          </span>
                                       </div>
                                    </td>
                                    <td>
                                       <span
                                          className={`uv-vote-state ${
                                             row.yaVoto ? "yes" : "no"
                                          }`}
                                       >
                                          {row.yaVoto ? "Ha votado" : "Pendiente"}
                                       </span>
                                    </td>
                                 </tr>
                              ))}
                           </tbody>
                        </table>
                     </div>

                     <div className="uv-participants-mobile-list">
                        {paginatedRows.map((row, index) => (
                           <div
                              className="uv-participant-mobile-card"
                              key={`${row.correo}-mobile-${index}`}
                           >
                              <div className="uv-participant-mobile-top">
                                 <div className="uv-participant-mobile-index">
                                    #{startIndex + index + 1}
                                 </div>

                                 <span
                                    className={`uv-vote-state ${
                                       row.yaVoto ? "yes" : "no"
                                    }`}
                                 >
                                    {row.yaVoto ? "Ha votado" : "Pendiente"}
                                 </span>
                              </div>

                              <div className="uv-participant-mobile-mail">
                                 {highlightMatch(row.correo, query)}
                              </div>
                           </div>
                        ))}
                     </div>

                     <div className="uv-pagination">
                        <div className="uv-pagination-info">
                           Página <strong>{safePage}</strong> de{" "}
                           <strong>{totalPages}</strong>
                        </div>

                        <div className="uv-pagination-actions">
                           <button
                              type="button"
                              className="uv-btn uv-btn-soft"
                              onClick={() =>
                                 setPage((prev) => Math.max(1, prev - 1))
                              }
                              disabled={safePage <= 1}
                           >
                              <FiChevronLeft />
                              Anterior
                           </button>

                           <button
                              type="button"
                              className="uv-btn uv-btn-soft"
                              onClick={() =>
                                 setPage((prev) => Math.min(totalPages, prev + 1))
                              }
                              disabled={safePage >= totalPages}
                           >
                              Siguiente
                              <FiChevronRight />
                           </button>
                        </div>
                     </div>
                  </>
               )}
            </div>
         </div>
      </motion.div>
   );
}