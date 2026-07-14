import type { PlantCategory, WateringStatus } from '../types';
import { formatDisplayDate } from '../utils/dates';
import { getLevelColor, wasWateredToday } from '../utils/dryness';

type WateringStatusCardProps = {
  status: WateringStatus;
  onRegisterWatering: (category: PlantCategory) => void;
};

const CATEGORY_ICONS: Record<PlantCategory, string> = {
  largePots: '🪴',
  groundPlants: '🌸',
  grass: '🌿',
};

export function WateringStatusCard({
  status,
  onRegisterWatering,
}: WateringStatusCardProps) {
  const color = getLevelColor(status.level);
  const fillPercent = Math.round(status.score);
  const wateredToday = wasWateredToday(status.lastWateredDate);

  return (
    <article className="watering-card">
      <div className="watering-card-header">
        <span className="watering-icon" aria-hidden="true">
          {CATEGORY_ICONS[status.category]}
        </span>
        <h3>{status.label}</h3>
        <span
          className="watering-level-badge"
          style={{ backgroundColor: color }}
        >
          {status.levelLabel}
        </span>
      </div>

      <div
        className="watering-bar"
        role="meter"
        aria-valuenow={fillPercent}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={`${status.label}: ${status.levelLabel}`}
      >
        <div
          className="watering-bar-fill"
          style={{ width: `${fillPercent}%`, backgroundColor: color }}
        />
      </div>

      <div className="watering-card-footer">
        {status.lastWateredDate ? (
          <p className="watering-date">
            Vannet: {formatDisplayDate(status.lastWateredDate)}
          </p>
        ) : (
          <p className="watering-date watering-date-empty">Ikke registrert</p>
        )}
        <button
          type="button"
          className="watering-register-btn"
          onClick={() => onRegisterWatering(status.category)}
        >
          {wateredToday ? 'Vannet i dag' : 'Registrer vanning'}
        </button>
      </div>
    </article>
  );
}
