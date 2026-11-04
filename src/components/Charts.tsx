// Biểu đồ dùng Recharts (thư viện nặng) — tách riêng để tải sau phần chính của trang Tổng quan
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  PolarAngleAxis,
  PolarGrid,
  PolarRadiusAxis,
  Radar,
  RadarChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

export type ScorePoint = { name: string; pct: number; date: string };

export function ScoreChart({ data, pass }: { data: ScorePoint[]; pass: number }) {
  return (
    <ResponsiveContainer>
      <LineChart data={data} margin={{ top: 5, right: 10, bottom: 0, left: -20 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="currentColor" className="text-stone-200 dark:text-stone-800" />
        <XAxis dataKey="name" tick={{ fontSize: 11 }} stroke="#8395aa" />
        <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} stroke="#8395aa" />
        <Tooltip
          formatter={(v: number) => [`${v}%`, 'Điểm']}
          labelFormatter={(_, p) => (p?.[0] ? `${p[0].payload.name} · ${p[0].payload.date}` : '')}
          contentStyle={{ borderRadius: 12, fontSize: 12 }}
        />
        <ReferenceLine y={pass} stroke="#bf9536" strokeDasharray="4 4" />
        <Line type="monotone" dataKey="pct" stroke="#178568" strokeWidth={2.5} dot={{ r: 4 }} />
      </LineChart>
    </ResponsiveContainer>
  );
}

export type RadarPoint = { area: string; now: number; before: number };

export function CompetencyRadar({ data, latest, prev }: { data: RadarPoint[]; latest: string; prev?: string }) {
  return (
    <ResponsiveContainer>
      <RadarChart data={data} outerRadius="70%">
        <PolarGrid stroke="#aebccd" />
        <PolarAngleAxis dataKey="area" tick={{ fontSize: 10, fill: '#5b6d83' }} />
        <PolarRadiusAxis domain={[0, 5]} tickCount={6} tick={false} axisLine={false} />
        {prev && <Radar name={`Tháng ${prev}`} dataKey="before" stroke="#8395aa" fill="#8395aa" fillOpacity={0.15} />}
        <Radar name={`Tháng ${latest}`} dataKey="now" stroke="#178568" fill="#3fb894" fillOpacity={0.35} />
        <Legend wrapperStyle={{ fontSize: 11 }} />
      </RadarChart>
    </ResponsiveContainer>
  );
}
