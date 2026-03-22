import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
   FiMail,
   FiLock,
   FiUser,
   FiCheckCircle,
   FiMapPin,
   FiBookOpen,
   FiAlertCircle,
   FiEye,
   FiEyeOff,
} from "react-icons/fi";
import { useNavigate } from "react-router-dom";

import "./register.css";
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

   const [showPassword, setShowPassword] = useState(false);
   const [showConfirmPassword, setShowConfirmPassword] = useState(false);

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
                  const exists = mapped.some(
                     (c) => String(c.carreraId) === String(prev.carreraId)
                  );
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

      if (!nombreNorm) errs.nombreUsuario = "Campo obligatorio. Ingresa tu nombre de usuario.";
      else if (nombreNorm.length < 2) errs.nombreUsuario = "Debe tener al menos 2 caracteres.";
      else if (nombreNorm.length > 100) errs.nombreUsuario = "Máximo 100 caracteres.";

      if (!correoNorm) errs.correo = "Campo obligatorio. Ingresa tu correo institucional.";
      else if (!emailRegex.test(correoNorm)) errs.correo = "Formato de correo inválido.";
      else if (!/@est\.una\.ac\.cr$/i.test(correoNorm))
         errs.correo = "Debes usar tu correo institucional @est.una.ac.cr.";
      else if (correoNorm.length > 100) errs.correo = "Máximo 100 caracteres.";

      if (!form.contrasena) errs.contrasena = "Campo obligatorio. Ingresa una contraseña.";
      else if (form.contrasena.length < 8) errs.contrasena = "Mínimo 8 caracteres.";
      else if (form.contrasena.length > 72) errs.contrasena = "Máximo 72 caracteres.";

      if (!form.confirmarContrasena)
         errs.confirmarContrasena = "Campo obligatorio. Confirma tu contraseña.";
      else if (form.contrasena !== form.confirmarContrasena)
         errs.confirmarContrasena = "Las contraseñas no coinciden.";

      if (!form.campusId) errs.campusId = "Campo obligatorio. Debes seleccionar un campus.";
      if (!form.carreraId) errs.carreraId = "Campo obligatorio. Debes seleccionar una carrera.";

      return errs;
   }, [
      nombreNorm,
      correoNorm,
      form.contrasena,
      form.confirmarContrasena,
      form.campusId,
      form.carreraId,
   ]);

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

   const renderHintIcon = (fieldName) => {
      const showError = touched[fieldName] && fieldErrors[fieldName];
      if (!showError) return null;

      return (
         <div
            className="uv-register-hint"
            tabIndex={0}
            aria-label={fieldErrors[fieldName]}
            role="button"
         >
            <FiAlertCircle />
            <div className="uv-register-tooltip" role="tooltip">
               {fieldErrors[fieldName]}
            </div>
         </div>
      );
   };

   if (isAuthenticated) return null;

   return (
      <div className="uv-register-page">
         <motion.section
            className="uv-register-card"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35 }}
         >
            <div className="uv-register-left" aria-hidden="true">
               <div className="uv-register-left-inner">
                  <motion.img
                     className="uv-register-logo"
                     src={logo}
                     alt="U-Vote"
                     initial={{ y: 0, scale: 1 }}
                     animate={{ y: [0, -6, 0], scale: [1, 1.012, 1] }}
                     transition={{ duration: 4.2, repeat: Infinity, ease: "easeInOut" }}
                     draggable={false}
                  />
                  <p className="uv-register-left-sub">
                     Regístrate y haz que tu voto cuente.
                  </p>
               </div>
            </div>

            <div className="uv-register-right">
               <div className="uv-register-header">
                  <h1>Crear cuenta</h1>
                  <p>Completa los datos para registrarte en U-Vote.</p>
               </div>

               {error && (
                  <div className="uv-register-alert" role="alert" aria-live="polite">
                     {error}
                  </div>
               )}

               {okMsg && (
                  <div
                     className="uv-register-alert uv-register-alert--ok"
                     role="status"
                     aria-live="polite"
                  >
                     <FiCheckCircle style={{ marginRight: 8 }} />
                     {okMsg}
                  </div>
               )}

               <form className="uv-register-form" onSubmit={onSubmit}>
                  <label className="uv-register-field">
                     <span>Nombre de usuario</span>
                     <div
                        className={`uv-register-input-wrap ${
                           touched.nombreUsuario && fieldErrors.nombreUsuario
                              ? "uv-register-input-error"
                              : ""
                        }`}
                     >
                        <FiUser className="uv-register-input-icon" />
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
                        {renderHintIcon("nombreUsuario")}
                     </div>
                  </label>

                  <label className="uv-register-field">
                     <span>Correo electrónico institucional</span>
                     <div
                        className={`uv-register-input-wrap ${
                           touched.correo && fieldErrors.correo
                              ? "uv-register-input-error"
                              : ""
                        }`}
                     >
                        <FiMail className="uv-register-input-icon" />
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
                        {renderHintIcon("correo")}
                     </div>
                  </label>

                  <div className="uv-register-grid-2">
                     <label className="uv-register-field">
                        <span>Campus</span>
                        <div
                           className={`uv-register-input-wrap uv-register-select-wrap ${
                              touched.campusId && fieldErrors.campusId
                                 ? "uv-register-input-error"
                                 : ""
                           }`}
                        >
                           <FiMapPin className="uv-register-input-icon" />
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
                           {renderHintIcon("campusId")}
                        </div>
                     </label>

                     <label className="uv-register-field">
                        <span>Carrera</span>
                        <div
                           className={`uv-register-input-wrap uv-register-select-wrap ${
                              touched.carreraId && fieldErrors.carreraId
                                 ? "uv-register-input-error"
                                 : ""
                           }`}
                        >
                           <FiBookOpen className="uv-register-input-icon" />
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
                           {renderHintIcon("carreraId")}
                        </div>
                     </label>
                  </div>

                  <label className="uv-register-field">
                     <span>Contraseña</span>
                     <div
                        className={`uv-register-input-wrap ${
                           touched.contrasena && fieldErrors.contrasena
                              ? "uv-register-input-error"
                              : ""
                        }`}
                     >
                        <FiLock className="uv-register-input-icon" />
                        <input
                           type={showPassword ? "text" : "password"}
                           name="contrasena"
                           placeholder="Mínimo 8 caracteres"
                           value={form.contrasena}
                           onChange={onChange}
                           onBlur={onBlur}
                           autoComplete="new-password"
                           required
                        />
                        {renderHintIcon("contrasena")}
                        <button
                           type="button"
                           className="uv-register-password-toggle"
                           onClick={() => setShowPassword((prev) => !prev)}
                           aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                           title={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                        >
                           {showPassword ? <FiEyeOff /> : <FiEye />}
                        </button>
                     </div>
                  </label>

                  <label className="uv-register-field">
                     <span>Confirmar contraseña</span>
                     <div
                        className={`uv-register-input-wrap ${
                           touched.confirmarContrasena && fieldErrors.confirmarContrasena
                              ? "uv-register-input-error"
                              : ""
                        }`}
                     >
                        <FiLock className="uv-register-input-icon" />
                        <input
                           type={showConfirmPassword ? "text" : "password"}
                           name="confirmarContrasena"
                           placeholder="Repite la contraseña"
                           value={form.confirmarContrasena}
                           onChange={onChange}
                           onBlur={onBlur}
                           autoComplete="new-password"
                           required
                        />
                        {renderHintIcon("confirmarContrasena")}
                        <button
                           type="button"
                           className="uv-register-password-toggle"
                           onClick={() => setShowConfirmPassword((prev) => !prev)}
                           aria-label={
                              showConfirmPassword
                                 ? "Ocultar confirmación de contraseña"
                                 : "Mostrar confirmación de contraseña"
                           }
                           title={
                              showConfirmPassword
                                 ? "Ocultar confirmación de contraseña"
                                 : "Mostrar confirmación de contraseña"
                           }
                        >
                           {showConfirmPassword ? <FiEyeOff /> : <FiEye />}
                        </button>
                     </div>
                  </label>

                  <button className="uv-register-primary-btn" type="submit" disabled={!canSubmit}>
                     {loading ? "Creando cuenta..." : "Registrarme"}
                  </button>

                  <div className="uv-register-footer">
                     <span>¿Ya tienes una cuenta?</span>
                     <button
                        type="button"
                        className="uv-register-link-as-btn"
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