import type { DailyPrecipitation } from '../types';
import { addDays, formatDateISO, parseDateISO } from '../utils/dates';

const FORECAST_URL = 'https://api.open-meteo.com/v1/forecast';
const ARCHIVE_URL = 'https://archive-api.open-meteo.com/v1/archive';

export class WeatherError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'WeatherError';
  }
}

type WeatherApiResponse = {
  daily?: {
    time?: string[];
    precipitation_sum?: number[];
  };
};

type FetchParams = {
  latitude: number;
  longitude: number;
  startDate: string;
  endDate: string;
};

function validateApiResponse(data: WeatherApiResponse): DailyPrecipitation[] {
  const times = data.daily?.time;
  const precipitation = data.daily?.precipitation_sum;

  if (!times || !precipitation) {
    throw new WeatherError('Værdata mangler i svaret fra API-et.');
  }

  if (times.length !== precipitation.length) {
    throw new WeatherError('Ugyldig værdata: antall datoer og verdier stemmer ikke.');
  }

  return times.map((date, index) => ({
    date,
    precipitation: precipitation[index] ?? 0,
  }));
}

async function fetchFromApi(
  baseUrl: string,
  params: FetchParams,
): Promise<DailyPrecipitation[]> {
  const searchParams = new URLSearchParams({
    latitude: String(params.latitude),
    longitude: String(params.longitude),
    daily: 'precipitation_sum',
    timezone: 'auto',
    start_date: params.startDate,
    end_date: params.endDate,
  });

  let response: Response;
  try {
    response = await fetch(`${baseUrl}?${searchParams}`);
  } catch {
    throw new WeatherError('Kunne ikke hente værdata. Sjekk nettverket ditt.');
  }

  if (!response.ok) {
    throw new WeatherError('Kunne ikke hente værdata for valgt periode.');
  }

  const data = (await response.json()) as WeatherApiResponse;
  return validateApiResponse(data);
}

function fetchForecast(params: FetchParams): Promise<DailyPrecipitation[]> {
  return fetchFromApi(FORECAST_URL, params);
}

function fetchArchive(params: FetchParams): Promise<DailyPrecipitation[]> {
  return fetchFromApi(ARCHIVE_URL, params);
}

function mergeAndSortDays(
  chunks: DailyPrecipitation[][],
): DailyPrecipitation[] {
  const byDate = new Map<string, number>();

  for (const chunk of chunks) {
    for (const day of chunk) {
      byDate.set(day.date, day.precipitation);
    }
  }

  return Array.from(byDate.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, precipitation]) => ({ date, precipitation }));
}

export async function fetchPrecipitation(
  latitude: number,
  longitude: number,
  startDate: string,
  endDate: string,
  forecastCutoffDate: string,
): Promise<DailyPrecipitation[]> {
  const start = parseDateISO(startDate);
  const end = parseDateISO(endDate);
  const cutoff = parseDateISO(forecastCutoffDate);

  if (end < cutoff) {
    return fetchArchive({ latitude, longitude, startDate, endDate });
  }

  if (start >= cutoff) {
    return fetchForecast({ latitude, longitude, startDate, endDate });
  }

  const archiveEndDate = formatDateISO(addDays(cutoff, -1));
  const forecastStartDate = formatDateISO(cutoff);

  const [archiveData, forecastData] = await Promise.all([
    fetchArchive({
      latitude,
      longitude,
      startDate,
      endDate: archiveEndDate,
    }),
    fetchForecast({
      latitude,
      longitude,
      startDate: forecastStartDate,
      endDate,
    }),
  ]);

  return mergeAndSortDays([archiveData, forecastData]);
}

export function summarizePrecipitation(
  days: DailyPrecipitation[],
): {
  total: number;
  wetDays: number;
  maxDay: DailyPrecipitation | null;
} {
  if (days.length === 0) {
    return { total: 0, wetDays: 0, maxDay: null };
  }

  let total = 0;
  let wetDays = 0;
  let maxDay = days[0];

  for (const day of days) {
    total += day.precipitation;
    if (day.precipitation > 0) wetDays += 1;
    if (day.precipitation > maxDay.precipitation) maxDay = day;
  }

  return { total, wetDays, maxDay };
}
