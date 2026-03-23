import { useState } from "react";

export default function CalendarCell({ cell, monthEvents }) {
   const [showTooltip, setShowTooltip] = useState(false);

   if (cell.type === "empty") {
      return <div className="uv-calendar-cell uv-calendar-cell--empty" />;
   }

   /* Votaciones activas en esta fecha */
   const cellPolls = cell.hasEvent
      ? monthEvents.filter((r) => {
           const s = r.start
              ? new Date(r.start.getFullYear(), r.start.getMonth(), r.start.getDate())
              : null;
           const e = r.end
              ? new Date(r.end.getFullYear(), r.end.getMonth(), r.end.getDate())
              : null;
           const d = cell._date;
           return s && e && d >= s && d <= e;
        })
      : [];

   return (
      <div
         className={[
            "uv-calendar-cell",
            cell.hasEvent ? "is-in-range" : "",
            cell.isStart ? "is-start" : "",
            cell.isEnd ? "is-end" : "",
            cell.isToday ? "is-today" : "",
         ].join(" ").trim()}
         onMouseEnter={() => cellPolls.length > 0 && setShowTooltip(true)}
         onMouseLeave={() => setShowTooltip(false)}
      >
         <span>{cell.day}</span>

         {showTooltip && cellPolls.length > 0 && (
            <div className="uv-calendar-tooltip">
               {cellPolls.map((p) => (
                  <div key={p.id} className="uv-calendar-tooltip-item">
                     {p.nombre}
                  </div>
               ))}
            </div>
         )}
      </div>
   );
}
