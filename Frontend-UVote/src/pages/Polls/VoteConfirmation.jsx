import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { FiCheckCircle, FiHome } from "react-icons/fi";
import "./voteConfirmation.css";

const VOTE_CONFIRMATION_KEY = "uv_vote_confirmation";

export default function VoteConfirmation() {
   const navigate = useNavigate();
   const { id } = useParams();
   const [payload, setPayload] = useState(null);

   useEffect(() => {
      try {
         const raw = sessionStorage.getItem(VOTE_CONFIRMATION_KEY);
         if (!raw) return;
         const parsed = JSON.parse(raw);
         setPayload(parsed);
         sessionStorage.removeItem(VOTE_CONFIRMATION_KEY);
      } catch {
         setPayload(null);
      }
   }, []);

   const pollName = useMemo(() => {
      return payload?.nombreEncuesta || `Encuesta #${id}`;
   }, [payload, id]);

   return (
      <div className="uv-vote-confirm-wrap">
         <motion.div
            className="uv-vote-confirm-card"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.28 }}
         >
            <div className="uv-vote-confirm-icon">
               <FiCheckCircle />
            </div>

            <h1>¡Tu voto fue registrado!</h1>

            <p>
               Has votado correctamente en <strong>{pollName}</strong>.
            </p>

            <p className="uv-vote-confirm-sub">
               Gracias por participar. Tu selección ya quedó guardada.
            </p>

            <button className="uv-vote-confirm-btn" type="button" onClick={() => navigate("/")}>
               <FiHome />
               Ir al inicio
            </button>
         </motion.div>
      </div>
   );
}