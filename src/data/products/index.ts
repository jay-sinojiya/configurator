import type { ProductDefinition } from '../../types/product';
import { tentProduct } from './tent';

const products: ProductDefinition[] = [tentProduct];

export const getProduct = (productId: string): ProductDefinition => {
  const product = products.find((p) => p.id === productId);
  if (!product) throw new Error(`Unknown product id: ${productId}`);
  return product;
};

export const defaultProductId = tentProduct.id;
