import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { authApi } from "../api/auth.api";

function Login() {
   const navigate = useNavigate();

   const [form, setForm] = useState({
      correo: "",
      contrasena: "",
   });

   const [loading, setLoading] = useState(false);
   const [error, setError] = useState("");

   const onChange = (e) => {
      setForm((prev) => ({
         ...prev,
         [e.target.name]: e.target.value,
      }));
   };

   const onSubmit = async (e) => {
      e.preventDefault();
      setError("");

      if (!form.correo.trim() || !form.contrasena.trim()) {
         setError("Completa correo y contraseña.");
         return;
      }

      try {
         setLoading(true);

         // ✅ Payload EXACTO que tu backend espera
         const res = await authApi.login({
            correo: form.correo.trim(),
            contrasena: form.contrasena,
         });

         const token = res?.data?.token;
         const usuario = res?.data?.usuario;

         if (!token) {
            setError("No se recibió token del servidor.");
            return;
         }

         // Guarda token y usuario (opcional, pero útil)
         localStorage.setItem("token", token);
         if (usuario) localStorage.setItem("usuario", JSON.stringify(usuario));

         navigate("/polls", { replace: true });
      } catch (err) {
         const status = err?.response?.status;

         // Mensaje del backend si existe (si no, algo amigable)
         const backendMsg =
            err?.response?.data?.message ||
            err?.response?.data?.error ||
            err?.response?.data ||
            "";

         const msg =
            (typeof backendMsg === "string" && backendMsg.trim()) ||
            (status === 401
               ? "Credenciales inválidas."
               : status === 400
                  ? "Petición inválida (revisa los campos correo/contrasena)."
                  : "Error al iniciar sesión. Revisa el backend o la conexión.");

         setError(msg);
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

         <form onSubmit={onSubmit} style={{ display: "grid", gap: 10 }}>
            <label style={{ display: "grid", gap: 6 }}>
               Correo
               <input
                  type="email"
                  name="correo"
                  value={form.correo}
                  onChange={onChange}
                  placeholder="ale@example.com"
                  autoComplete="username"
               />
            </label>

            <label style={{ display: "grid", gap: 6 }}>
               Contraseña
               <input
                  type="password"
                  name="contrasena"
                  value={form.contrasena}
                  onChange={onChange}
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
