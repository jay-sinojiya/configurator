export interface ProductZone {
  id: string;
  label: string;
  rect: { x: number; y: number; width: number; height: number };
  allowedElementTypes: Array<'text' | 'image'>;
  colorable: boolean;
  defaultColor: string;
  customizationFee: number;
}

export interface ProductVariant {
  id: string;
  label: string;
  priceModifier: number;
  model3dUrl: string;
  fabricMaterialName: string;
  frameMaterialNames?: string[];
  shopifyVariantId: string;
}

export interface FrameColorOption {
  id: string;
  label: string;
  hex: string;
  priceModifier: number;
}

export interface ProductDefinition {
  id: string;
  name: string;
  description: string;
  basePrice: number;
  currency: string;
  layoutSize: { width: number; height: number };
  zones: ProductZone[];
  variants: ProductVariant[];
  frameColorOptions?: FrameColorOption[];
  shopifyProductId: string;
}
