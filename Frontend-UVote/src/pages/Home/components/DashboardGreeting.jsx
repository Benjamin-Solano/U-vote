import {
   FiClock,
   FiCalendar,
   FiMoon,
   FiSun,
   FiSunset,
} from "react-icons/fi";

import { formatDateShort } from "../../../utils/home.utils";

export default function DashboardGreeting({ userName, currentTime, nextClosingPoll }) {
   const hour = currentTime.getHours();

   let greeting = "Buenas Noches";
   let icon = <FiMoon />;
   if (hour >= 5 && hour < 12) {
      greeting = "Buenos Días";
      icon = <FiSun />;
   } else if (hour >= 12 && hour < 18) {
      greeting = "Buenas Tardes";
      icon = <FiSunset />;
   }

   const formattedTime = currentTime.toLocaleTimeString("es-CR", {
      hour: "2-digit",
      minute: "2-digit",
   });

   return (
      <section className="uv-dashboard-welcome">
         <div className="uv-dashboard-welcome-main uv-dashboard-module">
            <div className="uv-dashboard-welcome-badge">
               <span className="uv-dashboard-welcome-icon">{icon}</span>
               <span>Panel principal</span>
            </div>
            <h1>
               {greeting}, <span>{userName || "Usuario"}</span>
            </h1>
            <p>
               Revisa tus votaciones, consulta métricas y mantén el control de tu
               actividad desde un solo espacio.
            </p>
         </div>

         <div className="uv-dashboard-welcome-side">
            <article className="uv-dashboard-info-card uv-dashboard-module">
               <div className="uv-dashboard-info-card-head">
                  <FiClock />
                  <span>Hora actual</span>
               </div>
               <strong>{formattedTime}</strong>
               <small>Actualizada en tiempo real</small>
            </article>

            <article className="uv-dashboard-info-card uv-dashboard-module">
               <div className="uv-dashboard-info-card-head">
                  <FiCalendar />
                  <span>Próxima votación a cerrar</span>
               </div>
               <strong>{nextClosingPoll?.nombre || "Sin cierres próximos"}</strong>
               <small>
                  {nextClosingPoll?.fechaCierre
                     ? `Cierra el ${formatDateShort(nextClosingPoll.fechaCierre)}`
                     : "Aparecerá aquí cuando tengas una votación programada"}
               </small>
            </article>
         </div>
      </section>
   );
}
