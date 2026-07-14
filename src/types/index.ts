export type Location = {
  name: string;
  latitude: number;
  longitude: number;
  country: string;
  admin1?: string;
};

export type DailyPrecipitation = {
  date: string;
  precipitation: number;
};

export type DailyWeather = {
  date: string;
  precipitation: number;
  temperatureMax: number | null;
  windSpeedMax: number | null;
};

export type PeriodPreset = 7 | 14 | 30 | 90 | 'custom';

export type PeriodSelection = {
  preset: PeriodPreset;
  startDate: string;
  endDate: string;
};

export type PrecipitationSummary = {
  total: number;
  wetDays: number;
  maxDay: DailyPrecipitation | null;
  days: DailyPrecipitation[];
};

export type GeocodingResult = {
  id: number;
  name: string;
  latitude: number;
  longitude: number;
  country: string;
  admin1?: string;
};

export type WateringLevel = 'good' | 'watch' | 'soon' | 'critical';

export type PlantCategory = 'largePots' | 'groundPlants' | 'grass';

export type WateringLog = Record<PlantCategory, string | null>;

export type WateringStatus = {
  category: PlantCategory;
  label: string;
  score: number;
  level: WateringLevel;
  levelLabel: string;
  lastWateredDate: string | null;
};
