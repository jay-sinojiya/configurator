import { http, HttpResponse, delay } from 'msw';
import { getProduct } from '../../data/products';
import { calculatePrice } from '../../engine/pricingEngine';
import type { PriceQuoteRequest } from '../../types/pricing';
import type { AddToCartRequest, SaveConfigurationRequest, SaveConfigurationResponse } from '../../types/shopify';

const savedConfigurations = new Map<string, SaveConfigurationRequest>();
let cartCounter = 1000;

export const handlers = [
  http.post('/api/pricing/quote', async ({ request }) => {
    try {
      const body = (await request.json()) as PriceQuoteRequest;
      await delay(250);
      const product = getProduct(body.productId);
      const quote = calculatePrice(product, body);
      return HttpResponse.json(quote);
    } catch (err) {
      return HttpResponse.json({ error: err instanceof Error ? err.message : 'Invalid pricing request' }, { status: 400 });
    }
  }),

  http.post('/api/configurations', async ({ request }) => {
    try {
      const body = (await request.json()) as SaveConfigurationRequest;
      await delay(200);
      const configurationId = body.configuration.id;
      savedConfigurations.set(configurationId, body);
      const response: SaveConfigurationResponse = {
        configurationId,
        savedAt: new Date().toISOString(),
      };
      return HttpResponse.json(response);
    } catch (err) {
      return HttpResponse.json({ error: err instanceof Error ? err.message : 'Invalid configuration payload' }, { status: 400 });
    }
  }),

  http.post('/api/shopify/cart/add', async ({ request }) => {
    try {
      const body = (await request.json()) as AddToCartRequest;
      await delay(350);
      const saved = savedConfigurations.get(body.configurationId);
      if (!saved) {
        return HttpResponse.json({ error: 'Unknown configurationId — save the configuration before adding to cart.' }, { status: 400 });
      }
      cartCounter += 1;
      return HttpResponse.json({
        cartId: `mock-cart-${Math.floor(cartCounter / 7)}`,
        lineItemId: `mock-line-${cartCounter}`,
        variantId: body.lineItem.variantId,
        quantity: body.lineItem.quantity,
        unitPrice: saved.priceQuote.unitPrice,
        lineTotal: roundMoney(saved.priceQuote.unitPrice * body.lineItem.quantity),
        currency: saved.priceQuote.currency,
      });
    } catch (err) {
      return HttpResponse.json({ error: err instanceof Error ? err.message : 'Invalid cart request' }, { status: 400 });
    }
  }),
];

function roundMoney(n: number): number {
  return Math.round(n * 100) / 100;
}
