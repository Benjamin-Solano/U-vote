import { motion } from "framer-motion";

export default function StatCard({ icon, label, value, hint, tone }) {
   return (
      <motion.article
         className={`uv-stat-card uv-stat-card--${tone}`}
         initial={{ opacity: 0, y: 18 }}
         animate={{ opacity: 1, y: 0 }}
         transition={{ duration: 0.35, ease: "easeOut" }}
      >
         <div className={`uv-stat-card-icon uv-stat-card-icon--${tone}`}>{icon}</div>
         <div className="uv-stat-card-body">
            <span className="uv-stat-card-label">{label}</span>
            <strong className="uv-stat-card-value">{value}</strong>
            <small className="uv-stat-card-hint">{hint}</small>
         </div>
      </motion.article>
   );
}