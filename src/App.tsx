import { useEffect, useState } from 'react';
import { AlertTriangle, Loader2 } from 'lucide-react';
import { initConfigurator } from './engine/store';
import { getProduct, defaultProductId } from './data/products';
import { ConfiguratorPage } from './features/configurator/ConfiguratorPage';
import { getProductIdFromUrl, sendToParent } from './app/embedBridge';

const App = () => {
  const [ready, setReady] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function bootstrap() {
      try {
        if (import.meta.env.VITE_API_BASE_URL === undefined) {
          const { worker } = await import('./services/mocks/browser');
          await worker.start({ onUnhandledRequest: 'bypass', quiet: true });
        }

        const productId = getProductIdFromUrl(defaultProductId);
        initConfigurator(getProduct(productId));
        if (!cancelled) {
          setReady(true);
          sendToParent('CONFIGURATOR_READY');
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Failed to load the configurator.');
        }
      }
    }

    bootstrap();
    return () => {
      cancelled = true;
    };
  }, []);

  if (error) {
    return (
      <div className="grid h-screen place-items-center bg-zinc-50 px-4">
        <div className="flex max-w-sm flex-col items-center gap-2 text-center">
          <AlertTriangle className="h-6 w-6 text-red-500" />
          <p className="text-sm text-red-600">{error}</p>
        </div>
      </div>
    );
  }

  if (!ready) {
    return (
      <div className="grid h-screen place-items-center bg-zinc-50">
        <div className="flex flex-col items-center gap-2 text-zinc-400">
          <Loader2 className="h-6 w-6 animate-spin" />
          <p className="text-sm">Loading configurator…</p>
        </div>
      </div>
    );
  }

  return <ConfiguratorPage />;
};

export default App;
