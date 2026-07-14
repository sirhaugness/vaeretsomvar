import { useCallback, useState } from 'react';
import type { PlantCategory, WateringLog } from '../types';
import { loadWateringLog, registerWateringToday } from '../utils/wateringStorage';

export function useWateringLog() {
  const [log, setLog] = useState<WateringLog>(loadWateringLog);

  const registerWatering = useCallback((category: PlantCategory) => {
    const updated = registerWateringToday(category);
    setLog(updated);
  }, []);

  return { wateringLog: log, registerWatering };
}
