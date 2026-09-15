import { create } from 'zustand';
import type { ProductDefinition, ProductZone } from '../types/product';
import type {
  ConfigurationElement,
  ElementContent,
  ImageElementContent,
  ProductConfiguration,
  TextElementContent,
  Transform2D,
} from '../types/configuration';
import { createConfig } from '../types/configuration';
import { tentProduct } from '../data/products/tent';

function getDefaultColors(product: ProductDefinition): Record<string, string> {
  return Object.fromEntries(product.zones.map((z) => [z.id, z.defaultColor]));
}

interface ConfiguratorState {
  product: ProductDefinition;
  configuration: ProductConfiguration;
  selectedElementId: string | null;
  activeZoneId: string;

  setVariant: (variantId: string) => void;
  setFrameColor: (frameColorId: string) => void;
  setZoneColor: (zoneId: string, hex: string) => void;
  setActiveZone: (zoneId: string) => void;

  addTextElement: (zoneId: string) => string;
  addImageElement: (zoneId: string, src: string, fileName: string) => string;
  updateElementContent: (elementId: string, content: Partial<TextElementContent> | Partial<ImageElementContent>) => void;
  updateElementTransform: (elementId: string, transform: Partial<Transform2D>) => void;
  removeElement: (elementId: string) => void;
  selectElement: (elementId: string | null) => void;

  setQuantity: (quantity: number) => void;
}

function centerBox(zone: ProductZone, width: number, height: number): Transform2D {
  return {
    x: zone.rect.x + zone.rect.width / 2,
    y: zone.rect.y + zone.rect.height / 2,
    width,
    height,
    rotation: 0,
  };
}

function updateTimestamp(config: ProductConfiguration): ProductConfiguration {
  return { ...config, updatedAt: new Date().toISOString() };
}

const initialProduct: ProductDefinition = tentProduct;

export const useConfiguratorStore = create<ConfiguratorState>((set, get) => {
  return {
    product: initialProduct,
    configuration: {
      ...createConfig(initialProduct.id, initialProduct.variants[0].id, getDefaultColors(initialProduct)),
      frameColorId: initialProduct.frameColorOptions?.[0]?.id,
    },
    selectedElementId: null,
    activeZoneId: initialProduct.zones[0]?.id ?? '',

    setVariant: (variantId) =>
      set((s) => ({ configuration: updateTimestamp({ ...s.configuration, variantId }) })),

    setFrameColor: (frameColorId) =>
      set((s) => ({ configuration: updateTimestamp({ ...s.configuration, frameColorId }) })),

    setZoneColor: (zoneId, hex) =>
      set((s) => ({
        configuration: updateTimestamp({
          ...s.configuration,
          zoneColors: { ...s.configuration.zoneColors, [zoneId]: hex },
        }),
      })),

    setActiveZone: (zoneId) => set({ activeZoneId: zoneId }),

    addTextElement: (zoneId) => {
      const { product, configuration } = get();
      const zone = product.zones.find((z) => z.id === zoneId)!;
      const id = crypto.randomUUID();
      const element: ConfigurationElement = {
        id,
        zoneId,
        content: { type: 'text', value: 'Your Logo', fontFamily: 'Inter, sans-serif', fontWeight: 700, color: '#ffffff' },
        transform: centerBox(zone, Math.min(220, zone.rect.width * 0.6), Math.min(60, zone.rect.height * 0.3)),
        order: configuration.elements.length,
      };
      set({ configuration: updateTimestamp({ ...configuration, elements: [...configuration.elements, element] }) });
      return id;
    },

    addImageElement: (zoneId, src, fileName) => {
      const { product, configuration } = get();
      const zone = product.zones.find((z) => z.id === zoneId)!;
      const id = crypto.randomUUID();
      const size = Math.min(zone.rect.width, zone.rect.height) * 0.5;
      const element: ConfigurationElement = {
        id,
        zoneId,
        content: { type: 'image', src, fileName },
        transform: centerBox(zone, size, size),
        order: configuration.elements.length,
      };
      set({ configuration: updateTimestamp({ ...configuration, elements: [...configuration.elements, element] }) });
      return id;
    },

    updateElementContent: (elementId, content) =>
      set((s) => ({
        configuration: updateTimestamp({
          ...s.configuration,
          elements: s.configuration.elements.map((el) =>
            el.id === elementId ? { ...el, content: { ...el.content, ...content } as ElementContent } : el,
          ),
        }),
      })),

    updateElementTransform: (elementId, transform) =>
      set((s) => ({
        configuration: updateTimestamp({
          ...s.configuration,
          elements: s.configuration.elements.map((el) =>
            el.id === elementId ? { ...el, transform: { ...el.transform, ...transform } } : el,
          ),
        }),
      })),

    removeElement: (elementId) =>
      set((s) => ({
        configuration: updateTimestamp({
          ...s.configuration,
          elements: s.configuration.elements.filter((el) => el.id !== elementId),
        }),
        selectedElementId: s.selectedElementId === elementId ? null : s.selectedElementId,
      })),

    selectElement: (elementId) => set({ selectedElementId: elementId }),

    setQuantity: (quantity) =>
      set((s) => ({ configuration: updateTimestamp({ ...s.configuration, quantity: Math.max(1, quantity) }) })),
  };
});

export const initConfigurator = (product: ProductDefinition) => {
  const variant = product.variants[0];
  useConfiguratorStore.setState({
    product,
    configuration: {
      ...createConfig(product.id, variant.id, getDefaultColors(product)),
      frameColorId: product.frameColorOptions?.[0]?.id,
    },
    selectedElementId: null,
    activeZoneId: product.zones[0]?.id ?? '',
  });
};
