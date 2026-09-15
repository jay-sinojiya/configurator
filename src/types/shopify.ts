export interface SaveConfigurationRequest {
  configuration: import('./configuration').ProductConfiguration;
  priceQuote: import('./pricing').PriceQuoteResponse;
  previewImageDataUrl?: string;
}

export interface SaveConfigurationResponse {
  configurationId: string;
  savedAt: string;
}

export interface ShopifyCartLineItem {
  variantId: string;
  quantity: number;
  properties: Record<string, string>;
}

export interface AddToCartRequest {
  productId: string;
  configurationId: string;
  lineItem: ShopifyCartLineItem;
}

export interface AddToCartResponse {
  cartId: string;
  lineItemId: string;
  variantId: string;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
  currency: string;
}
