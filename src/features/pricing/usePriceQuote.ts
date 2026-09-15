import { useEffect, useRef, useState } from 'react';
import type { ProductConfiguration } from '../../types/configuration';
import type { PriceQuoteRequest, PriceQuoteResponse } from '../../types/pricing';
import { getPriceQuote } from '../../services/api/pricingApi';

export const usePriceQuote = (configuration: ProductConfiguration) => {
  const [quote, setQuote] = useState<PriceQuoteResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const debounceRef = useRef<number | undefined>(undefined);

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    setError(null);
    window.clearTimeout(debounceRef.current);

    debounceRef.current = window.setTimeout(async () => {
      const request: PriceQuoteRequest = {
        productId: configuration.productId,
        variantId: configuration.variantId,
        frameColorId: configuration.frameColorId,
        zoneColors: configuration.zoneColors,
        elements: configuration.elements.map((e) => ({ zoneId: e.zoneId, type: e.content.type })),
        quantity: configuration.quantity,
      };
      try {
        const result = await getPriceQuote(request, controller.signal);
        setQuote(result);
      } catch (err) {
        if ((err as Error).name !== 'AbortError') setError('Could not fetch a price quote. Please try again.');
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => {
      controller.abort();
      window.clearTimeout(debounceRef.current);
    };
  }, [configuration]);

  return { quote, loading, error };
};
