import { PERIOD_PRESETS } from '../constants';
import type { PeriodSelection } from '../types';
import {
  formatDateISO,
  getPresetPeriod,
  getYesterday,
  validateCustomPeriod,
} from '../utils/dates';

type PeriodSelectorProps = {
  period: PeriodSelection;
  validationError: string | null;
  onChange: (period: PeriodSelection) => void;
};

export function PeriodSelector({
  period,
  validationError,
  onChange,
}: PeriodSelectorProps) {
  const yesterday = formatDateISO(getYesterday());

  function handlePresetClick(days: 7 | 14 | 30 | 90) {
    onChange(getPresetPeriod(days));
  }

  function handleCustomClick() {
    onChange({
      preset: 'custom',
      startDate: period.startDate,
      endDate: period.endDate,
    });
  }

  function handleStartChange(value: string) {
    onChange({
      preset: 'custom',
      startDate: value,
      endDate: period.endDate,
    });
  }

  function handleEndChange(value: string) {
    onChange({
      preset: 'custom',
      startDate: period.startDate,
      endDate: value,
    });
  }

  const customValidation =
    period.preset === 'custom'
      ? validateCustomPeriod(period.startDate, period.endDate)
      : { valid: true as const };

  const errorMessage =
    validationError ??
    (customValidation.valid ? null : customValidation.message);

  return (
    <section className="period-selector" aria-label="Periodevalg">
      <h2 className="section-title">Periode</h2>
      <div className="period-buttons" role="group" aria-label="Hurtigvalg for periode">
        {PERIOD_PRESETS.map((preset) => (
          <button
            key={preset.value}
            type="button"
            className={`period-button${period.preset === preset.value ? ' active' : ''}`}
            onClick={() => handlePresetClick(preset.value)}
          >
            {preset.label}
          </button>
        ))}
        <button
          type="button"
          className={`period-button${period.preset === 'custom' ? ' active' : ''}`}
          onClick={handleCustomClick}
        >
          Egendefinert periode
        </button>
      </div>

      {period.preset === 'custom' && (
        <div className="custom-period">
          <label className="date-field">
            Fra
            <input
              type="date"
              value={period.startDate}
              max={period.endDate || yesterday}
              onChange={(event) => handleStartChange(event.target.value)}
            />
          </label>
          <label className="date-field">
            Til
            <input
              type="date"
              value={period.endDate}
              min={period.startDate}
              max={yesterday}
              onChange={(event) => handleEndChange(event.target.value)}
            />
          </label>
        </div>
      )}

      {errorMessage && <p className="period-error">{errorMessage}</p>}
    </section>
  );
}
