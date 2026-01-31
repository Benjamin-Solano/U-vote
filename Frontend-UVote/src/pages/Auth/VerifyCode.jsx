import { useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import { FiMail, FiRefreshCw, FiShield, FiCheckCircle, FiArrowLeft } from "react-icons/fi";
import { useLocation, useNavigate } from "react-router-dom";

import "./login.css";
import logo from "../../assets/U-VoteLogo.png";

import { authApi } from "../../api/auth.api";

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/i;

const getQuery = (search) => new URLSearchParams(search);

const normalizeEmail = (s) => (s || "").trim().toLowerCase();

const onlyDigits = (s) => (s || "").replace(/\D/g, "");

const getApiMessage = (err) =>
   err?.response?.data?.message || err?.response?.data?.error || err?.message || "Ocurrió un error";

const getVerifyErrorMessage = (err) => {
   const status = err?.response?.status;
   const msg = getApiMessage(err);

   if (!err?.response) return "No se pudo conectar con el servidor. Intenta de nuevo.";
   if (status === 400) return msg || "Código inválido. Revisa e inténtalo de nuevo.";
   if (status === 403) return msg || "Demasiados intentos. Solicita un nuevo código.";
   if (status === 404) return msg || "El correo no existe.";
   return msg || "No se pudo verificar el código.";
};

const getResendErrorMessage = (err) => {
   const status = err?.response?.status;
   const msg = getApiMessage(err);

   if (!err?.response) return "No se pudo conectar con el servidor. Intenta de nuevo.";
   if (status === 400) return msg || "No se pudo reenviar el código. Revisa el correo.";
   if (status === 404) return msg || "El correo no existe.";
   return msg || "No se pudo reenviar el código.";
};

export default function VerifyCode() {
   const location = useLocation();
   const navigate = useNavigate();

   const q = useMemo(() => getQuery(location.search), [location.search]);
   const correoInicial = useMemo(() => normalizeEmail(q.get("correo") || ""), [q]);

   const [correo, setCorreo] = useState(correoInicial);
   const [digits, setDigits] = useState(["", "", "", "", "", ""]);

   const [touchedEmail, setTouchedEmail] = useState(false);
   const [loadingVerify, setLoadingVerify] = useState(false);
   const [loadingResend, setLoadingResend] = useState(false);

   const [error, setError] = useState("");
   const [okMsg, setOkMsg] = useState("");
   const [verified, setVerified] = useState(false);

   // Cooldown para reenviar
   const RESEND_SECONDS = 60; // debe coincidir con app.otp.resend-seconds (frontend UX)
   const [cooldown, setCooldown] = useState(RESEND_SECONDS);

   const inputsRef = useRef([]);

   // Arranque: foco en primer input
   useEffect(() => {
      const t = setTimeout(() => inputsRef.current?.[0]?.focus?.(), 150);
      return () => clearTimeout(t);
   }, []);

   // Iniciar contador (se asume que al llegar aquí ya se envió un OTP, o el user puede reenviar)
   useEffect(() => {
      // si no hay cooldown, no corre
      if (cooldown <= 0) return;

      const id = setInterval(() => {
         setCooldown((s) => (s > 0 ? s - 1 : 0));
      }, 1000);

      return () => clearInterval(id);
   }, [cooldown]);

   // Si te llega correo por query y cambia, sincroniza
   useEffect(() => {
      setCorreo(correoInicial);
   }, [correoInicial]);

   const correoNorm = useMemo(() => normalizeEmail(correo), [correo]);

   const emailError = useMemo(() => {
      if (!correoNorm) return "El correo es requerido.";
      if (!emailRegex.test(correoNorm)) return "Formato de correo inválido.";
      return "";
   }, [correoNorm]);

   const code = useMemo(() => digits.join(""), [digits]);
   const codeComplete = useMemo(() => code.length === 6 && /^\d{6}$/.test(code), [code]);

   const canVerify = useMemo(() => {
      return !emailError && codeComplete && !loadingVerify && !loadingResend && !verified;
   }, [emailError, codeComplete, loadingVerify, loadingResend, verified]);

   const canResend = useMemo(() => {
      return !emailError && cooldown === 0 && !loadingResend && !loadingVerify && !verified;
   }, [emailError, cooldown, loadingResend, loadingVerify, verified]);

   const setDigitAt = (i, v) => {
      setDigits((prev) => {
         const next = [...prev];
         next[i] = v;
         return next;
      });
   };

   const clearMessages = () => {
      setError("");
      setOkMsg("");
   };

   const onEmailChange = (e) => {
      setCorreo(e.target.value);
      setTouchedEmail(true);
      clearMessages();
   };

   const onDigitChange = (i, raw) => {
      clearMessages();

      const v = onlyDigits(raw);

      // Si pega / escribe más de 1 dígito, distribuimos
      if (v.length > 1) {
         const arr = v.slice(0, 6).split("");
         setDigits((prev) => {
            const next = [...prev];
            for (let k = 0; k < 6; k++) next[k] = arr[k] || "";
            return next;
         });
         const lastIndex = Math.min(v.length, 6) - 1;
         inputsRef.current?.[lastIndex]?.focus?.();
         return;
      }

      setDigitAt(i, v);

      // Avanza foco si escribió un dígito
      if (v && i < 5) inputsRef.current?.[i + 1]?.focus?.();
   };

   const onDigitKeyDown = (i, e) => {
      if (e.key === "Backspace") {
         // Si el campo está vacío, vuelve al anterior
         if (!digits[i] && i > 0) {
            inputsRef.current?.[i - 1]?.focus?.();
            setDigitAt(i - 1, "");
            e.preventDefault();
            return;
         }
         // Si hay algo, permite borrar normal, pero limpiamos el valor
         setDigitAt(i, "");
         return;
      }

      if (e.key === "ArrowLeft" && i > 0) {
         inputsRef.current?.[i - 1]?.focus?.();
      }

      if (e.key === "ArrowRight" && i < 5) {
         inputsRef.current?.[i + 1]?.focus?.();
      }
   };

   const onPaste = (e) => {
      const text = e.clipboardData.getData("text");
      const v = onlyDigits(text).slice(0, 6);
      if (!v) return;

      e.preventDefault();
      const arr = v.split("");
      setDigits((prev) => {
         const next = [...prev];
         for (let k = 0; k < 6; k++) next[k] = arr[k] || "";
         return next;
      });

      const lastIndex = Math.min(v.length, 6) - 1;
      inputsRef.current?.[lastIndex]?.focus?.();
   };

   const resetCode = () => {
      setDigits(["", "", "", "", "", ""]);
      setTimeout(() => inputsRef.current?.[0]?.focus?.(), 50);
   };

   const handleVerify = async (e) => {
      e?.preventDefault?.();

      setTouchedEmail(true);
      clearMessages();

      if (emailError) {
         setError(emailError);
         return;
      }

      if (!codeComplete) {
         setError("Ingresa el código de 6 dígitos.");
         return;
      }

      setLoadingVerify(true);
      try {
         await authApi.verifyCode({ correo: correoNorm, codigo: code });
         setVerified(true);
         setOkMsg("Correo verificado correctamente. Ya puedes iniciar sesión.");
         // Limpia código por UX
         resetCode();
         // Redirige a login con correo prellenado (si quieres)
         setTimeout(() => {
            navigate(`/login?correo=${encodeURIComponent(correoNorm)}`, { replace: true });
         }, 1100);
      } catch (err) {
         setError(getVerifyErrorMessage(err));
      } finally {
         setLoadingVerify(false);
      }
   };

   const handleResend = async () => {
      setTouchedEmail(true);
      clearMessages();

      if (emailError) {
         setError(emailError);
         return;
      }

      setLoadingResend(true);
      try {
         await authApi.resendCode({ correo: correoNorm });
         setOkMsg("Si el correo está registrado, enviamos un nuevo código.");
         setCooldown(RESEND_SECONDS);
         resetCode();
      } catch (err) {
         setError(getResendErrorMessage(err));
      } finally {
         setLoadingResend(false);
      }
   };

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
                     whileHover={{ scale: 1.03, rotate: -0.4 }}
                     whileTap={{ scale: 0.995 }}
                     draggable={false}
                  />
                  <p className="uv-login-left-sub">Verifica tu correo para activar tu cuenta.</p>
               </div>
            </div>

            {/* Panel derecho */}
            <div className="uv-login-right">
               <div className="uv-login-header">
                  <h1>Verificar correo</h1>
                  <p>Ingresa el código de 6 dígitos que enviamos a tu correo.</p>
               </div>

               {/* Mensajes */}
               {error && (
                  <div className="uv-login-alert" role="alert" aria-live="polite">
                     {error}
                  </div>
               )}

               {okMsg && (
                  <div className="uv-login-alert uv-login-alert--ok" role="status" aria-live="polite">
                     <FiCheckCircle style={{ marginRight: 8 }} />
                     {okMsg}
                  </div>
               )}

               <form className="uv-login-form" onSubmit={handleVerify}>
                  {/* Email */}
                  <label className="uv-field">
                     <span>Correo</span>
                     <div
                        className={`uv-input-wrap ${touchedEmail && emailError ? "uv-input-error" : ""
                           }`}
                     >
                        <FiMail className="uv-input-icon" />
                        <input
                           type="email"
                           name="correo"
                           placeholder="ejemplo@correo.com"
                           value={correo}
                           onChange={onEmailChange}
                           onBlur={() => setTouchedEmail(true)}
                           autoComplete="email"
                           required
                        />
                     </div>
                     {touchedEmail && emailError && (
                        <small className="uv-field-error">{emailError}</small>
                     )}
                  </label>

                  {/* Código OTP */}
                  <div className="uv-otp-block">
                     <div className="uv-otp-head">
                        <span className="uv-otp-label">
                           <FiShield /> Código de verificación
                        </span>

                        <span className="uv-otp-hint">
                           Expira en ~15 minutos • Revisa spam si no lo ves
                        </span>
                     </div>

                     <div className="uv-otp-inputs" onPaste={onPaste}>
                        {digits.map((d, i) => (
                           <input
                              key={i}
                              ref={(el) => (inputsRef.current[i] = el)}
                              className={`uv-otp-input ${d ? "uv-otp-filled" : ""
                                 }`}
                              inputMode="numeric"
                              pattern="\d*"
                              maxLength={1}
                              value={d}
                              onChange={(e) => onDigitChange(i, e.target.value)}
                              onKeyDown={(e) => onDigitKeyDown(i, e)}
                              aria-label={`Dígito ${i + 1}`}
                           />
                        ))}
                     </div>

                     <div className="uv-otp-actions">
                        <button
                           type="button"
                           className="uv-link-btn"
                           onClick={resetCode}
                           disabled={loadingVerify || loadingResend || verified}
                        >
                           Limpiar código
                        </button>

                        <div className="uv-otp-timer" aria-live="polite">
                           {cooldown > 0 ? (
                              <span>Reenviar en {cooldown}s</span>
                           ) : (
                              <span>Puedes reenviar el código</span>
                           )}
                        </div>
                     </div>
                  </div>

                  {/* Botones */}
                  <button className="uv-primary-btn" type="submit" disabled={!canVerify}>
                     {loadingVerify ? "Verificando..." : "Verificar"}
                  </button>

                  <button
                     type="button"
                     className="uv-secondary-btn"
                     onClick={handleResend}
                     disabled={!canResend}
                     title={cooldown > 0 ? "Espera a que finalice el contador" : "Reenviar código"}
                  >
                     <FiRefreshCw />
                     {loadingResend ? "Reenviando..." : "Reenviar código"}
                  </button>

                  <div className="uv-verify-footer">
                     <button type="button" className="uv-link-btn" onClick={() => navigate("/register")}>
                        <FiArrowLeft />
                        Volver al registro
                     </button>

                     <button type="button" className="uv-link-btn" onClick={() => navigate("/login")}>
                        Ya tengo cuenta
                     </button>
                  </div>
               </form>
            </div>
         </motion.section>
      </div>
   );
}
