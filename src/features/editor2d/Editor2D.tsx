import { ChevronDown, MousePointerClick, Type } from 'lucide-react';
import { useConfiguratorStore } from '../../engine/store';
import { LayoutCanvas } from './LayoutCanvas';
import { ImageUploadButton } from './ImageUploadButton';
import { ColorSwatchPicker } from '../../components/ColorSwatchPicker';

export const Editor2D = () => {
  const { product, configuration, activeZoneId, setActiveZone, setZoneColor, addTextElement, addImageElement, selectElement } =
    useConfiguratorStore();

  const activeZone = product.zones.find((z) => z.id === activeZoneId) ?? product.zones[0];

  return (
    <div className="space-y-3 rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm">
      <div className="flex flex-wrap items-center gap-2">
        <div className="relative">
          <select
            value={activeZoneId}
            onChange={(e) => setActiveZone(e.target.value)}
            className="appearance-none rounded-lg border border-zinc-300 bg-white py-2 pl-3 pr-9 text-sm font-medium text-zinc-800 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/25"
          >
            {product.zones.map((zone) => (
              <option key={zone.id} value={zone.id}>
                {zone.label}
              </option>
            ))}
          </select>
          <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
        </div>

        <button
          type="button"
          onClick={() => selectElement(addTextElement(activeZoneId))}
          className="inline-flex items-center gap-1.5 rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm font-medium text-zinc-700 transition hover:border-zinc-400 hover:bg-zinc-50"
        >
          <Type className="h-4 w-4" />
          Add text
        </button>

        <ImageUploadButton onUpload={(dataUrl, fileName) => selectElement(addImageElement(activeZoneId, dataUrl, fileName))} />

        {activeZone.colorable && (
          <div className="ml-auto flex items-center gap-2.5">
            <span className="text-xs font-medium text-zinc-500">Panel color</span>
            <ColorSwatchPicker value={configuration.zoneColors[activeZone.id] ?? activeZone.defaultColor} onChange={(hex) => setZoneColor(activeZone.id, hex)} />
          </div>
        )}
      </div>

      <LayoutCanvas product={product} configuration={configuration} />

      <p className="flex items-center gap-1.5 text-xs text-zinc-400">
        <MousePointerClick className="h-3.5 w-3.5 shrink-0" />
        Click a panel to select it, then add text or an image. Drag to reposition, use the corner handle to resize.
      </p>
    </div>
  );
};
