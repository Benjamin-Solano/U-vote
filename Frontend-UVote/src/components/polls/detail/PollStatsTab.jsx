import { motion } from "framer-motion";
import { HorizontalBars, PieResults, VerticalBars } from "./PollCharts";

export default function PollStatsTab({
   loadingStats,
   chartData,
   totalVotes,
   chartType,
   setChartType,
   participationData,
   participationChartType,
   setParticipationChartType,
}) {
   return (
      <motion.div
         key="tab-stats"
         initial={{ opacity: 0, y: 6 }}
         animate={{ opacity: 1, y: 0 }}
         exit={{ opacity: 0, y: 6 }}
      >
         <div style={{ marginTop: 14 }}>
            <div className="uv-poll-card uv-flat" style={{ cursor: "default" }}>
               <div className="uv-stats-head">
                  <div className="uv-stats-title">Resumen</div>
                  <div className="uv-stats-total">
                     <span>Total votos</span>
                     <strong>{totalVotes}</strong>
                  </div>
               </div>

               {loadingStats ? (
                  <div className="uv-polls-state" style={{ marginTop: 12 }}>
                     Cargando estadísticas…
                  </div>
               ) : chartData.length === 0 ? (
                  <div className="uv-polls-state" style={{ marginTop: 12 }}>
                     Aún no hay votos registrados.
                  </div>
               ) : (
                  <div className="uv-results-list">
                     {chartData.map((r) => (
                        <div key={r.name} className="uv-result-row">
                           <div className="uv-result-head">
                              <div className="uv-result-name">{r.name}</div>
                              <div className="uv-result-val">
                                 {r.votos} <span>({r.pct}%)</span>
                              </div>
                           </div>

                           <div className="uv-bar">
                              <div style={{ width: `${r.pct}%`, background: r.color }} />
                           </div>
                        </div>
                     ))}
                  </div>
               )}
            </div>

            <div className="uv-poll-card uv-flat" style={{ marginTop: 14, cursor: "default" }}>
               <div className="uv-stats-head">
                  <div className="uv-stats-title">Gráficas de resultados</div>

                  <div className="uv-chart-toolbar" role="group" aria-label="Tipo de gráfica">
                     <button
                        type="button"
                        className={`uv-chip ${chartType === "vertical" ? "active" : ""}`}
                        onClick={() => setChartType("vertical")}
                        disabled={loadingStats || chartData.length === 0}
                     >
                        Barras Verticales
                     </button>
                     <button
                        type="button"
                        className={`uv-chip ${chartType === "horizontal" ? "active" : ""}`}
                        onClick={() => setChartType("horizontal")}
                        disabled={loadingStats || chartData.length === 0}
                     >
                        Barras Horizontales
                     </button>
                     <button
                        type="button"
                        className={`uv-chip ${chartType === "pie" ? "active" : ""}`}
                        onClick={() => setChartType("pie")}
                        disabled={loadingStats || chartData.length === 0}
                     >
                        Pastel
                     </button>
                  </div>
               </div>

               <div className="uv-chart-box">
                  {loadingStats ? (
                     <div className="uv-chart-empty">Cargando gráfica…</div>
                  ) : chartData.length === 0 ? (
                     <div className="uv-chart-empty">No hay datos para graficar.</div>
                  ) : chartType === "vertical" ? (
                     <VerticalBars data={chartData} valueLabel="votos" />
                  ) : chartType === "horizontal" ? (
                     <HorizontalBars data={chartData} valueLabel="votos" />
                  ) : (
                     <PieResults data={chartData} valueLabel="votos" />
                  )}
               </div>
            </div>

            <div className="uv-poll-card uv-flat" style={{ marginTop: 14, cursor: "default" }}>
               <div className="uv-stats-head">
                  <div className="uv-stats-title">Participación de autorizados</div>

                  <div className="uv-chart-toolbar" role="group" aria-label="Tipo de gráfica de participación">
                     <button
                        type="button"
                        className={`uv-chip ${participationChartType === "vertical" ? "active" : ""}`}
                        onClick={() => setParticipationChartType("vertical")}
                        disabled={loadingStats || participationData.length === 0}
                     >
                        Barras
                     </button>
                     <button
                        type="button"
                        className={`uv-chip ${participationChartType === "pie" ? "active" : ""}`}
                        onClick={() => setParticipationChartType("pie")}
                        disabled={loadingStats || participationData.length === 0}
                     >
                        Pastel
                     </button>
                  </div>
               </div>

               <div className="uv-chart-box">
                  {loadingStats ? (
                     <div className="uv-chart-empty">Cargando participación…</div>
                  ) : participationData.length === 0 ? (
                     <div className="uv-chart-empty">No hay lista de autorizados cargada.</div>
                  ) : participationChartType === "vertical" ? (
                     <VerticalBars data={participationData} valueLabel="participantes" />
                  ) : (
                     <PieResults data={participationData} valueLabel="participantes" />
                  )}
               </div>
            </div>
         </div>
      </motion.div>
   );
}