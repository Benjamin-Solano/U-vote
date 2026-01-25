import { useEffect, useMemo, useRef, useState } from "react";
import { FiPlus, FiCheck, FiTrash2, FiArrowLeft, FiUpload } from "react-icons/fi";
import { useNavigate } from "react-router-dom";

import { pollsApi } from "../../api/polls.api";
import { optionsApi } from "../../api/options.api";
import "./polls.css";

const emptyOption = () => ({
   key: crypto.randomUUID(),
   nombre: "",
   descripcion: "",
   imagenUrl: "",
});

export default function CreatePoll() {
   const navigate = useNavigate();

   // Encuesta
   const [nombre, setNombre] = useState("");
   const [descripcion, setDescripcion] = useState("");

   // Rango (UI-only por ahora)
   const [inicio, setInicio] = useState("");
   const [cierre, setCierre] = useState("");

   // Opciones (mínimo 2 filas)
   const [options, setOptions] = useState([emptyOption(), emptyOption()]);

   const [loading, setLoading] = useState(false);

   // Toast
   const [toast, setToast] = useState({ show: false, type: "success", message: "" });
   const toastTimer = useRef(null);

   const showToast = (type, message) => {
      setToast({ show: true, type, message });
      if (toastTimer.current) window.clearTimeout(toastTimer.current);
      toastTimer.current = window.setTimeout(() => {
         setToast((t) => ({ ...t, show: false }));
      }, 5000);
   };

   useEffect(() => {
      return () => {
         if (toastTimer.current) window.clearTimeout(toastTimer.current);
      };
   }, []);

   const rangeError = useMemo(() => {
      if (!inicio || !cierre) return "";
      const a = new Date(inicio).getTime();
      const b = new Date(cierre).getTime();
      if (!Number.isFinite(a) || !Number.isFinite(b)) return "Fechas inválidas.";
      if (a >= b) return "El inicio debe ser anterior al cierre.";
      return "";
   }, [inicio, cierre]);

   const optionErrors = useMemo(() => {
      return options.map((o) => ({
         nombre: o.nombre.trim().length === 0,
         descripcion: o.descripcion.trim().length === 0,
      }));
   }, [options]);

   const canSubmit = useMemo(() => {
      const pollOk = nombre.trim().length > 0 && descripcion.trim().length > 0;
      const rangeOk = !rangeError; // opcional (solo valida si están ambas)
      const optionsOk =
         options.length >= 2 &&
         optionErrors.every((e) => e.nombre === false && e.descripcion === false);

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
         // No permitir bajar de 2 opciones
         if (prev.length <= 2) return prev;

         const next = prev.filter((_, i) => i !== idx);
         return next.length < 2 ? [emptyOption(), emptyOption()] : next;
      });
   };

   const clearAll = () => {
      setNombre("");
      setDescripcion("");
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
         // 1) Crear encuesta
         const pollPayload = {
            nombre: nombre.trim(),
            descripcion: descripcion.trim(),
            // Cuando tu backend soporte fechas:
            // inicio: inicio ? new Date(inicio).toISOString() : null,
            // cierre: cierre ? new Date(cierre).toISOString() : null,
         };

         const pollRes = await pollsApi.create(pollPayload);
         const poll = pollRes.data;

         // 2) Crear opciones (mínimo 2)
         for (let i = 0; i < options.length; i++) {
            const o = options[i];

            const payload = {
               nombre: o.nombre.trim(),
               descripcion: o.descripcion.trim(), // ✅ obligatoria
               imagenUrl: o.imagenUrl.trim() || null,
               orden: i + 1,
            };

            await optionsApi.create(poll.id, payload);
         }

         showToast("success", "Encuesta creada correctamente.");
         clearAll();
         // Opcional:
         // navigate(`/encuestas/${poll.id}`);
      } catch (e) {
         const msg =
            e?.response?.data?.message ||
            e.message ||
            "Ocurrió un error al crear la encuesta.";
         showToast("error", msg);
      } finally {
         setLoading(false);
      }
   };

   return (
      <div className="uv-polls-scope uv-create-wrap">
         <div className="uv-create-card">
            <div className="uv-create-head">
               <button className="uv-btn" type="button" onClick={() => navigate(-1)} disabled={loading}>
                  <FiArrowLeft /> Volver
               </button>

               <div className="uv-create-titleblock">
                  <h1 className="uv-create-title">Crear encuesta</h1>
                  <p className="uv-create-sub">
                     Define la encuesta y agrega sus opciones. (Mínimo 2)
                  </p>
               </div>
            </div>

            {/* Datos de encuesta */}
            <div className="uv-create-grid">
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
                  <input
                     className="uv-input"
                     type="datetime-local"
                     value={inicio}
                     onChange={(e) => setInicio(e.target.value)}
                     disabled={loading}
                  />
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
                  <input
                     className="uv-input"
                     type="datetime-local"
                     value={cierre}
                     onChange={(e) => setCierre(e.target.value)}
                     disabled={loading}
                  />
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
                           <div className="uv-option-photo">
                              <div className="uv-photo-box">
                                 <FiUpload />
                                 <span>Imagen</span>
                              </div>

                              <input
                                 className="uv-input"
                                 value={o.imagenUrl}
                                 onChange={(e) => setOptionField(idx, "imagenUrl", e.target.value)}
                                 placeholder="URL de la imagen (opcional)"
                                 disabled={loading}
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
                              title={
                                 options.length <= 2
                                    ? "Debes mantener mínimo 2 opciones"
                                    : "Eliminar opción"
                              }
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

                  <button
                     className="uv-btn uv-btn-dark"
                     type="button"
                     onClick={handleFinish}
                     disabled={!canSubmit || loading}
                  >
                     <FiCheck /> {loading ? "Guardando…" : "Terminar edición de encuesta"}
                  </button>

                  <button className="uv-btn" type="button" onClick={clearAll} disabled={loading}>
                     Limpiar campos
                  </button>
               </div>
            </div>
         </div>

         {toast.show && (
            <div className={`uv-toast ${toast.type === "success" ? "ok" : "bad"}`}>
               {toast.message}
            </div>
         )}
      </div>
   );
}
