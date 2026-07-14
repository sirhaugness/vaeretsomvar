import { useEffect, useId, useRef, useState, type KeyboardEvent } from 'react';
import { useDebounce } from '../hooks/useDebounce';
import { searchLocations, GeocodingError } from '../services/geocoding';
import type { Location } from '../types';

type LocationSearchProps = {
  selectedLocation: Location | null;
  onSelectLocation: (location: Location) => void;
};

export function formatLocationLabel(location: Location): string {
  const parts = [location.name];
  if (location.admin1) parts.push(location.admin1);
  parts.push(location.country);
  return parts.join(', ');
}

export function LocationSearch({
  selectedLocation,
  onSelectLocation,
}: LocationSearchProps) {
  return (
    <section className="location-search" aria-label="Stedsøk">
      <label htmlFor="location-search-input" className="search-label">
        Søk etter sted
      </label>
      <SearchInput onSelectLocation={onSelectLocation} />
      {selectedLocation && (
        <p className="selected-location">
          Valgt sted: <strong>{formatLocationLabel(selectedLocation)}</strong>
        </p>
      )}
    </section>
  );
}

type SearchInputProps = {
  onSelectLocation: (location: Location) => void;
};

function SearchInput({ onSelectLocation }: SearchInputProps) {
  const listboxId = useId();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Location[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);
  const debouncedQuery = useDebounce(query, 300);

  useEffect(() => {
    if (debouncedQuery.trim().length < 2) {
      setResults([]);
      setError(null);
      setIsLoading(false);
      setIsOpen(false);
      return;
    }

    let cancelled = false;
    setIsLoading(true);
    setError(null);

    searchLocations(debouncedQuery.trim())
      .then((locations) => {
        if (cancelled) return;
        setResults(locations);
        setIsOpen(true);
        setActiveIndex(-1);
        if (locations.length === 0) {
          setError('Ingen steder funnet. Prøv et annet søkeord.');
        }
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        setResults([]);
        setIsOpen(false);
        setError(
          err instanceof GeocodingError
            ? err.message
            : 'Noe gikk galt under stedsøk.',
        );
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [debouncedQuery]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  function selectLocation(location: Location) {
    onSelectLocation(location);
    setQuery('');
    setResults([]);
    setIsOpen(false);
    setError(null);
    setActiveIndex(-1);
  }

  function handleKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (!isOpen || results.length === 0) return;

    if (event.key === 'ArrowDown') {
      event.preventDefault();
      setActiveIndex((prev) => (prev + 1) % results.length);
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      setActiveIndex((prev) => (prev <= 0 ? results.length - 1 : prev - 1));
    } else if (event.key === 'Enter' && activeIndex >= 0) {
      event.preventDefault();
      selectLocation(results[activeIndex]);
    } else if (event.key === 'Escape') {
      setIsOpen(false);
      setActiveIndex(-1);
    }
  }

  return (
    <div className="search-input-wrapper" ref={containerRef}>
      <input
        id="location-search-input"
        type="search"
        className="search-input"
        placeholder="Skriv minst to tegn, f.eks. Bergen"
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        onFocus={() => results.length > 0 && setIsOpen(true)}
        onKeyDown={handleKeyDown}
        role="combobox"
        aria-expanded={isOpen}
        aria-controls={listboxId}
        aria-autocomplete="list"
        autoComplete="off"
      />
      {isLoading && <span className="search-status">Søker…</span>}
      {isOpen && results.length > 0 && (
        <ul id={listboxId} className="search-results" role="listbox">
          {results.map((location, index) => (
            <li key={`${location.latitude}-${location.longitude}-${location.name}`}>
              <button
                type="button"
                role="option"
                aria-selected={index === activeIndex}
                className={index === activeIndex ? 'active' : undefined}
                onClick={() => selectLocation(location)}
              >
                {formatLocationLabel(location)}
              </button>
            </li>
          ))}
        </ul>
      )}
      {error && !isLoading && <p className="search-message error">{error}</p>}
    </div>
  );
}
