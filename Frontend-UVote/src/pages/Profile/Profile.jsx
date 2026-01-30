import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
   FiEdit3,
   FiSave,
   FiXCircle,
   FiUpload,
   FiImage,
   FiSearch,
   FiUser,
   FiLogOut,
   FiFileText,
   FiBarChart2,
} from "react-icons/fi";

import { useAuth } from "../../auth/useAuth";
import { usersApi } from "../../api/users.api";
import { pollsApi } from "../../api/polls.api";

import "./profile.css";

export default function Profile() {
   const { usuario, logout } = useAuth();
   const navigate = useNavigate();

   const [profile, setProfile] = useState(usuario);
   const [polls, setPolls] = useState([]);

   const [loading, setLoading] = useState(true);
   const [pollsLoading, setPollsLoading] = useState(true);

   // editar nombre
   const [editMode, setEditMode] = useState(false);
   const [nombreUsuario, setNombreUsuario] = useState(usuario?.nombreUsuario ?? "");
   const [savingName, setSavingName] = useState(false);

   // foto (upload + preview)
   const [selectedFile, setSelectedFile] = useState(null);
   const [previewUrl, setPreviewUrl] = useState("");
   const [uploadingPhoto, setUploadingPhoto] = useState(false);
   const [photoVersion, setPhotoVersion] = useState(0);

   // editar descripcion
   const [editDescMode, setEditDescMode] = useState(false);
   const [descripcion, setDescripcion] = useState("");
   const [savingDesc, setSavingDesc] = useState(false);

   // buscador de encuestas
   const [query, setQuery] = useState("");

   const PAGE_SIZE = 5;
   const [page, setPage] = useState(1);

   const [error, setError] = useState("");
   const [okMsg, setOkMsg] = useState("");

   const userId = profile?.id;
   const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:8080";

   const DESC_MAX = 500;

   // ✅ Normaliza errores y captura sesión expirada (403/401)
   const normalizeError = (err, fallback = "Ocurrió un error.") => {
      const status = err?.response?.status;

      if (status === 403) return "Sesión Expirada, vuelva a iniciar sesión";
      if (status === 401) return "Sesión Expirada, vuelva a iniciar sesión";

      return (
         err?.response?.data?.message ||
         err?.response?.data?.error ||
         err?.message ||
         fallback
      );
   };

   const syncLocalUser = (newUser) => {
      try {
         localStorage.setItem("usuario", JSON.stringify(newUser));
      } catch (_) { }
   };

   // ✅ Pendiente: estado explícito o por fecha de apertura en el futuro
   const isPollPending = (p) => {
      const s = String(p?.estado ?? p?.estadoEncuesta ?? "").toLowerCase();
      if (s.includes("pend")) return true;
      if (p?.pendiente === true) return true;

      const startRaw = p?.fechaApertura ?? p?.fechaInicio ?? p?.inicio;
      if (!startRaw) return false;
      const start = new Date(startRaw).getTime();
      if (!Number.isFinite(start)) return false;
      return start > Date.now();
   };

   const estadoLabel = (p) => {
      if (isPollPending(p)) return "Pendiente";
      if (p?.cerrada === true) return "Cerrada";
      if (p?.estado) return p.estado;
      if (p?.fechaCierre) return "Cerrada";
      return "Activa";
   };

   // ✅ Para colorear badge
   const isPollClosed = (p) => {
      if (p?.cerrada === true) return true;
      if (p?.fechaCierre) return true;
      const s = String(p?.estado ?? p?.estadoEncuesta ?? "").toLowerCase();
      if (s.includes("cerrad") || s.includes("closed") || s.includes("finaliz")) return true;
      return false;
   };

   useEffect(() => {
      const run = async () => {
         setLoading(true);
         setError("");
         setOkMsg("");

         try {
            if (usuario?.nombreUsuario) {
               const res = await usersApi.getByNombreUsuario(usuario.nombreUsuario);
               const data = res?.data ?? usuario;

               setProfile(data);
               setNombreUsuario(data?.nombreUsuario ?? usuario.nombreUsuario ?? "");
               setDescripcion(data?.descripcion ?? "");
               syncLocalUser(data);
            } else {
               setProfile(usuario);
            }
         } catch (err) {
            const msg = normalizeError(err, "No se pudo cargar el perfil.");
            setError(msg);
            setProfile(usuario);
         } finally {
            setLoading(false);
         }
      };

      run();
      // eslint-disable-next-line react-hooks/exhaustive-deps
   }, [usuario?.nombreUsuario]);

   useEffect(() => {
      const run = async () => {
         if (!userId) return;
         setPollsLoading(true);

         try {
            const res = await pollsApi.listByCreadorId(userId);
            setPolls(res?.data ?? []);
         } catch (err) {
            const msg = normalizeError(err, "No se pudieron cargar tus encuestas.");
            setError(msg);
            setPolls([]);
         } finally {
            setPollsLoading(false);
         }
      };

      run();
   }, [userId]);

   // preview de imagen seleccionada
   useEffect(() => {
      if (!selectedFile) {
         setPreviewUrl("");
         return;
      }
      const url = URL.createObjectURL(selectedFile);
      setPreviewUrl(url);
      return () => URL.revokeObjectURL(url);
   }, [selectedFile]);

   const canSaveName = useMemo(() => {
      const v = nombreUsuario.trim();
      return v.length >= 3 && v.length <= 100;
   }, [nombreUsuario]);

   const descRemaining = useMemo(() => {
      const len = (descripcion ?? "").length;
      return Math.max(0, DESC_MAX - len);
   }, [descripcion]);

   const canSaveDesc = useMemo(() => {
      return (descripcion ?? "").length <= DESC_MAX;
   }, [descripcion]);

   const fotoSrc = useMemo(() => {
      const path = profile?.fotoPerfil;
      if (!path) return "";
      const raw = path.startsWith("http") ? path : `${BACKEND_URL}${path}`;
      return `${raw}?v=${photoVersion}`;
   }, [profile?.fotoPerfil, BACKEND_URL, photoVersion]);

   const initials = useMemo(() => {
      const n = (profile?.nombreUsuario || "").trim();
      return n ? n.slice(0, 1).toUpperCase() : "U";
   }, [profile?.nombreUsuario]);

   const filteredPolls = useMemo(() => {
      const q = query.trim().toLowerCase();
      if (!q) return polls;

      return polls.filter((p) => {
         const name = (p?.titulo ?? p?.nombre ?? "").toLowerCase();
         return name.includes(q);
      });
   }, [polls, query]);

   useEffect(() => {
      setPage(1);
   }, [query, polls.length]);

   const totalPages = useMemo(() => {
      return Math.max(1, Math.ceil(filteredPolls.length / PAGE_SIZE));
   }, [filteredPolls.length]);

   const pageItems = useMemo(() => {
      const start = (page - 1) * PAGE_SIZE;
      return filteredPolls.slice(start, start + PAGE_SIZE);
   }, [filteredPolls, page]);

   const onSaveName = async () => {
      setError("");
      setOkMsg("");
      if (!userId) return;

      try {
         setSavingName(true);
         await usersApi.updateUsuario(userId, { nombreUsuario: nombreUsuario.trim() });

         const updated = { ...profile, nombreUsuario: nombreUsuario.trim() };
         setProfile(updated);
         syncLocalUser(updated);

         setEditMode(false);
         setOkMsg("Nombre de usuario actualizado.");
      } catch (err) {
         setError(normalizeError(err, "No se pudo actualizar el nombre de usuario."));
      } finally {
         setSavingName(false);
      }
   };

   const onSaveDesc = async () => {
      setError("");
      setOkMsg("");
      if (!userId) return;

      try {
         setSavingDesc(true);

         const clean = (descripcion ?? "").trim();
         await usersApi.updateUsuario(userId, { descripcion: clean });

         const updated = { ...profile, descripcion: clean };
         setProfile(updated);
         syncLocalUser(updated);

         setEditDescMode(false);
         setOkMsg("Descripción actualizada.");
      } catch (err) {
         setError(normalizeError(err, "No se pudo actualizar la descripción."));
      } finally {
         setSavingDesc(false);
      }
   };

   const onPickFile = (e) => {
      setError("");
      setOkMsg("");

      const file = e.target.files?.[0];
      if (!file) return;

      if (!file.type?.startsWith("image/")) {
         setError("Solo se permiten archivos de imagen.");
         e.target.value = "";
         return;
      }

      const maxBytes = 2 * 1024 * 1024;
      if (file.size > maxBytes) {
         setError("La imagen excede el tamaño permitido (2MB).");
         e.target.value = "";
         return;
      }

      setSelectedFile(file);
   };

   const onUploadPhoto = async () => {
      setError("");
      setOkMsg("");
      if (!userId) return;

      if (!selectedFile) {
         setError("Selecciona una imagen antes de subirla.");
         return;
      }

      try {
         setUploadingPhoto(true);

         const res = await usersApi.uploadFotoPerfil(userId, selectedFile);
         const updated = res?.data ?? null;

         if (updated) {
            setProfile(updated);
            syncLocalUser(updated);
         }

         setSelectedFile(null);
         setOkMsg("Foto de perfil actualizada.");
         setPhotoVersion((v) => v + 1);
      } catch (err) {
         setError(normalizeError(err, "No se pudo subir la imagen."));
      } finally {
         setUploadingPhoto(false);
      }
   };

   const goToPoll = (pollId) => {
      if (!pollId) return;
      navigate(`/encuestas/${pollId}`);
   };

   if (loading) {
      return (
         <div className="container" style={{ padding: 24 }}>
            Cargando perfil...
         </div>
      );
   }

   const descText = profile?.descripcion?.trim() ? profile.descripcion : "Sin descripción.";

   return (
      <div className="container uv-profile">
         <motion.div
            className="uv-profile-card"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25 }}
         >
            <div className="uv-profile-header">
               <div>
                  <h1>
                     <FiUser aria-hidden="true" />
                     Mi perfil
                  </h1>
                  <p>Gestiona tu foto, tu información y tus encuestas creadas.</p>
               </div>

               <div className="uv-logout-wrap">
                  <button className="uv-profile-logout" onClick={logout} type="button">
                     <FiLogOut aria-hidden="true" />
                     Cerrar sesión
                  </button>

                  <div className="uv-created-at">
                     Cuenta creada:{" "}
                     <strong>{profile?.creadoEn ? new Date(profile.creadoEn).toLocaleString() : "—"}</strong>
                  </div>
               </div>
            </div>

            {error && <div className="uv-profile-alert">{error}</div>}
            {okMsg && <div className="uv-profile-advice">{okMsg}</div>}

            <div className="uv-profile-top">
               {/* Foto */}
               <section className="uv-profile-box uv-photo-box">
                  <div className="uv-photo-stack">
                     <div className="uv-avatar uv-avatar-xl">
                        {previewUrl ? (
                           <img src={previewUrl} alt="Vista previa" />
                        ) : fotoSrc ? (
                           <img src={fotoSrc} alt="Foto de perfil" />
                        ) : (
                           <span className="uv-avatar-fallback">{initials}</span>
                        )}
                     </div>

                     <div className="uv-photo-actions">
                        <label className="uv-file-btn">
                           <FiImage />
                           <span>Elegir imagen</span>
                           <input type="file" accept="image/*" onChange={onPickFile} />
                        </label>

                        <button
                           className="uv-edit-btn"
                           type="button"
                           disabled={!selectedFile || uploadingPhoto}
                           onClick={onUploadPhoto}
                        >
                           <FiUpload />
                           {uploadingPhoto ? "Subiendo..." : "Subir"}
                        </button>

                        {selectedFile && (
                           <button
                              className="uv-edit-btn uv-edit-cancel"
                              type="button"
                              onClick={() => setSelectedFile(null)}
                           >
                              <FiXCircle /> Quitar
                           </button>
                        )}

                        <p className="uv-muted uv-photo-hint">Recomendado: imagen cuadrada. Máx. 2MB.</p>
                     </div>
                  </div>
               </section>

               {/* Info */}
               <section className="uv-profile-box uv-info-box">
                  <h2>
                     <FiFileText aria-hidden="true" />
                     Información
                  </h2>

                  <div className="uv-profile-row">
                     <span className="uv-k">Correo</span>
                     <span className="uv-v">{profile?.correo ?? "-"}</span>
                  </div>

                  {/* Nombre */}
                  <div className="uv-profile-row uv-profile-row-edit">
                     <span className="uv-k">Nombre de usuario</span>

                     {!editMode ? (
                        <span className="uv-v uv-inline">
                           {profile?.nombreUsuario ?? "-"}
                           <button
                              className="uv-inline-btn"
                              onClick={() => {
                                 setEditMode(true);
                                 setOkMsg("");
                                 setError("");
                              }}
                              title="Editar"
                              type="button"
                           >
                              <FiEdit3 />
                           </button>
                        </span>
                     ) : (
                        <div className="uv-edit">
                           <input
                              value={nombreUsuario}
                              onChange={(e) => setNombreUsuario(e.target.value)}
                              className="uv-edit-input"
                              placeholder="Nuevo nombre de usuario"
                           />

                           <button
                              className="uv-edit-btn"
                              disabled={!canSaveName || savingName}
                              onClick={onSaveName}
                              type="button"
                           >
                              <FiSave /> {savingName ? "Guardando..." : "Guardar"}
                           </button>

                           <button
                              className="uv-edit-btn uv-edit-cancel"
                              type="button"
                              onClick={() => {
                                 setEditMode(false);
                                 setNombreUsuario(profile?.nombreUsuario ?? "");
                              }}
                           >
                              <FiXCircle /> Cancelar
                           </button>
                        </div>
                     )}
                  </div>

                  {/* Descripción (label arriba, bloque debajo) */}
                  <div className="uv-profile-row uv-profile-row-desc-vertical">
                     <span className="uv-k">Descripción</span>

                     {!editDescMode ? (
                        <div className="uv-desc-box uv-desc-box-with-action">
                           <button
                              className="uv-inline-btn uv-desc-edit"
                              onClick={() => {
                                 setEditDescMode(true);
                                 setDescripcion(profile?.descripcion ?? "");
                                 setOkMsg("");
                                 setError("");
                              }}
                              title="Editar"
                              type="button"
                           >
                              <FiEdit3 />
                           </button>

                           <div className="uv-desc-text">{descText}</div>
                        </div>
                     ) : (
                        <>
                           <div className="uv-desc-box uv-desc-box-with-action">
                              <textarea
                                 value={descripcion}
                                 onChange={(e) => setDescripcion(e.target.value)}
                                 className="uv-edit-textarea uv-edit-textarea-fixed uv-desc-textarea"
                                 placeholder="Escribe una descripción (máx. 500 caracteres)"
                                 maxLength={DESC_MAX}
                              />
                           </div>

                           <div
                              className="uv-desc-counter"
                              style={{
                                 width: "100%",
                                 display: "flex",
                                 justifyContent: "flex-end",
                                 marginTop: 8,
                                 fontSize: 12,
                                 fontWeight: 800,
                                 color:
                                    descRemaining <= 25
                                       ? "rgba(160, 60, 60, 0.90)"
                                       : "rgba(48, 47, 44, 0.62)",
                              }}
                           >
                              {descRemaining} caracteres restantes
                           </div>

                           <div className="uv-edit-actions">
                              <button
                                 className="uv-edit-btn"
                                 disabled={!canSaveDesc || savingDesc}
                                 onClick={onSaveDesc}
                                 type="button"
                              >
                                 <FiSave /> {savingDesc ? "Guardando..." : "Guardar"}
                              </button>

                              <button
                                 className="uv-edit-btn uv-edit-cancel"
                                 type="button"
                                 onClick={() => {
                                    setEditDescMode(false);
                                    setDescripcion(profile?.descripcion ?? "");
                                 }}
                              >
                                 <FiXCircle /> Cancelar
                              </button>
                           </div>
                        </>
                     )}
                  </div>
               </section>
            </div>

            {/* Encuestas */}
            <section className="uv-profile-box uv-polls-box">
               <div className="uv-polls-header">
                  <div>
                     <h2>
                        <FiBarChart2 aria-hidden="true" />
                        Mis encuestas
                     </h2>
                     <p className="uv-muted">Haz click en una encuesta para ver sus detalles.</p>
                  </div>

                  <div className="uv-search">
                     <FiSearch className="uv-search-ico" />
                     <input
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="Buscar encuesta por nombre..."
                        className="uv-search-input"
                     />
                     {query && (
                        <button className="uv-search-clear" onClick={() => setQuery("")} title="Limpiar" type="button">
                           <FiXCircle />
                        </button>
                     )}
                  </div>
               </div>

               {pollsLoading ? (
                  <p className="uv-muted">Cargando encuestas...</p>
               ) : filteredPolls.length === 0 ? (
                  <p className="uv-muted">{polls.length === 0 ? "Aún no has creado encuestas." : "No hay resultados."}</p>
               ) : (
                  <>
                     <div className="uv-polls-list uv-polls-scroll">
                        {pageItems.map((p) => {
                           const pending = isPollPending(p);
                           const closed = isPollClosed(p);

                           const pillClass = pending ? "is-pending" : closed ? "is-closed" : "is-open";

                           return (
                              <button
                                 key={p.id}
                                 className="uv-poll-item"
                                 type="button"
                                 onClick={() => goToPoll(p.id)}
                                 title="Ver detalles de la encuesta"
                              >
                                 <div className="uv-poll-title">{p.titulo ?? p.nombre ?? "Encuesta"}</div>

                                 <div className="uv-poll-meta">
                                    <span className={`uv-pill ${pillClass}`}>{estadoLabel(p)}</span>
                                 </div>
                              </button>
                           );
                        })}
                     </div>

                     {filteredPolls.length > PAGE_SIZE && (
                        <div className="uv-pagination">
                           <button
                              className="uv-page-btn"
                              onClick={() => setPage((p) => Math.max(1, p - 1))}
                              disabled={page === 1}
                              type="button"
                           >
                              Anterior
                           </button>

                           <div className="uv-page-info">
                              Página <strong>{page}</strong> de <strong>{totalPages}</strong>
                           </div>

                           <button
                              className="uv-page-btn"
                              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                              disabled={page === totalPages}
                              type="button"
                           >
                              Siguiente
                           </button>
                        </div>
                     )}
                  </>
               )}
            </section>
         </motion.div>
      </div>
   );
}
