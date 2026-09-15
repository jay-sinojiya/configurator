import { useLayoutEffect, useRef, useState } from 'react';
import { Rnd } from 'react-rnd';
import type { ProductDefinition, ProductZone } from '../../types/product';
import type { ProductConfiguration, TextElementContent } from '../../types/configuration';
import { useConfiguratorStore } from '../../engine/store';

interface LayoutCanvasProps {
  product: ProductDefinition;
  configuration: ProductConfiguration;
}

export const LayoutCanvas = ({ product, configuration }: LayoutCanvasProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(0.4);

  const { activeZoneId, selectedElementId, setActiveZone, selectElement, updateElementTransform, updateElementContent } =
    useConfiguratorStore();

  useLayoutEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const observer = new ResizeObserver((entries) => {
      const width = entries[0]?.contentRect.width ?? el.clientWidth;
      setScale(Math.min(1, width / product.layoutSize.width));
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, [product.layoutSize.width]);

  const scaledWidth = product.layoutSize.width * scale;
  const scaledHeight = product.layoutSize.height * scale;

  return (
    <div ref={containerRef} className="w-full">
      <div
        className="relative overflow-hidden rounded-xl bg-zinc-100 ring-1 ring-zinc-200"
        style={{ width: scaledWidth, height: scaledHeight }}
        onClick={() => selectElement(null)}
      >
        <div
          style={{
            width: product.layoutSize.width,
            height: product.layoutSize.height,
            transform: `scale(${scale})`,
            transformOrigin: 'top left',
            position: 'relative',
          }}
        >
          {product.zones.map((zone) => (
            <ZoneBackground
              key={zone.id}
              zone={zone}
              color={configuration.zoneColors[zone.id] ?? zone.defaultColor}
              active={zone.id === activeZoneId}
              onSelect={() => setActiveZone(zone.id)}
            />
          ))}

          {configuration.elements.map((element) => {
            const zone = product.zones.find((z) => z.id === element.zoneId);
            if (!zone) return null;
            return (
              <Rnd
                key={element.id}
                bounds="parent"
                scale={scale}
                size={{ width: element.transform.width, height: element.transform.height }}
                position={{
                  x: element.transform.x - element.transform.width / 2,
                  y: element.transform.y - element.transform.height / 2,
                }}
                onDragStart={(e) => {
                  e.stopPropagation();
                  selectElement(element.id);
                  setActiveZone(element.zoneId);
                }}
                onDragStop={(_e, d) =>
                  updateElementTransform(element.id, { x: d.x + element.transform.width / 2, y: d.y + element.transform.height / 2 })
                }
                onResizeStop={(_e, _dir, ref, _delta, pos) =>
                  updateElementTransform(element.id, {
                    width: parseFloat(ref.style.width),
                    height: parseFloat(ref.style.height),
                    x: pos.x + parseFloat(ref.style.width) / 2,
                    y: pos.y + parseFloat(ref.style.height) / 2,
                  })
                }
                style={{
                  border: selectedElementId === element.id ? '2px solid #4f46e5' : '1px dashed rgba(0,0,0,0.25)',
                  boxShadow: selectedElementId === element.id ? '0 0 0 4px rgba(79,70,229,0.15)' : 'none',
                  borderRadius: 4,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'move',
                  transition: 'box-shadow 120ms ease',
                }}
                onClick={(e: React.MouseEvent) => {
                  e.stopPropagation();
                  selectElement(element.id);
                  setActiveZone(element.zoneId);
                }}
              >
                {element.content.type === 'text' ? (
                  <div
                    contentEditable
                    suppressContentEditableWarning
                    onBlur={(e) => updateElementContent(element.id, { value: e.currentTarget.textContent ?? '' } as Partial<TextElementContent>)}
                    onClick={(e) => e.stopPropagation()}
                    style={{
                      width: '100%',
                      textAlign: 'center',
                      fontFamily: element.content.fontFamily,
                      fontWeight: element.content.fontWeight,
                      color: element.content.color,
                      fontSize: Math.max(10, element.transform.height * 0.6),
                      lineHeight: 1.1,
                      outline: 'none',
                      userSelect: 'text',
                    }}
                  >
                    {element.content.value}
                  </div>
                ) : (
                  <img
                    src={element.content.src}
                    alt={element.content.fileName}
                    draggable={false}
                    style={{ width: '100%', height: '100%', objectFit: 'contain', pointerEvents: 'none' }}
                  />
                )}
              </Rnd>
            );
          })}
        </div>
      </div>
    </div>
  );
};

const ZoneBackground = ({
  zone,
  color,
  active,
  onSelect,
}: {
  zone: ProductZone;
  color: string;
  active: boolean;
  onSelect: () => void;
}) => {
  return (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation();
        onSelect();
      }}
      className="group absolute text-left transition"
      style={{
        left: zone.rect.x,
        top: zone.rect.y,
        width: zone.rect.width,
        height: zone.rect.height,
        backgroundColor: color,
        outline: active ? '3px solid #4f46e5' : '1px solid rgba(0,0,0,0.15)',
        outlineOffset: -1,
      }}
    >
      <span className="absolute inset-0 bg-white/0 transition group-hover:bg-white/10" />
      <span
        className="absolute left-1.5 top-1.5 rounded-md px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide shadow-sm"
        style={{ background: active ? '#4f46e5' : 'rgba(255,255,255,0.9)', color: active ? '#ffffff' : '#18181b' }}
      >
        {zone.label}
      </span>
    </button>
  );
};
