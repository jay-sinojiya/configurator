import { useEffect, useMemo } from 'react';
import * as THREE from 'three';
import type { ProductDefinition } from '../types/product';
import type { ProductConfiguration } from '../types/configuration';
import { drawCanvas, loadAllImages } from './renderLayout';

export const useCanvasTexture = (product: ProductDefinition, configuration: ProductConfiguration) => {
  const canvas = useMemo(() => {
    const c = document.createElement('canvas');
    c.width = product.layoutSize.width;
    c.height = product.layoutSize.height;
    return c;
  }, [product.layoutSize.width, product.layoutSize.height]);

  const texture = useMemo(() => {
    const tex = new THREE.CanvasTexture(canvas);
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.flipY = true;
    tex.anisotropy = 4;
    return tex;
  }, [canvas]);

  useEffect(() => {
    let cancelled = false;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    drawCanvas(ctx, product, configuration);
    texture.needsUpdate = true;

    loadAllImages(configuration).then(() => {
      if (cancelled) return;
      drawCanvas(ctx, product, configuration);
      texture.needsUpdate = true;
    });

    return () => {
      cancelled = true;
    };
  }, [canvas, texture, product, configuration]);

  useEffect(() => () => texture.dispose(), [texture]);

  return { texture, canvas };
};
