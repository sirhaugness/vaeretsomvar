import type { GeocodingResult, Location } from '../types';

const GEOCODING_URL = 'https://geocoding-api.open-meteo.com/v1/search';

export class GeocodingError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'GeocodingError';
  }
}

type GeocodingApiResponse = {
  results?: GeocodingResult[];
};

export async function searchLocations(query: string): Promise<Location[]> {
  const params = new URLSearchParams({
    name: query,
    count: '5',
    language: 'no',
    format: 'json',
  });

  let response: Response;
  try {
    response = await fetch(`${GEOCODING_URL}?${params}`);
  } catch {
    throw new GeocodingError('Kunne ikke koble til stedsøk. Sjekk nettverket ditt.');
  }

  if (!response.ok) {
    throw new GeocodingError('Stedsøk feilet. Prøv igjen om litt.');
  }

  const data = (await response.json()) as GeocodingApiResponse;

  if (!data.results || data.results.length === 0) {
    return [];
  }

  return data.results.map((result) => ({
    name: result.name,
    latitude: result.latitude,
    longitude: result.longitude,
    country: result.country,
    ...(result.admin1 ? { admin1: result.admin1 } : {}),
  }));
}
