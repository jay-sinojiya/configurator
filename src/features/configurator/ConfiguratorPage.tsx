import { Suspense, lazy, useRef, useState } from 'react';
import { Box, PenTool } from 'lucide-react';
import { useConfiguratorStore } from '../../engine/store';
import { useCanvasTexture } from '../../engine/useCanvasTexture';
import { usePriceQuote } from '../pricing/usePriceQuote';
import { Editor2D } from '../editor2d/Editor2D';
import { ElementInspector } from '../editor2d/ElementInspector';
import { ProductOptionsBar } from './ProductOptionsBar';
import { PriceSummary } from '../pricing/PriceSummary';
import { AddToCartPanel } from '../cart/AddToCartPanel';
import { ExportPdfButton } from '../pdfExport/ExportPdfButton';

const Viewer3D = lazy(() => import('../viewer3d/Viewer3D').then((m) => ({ default: m.Viewer3D })));

export const ConfiguratorPage = () => {
  const { product, configuration } = useConfiguratorStore();
  const { texture, canvas: layoutCanvas } = useCanvasTexture(product, configuration);
  const { quote, loading, error } = usePriceQuote(configuration);
  const [activeView, setActiveView] = useState<'2d' | '3d'>('2d');
  const canvas3dRef = useRef<HTMLCanvasElement | null>(null);

  function get3dImage(): string | undefined {
    try {
      return canvas3dRef.current?.toDataURL('image/png');
    } catch {
      return undefined;
    }
  }

  function getLayoutImage(): string | undefined {
    try {
      return layoutCanvas.toDataURL('image/png');
    } catch {
      return undefined;
    }
  }

  return (
    <div className="min-h-full bg-zinc-50">
      <header className="sticky top-0 z-20 border-b border-zinc-200 bg-white">
        <div className="mx-auto max-w-[1400px] px-4 py-3.5 sm:px-6">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-indigo-600">Product Configurator</p>
          <h1 className="mt-0.5 text-xl font-bold tracking-tight text-zinc-900">{product.name}</h1>
        </div>
      </header>

      <div className="mx-auto max-w-[1400px] px-4 py-5 sm:px-6 sm:py-6">
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-[1fr_380px]">
          <div className="min-w-0 space-y-4">
            <ProductOptionsBar />

            <div className="inline-flex rounded-xl border border-zinc-200 bg-white p-1 shadow-sm xl:hidden">
              <button
                type="button"
                onClick={() => setActiveView('2d')}
                className={`flex items-center gap-1.5 rounded-lg px-4 py-2 text-sm font-medium transition ${
                  activeView === '2d' ? 'bg-zinc-900 text-white shadow-sm' : 'text-zinc-600 hover:text-zinc-900'
                }`}
              >
                <PenTool className="h-4 w-4" />
                Design
              </button>
              <button
                type="button"
                onClick={() => setActiveView('3d')}
                className={`flex items-center gap-1.5 rounded-lg px-4 py-2 text-sm font-medium transition ${
                  activeView === '3d' ? 'bg-zinc-900 text-white shadow-sm' : 'text-zinc-600 hover:text-zinc-900'
                }`}
              >
                <Box className="h-4 w-4" />
                3D Preview
              </button>
            </div>

            <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
              <div className={activeView === '2d' ? 'block' : 'hidden xl:block'}>
                <Editor2D />
              </div>
              <div className={`min-h-[420px] ${activeView === '3d' ? 'block' : 'hidden xl:block'}`}>
                <Suspense
                  fallback={
                    <div className="grid h-full min-h-[420px] place-items-center rounded-2xl border border-zinc-200 bg-white text-sm text-zinc-400">
                      Loading 3D preview…
                    </div>
                  }
                >
                  <Viewer3D
                    product={product}
                    configuration={configuration}
                    texture={texture}
                    onCanvasReady={(canvas) => {
                      canvas3dRef.current = canvas;
                    }}
                  />
                </Suspense>
              </div>
            </div>
          </div>

          <aside className="space-y-4 lg:sticky lg:top-20 lg:h-fit">
            <ElementInspector />
            <PriceSummary quote={quote} loading={loading} error={error} quantity={configuration.quantity} />
            <AddToCartPanel product={product} configuration={configuration} quote={quote} capturePreview={get3dImage} />
            <ExportPdfButton
              product={product}
              configuration={configuration}
              quote={quote}
              getPreview3dImage={get3dImage}
              getLayoutImage={getLayoutImage}
            />
          </aside>
        </div>
      </div>
    </div>
  );
};
