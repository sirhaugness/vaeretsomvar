export const RECENT_LOCATIONS_KEY = 'weather-history-recent-locations-v1';
export const WATERING_LOG_KEY = 'weather-history-watering-log-v1';
export const MAX_RECENT_LOCATIONS = 3;
export const FORECAST_HISTORY_DAYS = 92;
export const MAX_PERIOD_YEARS = 5;
export const DEFAULT_PRESET_DAYS = 30;

export const OSLO_LOCATION = {
  name: 'Oslo',
  latitude: 59.9139,
  longitude: 10.7522,
  country: 'Norge',
} as const;

export const PERIOD_PRESETS: { label: string; value: 7 | 14 | 30 | 90 }[] = [
  { label: 'Siste 7 dager', value: 7 },
  { label: 'Siste 14 dager', value: 14 },
  { label: 'Siste 30 dager', value: 30 },
  { label: 'Siste 90 dager', value: 90 },
];
