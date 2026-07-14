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
