import { useState } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { useAuth } from "../auth/useAuth";

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
      <div style={{ maxWidth: 420, margin: "40px auto", padding: 16 }}>
         <h1>Iniciar sesión</h1>

         {error && (
            <div
               style={{
                  background: "#ffe5e5",
                  border: "1px solid #ffb3b3",
                  padding: 10,
                  borderRadius: 8,
                  marginBottom: 12,
               }}
            >
               {error}
            </div>
         )}

         <form onSubmit={onSubmit} style={{ display: "grid", gap: 12 }}>
            <label style={{ display: "grid", gap: 6 }}>
               Correo
               <input
                  type="email"
                  value={correo}
                  onChange={(e) => setCorreo(e.target.value)}
                  placeholder="ale@example.com"
                  autoComplete="username"
               />
            </label>

            <label style={{ display: "grid", gap: 6 }}>
               Contraseña
               <input
                  type="password"
                  value={contrasena}
                  onChange={(e) => setContrasena(e.target.value)}
                  placeholder="••••••••"
                  autoComplete="current-password"
               />
            </label>

            <button type="submit" disabled={loading}>
               {loading ? "Ingresando..." : "Entrar"}
            </button>
         </form>

         <p style={{ marginTop: 12 }}>
            ¿No tienes cuenta? <Link to="/register">Regístrate</Link>
         </p>
      </div>
   );
}

export default Login;
