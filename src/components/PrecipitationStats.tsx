import type { Location } from '../types';
import { formatDisplayDate } from '../utils/dates';
import { formatLocationLabel } from './LocationSearch';
import { GlassPanel } from './GlassPanel';

type PrecipitationStatsProps = {
  location: Location;
  startDate: string;
  endDate: string;
  total: number;
};

function formatMm(value: number): string {
  return `${value.toFixed(1)} mm`;
}

export function PrecipitationStats({
  location,
  startDate,
  endDate,
  total,
}: PrecipitationStatsProps) {
  return (
    <GlassPanel as="section" className="precipitation-stats">
      <p className="stats-context">
        <strong>{formatLocationLabel(location)}</strong>
        <span>
          {formatDisplayDate(startDate)} – {formatDisplayDate(endDate)}
        </span>
      </p>

      <article className="stat-card highlight">
        <h3>Samlet nedbør</h3>
        <p className="stat-value">{formatMm(total)}</p>
      </article>
    </GlassPanel>
  );
}
