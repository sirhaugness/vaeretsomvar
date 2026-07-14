import type { PlantCategory, WateringStatus } from '../types';
import { GlassPanel } from './GlassPanel';
import { WateringStatusCard } from './WateringStatusCard';

type WateringSectionProps = {
  statuses: WateringStatus[];
  onRegisterWatering: (category: PlantCategory) => void;
};

export function WateringSection({
  statuses,
  onRegisterWatering,
}: WateringSectionProps) {
  return (
    <GlassPanel as="section" className="watering-section">
      <h2 className="section-heading">Vanningsbehov</h2>

      <div className="watering-cards">
        {statuses.map((status) => (
          <WateringStatusCard
            key={status.category}
            status={status}
            onRegisterWatering={onRegisterWatering}
          />
        ))}
      </div>

      <p className="watering-disclaimer">
        Vanningsbehovet er et estimat basert på værdata og skal brukes som
        praktisk veiledning.
      </p>
    </GlassPanel>
  );
}
