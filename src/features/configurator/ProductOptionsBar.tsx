import { ChevronDown, Minus, Plus } from 'lucide-react';
import { useConfiguratorStore } from '../../engine/store';
import { ColorSwatchPicker } from '../../components/ColorSwatchPicker';

export const ProductOptionsBar = () => {
  const { product, configuration, setVariant, setFrameColor, setQuantity } = useConfiguratorStore();

  return (
    <div className="flex flex-wrap items-center gap-5 rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm">
      <label className="text-sm font-semibold text-zinc-700">
        <span className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-zinc-400">Size</span>
        <div className="relative">
          <select
            value={configuration.variantId}
            onChange={(e) => setVariant(e.target.value)}
            className="appearance-none rounded-lg border border-zinc-300 bg-white py-2 pl-3 pr-9 text-sm font-medium text-zinc-800 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/25"
          >
            {product.variants.map((v) => (
              <option key={v.id} value={v.id}>
                {v.label} {v.priceModifier ? `(+$${v.priceModifier})` : ''}
              </option>
            ))}
          </select>
          <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
        </div>
      </label>

      {product.frameColorOptions && (
        <div>
          <span className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-zinc-400">Frame</span>
          <ColorSwatchPicker
            value={product.frameColorOptions.find((f) => f.id === configuration.frameColorId)?.hex ?? '#111318'}
            presets={product.frameColorOptions.map((f) => f.hex)}
            onChange={(hex) => {
              const match = product.frameColorOptions?.find((f) => f.hex === hex);
              if (match) setFrameColor(match.id);
            }}
          />
        </div>
      )}

      <div className="ml-auto">
        <span className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-zinc-400">Quantity</span>
        <div className="inline-flex items-center rounded-lg border border-zinc-300">
          <button
            type="button"
            onClick={() => setQuantity(configuration.quantity - 1)}
            disabled={configuration.quantity <= 1}
            className="grid h-9 w-9 place-items-center text-zinc-500 transition hover:bg-zinc-50 disabled:opacity-30"
          >
            <Minus className="h-3.5 w-3.5" />
          </button>
          <input
            type="number"
            min={1}
            value={configuration.quantity}
            onChange={(e) => setQuantity(Number(e.target.value))}
            className="h-9 w-12 border-x border-zinc-300 text-center text-sm font-medium outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
          />
          <button
            type="button"
            onClick={() => setQuantity(configuration.quantity + 1)}
            className="grid h-9 w-9 place-items-center text-zinc-500 transition hover:bg-zinc-50"
          >
            <Plus className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
