import type {
  AddToCartRequest,
  AddToCartResponse,
  SaveConfigurationRequest,
  SaveConfigurationResponse,
} from '../../types/shopify';
import { parseErrorMessage } from './parseErrorMessage';

const API_BASE = import.meta.env.VITE_API_BASE_URL ?? '/api';

export const saveConfiguration = async (payload: SaveConfigurationRequest): Promise<SaveConfigurationResponse> => {
  const res = await fetch(`${API_BASE}/configurations`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error(await parseErrorMessage(res, `Failed to save configuration: ${res.status}`));
  return res.json();
};

export const addToShopifyCart = async (payload: AddToCartRequest): Promise<AddToCartResponse> => {
  const res = await fetch(`${API_BASE}/shopify/cart/add`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error(await parseErrorMessage(res, `Failed to add to cart: ${res.status}`));
  return res.json();
};
