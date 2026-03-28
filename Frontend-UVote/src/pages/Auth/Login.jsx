import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
   FiMail,
   FiLock,
   FiShield,
   FiAlertCircle,
   FiEye,
   FiEyeOff,
} from "react-icons/fi";
import { useNavigate } from "react-router-dom";

import "./login.css";
import logo from "../../assets/U-VoteLogo.png";
import logoW from "../../assets/U-VoteLogoW.png";

import { useAuth } from "../../auth/useAuth";
import { useTheme } from "../../context/ThemeContext";
import { authApi } from "../../api/auth.api";

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/i;

const normalizeEmail = (s) => (s || "").trim().toLowerCase();

const isNotVerifiedMessage = (msg = "") => {
   const m = (msg || "").toLowerCase();
   return (
      m.includes("no verificada") ||
      m.includes("no verificado") ||
      m.includes("verificar tu correo") ||
      m.includes("verifica tu correo")
   );
};

const getLoginErrorMessage = (err) => {
   const status = err?.response?.status;
   const msg = err?.response?.data?.message || err?.message || "";

   if (status === 429) return msg || "Demasiadas solicitudes. Espera unos segundos e intenta de nuevo.";
   if (status === 401) return "Credenciales incorrectas. Verifica tu correo y contraseña.";
   if (status === 403) return msg || "Acceso denegado.";
   if (status === 400) return msg || "Revisa los datos ingresados.";
   if (!err?.response) return "No se pudo conectar con el servidor. Intenta de nuevo.";
   return msg || "No se pudo iniciar sesión. Verifica tu correo y contraseña.";
};

export default function Login() {
   const { login, isAuthenticated } = useAuth();
   const navigate = useNavigate();
   const { theme } = useTheme();

   const [form, setForm] = useState({
      correo: "",
      contrasena: "",
      remember: true,
   });

   const [touched, setTouched] = useState({
      correo: false,
      contrasena: false,
   });

   const [showPassword, setShowPassword] = useState(false);
   const [loading, setLoading] = useState(false);
   const [error, setError] = useState("");
   const [notVerified, setNotVerified] = useState(false);

   useEffect(() => {
      if (isAuthenticated) {
         navigate("/", { replace: true });
      }
   }, [isAuthenticated, navigate]);

   const correoNorm = useMemo(() => normalizeEmail(form.correo), [form.correo]);

   const fieldErrors = useMemo(() => {
      const errs = {};

      if (!correoNorm) {
         errs.correo = "Campo obligatorio. Ingresa tu correo institucional.";
      } else if (!emailRegex.test(correoNorm)) {
         errs.correo = "Formato de correo inválido.";
      } else if (!/@est\.una\.ac\.cr$/i.test(correoNorm)) {
         errs.correo = "Debes usar tu correo institucional @est.una.ac.cr.";
      } else if (correoNorm.length > 100) {
         errs.correo = "Máximo 100 caracteres.";
      }

      if (!form.contrasena || form.contrasena.trim().length === 0) {
         errs.contrasena = "Campo obligatorio. Ingresa tu contraseña.";
      }

      return errs;
   }, [correoNorm, form.contrasena]);

   const canSubmit = useMemo(() => {
      return Object.keys(fieldErrors).length === 0 && !loading;
   }, [fieldErrors, loading]);

   const onChange = (e) => {
      const { name, value, type, checked } = e.target;

      setForm((prev) => ({
         ...prev,
         [name]: type === "checkbox" ? checked : value,
      }));

      setError("");
      setNotVerified(false);
   };

   const onBlur = (e) => {
      const { name } = e.target;
      setTouched((prev) => ({ ...prev, [name]: true }));
   };

   const goVerify = () => {
      navigate(correoNorm ? `/verify?correo=${encodeURIComponent(correoNorm)}` : "/verify");
   };

   const resendFromLogin = async () => {
      if (!correoNorm || loading) return;

      setLoading(true);
      setError("");

      try {
         await authApi.resendCode({ correo: correoNorm });
         setError("Si el correo está registrado, te enviamos un nuevo código.");
      } catch (e) {
         setError(getLoginErrorMessage(e));
      } finally {
         setLoading(false);
      }
   };

   const onSubmit = async (e) => {
      e.preventDefault();

      setTouched({
         correo: true,
         contrasena: true,
      });

      if (!canSubmit) return;

      setLoading(true);
      setError("");
      setNotVerified(false);

      try {
         await login(correoNorm, form.contrasena);
         navigate("/", { replace: true });
      } catch (err) {
         const msg = getLoginErrorMessage(err);
         setError(msg);

         const status = err?.response?.status;
         if (status === 403 && isNotVerifiedMessage(msg)) {
            setNotVerified(true);
         }
      } finally {
         setLoading(false);
      }
   };

   const renderHintIcon = (fieldName) => {
      const showError = touched[fieldName] && fieldErrors[fieldName];
      if (!showError) return null;

      return (
         <div
            className="uv-login-hint"
            tabIndex={0}
            aria-label={fieldErrors[fieldName]}
            role="button"
         >
            <FiAlertCircle />
            <div className="uv-login-tooltip" role="tooltip">
               {fieldErrors[fieldName]}
            </div>
         </div>
      );
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
                     src={theme === "dark" ? logoW : logo}
                     alt="U-Vote"
                     initial={{ y: 0, scale: 1 }}
                     animate={{ y: [0, -6, 0], scale: [1, 1.012, 1] }}
                     transition={{ duration: 4.2, repeat: Infinity, ease: "easeInOut" }}
                     whileHover={{ scale: 1.03, rotate: -0.4 }}
                     whileTap={{ scale: 0.995 }}
                     draggable={false}
                  />
                  <p className="uv-login-left-sub">Es tu turno de hacer el cambio.</p>
               </div>
            </div>

            <div className="uv-login-right">
               <div className="uv-login-header">
                  <h1>Iniciar sesión</h1>
                  <p>Accede con tu correo institucional.</p>
               </div>

               {error && (
                  <div className="uv-login-alert" role="alert" aria-live="polite">
                     {error}

                     {notVerified && (
                        <div className="uv-login-cta">
                           <button type="button" className="uv-login-secondary-btn" onClick={goVerify}>
                              <FiShield />
                              Verificar ahora
                           </button>

                           <button
                              type="button"
                              className="uv-login-link-btn"
                              onClick={resendFromLogin}
                              disabled={loading || !correoNorm}
                           >
                              Reenviar código
                           </button>
                        </div>
                     )}
                  </div>
               )}

               <form className="uv-login-form" onSubmit={onSubmit}>
                  <label className="uv-login-field">
                     <span>Correo electrónico institucional</span>
                     <div
                        className={`uv-login-input-wrap ${
                           touched.correo && fieldErrors.correo ? "uv-login-input-error" : ""
                        }`}
                     >
                        <FiMail className="uv-login-input-icon" />
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

                  <label className="uv-login-field">
                     <span>Contraseña</span>
                     <div
                        className={`uv-login-input-wrap ${
                           touched.contrasena && fieldErrors.contrasena
                              ? "uv-login-input-error"
                              : ""
                        }`}
                     >
                        <FiLock className="uv-login-input-icon" />
                        <input
                           type={showPassword ? "text" : "password"}
                           name="contrasena"
                           placeholder="Tu contraseña"
                           value={form.contrasena}
                           onChange={onChange}
                           onBlur={onBlur}
                           autoComplete="current-password"
                           required
                        />

                        {renderHintIcon("contrasena")}

                        <button
                           type="button"
                           className="uv-login-password-toggle"
                           onClick={() => setShowPassword((prev) => !prev)}
                           aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                           title={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                        >
                           {showPassword ? <FiEyeOff /> : <FiEye />}
                        </button>
                     </div>
                  </label>

                  <div className="uv-login-row">
                     <label className="uv-login-checkbox">
                        <input
                           type="checkbox"
                           name="remember"
                           checked={form.remember}
                           onChange={onChange}
                        />
                        <span>Recordarme por 30 días</span>
                     </label>
                  </div>

                  <button className="uv-login-primary-btn" type="submit" disabled={!canSubmit}>
                     {loading ? "Ingresando..." : "Ingresar"}
                  </button>

                  <div className="uv-login-footer">
                     <span>¿Aún no tienes cuenta?</span>
                     <button
                        type="button"
                        className="uv-login-link-as-btn"
                        onClick={() => navigate("/register")}
                     >
                        Crear cuenta
                     </button>
                  </div>
               </form>
            </div>
         </motion.section>
      </div>
   );
}