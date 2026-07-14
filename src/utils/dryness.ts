import type {
  DailyWeather,
  PlantCategory,
  WateringLevel,
  WateringLog,
  WateringStatus,
} from '../types';
import { formatDateISO, getToday, parseDateISO } from './dates';

const SENSITIVITY: Record<PlantCategory, number> = {
  largePots: 1.25,
  groundPlants: 1.0,
  grass: 0.75,
};

const CATEGORY_LABELS: Record<PlantCategory, string> = {
  largePots: 'Store potteplanter',
  groundPlants: 'Planter og blomster i jord',
  grass: 'Gress',
};

const LEVEL_LABELS: Record<WateringLevel, string> = {
  good: 'Bra',
  watch: 'Følg med',
  soon: 'Bør vannes snart',
  critical: 'Kritisk tørt',
};

/** How many dryness points a good watering removes, by days since watering. */
const WATERING_EFFECT: Record<PlantCategory, number[]> = {
  largePots: [60, 42, 28, 16, 8, 3],
  groundPlants: [55, 40, 28, 18, 10, 4],
  grass: [50, 38, 28, 20, 12, 5],
};

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function scoreToLevel(score: number): WateringLevel {
  if (score <= 24) return 'good';
  if (score <= 49) return 'watch';
  if (score <= 74) return 'soon';
  return 'critical';
}

function daysSinceWatering(wateredDate: string): number {
  const watered = parseDateISO(wateredDate);
  const today = getToday();
  const diffMs = today.getTime() - watered.getTime();
  return Math.max(0, Math.floor(diffMs / (1000 * 60 * 60 * 24)));
}

function getWateringReduction(
  category: PlantCategory,
  lastWateredDate: string | null,
): number {
  if (!lastWateredDate) return 0;

  const daysSince = daysSinceWatering(lastWateredDate);
  const effect = WATERING_EFFECT[category];
  return effect[Math.min(daysSince, effect.length - 1)] ?? 0;
}

/**
 * Estimates soil dryness from 0 (wet) to 100 (critically dry)
 * using precipitation, temperature, wind and consecutive dry days.
 */
export function calculateBaseDrynessScore(days: DailyWeather[]): number {
  if (days.length === 0) return 0;

  const recent7 = days.slice(-7);
  const recent14 = days.slice(-14);

  let score = 0;

  for (const day of recent7) {
    const rain = day.precipitation;

    if (rain < 1) {
      score += 8;
    } else if (rain < 5) {
      score += 3;
    } else {
      score -= Math.min(rain * 0.8, 12);
    }

    const temp = day.temperatureMax ?? 15;
    if (temp > 25) score += 6;
    else if (temp > 20) score += 4;
    else if (temp > 15) score += 2;

    const wind = day.windSpeedMax ?? 0;
    if (wind > 20) score += 3;
    else if (wind > 10) score += 1.5;
  }

  let consecutiveDry = 0;
  for (let i = recent7.length - 1; i >= 0; i--) {
    if (recent7[i].precipitation < 1) consecutiveDry++;
    else break;
  }
  score += consecutiveDry * 4;

  const totalRain14 = recent14.reduce((sum, d) => sum + d.precipitation, 0);
  if (totalRain14 < 5) score += 10;
  else if (totalRain14 < 15) score += 5;

  return clamp(score, 0, 100);
}

export function calculateWateringStatus(
  days: DailyWeather[],
  category: PlantCategory,
  wateringLog: WateringLog,
): WateringStatus {
  const baseScore = calculateBaseDrynessScore(days);
  const lastWateredDate = wateringLog[category];
  const wateringReduction = getWateringReduction(category, lastWateredDate);
  const score = clamp(
    baseScore * SENSITIVITY[category] - wateringReduction,
    0,
    100,
  );
  const level = scoreToLevel(score);

  return {
    category,
    label: CATEGORY_LABELS[category],
    score,
    level,
    levelLabel: LEVEL_LABELS[level],
    lastWateredDate,
  };
}

export function calculateAllWateringStatuses(
  days: DailyWeather[],
  wateringLog: WateringLog,
): WateringStatus[] {
  const categories: PlantCategory[] = [
    'largePots',
    'groundPlants',
    'grass',
  ];
  return categories.map((category) =>
    calculateWateringStatus(days, category, wateringLog),
  );
}

export function wasWateredToday(lastWateredDate: string | null): boolean {
  if (!lastWateredDate) return false;
  return lastWateredDate === formatDateISO(getToday());
}

export function getLevelColor(level: WateringLevel): string {
  switch (level) {
    case 'good':
      return 'var(--color-watering-good)';
    case 'watch':
      return 'var(--color-watering-watch)';
    case 'soon':
      return 'var(--color-watering-soon)';
    case 'critical':
      return 'var(--color-watering-critical)';
  }
}
