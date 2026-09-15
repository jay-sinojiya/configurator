import { useState } from 'react';
import { AlertCircle, Download, Loader2 } from 'lucide-react';
import type { ProductDefinition } from '../../types/product';
import type { ProductConfiguration } from '../../types/configuration';
import type { PriceQuoteResponse } from '../../types/pricing';

interface ExportPdfButtonProps {
  product: ProductDefinition;
  configuration: ProductConfiguration;
  quote: PriceQuoteResponse | null;
  getPreview3dImage: () => string | undefined;
  getLayoutImage: () => string | undefined;
}

export const ExportPdfButton = ({ product, configuration, quote, getPreview3dImage, getLayoutImage }: ExportPdfButtonProps) => {
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleExport() {
    if (!quote) return;
    setGenerating(true);
    setError(null);
    try {
      const { createPdf } = await import('../../services/pdf/generateProductionPdf');
      const doc = createPdf({
        product,
        configuration,
        priceQuote: quote,
        preview3dImage: getPreview3dImage(),
        layoutImage: getLayoutImage(),
        configurationId: configuration.id,
      });
      doc.save(`${product.id}-${configuration.id.slice(0, 8)}.pdf`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not generate the PDF. Please try again.');
    } finally {
      setGenerating(false);
    }
  }

  return (
    <div className="space-y-2">
      <button
        type="button"
        disabled={!quote || generating}
        onClick={handleExport}
        className="flex w-full items-center justify-center gap-2 rounded-xl border border-zinc-300 bg-white px-4 py-3 text-sm font-semibold text-zinc-800 transition hover:border-zinc-400 hover:bg-zinc-50 disabled:opacity-40"
      >
        {generating ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Generating PDF…
          </>
        ) : (
          <>
            <Download className="h-4 w-4" />
            Download production PDF
          </>
        )}
      </button>
      {error && (
        <p className="flex items-start gap-1.5 text-sm text-red-600">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          {error}
        </p>
      )}
    </div>
  );
};
