import { useMemo, useState } from "react";
import {
   FiChevronLeft,
   FiChevronRight,
   FiCalendar,
   FiActivity,
} from "react-icons/fi";

import CalendarCell from "./CalendarCell";

const MONTH_NAMES = [
   "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
   "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre",
];

const WEEKDAYS = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];

export default function MonthlyCalendar({ polls }) {
   const today = new Date();
   const [viewYear, setViewYear] = useState(today.getFullYear());
   const [viewMonth, setViewMonth] = useState(today.getMonth());

   const handlePrevMonth = () => {
      setViewMonth((prev) => {
         if (prev === 0) { setViewYear((y) => y - 1); return 11; }
         return prev - 1;
      });
   };

   const handleNextMonth = () => {
      setViewMonth((prev) => {
         if (prev === 11) { setViewYear((y) => y + 1); return 0; }
         return prev + 1;
      });
   };

   const pollRanges = useMemo(() => {
      if (!Array.isArray(polls)) return [];
      return polls
         .filter((p) => p?.fechaInicio || p?.fechaCierre)
         .map((p) => ({
            id: p.id,
            nombre: p.nombre || "Sin nombre",
            start: p.fechaInicio ? new Date(p.fechaInicio) : null,
            end: p.fechaCierre ? new Date(p.fechaCierre) : null,
         }));
   }, [polls]);

   const monthEvents = useMemo(() => {
      const firstOfMonth = new Date(viewYear, viewMonth, 1);
      const lastOfMonth = new Date(viewYear, viewMonth + 1, 0);
      return pollRanges.filter((r) => {
         const s = r.start || r.end;
         const e = r.end || r.start;
         if (!s || !e) return false;
         return s <= lastOfMonth && e >= firstOfMonth;
      });
   }, [pollRanges, viewYear, viewMonth]);

   const cells = useMemo(() => {
      const firstDay = new Date(viewYear, viewMonth, 1);
      const lastDay = new Date(viewYear, viewMonth + 1, 0);
      const mondayBasedStart = (firstDay.getDay() + 6) % 7;
      const totalDays = lastDay.getDate();
      const result = [];

      for (let i = 0; i < mondayBasedStart; i += 1) {
         result.push({ type: "empty", key: `e-${i}` });
      }

      for (let day = 1; day <= totalDays; day += 1) {
         const cellDate = new Date(viewYear, viewMonth, day);
         const isToday = cellDate.toDateString() === today.toDateString();
         let hasEvent = false;
         let isStart = false;
         let isEnd = false;

         for (const r of monthEvents) {
            const s = r.start
               ? new Date(r.start.getFullYear(), r.start.getMonth(), r.start.getDate())
               : null;
            const e = r.end
               ? new Date(r.end.getFullYear(), r.end.getMonth(), r.end.getDate())
               : null;
            if (s && e && cellDate >= s && cellDate <= e) {
               hasEvent = true;
               if (cellDate.getTime() === s.getTime()) isStart = true;
               if (cellDate.getTime() === e.getTime()) isEnd = true;
            }
         }

         result.push({
            type: "day",
            key: `d-${day}`,
            day,
            isToday,
            hasEvent,
            isStart,
            isEnd,
            _date: cellDate,
         });
      }

      return result;
   }, [viewYear, viewMonth, monthEvents, today]);

   return (
      <section className="uv-calendar-card uv-dashboard-module">
         <div className="uv-calendar-left">
            <span className="uv-calendar-kicker">
               <FiCalendar /> Calendario
            </span>

            <div className="uv-calendar-day-number">
               {String(today.getDate()).padStart(2, "0")}
            </div>

            <div className="uv-calendar-day-label">
               {today.toLocaleDateString("es-CR", { weekday: "long" })}
            </div>

            <div className="uv-calendar-events">
               <strong>
                  <FiActivity style={{ marginRight: 6, verticalAlign: "-2px" }} />
                  Votaciones este mes
               </strong>
               {monthEvents.length === 0 ? (
                  <p>No hay votaciones en {MONTH_NAMES[viewMonth]}.</p>
               ) : (
                  <ul className="uv-calendar-event-list">
                     {monthEvents.slice(0, 4).map((ev) => (
                        <li key={ev.id}>{ev.nombre}</li>
                     ))}
                     {monthEvents.length > 4 && (
                        <li className="uv-calendar-event-more">
                           +{monthEvents.length - 4} más
                        </li>
                     )}
                  </ul>
               )}
            </div>
         </div>

         <div className="uv-calendar-right">
            <div className="uv-calendar-top">
               <button
                  type="button"
                  className="uv-calendar-nav-btn"
                  onClick={handlePrevMonth}
                  aria-label="Mes anterior"
               >
                  <FiChevronLeft />
               </button>
               <strong>{MONTH_NAMES[viewMonth]} {viewYear}</strong>
               <button
                  type="button"
                  className="uv-calendar-nav-btn"
                  onClick={handleNextMonth}
                  aria-label="Mes siguiente"
               >
                  <FiChevronRight />
               </button>
            </div>

            <div className="uv-calendar-weekdays">
               {WEEKDAYS.map((day) => (
                  <span key={day}>{day}</span>
               ))}
            </div>

            <div className="uv-calendar-grid">
               {cells.map((cell) => (
                  <CalendarCell
                     key={cell.key}
                     cell={cell}
                     monthEvents={monthEvents}
                  />
               ))}
            </div>
         </div>
      </section>
   );
}
