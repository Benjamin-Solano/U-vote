import { motion } from "framer-motion";

const PALETTE = ["#302f2c", "#5b554f", "#8b847c", "#b4aca2", "#d9d3c8", "#c8bbb0"];

export default function MetricsBarChart({ options }) {
   const maxPercent = Math.max(...options.map((o) => o.percent), 1);

   return (
      <div className="uv-metrics-chart">
         {options.length === 0 ? (
            <div className="uv-home-empty-box">
               Esta votación todavía no tiene datos para graficar.
            </div>
         ) : (
            <div className="uv-vbar-container">
               <div className="uv-vbar-chart">
                  {options.map((option, index) => {
                     const height =
                        maxPercent > 0
                           ? Math.max((option.percent / maxPercent) * 100, 4)
                           : 4;

                     return (
                        <motion.div
                           className="uv-vbar-col"
                           key={option.id}
                           initial={{ opacity: 0, y: 30 }}
                           animate={{ opacity: 1, y: 0 }}
                           transition={{ delay: index * 0.1, duration: 0.4, ease: "easeOut" }}
                        >
                           <span className="uv-vbar-value">{option.votes}</span>
                           <div className="uv-vbar-track">
                              <motion.div
                                 className="uv-vbar-fill"
                                 style={{ background: PALETTE[index % PALETTE.length] }}
                                 initial={{ height: 0 }}
                                 animate={{ height: `${height}%` }}
                                 transition={{ delay: index * 0.1 + 0.2, duration: 0.6, ease: "easeOut" }}
                              />
                           </div>
                           <span className="uv-vbar-label" title={option.label}>
                              {option.label.length > 12
                                 ? `${option.label.slice(0, 12)}…`
                                 : option.label}
                           </span>
                           <small className="uv-vbar-percent">{option.percent}%</small>
                        </motion.div>
                     );
                  })}
               </div>
            </div>
         )}
      </div>
   );
}
