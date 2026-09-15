import type { ProductDefinition } from '../types/product';
import type { PriceLine, PriceQuoteRequest, PriceQuoteResponse } from '../types/pricing';

export const calculatePrice = (product: ProductDefinition, request: PriceQuoteRequest): PriceQuoteResponse => {
  const lines: PriceLine[] = [];

  lines.push({ id: 'base', label: `${product.name} — base price`, amount: product.basePrice });

  const variant = product.variants.find((v) => v.id === request.variantId);
  if (variant && variant.priceModifier !== 0) {
    lines.push({ id: 'variant', label: `Size: ${variant.label}`, amount: variant.priceModifier });
  }

  const frame = product.frameColorOptions?.find((f) => f.id === request.frameColorId);
  if (frame && frame.priceModifier !== 0) {
    lines.push({ id: 'frame', label: `Frame color: ${frame.label}`, amount: frame.priceModifier });
  }

  const zonesWithElements = [...new Set(request.elements.map((e) => e.zoneId))];
  zonesWithElements.forEach((zoneId, index) => {
    const zone = product.zones.find((z) => z.id === zoneId);
    if (!zone) return;
    if (index === 0) {
      lines.push({ id: `zone-${zoneId}`, label: `${zone.label} customization (1st location included)`, amount: 0 });
    } else {
      lines.push({ id: `zone-${zoneId}`, label: `${zone.label} customization fee`, amount: zone.customizationFee });
    }
  });

  for (const [zoneId, hex] of Object.entries(request.zoneColors)) {
    const zone = product.zones.find((z) => z.id === zoneId);
    if (!zone || hex === zone.defaultColor) continue;
    lines.push({ id: `color-${zoneId}`, label: `${zone.label} custom color`, amount: 10 });
  }

  const imageElementCount = request.elements.filter((e) => e.type === 'image').length;
  if (imageElementCount > 0) {
    lines.push({ id: 'art-fee', label: `Artwork digitization (${imageElementCount} upload${imageElementCount > 1 ? 's' : ''})`, amount: imageElementCount * 15 });
  }

  const unitPrice = roundMoney(lines.reduce((sum, l) => sum + l.amount, 0));
  const quantity = Math.max(1, request.quantity);

  return {
    currency: product.currency,
    unitPrice,
    lines,
    total: roundMoney(unitPrice * quantity),
    quotedAt: new Date().toISOString(),
  };
};

function roundMoney(n: number): number {
  return Math.round(n * 100) / 100;
}
