import { FORECAST_HISTORY_DAYS, MAX_PERIOD_YEARS } from '../constants';
import type { PeriodSelection } from '../types';

export function formatDateISO(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function parseDateISO(value: string): Date {
  const [year, month, day] = value.split('-').map(Number);
  return new Date(year, month - 1, day);
}

export function getYesterday(): Date {
  const date = new Date();
  date.setHours(0, 0, 0, 0);
  date.setDate(date.getDate() - 1);
  return date;
}

export function getToday(): Date {
  const date = new Date();
  date.setHours(0, 0, 0, 0);
  return date;
}

export function subtractDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() - days);
  return result;
}

export function addDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

export function getPresetPeriod(days: number): PeriodSelection {
  const endDate = getYesterday();
  const startDate = subtractDays(endDate, days - 1);
  return {
    preset: days as PeriodSelection['preset'],
    startDate: formatDateISO(startDate),
    endDate: formatDateISO(endDate),
  };
}

export function getDefaultPeriod(): PeriodSelection {
  return getPresetPeriod(30);
}

export function formatDisplayDate(isoDate: string): string {
  const date = parseDateISO(isoDate);
  return date.toLocaleDateString('nb-NO', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

export function formatShortDate(isoDate: string): string {
  const date = parseDateISO(isoDate);
  return date.toLocaleDateString('nb-NO', {
    day: 'numeric',
    month: 'short',
  });
}

export function daysBetweenInclusive(startDate: string, endDate: string): number {
  const start = parseDateISO(startDate);
  const end = parseDateISO(endDate);
  const diffMs = end.getTime() - start.getTime();
  return Math.floor(diffMs / (1000 * 60 * 60 * 24)) + 1;
}

export type PeriodValidationResult =
  | { valid: true }
  | { valid: false; message: string };

export function validateCustomPeriod(
  startDate: string,
  endDate: string,
): PeriodValidationResult {
  if (!startDate || !endDate) {
    return { valid: false, message: 'Velg både fra-dato og til-dato.' };
  }

  const start = parseDateISO(startDate);
  const end = parseDateISO(endDate);
  const yesterday = getYesterday();

  if (start > end) {
    return { valid: false, message: 'Fra-dato kan ikke være etter til-dato.' };
  }

  if (end > yesterday) {
    return {
      valid: false,
      message: 'Til-dato kan ikke være senere enn gårsdagen.',
    };
  }

  const maxDays = MAX_PERIOD_YEARS * 365 + 1;
  const length = daysBetweenInclusive(startDate, endDate);

  if (length > maxDays) {
    return {
      valid: false,
      message: `Perioden kan ikke være lengre enn ${MAX_PERIOD_YEARS} år.`,
    };
  }

  return { valid: true };
}

export function getForecastCutoffDate(): string {
  const cutoff = subtractDays(getToday(), FORECAST_HISTORY_DAYS);
  return formatDateISO(cutoff);
}
