import { useEffect, useMemo, useRef, useState } from "react";
import { FiArrowLeft, FiCheck, FiPlus, FiTrash2, FiUpload, FiX } from "react-icons/fi";
import { useNavigate, useParams } from "react-router-dom";
import Cropper from "react-easy-crop";
import { AnimatePresence, motion } from "framer-motion";

import { api } from "../../api/axios";
import { pollsApi } from "../../api/polls.api";
import { optionsApi } from "../../api/options.api";
import "./createPoll.css";

const MAX_IMG_MB = 3;

const emptyOption = () => ({
   key: crypto.randomUUID(),
   id: null,
   nombre: "",
   descripcion: "",
   imagenUrl: "",
});

function clampFileSizeMB(file, maxMB) {
   return file && file.size <= maxMB * 1024 * 1024;
}

const pad2 = (n) => String(n).padStart(2, "0");

function formatLocalFromISO(iso) {
   if (!iso) return "";
   const d = new Date(iso);
   if (Number.isNaN(d.getTime())) return "";
   try {
      return new Intl.DateTimeFormat(undefined, {
         year: "numeric",
         month: "2-digit",
         day: "2-digit",
         hour: "2-digit",
         minute: "2-digit",
      }).format(d);
   } catch {
      return d.toLocaleString();
   }
}

function isoToLocalParts(iso) {
   if (!iso) return { date: "", time: "" };
   const d = new Date(iso);
   if (Number.isNaN(d.getTime())) return { date: "", time: "" };
   return {
      date: `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`,
      time: `${pad2(d.getHours())}:${pad2(d.getMinutes())}`,
   };
}

// date + time (local) -> ISO Z (OffsetDateTime lo parsea ok)
function buildISOFromDateTime(dateStr, timeStr) {
   if (!dateStr && !timeStr) return null;
   if (!dateStr) return null;
   const t = timeStr ? timeStr : "00:00";
   const d = new Date(`${dateStr}T${t}`);
   if (Number.isNaN(d.getTime())) return null;
   return d.toISOString();
}

function loadImage(src) {
   return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.onload = () => resolve(img);
      img.onerror = reject;
      img.src = src;
   });
}

async function getCroppedBlob(imageSrc, cropPixels, mime = "image/jpeg", quality = 0.92) {
   const img = await loadImage(imageSrc);

   const canvas = document.createElement("canvas");
   const ctx = canvas.getContext("2d");
   if (!ctx) throw new Error("No canvas context");

   canvas.width = cropPixels.width;
   canvas.height = cropPixels.height;

   ctx.drawImage(
      img,
      cropPixels.x,
      cropPixels.y,
      cropPixels.width,
      cropPixels.height,
      0,
      0,
      cropPixels.width,
      cropPixels.height
   );

   const blob = await new Promise((resolve) => canvas.toBlob(resolve, mime, quality));
   if (!blob) throw new Error("No se pudo generar el recorte");

   const previewUrl = URL.createObjectURL(blob);
   return { blob, previewUrl };
}

function blobToDataUrl(blob) {
   return new Promise((resolve, reject) => {
      const r = new FileReader();
      r.onload = () => resolve(String(r.result));
      r.onerror = reject;
      r.readAsDataURL(blob);
   });
}

function fileToDataUrl(file) {
   return new Promise((resolve, reject) => {
      const r = new FileReader();
      r.onload = () => resolve(String(r.result));
      r.onerror = reject;
      r.readAsDataURL(file);
   });
}

function Label({ children, required = false }) {
   return (
      <label className="uv-label">
         {children}{" "}
         {required ? (
            <span className="uv-req" aria-hidden="true">
               (requerido)
            </span>
         ) : null}
      </label>
   );
}

/* =========================================
   Dropzone genérico (para opciones)
========================================= */
function ImageDropzone({
   value,
   disabled,
   error,
   onPickFile,
   onClear,
   title = "Imagen",
   subtitle = "Arrastra o selecciona",
}) {
   const inputRef = useRef(null);
   const [drag, setDrag] = useState(false);
   const hasImg = Boolean(value);

   const pick = () => {
      if (disabled) return;
      inputRef.current?.click();
   };

   const handleFiles = async (files) => {
      const file = files?.[0];
      if (!file) return;
      await onPickFile(file);
   };

   return (
      <div
         className={`uv-dropzone uv-dropzone-option ${drag ? "is-drag" : ""} ${error ? "uv-invalid" : ""}`}
         onClick={pick}
         onDragOver={(e) => {
            e.preventDefault();
            if (disabled) return;
            setDrag(true);
         }}
         onDragLeave={() => setDrag(false)}
         onDrop={async (e) => {
            e.preventDefault();
            if (disabled) return;
            setDrag(false);
            await handleFiles(e.dataTransfer?.files);
         }}
         role="button"
         tabIndex={0}
         aria-label="Subir imagen"
      >
         <input
            ref={inputRef}
            type="file"
            accept="image/*"
            className="uv-hidden"
            disabled={disabled}
            onChange={async (e) => {
               try {
                  await handleFiles(e.target.files);
               } finally {
                  e.target.value = "";
               }
            }}
         />

         {hasImg ? (
            <>
               <img className="uv-dropzone-preview" src={value} alt="preview" draggable={false} />
               <button
                  type="button"
                  className="uv-dropzone-clear"
                  onClick={(e) => {
                     e.preventDefault();
                     e.stopPropagation();
                     if (disabled) return;
                     onClear?.();
                  }}
                  title="Quitar"
                  disabled={disabled}
               >
                  <FiX />
               </button>
            </>
         ) : (
            <div className="uv-dropzone-empty">
               <FiUpload />
               <div className="uv-dropzone-title">{title}</div>
               <div className="uv-dropzone-sub">{subtitle}</div>
               <div className="uv-dropzone-sub2">Máx {MAX_IMG_MB}MB</div>
            </div>
         )}
      </div>
   );
}

export default function CreatePoll() {
   const navigate = useNavigate();
   const { id } = useParams();
   const isEdit = Boolean(id);

   // Animaciones (sutiles)
   const pageVariants = useMemo(
      () => ({
         hidden: { opacity: 0, y: 10 },
         show: {
            opacity: 1,
            y: 0,
            transition: { duration: 0.35, ease: "easeOut" },
         },
      }),
      []
   );

   const listVariants = useMemo(
      () => ({
         hidden: { opacity: 1 },
         show: {
            opacity: 1,
            transition: { staggerChildren: 0.05, delayChildren: 0.05 },
         },
      }),
      []
   );

   const itemVariants = useMemo(
      () => ({
         hidden: { opacity: 0, y: 8 },
         show: { opacity: 1, y: 0, transition: { duration: 0.25, ease: "easeOut" } },
      }),
      []
   );

   const modalBackdrop = useMemo(
      () => ({
         hidden: { opacity: 0 },
         show: { opacity: 1, transition: { duration: 0.18 } },
         exit: { opacity: 0, transition: { duration: 0.14 } },
      }),
      []
   );

   const modalPanel = useMemo(
      () => ({
         hidden: { opacity: 0, y: 10, scale: 0.98 },
         show: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.22, ease: "easeOut" } },
         exit: { opacity: 0, y: 8, scale: 0.985, transition: { duration: 0.16, ease: "easeIn" } },
      }),
      []
   );

   // Encuesta
   const [nombre, setNombre] = useState("");
   const [descripcion, setDescripcion] = useState("");

   // Fecha + hora separadas
   const [inicioDate, setInicioDate] = useState("");
   const [inicioTime, setInicioTime] = useState("");
   const [cierreDate, setCierreDate] = useState("");
   const [cierreTime, setCierreTime] = useState("");

   // Portada
   const coverInputRef = useRef(null);
   const [coverSrc, setCoverSrc] = useState("");
   const [coverPreview, setCoverPreview] = useState("");
   const [coverBlob, setCoverBlob] = useState(null);
   const [coverError, setCoverError] = useState("");

   const [cropOpen, setCropOpen] = useState(false);
   const [coverCrop, setCoverCrop] = useState({ x: 0, y: 0 });
   const [coverZoom, setCoverZoom] = useState(1);
   const [coverCroppedPixels, setCoverCroppedPixels] = useState(null);

   // Opciones
   const [options, setOptions] = useState([emptyOption(), emptyOption()]);
   const [optImgErrors, setOptImgErrors] = useState({});

   // 🔁 Key para re-montar la lista cuando se limpian opciones (evita que queden en opacity:0 por variants)
   const [optionsListKey, setOptionsListKey] = useState(0);

   // Estado
   const [loading, setLoading] = useState(isEdit);
   const [saving, setSaving] = useState(false);
   const [submitted, setSubmitted] = useState(false);

   // Mensajes dentro del formulario
   const [successMsg, setSuccessMsg] = useState("");
   const [errorMsg, setErrorMsg] = useState("");
   const [lastPollId, setLastPollId] = useState(null);

   const cropperKey = useMemo(() => `${coverSrc}::${cropOpen}`, [coverSrc, cropOpen]);

   useEffect(() => {
      return () => {
         if (coverSrc?.startsWith("blob:")) URL.revokeObjectURL(coverSrc);
         if (coverPreview?.startsWith("blob:")) URL.revokeObjectURL(coverPreview);
      };
   }, [coverSrc, coverPreview]);

   // Cargar en edición
   useEffect(() => {
      if (!isEdit) return;

      let mounted = true;
      (async () => {
         try {
            setLoading(true);

            const pollRes = await pollsApi.getById(id);
            const poll = pollRes?.data;
            if (!mounted) return;

            setNombre(poll?.nombre ?? "");
            setDescripcion(poll?.descripcion ?? "");

            const iniISO = poll?.inicio ?? poll?.fechaInicio ?? null;
            const cieISO = poll?.cierre ?? poll?.fechaCierre ?? null;

            const ini = isoToLocalParts(iniISO);
            const cie = isoToLocalParts(cieISO);

            setInicioDate(ini.date);
            setInicioTime(ini.time);
            setCierreDate(cie.date);
            setCierreTime(cie.time);

            if (poll?.imagenUrl) {
               setCoverPreview(poll.imagenUrl);
               setCoverBlob(null);
               setCoverSrc("");
            } else {
               setCoverPreview("");
            }

            const optsRes = await optionsApi.listByEncuesta(id);
            const opts = optsRes?.data;
            if (!mounted) return;

            if (Array.isArray(opts) && opts.length) {
               setOptions(
                  opts.map((o) => ({
                     key: crypto.randomUUID(),
                     id: o.id ?? null,
                     nombre: o.nombre ?? "",
                     descripcion: o.descripcion ?? "",
                     imagenUrl: o.imagenUrl ?? "",
                  }))
               );
            } else {
               setOptions([emptyOption(), emptyOption()]);
            }

            // refresca animación al cargar opciones
            setOptionsListKey((k) => k + 1);
         } catch (e) {
            console.error(e);
         } finally {
            if (mounted) setLoading(false);
         }
      })();

      return () => {
         mounted = false;
      };
   }, [id, isEdit]);

   function onPickCoverClick() {
      setCoverError("");
      coverInputRef.current?.click();
   }

   function onCoverFileSelected(file) {
      setCoverError("");

      if (!file) return;
      if (!file.type?.startsWith("image/")) {
         setCoverError("El archivo debe ser una imagen.");
         return;
      }
      if (!clampFileSizeMB(file, MAX_IMG_MB)) {
         setCoverError(`La imagen excede ${MAX_IMG_MB}MB.`);
         return;
      }

      if (coverSrc?.startsWith("blob:")) URL.revokeObjectURL(coverSrc);

      const url = URL.createObjectURL(file);
      setCoverSrc(url);
      setCoverCrop({ x: 0, y: 0 });
      setCoverZoom(1);
      setCoverCroppedPixels(null);
      setCropOpen(true);
   }

   async function confirmCoverCrop() {
      try {
         if (!coverSrc || !coverCroppedPixels) {
            setCropOpen(false);
            return;
         }

         if (coverPreview?.startsWith("blob:")) URL.revokeObjectURL(coverPreview);

         const { blob, previewUrl } = await getCroppedBlob(coverSrc, coverCroppedPixels);
         setCoverBlob(blob);
         setCoverPreview(previewUrl);
         setCropOpen(false);
      } catch (e) {
         console.error(e);
         setCoverError("No se pudo recortar la portada.");
         setCropOpen(false);
      }
   }

   function cancelCoverCrop() {
      setCropOpen(false);
   }

   function clearCover() {
      setCoverError("");
      setCoverBlob(null);
      if (coverSrc?.startsWith("blob:")) URL.revokeObjectURL(coverSrc);
      if (coverPreview?.startsWith("blob:")) URL.revokeObjectURL(coverPreview);
      setCoverSrc("");
      setCoverPreview("");
      setCropOpen(false);
      setCoverCrop({ x: 0, y: 0 });
      setCoverZoom(1);
      setCoverCroppedPixels(null);
   }

   function updateOption(key, patch) {
      setOptions((prev) => prev.map((o) => (o.key === key ? { ...o, ...patch } : o)));
   }

   function removeOption(key) {
      setOptions((prev) => {
         const next = prev.filter((o) => o.key !== key);
         return next.length >= 2 ? next : prev;
      });
   }

   function addOption() {
      setOptions((prev) => [...prev, emptyOption()]);
   }

   const inicioISO = useMemo(() => buildISOFromDateTime(inicioDate, inicioTime), [inicioDate, inicioTime]);
   const cierreISO = useMemo(() => buildISOFromDateTime(cierreDate, cierreTime), [cierreDate, cierreTime]);

   // Ayuda visual: estado + hints de fechas
   const estadoBadge = useMemo(() => {
      const now = new Date();
      const start = inicioISO ? new Date(inicioISO) : null;
      const end = cierreISO ? new Date(cierreISO) : null;

      const validStart = start && !Number.isNaN(start.getTime());
      const validEnd = end && !Number.isNaN(end.getTime());

      if (validEnd && now.getTime() >= end.getTime()) return { key: "closed", label: "Cerrada" };
      if (validStart && now.getTime() < start.getTime()) return { key: "pending", label: "Pendiente" };
      return { key: "active", label: "Activa" };
   }, [inicioISO, cierreISO]);

   const inicioHint = useMemo(() => {
      if (!inicioDate && !inicioTime) return "Si lo dejas vacío, inicia inmediatamente al crearse.";
      const f = formatLocalFromISO(inicioISO);
      return f ? `Inicio programado: ${f}.` : "";
   }, [inicioDate, inicioTime, inicioISO]);

   const cierreHint = useMemo(() => {
      if (!cierreDate && !cierreTime) return "Si lo dejas vacío, no tendrá cierre automático (se cierra manualmente).";
      const f = formatLocalFromISO(cierreISO);
      return f ? `Cierre programado: ${f}.` : "";
   }, [cierreDate, cierreTime, cierreISO]);

   const fieldErrors = useMemo(() => {
      const e = {
         nombre: "",
         descripcion: "",
         fechas: "",
         timeOnly: "",
         options: {},
      };

      if (!nombre.trim()) e.nombre = "El nombre es requerido.";
      if (!descripcion.trim()) e.descripcion = "La descripción es requerida.";

      if (!inicioDate && inicioTime) e.timeOnly = "Debes seleccionar una fecha de inicio si defines la hora.";
      if (!cierreDate && cierreTime) e.timeOnly = "Debes seleccionar una fecha de cierre si defines la hora.";

      const start = inicioISO ? new Date(inicioISO) : null;
      const end = cierreISO ? new Date(cierreISO) : null;
      if (start && end && start.getTime() > end.getTime()) {
         e.fechas = "El inicio no puede ser posterior al cierre.";
      }

      for (const o of options) {
         e.options[o.key] = {
            nombre: o.nombre.trim() ? "" : "Nombre requerido.",
            descripcion: o.descripcion.trim() ? "" : "Descripción requerida.",
         };
      }

      return e;
   }, [nombre, descripcion, inicioISO, cierreISO, inicioDate, inicioTime, cierreDate, cierreTime, options]);

   const formErrors = useMemo(() => {
      const errs = [];
      if (fieldErrors.nombre) errs.push(fieldErrors.nombre);
      if (fieldErrors.descripcion) errs.push(fieldErrors.descripcion);
      if (fieldErrors.timeOnly) errs.push(fieldErrors.timeOnly);
      if (fieldErrors.fechas) errs.push(fieldErrors.fechas);
      if (options.length < 2) errs.push("Debe haber mínimo 2 opciones.");

      options.forEach((o, idx) => {
         const oe = fieldErrors.options?.[o.key];
         if (oe?.nombre) errs.push(`Opción ${idx + 1}: ${oe.nombre}`);
         if (oe?.descripcion) errs.push(`Opción ${idx + 1}: ${oe.descripcion}`);
      });

      Object.values(optImgErrors || {}).forEach((msg) => msg && errs.push(msg));
      if (coverError) errs.push(coverError);

      return errs;
   }, [fieldErrors, options, optImgErrors, coverError]);

   const canSubmit = !saving && formErrors.length === 0;

   async function savePoll(pollPayload) {
      if (!isEdit) {
         const res = await pollsApi.create(pollPayload);
         return res?.data;
      }
      const res = await api.patch(`/encuestas/${id}`, pollPayload);
      return res?.data;
   }

   async function replaceOptions(encuestaId) {
      const existing = options.filter((o) => o.id);
      for (const o of existing) await optionsApi.delete(o.id);

      for (const o of options) {
         const payload = {
            nombre: o.nombre.trim(),
            descripcion: o.descripcion.trim(),
            imagenUrl: o.imagenUrl || "",
         };
         await optionsApi.create(encuestaId, payload);
      }
   }

   async function handleSubmit() {
      setSubmitted(true);
      setSuccessMsg("");
      setErrorMsg("");
      setLastPollId(null);

      if (formErrors.length) return;

      try {
         setSaving(true);

         let imagenUrlStr = "";
         if (coverBlob) {
            imagenUrlStr = await blobToDataUrl(coverBlob);
         } else if (coverPreview && typeof coverPreview === "string") {
            imagenUrlStr = coverPreview;
         }

         const payload = {
            nombre: nombre.trim(),
            descripcion: descripcion.trim(),
            inicio: inicioISO,
            cierre: cierreISO,
            imagenUrl: imagenUrlStr,
         };

         const saved = await savePoll(payload);
         const encuestaId = saved?.id ?? id;

         await replaceOptions(encuestaId);

         setLastPollId(encuestaId);
         setSuccessMsg(
            isEdit
               ? "Cambios guardados correctamente."
               : "Encuesta creada correctamente. Ya puedes compartirla o revisarla en detalle."
         );

         if (!isEdit) {
            handleClear();
            setSubmitted(false);
         }
      } catch (e) {
         console.error("CREATE/EDIT POLL ERROR:", e?.response?.data ?? e);
         const msg =
            e?.response?.data?.message ||
            e?.response?.data?.error ||
            "No se pudo guardar la encuesta. Revisa los campos e inténtalo de nuevo.";
         setErrorMsg(msg);
      } finally {
         setSaving(false);
      }
   }

   function handleClear() {
      if (saving) return;

      setNombre("");
      setDescripcion("");

      setInicioDate("");
      setInicioTime("");
      setCierreDate("");
      setCierreTime("");

      clearCover();
      setOptImgErrors({});
      setOptions([emptyOption(), emptyOption()]);

      // fuerza remount de la lista (para que no se quede invisible por variants)
      setOptionsListKey((k) => k + 1);
   }

   async function onPickOptionImage(optKey, file) {
      setOptImgErrors((prev) => ({ ...prev, [optKey]: "" }));
      if (!file) return;

      if (!file.type?.startsWith("image/")) {
         setOptImgErrors((prev) => ({
            ...prev,
            [optKey]: "La imagen de la opción debe ser un archivo de imagen.",
         }));
         return;
      }
      if (!clampFileSizeMB(file, MAX_IMG_MB)) {
         setOptImgErrors((prev) => ({
            ...prev,
            [optKey]: `La imagen de la opción excede ${MAX_IMG_MB}MB.`,
         }));
         return;
      }

      const dataUrl = await fileToDataUrl(file);
      updateOption(optKey, { imagenUrl: dataUrl });
   }

   if (loading) {
      return (
         <div className="uv-polls-scope">
            <div className="uv-polls-page">
               <motion.div
                  className="uv-card"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.25, ease: "easeOut" }}
               >
                  Cargando...
               </motion.div>
            </div>
         </div>
      );
   }

   return (
      <div className="uv-polls-scope">
         <div className="uv-polls-page">
            <motion.div className="uv-card uv-create-card" variants={pageVariants} initial="hidden" animate="show">
               {/* Back dentro de la tarjeta */}
               <div className="uv-card-head">
                  <button className="uv-btn uv-btn-ghost uv-card-back" onClick={() => navigate(-1)} disabled={saving}>
                     <FiArrowLeft /> Volver
                  </button>

                  <h1 className="uv-polls-title">{isEdit ? "Editar encuesta" : "Crear encuesta"}</h1>
                  <p className="uv-muted">Define la encuesta y agrega sus opciones. (Mínimo 2)</p>
               </div>

               {/* Mensajes dentro del formulario */}
               {successMsg ? (
                  <div className="uv-alert uv-alert-success">
                     <div className="uv-alert-title">Listo</div>
                     <div className="uv-alert-text">{successMsg}</div>

                     {lastPollId ? (
                        <div className="uv-alert-actions">
                           <button
                              type="button"
                              className="uv-btn uv-btn-ghost"
                              onClick={() => navigate(`/polls/${lastPollId}`)}
                           >
                              Ver encuesta
                           </button>
                        </div>
                     ) : null}
                  </div>
               ) : null}

               {errorMsg ? (
                  <div className="uv-alert uv-alert-error">
                     <div className="uv-alert-title">No se pudo guardar</div>
                     <div className="uv-alert-text">{errorMsg}</div>
                  </div>
               ) : null}

               {/* Portada */}
               <div className="uv-field">
                  <Label>Foto / portada</Label>

                  <div className={`uv-cover ${coverError && submitted ? "uv-invalid" : ""}`}>
                     {coverPreview ? (
                        <div className="uv-cover-preview">
                           <img src={coverPreview} alt="Portada" />
                           <div className="uv-cover-tools">
                              <button type="button" className="uv-btn uv-btn-ghost" onClick={onPickCoverClick} disabled={saving}>
                                 <FiUpload /> Cambiar
                              </button>
                              <button type="button" className="uv-btn uv-btn-ghost" onClick={clearCover} disabled={saving}>
                                 <FiX /> Quitar
                              </button>
                           </div>
                        </div>
                     ) : (
                        <button type="button" className="uv-cover-drop" onClick={onPickCoverClick} disabled={saving}>
                           <FiUpload />
                           <span className="uv-cover-title">Portada</span>
                           <span className="uv-muted">Arrastra una imagen o haz click para seleccionar</span>
                           <span className="uv-muted">Máx {MAX_IMG_MB}MB</span>
                        </button>
                     )}

                     <input
                        ref={coverInputRef}
                        type="file"
                        accept="image/*"
                        className="uv-hidden"
                        onChange={(e) => onCoverFileSelected(e.target.files?.[0])}
                        disabled={saving}
                     />
                  </div>

                  {coverError ? <div className="uv-error">{coverError}</div> : null}
               </div>

               {/* Nombre + Inicio */}
               <div className="uv-grid-2">
                  <div className="uv-field">
                     <Label required>Nombre</Label>
                     <input
                        className={`uv-input ${!nombre.trim() ? "uv-invalid" : ""}`}
                        value={nombre}
                        onChange={(e) => setNombre(e.target.value)}
                        placeholder="Ej: Votaciones electorales"
                     />
                     {submitted && fieldErrors.nombre ? <div className="uv-error">{fieldErrors.nombre}</div> : null}
                  </div>

                  <div className="uv-field">
                     <Label>Inicio de la encuesta</Label>
                     <div className="uv-dt-row">
                        <input
                           className={`uv-input ${submitted && (fieldErrors.fechas || fieldErrors.timeOnly) ? "uv-invalid" : ""}`}
                           type="date"
                           value={inicioDate}
                           onChange={(e) => setInicioDate(e.target.value)}
                        />
                        <input
                           className={`uv-input ${submitted && (fieldErrors.fechas || fieldErrors.timeOnly) ? "uv-invalid" : ""}`}
                           type="time"
                           value={inicioTime}
                           onChange={(e) => setInicioTime(e.target.value)}
                        />
                     </div>

                     <div className="uv-date-help">
                        <span className={`uv-badge uv-badge--${estadoBadge.key}`}>{estadoBadge.label}</span>
                        <span className="uv-date-hint">{inicioHint}</span>
                     </div>
                  </div>
               </div>

               {/* Descripción + Cierre */}
               <div className="uv-grid-2">
                  <div className="uv-field">
                     <Label required>Descripción</Label>
                     <textarea
                        className={`uv-textarea uv-textarea--fixed ${!descripcion.trim() ? "uv-invalid" : ""}`}
                        value={descripcion}
                        onChange={(e) => setDescripcion(e.target.value)}
                        placeholder="Describe el objetivo de la encuesta..."
                     />
                     {submitted && fieldErrors.descripcion ? <div className="uv-error">{fieldErrors.descripcion}</div> : null}
                  </div>

                  <div className="uv-field">
                     <Label>Cierre de la encuesta</Label>
                     <div className="uv-dt-row">
                        <input
                           className={`uv-input ${submitted && (fieldErrors.fechas || fieldErrors.timeOnly) ? "uv-invalid" : ""}`}
                           type="date"
                           value={cierreDate}
                           onChange={(e) => setCierreDate(e.target.value)}
                        />
                        <input
                           className={`uv-input ${submitted && (fieldErrors.fechas || fieldErrors.timeOnly) ? "uv-invalid" : ""}`}
                           type="time"
                           value={cierreTime}
                           onChange={(e) => setCierreTime(e.target.value)}
                        />
                     </div>
                     {submitted && fieldErrors.timeOnly ? <div className="uv-error">{fieldErrors.timeOnly}</div> : null}
                     {submitted && fieldErrors.fechas ? <div className="uv-error">{fieldErrors.fechas}</div> : null}

                     <div className="uv-date-help">
                        <span className="uv-date-hint">{cierreHint}</span>
                     </div>
                  </div>
               </div>

               <h2 className="uv-section-title">Opciones de la encuesta</h2>

               <motion.div
                  key={optionsListKey}
                  className="uv-options"
                  variants={listVariants}
                  initial="hidden"
                  animate="show"
               >
                  {options.map((opt, idx) => {
                     const oe = fieldErrors.options?.[opt.key] || {};
                     const imgErr = optImgErrors?.[opt.key];

                     return (
                        <motion.div key={opt.key} variants={itemVariants} layout className="uv-option-card uv-flat">
                           <div className="uv-option-image">
                              <ImageDropzone
                                 value={opt.imagenUrl}
                                 disabled={saving}
                                 error={submitted && Boolean(imgErr)}
                                 title="Imagen"
                                 subtitle="Arrastra o selecciona"
                                 onPickFile={(file) => onPickOptionImage(opt.key, file)}
                                 onClear={() => updateOption(opt.key, { imagenUrl: "" })}
                              />
                              {submitted && imgErr ? <div className="uv-error">{imgErr}</div> : null}
                           </div>

                           <div className="uv-option-fields">
                              <div className="uv-option-head">
                                 <div className="uv-option-idx">#{idx + 1}</div>

                                 <button
                                    type="button"
                                    className="uv-icon-btn uv-icon-btn-danger"
                                    title="Eliminar opción"
                                    onClick={() => removeOption(opt.key)}
                                    disabled={saving || options.length <= 2}
                                 >
                                    <FiTrash2 />
                                 </button>
                              </div>

                              <div className="uv-field">
                                 <Label required>Nombre</Label>
                                 <input
                                    className={`uv-input ${!opt.nombre.trim() ? "uv-invalid" : ""}`}
                                    value={opt.nombre}
                                    onChange={(e) => updateOption(opt.key, { nombre: e.target.value })}
                                    placeholder="Ej: Partido A"
                                 />
                                 {submitted && oe.nombre ? <div className="uv-error">{oe.nombre}</div> : null}
                              </div>

                              <div className="uv-field uv-option-desc-wrap">
                                 <Label required>Descripción</Label>
                                 <textarea
                                    className={`uv-textarea uv-textarea--option ${!opt.descripcion.trim() ? "uv-invalid" : ""}`}
                                    value={opt.descripcion}
                                    onChange={(e) => updateOption(opt.key, { descripcion: e.target.value })}
                                    placeholder="Ej: Descripción del Partido A..."
                                 />
                                 {submitted && oe.descripcion ? <div className="uv-error">{oe.descripcion}</div> : null}
                              </div>
                           </div>
                        </motion.div>
                     );
                  })}
               </motion.div>

               {submitted && formErrors.length ? (
                  <div className="uv-errors">
                     {formErrors.slice(0, 10).map((e, i) => (
                        <div key={i} className="uv-error">
                           {e}
                        </div>
                     ))}
                  </div>
               ) : null}

               <div className="uv-actions">
                  <button type="button" className="uv-btn uv-btn-ghost" onClick={addOption} disabled={saving}>
                     <FiPlus /> Agregar opción a la encuesta
                  </button>

                  <button type="button" className="uv-btn uv-btn-primary" onClick={handleSubmit} disabled={!canSubmit}>
                     <FiCheck /> {saving ? "Guardando..." : isEdit ? "Guardar cambios" : "Crear encuesta"}
                  </button>

                  <button
                     type="button"
                     className="uv-btn"
                     onClick={() => {
                        setSubmitted(false);
                        setSuccessMsg("");
                        setErrorMsg("");
                        setLastPollId(null);
                        handleClear();
                     }}
                     disabled={saving}
                  >
                     <FiX /> Limpiar campos
                  </button>
               </div>
            </motion.div>
         </div>

         {/* Modal Cropper */}
         <AnimatePresence>
            {cropOpen ? (
               <motion.div
                  className="uv-modal-backdrop"
                  role="dialog"
                  aria-modal="true"
                  variants={modalBackdrop}
                  initial="hidden"
                  animate="show"
                  exit="exit"
                  onMouseDown={(e) => {
                     // click afuera cierra (sutil UX). Evita cerrar si el click es dentro del panel.
                     if (e.target === e.currentTarget) cancelCoverCrop();
                  }}
               >
                  <motion.div
                     className="uv-modal"
                     variants={modalPanel}
                     initial="hidden"
                     animate="show"
                     exit="exit"
                     onMouseDown={(e) => e.stopPropagation()}
                  >
                     <div className="uv-modal-head">
                        <h3 className="uv-modal-title">Reencuadrar portada</h3>
                        <button className="uv-icon-btn" onClick={cancelCoverCrop} title="Cerrar">
                           <FiX />
                        </button>
                     </div>

                     <div className="uv-cropper-wrap">
                        <Cropper
                           key={cropperKey}
                           image={coverSrc}
                           crop={coverCrop}
                           zoom={coverZoom}
                           aspect={16 / 6}
                           onCropChange={setCoverCrop}
                           onZoomChange={setCoverZoom}
                           onCropComplete={(_, croppedAreaPixels) => setCoverCroppedPixels(croppedAreaPixels)}
                        />
                     </div>

                     <div className="uv-modal-actions">
                        <button className="uv-btn" onClick={cancelCoverCrop}>
                           Cancelar
                        </button>
                        <button className="uv-btn uv-btn-primary" onClick={confirmCoverCrop}>
                           Confirmar recorte
                        </button>
                     </div>
                  </motion.div>
               </motion.div>
            ) : null}
         </AnimatePresence>
      </div>
   );
}
