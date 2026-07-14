import { formatLocationLabel } from './LocationSearch';
import type { Location } from '../types';

type RecentLocationsProps = {
  locations: Location[];
  selectedLocation: Location | null;
  onSelectLocation: (location: Location) => void;
};

export function RecentLocations({
  locations,
  selectedLocation,
  onSelectLocation,
}: RecentLocationsProps) {
  if (locations.length === 0) return null;

  return (
    <section className="recent-locations" aria-label="Siste steder">
      <h2 className="section-title">Siste steder</h2>
      <div className="recent-chips">
        {locations.map((location) => {
          const isSelected =
            selectedLocation !== null &&
            Math.abs(selectedLocation.latitude - location.latitude) < 0.0001 &&
            Math.abs(selectedLocation.longitude - location.longitude) < 0.0001;

          return (
            <button
              key={`${location.latitude}-${location.longitude}`}
              type="button"
              className={`chip${isSelected ? ' selected' : ''}`}
              onClick={() => onSelectLocation(location)}
            >
              {formatLocationLabel(location)}
            </button>
          );
        })}
      </div>
    </section>
  );
}
