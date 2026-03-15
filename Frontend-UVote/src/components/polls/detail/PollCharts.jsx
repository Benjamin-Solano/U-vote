import {
   ResponsiveContainer,
   BarChart,
   Bar,
   XAxis,
   YAxis,
   CartesianGrid,
   Tooltip,
   PieChart,
   Pie,
   Cell,
} from "recharts";

function clampLabel(s, max = 14) {
   const t = String(s ?? "");
   if (t.length <= max) return t;
   return `${t.slice(0, max)}…`;
}

function TooltipBox({ active, payload, label }) {
   if (!active || !payload?.length) return null;
   const v = payload[0]?.value ?? 0;

   return (
      <div className="uv-chart-tooltip">
         <div className="uv-tt-title">{label}</div>
         <div className="uv-tt-val">{v}</div>
      </div>
   );
}

export function VerticalBars({ data, valueLabel = "votos" }) {
   return (
      <div className="uv-chart-shell">
         <ResponsiveContainer width="100%" height={320}>
            <BarChart data={data} margin={{ top: 10, right: 18, bottom: 12, left: 6 }}>
               <CartesianGrid strokeDasharray="3 3" />
               <XAxis
                  dataKey="name"
                  tick={{ fontSize: 12 }}
                  interval={0}
                  tickFormatter={(v) => clampLabel(v, 12)}
               />
               <YAxis tick={{ fontSize: 12 }} allowDecimals={false} />
               <Tooltip
                  content={({ active, payload, label }) => {
                     if (!active || !payload?.length) return null;
                     return (
                        <TooltipBox
                           active={active}
                           payload={[{ value: `${payload[0]?.value ?? 0} ${valueLabel}` }]}
                           label={label}
                        />
                     );
                  }}
               />
               <Bar dataKey="votos" radius={[8, 8, 0, 0]}>
                  {data.map((d, i) => (
                     <Cell key={i} fill={d.color} />
                  ))}
               </Bar>
            </BarChart>
         </ResponsiveContainer>
      </div>
   );
}

export function HorizontalBars({ data, valueLabel = "votos" }) {
   return (
      <div className="uv-chart-shell">
         <ResponsiveContainer width="100%" height={320}>
            <BarChart data={data} layout="vertical" margin={{ top: 10, right: 18, bottom: 10, left: 32 }}>
               <CartesianGrid strokeDasharray="3 3" />
               <XAxis type="number" tick={{ fontSize: 12 }} allowDecimals={false} />
               <YAxis
                  type="category"
                  dataKey="name"
                  tick={{ fontSize: 12 }}
                  width={120}
                  tickFormatter={(v) => clampLabel(v, 16)}
               />
               <Tooltip
                  content={({ active, payload, label }) => {
                     if (!active || !payload?.length) return null;
                     return (
                        <TooltipBox
                           active={active}
                           payload={[{ value: `${payload[0]?.value ?? 0} ${valueLabel}` }]}
                           label={label}
                        />
                     );
                  }}
               />
               <Bar dataKey="votos" radius={[0, 8, 8, 0]}>
                  {data.map((d, i) => (
                     <Cell key={i} fill={d.color} />
                  ))}
               </Bar>
            </BarChart>
         </ResponsiveContainer>
      </div>
   );
}

export function PieResults({ data, valueLabel = "votos" }) {
   return (
      <div className="uv-chart-shell">
         <ResponsiveContainer width="100%" height={320}>
            <PieChart>
               <Tooltip
                  content={({ active, payload }) => {
                     if (!active || !payload?.length) return null;
                     const p = payload[0]?.payload;
                     return (
                        <div className="uv-chart-tooltip">
                           <div className="uv-tt-title">{p?.name}</div>
                           <div className="uv-tt-val">
                              {p?.votos} {valueLabel}
                           </div>
                           {typeof p?.pct === "number" ? (
                              <div className="uv-tt-sub">{p.pct}%</div>
                           ) : null}
                        </div>
                     );
                  }}
               />
               <Pie
                  data={data}
                  dataKey="votos"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={110}
                  innerRadius={55}
                  paddingAngle={2}
                  stroke="rgba(48,47,44,0.10)"
               >
                  {data.map((d, i) => (
                     <Cell key={i} fill={d.color} />
                  ))}
               </Pie>
            </PieChart>
         </ResponsiveContainer>

         <div className="uv-pie-legend">
            {data.map((d, i) => (
               <div className="uv-pie-item" key={`${d.name}-${i}`}>
                  <span className="uv-dot" style={{ background: d.color }} />
                  <span className="uv-pie-name">{d.name}</span>
                  <span className="uv-pie-val">{d.votos}</span>
               </div>
            ))}
         </div>
      </div>
   );
}