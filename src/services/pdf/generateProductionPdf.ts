import { jsPDF } from 'jspdf';
import type { ProductDefinition } from '../../types/product';
import type { ProductConfiguration } from '../../types/configuration';
import type { PriceQuoteResponse } from '../../types/pricing';

export interface ProductionPdfInput {
  product: ProductDefinition;
  configuration: ProductConfiguration;
  priceQuote: PriceQuoteResponse;
  preview3dImage?: string;
  layoutImage?: string;
  configurationId: string;
}

const currency = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' });

export const createPdf = (input: ProductionPdfInput): jsPDF => {
  const { product, configuration, priceQuote, preview3dImage, layoutImage, configurationId } = input;
  const doc = new jsPDF({ unit: 'pt', format: 'a4' });
  const marginX = 40;
  let y = 48;

  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text('Production Summary', marginX, y);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(110);
  y += 16;
  doc.text(`Configuration ID: ${configurationId}`, marginX, y);
  y += 14;
  doc.text(`Generated: ${new Date(configuration.updatedAt).toLocaleString()}`, marginX, y);
  doc.setTextColor(20);
  y += 26;

  doc.setFontSize(13);
  doc.setFont('helvetica', 'bold');
  doc.text(product.name, marginX, y);
  y += 18;

  const variant = product.variants.find((v) => v.id === configuration.variantId);
  const frame = product.frameColorOptions?.find((f) => f.id === configuration.frameColorId);

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  const details: Array<[string, string]> = [
    ['Size', variant?.label ?? configuration.variantId],
    ['Frame color', frame?.label ?? '—'],
    ['Quantity', String(configuration.quantity)],
  ];
  for (const [label, value] of details) {
    doc.setFont('helvetica', 'bold');
    doc.text(`${label}:`, marginX, y);
    doc.setFont('helvetica', 'normal');
    doc.text(value, marginX + 90, y);
    y += 14;
  }
  y += 8;

  const imageWidth = 240;
  const imageHeight = 160;
  if (layoutImage) {
    doc.setFontSize(9);
    doc.setTextColor(110);
    doc.text('Flattened artwork layout', marginX, y);
    doc.setTextColor(20);
    doc.addImage(layoutImage, 'PNG', marginX, y + 6, imageWidth, imageHeight, undefined, 'FAST');
  }
  if (preview3dImage) {
    doc.setFontSize(9);
    doc.setTextColor(110);
    doc.text('3D preview', marginX + imageWidth + 20, y);
    doc.setTextColor(20);
    doc.addImage(preview3dImage, 'PNG', marginX + imageWidth + 20, y + 6, imageWidth, imageHeight, undefined, 'FAST');
  }
  y += imageHeight + 30;

  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('Customization detail', marginX, y);
  y += 16;
  doc.setFontSize(9.5);
  doc.setFont('helvetica', 'normal');

  const zonesWithElements = product.zones.filter((z) => configuration.elements.some((e) => e.zoneId === z.id));
  if (zonesWithElements.length === 0) {
    doc.text('No custom elements added.', marginX, y);
    y += 14;
  }
  for (const zone of zonesWithElements) {
    const zoneColor = configuration.zoneColors[zone.id] ?? zone.defaultColor;
    doc.setFont('helvetica', 'bold');
    doc.text(`${zone.label}`, marginX, y);
    doc.setFont('helvetica', 'normal');
    doc.text(`base color ${zoneColor}`, marginX + 140, y);
    y += 13;
    for (const element of configuration.elements.filter((e) => e.zoneId === zone.id)) {
      const desc =
        element.content.type === 'text'
          ? `• Text: "${element.content.value}" (${element.content.color})`
          : `• Image: ${element.content.fileName}`;
      doc.text(desc, marginX + 12, y);
      y += 13;
      if (y > 760) {
        doc.addPage();
        y = 48;
      }
    }
    y += 4;
  }

  if (y > 700) {
    doc.addPage();
    y = 48;
  }

  y += 10;
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('Price breakdown', marginX, y);
  y += 16;
  doc.setFontSize(9.5);
  doc.setFont('helvetica', 'normal');
  for (const line of priceQuote.lines) {
    doc.text(line.label, marginX, y);
    doc.text(line.amount === 0 ? 'Included' : currency.format(line.amount), marginX + 400, y, { align: 'right' });
    y += 13;
  }
  y += 6;
  doc.setFont('helvetica', 'bold');
  doc.text(`Unit price: ${currency.format(priceQuote.unitPrice)}`, marginX, y);
  y += 14;
  doc.text(`Total (× ${configuration.quantity}): ${currency.format(priceQuote.total)}`, marginX, y);

  return doc;
};
