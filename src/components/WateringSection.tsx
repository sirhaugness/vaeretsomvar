import type { WateringStatus } from '../types';
import { GlassPanel } from './GlassPanel';
import { WateringStatusCard } from './WateringStatusCard';

type WateringSectionProps = {
  statuses: WateringStatus[];
};

export function WateringSection({ statuses }: WateringSectionProps) {
  return (
    <GlassPanel as="section" className="watering-section">
      <h2 className="section-heading">Vanningsbehov</h2>
      <p className="section-subheading">Hvor tørt er det nå?</p>

      <div className="watering-cards">
        {statuses.map((status) => (
          <WateringStatusCard key={status.category} status={status} />
        ))}
      </div>

      <p className="watering-disclaimer">
        Vanningsbehovet er et estimat basert på værdata og skal brukes som
        praktisk veiledning.
      </p>
    </GlassPanel>
  );
}
