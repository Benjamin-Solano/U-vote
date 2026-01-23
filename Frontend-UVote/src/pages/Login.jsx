import { useState } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { useAuth } from "../auth/useAuth";
import "../styles/login.css";

function Login() {
   const { login } = useAuth();
   const navigate = useNavigate();
   const location = useLocation();

   // Si venía de una ruta protegida, vuelve ahí; si no, /polls
   const from = location.state?.from?.pathname || "/polls";

   const [correo, setCorreo] = useState("");
   const [contrasena, setContrasena] = useState("");
   const [error, setError] = useState("");
   const [loading, setLoading] = useState(false);

   const onSubmit = async (e) => {
      e.preventDefault();
      setError("");

      if (!correo.trim() || !contrasena.trim()) {
         setError("Completa correo y contraseña.");
         return;
      }

      try {
         setLoading(true);
         await login(correo.trim(), contrasena);
         navigate(from, { replace: true });
      } catch (_) {
         setError("Correo o contraseña inválidos.");
      } finally {
         setLoading(false);
      }
   };

   return (
      <div className="uv-auth-page">
         <div className="uv-auth-card">
            {/* Header */}
            <header className="uv-auth-header">
               <h1 className="uv-auth-title">Login U-Vote</h1>
               <p className="uv-auth-subtitle">
                  Accede para votar y administrar
               </p>
            </header>

            {/* Body */}
            <div className="uv-auth-body">
               {error && (
                  <div className="uv-alert uv-alert-error">
                     {error}
                  </div>
               )}

               <form onSubmit={onSubmit} className="uv-form">
                  <div className="uv-field">
                     <label className="uv-label">Correo Electrónico</label>
                     <div className="uv-input-wrap">
                        <span className="uv-icon uv-icon-mail" aria-hidden="true" />
                        <input
                           className="uv-input"
                           type="email"
                           value={correo}
                           onChange={(e) => setCorreo(e.target.value)}
                           placeholder="tu@email.com"
                           autoComplete="username"
                        />
                     </div>
                  </div>


                  <div className="uv-field">
                     <label className="uv-label">Contraseña</label>
                     <div className="uv-input-wrap">
                        <span className="uv-icon uv-icon-lock" aria-hidden="true" />
                        <input
                           className="uv-input"
                           type="password"
                           value={contrasena}
                           onChange={(e) => setContrasena(e.target.value)}
                           placeholder="••••••••"
                           autoComplete="current-password"
                        />
                     </div>
                  </div>

                  <button
                     type="submit"
                     className="uv-btn"
                     disabled={loading}
                  >
                     {loading ? "Ingresando..." : "Entrar"}
                  </button>
               </form>

               <div className="uv-auth-footer">
                  ¿No tienes cuenta?{" "}
                  <Link to="/register">Regístrate</Link>
               </div>
            </div>
         </div>
      </div>
   );
}

export default Login;
