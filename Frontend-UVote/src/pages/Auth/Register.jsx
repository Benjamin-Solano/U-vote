import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { usersApi } from "../../api/users.api";

function Register() {
   const navigate = useNavigate();

   const [form, setForm] = useState({
      nombreUsuario: "",
      correo: "",
      contrasena: "",
      confirmar: "",
   });

   const [loading, setLoading] = useState(false);
   const [error, setError] = useState("");
   const [ok, setOk] = useState("");

   const onChange = (e) => {
      setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
   };

   const onSubmit = async (e) => {
      e.preventDefault();
      setError("");
      setOk("");

      const nombreUsuario = form.nombreUsuario.trim();
      const correo = form.correo.trim();
      const contrasena = form.contrasena;

      if (!nombreUsuario || !correo || !contrasena) {
         setError("Completa nombre de usuario, correo y contraseña.");
         return;
      }

      if (contrasena.length < 6) {
         setError("La contraseña debe tener al menos 6 caracteres.");
         return;
      }

      if (form.confirmar !== contrasena) {
         setError("Las contraseñas no coinciden.");
         return;
      }

      try {
         setLoading(true);

         await usersApi.create({
            nombreUsuario,
            correo,
            contrasena,
         });

         setOk("Registro exitoso. Ahora puedes iniciar sesión.");
         // redirige al login luego de un instante (o directo)
         setTimeout(() => navigate("/login", { replace: true }), 600);
      } catch (err) {
         const status = err?.response?.status;

         const backendMsg =
            err?.response?.data?.message ||
            err?.response?.data?.error ||
            err?.response?.data ||
            "";

         const msg =
            (typeof backendMsg === "string" && backendMsg.trim()) ||
            (status === 409
               ? "Ya existe un usuario con ese correo."
               : status === 400
                  ? "Datos inválidos. Revisa los campos."
                  : "Error registrando usuario. Revisa el backend o la conexión.");

         setError(msg);
      } finally {
         setLoading(false);
      }
   };

   return (
      <div style={{ maxWidth: 480, margin: "40px auto", padding: 16 }}>
         <h1>Registro</h1>

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

         {ok && (
            <div
               style={{
                  background: "#e8fff0",
                  border: "1px solid #b7f0c6",
                  padding: 10,
                  borderRadius: 8,
                  marginBottom: 12,
               }}
            >
               {ok}
            </div>
         )}

         <form onSubmit={onSubmit} style={{ display: "grid", gap: 10 }}>
            <label style={{ display: "grid", gap: 6 }}>
               Nombre de usuario
               <input
                  name="nombreUsuario"
                  value={form.nombreUsuario}
                  onChange={onChange}
                  placeholder="ale"
                  autoComplete="nickname"
               />
            </label>

            <label style={{ display: "grid", gap: 6 }}>
               Correo
               <input
                  type="email"
                  name="correo"
                  value={form.correo}
                  onChange={onChange}
                  placeholder="ale@example.com"
                  autoComplete="email"
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
                  autoComplete="new-password"
               />
            </label>

            <label style={{ display: "grid", gap: 6 }}>
               Confirmar contraseña
               <input
                  type="password"
                  name="confirmar"
                  value={form.confirmar}
                  onChange={onChange}
                  placeholder="••••••••"
                  autoComplete="new-password"
               />
            </label>

            <button type="submit" disabled={loading}>
               {loading ? "Registrando..." : "Crear cuenta"}
            </button>
         </form>

         <p style={{ marginTop: 12 }}>
            ¿Ya tienes cuenta? <Link to="/login">Inicia sesión</Link>
         </p>
      </div>
   );
}

export default Register;
