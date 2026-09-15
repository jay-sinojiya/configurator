import type { PriceQuoteRequest, PriceQuoteResponse } from '../../types/pricing';
import { parseErrorMessage } from './parseErrorMessage';

const API_BASE = import.meta.env.VITE_API_BASE_URL ?? '/api';

export const getPriceQuote = async (request: PriceQuoteRequest, signal?: AbortSignal): Promise<PriceQuoteResponse> => {
  const res = await fetch(`${API_BASE}/pricing/quote`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(request),
    signal,
  });
  if (!res.ok) {
    throw new Error(await parseErrorMessage(res, `Pricing request failed with status ${res.status}`));
  }
  return res.json();
};
