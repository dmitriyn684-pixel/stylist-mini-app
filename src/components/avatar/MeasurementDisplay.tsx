import { RulerIcon } from '../ui/icons';
import type { BodyMeasurements } from '../../types/avatar';

const rows: { label: string; key: keyof BodyMeasurements }[] = [
  { label: 'Рост', key: 'height' },
  { label: 'Плечи', key: 'shoulderWidth' },
  { label: 'Грудь', key: 'bustCircumference' },
  { label: 'Талия', key: 'waistCircumference' },
  { label: 'Бёдра', key: 'hipCircumference' },
  { label: 'Длина ног', key: 'inseam' },
];

export function MeasurementDisplay({ measurements }: { measurements: BodyMeasurements }) {
  return (
    <div className="bg-card rounded-2xl shadow-card p-5">
      <p className="text-[13px] font-bold text-ink mb-3 flex items-center gap-1.5">
        <RulerIcon className="w-4 h-4 text-lavender" /> Твои мерки
      </p>
      <div className="grid grid-cols-2 gap-y-3 gap-x-4">
        {rows.map((r) => (
          <div key={r.key} className="flex justify-between">
            <span className="text-[13px] text-ink-soft">{r.label}</span>
            <span className="text-[13px] font-semibold text-ink">{measurements[r.key]} см</span>
          </div>
        ))}
      </div>
    </div>
  );
}
