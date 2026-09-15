import type { ProductDefinition } from '../types/product';
import type { ProductConfiguration } from '../types/configuration';

export const drawCanvas = (ctx: CanvasRenderingContext2D, product: ProductDefinition, configuration: ProductConfiguration): void => {
  const { width, height } = product.layoutSize;
  ctx.clearRect(0, 0, width, height);

  for (const zone of product.zones) {
    const { x, y, width: w, height: h } = zone.rect;
    ctx.fillStyle = configuration.zoneColors[zone.id] ?? zone.defaultColor;
    ctx.fillRect(x, y, w, h);
    ctx.strokeStyle = 'rgba(0,0,0,0.15)';
    ctx.lineWidth = 2;
    ctx.strokeRect(x, y, w, h);
  }

  const elements = [...configuration.elements].sort((a, b) => a.order - b.order);
  for (const element of elements) {
    const zone = product.zones.find((z) => z.id === element.zoneId);
    if (!zone) continue;
    ctx.save();
    try {
      ctx.beginPath();
      ctx.rect(zone.rect.x, zone.rect.y, zone.rect.width, zone.rect.height);
      ctx.clip();

      ctx.translate(element.transform.x, element.transform.y);
      ctx.rotate((element.transform.rotation * Math.PI) / 180);

      if (element.content.type === 'text') {
        const { value, fontFamily, fontWeight, color } = element.content;
        const fontSize = Math.max(10, element.transform.height * 0.7);
        ctx.font = `${fontWeight} ${fontSize}px ${fontFamily}`;
        ctx.fillStyle = color;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(value, 0, 0, element.transform.width);
      } else if (element.content.type === 'image') {
        const img = imageCache.get(element.content.src);
        if (img && img.complete) {
          ctx.drawImage(img, -element.transform.width / 2, -element.transform.height / 2, element.transform.width, element.transform.height);
        }
      }
    } catch {
      // a single broken element (e.g. a corrupt image) shouldn't stop the rest of the layout from drawing
    } finally {
      ctx.restore();
    }
  }
};

const imageCache = new Map<string, HTMLImageElement>();

export const loadImage = (src: string): Promise<HTMLImageElement> => {
  const cached = imageCache.get(src);
  if (cached && cached.complete) return Promise.resolve(cached);

  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      imageCache.set(src, img);
      resolve(img);
    };
    img.onerror = reject;
    img.src = src;
  });
};

export const loadAllImages = (configuration: ProductConfiguration): Promise<unknown> => {
  const sources = configuration.elements
    .filter((el): el is typeof el & { content: { type: 'image'; src: string; fileName: string } } => el.content.type === 'image')
    .map((el) => el.content.src);
  return Promise.all(sources.map((src) => loadImage(src).catch(() => null)));
};
