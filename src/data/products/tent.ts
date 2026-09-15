import type { ProductDefinition } from '../../types/product';

const PANEL_W = 380;
const PANEL_GAP = 20;
const ROOF_H = 380;
const VALANCE_H = 160;
const MARGIN = 20;

function col(i: number) {
  return MARGIN + i * (PANEL_W + PANEL_GAP);
}

const ROOF_LABELS = ['Front', 'Right', 'Back', 'Left'];

export const tentProduct: ProductDefinition = {
  id: 'canopy-tent-10x10',
  name: '10x10 Logo Canopy Tent',
  description:
    'Custom canopy tent with company logo, dye sublimation printing, and a lifetime frame warranty.',
  basePrice: 399,
  currency: 'USD',
  layoutSize: {
    width: MARGIN * 2 + PANEL_W * 4 + PANEL_GAP * 3,
    height: MARGIN * 2 + ROOF_H + PANEL_GAP + VALANCE_H,
  },
  zones: [
    ...ROOF_LABELS.map((label, i) => ({
      id: `roof-${label.toLowerCase()}`,
      label: `Roof – ${label}`,
      rect: { x: col(i), y: MARGIN, width: PANEL_W, height: ROOF_H },
      allowedElementTypes: ['text', 'image'] as ('text' | 'image')[],
      colorable: true,
      defaultColor: '#1d4ed8',
      customizationFee: 45,
    })),
    ...ROOF_LABELS.map((label, i) => ({
      id: `valance-${label.toLowerCase()}`,
      label: `Valance – ${label}`,
      rect: { x: col(i), y: MARGIN + ROOF_H + PANEL_GAP, width: PANEL_W, height: VALANCE_H },
      allowedElementTypes: ['text', 'image'] as ('text' | 'image')[],
      colorable: true,
      defaultColor: '#ffffff',
      customizationFee: 45,
    })),
  ],
  variants: [
    {
      id: 'size-5x5',
      label: '5 × 5 ft',
      priceModifier: 0,
      model3dUrl: '/models/tent-5x5.glb',
      fabricMaterialName: 'fabric_Mat',
      frameMaterialNames: ['Metal_mat'],
      shopifyVariantId: 'gid://shopify/ProductVariant/40010000000001',
    },
    {
      id: 'size-6.5x6.5',
      label: '6.5 × 6.5 ft',
      priceModifier: 120,
      model3dUrl: '/models/tent-6.5x6.5.glb',
      fabricMaterialName: 'fabric_Mat',
      frameMaterialNames: ['Metal_mat'],
      shopifyVariantId: 'gid://shopify/ProductVariant/40010000000002',
    },
    {
      id: 'size-8x8',
      label: '8 × 8 ft',
      priceModifier: 260,
      model3dUrl: '/models/tent-8x8.glb',
      fabricMaterialName: 'fabric_Mat',
      frameMaterialNames: ['Metal_mat'],
      shopifyVariantId: 'gid://shopify/ProductVariant/40010000000003',
    },
  ],
  frameColorOptions: [
    { id: 'black', label: 'Black', hex: '#111318', priceModifier: 0 },
    { id: 'white', label: 'White', hex: '#f5f5f5', priceModifier: 0 },
    { id: 'silver', label: 'Silver', hex: '#b8bcc4', priceModifier: 15 },
  ],
  shopifyProductId: 'gid://shopify/Product/9010000000001',
};
