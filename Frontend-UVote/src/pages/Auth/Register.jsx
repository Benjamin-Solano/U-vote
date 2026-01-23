import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { FiMail, FiLock, FiUser, FiCheckCircle } from "react-icons/fi";
import { useNavigate } from "react-router-dom";

import "./login.css";
import logo from "../../assets/U-VoteLogo.png";

// Ajusta esta importación a tu archivo real
import { authApi } from "../../api/auth.api";
import { useAuth } from "../../auth/useAuth";

export default function Register() {
   const { isAuthenticated } = useAuth();
   const navigate = useNavigate();

   const [form, setForm] = useState({
      nombre: "",
      correo: "",
      contrasena: "",
      confirmarContrasena: "",
   });

   const [loading, setLoading] = useState(false);
   const [error, setError] = useState("");
   const [okMsg, setOkMsg] = useState("");

   useEffect(() => {
      if (isAuthenticated) {
         navigate("/", { replace: true });
      }
   }, [isAuthenticated, navigate]);

   const passwordsMatch = useMemo(() => {
      return form.contrasena.length > 0 && form.contrasena === form.confirmarContrasena;
   }, [form.contrasena, form.confirmarContrasena]);

   const canSubmit = useMemo(() => {
      return (
         form.nombre.trim().length >= 2 &&
         form.correo.trim().length > 0 &&
         form.contrasena.trim().length >= 8 &&
         passwordsMatch
      );
   }, [form.nombre, form.correo, form.contrasena, passwordsMatch]);

   const onChange = (e) => {
      const { name, value } = e.target;
      setForm((prev) => ({ ...prev, [name]: value }));
      setError("");
      setOkMsg("");
   };

   const onSubmit = async (e) => {
      e.preventDefault();
      if (!canSubmit || loading) return;

      setLoading(true);
      setError("");
      setOkMsg("");

      try {
         // ✅ Ajusta el payload a lo que tu backend espera
         // (te lo dejo con nombres comunes; si tu backend usa otros, lo adaptamos)
         await authApi.register({
            nombreUsuario: form.nombre,
            correo: form.correo,
            contrasena: form.contrasena,
         });



         setOkMsg("Cuenta creada con éxito. Ahora puedes iniciar sesión.");
         // Redirigir luego de un pequeño instante (sin tool async extra)
         setTimeout(() => navigate("/login", { replace: true }), 700);
      } catch (err) {
         const msg =
            err?.response?.data?.message ||
            err?.message ||
            "No se pudo crear la cuenta. Verifica los datos e inténtalo de nuevo.";
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
                  <motion.img
                     className="uv-login-logo"
                     src={logo}
                     alt="U-Vote"
                     initial={{ y: 0, scale: 1 }}
                     animate={{ y: [0, -6, 0], scale: [1, 1.012, 1] }}
                     transition={{ duration: 4.2, repeat: Infinity, ease: "easeInOut" }}
                     draggable={false}
                  />
                  <p className="uv-login-left-sub">Registrate y haz que tu voto cuente.</p>

               </div>
            </div>

            {/* Panel derecho */}
            <div className="uv-login-right">
               <div className="uv-login-header">
                  <h1>Crear cuenta</h1>
                  <p>Completa los datos para registrarte en U-Vote.</p>
               </div>

               {error && (
                  <div className="uv-login-alert" role="alert">
                     {error}
                  </div>
               )}

               {okMsg && (
                  <div className="uv-login-alert" role="status">
                     <FiCheckCircle style={{ marginRight: 8 }} />
                     {okMsg}
                  </div>
               )}

               <form className="uv-login-form" onSubmit={onSubmit}>
                  <label className="uv-field">
                     <span>Nombre</span>
                     <div className="uv-input-wrap">
                        <FiUser className="uv-input-icon" />
                        <input
                           type="text"
                           name="nombre"
                           placeholder="Tu nombre"
                           value={form.nombre}
                           onChange={onChange}
                           autoComplete="name"
                           required
                        />
                     </div>
                  </label>

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
                           placeholder="Mínimo 8 caracteres"
                           value={form.contrasena}
                           onChange={onChange}
                           autoComplete="new-password"
                           required
                        />
                     </div>
                  </label>

                  <label className="uv-field">
                     <span>Confirmar contraseña</span>
                     <div className="uv-input-wrap">
                        <FiLock className="uv-input-icon" />
                        <input
                           type="password"
                           name="confirmarContrasena"
                           placeholder="Repite la contraseña"
                           value={form.confirmarContrasena}
                           onChange={onChange}
                           autoComplete="new-password"
                           required
                        />
                     </div>
                  </label>

                  {/* Feedback sutil de coincidencia */}
                  {!passwordsMatch && form.confirmarContrasena.length > 0 && (
                     <div className="uv-login-alert" role="alert">
                        Las contraseñas no coinciden.
                     </div>
                  )}

                  <button className="uv-primary-btn" type="submit" disabled={!canSubmit || loading}>
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
