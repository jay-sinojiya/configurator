export interface PriceQuoteRequest {
  productId: string;
  variantId: string;
  frameColorId?: string;
  zoneColors: Record<string, string>;
  elements: Array<{ zoneId: string; type: 'text' | 'image' }>;
  quantity: number;
}

export interface PriceLine {
  id: string;
  label: string;
  amount: number;
}

export interface PriceQuoteResponse {
  currency: string;
  unitPrice: number;
  lines: PriceLine[];
  total: number;
  quotedAt: string;
}
