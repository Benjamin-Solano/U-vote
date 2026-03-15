import { useMemo, useRef } from "react";
import { motion } from "framer-motion";
import { FiCopy, FiDownload, FiShare2, FiLink } from "react-icons/fi";
import QRCode from "react-qr-code";
import uvoteLogo from "../../../assets/U-VoteLogo.png";

async function copyToClipboard(text) {
   if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text);
      return true;
   }

   const ta = document.createElement("textarea");
   ta.value = text;
   ta.setAttribute("readonly", "");
   ta.style.position = "fixed";
   ta.style.top = "-1000px";
   ta.style.opacity = "0";
   document.body.appendChild(ta);
   ta.select();
   const ok = document.execCommand("copy");
   document.body.removeChild(ta);
   return ok;
}

function downloadDataUrl(dataUrl, filename) {
   const a = document.createElement("a");
   a.href = dataUrl;
   a.download = filename;
   document.body.appendChild(a);
   a.click();
   a.remove();
}

export default function PollShareTab({ pollName, pollUrl, onNotice }) {
   const qrWrapRef = useRef(null);

   const safeFileName = useMemo(() => {
      return String(pollName || "encuesta")
         .trim()
         .replace(/[^\w\-]+/g, "_")
         .toLowerCase();
   }, [pollName]);

   async function handleCopyLink() {
      try {
         const ok = await copyToClipboard(pollUrl);
         if (!ok) throw new Error("No se pudo copiar");
         onNotice?.({
            kind: "success",
            text: "Link de la encuesta copiado al portapapeles.",
         });
      } catch {
         onNotice?.({
            kind: "error",
            text: "No se pudo copiar el link. Intenta copiarlo manualmente.",
         });
      }
   }

   async function handleDownloadQr() {
      try {
         const svg = qrWrapRef.current?.querySelector("svg");
         if (!svg) {
            throw new Error("No se encontró el QR");
         }

         const serializer = new XMLSerializer();
         const svgString = serializer.serializeToString(svg);
         const svgBlob = new Blob([svgString], {
            type: "image/svg+xml;charset=utf-8",
         });
         const url = URL.createObjectURL(svgBlob);

         const img = new Image();
         img.onload = () => {
            const canvas = document.createElement("canvas");
            const size = 1200;
            canvas.width = size;
            canvas.height = size;

            const ctx = canvas.getContext("2d");
            if (!ctx) {
               URL.revokeObjectURL(url);
               onNotice?.({
                  kind: "error",
                  text: "No se pudo generar la imagen del QR.",
               });
               return;
            }

            ctx.fillStyle = "#ffffff";
            ctx.fillRect(0, 0, size, size);

            ctx.drawImage(img, 100, 100, 1000, 1000);

            const dataUrl = canvas.toDataURL("image/png");
            downloadDataUrl(dataUrl, `${safeFileName}_qr_uvote.png`);
            URL.revokeObjectURL(url);

            onNotice?.({
               kind: "success",
               text: "QR descargado correctamente.",
            });
         };

         img.onerror = () => {
            URL.revokeObjectURL(url);
            onNotice?.({
               kind: "error",
               text: "No se pudo exportar el QR.",
            });
         };

         img.src = url;
      } catch {
         onNotice?.({
            kind: "error",
            text: "No se pudo descargar el QR.",
         });
      }
   }

   return (
      <motion.div
         key="tab-share"
         initial={{ opacity: 0, y: 6 }}
         animate={{ opacity: 1, y: 0 }}
         exit={{ opacity: 0, y: 6 }}
      >
         <div
            className="uv-poll-card uv-flat uv-share-panel"
            style={{ marginTop: 14, cursor: "default" }}
         >
            <div className="uv-share-head">
               <div className="uv-share-title-wrap">
                  <div className="uv-share-icon">
                     <FiShare2 />
                  </div>

                  <div>
                     <div className="uv-stats-title">Compartir encuesta</div>
                     <div className="uv-participants-sub">
                        Comparte esta encuesta mediante un código QR personalizado con el logo de U-Vote.
                     </div>
                  </div>
               </div>
            </div>

            <div className="uv-share-grid">
               <div className="uv-share-qr-card">
                  <div className="uv-share-qr-box" ref={qrWrapRef}>
                     <div className="uv-share-qr-inner">
                        <QRCode
                           value={pollUrl}
                           size={260}
                           bgColor="#FFFFFF"
                           fgColor="#302f2c"
                           level="H"
                        />
                        <div className="uv-share-qr-logo">
                           <img src={uvoteLogo} alt="Logo de U-Vote" />
                        </div>
                     </div>
                  </div>

                  <div className="uv-share-qr-caption">
                     Escanea este QR para abrir la encuesta directamente.
                  </div>
               </div>

               <div className="uv-share-side">
                  <div className="uv-share-link-card">
                     <div className="uv-share-link-title">
                        <FiLink />
                        Link de acceso
                     </div>

                     <div className="uv-share-link-box">{pollUrl}</div>

                     <div className="uv-share-actions">
                        <button
                           type="button"
                           className="uv-btn"
                           onClick={handleCopyLink}
                        >
                           <FiCopy />
                           Copiar link
                        </button>

                        <button
                           type="button"
                           className="uv-btn uv-btn-soft"
                           onClick={handleDownloadQr}
                        >
                           <FiDownload />
                           Descargar QR
                        </button>
                     </div>
                  </div>

                  <div className="uv-share-note">
                     Recomendación: comparte este QR en afiches, redes internas o grupos
                     estudiantiles para facilitar el acceso a la votación.
                  </div>
               </div>
            </div>
         </div>
      </motion.div>
   );
}