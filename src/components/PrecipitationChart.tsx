import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import type { DailyPrecipitation } from '../types';
import { formatShortDate } from '../utils/dates';

type PrecipitationChartProps = {
  days: DailyPrecipitation[];
};

type ChartPoint = {
  date: string;
  label: string;
  precipitation: number;
};

function ChartTooltip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: { payload: ChartPoint }[];
}) {
  if (!active || !payload || payload.length === 0) return null;

  const point = payload[0].payload;
  return (
    <div className="chart-tooltip">
      <strong>{point.label}</strong>
      <span>{point.precipitation.toFixed(1)} mm</span>
    </div>
  );
}

export function PrecipitationChart({ days }: PrecipitationChartProps) {
  if (days.length === 0) {
    return (
      <section className="precipitation-chart empty">
        <p>Ingen data å vise for valgt periode.</p>
      </section>
    );
  }

  const data: ChartPoint[] = days.map((day) => ({
    date: day.date,
    label: formatShortDate(day.date),
    precipitation: day.precipitation,
  }));

  return (
    <section className="precipitation-chart" aria-label="Nedbør per dag">
      <h2 className="section-title">Nedbør per dag</h2>
      <div className="chart-container">
        <ResponsiveContainer width="100%" height={320}>
          <BarChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 8 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis
              dataKey="label"
              tick={{ fontSize: 12 }}
              interval="preserveStartEnd"
              minTickGap={16}
            />
            <YAxis
              tick={{ fontSize: 12 }}
              width={40}
              label={{
                value: 'mm',
                angle: -90,
                position: 'insideLeft',
                offset: 10,
                style: { fontSize: 12 },
              }}
            />
            <Tooltip content={<ChartTooltip />} />
            <Bar
              dataKey="precipitation"
              fill="var(--color-accent)"
              radius={[4, 4, 0, 0]}
              name="Nedbør"
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
}
