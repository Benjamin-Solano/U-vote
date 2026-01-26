import { useEffect, useMemo, useRef, useState } from "react";
import { FiPlus, FiCheck, FiTrash2, FiArrowLeft, FiUpload, FiX, FiCalendar, FiMove } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import Cropper from "react-easy-crop";

import { pollsApi } from "../../api/polls.api";
import { optionsApi } from "../../api/options.api";
import "./polls.css";

const MAX_IMG_MB = 3;

const emptyOption = () => ({
   key: crypto.randomUUID(),
   nombre: "",
   descripcion: "",
   imagenUrl: "", // DataURL (base64)
});

function toIsoOrNull(datetimeLocal) {
   if (!datetimeLocal) return null;
   const ms = new Date(datetimeLocal).getTime();
   if (!Number.isFinite(ms)) return null;
   return new Date(ms).toISOString();
}

function fileToDataUrl(file) {
   return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result || ""));
      reader.onerror = reject;
      reader.readAsDataURL(file);
   });
}

/** Dropzone simple (para opciones) */
function ImageDropzone({ value, onChange, disabled, label = "Imagen", hint = "Arrastra o selecciona" }) {
   const inputRef = useRef(null);
   const [dragging, setDragging] = useState(false);
   const hasImg = Boolean(value?.trim());

   const pick = () => {
      if (disabled) return;
      inputRef.current?.click();
   };

   const onFiles = async (files) => {
      const f = files?.[0];
      if (!f) return;

      if (!f.type?.startsWith("image/")) {
         alert("Selecciona un archivo de imagen (png/jpg/webp/etc).");
         return;
      }

      const mb = f.size / (1024 * 1024);
      if (mb > MAX_IMG_MB) {
         alert(`La imagen es muy grande. Máximo ${MAX_IMG_MB}MB.`);
         return;
      }

      const dataUrl = await fileToDataUrl(f);
      onChange(dataUrl);
   };

   const handleDrop = async (e) => {
      e.preventDefault();
      if (disabled) return;
      setDragging(false);

      try {
         await onFiles(e.dataTransfer?.files);
      } catch {
         alert("No se pudo leer la imagen.");
      }
   };

   const handleInput = async (e) => {
      if (disabled) return;
      try {
         await onFiles(e.target.files);
      } catch {
         alert("No se pudo leer la imagen.");
      } finally {
         e.target.value = "";
      }
   };

   const clear = (e) => {
      e.preventDefault();
      e.stopPropagation();
      if (disabled) return;
      onChange("");
   };

   return (
      <div
         className={`uv-dropzone ${dragging ? "is-drag" : ""} ${hasImg ? "has-img" : ""} uv-dropzone-option`}
         onClick={pick}
         onDragOver={(e) => {
            e.preventDefault();
            if (disabled) return;
            setDragging(true);
         }}
         onDragLeave={() => setDragging(false)}
         onDrop={handleDrop}
         role="button"
         tabIndex={0}
         aria-label="Subir imagen"
      >
         <input
            ref={inputRef}
            type="file"
            accept="image/*"
            className="uv-dropzone-input"
            onChange={handleInput}
            disabled={disabled}
         />

         {hasImg ? (
            <>
               <img
                  className="uv-dropzone-preview"
                  src={value}
                  alt="preview"
                  style={{ objectFit: "contain", objectPosition: "center" }}
                  draggable={false}
               />
               <button type="button" className="uv-dropzone-clear" onClick={clear} disabled={disabled} title="Quitar">
                  <FiX />
               </button>
            </>
         ) : (
            <div className="uv-dropzone-empty">
               <FiUpload />
               <div className="uv-dropzone-title">{label}</div>
               <div className="uv-dropzone-sub">{hint}</div>
               <div className="uv-dropzone-sub2">Máx {MAX_IMG_MB}MB</div>
            </div>
         )}
      </div>
   );
}

/** Cover uploader + preview (la reposición se hace con react-easy-crop en modal) */
function CoverBox({ value, onChange, disabled, coverPos = 50, onRequestReposition }) {
   const inputRef = useRef(null);
   const [dragging, setDragging] = useState(false);
   const hasImg = Boolean(value?.trim());

   const pick = () => {
      if (disabled) return;
      inputRef.current?.click();
   };

   const onFiles = async (files) => {
      const f = files?.[0];
      if (!f) return;

      if (!f.type?.startsWith("image/")) {
         alert("Selecciona un archivo de imagen (png/jpg/webp/etc).");
         return;
      }

      const mb = f.size / (1024 * 1024);
      if (mb > MAX_IMG_MB) {
         alert(`La imagen es muy grande. Máximo ${MAX_IMG_MB}MB.`);
         return;
      }

      const dataUrl = await fileToDataUrl(f);
      onChange(dataUrl);
   };

   const handleDrop = async (e) => {
      e.preventDefault();
      if (disabled) return;
      setDragging(false);
      try {
         await onFiles(e.dataTransfer?.files);
      } catch {
         alert("No se pudo leer la imagen.");
      }
   };

   const handleInput = async (e) => {
      if (disabled) return;
      try {
         await onFiles(e.target.files);
      } catch {
         alert("No se pudo leer la imagen.");
      } finally {
         e.target.value = "";
      }
   };

   const clear = (e) => {
      e.preventDefault();
      e.stopPropagation();
      if (disabled) return;
      onChange("");
   };

   return (
      <div
         className={`uv-cover-box ${dragging ? "is-drag" : ""} ${hasImg ? "has-img" : ""}`}
         onClick={pick}
         onDragOver={(e) => {
            e.preventDefault();
            if (disabled) return;
            setDragging(true);
         }}
         onDragLeave={() => setDragging(false)}
         onDrop={handleDrop}
         role="button"
         tabIndex={0}
         aria-label="Subir portada"
      >
         <input
            ref={inputRef}
            type="file"
            accept="image/*"
            className="uv-dropzone-input"
            onChange={handleInput}
            disabled={disabled}
         />

         {hasImg ? (
            <>
               <img
                  className="uv-cover-img"
                  src={value}
                  alt="cover"
                  draggable={false}
                  style={{ objectFit: "cover", objectPosition: `50% ${coverPos}%` }}
               />

               <div className="uv-cover-tools" onClick={(e) => e.stopPropagation()}>
                  <button
                     type="button"
                     className="uv-cover-tool-btn"
                     onClick={onRequestReposition}
                     disabled={disabled}
                     title="Reposicionar portada"
                  >
                     <FiMove /> Reposicionar
                  </button>
               </div>

               <button
                  type="button"
                  className="uv-dropzone-clear uv-dropzone-clear-left"
                  onClick={clear}
                  disabled={disabled}
                  title="Quitar"
               >
                  <FiX />
               </button>
            </>
         ) : (
            <div className="uv-cover-empty">
               <FiUpload />
               <div className="uv-dropzone-title">Portada</div>
               <div className="uv-dropzone-sub">Arrastra una imagen o haz click para seleccionarla</div>
               <div className="uv-dropzone-sub2">Máx {MAX_IMG_MB}MB</div>
            </div>
         )}
      </div>
   );
}

/** Modal editor con react-easy-crop (Guardar/Cancelar) + ✅ preview en tiempo real */
function CoverCropModal({
   open,
   image,
   disabled,
   initialCrop,
   initialZoom,
   onCancel,
   onSave,
   onPreviewCenterY, // ✅ NUEVO: actualiza coverPos en vivo
}) {
   const [crop, setCrop] = useState(initialCrop || { x: 0, y: 0 });
   const [zoom, setZoom] = useState(initialZoom || 1);

   const pendingCenterYRef = useRef(50);

   useEffect(() => {
      if (!open) return;
      setCrop(initialCrop || { x: 0, y: 0 });
      setZoom(initialZoom || 1);
      pendingCenterYRef.current = 50;
   }, [open, initialCrop, initialZoom]);

   if (!open) return null;

   const commitCenterY = (croppedAreaPercentages) => {
      const cy = (croppedAreaPercentages?.y ?? 0) + (croppedAreaPercentages?.height ?? 0) / 2;
      const next = Math.max(0, Math.min(100, cy));
      pendingCenterYRef.current = next;

      // ✅ aquí está el FIX: se ve en el preview inmediatamente
      onPreviewCenterY?.(next);
   };

   const onCropComplete = (croppedAreaPercentages) => {
      commitCenterY(croppedAreaPercentages);
   };

   const handleSave = () => {
      onSave({
         crop,
         zoom,
         centerY: pendingCenterYRef.current,
      });
   };

   return (
      <div className="uv-cover-modal" role="dialog" aria-modal="true">
         <div className="uv-cover-modal-card">
            <div className="uv-cover-modal-head">
               <div className="uv-cover-modal-title">Reposicionar portada</div>

               <div className="uv-cover-modal-actions">
                  <button className="uv-cover-tool-btn uv-cover-tool-save" onClick={handleSave} disabled={disabled} type="button">
                     Guardar posición
                  </button>
                  <button className="uv-cover-tool-btn" onClick={onCancel} disabled={disabled} type="button">
                     Cancelar
                  </button>
               </div>
            </div>

            <div className="uv-cover-cropper">
               <Cropper
                  image={image}
                  crop={crop}
                  zoom={zoom}
                  onCropChange={setCrop}
                  onZoomChange={setZoom}
                  onCropComplete={onCropComplete}
                  aspect={16 / 5}
                  showGrid={false}
                  restrictPosition={false}
               />
               <div className="uv-cover-crop-hint">Arrastra la imagen para reposicionarla</div>
            </div>

            <div className="uv-cover-zoom">
               <span>Zoom</span>
               <input
                  type="range"
                  min={1}
                  max={3}
                  step={0.01}
                  value={zoom}
                  onChange={(e) => setZoom(Number(e.target.value))}
                  disabled={disabled}
               />
            </div>
         </div>
      </div>
   );
}

export default function CreatePoll() {
   const navigate = useNavigate();

   // Encuesta
   const [nombre, setNombre] = useState("");
   const [descripcion, setDescripcion] = useState("");

   // Portada
   const [imagenUrl, setImagenUrl] = useState("");
   const [coverPos, setCoverPos] = useState(50);

   // Persistimos valores del editor para reabrir igual
   const [coverCrop, setCoverCrop] = useState({ x: 0, y: 0 });
   const [coverZoom, setCoverZoom] = useState(1);

   const [coverEditorOpen, setCoverEditorOpen] = useState(false);

   // ✅ refs para restaurar si se cancela (porque ahora actualizamos en vivo)
   const prevCoverPosRef = useRef(50);
   const prevCoverCropRef = useRef({ x: 0, y: 0 });
   const prevCoverZoomRef = useRef(1);

   // Fechas
   const [inicio, setInicio] = useState("");
   const [cierre, setCierre] = useState("");

   // Opciones (mínimo 2)
   const [options, setOptions] = useState([emptyOption(), emptyOption()]);

   const [loading, setLoading] = useState(false);

   // Toast
   const [toast, setToast] = useState({ show: false, type: "success", message: "" });
   const toastTimer = useRef(null);

   const showToast = (type, message) => {
      setToast({ show: true, type, message });
      if (toastTimer.current) window.clearTimeout(toastTimer.current);
      toastTimer.current = window.setTimeout(() => setToast((t) => ({ ...t, show: false })), 5000);
   };

   useEffect(() => () => toastTimer.current && window.clearTimeout(toastTimer.current), []);

   const rangeError = useMemo(() => {
      if (!inicio || !cierre) return "";
      const a = new Date(inicio).getTime();
      const b = new Date(cierre).getTime();
      if (!Number.isFinite(a) || !Number.isFinite(b)) return "Fechas inválidas.";
      if (a >= b) return "El inicio debe ser anterior al cierre.";
      return "";
   }, [inicio, cierre]);

   const optionErrors = useMemo(
      () =>
         options.map((o) => ({
            nombre: o.nombre.trim().length === 0,
            descripcion: o.descripcion.trim().length === 0,
         })),
      [options]
   );

   const canSubmit = useMemo(() => {
      const pollOk = nombre.trim().length > 0 && descripcion.trim().length > 0;
      const rangeOk = !rangeError;
      const optionsOk = options.length >= 2 && optionErrors.every((e) => !e.nombre && !e.descripcion);
      return pollOk && rangeOk && optionsOk && !loading;
   }, [nombre, descripcion, rangeError, options, optionErrors, loading]);

   const setOptionField = (idx, field, value) => {
      setOptions((prev) => {
         const next = [...prev];
         next[idx] = { ...next[idx], [field]: value };
         return next;
      });
   };

   const addOptionRow = () => setOptions((prev) => [...prev, emptyOption()]);

   const removeOptionRow = (idx) => {
      setOptions((prev) => {
         if (prev.length <= 2) return prev;
         const next = prev.filter((_, i) => i !== idx);
         return next.length < 2 ? [emptyOption(), emptyOption()] : next;
      });
   };

   const clearAll = () => {
      setNombre("");
      setDescripcion("");
      setImagenUrl("");
      setCoverPos(50);
      setCoverCrop({ x: 0, y: 0 });
      setCoverZoom(1);
      setInicio("");
      setCierre("");
      setOptions([emptyOption(), emptyOption()]);
   };

   const handleFinish = async () => {
      if (loading) return;

      if (!canSubmit) {
         showToast("error", "Completa los campos obligatorios. (Mínimo 2 opciones).");
         return;
      }

      setLoading(true);

      try {
         const pollPayload = {
            nombre: nombre.trim(),
            descripcion: descripcion.trim(),
            imagenUrl: imagenUrl?.trim() || null,

            // si tu backend lo admite, persistimos:
            coverPos: imagenUrl?.trim() ? coverPos : null,
            coverCrop: imagenUrl?.trim() ? coverCrop : null,
            coverZoom: imagenUrl?.trim() ? coverZoom : null,

            fechaInicio: toIsoOrNull(inicio),
            fechaCierre: toIsoOrNull(cierre),
         };

         const pollRes = await pollsApi.create(pollPayload);
         const poll = pollRes.data;

         for (let i = 0; i < options.length; i++) {
            const o = options[i];
            const payload = {
               nombre: o.nombre.trim(),
               descripcion: o.descripcion.trim(),
               imagenUrl: o.imagenUrl?.trim() || null,
               orden: i + 1,
            };
            await optionsApi.create(poll.id, payload);
         }

         showToast("success", "Encuesta creada correctamente.");
         clearAll();
      } catch (e) {
         const msg = e?.response?.data?.message || e.message || "Ocurrió un error al crear la encuesta.";
         showToast("error", msg);
      } finally {
         setLoading(false);
      }
   };

   const openCoverEditor = () => {
      if (!imagenUrl?.trim()) return;

      // ✅ guardamos estado actual, porque durante el modal se actualiza en vivo
      prevCoverPosRef.current = coverPos;
      prevCoverCropRef.current = coverCrop;
      prevCoverZoomRef.current = coverZoom;

      setCoverEditorOpen(true);
   };

   const cancelCoverEditor = () => {
      // ✅ revertimos lo que se movió en vivo
      setCoverPos(prevCoverPosRef.current);
      setCoverCrop(prevCoverCropRef.current);
      setCoverZoom(prevCoverZoomRef.current);
      setCoverEditorOpen(false);
   };

   const saveCoverEditor = ({ crop, zoom, centerY }) => {
      setCoverCrop(crop);
      setCoverZoom(zoom);
      setCoverPos(centerY);
      setCoverEditorOpen(false);
   };

   // Si cambian imagenUrl desde cero (portada nueva), reseteamos editor params
   useEffect(() => {
      if (!imagenUrl?.trim()) {
         setCoverPos(50);
         setCoverCrop({ x: 0, y: 0 });
         setCoverZoom(1);
      }
   }, [imagenUrl]);

   return (
      <div className="uv-polls-scope uv-create-wrap">
         <div className="uv-create-card">
            {/* Header centrado */}
            <div className="uv-create-head uv-create-head-center">
               <button className="uv-btn uv-create-back" type="button" onClick={() => navigate(-1)} disabled={loading}>
                  <FiArrowLeft /> Volver
               </button>

               <div className="uv-create-titleblock">
                  <h1 className="uv-create-title">Crear encuesta</h1>
                  <p className="uv-create-sub">Define la encuesta y agrega sus opciones. (Mínimo 2)</p>
               </div>
            </div>

            {/* Portada (preview) */}
            <div className="uv-create-cover">
               <div className="uv-field">
                  <label>Foto / portada (opcional)</label>

                  <CoverBox
                     value={imagenUrl}
                     onChange={setImagenUrl}
                     disabled={loading}
                     coverPos={coverPos}
                     onRequestReposition={openCoverEditor}
                  />
               </div>
            </div>

            {/* Grid balanceado */}
            <div className="uv-create-grid uv-create-grid-balanced">
               <div className="uv-field">
                  <label>Nombre (requerido)</label>
                  <input
                     className="uv-input"
                     value={nombre}
                     onChange={(e) => setNombre(e.target.value)}
                     maxLength={100}
                     placeholder="Ej: Elección del logo"
                     disabled={loading}
                  />
               </div>

               <div className="uv-field">
                  <label>Inicio de la encuesta</label>
                  <div className="uv-datetime">
                     <FiCalendar className="uv-datetime-ico" />
                     <input
                        className="uv-input uv-input-datetime"
                        type="datetime-local"
                        value={inicio}
                        onChange={(e) => setInicio(e.target.value)}
                        disabled={loading}
                     />
                  </div>
               </div>

               <div className="uv-field uv-field-span">
                  <label>Descripción (requerido)</label>
                  <textarea
                     className="uv-textarea uv-textarea-fixed"
                     value={descripcion}
                     onChange={(e) => setDescripcion(e.target.value)}
                     maxLength={1000}
                     placeholder="Describe el objetivo de la encuesta…"
                     rows={4}
                     disabled={loading}
                  />
               </div>

               <div className="uv-field">
                  <label>Cierre de la encuesta</label>
                  <div className="uv-datetime">
                     <FiCalendar className="uv-datetime-ico" />
                     <input
                        className="uv-input uv-input-datetime"
                        type="datetime-local"
                        value={cierre}
                        onChange={(e) => setCierre(e.target.value)}
                        disabled={loading}
                     />
                  </div>
               </div>
            </div>

            {rangeError && <div className="uv-inline-error">{rangeError}</div>}

            {/* Opciones */}
            <div className="uv-section">
               <div className="uv-section-title">Opciones de la encuesta</div>

               <div className="uv-options-list">
                  {options.map((o, idx) => {
                     const err = optionErrors[idx];

                     return (
                        <div key={o.key} className="uv-option-row">
                           {/* ✅ Imagen opción (más grande en CSS) */}
                           <div className="uv-option-photo">
                              <ImageDropzone
                                 value={o.imagenUrl}
                                 onChange={(v) => setOptionField(idx, "imagenUrl", v)}
                                 disabled={loading}
                                 label="Imagen"
                                 hint="Arrastra o selecciona"
                              />
                           </div>

                           <div className="uv-option-fields">
                              <div className="uv-field">
                                 <label>Nombre (requerido)</label>
                                 <input
                                    className={`uv-input ${err?.nombre ? "uv-input-invalid" : ""}`}
                                    value={o.nombre}
                                    onChange={(e) => setOptionField(idx, "nombre", e.target.value)}
                                    maxLength={100}
                                    placeholder="Ej: Perros"
                                    disabled={loading}
                                 />
                              </div>

                              <div className="uv-field">
                                 <label>Descripción (requerido)</label>
                                 <input
                                    className={`uv-input ${err?.descripcion ? "uv-input-invalid" : ""}`}
                                    value={o.descripcion}
                                    onChange={(e) => setOptionField(idx, "descripcion", e.target.value)}
                                    maxLength={500}
                                    placeholder="Ej: Son más leales…"
                                    disabled={loading}
                                 />
                              </div>
                           </div>

                           <button
                              className="uv-btn uv-btn-icon"
                              type="button"
                              onClick={() => removeOptionRow(idx)}
                              title={options.length <= 2 ? "Debes mantener mínimo 2 opciones" : "Eliminar opción"}
                              disabled={loading || options.length <= 2}
                           >
                              <FiTrash2 />
                           </button>
                        </div>
                     );
                  })}
               </div>

               <div className="uv-create-actions">
                  <button className="uv-btn" type="button" onClick={addOptionRow} disabled={loading}>
                     <FiPlus /> Agregar opción a la encuesta
                  </button>

                  <button className="uv-btn uv-btn-dark" type="button" onClick={handleFinish} disabled={!canSubmit || loading}>
                     <FiCheck /> {loading ? "Guardando…" : "Terminar edición de encuesta"}
                  </button>

                  <button className="uv-btn" type="button" onClick={clearAll} disabled={loading}>
                     Limpiar campos
                  </button>
               </div>
            </div>
         </div>

         {/* Modal editor (react-easy-crop) */}
         <CoverCropModal
            open={coverEditorOpen}
            image={imagenUrl}
            disabled={loading}
            initialCrop={coverCrop}
            initialZoom={coverZoom}
            onCancel={cancelCoverEditor}
            onSave={saveCoverEditor}
            onPreviewCenterY={setCoverPos} // ✅ NUEVO: actualiza coverPos en vivo
         />

         {toast.show && (
            <div className={`uv-toast ${toast.type === "success" ? "ok" : "bad"}`}>
               {toast.message}
            </div>
         )}
      </div>
   );
}
