import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { FiMail, FiLock, FiShield } from "react-icons/fi";
import { useNavigate } from "react-router-dom";

import "./login.css";
import logo from "../../assets/U-VoteLogo.png";

import { useAuth } from "../../auth/useAuth";
import { authApi } from "../../api/auth.api";

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/i;

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

   if (status === 401) return "Credenciales incorrectas. Verifica tu correo y contraseña.";
   if (status === 403) return msg || "Acceso denegado.";
   if (status === 400) return msg || "Revisa los datos ingresados.";
   if (!err?.response) return "No se pudo conectar con el servidor. Intenta de nuevo.";
   return msg || "No se pudo iniciar sesión. Verifica tu correo y contraseña.";
};

export default function Login() {
   const { login, isAuthenticated } = useAuth();
   const navigate = useNavigate();

   const [form, setForm] = useState({
      correo: "",
      contrasena: "",
      remember: true,
   });

   const [touched, setTouched] = useState({
      correo: false,
      contrasena: false,
   });

   const [loading, setLoading] = useState(false);
   const [error, setError] = useState("");
   const [notVerified, setNotVerified] = useState(false);

   useEffect(() => {
      if (isAuthenticated) {
         navigate("/", { replace: true });
      }
   }, [isAuthenticated, navigate]);

   const correoNorm = useMemo(() => form.correo.trim().toLowerCase(), [form.correo]);

   const fieldErrors = useMemo(() => {
      const errs = {};

      if (!correoNorm) errs.correo = "El correo es requerido.";
      else if (!emailRegex.test(correoNorm)) errs.correo = "Formato de correo inválido.";

      if (!form.contrasena || form.contrasena.trim().length === 0) {
         errs.contrasena = "La contraseña es requerida.";
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


      setTouched({ correo: true, contrasena: true });

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
                  <p>Accede con tu correo institucional o personal.</p>
               </div>

               {error && (
                  <div className="uv-login-alert" role="alert" aria-live="polite">
                     {error}

                     {notVerified && (
                        <div className="uv-login-cta">
                           <button type="button" className="uv-secondary-btn" onClick={goVerify}>
                              <FiShield />
                              Verificar ahora
                           </button>

                           <button
                              type="button"
                              className="uv-link-btn"
                              onClick={resendFromLogin}
                              disabled={loading || !correoNorm}
                              style={{ marginTop: 6 }}
                           >
                              Reenviar código
                           </button>
                        </div>
                     )}
                  </div>
               )}

               <form className="uv-login-form" onSubmit={onSubmit}>
                  <label className="uv-field">
                     <span>Correo electrónico</span>
                     <div
                        className={`uv-input-wrap ${touched.correo && fieldErrors.correo ? "uv-input-error" : ""
                           }`}
                     >
                        <FiMail className="uv-input-icon" />
                        <input
                           type="email"
                           name="correo"
                           placeholder="ejemplo@correo.com"
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

                  <label className="uv-field">
                     <span>Contraseña</span>
                     <div
                        className={`uv-input-wrap ${touched.contrasena && fieldErrors.contrasena ? "uv-input-error" : ""
                           }`}
                     >
                        <FiLock className="uv-input-icon" />
                        <input
                           type="password"
                           name="contrasena"
                           placeholder="Tu contraseña"
                           value={form.contrasena}
                           onChange={onChange}
                           onBlur={onBlur}
                           autoComplete="current-password"
                           required
                        />
                     </div>
                     {touched.contrasena && fieldErrors.contrasena && (
                        <small className="uv-field-error">{fieldErrors.contrasena}</small>
                     )}
                  </label>

                  <div className="uv-login-row">
                     <label className="uv-checkbox">
                        <input
                           type="checkbox"
                           name="remember"
                           checked={form.remember}
                           onChange={onChange}
                        />
                        <span>Recordarme por 30 días</span>
                     </label>

                     <button
                        type="button"
                        className="uv-link-btn"
                        onClick={() => alert("Funcionalidad pendiente")}
                     >
                        ¿Olvidaste tu contraseña?
                     </button>
                  </div>

                  <button className="uv-primary-btn" type="submit" disabled={!canSubmit}>
                     {loading ? "Ingresando..." : "Ingresar"}
                  </button>



                  <div className="uv-login-footer">
                     <span>¿Aún no tienes cuenta?</span>
                     <button
                        type="button"
                        className="uv-link-as-btn"
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
