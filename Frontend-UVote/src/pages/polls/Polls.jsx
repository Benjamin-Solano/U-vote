import { useEffect, useState } from "react";
import { pollsApi } from "../../api/polls.api";


function Polls() {
   const [polls, setPolls] = useState([]);
   const [error, setError] = useState("");

   useEffect(() => {
      (async () => {
         try {
            const res = await pollsApi.list();
            setPolls(res.data);
         } catch (e) {
            setError(e?.response?.data?.message ?? "Error cargando encuestas");
         }
      })();
   }, []);

   return (
      <div>
         <h1>Encuestas</h1>
         {error && <p style={{ color: "red" }}>{error}</p>}
         <ul>
            {polls.map((p) => (
               <li key={p.id}>{p.titulo ?? `Encuesta ${p.id}`}</li>
            ))}
         </ul>
      </div>
   );
}

export default Polls;
