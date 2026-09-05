import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { AlertTriangle, CalendarDays, CheckCircle2, UsersRound } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';

const ICONS = [CheckCircle2, AlertTriangle, CalendarDays, UsersRound];

export default function DashboardMetrics({ metrics }) {
  return (
    <section className="dashboard-metrics" aria-label="Mission metrics">
      <div className="metrics-strip">
        {metrics.cards.map(({ label, value }, index) => {
          const Icon = ICONS[index];
          return <Card key={label} size="sm" className="metric-card"><CardHeader><CardDescription>{label}</CardDescription><Icon aria-hidden="true" /></CardHeader><CardContent><CardTitle>{value}</CardTitle></CardContent></Card>;
        })}
      </div>
      <Card className="metrics-chart-card"><CardHeader><CardTitle>Task status</CardTitle><CardDescription>Current workload across all teams</CardDescription></CardHeader><CardContent><div className="metrics-chart" role="img" aria-label="Bar chart showing task counts by status"><ResponsiveContainer width="100%" height="100%"><BarChart data={metrics.statusData} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}><CartesianGrid strokeDasharray="3 3" stroke="var(--line)" /><XAxis dataKey="status" tick={{ fill: 'var(--text-muted)', fontSize: 12 }} axisLine={false} tickLine={false} /><YAxis allowDecimals={false} tick={{ fill: 'var(--text-muted)', fontSize: 12 }} axisLine={false} tickLine={false} /><Tooltip cursor={{ fill: 'rgba(79,216,224,.08)' }} contentStyle={{ background: 'var(--panel-raised)', border: '1px solid var(--line)', color: 'var(--text)' }} /><Bar dataKey="count" fill="var(--signal)" radius={[4, 4, 0, 0]} /></BarChart></ResponsiveContainer></div></CardContent></Card>
    </section>
  );
}
