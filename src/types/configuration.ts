export interface Transform2D {
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
}

export interface TextElementContent {
  type: 'text';
  value: string;
  fontFamily: string;
  fontWeight: 400 | 600 | 700;
  color: string;
}

export interface ImageElementContent {
  type: 'image';
  src: string;
  fileName: string;
}

export type ElementContent = TextElementContent | ImageElementContent;

export interface ConfigurationElement {
  id: string;
  zoneId: string;
  content: ElementContent;
  transform: Transform2D;
  order: number;
}

export interface ProductConfiguration {
  id: string;
  productId: string;
  variantId: string;
  frameColorId?: string;
  zoneColors: Record<string, string>;
  elements: ConfigurationElement[];
  quantity: number;
  createdAt: string;
  updatedAt: string;
}

export const createConfig = (productId: string, variantId: string, zoneColors: Record<string, string>): ProductConfiguration => {
  const now = new Date().toISOString();
  return {
    id: crypto.randomUUID(),
    productId,
    variantId,
    zoneColors,
    elements: [],
    quantity: 1,
    createdAt: now,
    updatedAt: now,
  };
};
