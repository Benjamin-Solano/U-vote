import { useEffect, useMemo, useState } from "react";
import { FiSearch } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import { pollsApi } from "../../api/polls.api";
import "./polls.css";

export default function SearchPolls() {
   const navigate = useNavigate();

   const [q, setQ] = useState("");
   const [polls, setPolls] = useState([]);
   const [loading, setLoading] = useState(false);
   const [err, setErr] = useState("");

   useEffect(() => {
      let mounted = true;

      (async () => {
         try {
            setLoading(true);
            setErr("");
            const res = await pollsApi.list();
            if (mounted) setPolls(Array.isArray(res.data) ? res.data : []);
         } catch (e) {
            if (mounted) setErr(e?.response?.data?.message || e.message || "Error cargando encuestas");
         } finally {
            if (mounted) setLoading(false);
         }
      })();

      return () => (mounted = false);
   }, []);

   const filtered = useMemo(() => {
      const term = q.trim().toLowerCase();
      if (!term) return [];
      return polls.filter((p) => (p.nombre || "").toLowerCase().includes(term));
   }, [polls, q]);

   return (
      <div className="uv-polls-scope uv-search-page">
         <div className="uv-search-center">
            <h1 className="uv-search-title">Buscar Encuestas</h1>
            <p className="uv-search-sub">Escribe el nombre de una encuesta para encontrarla.</p>

            <div className="uv-search-bar" role="search">
               <FiSearch className="uv-search-icon" aria-hidden="true" />
               <input
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  placeholder="Buscar por nombre…"
                  className="uv-search-input-field"
               />
            </div>

            {loading && <div className="uv-search-hint">Cargando…</div>}
            {!loading && err && <div className="uv-search-error">{err}</div>}
         </div>

         {!!q.trim() && !loading && !err && (
            <div className="uv-search-results">
               {filtered.length === 0 ? (
                  <div className="uv-search-hint">No se encontraron encuestas.</div>
               ) : (
                  <div className="uv-search-grid">
                     {filtered.map((p) => (
                        <button
                           key={p.id}
                           className="uv-poll-card uv-poll-card-compact"
                           onClick={() => navigate(`/encuestas/${p.id}`)}
                           type="button"
                        >
                           <div className="uv-poll-name">{p.nombre}</div>
                           <div className="uv-poll-desc">
                              {p.descripcion?.trim() ? p.descripcion : "Sin descripción."}
                           </div>
                        </button>
                     ))}
                  </div>
               )}
            </div>
         )}
      </div>
   );
}
