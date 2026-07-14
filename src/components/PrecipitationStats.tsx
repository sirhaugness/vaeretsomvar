import type { DailyPrecipitation, Location } from '../types';
import { formatDisplayDate } from '../utils/dates';
import { formatLocationLabel } from './LocationSearch';

type PrecipitationStatsProps = {
  location: Location;
  startDate: string;
  endDate: string;
  total: number;
  wetDays: number;
  maxDay: DailyPrecipitation | null;
  dayCount: number;
};

function formatMm(value: number): string {
  return `${value.toFixed(1)} mm`;
}

export function PrecipitationStats({
  location,
  startDate,
  endDate,
  total,
  wetDays,
  maxDay,
  dayCount,
}: PrecipitationStatsProps) {
  return (
    <section className="precipitation-stats" aria-label="Nedbørssammendrag">
      <p className="stats-context">
        <strong>{formatLocationLabel(location)}</strong>
        <span>
          {formatDisplayDate(startDate)} – {formatDisplayDate(endDate)}
        </span>
      </p>

      <div className="stats-grid">
        <article className="stat-card highlight">
          <h3>Samlet nedbør</h3>
          <p className="stat-value">{formatMm(total)}</p>
        </article>

        <article className="stat-card">
          <h3>Dager med nedbør</h3>
          <p className="stat-value">
            {wetDays} <span className="stat-unit">av {dayCount}</span>
          </p>
        </article>

        <article className="stat-card">
          <h3>Mest nedbør på én dag</h3>
          {maxDay ? (
            <>
              <p className="stat-value">{formatMm(maxDay.precipitation)}</p>
              <p className="stat-detail">{formatDisplayDate(maxDay.date)}</p>
            </>
          ) : (
            <p className="stat-value">–</p>
          )}
        </article>
      </div>
    </section>
  );
}
