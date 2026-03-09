import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
   FiArrowRight,
   FiBookOpen,
   FiFilter,
   FiMapPin,
   FiRefreshCw,
   FiSearch,
   FiTag,
   FiX,
} from "react-icons/fi";
import { useNavigate } from "react-router-dom";

import { pollsApi } from "../../api/polls.api";
import { campusApi } from "../../api/campus.api";

import "./pollExplorer.css";

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

export default function PollExplorer() {
   const navigate = useNavigate();

   const [polls, setPolls] = useState([]);
   const [loading, setLoading] = useState(true);
   const [error, setError] = useState("");

   const [campusOptions, setCampusOptions] = useState([]);
   const [carreraOptions, setCarreraOptions] = useState([]);
   const [loadingCampus, setLoadingCampus] = useState(false);
   const [loadingCarreras, setLoadingCarreras] = useState(false);

   const [search, setSearch] = useState("");
   const [selectedCampusId, setSelectedCampusId] = useState("");
   const [selectedCampusName, setSelectedCampusName] = useState("");
   const [selectedCarreraId, setSelectedCarreraId] = useState("");
   const [selectedCarreraName, setSelectedCarreraName] = useState("");

   useEffect(() => {
      let ignore = false;

      const loadPolls = async () => {
         setLoading(true);
         setError("");

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
               setError(
                  err?.response?.data?.message ||
                  "No se pudieron cargar las encuestas."
               );
               setPolls([]);
            }
         } finally {
            if (!ignore) setLoading(false);
         }
      };

      loadPolls();

      return () => {
         ignore = true;
      };
   }, []);

   useEffect(() => {
      let ignore = false;

      const loadCampus = async () => {
         setLoadingCampus(true);

         try {
            const res = await campusApi.list();
            const data = Array.isArray(res?.data) ? res.data : [];

            if (!ignore) {
               setCampusOptions(data);
            }
         } catch {
            if (!ignore) setCampusOptions([]);
         } finally {
            if (!ignore) setLoadingCampus(false);
         }
      };

      loadCampus();

      return () => {
         ignore = true;
      };
   }, []);

   useEffect(() => {
      let ignore = false;

      if (!selectedCampusId) {
         setCarreraOptions([]);
         setSelectedCarreraId("");
         setSelectedCarreraName("");
         return;
      }

      const loadCarreras = async () => {
         setLoadingCarreras(true);

         try {
            const res = await campusApi.getCarrerasByCampus(selectedCampusId);
            const data = Array.isArray(res?.data) ? res.data : [];

            const mapped = data.map((item) => ({
               campusCarreraId: item.campusCarreraId,
               carreraId: item.carreraId,
               carreraNombre: item.carreraNombre,
            }));

            if (!ignore) {
               setCarreraOptions(mapped);

               const exists = mapped.some(
                  (item) => String(item.carreraId) === String(selectedCarreraId)
               );

               if (!exists) {
                  setSelectedCarreraId("");
                  setSelectedCarreraName("");
               }
            }
         } catch {
            if (!ignore) {
               setCarreraOptions([]);
               setSelectedCarreraId("");
               setSelectedCarreraName("");
            }
         } finally {
            if (!ignore) setLoadingCarreras(false);
         }
      };

      loadCarreras();

      return () => {
         ignore = true;
      };
   }, [selectedCampusId, selectedCarreraId]);

   const filteredPolls = useMemo(() => {
      const q = search.trim().toLowerCase();

      return polls.filter((poll) => {
         const byName = !q || (poll?.nombre || "").toLowerCase().includes(q);

         const byCampus =
            !selectedCampusName ||
            (poll?.campusNombre || "").toLowerCase() === selectedCampusName.toLowerCase();

         const byCarrera =
            !selectedCarreraName ||
            (poll?.carreraNombre || "").toLowerCase() === selectedCarreraName.toLowerCase();

         return byName && byCampus && byCarrera;
      });
   }, [polls, search, selectedCampusName, selectedCarreraName]);

   const appliedFilters = useMemo(() => {
      const chips = [];

      if (search.trim()) {
         chips.push({
            key: "search",
            label: `Nombre: ${search.trim()}`,
            onRemove: () => setSearch(""),
         });
      }

      if (selectedCampusName) {
         chips.push({
            key: "campus",
            label: selectedCampusName,
            onRemove: () => {
               setSelectedCampusId("");
               setSelectedCampusName("");
               setSelectedCarreraId("");
               setSelectedCarreraName("");
            },
         });
      }

      if (selectedCarreraName) {
         chips.push({
            key: "carrera",
            label: selectedCarreraName,
            onRemove: () => {
               setSelectedCarreraId("");
               setSelectedCarreraName("");
            },
         });
      }

      return chips;
   }, [search, selectedCampusName, selectedCarreraName]);

   const groupedCampus = useMemo(() => {
      const map = new Map();

      filteredPolls.forEach((poll) => {
         const key = poll?.campusNombre || "Sin campus";
         map.set(key, (map.get(key) || 0) + 1);
      });

      return Array.from(map.entries()).map(([name, count]) => ({ name, count }));
   }, [filteredPolls]);

   const groupedCarrera = useMemo(() => {
      const map = new Map();

      filteredPolls.forEach((poll) => {
         const key = poll?.carreraNombre || "Sin carrera";
         map.set(key, (map.get(key) || 0) + 1);
      });

      return Array.from(map.entries()).map(([name, count]) => ({ name, count }));
   }, [filteredPolls]);

   const clearFilters = () => {
      setSearch("");
      setSelectedCampusId("");
      setSelectedCampusName("");
      setSelectedCarreraId("");
      setSelectedCarreraName("");
   };

   return (
      <div className="uv-explorer-page">
         <div className="uv-explorer-shell">
            <aside className="uv-explorer-sidebar">
               <div className="uv-explorer-sidebar-head">
                  <h2>
                     <FiFilter />
                     Filtros
                  </h2>

                  <button
                     type="button"
                     className="uv-explorer-clear-btn"
                     onClick={clearFilters}
                  >
                     <FiRefreshCw />
                     Limpiar
                  </button>
               </div>

               <div className="uv-explorer-filter-block">
                  <label className="uv-explorer-label">Buscar por nombre</label>
                  <div className="uv-explorer-search-wrap">
                     <FiSearch className="uv-explorer-search-icon" />
                     <input
                        type="text"
                        className="uv-explorer-input"
                        placeholder="Ej: Asociación de estudiantes"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                     />
                  </div>
               </div>

               <div className="uv-explorer-filter-block">
                  <label className="uv-explorer-label">Campus</label>
                  <div className="uv-explorer-select-wrap">
                     <FiMapPin className="uv-explorer-select-icon" />
                     <select
                        className="uv-explorer-select"
                        value={selectedCampusId}
                        onChange={(e) => {
                           const value = e.target.value;
                           const campus = campusOptions.find(
                              (item) => String(item.id) === String(value)
                           );

                           setSelectedCampusId(value);
                           setSelectedCampusName(campus?.nombre || "");
                           setSelectedCarreraId("");
                           setSelectedCarreraName("");
                        }}
                        disabled={loadingCampus}
                     >
                        <option value="">
                           {loadingCampus ? "Cargando campus..." : "Todos los campus"}
                        </option>
                        {campusOptions.map((campus) => (
                           <option key={campus.id} value={campus.id}>
                              {campus.nombre}
                           </option>
                        ))}
                     </select>
                  </div>
               </div>

               <div className="uv-explorer-filter-block">
                  <label className="uv-explorer-label">Carrera</label>
                  <div className="uv-explorer-select-wrap">
                     <FiBookOpen className="uv-explorer-select-icon" />
                     <select
                        className="uv-explorer-select"
                        value={selectedCarreraId}
                        onChange={(e) => {
                           const value = e.target.value;
                           const carrera = carreraOptions.find(
                              (item) => String(item.carreraId) === String(value)
                           );

                           setSelectedCarreraId(value);
                           setSelectedCarreraName(carrera?.carreraNombre || "");
                        }}
                        disabled={!selectedCampusId || loadingCarreras}
                     >
                        <option value="">
                           {!selectedCampusId
                              ? "Selecciona primero un campus"
                              : loadingCarreras
                                 ? "Cargando carreras..."
                                 : "Todas las carreras"}
                        </option>
                        {carreraOptions.map((item) => (
                           <option key={item.campusCarreraId} value={item.carreraId}>
                              {item.carreraNombre}
                           </option>
                        ))}
                     </select>
                  </div>
               </div>

               <div className="uv-explorer-filter-block">
                  <h3 className="uv-explorer-side-title">Campus disponibles</h3>
                  <div className="uv-explorer-side-list">
                     {groupedCampus.length === 0 ? (
                        <div className="uv-explorer-side-empty">Sin resultados</div>
                     ) : (
                        groupedCampus.map((item) => (
                           <button
                              key={item.name}
                              type="button"
                              className={`uv-explorer-side-chip ${
                                 selectedCampusName === item.name ? "active" : ""
                              }`}
                              onClick={() => {
                                 const campus = campusOptions.find(
                                    (c) => c.nombre === item.name
                                 );

                                 setSelectedCampusId(campus ? String(campus.id) : "");
                                 setSelectedCampusName(item.name);
                                 setSelectedCarreraId("");
                                 setSelectedCarreraName("");
                              }}
                           >
                              <span>{item.name}</span>
                              <strong>{item.count}</strong>
                           </button>
                        ))
                     )}
                  </div>
               </div>

               <div className="uv-explorer-filter-block">
                  <h3 className="uv-explorer-side-title">Carreras disponibles</h3>
                  <div className="uv-explorer-side-list">
                     {groupedCarrera.length === 0 ? (
                        <div className="uv-explorer-side-empty">Sin resultados</div>
                     ) : (
                        groupedCarrera.map((item) => (
                           <button
                              key={item.name}
                              type="button"
                              className={`uv-explorer-side-chip ${
                                 selectedCarreraName === item.name ? "active" : ""
                              }`}
                              onClick={() => setSelectedCarreraName(item.name)}
                           >
                              <span>{item.name}</span>
                              <strong>{item.count}</strong>
                           </button>
                        ))
                     )}
                  </div>
               </div>
            </aside>

            <section className="uv-explorer-content">
               <div className="uv-explorer-topbar">
                  <div>
                     <h1>Explorar encuestas</h1>
                     <p>Busca por nombre o filtra por campus y carrera.</p>
                  </div>

                  <div className="uv-explorer-count">
                     {loading ? "Cargando..." : `${filteredPolls.length} resultados`}
                  </div>
               </div>

               {appliedFilters.length > 0 && (
                  <div className="uv-explorer-applied">
                     <span className="uv-explorer-applied-label">Filtros aplicados:</span>

                     <div className="uv-explorer-applied-list">
                        {appliedFilters.map((chip) => (
                           <button
                              key={chip.key}
                              type="button"
                              className="uv-explorer-filter-chip"
                              onClick={chip.onRemove}
                           >
                              <FiTag />
                              <span>{chip.label}</span>
                              <FiX />
                           </button>
                        ))}
                     </div>
                  </div>
               )}

               {error && <div className="uv-explorer-alert">{error}</div>}

               {loading ? (
                  <div className="uv-explorer-grid">
                     {Array.from({ length: 6 }).map((_, index) => (
                        <div key={index} className="uv-explorer-card uv-explorer-card--skeleton">
                           <div className="uv-explorer-cover-skeleton" />
                           <div className="uv-explorer-line-skeleton short" />
                           <div className="uv-explorer-line-skeleton" />
                           <div className="uv-explorer-line-skeleton tiny" />
                        </div>
                     ))}
                  </div>
               ) : filteredPolls.length === 0 ? (
                  <div className="uv-explorer-empty">
                     <h3>No se encontraron encuestas</h3>
                     <p>Prueba con otro nombre o cambia los filtros seleccionados.</p>
                     <button type="button" className="uv-explorer-clear-main" onClick={clearFilters}>
                        <FiRefreshCw />
                        Limpiar filtros
                     </button>
                  </div>
               ) : (
                  <div className="uv-explorer-grid">
                     {filteredPolls.map((poll, index) => {
                        const status = getPollStatus(poll);

                        return (
                           <motion.article
                              key={poll.id}
                              className="uv-explorer-card"
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ duration: 0.22, delay: index * 0.02 }}
                           >
                              <div className="uv-explorer-cover">
                                 {poll?.imagenUrl ? (
                                    <img
                                       src={poll.imagenUrl}
                                       alt={poll.nombre}
                                       className="uv-explorer-cover-img"
                                    />
                                 ) : (
                                    <div className="uv-explorer-cover-fallback">
                                       <FiSearch />
                                    </div>
                                 )}

                                 <span className={`uv-explorer-status uv-explorer-status--${status.key}`}>
                                    {status.label}
                                 </span>
                              </div>

                              <div className="uv-explorer-card-body">
                                 <h3>{poll.nombre}</h3>

                                 <p>
                                    {poll?.descripcion?.trim()
                                       ? poll.descripcion
                                       : "Encuesta sin descripción."}
                                 </p>

                                 <div className="uv-explorer-meta">
                                    <span>
                                       <FiMapPin />
                                       {poll?.campusNombre || "Sin campus"}
                                    </span>

                                    <span>
                                       <FiBookOpen />
                                       {poll?.carreraNombre || "Sin carrera"}
                                    </span>
                                 </div>

                                 <div className="uv-explorer-footer">
                                    <small>Inicio: {formatDateShort(poll?.fechaInicio)}</small>

                                    <button
                                       type="button"
                                       className="uv-explorer-open-btn"
                                       onClick={() => navigate(`/encuestas/${poll.id}`)}
                                    >
                                       Ver detalle
                                       <FiArrowRight />
                                    </button>
                                 </div>
                              </div>
                           </motion.article>
                        );
                     })}
                  </div>
               )}
            </section>
         </div>
      </div>
   );
}