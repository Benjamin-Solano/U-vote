import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { FiMail, FiLock, FiUser, FiCheckCircle, FiMapPin, FiBookOpen } from "react-icons/fi";
import { useNavigate } from "react-router-dom";

import "./login.css";
import logo from "../../assets/U-VoteLogo.png";

import { useAuth } from "../../auth/useAuth";
import { usersApi } from "../../api/users.api";
import { campusApi } from "../../api/campus.api";

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/i;

const normalizeNombre = (s) => (s || "").trim().replace(/\s+/g, " ");
const normalizeEmail = (s) => (s || "").trim().toLowerCase();

const getRegisterErrorMessage = (err) => {
   const status = err?.response?.status;
   const msg = err?.response?.data?.message || err?.message || "";

   if (status === 409) return msg || "El correo o usuario ya está registrado.";
   if (status === 400) return msg || "Revisa los datos del formulario e inténtalo de nuevo.";
   if (status === 403) return msg || "No tienes permisos para acceder a esta información.";
   if (!err?.response) return "No se pudo conectar con el servidor. Intenta de nuevo.";
   return msg || "No se pudo crear la cuenta. Verifica los datos e inténtalo de nuevo.";
};

const getOptionsErrorMessage = (err) => {
   const status = err?.response?.status;
   const msg = err?.response?.data?.message || "";

   if (status === 403) return msg || "El backend está bloqueando el acceso a campus o carreras.";
   return "No se pudieron cargar los campus o carreras. Intenta de nuevo.";
};

export default function Register() {
   const { isAuthenticated } = useAuth();
   const navigate = useNavigate();

   const [form, setForm] = useState({
      nombreUsuario: "",
      correo: "",
      contrasena: "",
      confirmarContrasena: "",
      campusId: "",
      carreraId: "",
   });

   const [touched, setTouched] = useState({
      nombreUsuario: false,
      correo: false,
      contrasena: false,
      confirmarContrasena: false,
      campusId: false,
      carreraId: false,
   });

   const [campusOptions, setCampusOptions] = useState([]);
   const [carreraOptions, setCarreraOptions] = useState([]);
   const [loadingCampus, setLoadingCampus] = useState(false);
   const [loadingCarreras, setLoadingCarreras] = useState(false);

   const [loading, setLoading] = useState(false);
   const [error, setError] = useState("");
   const [okMsg, setOkMsg] = useState("");

   useEffect(() => {
      if (isAuthenticated) {
         navigate("/", { replace: true });
      }
   }, [isAuthenticated, navigate]);

   useEffect(() => {
      let ignore = false;

      const loadCampus = async () => {
         setLoadingCampus(true);
         try {
            const res = await campusApi.list();
            const data = res?.data;

            if (!ignore) {
               setCampusOptions(Array.isArray(data) ? data : []);
            }
         } catch (err) {
            if (!ignore) {
               setCampusOptions([]);
               setError(getOptionsErrorMessage(err));
            }
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

      const campusId = form.campusId;

      if (!campusId) {
         setCarreraOptions([]);
         setForm((prev) => ({ ...prev, carreraId: "" }));
         return;
      }

      const loadCarreras = async () => {
         setLoadingCarreras(true);
         try {
            const res = await campusApi.getCarrerasByCampus(campusId);
            const data = res?.data;

            if (!ignore) {
               const mapped = Array.isArray(data)
                  ? data.map((item) => ({
                     campusCarreraId: item.campusCarreraId,
                     carreraId: item.carreraId,
                     carreraNombre: item.carreraNombre,
                  }))
                  : [];

               setCarreraOptions(mapped);

               setForm((prev) => {
                  const exists = mapped.some((c) => String(c.carreraId) === String(prev.carreraId));
                  return exists ? prev : { ...prev, carreraId: "" };
               });
            }
         } catch (err) {
            if (!ignore) {
               setCarreraOptions([]);
               setForm((prev) => ({ ...prev, carreraId: "" }));
               setError(getOptionsErrorMessage(err));
            }
         } finally {
            if (!ignore) setLoadingCarreras(false);
         }
      };

      loadCarreras();
      return () => {
         ignore = true;
      };
   }, [form.campusId]);

   const nombreNorm = useMemo(() => normalizeNombre(form.nombreUsuario), [form.nombreUsuario]);
   const correoNorm = useMemo(() => normalizeEmail(form.correo), [form.correo]);

   const fieldErrors = useMemo(() => {
      const errs = {};

      if (!nombreNorm) errs.nombreUsuario = "El nombre de usuario es requerido.";
      else if (nombreNorm.length < 2) errs.nombreUsuario = "Debe tener al menos 2 caracteres.";
      else if (nombreNorm.length > 100) errs.nombreUsuario = "Máximo 100 caracteres.";

      if (!correoNorm) errs.correo = "El correo es requerido.";
      else if (!emailRegex.test(correoNorm)) errs.correo = "Formato de correo inválido.";
      else if (!/@est\.una\.ac\.cr$/i.test(correoNorm))
         errs.correo = "Debes usar tu correo institucional @est.una.ac.cr.";
      else if (correoNorm.length > 100) errs.correo = "Máximo 100 caracteres.";

      if (!form.contrasena) errs.contrasena = "La contraseña es requerida.";
      else if (form.contrasena.length < 8) errs.contrasena = "Mínimo 8 caracteres.";
      else if (form.contrasena.length > 72) errs.contrasena = "Máximo 72 caracteres.";

      if (!form.confirmarContrasena) errs.confirmarContrasena = "Confirma tu contraseña.";
      else if (form.contrasena !== form.confirmarContrasena)
         errs.confirmarContrasena = "Las contraseñas no coinciden.";

      if (!form.campusId) errs.campusId = "Debes seleccionar un campus.";
      if (!form.carreraId) errs.carreraId = "Debes seleccionar una carrera.";

      return errs;
   }, [nombreNorm, correoNorm, form.contrasena, form.confirmarContrasena, form.campusId, form.carreraId]);

   const canSubmit = useMemo(() => {
      return (
         Object.keys(fieldErrors).length === 0 &&
         !loading &&
         !loadingCampus &&
         !loadingCarreras
      );
   }, [fieldErrors, loading, loadingCampus, loadingCarreras]);

   const onChange = (e) => {
      const { name, value } = e.target;

      setForm((prev) => {
         if (name === "campusId") {
            return { ...prev, campusId: value, carreraId: "" };
         }
         return { ...prev, [name]: value };
      });

      setError("");
      setOkMsg("");
   };

   const onBlur = (e) => {
      const { name } = e.target;
      setTouched((prev) => ({ ...prev, [name]: true }));
   };

   const onSubmit = async (e) => {
      e.preventDefault();

      setTouched({
         nombreUsuario: true,
         correo: true,
         contrasena: true,
         confirmarContrasena: true,
         campusId: true,
         carreraId: true,
      });

      if (!canSubmit) return;

      setLoading(true);
      setError("");
      setOkMsg("");

      try {
         await usersApi.create({
            nombreUsuario: nombreNorm,
            correo: correoNorm,
            contrasena: form.contrasena,
            campusId: Number(form.campusId),
            carreraId: Number(form.carreraId),
         });

         setOkMsg("Cuenta creada. Te enviamos un código para verificar tu correo.");
         setTimeout(() => {
            navigate(`/verify?correo=${encodeURIComponent(correoNorm)}`, { replace: true });
         }, 650);
      } catch (err) {
         setError(getRegisterErrorMessage(err));
      } finally {
         setLoading(false);
      }
   };

   if (isAuthenticated) return null;

   return (
      <div className="uv-login-page">
         <motion.section
            className="uv-login-card"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35 }}
         >
            <div className="uv-login-left" aria-hidden="true">
               <div className="uv-login-left-inner">
                  <motion.img
                     className="uv-login-logo"
                     src={logo}
                     alt="U-Vote"
                     initial={{ y: 0, scale: 1 }}
                     animate={{ y: [0, -6, 0], scale: [1, 1.012, 1] }}
                     transition={{ duration: 4.2, repeat: Infinity, ease: "easeInOut" }}
                     draggable={false}
                  />
                  <p className="uv-login-left-sub">Regístrate y haz que tu voto cuente.</p>
               </div>
            </div>

            <div className="uv-login-right">
               <div className="uv-login-header">
                  <h1>Crear cuenta</h1>
                  <p>Completa los datos para registrarte en U-Vote.</p>
               </div>

               {error && (
                  <div className="uv-login-alert" role="alert" aria-live="polite">
                     {error}
                  </div>
               )}

               {okMsg && (
                  <div className="uv-login-alert uv-login-alert--ok" role="status" aria-live="polite">
                     <FiCheckCircle style={{ marginRight: 8 }} />
                     {okMsg}
                  </div>
               )}

               <form className="uv-login-form" onSubmit={onSubmit}>
                  <label className="uv-field">
                     <span>Nombre de usuario</span>
                     <div className={`uv-input-wrap ${touched.nombreUsuario && fieldErrors.nombreUsuario ? "uv-input-error" : ""}`}>
                        <FiUser className="uv-input-icon" />
                        <input
                           type="text"
                           name="nombreUsuario"
                           placeholder="Tu nombre"
                           value={form.nombreUsuario}
                           onChange={onChange}
                           onBlur={onBlur}
                           autoComplete="username"
                           required
                        />
                     </div>
                     {touched.nombreUsuario && fieldErrors.nombreUsuario && (
                        <small className="uv-field-error">{fieldErrors.nombreUsuario}</small>
                     )}
                  </label>

                  <label className="uv-field">
                     <span>Correo electrónico institucional</span>
                     <div className={`uv-input-wrap ${touched.correo && fieldErrors.correo ? "uv-input-error" : ""}`}>
                        <FiMail className="uv-input-icon" />
                        <input
                           type="email"
                           name="correo"
                           placeholder="nombre.apellido1.apellido2@est.una.ac.cr"
                           value={form.correo}
                           onChange={onChange}
                           onBlur={onBlur}
                           autoComplete="email"
                           required
                        />
                     </div>
                     {touched.correo && fieldErrors.correo && (
                        <small className="uv-field-error">{fieldErrors.correo}</small>
                     )}
                  </label>

                  <div className="uv-login-grid-2">
                     <label className="uv-field">
                        <span>Campus</span>
                        <div className={`uv-input-wrap uv-select-wrap ${touched.campusId && fieldErrors.campusId ? "uv-input-error" : ""}`}>
                           <FiMapPin className="uv-input-icon" />
                           <select
                              name="campusId"
                              value={form.campusId}
                              onChange={onChange}
                              onBlur={onBlur}
                              disabled={loadingCampus}
                              required
                           >
                              <option value="">
                                 {loadingCampus ? "Cargando campus..." : "Selecciona un campus"}
                              </option>
                              {campusOptions.map((campus) => (
                                 <option key={campus.id} value={campus.id}>
                                    {campus.nombre}
                                 </option>
                              ))}
                           </select>
                        </div>
                        {touched.campusId && fieldErrors.campusId && (
                           <small className="uv-field-error">{fieldErrors.campusId}</small>
                        )}
                     </label>

                     <label className="uv-field">
                        <span>Carrera</span>
                        <div className={`uv-input-wrap uv-select-wrap ${touched.carreraId && fieldErrors.carreraId ? "uv-input-error" : ""}`}>
                           <FiBookOpen className="uv-input-icon" />
                           <select
                              name="carreraId"
                              value={form.carreraId}
                              onChange={onChange}
                              onBlur={onBlur}
                              disabled={!form.campusId || loadingCarreras}
                              required
                           >
                              <option value="">
                                 {!form.campusId
                                    ? "Selecciona primero un campus"
                                    : loadingCarreras
                                       ? "Cargando carreras..."
                                       : "Selecciona una carrera"}
                              </option>
                              {carreraOptions.map((item) => (
                                 <option key={item.campusCarreraId} value={item.carreraId}>
                                    {item.carreraNombre}
                                 </option>
                              ))}
                           </select>
                        </div>
                        {touched.carreraId && fieldErrors.carreraId && (
                           <small className="uv-field-error">{fieldErrors.carreraId}</small>
                        )}
                     </label>
                  </div>

                  <label className="uv-field">
                     <span>Contraseña</span>
                     <div className={`uv-input-wrap ${touched.contrasena && fieldErrors.contrasena ? "uv-input-error" : ""}`}>
                        <FiLock className="uv-input-icon" />
                        <input
                           type="password"
                           name="contrasena"
                           placeholder="Mínimo 8 caracteres"
                           value={form.contrasena}
                           onChange={onChange}
                           onBlur={onBlur}
                           autoComplete="new-password"
                           required
                        />
                     </div>
                     {touched.contrasena && fieldErrors.contrasena && (
                        <small className="uv-field-error">{fieldErrors.contrasena}</small>
                     )}
                  </label>

                  <label className="uv-field">
                     <span>Confirmar contraseña</span>
                     <div className={`uv-input-wrap ${touched.confirmarContrasena && fieldErrors.confirmarContrasena ? "uv-input-error" : ""}`}>
                        <FiLock className="uv-input-icon" />
                        <input
                           type="password"
                           name="confirmarContrasena"
                           placeholder="Repite la contraseña"
                           value={form.confirmarContrasena}
                           onChange={onChange}
                           onBlur={onBlur}
                           autoComplete="new-password"
                           required
                        />
                     </div>
                     {touched.confirmarContrasena && fieldErrors.confirmarContrasena && (
                        <small className="uv-field-error">{fieldErrors.confirmarContrasena}</small>
                     )}
                  </label>

                  <button className="uv-primary-btn" type="submit" disabled={!canSubmit}>
                     {loading ? "Creando cuenta..." : "Registrarme"}
                  </button>

                  <div className="uv-login-footer">
                     <span>¿Ya tienes una cuenta?</span>
                     <button
                        type="button"
                        className="uv-link-as-btn"
                        onClick={() => navigate("/login")}
                     >
                        Iniciar sesión
                     </button>
                  </div>
               </form>
            </div>
         </motion.section>
      </div>
   );
}