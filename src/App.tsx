import { useCallback, useEffect, useMemo, useState } from 'react';
import { LocationSearch } from './components/LocationSearch';
import { PeriodSelector } from './components/PeriodSelector';
import { PrecipitationChart } from './components/PrecipitationChart';
import { PrecipitationStats } from './components/PrecipitationStats';
import { RecentLocations } from './components/RecentLocations';
import { WateringSection } from './components/WateringSection';
import { GlassPanel } from './components/GlassPanel';
import { OSLO_LOCATION } from './constants';
import { useRecentLocations } from './hooks/useRecentLocations';
import {
  fetchPrecipitation,
  fetchRecentWeather,
  summarizePrecipitation,
  WeatherError,
} from './services/weather';
import type { DailyPrecipitation, DailyWeather, Location, PeriodSelection } from './types';
import { calculateAllWateringStatuses } from './utils/dryness';
import {
  getDefaultPeriod,
  getForecastCutoffDate,
  validateCustomPeriod,
} from './utils/dates';
import { loadRecentLocations } from './utils/storage';
import './App.css';

function getInitialLocation(): Location {
  const recent = loadRecentLocations();
  if (recent.length > 0) return recent[0];
  return { ...OSLO_LOCATION };
}

export default function App() {
  const { recentLocations, addRecentLocation } = useRecentLocations();
  const [selectedLocation, setSelectedLocation] = useState<Location>(getInitialLocation);
  const [period, setPeriod] = useState<PeriodSelection>(getDefaultPeriod);
  const [days, setDays] = useState<DailyPrecipitation[]>([]);
  const [recentWeather, setRecentWeather] = useState<DailyWeather[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const periodIsValid =
    period.preset !== 'custom' ||
    validateCustomPeriod(period.startDate, period.endDate).valid;

  const handleSelectLocation = useCallback(
    (location: Location) => {
      setSelectedLocation(location);
      addRecentLocation(location);
    },
    [addRecentLocation],
  );

  useEffect(() => {
    if (!periodIsValid) {
      setIsLoading(false);
      setError(null);
      return;
    }

    let cancelled = false;
    setIsLoading(true);
    setError(null);

    const cutoff = getForecastCutoffDate();

    Promise.all([
      fetchPrecipitation(
        selectedLocation.latitude,
        selectedLocation.longitude,
        period.startDate,
        period.endDate,
        cutoff,
      ),
      fetchRecentWeather(
        selectedLocation.latitude,
        selectedLocation.longitude,
        cutoff,
      ),
    ])
      .then(([precipitationDays, weatherDays]) => {
        if (cancelled) return;
        setDays(precipitationDays);
        setRecentWeather(weatherDays);
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        setDays([]);
        setRecentWeather([]);
        setError(
          err instanceof WeatherError
            ? err.message
            : 'Noe gikk galt under henting av værdata.',
        );
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [selectedLocation, period, periodIsValid]);

  const summary = summarizePrecipitation(days);
  const wateringStatuses = useMemo(
    () => calculateAllWateringStatuses(recentWeather),
    [recentWeather],
  );

  return (
    <div className="app">
      <div className="sky-background" aria-hidden="true">
        <div className="cloud cloud-1" />
        <div className="cloud cloud-2" />
        <div className="cloud cloud-3" />
        <div className="cloud cloud-4" />
      </div>

      <header className="app-header">
        <h1>Været som var</h1>
        <p className="app-subtitle">
          Se historisk nedbør og få en pekepinn på vanningsbehovet.
        </p>
      </header>

      <main className="app-main">
        <GlassPanel className="controls-panel">
          <LocationSearch
            selectedLocation={selectedLocation}
            onSelectLocation={handleSelectLocation}
          />

          <RecentLocations
            locations={recentLocations}
            selectedLocation={selectedLocation}
            onSelectLocation={handleSelectLocation}
          />

          <PeriodSelector
            period={period}
            validationError={null}
            onChange={setPeriod}
          />
        </GlassPanel>

        {isLoading && (
          <p className="status-message loading" role="status">
            Henter værdata…
          </p>
        )}

        {error && !isLoading && (
          <p className="status-message error" role="alert">
            {error}
          </p>
        )}

        {!isLoading && !error && periodIsValid && (
          <>
            <WateringSection statuses={wateringStatuses} />
            <PrecipitationStats
              location={selectedLocation}
              startDate={period.startDate}
              endDate={period.endDate}
              total={summary.total}
            />
            <PrecipitationChart days={days} />
          </>
        )}
      </main>

      <footer className="app-footer">
        <p>
          Værdata fra{' '}
          <a
            href="https://open-meteo.com/"
            target="_blank"
            rel="noopener noreferrer"
          >
            Open-Meteo
          </a>
        </p>
      </footer>
    </div>
  );
}
