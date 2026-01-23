import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { FiEdit3, FiSave, FiXCircle } from "react-icons/fi";

import { useAuth } from "../../auth/useAuth";
import { usersApi } from "../../api/users.api";
import { pollsApi } from "../../api/polls.api";

import "./profile.css";

export default function Profile() {
   const { usuario, logout } = useAuth();

   const [profile, setProfile] = useState(usuario);
   const [polls, setPolls] = useState([]);

   const [loading, setLoading] = useState(true);
   const [pollsLoading, setPollsLoading] = useState(true);

   const [editMode, setEditMode] = useState(false);
   const [nombreUsuario, setNombreUsuario] = useState(usuario?.nombreUsuario ?? "");

   const [error, setError] = useState("");
   const [okMsg, setOkMsg] = useState("");

   const userId = profile?.id;

   const estadoLabel = (p) => {
      // Ajusta según tu modelo: cerrado/activo/fechaCierre etc.
      if (p?.cerrada === true) return "Cerrada";
      if (p?.estado) return p.estado; // si viene string
      return "Activa";
   };

   useEffect(() => {
      const run = async () => {
         setLoading(true);
         setError("");
         setOkMsg("");

         try {
            // Refrescar datos del usuario desde backend (opcional, pero pro)
            if (usuario?.nombreUsuario) {
               const res = await usersApi.getByNombreUsuario(usuario.nombreUsuario);
               setProfile(res?.data ?? usuario);
               setNombreUsuario((res?.data?.nombreUsuario ?? usuario.nombreUsuario) || "");
            } else {
               setProfile(usuario);
            }
         } catch (e) {
            // si falla, usamos lo del contexto
            setProfile(usuario);
         } finally {
            setLoading(false);
         }
      };

      run();
   }, [usuario]);

   useEffect(() => {
      const run = async () => {
         if (!userId) return;
         setPollsLoading(true);

         try {
            const res = await pollsApi.listByCreadorId(userId);
            setPolls(res?.data ?? []);
         } catch (e) {
            // Si el endpoint aún no existe, no rompemos UI
            setPolls([]);
         } finally {
            setPollsLoading(false);
         }
      };

      run();
   }, [userId]);

   const canSave = useMemo(() => {
      return nombreUsuario.trim().length >= 3 && nombreUsuario.trim().length <= 100;
   }, [nombreUsuario]);

   const onSave = async () => {
      setError("");
      setOkMsg("");

      try {
         // Actualizar en backend (requiere endpoint PUT)
         await usersApi.updateNombreUsuario(userId, { nombreUsuario: nombreUsuario.trim() });

         setProfile((prev) => ({ ...prev, nombreUsuario: nombreUsuario.trim() }));
         setEditMode(false);
         setOkMsg("Nombre de usuario actualizado.");
      } catch (err) {
         const msg =
            err?.response?.data?.message ||
            err?.response?.data?.error ||
            err?.message ||
            "No se pudo actualizar el nombre de usuario.";
         setError(msg);
      }
   };

   if (loading) {
      return (
         <div className="container" style={{ padding: 24 }}>
            Cargando perfil...
         </div>
      );
   }

   return (
      <div className="container uv-profile">
         <motion.div
            className="uv-profile-card"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25 }}
         >
            <div className="uv-profile-header">
               <div>
                  <h1>Mi perfil</h1>
                  <p>Consulta tu información y tus encuestas creadas.</p>
               </div>

               <button className="uv-profile-logout" onClick={logout}>
                  Cerrar sesión
               </button>
            </div>

            {error && <div className="uv-profile-alert">{error}</div>}
            {okMsg && <div className="uv-profile-alert">{okMsg}</div>}

            <div className="uv-profile-grid">
               {/* Info */}
               <section className="uv-profile-box">
                  <h2>Información</h2>

                  <div className="uv-profile-row">
                     <span className="uv-k">ID</span>
                     <span className="uv-v">{profile?.id ?? "-"}</span>
                  </div>

                  <div className="uv-profile-row">
                     <span className="uv-k">Correo</span>
                     <span className="uv-v">{profile?.correo ?? "-"}</span>
                  </div>

                  <div className="uv-profile-row uv-profile-row-edit">
                     <span className="uv-k">Nombre de usuario</span>

                     {!editMode ? (
                        <span className="uv-v uv-inline">
                           {profile?.nombreUsuario ?? "-"}
                           <button
                              className="uv-inline-btn"
                              onClick={() => {
                                 setEditMode(true);
                                 setOkMsg("");
                                 setError("");
                              }}
                              title="Editar"
                           >
                              <FiEdit3 />
                           </button>
                        </span>
                     ) : (
                        <div className="uv-edit">
                           <input
                              value={nombreUsuario}
                              onChange={(e) => setNombreUsuario(e.target.value)}
                              className="uv-edit-input"
                              placeholder="Nuevo nombre de usuario"
                           />

                           <button className="uv-edit-btn" disabled={!canSave} onClick={onSave}>
                              <FiSave /> Guardar
                           </button>

                           <button
                              className="uv-edit-btn uv-edit-cancel"
                              onClick={() => {
                                 setEditMode(false);
                                 setNombreUsuario(profile?.nombreUsuario ?? "");
                              }}
                           >
                              <FiXCircle /> Cancelar
                           </button>
                        </div>
                     )}
                  </div>
               </section>

               {/* Encuestas */}
               <section className="uv-profile-box">
                  <h2>Mis encuestas</h2>

                  {pollsLoading ? (
                     <p className="uv-muted">Cargando encuestas...</p>
                  ) : polls.length === 0 ? (
                     <p className="uv-muted">Aún no has creado encuestas.</p>
                  ) : (
                     <div className="uv-polls-list">
                        {polls.map((p) => (
                           <div key={p.id} className="uv-poll-item">
                              <div className="uv-poll-title">{p.titulo ?? `Encuesta #${p.id}`}</div>
                              <div className="uv-poll-meta">
                                 <span className="uv-pill">{estadoLabel(p)}</span>
                                 <span className="uv-muted">ID: {p.id}</span>
                              </div>
                           </div>
                        ))}
                     </div>
                  )}
               </section>
            </div>
         </motion.div>
      </div>
   );
}
