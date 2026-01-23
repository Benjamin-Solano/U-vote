import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { FiMail, FiLock } from "react-icons/fi";
import { useNavigate } from "react-router-dom";

import "./login.css";
import logo from "../../assets/U-VoteLogo.png";
import { useAuth } from "../../auth/useAuth";

export default function Login() {
   const { login, isAuthenticated } = useAuth();
   const navigate = useNavigate();

   const [form, setForm] = useState({
      correo: "",
      contrasena: "",
      remember: true,
   });

   const [loading, setLoading] = useState(false);
   const [error, setError] = useState("");

   useEffect(() => {
      if (isAuthenticated) {
         navigate("/", { replace: true });
      }
   }, [isAuthenticated, navigate]);

   const canSubmit = useMemo(() => {
      return form.correo.trim().length > 0 && form.contrasena.trim().length > 0;
   }, [form.correo, form.contrasena]);

   const onChange = (e) => {
      const { name, value, type, checked } = e.target;
      setForm((prev) => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
      setError("");
   };

   const onSubmit = async (e) => {
      e.preventDefault();
      if (!canSubmit || loading) return;

      setLoading(true);
      setError("");

      try {
         await login(form.correo, form.contrasena);
         navigate("/", { replace: true });
      } catch (err) {
         const msg =
            err?.response?.data?.message ||
            err?.message ||
            "No se pudo iniciar sesión. Verifica tu correo y contraseña.";
         setError(msg);
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
            {/* Panel izquierdo */}
            <div className="uv-login-left" aria-hidden="true">
               <div className="uv-login-left-inner">
                  {/* ✅ Animación sutil del logo */}
                  <motion.img
                     className="uv-login-logo"
                     src={logo}
                     alt="U-Vote"
                     initial={{ y: 0, scale: 1 }}
                     animate={{
                        y: [0, -6, 0],
                        scale: [1, 1.012, 1],
                     }}
                     transition={{
                        duration: 4.2,
                        repeat: Infinity,
                        ease: "easeInOut",
                     }}
                     whileHover={{ scale: 1.03, rotate: -0.4 }}
                     whileTap={{ scale: 0.995 }}
                     draggable={false}
                  />

                  <p className="uv-login-left-sub">Es tu turno de hacer el cambio.</p>


               </div>
            </div>

            {/* Panel derecho */}
            <div className="uv-login-right">
               <div className="uv-login-header">
                  <h1>Iniciar sesión</h1>
                  <p>Accede con tu correo institucional o personal.</p>
               </div>

               {error && (
                  <div className="uv-login-alert" role="alert">
                     {error}
                  </div>
               )}

               <form className="uv-login-form" onSubmit={onSubmit}>
                  <label className="uv-field">
                     <span>Correo electrónico</span>
                     <div className="uv-input-wrap">
                        <FiMail className="uv-input-icon" />
                        <input
                           type="email"
                           name="correo"
                           placeholder="ejemplo@correo.com"
                           value={form.correo}
                           onChange={onChange}
                           autoComplete="email"
                           required
                        />
                     </div>
                  </label>

                  <label className="uv-field">
                     <span>Contraseña</span>
                     <div className="uv-input-wrap">
                        <FiLock className="uv-input-icon" />
                        <input
                           type="password"
                           name="contrasena"
                           placeholder="Tu contraseña"
                           value={form.contrasena}
                           onChange={onChange}
                           autoComplete="current-password"
                           required
                        />
                     </div>
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

                  <button className="uv-primary-btn" type="submit" disabled={!canSubmit || loading}>
                     {loading ? "Ingresando..." : "Ingresar"}
                  </button>

                  <button
                     type="button"
                     className="uv-secondary-btn"
                     onClick={() => alert("Inicio de sesión con Google pendiente")}
                  >
                     <span className="uv-google-dot" aria-hidden="true">
                        G
                     </span>
                     Continuar con Google
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
