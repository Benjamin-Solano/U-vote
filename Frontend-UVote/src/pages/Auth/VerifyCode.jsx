import { useEffect, useMemo, useState } from "react";
import { FiCheckCircle, FiMail, FiRefreshCw, FiShield } from "react-icons/fi";
import { useLocation, useNavigate } from "react-router-dom";

import AuthCard from "./AuthCard";
import "./login.css";

import logo from "../../assets/U-VoteLogo.png";
import { authApi } from "../../api/auth.api";
import { useAuth } from "../../auth/useAuth";

const getErrMsg = (err) => {
   const status = err?.response?.status;
   const msg = err?.response?.data?.message || err?.message || "";

   if (status === 400) return msg || "Código inválido. Revisa e inténtalo de nuevo.";
   if (status === 403) return msg || "Acción no permitida. Solicita un nuevo código.";
   if (!err?.response) return "No se pudo conectar con el servidor. Intenta de nuevo.";
   return msg || "Ocurrió un error. Intenta de nuevo.";
};

function useQuery() {
   const { search } = useLocation();
   return useMemo(() => new URLSearchParams(search), [search]);
}

export default function VerifyCode() {
   const navigate = useNavigate();
   const query = useQuery();
   const { isAuthenticated } = useAuth();

   const [correo, setCorreo] = useState(query.get("correo") || "");
   const [codigo, setCodigo] = useState("");

   const [loading, setLoading] = useState(false);
   const [checking, setChecking] = useState(false);

   const [error, setError] = useState("");
   const [okMsg, setOkMsg] = useState("");

   const [cooldown, setCooldown] = useState(0);

   useEffect(() => {
      if (isAuthenticated) navigate("/", { replace: true });
   }, [isAuthenticated, navigate]);

   const canVerify = useMemo(() => {
      return /^[0-9]{6}$/.test(codigo) && correo.trim().length > 0;
   }, [codigo, correo]);

   // Tick del cooldown
   useEffect(() => {
      if (cooldown <= 0) return;
      const t = setInterval(() => setCooldown((c) => Math.max(0, c - 1)), 1000);
      return () => clearInterval(t);
   }, [cooldown]);

   // Consultar status (cooldown inicial) cuando el correo cambia
   useEffect(() => {
      let mounted = true;

      const run = async () => {
         const c = correo.trim();
         if (!c) return;

         try {
            setChecking(true);
            const { data } = await authApi.status(c);
            if (!mounted) return;

            if (data?.nextStep === "VERIFY") {
               setCooldown(Number(data?.resendAvailableIn || 0));
            } else {
               setCooldown(0);
            }
         } catch {
            // no es crítico
            if (mounted) setCooldown(0);
         } finally {
            if (mounted) setChecking(false);
         }
      };

      run();
      return () => {
         mounted = false;
      };
   }, [correo]);

   const onVerify = async (e) => {
      e.preventDefault();
      if (!canVerify || loading) return;

      setLoading(true);
      setError("");
      setOkMsg("");

      try {
         await authApi.verifyCode({ correo: correo.trim(), codigo });
         setOkMsg("Correo verificado con éxito. Ya puedes iniciar sesión.");
         setTimeout(() => navigate("/login", { replace: true }), 700);
      } catch (err) {
         setError(getErrMsg(err));
      } finally {
         setLoading(false);
      }
   };

   const onResend = async () => {
      const c = correo.trim();
      if (!c || loading || cooldown > 0) return;

      setLoading(true);
      setError("");
      setOkMsg("");

      try {
         await authApi.resendCode({ correo: c });
         setOkMsg("Si el correo está registrado, te enviamos un nuevo código.");
         setCooldown(60);
      } catch (err) {
         setError(getErrMsg(err));
      } finally {
         setLoading(false);
      }
   };

   return (
      <AuthCard
         logo={logo}
         leftSubtitle="Confirma tu correo para activar tu cuenta."
         title="Verificar correo"
         subtitle="Ingresa el código de 6 dígitos que enviamos a tu correo."
      >
         {error && (
            <div className="uv-login-alert" role="alert" aria-live="polite">
               {error}
            </div>
         )}

         {okMsg && (
            <div className="uv-login-alert uv-login-alert--ok" role="status" aria-live="polite">
               <FiCheckCircle className="uv-login-alert-icon" aria-hidden="true" />
               {okMsg}
            </div>
         )}

         <form className="uv-login-form" onSubmit={onVerify}>
            <label className="uv-field">
               <span>Correo</span>
               <div className="uv-input-wrap">
                  <FiMail className="uv-input-icon" />
                  <input
                     type="email"
                     value={correo}
                     onChange={(e) => {
                        setCorreo(e.target.value);
                        setError("");
                        setOkMsg("");
                     }}
                     placeholder="ejemplo@correo.com"
                     autoComplete="email"
                     required
                  />
               </div>
            </label>

            <div className="uv-otp-block">
               <div className="uv-otp-head">
                  <span className="uv-otp-title">
                     <FiShield className="uv-otp-ico" aria-hidden="true" />
                     Código (6 dígitos)
                  </span>

                  <button
                     type="button"
                     className="uv-link-btn"
                     onClick={onResend}
                     disabled={loading || cooldown > 0 || !correo.trim()}
                     title={cooldown > 0 ? `Disponible en ${cooldown}s` : "Reenviar código"}
                  >
                     <FiRefreshCw style={{ marginRight: 6 }} />
                     {cooldown > 0 ? `Reenviar (${cooldown}s)` : "Reenviar"}
                  </button>
               </div>

               <input
                  className="uv-otp-input"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  maxLength={6}
                  value={codigo}
                  onChange={(e) => {
                     const v = e.target.value.replace(/\D/g, "").slice(0, 6);
                     setCodigo(v);
                     setError("");
                     setOkMsg("");
                  }}
                  placeholder="000000"
                  aria-label="Código de verificación"
                  required
               />

               <p className="uv-login-left-sub2">
                  {checking ? "Verificando estado..." : "Revisa spam si no ves el correo. Puedes reenviar en 1 min."}
               </p>
            </div>

            <button className="uv-primary-btn" type="submit" disabled={!canVerify || loading}>
               {loading ? "Verificando..." : "Verificar"}
            </button>

            <div className="uv-login-footer">
               <span>¿Volver?</span>
               <button type="button" className="uv-link-as-btn" onClick={() => navigate("/login")}>
                  Iniciar sesión
               </button>
            </div>
         </form>
      </AuthCard>
   );
}
