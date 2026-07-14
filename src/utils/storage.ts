import { RECENT_LOCATIONS_KEY, MAX_RECENT_LOCATIONS } from '../constants';
import type { Location } from '../types';

function isValidLocation(value: unknown): value is Location {
  if (!value || typeof value !== 'object') return false;
  const obj = value as Record<string, unknown>;
  return (
    typeof obj.name === 'string' &&
    typeof obj.latitude === 'number' &&
    typeof obj.longitude === 'number' &&
    typeof obj.country === 'string' &&
    (obj.admin1 === undefined || typeof obj.admin1 === 'string')
  );
}

export function loadRecentLocations(): Location[] {
  try {
    const raw = localStorage.getItem(RECENT_LOCATIONS_KEY);
    if (!raw) return [];

    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];

    return parsed.filter(isValidLocation).slice(0, MAX_RECENT_LOCATIONS);
  } catch {
    return [];
  }
}

export function locationsMatch(a: Location, b: Location): boolean {
  const latMatch = Math.abs(a.latitude - b.latitude) < 0.0001;
  const lonMatch = Math.abs(a.longitude - b.longitude) < 0.0001;
  return latMatch && lonMatch;
}

export function saveRecentLocation(location: Location): Location[] {
  const existing = loadRecentLocations();
  const withoutDuplicate = existing.filter((item) => !locationsMatch(item, location));
  const updated = [location, ...withoutDuplicate].slice(0, MAX_RECENT_LOCATIONS);

  try {
    localStorage.setItem(RECENT_LOCATIONS_KEY, JSON.stringify(updated));
  } catch {
    // localStorage may be unavailable or full
  }

  return updated;
}
