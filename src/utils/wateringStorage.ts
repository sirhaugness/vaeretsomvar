import { WATERING_LOG_KEY } from '../constants';
import type { PlantCategory, WateringLog } from '../types';
import { formatDateISO, getToday } from './dates';

const CATEGORIES: PlantCategory[] = ['largePots', 'groundPlants', 'grass'];

function emptyLog(): WateringLog {
  return {
    largePots: null,
    groundPlants: null,
    grass: null,
  };
}

function isValidLog(value: unknown): value is WateringLog {
  if (!value || typeof value !== 'object') return false;
  const obj = value as Record<string, unknown>;
  return CATEGORIES.every(
    (key) => obj[key] === null || typeof obj[key] === 'string',
  );
}

export function loadWateringLog(): WateringLog {
  try {
    const raw = localStorage.getItem(WATERING_LOG_KEY);
    if (!raw) return emptyLog();

    const parsed: unknown = JSON.parse(raw);
    if (!isValidLog(parsed)) return emptyLog();

    return { ...emptyLog(), ...parsed };
  } catch {
    return emptyLog();
  }
}

export function saveWateringDate(category: PlantCategory, date: string): WateringLog {
  const log = loadWateringLog();
  const updated = { ...log, [category]: date };

  try {
    localStorage.setItem(WATERING_LOG_KEY, JSON.stringify(updated));
  } catch {
    // localStorage may be unavailable or full
  }

  return updated;
}

export function registerWateringToday(category: PlantCategory): WateringLog {
  return saveWateringDate(category, formatDateISO(getToday()));
}
