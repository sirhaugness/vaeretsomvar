import type {
  DailyWeather,
  PlantCategory,
  WateringLevel,
  WateringStatus,
} from '../types';

const SENSITIVITY: Record<PlantCategory, number> = {
  largePots: 1.25,
  groundPlants: 1.0,
  grass: 0.75,
};

const CATEGORY_META: Record<
  PlantCategory,
  { label: string; description: string }
> = {
  largePots: {
    label: 'Store potteplanter',
    description: 'Tåler lite uttørking. Bør sjekkes ofte.',
  },
  groundPlants: {
    label: 'Planter og blomster i jord',
    description:
      'Jorden holder bedre på fuktighet, men det begynner å bli tørt.',
  },
  grass: {
    label: 'Gress',
    description:
      'Gress klarer seg relativt godt, men vedvarende tørke gir stress.',
  },
};

const LEVEL_LABELS: Record<WateringLevel, string> = {
  good: 'Bra',
  watch: 'Følg med',
  soon: 'Bør vannes snart',
  critical: 'Kritisk tørt',
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

function buildRecommendation(
  category: PlantCategory,
  level: WateringLevel,
): string {
  switch (level) {
    case 'critical':
      return category === 'largePots'
        ? 'Kritisk tørt – bør vannes i dag.'
        : category === 'groundPlants'
          ? 'Kritisk tørt – vann snart, særlig om det er sol og varme.'
          : 'Kritisk tørt – gresset trenger vann.';
    case 'soon':
      return category === 'largePots'
        ? 'Bør vannes snart – pottene tørker raskt ut.'
        : category === 'groundPlants'
          ? 'Bør vannes snart – særlig hvis sol og varme fortsetter.'
          : 'Bør vannes snart – følg med de neste dagene.';
    case 'watch':
      return category === 'largePots'
        ? 'Følg med – sjekk jordfuktigheten daglig.'
        : category === 'groundPlants'
          ? 'Følg med – ingen akutt handling nødvendig ennå.'
          : 'Følg med – gresset klarer seg, men hold øye med været.';
    case 'good':
      return category === 'largePots'
        ? 'God fuktighet – ingen vanning nødvendig nå.'
        : category === 'groundPlants'
          ? 'God fuktighet – jorden holder på vannet.'
          : 'God fuktighet – gresset har det bra.';
  }
}

export function calculateWateringStatus(
  days: DailyWeather[],
  category: PlantCategory,
): WateringStatus {
  const baseScore = calculateBaseDrynessScore(days);
  const score = clamp(baseScore * SENSITIVITY[category], 0, 100);
  const level = scoreToLevel(score);
  const meta = CATEGORY_META[category];

  return {
    category,
    label: meta.label,
    score,
    level,
    levelLabel: LEVEL_LABELS[level],
    recommendation: buildRecommendation(category, level),
    description: meta.description,
  };
}

export function calculateAllWateringStatuses(
  days: DailyWeather[],
): WateringStatus[] {
  const categories: PlantCategory[] = [
    'largePots',
    'groundPlants',
    'grass',
  ];
  return categories.map((category) =>
    calculateWateringStatus(days, category),
  );
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
