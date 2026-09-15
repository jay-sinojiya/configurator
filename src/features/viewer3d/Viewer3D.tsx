import { Suspense, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { Bounds, OrbitControls, useGLTF } from '@react-three/drei';
import { RotateCw } from 'lucide-react';
import type * as THREE from 'three';
import type { ProductDefinition } from '../../types/product';
import type { ProductConfiguration } from '../../types/configuration';
import { TentModel } from './TentModel';

interface Viewer3DProps {
  product: ProductDefinition;
  configuration: ProductConfiguration;
  texture: THREE.Texture;
  onCanvasReady?: (canvas: HTMLCanvasElement) => void;
}

const LoadingFallback = () => {
  return null;
};

export const Viewer3D = ({ product, configuration, texture, onCanvasReady }: Viewer3DProps) => {
  useEffect(() => {
    product.variants.forEach((v) => useGLTF.preload(v.model3dUrl));
  }, [product]);

  const variant = product.variants.find((v) => v.id === configuration.variantId) ?? product.variants[0];
  const frameColor = product.frameColorOptions?.find((f) => f.id === configuration.frameColorId)?.hex;

  return (
    <div className="relative h-full w-full overflow-hidden rounded-2xl border border-zinc-200 bg-zinc-50 shadow-sm">
      <Canvas
        camera={{ position: [3.5, 2.2, 3.5], fov: 40, near: 0.01, far: 1000 }}
        shadows
        dpr={[1, 2]}
        gl={{ preserveDrawingBuffer: true }}
        onCreated={(state) => onCanvasReady?.(state.gl.domElement)}
      >
        <color attach="background" args={['#f4f4f5']} />
        <hemisphereLight args={['#ffffff', '#8891a3', 0.7]} />
        <ambientLight intensity={0.35} />
        <directionalLight position={[5, 8, 5]} intensity={1.6} castShadow />
        <directionalLight position={[-4, 3, -5]} intensity={0.5} />
        <Suspense fallback={<LoadingFallback />}>
          <Bounds fit clip observe margin={1.3} key={variant.id}>
            <TentModel variant={variant} texture={texture} frameColorHex={frameColor} />
          </Bounds>
        </Suspense>
        <OrbitControls enablePan={false} makeDefault />
      </Canvas>
      <div className="pointer-events-none absolute bottom-3 left-3 inline-flex items-center gap-1.5 rounded-full bg-black/55 px-3 py-1.5 text-xs font-medium text-white backdrop-blur-sm">
        <RotateCw className="h-3 w-3" />
        Drag to rotate • Scroll to zoom
      </div>
    </div>
  );
};
