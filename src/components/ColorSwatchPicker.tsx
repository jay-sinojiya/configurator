import { Check, Plus } from 'lucide-react';

interface ColorSwatchPickerProps {
  value: string;
  onChange: (hex: string) => void;
  presets?: string[];
}

const DEFAULT_PRESETS = ['#111318', '#ffffff', '#1d4ed8', '#dc2626', '#16a34a', '#f59e0b', '#7c3aed', '#0891b2'];

function isLight(hex: string): boolean {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return (r * 299 + g * 587 + b * 114) / 1000 > 165;
}

export const ColorSwatchPicker = ({ value, onChange, presets = DEFAULT_PRESETS }: ColorSwatchPickerProps) => {
  return (
    <div className="flex flex-wrap items-center gap-2">
      {presets.map((hex) => {
        const selected = value.toLowerCase() === hex.toLowerCase();
        return (
          <button
            key={hex}
            type="button"
            aria-label={`Set color ${hex}`}
            onClick={() => onChange(hex)}
            className="relative h-7 w-7 rounded-full ring-1 ring-inset ring-black/10 transition hover:scale-110"
            style={{
              backgroundColor: hex,
              outline: selected ? '2px solid #4f46e5' : 'none',
              outlineOffset: 2,
            }}
          >
            {selected && (
              <Check className="absolute inset-0 m-auto h-3.5 w-3.5" style={{ color: isLight(hex) ? '#18181b' : '#ffffff' }} />
            )}
          </button>
        );
      })}
      <label className="relative grid h-7 w-7 cursor-pointer place-items-center overflow-hidden rounded-full border border-dashed border-zinc-300 text-zinc-400 transition hover:border-zinc-400 hover:text-zinc-600">
        <Plus className="h-3.5 w-3.5" />
        <input type="color" value={value} onChange={(e) => onChange(e.target.value)} className="absolute inset-0 cursor-pointer opacity-0" />
      </label>
    </div>
  );
};
