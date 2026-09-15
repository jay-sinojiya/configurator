import { useEffect, useRef } from 'react';
import { useGLTF } from '@react-three/drei';
import * as THREE from 'three';
import type { ProductVariant } from '../../types/product';

interface TentModelProps {
  variant: ProductVariant;
  texture: THREE.Texture;
  frameColorHex?: string;
}

export const TentModel = ({ variant, texture, frameColorHex }: TentModelProps) => {
  const { scene } = useGLTF(variant.model3dUrl);
  const fabricMaterials = useRef<THREE.MeshStandardMaterial[]>([]);
  const frameMaterials = useRef<THREE.MeshStandardMaterial[]>([]);

  useEffect(() => {
    fabricMaterials.current = [];
    frameMaterials.current = [];
    scene.traverse((obj) => {
      if (!(obj instanceof THREE.Mesh)) return;
      const materials = Array.isArray(obj.material) ? obj.material : [obj.material];
      for (const material of materials as THREE.MeshStandardMaterial[]) {
        if (material.name === variant.fabricMaterialName) fabricMaterials.current.push(material);
        if (variant.frameMaterialNames?.includes(material.name)) frameMaterials.current.push(material);
      }
    });
  }, [scene, variant]);

  useEffect(() => {
    for (const material of fabricMaterials.current) {
      material.map = texture;
      material.color.set('#ffffff');
      material.needsUpdate = true;
    }
  }, [texture]);

  useEffect(() => {
    if (!frameColorHex) return;
    for (const material of frameMaterials.current) {
      material.color.set(frameColorHex);
      material.needsUpdate = true;
    }
  }, [frameColorHex]);

  return <primitive object={scene} />;
};
