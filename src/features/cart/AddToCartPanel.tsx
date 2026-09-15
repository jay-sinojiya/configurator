import { useState } from 'react';
import { AlertCircle, CheckCircle2, Loader2, ShoppingCart } from 'lucide-react';
import type { ProductDefinition } from '../../types/product';
import type { ProductConfiguration } from '../../types/configuration';
import type { PriceQuoteResponse } from '../../types/pricing';
import { saveConfiguration, addToShopifyCart } from '../../services/api/shopifyApi';
import { sendToParent } from '../../app/embedBridge';
import type { AddToCartResponse } from '../../types/shopify';

interface AddToCartPanelProps {
  product: ProductDefinition;
  configuration: ProductConfiguration;
  quote: PriceQuoteResponse | null;
  capturePreview: () => string | undefined;
}

const currency = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' });

export const AddToCartPanel = ({ product, configuration, quote, capturePreview }: AddToCartPanelProps) => {
  const [status, setStatus] = useState<'idle' | 'saving' | 'success' | 'error'>('idle');
  const [result, setResult] = useState<AddToCartResponse | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const variant = product.variants.find((v) => v.id === configuration.variantId);

  async function handleAddToCart() {
    if (!quote) return;
    setStatus('saving');
    setErrorMessage(null);
    try {
      const saved = await saveConfiguration({
        configuration,
        priceQuote: quote,
        previewImageDataUrl: capturePreview(),
      });

      const cart = await addToShopifyCart({
        productId: product.shopifyProductId,
        configurationId: saved.configurationId,
        lineItem: {
          variantId: variant?.shopifyVariantId ?? '',
          quantity: configuration.quantity,
          properties: {
            _configuration_id: saved.configurationId,
            Size: variant?.label ?? '',
            'Frame color': product.frameColorOptions?.find((f) => f.id === configuration.frameColorId)?.label ?? '',
            Customizations: String(new Set(configuration.elements.map((e) => e.zoneId)).size),
          },
        },
      });

      setResult(cart);
      setStatus('success');
      sendToParent('ADD_TO_CART', { ...cart, configurationId: saved.configurationId });
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : 'Something went wrong adding this to your cart.');
      setStatus('error');
    }
  }

  return (
    <div className="space-y-2.5 rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm">
      <button
        type="button"
        disabled={!quote || status === 'saving'}
        onClick={handleAddToCart}
        className="flex w-full items-center justify-center gap-2 rounded-xl bg-zinc-900 px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-zinc-800 active:scale-[0.99] disabled:opacity-40 disabled:active:scale-100"
      >
        {status === 'saving' ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Adding to cart…
          </>
        ) : (
          <>
            <ShoppingCart className="h-4 w-4" />
            Add to cart
          </>
        )}
      </button>

      {status === 'success' && result && (
        <p className="flex items-start gap-1.5 text-sm text-emerald-700">
          <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
          <span>
            Added to cart <span className="font-mono text-xs">{result.cartId}</span> — {currency.format(result.lineTotal)}
          </span>
        </p>
      )}
      {status === 'error' && (
        <p className="flex items-start gap-1.5 text-sm text-red-600">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          {errorMessage}
        </p>
      )}
    </div>
  );
};
