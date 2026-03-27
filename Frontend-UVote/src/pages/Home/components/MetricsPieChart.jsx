import { motion } from "framer-motion";
import { useTheme } from "../../../context/ThemeContext";

const PALETTE_LIGHT = ["#302f2c", "#5b554f", "#8b847c", "#b4aca2", "#d9d3c8", "#c8bbb0"];
const PALETTE_DARK  = ["#c8c2ae", "#a89e8e", "#d4c8b4", "#b4a896", "#9e9282", "#c2b8a2"];

export default function MetricsPieChart({ options, totalVotes }) {
   const { theme } = useTheme();
   const PALETTE = theme === "dark" ? PALETTE_DARK : PALETTE_LIGHT;
   const segments = options.map((option, index) => ({
      ...option,
      color: PALETTE[index % PALETTE.length],
   }));

   let start = 0;
   const gradientParts = segments.map((segment) => {
      const end = start + segment.percent;
      const part = `${segment.color} ${start}% ${end}%`;
      start = end;
      return part;
   });

   const background =
      segments.length > 0
         ? `conic-gradient(${gradientParts.join(", ")})`
         : "conic-gradient(#d9d3c8 0% 100%)";

   return (
      <motion.div
         className="uv-metrics-chart-pie-layout"
         initial={{ opacity: 0, scale: 0.85 }}
         animate={{ opacity: 1, scale: 1 }}
         transition={{ duration: 0.5, ease: "easeOut" }}
      >
         <div className="uv-metrics-pie-wrap">
            <div
               className="uv-metrics-pie uv-pie-animate"
               style={{ background }}
               aria-label="Gráfico circular de resultados"
            >
               <div className="uv-metrics-pie-hole">
                  <span>Total</span>
                  <strong>{totalVotes}</strong>
               </div>
            </div>
         </div>

         <div className="uv-metrics-legend">
            {segments.map((segment, i) => (
               <motion.div
                  key={segment.id}
                  className="uv-metrics-legend-item"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.08, duration: 0.3 }}
               >
                  <span
                     className="uv-metrics-legend-dot"
                     style={{ background: segment.color }}
                  />
                  <div className="uv-metrics-legend-copy">
                     <strong>{segment.label}</strong>
                     <small>
                        {segment.votes} voto{segment.votes === 1 ? "" : "s"} ·{" "}
                        {segment.percent}%
                     </small>
                  </div>
               </motion.div>
            ))}
         </div>
      </motion.div>
   );
}
