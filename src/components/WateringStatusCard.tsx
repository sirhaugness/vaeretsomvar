import type { WateringStatus } from '../types';
import { getLevelColor } from '../utils/dryness';

type WateringStatusCardProps = {
  status: WateringStatus;
};

const CATEGORY_ICONS: Record<WateringStatus['category'], string> = {
  largePots: '🪴',
  groundPlants: '🌸',
  grass: '🌿',
};

export function WateringStatusCard({ status }: WateringStatusCardProps) {
  const color = getLevelColor(status.level);
  const fillPercent = Math.round(status.score);

  return (
    <article className="watering-card">
      <div className="watering-card-header">
        <span className="watering-icon" aria-hidden="true">
          {CATEGORY_ICONS[status.category]}
        </span>
        <div className="watering-card-titles">
          <h3>{status.label}</h3>
          <p className="watering-description">{status.description}</p>
        </div>
        <span
          className="watering-level-badge"
          style={{ backgroundColor: color }}
        >
          {status.levelLabel}
        </span>
      </div>

      <div className="watering-bar" role="meter" aria-valuenow={fillPercent} aria-valuemin={0} aria-valuemax={100} aria-label={`${status.label}: ${status.levelLabel}`}>
        <div
          className="watering-bar-fill"
          style={{ width: `${fillPercent}%`, backgroundColor: color }}
        />
      </div>

      <p className="watering-recommendation">{status.recommendation}</p>
    </article>
  );
}
