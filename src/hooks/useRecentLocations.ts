import { useCallback, useState } from 'react';
import type { Location } from '../types';
import { loadRecentLocations, saveRecentLocation } from '../utils/storage';

export function useRecentLocations() {
  const [recentLocations, setRecentLocations] = useState<Location[]>(() =>
    loadRecentLocations(),
  );

  const addRecentLocation = useCallback((location: Location) => {
    const updated = saveRecentLocation(location);
    setRecentLocations(updated);
    return updated;
  }, []);

  return { recentLocations, addRecentLocation };
}
