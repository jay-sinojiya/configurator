import { ImageIcon, Trash2, Type } from 'lucide-react';
import { useConfiguratorStore } from '../../engine/store';
import { ColorSwatchPicker } from '../../components/ColorSwatchPicker';

export const ElementInspector = () => {
  const { configuration, selectedElementId, updateElementContent, removeElement, selectElement } = useConfiguratorStore();
  const element = configuration.elements.find((e) => e.id === selectedElementId);

  if (!element) return null;

  return (
    <div className="space-y-3 rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between">
        <span className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-zinc-500">
          {element.content.type === 'text' ? <Type className="h-3.5 w-3.5" /> : <ImageIcon className="h-3.5 w-3.5" />}
          {element.content.type === 'text' ? 'Text element' : 'Image element'}
        </span>
        <button
          type="button"
          onClick={() => {
            removeElement(element.id);
            selectElement(null);
          }}
          className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium text-red-600 transition hover:bg-red-50"
        >
          <Trash2 className="h-3.5 w-3.5" />
          Delete
        </button>
      </div>

      {element.content.type === 'text' ? (
        <>
          <label className="block text-xs font-medium text-zinc-500">
            Text
            <input
              value={element.content.value}
              onChange={(e) => updateElementContent(element.id, { value: e.target.value })}
              className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/25"
            />
          </label>
          <label className="block text-xs font-medium text-zinc-500">
            Weight
            <select
              value={element.content.fontWeight}
              onChange={(e) => updateElementContent(element.id, { fontWeight: Number(e.target.value) as 400 | 600 | 700 })}
              className="mt-1 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/25"
            >
              <option value={400}>Regular</option>
              <option value={600}>Semibold</option>
              <option value={700}>Bold</option>
            </select>
          </label>
          <div>
            <span className="mb-1.5 block text-xs font-medium text-zinc-500">Color</span>
            <ColorSwatchPicker value={element.content.color} onChange={(hex) => updateElementContent(element.id, { color: hex })} />
          </div>
        </>
      ) : (
        <p className="truncate rounded-lg bg-zinc-50 px-3 py-2 text-sm text-zinc-600" title={element.content.fileName}>
          {element.content.fileName}
        </p>
      )}
    </div>
  );
};
