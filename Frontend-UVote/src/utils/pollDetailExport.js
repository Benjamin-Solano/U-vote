function escapeHtml(value) {
   return String(value ?? "")
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#39;");
}

function escapeCsv(value) {
   const text = String(value ?? "");
   if (text.includes(",") || text.includes('"') || text.includes("\n")) {
      return `"${text.replace(/"/g, '""')}"`;
   }
   return text;
}

function downloadBlob(blob, filename) {
   const url = URL.createObjectURL(blob);
   const a = document.createElement("a");
   a.href = url;
   a.download = filename;
   document.body.appendChild(a);
   a.click();
   a.remove();
   URL.revokeObjectURL(url);
}

export function exportParticipantsToCsv(rows, pollName = "votacion") {
   const headers = ["Correo", "Ha votado"];
   const lines = [
      headers.join(","),
      ...rows.map((row) =>
         [escapeCsv(row.correo), escapeCsv(row.yaVoto ? "Sí" : "No")].join(",")
      ),
   ];

   const blob = new Blob(["\uFEFF" + lines.join("\n")], {
      type: "text/csv;charset=utf-8;",
   });

   const safeName = String(pollName || "votacion")
      .trim()
      .replace(/[^\w\-]+/g, "_");

   downloadBlob(blob, `${safeName}_participantes_autorizados.csv`);
}

export function exportParticipantsToPdf(rows, pollName = "votacion") {
   const safeTitle = escapeHtml(pollName || "Votación");
   const total = rows.length;
   const votaron = rows.filter((r) => r.yaVoto).length;
   const pendientes = total - votaron;

   const tableRows = rows
      .map(
         (row, index) => `
            <tr>
               <td>${index + 1}</td>
               <td>${escapeHtml(row.correo ?? "")}</td>
               <td>${row.yaVoto ? "Sí" : "No"}</td>
            </tr>
         `
      )
      .join("");

   const html = `
      <!DOCTYPE html>
      <html lang="es">
      <head>
         <meta charset="UTF-8" />
         <title>${safeTitle} - Participantes autorizados</title>
         <style>
            body {
               font-family: Arial, Helvetica, sans-serif;
               color: #302f2c;
               padding: 24px;
            }
            h1 {
               margin: 0 0 8px;
               font-size: 22px;
            }
            .meta {
               margin-bottom: 18px;
               color: #5e5b56;
               font-size: 13px;
            }
            .summary {
               display: flex;
               gap: 12px;
               flex-wrap: wrap;
               margin-bottom: 18px;
            }
            .chip {
               border: 1px solid #d9d3c5;
               border-radius: 999px;
               padding: 8px 12px;
               font-size: 12px;
               background: #f8f6ef;
            }
            table {
               width: 100%;
               border-collapse: collapse;
               margin-top: 12px;
            }
            th, td {
               border: 1px solid #d8d2c5;
               padding: 10px 12px;
               text-align: left;
               font-size: 13px;
            }
            th {
               background: #efede3;
            }
            tr:nth-child(even) {
               background: #faf9f5;
            }
         </style>
      </head>
      <body>
         <h1>${safeTitle}</h1>
         <div class="meta">Participantes autorizados por archivo Excel</div>

         <div class="summary">
            <div class="chip">Total autorizados: <strong>${total}</strong></div>
            <div class="chip">Ya votaron: <strong>${votaron}</strong></div>
            <div class="chip">Pendientes: <strong>${pendientes}</strong></div>
         </div>

         <table>
            <thead>
               <tr>
                  <th>#</th>
                  <th>Correo</th>
                  <th>Ha votado</th>
               </tr>
            </thead>
            <tbody>
               ${tableRows || `<tr><td colspan="3">No hay participantes autorizados.</td></tr>`}
            </tbody>
         </table>
      </body>
      </html>
   `;

   const printFrame = document.createElement("iframe");
   printFrame.style.position = "fixed";
   printFrame.style.right = "0";
   printFrame.style.bottom = "0";
   printFrame.style.width = "0";
   printFrame.style.height = "0";
   printFrame.style.border = "0";
   document.body.appendChild(printFrame);

   const doc = printFrame.contentWindow?.document;
   if (!doc) {
      document.body.removeChild(printFrame);
      throw new Error("No se pudo preparar la impresión.");
   }

   doc.open();
   doc.write(html);
   doc.close();

   setTimeout(() => {
      printFrame.contentWindow?.focus();
      printFrame.contentWindow?.print();

      setTimeout(() => {
         document.body.removeChild(printFrame);
      }, 1000);
   }, 250);
}