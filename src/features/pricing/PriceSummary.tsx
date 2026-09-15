import { Loader2 } from 'lucide-react';
import type { PriceQuoteResponse } from '../../types/pricing';

interface PriceSummaryProps {
  quote: PriceQuoteResponse | null;
  loading: boolean;
  error: string | null;
  quantity: number;
}

const currencyFormatter = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' });

export const PriceSummary = ({ quote, loading, error, quantity }: PriceSummaryProps) => {
  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm">
      <div className="mb-2 flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-wide text-zinc-500">Price</span>
        {loading && (
          <span className="flex items-center gap-1 text-xs text-zinc-400">
            <Loader2 className="h-3 w-3 animate-spin" />
            Updating
          </span>
        )}
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      {quote && (
        <div className="space-y-2">
          <ul className="space-y-1.5 text-sm text-zinc-600">
            {quote.lines.map((line) => (
              <li key={line.id} className="flex justify-between gap-4">
                <span className="truncate">{line.label}</span>
                <span className="shrink-0 tabular-nums">{line.amount === 0 ? 'Included' : currencyFormatter.format(line.amount)}</span>
              </li>
            ))}
          </ul>
          <div className="flex justify-between border-t border-zinc-100 pt-2 text-sm text-zinc-600">
            <span>Unit price</span>
            <span className="tabular-nums">{currencyFormatter.format(quote.unitPrice)}</span>
          </div>
          <div className="flex justify-between text-sm text-zinc-600">
            <span>Quantity</span>
            <span className="tabular-nums">× {quantity}</span>
          </div>
          <div className="flex items-baseline justify-between border-t border-zinc-100 pt-2.5">
            <span className="text-sm font-semibold text-zinc-900">Total</span>
            <span className="text-xl font-bold tabular-nums text-zinc-900">{currencyFormatter.format(quote.total)}</span>
          </div>
        </div>
      )}

      {!quote && !error && loading && (
        <p className="flex items-center gap-1.5 text-sm text-zinc-400">
          <Loader2 className="h-3.5 w-3.5 animate-spin" />
          Calculating…
        </p>
      )}
    </div>
  );
};
