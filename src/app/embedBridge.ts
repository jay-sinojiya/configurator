export const sendToParent = (type: string, payload?: unknown) => {
  if (window.parent === window) return;
  window.parent.postMessage({ source: 'product-configurator', type, payload }, '*');
};

export const getProductIdFromUrl = (defaultProductId: string): string => {
  const params = new URLSearchParams(window.location.search);
  return params.get('productId') ?? defaultProductId;
};
