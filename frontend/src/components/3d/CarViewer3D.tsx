import React, { useRef, useState, useEffect, useMemo } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, ContactShadows, PerspectiveCamera } from '@react-three/drei';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js';
import { RectAreaLightUniformsLib } from 'three/examples/jsm/lights/RectAreaLightUniformsLib.js';
import { Car, CarColorVariant, CarWheelVariant } from '../../types';
import { api } from '../../services/api';
import {
  Eye,
  RotateCcw,
  Palette,
  CircleDot,
  Sparkles,
  Camera,
  ChevronDown,
  ChevronUp,
  Sliders,
  Sun,
  Sunset,
  Moon,
  Image as ImageIcon,
  Box,
  Upload,
  Layers,
  Link2,
  CheckCircle2,
  ExternalLink,
  X,
  AlertCircle,
} from 'lucide-react';

// Initialize RectAreaLight uniforms once for physical studio softbox reflections
RectAreaLightUniformsLib.init();

interface CarViewer3DProps {
  car: Car;
  className?: string;
  allowCustomize?: boolean;
  showSideDetails?: boolean;
}

type CameraPreset = 'hero' | 'front' | 'wheel' | 'rear' | 'cockpit';
type RenderMode = 'external_3d' | 'photo_3d' | 'sculpted_3d';
type PhotoShaderView = 'textured' | 'normal_map' | 'wireframe';
export type LightingPresetId = 'studio_soft' | 'sunset_glow' | 'daylight_bright' | 'midnight_neon';

interface LightingPresetConfig {
  id: LightingPresetId;
  label: string;
  tagline: string;
  kelvin: string;
  hemiSky: string;
  hemiGround: string;
  hemiIntensity: number;
  keyColor: string;
  keyIntensity: number;
  keyPos: [number, number, number];
  fillColor: string;
  fillIntensity: number;
  fillPos: [number, number, number];
  rimColor: string;
  rimIntensity: number;
  spotColor: string;
  spotIntensity: number;
  envIntensity: number;
  headlightBoost: number;
  ringColor: string;
  backdropGradient: string;
  accentStripColor: string;
}

const FALLBACK_CAR_PHOTO = '/src/assets/images/car_bmw_m4_emerald_1793964978767.jpg';

// Pre-resolved map for instant zero-latency Sketchfab shortlinks (including https://skfb.ly/pNSGJ)
const KNOWN_SKETCHFAB_SHORTLINKS: Record<string, { uid: string; title: string }> = {
  pNSGJ: {
    uid: '9fbd01c5acfb45e7a7bbdf4c8e2c4aa8',
    title: '2024 Ford F-150 Raptor R',
  },
};

export const SAMPLE_3D_MODEL_LINKS = [
  {
    label: 'Ford F-150 Raptor R (skfb.ly/pNSGJ)',
    url: 'https://skfb.ly/pNSGJ',
    badge: 'Sketchfab Shortlink',
  },
  {
    label: 'Porsche 911 GT3 RS (Sketchfab 3D)',
    url: 'https://sketchfab.com/models/e738eae819c34d19a31dd066c42e0f3d/embed',
    badge: 'Sketchfab 3D',
  },
  {
    label: 'Khronos ToyCar PBR (.GLB Binary)',
    url: 'https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Models/main/2.0/ToyCar/glTF-Binary/ToyCar.glb',
    badge: 'Direct .GLB Mesh',
  },
];

/**
 * Checks whether a model URL is a user-supplied external link or uploaded blob
 * rather than the built-in local placeholder path (`/models/*.glb`).
 */
export function isCustomExternal3DUrl(url?: string | null): boolean {
  if (!url) return false;
  const trimmed = url.trim();
  if (!trimmed) return false;
  if (
    trimmed.startsWith('http://') ||
    trimmed.startsWith('https://') ||
    trimmed.startsWith('blob:') ||
    trimmed.startsWith('data:') ||
    trimmed.includes('skfb.ly') ||
    trimmed.includes('sketchfab.com')
  ) {
    return true;
  }
  return false;
}

/**
 * Determines whether a URL points to a Sketchfab model / shortlink
 */
export function isSketchfabUrl(url?: string | null): boolean {
  if (!url) return false;
  const lower = url.trim().toLowerCase();
  return lower.includes('skfb.ly') || lower.includes('sketchfab.com');
}

const LIGHTING_PRESETS: Record<LightingPresetId, LightingPresetConfig> = {
  studio_soft: {
    id: 'studio_soft',
    label: 'Studio Soft',
    tagline: 'Diffused Dual-Softbox Pavilion',
    kelvin: '5600K Neutral',
    hemiSky: '#bae6fd',
    hemiGround: '#05080d',
    hemiIntensity: 0.75,
    keyColor: '#f8fafc',
    keyIntensity: 2.5,
    keyPos: [5, 8, 5],
    fillColor: '#38bdf8',
    fillIntensity: 1.45,
    fillPos: [-6, 5, -4],
    rimColor: '#22d3ee',
    rimIntensity: 1.2,
    spotColor: '#e0f2fe',
    spotIntensity: 2.3,
    envIntensity: 1.45,
    headlightBoost: 1.0,
    ringColor: '#00e5ff',
    backdropGradient:
      'radial-gradient(circle at 50% 45%, rgba(6, 182, 212, 0.17) 0%, rgba(15, 23, 42, 0.38) 44%, rgba(5, 8, 13, 0.98) 82%)',
    accentStripColor: '#ffffff',
  },
  sunset_glow: {
    id: 'sunset_glow',
    label: 'Sunset Glow',
    tagline: 'Golden Hour Horizon Reflections',
    kelvin: '3200K Warm Gold',
    hemiSky: '#fdba74',
    hemiGround: '#1e1024',
    hemiIntensity: 0.9,
    keyColor: '#ff7e33',
    keyIntensity: 3.4,
    keyPos: [7.5, 3.2, 4.5],
    fillColor: '#c084fc',
    fillIntensity: 1.6,
    fillPos: [-6, 4.5, -5],
    rimColor: '#f59e0b',
    rimIntensity: 2.1,
    spotColor: '#fed7aa',
    spotIntensity: 2.6,
    envIntensity: 1.7,
    headlightBoost: 1.15,
    ringColor: '#f97316',
    backdropGradient:
      'radial-gradient(circle at 52% 44%, rgba(249, 115, 22, 0.22) 0%, rgba(88, 28, 135, 0.28) 46%, rgba(7, 6, 12, 0.98) 84%)',
    accentStripColor: '#fb923c',
  },
  daylight_bright: {
    id: 'daylight_bright',
    label: 'Daylight Bright',
    tagline: 'High-Noon Concours d’Elegance',
    kelvin: '6500K Solar',
    hemiSky: '#e0f2fe',
    hemiGround: '#1e293b',
    hemiIntensity: 1.35,
    keyColor: '#ffffff',
    keyIntensity: 3.6,
    keyPos: [4, 11, 6],
    fillColor: '#7dd3fc',
    fillIntensity: 2.1,
    fillPos: [-7, 7, 3],
    rimColor: '#ffffff',
    rimIntensity: 1.8,
    spotColor: '#ffffff',
    spotIntensity: 3.1,
    envIntensity: 1.95,
    headlightBoost: 0.85,
    ringColor: '#38bdf8',
    backdropGradient:
      'radial-gradient(circle at 50% 42%, rgba(186, 230, 253, 0.24) 0%, rgba(30, 58, 138, 0.30) 48%, rgba(6, 10, 18, 0.96) 85%)',
    accentStripColor: '#f8fafc',
  },
  midnight_neon: {
    id: 'midnight_neon',
    label: 'Midnight Cyber',
    tagline: 'Nocturnal Architectural Light Tunnel',
    kelvin: '8000K Cyber',
    hemiSky: '#22d3ee',
    hemiGround: '#020408',
    hemiIntensity: 0.45,
    keyColor: '#00e5ff',
    keyIntensity: 2.2,
    keyPos: [4.5, 6, 5],
    fillColor: '#f43f5e',
    fillIntensity: 1.9,
    fillPos: [-5.5, 4, -4.5],
    rimColor: '#a855f7',
    rimIntensity: 2.0,
    spotColor: '#00e5ff',
    spotIntensity: 2.4,
    envIntensity: 1.6,
    headlightBoost: 1.65,
    ringColor: '#f43f5e',
    backdropGradient:
      'radial-gradient(circle at 50% 46%, rgba(244, 63, 94, 0.16) 0%, rgba(6, 182, 212, 0.18) 42%, rgba(3, 5, 9, 0.99) 82%)',
    accentStripColor: '#00e5ff',
  },
};

/**
 * Loads an external .GLB / .GLTF 3D model URL inside Three.js Canvas,
 * automatically normalizes its scale & bounding box to sit flush on the turntable,
 * and enhances materials with studio environment reflections.
 */
function ExternalGLBMesh({
  url,
  colorHex,
  tintCustomPaint,
  lightingPreset,
  onLoadStatus,
}: {
  url: string;
  colorHex: string;
  tintCustomPaint: boolean;
  lightingPreset: LightingPresetConfig;
  onLoadStatus?: (status: 'loading' | 'loaded' | 'error', errMessage?: string) => void;
}) {
  const [loadedScene, setLoadedScene] = useState<THREE.Group | null>(null);

  useEffect(() => {
    let isMounted = true;
    onLoadStatus?.('loading');

    const dracoLoader = new DRACOLoader();
    dracoLoader.setDecoderPath('https://www.gstatic.com/draco/versioned/decoders/1.5.6/');

    const loader = new GLTFLoader();
    loader.setDRACOLoader(dracoLoader);

    loader.load(
      url,
      (gltf) => {
        if (!isMounted) return;
        const root = gltf.scene.clone(true);

        // Compute bounding box to center X/Z and ground Y at 0.02
        const box = new THREE.Box3().setFromObject(root);
        const size = box.getSize(new THREE.Vector3());
        const center = box.getCenter(new THREE.Vector3());
        const maxDim = Math.max(size.x, size.y, size.z, 0.001);
        const targetScale = 4.1 / maxDim;

        root.scale.setScalar(targetScale);

        // Recompute box after scaling
        const scaledBox = new THREE.Box3().setFromObject(root);
        const scaledCenter = scaledBox.getCenter(new THREE.Vector3());
        root.position.x = -scaledCenter.x;
        root.position.z = -scaledCenter.z;
        root.position.y = -scaledBox.min.y + 0.02;

        root.traverse((child: any) => {
          if (child.isMesh) {
            child.castShadow = true;
            child.receiveShadow = true;
            if (child.material) {
              const mats = Array.isArray(child.material) ? child.material : [child.material];
              mats.forEach((m: any) => {
                m.envMapIntensity = lightingPreset.envIntensity;
                m.needsUpdate = true;
              });
            }
          }
        });

        setLoadedScene(root);
        onLoadStatus?.('loaded');
      },
      undefined,
      (err: any) => {
        if (!isMounted) return;
        onLoadStatus?.('error', err?.message || 'Unable to parse GLB binary from URL.');
      }
    );

    return () => {
      isMounted = false;
      dracoLoader.dispose();
    };
  }, [url]);

  // Update environment intensity and optional paint tint when user switches lighting or color
  useEffect(() => {
    if (!loadedScene) return;
    loadedScene.traverse((child: any) => {
      if (child.isMesh && child.material) {
        const mats = Array.isArray(child.material) ? child.material : [child.material];
        mats.forEach((m: any) => {
          m.envMapIntensity = lightingPreset.envIntensity;
          if (tintCustomPaint && m.color && !m.transparent && (m.metalness > 0.2 || /paint|body|car|shell|coat/i.test(m.name || child.name || ''))) {
            m.color.set(colorHex);
          }
          m.needsUpdate = true;
        });
      }
    });
  }, [loadedScene, colorHex, tintCustomPaint, lightingPreset.envIntensity]);

  if (!loadedScene) return null;

  return (
    <group>
      <primitive object={loadedScene} />
      {/* Studio Turntable Ring under External GLB */}
      <mesh position={[0, 0.01, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <circleGeometry args={[2.75, 64]} />
        <meshStandardMaterial color="#060911" roughness={0.15} metalness={0.75} />
      </mesh>
      <mesh position={[0, 0.018, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[2.68, 2.75, 64]} />
        <meshBasicMaterial color={lightingPreset.ringColor} transparent opacity={0.75} />
      </mesh>
    </group>
  );
}

/**
 * Resolves and renders any Sketchfab 3D link (including https://skfb.ly/pNSGJ,
 * https://sketchfab.com/3d-models/..., or https://sketchfab.com/models/.../embed)
 */
function Sketchfab3DStage({
  url,
  carTitle,
  onOpenLinkModal,
}: {
  url: string;
  carTitle: string;
  onOpenLinkModal: () => void;
}) {
  const [embedUrl, setEmbedUrl] = useState<string | null>(null);
  const [resolvedTitle, setResolvedTitle] = useState<string | null>(null);
  const [resolving, setResolving] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    const raw = url.trim();
    setResolving(true);
    setErrorMsg(null);

    const resolveLink = async () => {
      // 1. Check if already an /embed URL
      if (raw.includes('/embed')) {
        const hasParams = raw.includes('?');
        const fullEmbed = `${raw}${hasParams ? '&' : '?'}autostart=1&ui_theme=dark&ui_infos=0&ui_watermark=0&dnt=1`;
        if (isMounted) {
          setEmbedUrl(fullEmbed);
          setResolving(false);
        }
        return;
      }

      // 2. Check known shortlinks cache (e.g., https://skfb.ly/pNSGJ)
      const shortMatch = raw.match(/skfb\.ly\/([A-Za-z0-9]+)/i);
      if (shortMatch && KNOWN_SKETCHFAB_SHORTLINKS[shortMatch[1]]) {
        const known = KNOWN_SKETCHFAB_SHORTLINKS[shortMatch[1]];
        if (isMounted) {
          setEmbedUrl(
            `https://sketchfab.com/models/${known.uid}/embed?autostart=1&ui_theme=dark&ui_infos=0&ui_watermark=0&dnt=1`
          );
          setResolvedTitle(known.title);
          setResolving(false);
        }
        return;
      }

      // 3. Check if URL contains a 32-character hex Sketchfab model UID directly
      const uidMatch = raw.match(/([0-9a-f]{32})/i);
      if (uidMatch) {
        const uid = uidMatch[1];
        if (isMounted) {
          setEmbedUrl(
            `https://sketchfab.com/models/${uid}/embed?autostart=1&ui_theme=dark&ui_infos=0&ui_watermark=0&dnt=1`
          );
          setResolving(false);
        }
        return;
      }

      // 4. Resolve shortened URL via our Vite server middleware (/api/resolve-3d-url)
      try {
        const resp = await fetch(`/api/resolve-3d-url?url=${encodeURIComponent(raw)}`);
        if (resp.ok) {
          const data = await resp.json();
          if (data.embedUrl && isMounted) {
            setEmbedUrl(data.embedUrl);
            setResolving(false);
            return;
          }
        }
      } catch {
        // continue to oEmbed fallback
      }

      // 5. Fallback to Sketchfab public oEmbed endpoint
      try {
        const oembedResp = await fetch(
          `https://sketchfab.com/oembed?url=${encodeURIComponent(raw)}`
        );
        if (oembedResp.ok) {
          const oembedData = await oembedResp.json();
          const iframeSrcMatch = String(oembedData.html || '').match(/src="([^"]+)"/i);
          if (iframeSrcMatch && isMounted) {
            const baseSrc = iframeSrcMatch[1];
            const sep = baseSrc.includes('?') ? '&' : '?';
            setEmbedUrl(`${baseSrc}${sep}autostart=1&ui_theme=dark&ui_infos=0&ui_watermark=0&dnt=1`);
            if (oembedData.title) setResolvedTitle(oembedData.title);
            setResolving(false);
            return;
          }
        }
      } catch {
        // continue
      }

      if (isMounted) {
        setErrorMsg('Could not resolve 3D embed UID from this shortlink.');
        setResolving(false);
      }
    };

    resolveLink();

    return () => {
      isMounted = false;
    };
  }, [url]);

  if (resolving) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center bg-[#05080D] text-white p-6">
        <div className="w-10 h-10 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin mb-3" />
        <p className="text-xs font-mono uppercase tracking-widest text-cyan-400">
          Loading Linked 3D Model Stream...
        </p>
        <p className="text-[11px] text-slate-400 mt-1 font-mono">{url}</p>
      </div>
    );
  }

  if (errorMsg || !embedUrl) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center bg-[#05080D] text-white p-6 text-center space-y-3">
        <AlertCircle className="w-8 h-8 text-amber-400" />
        <p className="text-sm font-semibold text-white">{errorMsg || 'Unable to load 3D model URL'}</p>
        <p className="text-xs text-slate-400 max-w-md font-mono break-all">{url}</p>
        <div className="flex items-center gap-2 pt-2">
          <button
            type="button"
            onClick={onOpenLinkModal}
            className="px-4 py-2 rounded-xl bg-cyan-500 text-slate-950 font-semibold text-xs"
          >
            Update 3D Model Link
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full bg-[#05080D]">
      <iframe
        title={resolvedTitle || `${carTitle} - 3D Interactive Model`}
        src={embedUrl}
        className="w-full h-full border-0"
        allow="autoplay; fullscreen; xr-spatial-tracking"
        allowFullScreen
      />
    </div>
  );
}

/**
 * Converts a 2D vehicle photograph into 4 synchronized PBR 3D textures:
 * 1. Albedo Texture (with soft elliptical studio silhouette alpha feathering)
 * 2. Smooth 3D Depth / Displacement Map (foreground vehicle volume relief)
 * 3. Tangent-Space Sobel Normal Map (for real-time 3D specular lighting across body curves)
 * 4. Emissive Headlight / Highlight Map
 */
interface Generated3DPhotoMaps {
  albedoMap: THREE.CanvasTexture;
  depthMap: THREE.CanvasTexture;
  normalMap: THREE.CanvasTexture;
  emissiveMap: THREE.CanvasTexture;
  aspectRatio: number;
}

function create3DPhotoMapsFromImage(img: HTMLImageElement): Generated3DPhotoMaps {
  const width = 512;
  const height = 320;
  const aspectRatio = img.width && img.height ? img.width / img.height : 1.6;

  const albedoCanvas = document.createElement('canvas');
  albedoCanvas.width = width;
  albedoCanvas.height = height;
  const albedoCtx = albedoCanvas.getContext('2d')!;
  albedoCtx.drawImage(img, 0, 0, width, height);

  const srcData = albedoCtx.getImageData(0, 0, width, height);
  const pixels = srcData.data;

  const rawHeight = new Float32Array(width * height);

  for (let y = 0; y < height; y++) {
    const ny = (y / (height - 1)) * 2 - 1;
    for (let x = 0; x < width; x++) {
      const nx = (x / (width - 1)) * 2 - 1;
      const idx = y * width + x;
      const pIdx = idx * 4;

      const r = pixels[pIdx] / 255;
      const g = pixels[pIdx + 1] / 255;
      const b = pixels[pIdx + 2] / 255;

      const lum = 0.299 * r + 0.587 * g + 0.114 * b;
      const maxC = Math.max(r, g, b);
      const minC = Math.min(r, g, b);
      const sat = maxC > 0 ? (maxC - minC) / maxC : 0;

      const distElliptical = Math.sqrt(nx * nx * 0.82 + (ny - 0.08) * (ny - 0.08) * 1.35);
      const silhouetteEnvelope = Math.max(0, Math.min(1, 1.28 - distElliptical * 1.15));
      const smoothEnvelope =
        silhouetteEnvelope * silhouetteEnvelope * (3 - 2 * silhouetteEnvelope);

      const edgeX = Math.min(x / 36, (width - 1 - x) / 36, 1);
      const edgeY = Math.min(y / 28, (height - 1 - y) / 28, 1);
      const borderAlpha = Math.min(edgeX, edgeY);

      const carDomeVolume = Math.max(0, 1 - (nx * nx * 0.75 + (ny - 0.1) * (ny - 0.1) * 1.6));
      const depthVal =
        (carDomeVolume * 0.62 + lum * 0.28 + sat * 0.18) * smoothEnvelope * borderAlpha;

      rawHeight[idx] = Math.max(0, Math.min(1, depthVal));

      const finalAlpha = Math.pow(borderAlpha, 1.2) * (0.18 + 0.82 * smoothEnvelope);
      pixels[pIdx + 3] = Math.round(Math.max(0, Math.min(1, finalAlpha)) * 255);
    }
  }
  albedoCtx.putImageData(srcData, 0, 0);

  const smoothedHeight = new Float32Array(rawHeight);
  const tempHeight = new Float32Array(width * height);
  const radius = 5;

  for (let pass = 0; pass < 3; pass++) {
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        let sum = 0;
        let count = 0;
        for (let k = -radius; k <= radius; k++) {
          const xx = Math.min(width - 1, Math.max(0, x + k));
          sum += smoothedHeight[y * width + xx];
          count++;
        }
        tempHeight[y * width + x] = sum / count;
      }
    }
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        let sum = 0;
        let count = 0;
        for (let k = -radius; k <= radius; k++) {
          const yy = Math.min(height - 1, Math.max(0, y + k));
          sum += tempHeight[yy * width + x];
          count++;
        }
        smoothedHeight[y * width + x] = sum / count;
      }
    }
  }

  const depthCanvas = document.createElement('canvas');
  depthCanvas.width = width;
  depthCanvas.height = height;
  const depthCtx = depthCanvas.getContext('2d')!;
  const depthImgData = depthCtx.createImageData(width, height);

  const normalCanvas = document.createElement('canvas');
  normalCanvas.width = width;
  normalCanvas.height = height;
  const normalCtx = normalCanvas.getContext('2d')!;
  const normalImgData = normalCtx.createImageData(width, height);

  const emissiveCanvas = document.createElement('canvas');
  emissiveCanvas.width = width;
  emissiveCanvas.height = height;
  const emissiveCtx = emissiveCanvas.getContext('2d')!;
  const emissiveImgData = emissiveCtx.createImageData(width, height);

  const normalStrength = 6.5;

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = y * width + x;
      const pIdx = idx * 4;

      const hVal = smoothedHeight[idx];
      const dByte = Math.round(hVal * 255);
      depthImgData.data[pIdx] = dByte;
      depthImgData.data[pIdx + 1] = dByte;
      depthImgData.data[pIdx + 2] = dByte;
      depthImgData.data[pIdx + 3] = 255;

      const xLeft = Math.max(0, x - 1);
      const xRight = Math.min(width - 1, x + 1);
      const yUp = Math.max(0, y - 1);
      const yDown = Math.min(height - 1, y + 1);

      const hL = smoothedHeight[y * width + xLeft] * 0.7 + rawHeight[y * width + xLeft] * 0.3;
      const hR = smoothedHeight[y * width + xRight] * 0.7 + rawHeight[y * width + xRight] * 0.3;
      const hU = smoothedHeight[yUp * width + x] * 0.7 + rawHeight[yUp * width + x] * 0.3;
      const hD = smoothedHeight[yDown * width + x] * 0.7 + rawHeight[yDown * width + x] * 0.3;

      const dX = (hR - hL) * normalStrength;
      const dY = (hD - hU) * normalStrength;
      const len = Math.sqrt(dX * dX + dY * dY + 1.0);

      const nx = -dX / len;
      const ny = dY / len;
      const nz = 1.0 / len;

      normalImgData.data[pIdx] = Math.round((nx * 0.5 + 0.5) * 255);
      normalImgData.data[pIdx + 1] = Math.round((ny * 0.5 + 0.5) * 255);
      normalImgData.data[pIdx + 2] = Math.round((nz * 0.5 + 0.5) * 255);
      normalImgData.data[pIdx + 3] = 255;

      const r = pixels[pIdx];
      const g = pixels[pIdx + 1];
      const b = pixels[pIdx + 2];
      const lum = (r + g + b) / 3;
      if (lum > 205 && hVal > 0.25) {
        const boost = (lum - 205) / 50;
        emissiveImgData.data[pIdx] = Math.min(255, Math.round(r * boost));
        emissiveImgData.data[pIdx + 1] = Math.min(255, Math.round(g * boost + 40 * boost));
        emissiveImgData.data[pIdx + 2] = Math.min(255, Math.round(b * boost + 60 * boost));
        emissiveImgData.data[pIdx + 3] = 255;
      } else {
        emissiveImgData.data[pIdx] = 0;
        emissiveImgData.data[pIdx + 1] = 0;
        emissiveImgData.data[pIdx + 2] = 0;
        emissiveImgData.data[pIdx + 3] = 255;
      }
    }
  }

  depthCtx.putImageData(depthImgData, 0, 0);
  normalCtx.putImageData(normalImgData, 0, 0);
  emissiveCtx.putImageData(emissiveImgData, 0, 0);

  const albedoMap = new THREE.CanvasTexture(albedoCanvas);
  albedoMap.colorSpace = THREE.SRGBColorSpace;
  albedoMap.needsUpdate = true;

  const depthMap = new THREE.CanvasTexture(depthCanvas);
  depthMap.needsUpdate = true;

  const normalMap = new THREE.CanvasTexture(normalCanvas);
  normalMap.needsUpdate = true;

  const emissiveMap = new THREE.CanvasTexture(emissiveCanvas);
  emissiveMap.colorSpace = THREE.SRGBColorSpace;
  emissiveMap.needsUpdate = true;

  return {
    albedoMap,
    depthMap,
    normalMap,
    emissiveMap,
    aspectRatio,
  };
}

function RealPhotoTo3DMesh({
  imageUrl,
  depthIntensity,
  shaderView,
  lightingPreset,
}: {
  imageUrl: string;
  depthIntensity: number;
  shaderView: PhotoShaderView;
  lightingPreset: LightingPresetConfig;
}) {
  const [maps, setMaps] = useState<Generated3DPhotoMaps | null>(null);
  const meshGroupRef = useRef<THREE.Group>(null);

  useEffect(() => {
    let isMounted = true;
    const img = new Image();
    img.crossOrigin = 'anonymous';

    const handleLoad = () => {
      if (!isMounted) return;
      try {
        const generated = create3DPhotoMapsFromImage(img);
        setMaps((prev) => {
          if (prev) {
            prev.albedoMap.dispose();
            prev.depthMap.dispose();
            prev.normalMap.dispose();
            prev.emissiveMap.dispose();
          }
          return generated;
        });
      } catch {
        if (img.src !== window.location.origin + FALLBACK_CAR_PHOTO) {
          img.src = FALLBACK_CAR_PHOTO;
        }
      }
    };

    const handleError = () => {
      if (!isMounted) return;
      if (img.src !== window.location.origin + FALLBACK_CAR_PHOTO) {
        img.src = FALLBACK_CAR_PHOTO;
      }
    };

    img.onload = handleLoad;
    img.onerror = handleError;
    img.src = imageUrl || FALLBACK_CAR_PHOTO;

    return () => {
      isMounted = false;
    };
  }, [imageUrl]);

  useFrame((state) => {
    if (meshGroupRef.current) {
      meshGroupRef.current.position.y = Math.sin(state.clock.elapsedTime * 1.4) * 0.02;
    }
  });

  const stageGeometry = useMemo(() => {
    const geo = new THREE.PlaneGeometry(4.3, 2.65, 160, 100);
    const pos = geo.attributes.position;
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i);
      const y = pos.getY(i);
      const curveZ = -Math.pow(x / 2.6, 2) * 0.22 - Math.pow(y / 2.0, 2) * 0.08;
      pos.setZ(i, curveZ);
    }
    geo.computeVertexNormals();
    return geo;
  }, []);

  if (!maps) {
    return null;
  }

  const effectiveDisplacement = 0.68 * depthIntensity;

  return (
    <group position={[0, 0, 0]}>
      <group ref={meshGroupRef} position={[0, 1.32, 0]}>
        <mesh geometry={stageGeometry} castShadow receiveShadow>
          <meshPhysicalMaterial
            map={shaderView === 'normal_map' ? maps.normalMap : maps.albedoMap}
            normalMap={maps.normalMap}
            normalScale={new THREE.Vector2(1.4 * depthIntensity, 1.4 * depthIntensity)}
            displacementMap={maps.depthMap}
            displacementScale={effectiveDisplacement}
            displacementBias={-effectiveDisplacement * 0.28}
            emissiveMap={maps.emissiveMap}
            emissive={new THREE.Color(lightingPreset.ringColor)}
            emissiveIntensity={0.85 * lightingPreset.headlightBoost}
            roughness={0.18}
            metalness={0.35}
            clearcoat={1.0}
            clearcoatRoughness={0.05}
            envMapIntensity={lightingPreset.envIntensity}
            transparent={true}
            alphaTest={0.05}
            wireframe={shaderView === 'wireframe'}
            side={THREE.DoubleSide}
          />
        </mesh>

        {shaderView === 'textured' && (
          <mesh geometry={stageGeometry} position={[0, 0, -0.14]} scale={[0.98, 0.98, 1]}>
            <meshStandardMaterial
              map={maps.albedoMap}
              displacementMap={maps.depthMap}
              displacementScale={effectiveDisplacement * 0.45}
              color="#0f172a"
              roughness={0.6}
              metalness={0.5}
              transparent={true}
              opacity={0.65}
              alphaTest={0.08}
            />
          </mesh>
        )}
      </group>

      <mesh
        geometry={stageGeometry}
        position={[0, -0.95, 0.05]}
        scale={[1, -0.75, 0.35]}
        rotation={[0.18, 0, 0]}
      >
        <meshBasicMaterial
          map={maps.albedoMap}
          transparent={true}
          opacity={0.18}
          color={lightingPreset.accentStripColor}
          depthWrite={false}
        />
      </mesh>

      <mesh position={[0, 0.01, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <circleGeometry args={[2.75, 64]} />
        <meshStandardMaterial color="#060911" roughness={0.15} metalness={0.75} />
      </mesh>

      <mesh position={[0, 0.018, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[2.68, 2.75, 64]} />
        <meshBasicMaterial color={lightingPreset.ringColor} transparent opacity={0.75} />
      </mesh>
    </group>
  );
}

function buildProceduralEnvScene(presetId: LightingPresetId): THREE.Scene {
  const envScene = new THREE.Scene();

  const addPanel = (
    pos: [number, number, number],
    rot: [number, number, number],
    scale: [number, number, number],
    colorHex: string,
    intensity: number
  ) => {
    const geo = new THREE.BoxGeometry(1, 1, 1);
    const mat = new THREE.MeshBasicMaterial({
      color: new THREE.Color(colorHex).multiplyScalar(intensity),
    });
    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.set(...pos);
    mesh.rotation.set(...rot);
    mesh.scale.set(...scale);
    envScene.add(mesh);
  };

  if (presetId === 'studio_soft') {
    envScene.background = new THREE.Color('#05080f');
    addPanel([0, 12, 0], [0, 0, 0], [10, 0.2, 18], '#ffffff', 4.5);
    addPanel([-8, 6, 0], [0, 0, -0.5], [0.2, 5, 16], '#bae6fd', 2.8);
    addPanel([8, 6, 0], [0, 0, 0.5], [0.2, 5, 16], '#e0f2fe', 2.8);
    addPanel([0, 4, 12], [0.3, 0, 0], [12, 4, 0.2], '#38bdf8', 2.2);
    addPanel([0, 4, -12], [-0.3, 0, 0], [12, 3, 0.2], '#94a3b8', 1.8);
  } else if (presetId === 'sunset_glow') {
    envScene.background = new THREE.Color('#12091c');
    addPanel([10, 3.5, 8], [0, -0.6, 0], [8, 4.5, 0.3], '#ff6b1a', 6.5);
    addPanel([0, 2.2, 13], [0, 0, 0], [22, 2.5, 0.3], '#fb923c', 4.2);
    addPanel([0, 2.2, -13], [0, 0, 0], [22, 2.5, 0.3], '#ec4899', 3.0);
    addPanel([-11, 5, 0], [0, 0, -0.4], [0.3, 5, 18], '#a855f7', 2.6);
    addPanel([0, 13, 0], [0, 0, 0], [12, 0.2, 16], '#fde68a', 3.2);
  } else if (presetId === 'daylight_bright') {
    envScene.background = new THREE.Color('#1e3a5f');
    addPanel([0, 13, 0], [0, 0, 0], [18, 0.3, 22], '#ffffff', 6.0);
    addPanel([-11, 7, 0], [0, 0, -0.3], [0.3, 8, 20], '#bae6fd', 4.0);
    addPanel([11, 7, 0], [0, 0, 0.3], [0.3, 8, 20], '#e0f2fe', 4.0);
    addPanel([0, 6, 13], [0, 0, 0], [18, 6, 0.3], '#f8fafc', 3.8);
    addPanel([0, 6, -13], [0, 0, 0], [18, 6, 0.3], '#7dd3fc', 3.2);
  } else {
    envScene.background = new THREE.Color('#020408');
    addPanel([-4, 11, 0], [0, 0, 0], [1.2, 0.2, 20], '#00e5ff', 6.5);
    addPanel([4, 11, 0], [0, 0, 0], [1.2, 0.2, 20], '#f43f5e', 6.0);
    addPanel([-10, 4, 0], [0, 0, 0], [0.2, 2.5, 18], '#00e5ff', 4.2);
    addPanel([10, 4, 0], [0, 0, 0], [0.2, 2.5, 18], '#a855f7', 4.2);
  }

  return envScene;
}

function DynamicStudioEnvironment({ presetId }: { presetId: LightingPresetId }) {
  const { gl, scene } = useThree();

  useEffect(() => {
    const pmremGenerator = new THREE.PMREMGenerator(gl);
    pmremGenerator.compileEquirectangularShader();
    const envScene = buildProceduralEnvScene(presetId);
    const envTexture = pmremGenerator.fromScene(envScene, 0.035).texture;

    const targetScene = scene;
    targetScene.environment = envTexture;

    return () => {
      envTexture.dispose();
      pmremGenerator.dispose();
    };
  }, [gl, scene, presetId]);

  return null;
}

function DynamicLightingRig({ preset }: { preset: LightingPresetConfig }) {
  const keyLightRef = useRef<THREE.DirectionalLight>(null);
  const fillLightRef = useRef<THREE.DirectionalLight>(null);
  const rimLightRef = useRef<THREE.DirectionalLight>(null);
  const hemiLightRef = useRef<THREE.HemisphereLight>(null);
  const spotLightRef = useRef<THREE.SpotLight>(null);

  const targetKeyColor = useMemo(() => new THREE.Color(preset.keyColor), [preset.keyColor]);
  const targetFillColor = useMemo(() => new THREE.Color(preset.fillColor), [preset.fillColor]);
  const targetRimColor = useMemo(() => new THREE.Color(preset.rimColor), [preset.rimColor]);
  const targetHemiSky = useMemo(() => new THREE.Color(preset.hemiSky), [preset.hemiSky]);
  const targetHemiGround = useMemo(() => new THREE.Color(preset.hemiGround), [preset.hemiGround]);
  const targetSpotColor = useMemo(() => new THREE.Color(preset.spotColor), [preset.spotColor]);

  useFrame((_, delta) => {
    const speed = 5.5;
    if (keyLightRef.current) {
      keyLightRef.current.color.lerp(targetKeyColor, Math.min(1, delta * speed));
      keyLightRef.current.intensity = THREE.MathUtils.damp(
        keyLightRef.current.intensity,
        preset.keyIntensity,
        speed,
        delta
      );
      keyLightRef.current.position.x = THREE.MathUtils.damp(
        keyLightRef.current.position.x,
        preset.keyPos[0],
        speed,
        delta
      );
      keyLightRef.current.position.y = THREE.MathUtils.damp(
        keyLightRef.current.position.y,
        preset.keyPos[1],
        speed,
        delta
      );
      keyLightRef.current.position.z = THREE.MathUtils.damp(
        keyLightRef.current.position.z,
        preset.keyPos[2],
        speed,
        delta
      );
    }

    if (fillLightRef.current) {
      fillLightRef.current.color.lerp(targetFillColor, Math.min(1, delta * speed));
      fillLightRef.current.intensity = THREE.MathUtils.damp(
        fillLightRef.current.intensity,
        preset.fillIntensity,
        speed,
        delta
      );
    }

    if (rimLightRef.current) {
      rimLightRef.current.color.lerp(targetRimColor, Math.min(1, delta * speed));
      rimLightRef.current.intensity = THREE.MathUtils.damp(
        rimLightRef.current.intensity,
        preset.rimIntensity,
        speed,
        delta
      );
    }

    if (hemiLightRef.current) {
      hemiLightRef.current.color.lerp(targetHemiSky, Math.min(1, delta * speed));
      hemiLightRef.current.groundColor.lerp(targetHemiGround, Math.min(1, delta * speed));
      hemiLightRef.current.intensity = THREE.MathUtils.damp(
        hemiLightRef.current.intensity,
        preset.hemiIntensity,
        speed,
        delta
      );
    }

    if (spotLightRef.current) {
      spotLightRef.current.color.lerp(targetSpotColor, Math.min(1, delta * speed));
      spotLightRef.current.intensity = THREE.MathUtils.damp(
        spotLightRef.current.intensity,
        preset.spotIntensity,
        speed,
        delta
      );
    }
  });

  return (
    <group>
      <hemisphereLight
        ref={hemiLightRef}
        args={[preset.hemiSky, preset.hemiGround, preset.hemiIntensity]}
      />
      <directionalLight
        ref={keyLightRef}
        position={preset.keyPos}
        intensity={preset.keyIntensity}
        color={preset.keyColor}
        castShadow
        shadow-mapSize={[1024, 1024]}
        shadow-bias={-0.0005}
      />
      <directionalLight
        ref={fillLightRef}
        position={preset.fillPos}
        intensity={preset.fillIntensity}
        color={preset.fillColor}
      />
      <directionalLight
        ref={rimLightRef}
        position={[0, 4.5, -6.5]}
        intensity={preset.rimIntensity}
        color={preset.rimColor}
      />
      <spotLight
        ref={spotLightRef}
        position={[0, 7.5, 2]}
        intensity={preset.spotIntensity}
        angle={0.68}
        penumbra={0.85}
        color={preset.spotColor}
      />

      <rectAreaLight
        position={[0, 4.2, 0]}
        rotation={[-Math.PI / 2, 0, 0]}
        width={3.2}
        height={5.6}
        intensity={preset.envIntensity * 2.2}
        color={preset.accentStripColor}
      />
      <rectAreaLight
        position={[-3.6, 2.2, 0]}
        rotation={[0, -Math.PI / 2, -0.35]}
        width={4.6}
        height={1.2}
        intensity={preset.fillIntensity * 1.4}
        color={preset.fillColor}
      />
      <rectAreaLight
        position={[3.6, 2.2, 0]}
        rotation={[0, Math.PI / 2, 0.35]}
        width={4.6}
        height={1.2}
        intensity={preset.rimIntensity * 1.4}
        color={preset.rimColor}
      />

      <group position={[0, 3.85, 0]}>
        <mesh position={[-0.85, 0, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <planeGeometry args={[0.14, 5.2]} />
          <meshBasicMaterial color={preset.accentStripColor} side={THREE.DoubleSide} />
        </mesh>
        <mesh position={[0.85, 0, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <planeGeometry args={[0.14, 5.2]} />
          <meshBasicMaterial color={preset.fillColor} side={THREE.DoubleSide} />
        </mesh>
      </group>
    </group>
  );
}

function SculptedWheelAssembly({
  position,
  isLeft,
  isRear,
  rimMaterial,
  tireMaterial,
  caliperMaterial,
  rotorMaterial,
}: {
  position: [number, number, number];
  isLeft: boolean;
  isRear: boolean;
  rimMaterial: THREE.Material;
  tireMaterial: THREE.Material;
  caliperMaterial: THREE.Material;
  rotorMaterial: THREE.Material;
}) {
  const radius = isRear ? 0.37 : 0.35;
  const width = isRear ? 0.32 : 0.27;
  const sideSign = isLeft ? -1 : 1;

  const tireGeometry = useMemo(() => {
    const pts = [
      new THREE.Vector2(radius * 0.72, -width * 0.48),
      new THREE.Vector2(radius * 0.94, -width * 0.5),
      new THREE.Vector2(radius, -width * 0.38),
      new THREE.Vector2(radius * 1.01, 0),
      new THREE.Vector2(radius, width * 0.38),
      new THREE.Vector2(radius * 0.94, width * 0.5),
      new THREE.Vector2(radius * 0.72, width * 0.48),
    ];
    const geo = new THREE.LatheGeometry(pts, 48);
    geo.rotateZ(Math.PI / 2);
    return geo;
  }, [radius, width]);

  const barrelGeometry = useMemo(() => {
    const pts = [
      new THREE.Vector2(radius * 0.68, -width * 0.44),
      new THREE.Vector2(radius * 0.75, -width * 0.46),
      new THREE.Vector2(radius * 0.75, width * 0.46),
      new THREE.Vector2(radius * 0.68, width * 0.44),
    ];
    const geo = new THREE.LatheGeometry(pts, 40);
    geo.rotateZ(Math.PI / 2);
    return geo;
  }, [radius, width]);

  const spokeAngles = useMemo(
    () => Array.from({ length: 10 }, (_, i) => (i * Math.PI * 2) / 10),
    []
  );

  return (
    <group position={position}>
      <mesh geometry={tireGeometry} material={tireMaterial} castShadow receiveShadow />
      <mesh geometry={barrelGeometry} material={rimMaterial} />

      <group position={[sideSign * (width * 0.36), 0, 0]}>
        {spokeAngles.map((angle, idx) => (
          <mesh
            key={idx}
            rotation={[angle, 0, 0]}
            position={[0, Math.cos(angle) * (radius * 0.36), Math.sin(angle) * (radius * 0.36)]}
            material={rimMaterial}
          >
            <boxGeometry args={[0.028, radius * 0.68, 0.028]} />
          </mesh>
        ))}

        <mesh rotation={[0, 0, Math.PI / 2]} material={caliperMaterial}>
          <cylinderGeometry args={[0.065, 0.065, 0.04, 24]} />
        </mesh>
        <mesh rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.042, 0.042, 0.046, 20]} />
          <meshStandardMaterial color="#0b0f17" metalness={0.9} roughness={0.2} />
        </mesh>
      </group>

      <mesh
        position={[sideSign * (width * 0.12), 0, 0]}
        rotation={[0, 0, Math.PI / 2]}
        material={rotorMaterial}
      >
        <cylinderGeometry args={[radius * 0.58, radius * 0.58, 0.035, 36]} />
      </mesh>

      <mesh
        position={[sideSign * (width * 0.16), 0.06, isRear ? 0.16 : -0.16]}
        rotation={[isRear ? -0.4 : 0.4, 0, 0]}
        material={caliperMaterial}
      >
        <boxGeometry args={[0.075, 0.18, 0.11]} />
      </mesh>
    </group>
  );
}

function SculptedSupercar({
  car,
  colorHex,
  wheelCode,
  doorsOpen,
  lightingPreset,
}: {
  car: Car;
  colorHex: string;
  wheelCode: string;
  doorsOpen: boolean;
  lightingPreset: LightingPresetConfig;
}) {
  const leftDoorRef = useRef<THREE.Group>(null);
  const rightDoorRef = useRef<THREE.Group>(null);
  const leftDoorOpenProgress = useRef(0);

  const isSuv = (car.model?.body_type || '').toLowerCase().includes('suv');
  const heightScale = isSuv ? 1.24 : 1.0;

  useFrame((_, delta) => {
    const target = doorsOpen ? 1 : 0;
    leftDoorOpenProgress.current = THREE.MathUtils.damp(
      leftDoorOpenProgress.current,
      target,
      6,
      delta
    );
    const p = leftDoorOpenProgress.current;

    if (leftDoorRef.current) {
      leftDoorRef.current.rotation.y = p * 0.72;
      leftDoorRef.current.rotation.z = p * 0.38;
    }
    if (rightDoorRef.current) {
      rightDoorRef.current.rotation.y = -p * 0.72;
      rightDoorRef.current.rotation.z = -p * 0.38;
    }
  });

  const carPaintMaterial = useMemo(
    () =>
      new THREE.MeshPhysicalMaterial({
        color: new THREE.Color(colorHex),
        metalness: 0.84,
        roughness: 0.13,
        clearcoat: 1.0,
        clearcoatRoughness: 0.035,
        reflectivity: 1.0,
        envMapIntensity: lightingPreset.envIntensity,
      }),
    [colorHex, lightingPreset.envIntensity]
  );

  const satinCarbonMaterial = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: new THREE.Color('#10141d'),
        roughness: 0.26,
        metalness: 0.48,
        envMapIntensity: lightingPreset.envIntensity * 0.85,
      }),
    [lightingPreset.envIntensity]
  );

  const darkGrilleMaterial = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: new THREE.Color('#05070b'),
        roughness: 0.48,
        metalness: 0.82,
      }),
    []
  );

  const glassMaterial = useMemo(
    () =>
      new THREE.MeshPhysicalMaterial({
        color: new THREE.Color('#0c1624'),
        transparent: true,
        opacity: 0.58,
        roughness: 0.03,
        metalness: 0.15,
        clearcoat: 1.0,
        envMapIntensity: lightingPreset.envIntensity * 1.25,
      }),
    [lightingPreset.envIntensity]
  );

  const rimColor =
    wheelCode === 'W02' ? '#141821' : wheelCode === 'W03' ? '#D4AF37' : '#C8D0DC';
  const rimMaterial = useMemo(
    () =>
      new THREE.MeshPhysicalMaterial({
        color: new THREE.Color(rimColor),
        metalness: 0.92,
        roughness: 0.14,
        clearcoat: 0.85,
        envMapIntensity: lightingPreset.envIntensity,
      }),
    [rimColor, lightingPreset.envIntensity]
  );

  const tireMaterial = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: new THREE.Color('#0d0f14'),
        roughness: 0.82,
        metalness: 0.08,
      }),
    []
  );

  const caliperMaterial = useMemo(
    () =>
      new THREE.MeshPhysicalMaterial({
        color: new THREE.Color(lightingPreset.ringColor),
        metalness: 0.65,
        roughness: 0.2,
        clearcoat: 1.0,
      }),
    [lightingPreset.ringColor]
  );

  const rotorMaterial = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: new THREE.Color('#2c323d'),
        metalness: 0.85,
        roughness: 0.32,
      }),
    []
  );

  const mainBodyGeo = useMemo(() => {
    const shape = new THREE.Shape();
    shape.moveTo(-2.18, 0.22);
    shape.quadraticCurveTo(-2.32, 0.45, -2.15, 0.72 * heightScale);
    shape.quadraticCurveTo(-1.65, 0.82 * heightScale, -1.15, 0.78 * heightScale);
    shape.lineTo(0.65, 0.74 * heightScale);
    shape.quadraticCurveTo(1.55, 0.68 * heightScale, 2.18, 0.44);
    shape.quadraticCurveTo(2.34, 0.3, 2.22, 0.16);
    shape.lineTo(-2.18, 0.18);
    shape.closePath();

    const geo = new THREE.ExtrudeGeometry(shape, {
      steps: 2,
      depth: 1.62,
      bevelEnabled: true,
      bevelThickness: 0.18,
      bevelSize: 0.14,
      bevelSegments: 8,
      curveSegments: 32,
    });
    geo.center();
    geo.rotateY(Math.PI / 2);
    return geo;
  }, [heightScale]);

  const cabinCanopyGeo = useMemo(() => {
    const shape = new THREE.Shape();
    shape.moveTo(-1.35, 0.0);
    shape.quadraticCurveTo(-0.75, 0.48 * heightScale, 0.05, 0.49 * heightScale);
    shape.quadraticCurveTo(0.65, 0.46 * heightScale, 1.12, 0.0);
    shape.closePath();

    const geo = new THREE.ExtrudeGeometry(shape, {
      steps: 1,
      depth: 1.18,
      bevelEnabled: true,
      bevelThickness: 0.16,
      bevelSize: 0.12,
      bevelSegments: 8,
      curveSegments: 28,
    });
    geo.center();
    geo.rotateY(Math.PI / 2);
    return geo;
  }, [heightScale]);

  const fenderArchGeo = useMemo(() => {
    const shape = new THREE.Shape();
    shape.moveTo(-0.56, 0.0);
    shape.quadraticCurveTo(-0.52, 0.46, 0.0, 0.48);
    shape.quadraticCurveTo(0.52, 0.46, 0.56, 0.0);
    shape.lineTo(0.42, 0.0);
    shape.quadraticCurveTo(0.38, 0.34, 0.0, 0.36);
    shape.quadraticCurveTo(-0.38, 0.34, -0.42, 0.0);
    shape.closePath();

    const geo = new THREE.ExtrudeGeometry(shape, {
      steps: 1,
      depth: 0.22,
      bevelEnabled: true,
      bevelThickness: 0.07,
      bevelSize: 0.06,
      bevelSegments: 6,
      curveSegments: 24,
    });
    geo.center();
    geo.rotateY(Math.PI / 2);
    return geo;
  }, []);

  return (
    <group position={[0, 0, 0]} dispose={null}>
      <mesh
        position={[0, 0.46 * heightScale, 0.04]}
        geometry={mainBodyGeo}
        material={carPaintMaterial}
        castShadow
        receiveShadow
      />

      <mesh
        position={[0, 0.64 * heightScale, 1.38]}
        rotation={[0.14, 0, 0]}
        material={carPaintMaterial}
        castShadow
      >
        <capsuleGeometry args={[0.38, 0.75, 12, 24]} />
      </mesh>

      <mesh
        position={[-0.36, 0.69 * heightScale, 1.42]}
        rotation={[0.15, 0.08, 0]}
        material={satinCarbonMaterial}
      >
        <boxGeometry args={[0.24, 0.03, 0.54]} />
      </mesh>
      <mesh
        position={[0.36, 0.69 * heightScale, 1.42]}
        rotation={[0.15, -0.08, 0]}
        material={satinCarbonMaterial}
      >
        <boxGeometry args={[0.24, 0.03, 0.54]} />
      </mesh>

      <mesh position={[-0.92, 0.38, 1.38]} geometry={fenderArchGeo} material={carPaintMaterial} castShadow />
      <mesh position={[0.92, 0.38, 1.38]} geometry={fenderArchGeo} material={carPaintMaterial} castShadow />
      <mesh
        position={[-0.96, 0.41, -1.36]}
        scale={[1.08, 1.08, 1.12]}
        geometry={fenderArchGeo}
        material={carPaintMaterial}
        castShadow
      />
      <mesh
        position={[0.96, 0.41, -1.36]}
        scale={[1.08, 1.08, 1.12]}
        geometry={fenderArchGeo}
        material={carPaintMaterial}
        castShadow
      />

      <mesh
        position={[0, 0.89 * heightScale, -0.14]}
        geometry={cabinCanopyGeo}
        material={glassMaterial}
        castShadow
      />

      <mesh
        position={[0, 1.12 * heightScale, -0.18]}
        rotation={[0.03, 0, 0]}
        material={satinCarbonMaterial}
        castShadow
      >
        <boxGeometry args={[1.12, 0.045, 1.25]} />
      </mesh>

      <mesh position={[0, 0.14, 2.28]} material={satinCarbonMaterial} castShadow>
        <boxGeometry args={[1.98, 0.045, 0.46]} />
      </mesh>
      <mesh position={[-0.98, 0.22, 2.22]} rotation={[0.15, 0, -0.2]} material={satinCarbonMaterial}>
        <boxGeometry args={[0.04, 0.16, 0.28]} />
      </mesh>
      <mesh position={[0.98, 0.22, 2.22]} rotation={[0.15, 0, 0.2]} material={satinCarbonMaterial}>
        <boxGeometry args={[0.04, 0.16, 0.28]} />
      </mesh>
      <mesh position={[0, 0.33, 2.27]} rotation={[-0.12, 0, 0]} material={darkGrilleMaterial}>
        <boxGeometry args={[1.18, 0.28, 0.08]} />
      </mesh>
      <mesh position={[-0.76, 0.31, 2.21]} rotation={[-0.1, 0.22, 0]} material={darkGrilleMaterial}>
        <boxGeometry args={[0.36, 0.2, 0.08]} />
      </mesh>
      <mesh position={[0.76, 0.31, 2.21]} rotation={[-0.1, -0.22, 0]} material={darkGrilleMaterial}>
        <boxGeometry args={[0.36, 0.2, 0.08]} />
      </mesh>

      <group position={[-0.72, 0.52 * heightScale, 2.12]} rotation={[0.12, 0.24, -0.06]}>
        <mesh material={darkGrilleMaterial}>
          <boxGeometry args={[0.42, 0.12, 0.14]} />
        </mesh>
        <mesh position={[0, 0.03, 0.06]}>
          <boxGeometry args={[0.38, 0.022, 0.03]} />
          <meshStandardMaterial
            color="#e0ffff"
            emissive="#00e5ff"
            emissiveIntensity={6 * lightingPreset.headlightBoost}
          />
        </mesh>
        <mesh position={[0.02, -0.025, 0.065]} rotation={[0, 0, 0.12]}>
          <boxGeometry args={[0.34, 0.018, 0.03]} />
          <meshStandardMaterial
            color="#ffffff"
            emissive="#38bdf8"
            emissiveIntensity={5 * lightingPreset.headlightBoost}
          />
        </mesh>
      </group>

      <group position={[0.72, 0.52 * heightScale, 2.12]} rotation={[0.12, -0.24, 0.06]}>
        <mesh material={darkGrilleMaterial}>
          <boxGeometry args={[0.42, 0.12, 0.14]} />
        </mesh>
        <mesh position={[0, 0.03, 0.06]}>
          <boxGeometry args={[0.38, 0.022, 0.03]} />
          <meshStandardMaterial
            color="#e0ffff"
            emissive="#00e5ff"
            emissiveIntensity={6 * lightingPreset.headlightBoost}
          />
        </mesh>
        <mesh position={[-0.02, -0.025, 0.065]} rotation={[0, 0, -0.12]}>
          <boxGeometry args={[0.34, 0.018, 0.03]} />
          <meshStandardMaterial
            color="#ffffff"
            emissive="#38bdf8"
            emissiveIntensity={5 * lightingPreset.headlightBoost}
          />
        </mesh>
      </group>

      <pointLight
        position={[-0.75, 0.48, 2.35]}
        color="#00e5ff"
        intensity={2.2 * lightingPreset.headlightBoost}
        distance={3.5}
      />
      <pointLight
        position={[0.75, 0.48, 2.35]}
        color="#00e5ff"
        intensity={2.2 * lightingPreset.headlightBoost}
        distance={3.5}
      />

      <mesh position={[-0.96, 0.15, 0]} material={satinCarbonMaterial} castShadow>
        <boxGeometry args={[0.12, 0.06, 2.15]} />
      </mesh>
      <mesh position={[0.96, 0.15, 0]} material={satinCarbonMaterial} castShadow>
        <boxGeometry args={[0.12, 0.06, 2.15]} />
      </mesh>

      <group position={[-0.93, 0.52 * heightScale, 0.68]} ref={leftDoorRef}>
        <mesh position={[0, -0.02, -0.58]} material={carPaintMaterial} castShadow>
          <boxGeometry args={[0.09, 0.44 * heightScale, 1.18]} />
        </mesh>
        <mesh position={[-0.04, 0.02, -0.95]} rotation={[0, 0.18, 0]} material={satinCarbonMaterial}>
          <boxGeometry args={[0.06, 0.32, 0.28]} />
        </mesh>
        <mesh position={[0.02, 0.3 * heightScale, -0.55]} rotation={[0, 0, -0.22]} material={glassMaterial}>
          <boxGeometry args={[0.03, 0.28 * heightScale, 1.02]} />
        </mesh>
        <group position={[-0.12, 0.2 * heightScale, -0.15]}>
          <mesh material={satinCarbonMaterial}>
            <boxGeometry args={[0.16, 0.03, 0.06]} />
          </mesh>
          <mesh position={[-0.07, 0.03, -0.02]} material={carPaintMaterial}>
            <capsuleGeometry args={[0.045, 0.08, 8, 16]} />
          </mesh>
        </group>
      </group>

      <group position={[0.93, 0.52 * heightScale, 0.68]} ref={rightDoorRef}>
        <mesh position={[0, -0.02, -0.58]} material={carPaintMaterial} castShadow>
          <boxGeometry args={[0.09, 0.44 * heightScale, 1.18]} />
        </mesh>
        <mesh position={[0.04, 0.02, -0.95]} rotation={[0, -0.18, 0]} material={satinCarbonMaterial}>
          <boxGeometry args={[0.06, 0.32, 0.28]} />
        </mesh>
        <mesh position={[-0.02, 0.3 * heightScale, -0.55]} rotation={[0, 0, 0.22]} material={glassMaterial}>
          <boxGeometry args={[0.03, 0.28 * heightScale, 1.02]} />
        </mesh>
        <group position={[0.12, 0.2 * heightScale, -0.15]}>
          <mesh material={satinCarbonMaterial}>
            <boxGeometry args={[0.16, 0.03, 0.06]} />
          </mesh>
          <mesh position={[0.07, 0.03, -0.02]} material={carPaintMaterial}>
            <capsuleGeometry args={[0.045, 0.08, 8, 16]} />
          </mesh>
        </group>
      </group>

      {[-1.25, -1.42, -1.59, -1.76].map((zPos, i) => (
        <mesh
          key={i}
          position={[0, (0.82 - i * 0.03) * heightScale, zPos]}
          rotation={[0.25, 0, 0]}
          material={satinCarbonMaterial}
        >
          <boxGeometry args={[0.88, 0.025, 0.11]} />
        </mesh>
      ))}

      <group position={[0, 1.04 * heightScale, -2.02]}>
        <mesh rotation={[0.12, 0, 0]} material={satinCarbonMaterial} castShadow>
          <boxGeometry args={[1.96, 0.04, 0.38]} />
        </mesh>
        <mesh position={[-0.98, -0.02, 0]} rotation={[0.1, 0, 0]} material={satinCarbonMaterial}>
          <boxGeometry args={[0.03, 0.24, 0.46]} />
        </mesh>
        <mesh position={[0.98, -0.02, 0]} rotation={[0.1, 0, 0]} material={satinCarbonMaterial}>
          <boxGeometry args={[0.03, 0.24, 0.46]} />
        </mesh>
        <mesh position={[-0.42, -0.22, 0.08]} rotation={[-0.22, 0, 0]} material={satinCarbonMaterial}>
          <boxGeometry args={[0.04, 0.44, 0.12]} />
        </mesh>
        <mesh position={[0.42, -0.22, 0.08]} rotation={[-0.22, 0, 0]} material={satinCarbonMaterial}>
          <boxGeometry args={[0.04, 0.44, 0.12]} />
        </mesh>
      </group>

      <mesh position={[0, 0.58 * heightScale, -2.23]}>
        <boxGeometry args={[1.76, 0.038, 0.04]} />
        <meshStandardMaterial color="#ff1e42" emissive="#ff0033" emissiveIntensity={5} />
      </mesh>

      <group position={[0, 0.2, -2.2]}>
        <mesh material={satinCarbonMaterial}>
          <boxGeometry args={[1.82, 0.16, 0.26]} />
        </mesh>
        {[-0.65, -0.35, 0.35, 0.65].map((xFin, idx) => (
          <mesh key={idx} position={[xFin, -0.02, -0.05]} material={satinCarbonMaterial}>
            <boxGeometry args={[0.025, 0.18, 0.3]} />
          </mesh>
        ))}
        {[-0.5, -0.34, 0.34, 0.5].map((xEx, idx) => (
          <mesh key={idx} position={[xEx, 0.02, -0.14]} rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.058, 0.058, 0.16, 24]} />
            <meshStandardMaterial color="#94a3b8" metalness={0.95} roughness={0.15} />
          </mesh>
        ))}
      </group>

      <group position={[0, 0.48 * heightScale, 0]}>
        <mesh position={[0, 0.24, 0.58]} material={satinCarbonMaterial}>
          <boxGeometry args={[1.28, 0.22, 0.42]} />
        </mesh>
        <mesh position={[0, 0.08, 0.05]} material={satinCarbonMaterial}>
          <boxGeometry args={[0.24, 0.18, 1.1]} />
        </mesh>
        <mesh position={[-0.18, 0.32, 0.48]} rotation={[-0.15, 0.1, 0]}>
          <planeGeometry args={[0.56, 0.14]} />
          <meshBasicMaterial color={lightingPreset.ringColor} />
        </mesh>
        <mesh position={[-0.34, 0.27, 0.38]} rotation={[0.35, 0, 0]}>
          <torusGeometry args={[0.13, 0.022, 16, 32]} />
          <meshStandardMaterial color="#0f172a" roughness={0.4} />
        </mesh>
        <mesh position={[-0.34, 0.16, -0.18]} rotation={[-0.15, 0, 0]} material={satinCarbonMaterial}>
          <boxGeometry args={[0.42, 0.58, 0.42]} />
        </mesh>
        <mesh position={[0.34, 0.16, -0.18]} rotation={[-0.15, 0, 0]} material={satinCarbonMaterial}>
          <boxGeometry args={[0.42, 0.58, 0.42]} />
        </mesh>
      </group>

      <SculptedWheelAssembly
        position={[-0.95, 0.35, 1.38]}
        isLeft={true}
        isRear={false}
        rimMaterial={rimMaterial}
        tireMaterial={tireMaterial}
        caliperMaterial={caliperMaterial}
        rotorMaterial={rotorMaterial}
      />
      <SculptedWheelAssembly
        position={[0.95, 0.35, 1.38]}
        isLeft={false}
        isRear={false}
        rimMaterial={rimMaterial}
        tireMaterial={tireMaterial}
        caliperMaterial={caliperMaterial}
        rotorMaterial={rotorMaterial}
      />
      <SculptedWheelAssembly
        position={[-0.99, 0.37, -1.36]}
        isLeft={true}
        isRear={true}
        rimMaterial={rimMaterial}
        tireMaterial={tireMaterial}
        caliperMaterial={caliperMaterial}
        rotorMaterial={rotorMaterial}
      />
      <SculptedWheelAssembly
        position={[0.99, 0.37, -1.36]}
        isLeft={false}
        isRear={true}
        rimMaterial={rimMaterial}
        tireMaterial={tireMaterial}
        caliperMaterial={caliperMaterial}
        rotorMaterial={rotorMaterial}
      />

      <mesh position={[0, 0.005, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[2.55, 2.61, 64]} />
        <meshBasicMaterial color={lightingPreset.ringColor} transparent opacity={0.6} />
      </mesh>
    </group>
  );
}

function CameraRig({
  preset,
  renderMode,
  autoRotate,
}: {
  preset: CameraPreset;
  renderMode: RenderMode;
  autoRotate: boolean;
}) {
  const controlsRef = useRef<any>(null);

  useEffect(() => {
    if (!controlsRef.current) return;
    const ctrl = controlsRef.current;

    if (renderMode === 'photo_3d') {
      if (preset === 'wheel') {
        ctrl.target.set(-0.85, 1.05, 0.15);
        ctrl.object.position.set(-1.1, 1.15, 2.85);
      } else if (preset === 'rear') {
        ctrl.target.set(0.75, 1.25, 0.1);
        ctrl.object.position.set(1.2, 1.35, 3.15);
      } else if (preset === 'hero') {
        ctrl.target.set(0, 1.22, 0);
        ctrl.object.position.set(1.15, 1.45, 3.85);
      } else {
        ctrl.target.set(0, 1.22, 0);
        ctrl.object.position.set(0.0, 1.28, 3.95);
      }
      ctrl.minDistance = 2.0;
      ctrl.maxDistance = 8.5;
      ctrl.update();
      return;
    }

    if (preset === 'cockpit') {
      ctrl.target.set(0, 0.78, 0.15);
      ctrl.object.position.set(-0.32, 0.92, -0.25);
      ctrl.minDistance = 0.2;
      ctrl.maxDistance = 3.0;
    } else if (preset === 'front') {
      ctrl.target.set(0, 0.48, 0.5);
      ctrl.object.position.set(0.0, 1.05, 4.55);
      ctrl.minDistance = 2.4;
      ctrl.maxDistance = 11.0;
    } else if (preset === 'wheel') {
      ctrl.target.set(-0.85, 0.38, 1.35);
      ctrl.object.position.set(-2.65, 0.75, 2.25);
      ctrl.minDistance = 1.8;
      ctrl.maxDistance = 11.0;
    } else if (preset === 'rear') {
      ctrl.target.set(0, 0.62, -0.8);
      ctrl.object.position.set(2.4, 1.45, -4.2);
      ctrl.minDistance = 2.4;
      ctrl.maxDistance = 11.0;
    } else {
      ctrl.target.set(0, 0.48, 0);
      ctrl.object.position.set(3.25, 1.45, 4.15);
      ctrl.minDistance = 2.4;
      ctrl.maxDistance = 11.0;
    }
    ctrl.update();
  }, [preset, renderMode]);

  return (
    <OrbitControls
      ref={controlsRef}
      enablePan={false}
      enableDamping
      dampingFactor={0.06}
      autoRotate={autoRotate && preset !== 'cockpit'}
      autoRotateSpeed={renderMode === 'photo_3d' ? 0.45 : 0.85}
      maxPolarAngle={preset === 'cockpit' ? Math.PI : Math.PI / 2 - 0.04}
      minAzimuthAngle={renderMode === 'photo_3d' ? -Math.PI / 3.2 : -Infinity}
      maxAzimuthAngle={renderMode === 'photo_3d' ? Math.PI / 3.2 : Infinity}
    />
  );
}

export const CarViewer3D: React.FC<CarViewer3DProps> = ({
  car,
  className = 'h-[540px] w-full',
  allowCustomize = true,
  showSideDetails = true,
}) => {
  const colorVariants: CarColorVariant[] = car.model3d?.variants?.colors || [
    { name: 'Obsidian Metallic', hex: '#1B2230' },
    { name: 'Solarbeam Yellow', hex: '#EAB308' },
    { name: 'Emerald Isle Green', hex: '#10B981' },
    { name: 'Crimson Corsa Red', hex: '#E11D48' },
    { name: 'Glacier Ice Silver', hex: '#E2E8F0' },
    { name: 'Cobalt Track Blue', hex: '#0284C7' },
  ];

  const wheelVariants: CarWheelVariant[] = car.model3d?.variants?.wheels || [
    { name: '21" Forged Alloy', code: 'W01', price: 0 },
    { name: '21" Satin Carbon', code: 'W02', price: 14000 },
    { name: '21" Champagne Gold', code: 'W03', price: 4500 },
  ];

  const [activeModelUrl, setActiveModelUrl] = useState<string>(car.model3d?.glb_url || '');
  const hasExternalModel = isCustomExternal3DUrl(activeModelUrl);

  // Automatically default to 'external_3d' when a car has a linked external 3D model URL (like https://skfb.ly/pNSGJ),
  // otherwise default to 'photo_3d'
  const [renderMode, setRenderMode] = useState<RenderMode>(
    hasExternalModel ? 'external_3d' : 'photo_3d'
  );

  // Sync when car prop or car.model3d?.glb_url changes
  useEffect(() => {
    const nextUrl = car.model3d?.glb_url || '';
    setActiveModelUrl(nextUrl);
    if (isCustomExternal3DUrl(nextUrl)) {
      setRenderMode('external_3d');
    }
  }, [car.id, car.model3d?.glb_url]);

  // Listen for global 3D model updates saved from AdminInventory
  useEffect(() => {
    const handleUpdate = (e: Event) => {
      const customEvent = e as CustomEvent;
      if (customEvent.detail?.carId === car.id && customEvent.detail?.data?.glb_url) {
        const newUrl = customEvent.detail.data.glb_url;
        setActiveModelUrl(newUrl);
        if (isCustomExternal3DUrl(newUrl)) {
          setRenderMode('external_3d');
        }
      }
    };
    window.addEventListener('aura-cars-updated', handleUpdate);
    return () => window.removeEventListener('aura-cars-updated', handleUpdate);
  }, [car.id]);

  const [customPhotoUrl, setCustomPhotoUrl] = useState<string | null>(null);
  const [selectedPhotoIdx, setSelectedPhotoIdx] = useState<number>(0);
  const [depthIntensity, setDepthIntensity] = useState<number>(1.15);
  const [shaderView, setShaderView] = useState<PhotoShaderView>('textured');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const glbFileInputRef = useRef<HTMLInputElement>(null);

  // Modal state for adding/editing a 3D Model Link directly inside the viewer
  const [linkModalOpen, setLinkModalOpen] = useState(false);
  const [linkInputUrl, setLinkInputUrl] = useState(
    isCustomExternal3DUrl(activeModelUrl) ? activeModelUrl : 'https://skfb.ly/pNSGJ'
  );
  const [linkSaving, setLinkSaving] = useState(false);
  const [glbLoadStatus, setGlbLoadStatus] = useState<'loading' | 'loaded' | 'error'>('loaded');
  const [glbErrorMsg, setGlbErrorMsg] = useState<string | null>(null);
  const [tintCustomGlb, setTintCustomGlb] = useState(false);

  const [selectedColor, setSelectedColor] = useState<CarColorVariant>(colorVariants[0]);
  const [selectedWheel, setSelectedWheel] = useState<CarWheelVariant>(wheelVariants[0]);
  const [lightingPresetId, setLightingPresetId] = useState<LightingPresetId>('studio_soft');
  const [doorsOpen, setDoorsOpen] = useState(false);
  const [cameraPreset, setCameraPreset] = useState<CameraPreset>('front');
  const [autoRotate, setAutoRotate] = useState(false);
  const [sideCalloutsVisible, setSideCalloutsVisible] = useState(showSideDetails);
  const [dockCollapsed, setDockCollapsed] = useState(false);

  const activeLighting = LIGHTING_PRESETS[lightingPresetId];
  const monthlyEst = Math.round(car.price / 60);

  const activePhotoUrl =
    customPhotoUrl ||
    car.images?.[selectedPhotoIdx]?.url ||
    car.images?.[0]?.url ||
    FALLBACK_CAR_PHOTO;

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const objectUrl = URL.createObjectURL(file);
    setCustomPhotoUrl(objectUrl);
    setRenderMode('photo_3d');
  };

  const handleGlbFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const objectUrl = URL.createObjectURL(file);
    setActiveModelUrl(objectUrl);
    setLinkInputUrl(objectUrl);
    setRenderMode('external_3d');
    setLinkModalOpen(false);
    await api.saveCar3DModel(car.id, {
      glb_url: objectUrl,
      variants: car.model3d?.variants,
    });
  };

  const handleSaveModelLink = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleaned = linkInputUrl.trim();
    if (!cleaned) return;
    setLinkSaving(true);
    try {
      await api.saveCar3DModel(car.id, {
        glb_url: cleaned,
        variants: car.model3d?.variants,
      });
      setActiveModelUrl(cleaned);
      setRenderMode('external_3d');
      setLinkModalOpen(false);
    } finally {
      setLinkSaving(false);
    }
  };

  const isExternalSketchfab = renderMode === 'external_3d' && isSketchfabUrl(activeModelUrl);

  return (
    <div
      className={`relative overflow-hidden rounded-2xl bg-[#05080D] border border-cyan-500/20 select-none ${className}`}
    >
      {/* Hidden File Input for Converting Any User Car Image to 3D */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handlePhotoUpload}
        className="hidden"
      />
      {/* Hidden File Input for Uploading Local .GLB / .GLTF 3D File */}
      <input
        ref={glbFileInputRef}
        type="file"
        accept=".glb,.gltf"
        onChange={handleGlbFileUpload}
        className="hidden"
      />

      {/* Dynamic Environmental Atmospheric Stage Glow */}
      <div
        className="absolute inset-0 pointer-events-none transition-all duration-500"
        style={{
          background: activeLighting.backdropGradient,
        }}
      />

      {/* Top Architectural Accent Line */}
      <div className="absolute top-0 left-12 right-12 h-[1px] bg-gradient-to-r from-transparent via-cyan-400/50 to-transparent z-10 pointer-events-none" />

      {/* Top Studio Header: Mode Switcher & Lighting Presets */}
      <div className="absolute top-4 left-5 right-5 z-20 flex flex-wrap items-center justify-between gap-2.5 pointer-events-none">
        {/* Left: 3D Mode Switcher (Linked 3D Model / Real Photo -> 3D / 360° 3D Model) */}
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-[#0B121C]/95 border border-white/[0.12] pointer-events-auto shadow-lg">
          <button
            type="button"
            onClick={() => {
              if (hasExternalModel) {
                setRenderMode('external_3d');
              } else {
                setLinkModalOpen(true);
              }
            }}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 whitespace-nowrap shrink-0 ${
              renderMode === 'external_3d'
                ? 'bg-purple-600 text-white shadow-sm'
                : hasExternalModel
                ? 'text-purple-300 hover:text-white bg-purple-500/15 border border-purple-500/30'
                : 'text-slate-300 hover:text-white'
            }`}
            title="View or Link External 3D Model URL (Sketchfab / GLB)"
          >
            <Link2 className="w-3.5 h-3.5" />
            <span>{hasExternalModel ? 'Linked 3D Model' : 'Add 3D Model Link'}</span>
          </button>

          <button
            type="button"
            onClick={() => setRenderMode('photo_3d')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 whitespace-nowrap shrink-0 ${
              renderMode === 'photo_3d'
                ? 'bg-cyan-500 text-slate-950 shadow-sm'
                : 'text-slate-300 hover:text-white'
            }`}
            title="Convert Real Vehicle Photo into Interactive 3D Depth-Sculpted Mesh"
          >
            <ImageIcon className="w-3.5 h-3.5" />
            <span>Real Photo → 3D</span>
          </button>

          <button
            type="button"
            onClick={() => setRenderMode('sculpted_3d')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 whitespace-nowrap shrink-0 ${
              renderMode === 'sculpted_3d'
                ? 'bg-cyan-500 text-slate-950 shadow-sm'
                : 'text-slate-300 hover:text-white'
            }`}
            title="Full 360° Sculpted 3D Vehicle Mesh"
          >
            <Box className="w-3.5 h-3.5" />
            <span>360° 3D Studio</span>
          </button>

          <button
            type="button"
            onClick={() => setLinkModalOpen(true)}
            className="px-2.5 py-1.5 rounded-lg text-[11px] font-medium bg-purple-600/25 hover:bg-purple-600/40 text-purple-200 border border-purple-500/40 flex items-center gap-1 whitespace-nowrap shrink-0 transition-colors"
            title="Paste Sketchfab link (e.g. https://skfb.ly/pNSGJ) or GLB URL"
          >
            <Link2 className="w-3 h-3" />
            <span className="hidden sm:inline">Link URL</span>
          </button>
        </div>

        {/* Center: Dynamic Environmental Lighting Switcher */}
        {!isExternalSketchfab && (
          <div className="flex items-center gap-1 p-1 rounded-xl bg-[#0B121C]/95 border border-white/[0.12] pointer-events-auto shadow-lg">
            {(
              [
                { id: 'studio_soft', label: 'Studio Soft', icon: Sparkles },
                { id: 'sunset_glow', label: 'Sunset Glow', icon: Sunset },
                { id: 'daylight_bright', label: 'Daylight Bright', icon: Sun },
                { id: 'midnight_neon', label: 'Midnight Cyber', icon: Moon },
              ] as { id: LightingPresetId; label: string; icon: React.FC<{ className?: string }> }[]
            ).map((preset) => {
              const Icon = preset.icon;
              const isSelected = lightingPresetId === preset.id;
              return (
                <button
                  key={preset.id}
                  type="button"
                  onClick={() => setLightingPresetId(preset.id)}
                  className={`px-2.5 py-1.5 rounded-lg text-[11px] font-medium transition-all flex items-center gap-1.5 whitespace-nowrap shrink-0 ${
                    isSelected
                      ? preset.id === 'sunset_glow'
                        ? 'bg-orange-500 text-slate-950 font-semibold'
                        : preset.id === 'daylight_bright'
                        ? 'bg-white text-slate-950 font-semibold'
                        : preset.id === 'midnight_neon'
                        ? 'bg-rose-600 text-white font-semibold'
                        : 'bg-cyan-500 text-slate-950 font-semibold'
                      : 'text-slate-400 hover:text-white'
                  }`}
                  title={`Switch 3D environment lighting to ${preset.label}`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">{preset.label}</span>
                </button>
              );
            })}
          </div>
        )}

        {/* Right: Quick Interactive Studio Controls */}
        <div className="flex items-center gap-1.5 pointer-events-auto">
          <button
            type="button"
            onClick={() => setSideCalloutsVisible(!sideCalloutsVisible)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors border flex items-center gap-1.5 whitespace-nowrap shrink-0 ${
              sideCalloutsVisible
                ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40'
                : 'bg-[#0B121C]/90 text-slate-300 border-white/[0.1] hover:text-white'
            }`}
            title="Toggle Left & Right Side Architectural Spec Callouts"
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>Side Specs</span>
          </button>

          {renderMode === 'sculpted_3d' && (
            <>
              <button
                type="button"
                onClick={() =>
                  setCameraPreset(cameraPreset === 'cockpit' ? 'front' : 'cockpit')
                }
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors border flex items-center gap-1.5 whitespace-nowrap shrink-0 ${
                  cameraPreset === 'cockpit'
                    ? 'bg-cyan-500 text-slate-950 font-semibold border-cyan-400'
                    : 'bg-[#0B121C]/90 text-slate-300 border-white/[0.1] hover:text-white'
                }`}
              >
                <Eye className="w-3.5 h-3.5" />
                <span>{cameraPreset === 'cockpit' ? 'Exterior' : 'Cockpit'}</span>
              </button>

              <button
                type="button"
                onClick={() => setDoorsOpen(!doorsOpen)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors border flex items-center gap-1.5 whitespace-nowrap shrink-0 ${
                  doorsOpen
                    ? 'bg-cyan-500 text-slate-950 font-semibold border-cyan-400'
                    : 'bg-[#0B121C]/90 text-slate-300 border-white/[0.1] hover:text-white'
                }`}
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>{doorsOpen ? 'Close Doors' : 'Open Doors'}</span>
              </button>
            </>
          )}

          {!isExternalSketchfab && (
            <button
              type="button"
              onClick={() => {
                if (!autoRotate && cameraPreset !== 'hero') {
                  setCameraPreset('hero');
                }
                setAutoRotate(!autoRotate);
              }}
              className={`p-1.5 rounded-lg text-xs transition-colors border ${
                autoRotate
                  ? 'bg-cyan-500/25 text-cyan-300 border-cyan-500/50'
                  : 'bg-[#0B121C]/90 text-slate-400 border-white/[0.1] hover:text-white'
              }`}
              title="Toggle 3D Motion Sweep"
            >
              <CircleDot className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* ==================== LEFT & RIGHT ARCHITECTURAL SIDE CALLOUTS ==================== */}
      {sideCalloutsVisible && cameraPreset !== 'cockpit' && (
        <>
          {/* LEFT SIDE ARCHITECTURAL CALLOUTS WITH LEADER LINES */}
          <div className="hidden md:flex flex-col justify-between absolute left-6 top-20 bottom-24 w-64 z-10 pointer-events-none">
            <button
              type="button"
              onClick={() => {
                setCameraPreset('hero');
                setAutoRotate(false);
              }}
              className="group text-left pointer-events-auto focus:outline-none bg-[#05080D]/60 p-2.5 rounded-xl border border-white/[0.05]"
            >
              <div className="flex items-center mb-2">
                <div className="w-24 h-3 border-t border-l border-cyan-400/60 group-hover:border-cyan-300 transition-colors" />
                <div className="flex-1 h-[1px] bg-cyan-400/60 group-hover:bg-cyan-300 transition-colors" />
                <span className="w-2 h-2 rounded-full bg-cyan-400 shadow-[0_0_8px_#22d3ee]" />
              </div>

              <div className="pr-2 space-y-1">
                <span className="text-[10px] font-mono uppercase tracking-widest text-cyan-400 block">
                  01 · Body & Aero Architecture
                </span>
                <h4 className="text-base font-bold text-white font-display group-hover:text-cyan-300 transition-colors">
                  {car.model?.body_type || 'Coupe'} Monocoque
                </h4>
                <p className="text-[11px] text-slate-300 leading-relaxed">
                  {renderMode === 'external_3d' ? (
                    <>
                      Interactive 3D asset linked from{' '}
                      <span className="text-cyan-300 font-mono">
                        {activeModelUrl.replace(/^https?:\/\//, '').slice(0, 26)}
                      </span>
                      .
                    </>
                  ) : renderMode === 'photo_3d' ? (
                    <>
                      Real photograph converted into a{' '}
                      <span className="text-slate-100">16,000-vertex 3D relief mesh</span> under{' '}
                      <span className="text-slate-100">{activeLighting.label}</span>.
                    </>
                  ) : (
                    <>
                      Finished in <span className="text-slate-100">{selectedColor.name}</span> under{' '}
                      <span className="text-slate-100">{activeLighting.label}</span> ({activeLighting.kelvin}).
                    </>
                  )}
                </p>
              </div>
            </button>

            <button
              type="button"
              onClick={() => {
                setCameraPreset('wheel');
                setAutoRotate(false);
              }}
              className="group text-left pointer-events-auto focus:outline-none bg-[#05080D]/60 p-2.5 rounded-xl border border-white/[0.05]"
            >
              <div className="flex items-center mb-2">
                <div className="w-20 h-3 border-t border-l border-cyan-400/60 group-hover:border-cyan-300 transition-colors" />
                <div className="flex-1 h-[1px] bg-cyan-400/60 group-hover:bg-cyan-300 transition-colors" />
                <span className="w-2 h-2 rounded-full bg-cyan-400 shadow-[0_0_8px_#22d3ee]" />
              </div>

              <div className="pr-2 space-y-1">
                <span className="text-[10px] font-mono uppercase tracking-widest text-cyan-400 block">
                  02 · Chassis & Telemetry
                </span>
                <h4 className="text-base font-bold text-white font-display group-hover:text-cyan-300 transition-colors">
                  {selectedWheel.name}
                </h4>
                <p className="text-[11px] text-slate-300 leading-relaxed font-mono tabular-nums">
                  Odometer: <span className="text-white">{car.mileage.toLocaleString()} mi</span> · 6-Piston PCCB Ceramic Rotors.
                </p>
              </div>
            </button>
          </div>

          {/* RIGHT SIDE ARCHITECTURAL CALLOUTS WITH LEADER LINES */}
          <div className="hidden md:flex flex-col justify-between absolute right-6 top-20 bottom-24 w-64 z-10 pointer-events-none">
            <button
              type="button"
              onClick={() => {
                setCameraPreset('rear');
                setAutoRotate(false);
              }}
              className="group text-right pointer-events-auto focus:outline-none bg-[#05080D]/60 p-2.5 rounded-xl border border-white/[0.05]"
            >
              <div className="flex items-center mb-2">
                <span className="w-2 h-2 rounded-full bg-cyan-400 shadow-[0_0_8px_#22d3ee]" />
                <div className="flex-1 h-[1px] bg-cyan-400/60 group-hover:bg-cyan-300 transition-colors" />
                <div className="w-24 h-3 border-t border-r border-cyan-400/60 group-hover:border-cyan-300 transition-colors" />
              </div>

              <div className="pl-2 space-y-1">
                <span className="text-[10px] font-mono uppercase tracking-widest text-cyan-400 block">
                  03 · Powertrain & Drivetrain
                </span>
                <h4 className="text-base font-bold text-white font-display group-hover:text-cyan-300 transition-colors">
                  {car.fuel} · {car.transmission.split(' ')[0]}
                </h4>
                <p className="text-[11px] text-slate-300 leading-relaxed">
                  JEVIC-verified factory calibration with active torque vectoring and launch control.
                </p>
              </div>
            </button>

            <button
              type="button"
              onClick={() => {
                setCameraPreset('front');
                setAutoRotate(false);
              }}
              className="group text-right pointer-events-auto focus:outline-none bg-[#05080D]/60 p-2.5 rounded-xl border border-white/[0.05]"
            >
              <div className="flex items-center mb-2">
                <span className="w-2 h-2 rounded-full bg-cyan-400 shadow-[0_0_8px_#22d3ee]" />
                <div className="flex-1 h-[1px] bg-cyan-400/60 group-hover:bg-cyan-300 transition-colors" />
                <div className="w-20 h-3 border-t border-r border-cyan-400/60 group-hover:border-cyan-300 transition-colors" />
              </div>

              <div className="pl-2 space-y-1">
                <span className="text-[10px] font-mono uppercase tracking-widest text-cyan-400 block">
                  04 · Direct Showroom Valuation
                </span>
                <h4 className="text-base font-bold text-white font-mono tabular-nums group-hover:text-cyan-300 transition-colors">
                  ${car.price.toLocaleString()}{' '}
                  <span className="text-xs font-normal text-slate-400">
                    (${monthlyEst.toLocaleString()}/mo)
                  </span>
                </h4>
                <p className="text-[11px] text-slate-300 leading-relaxed">
                  {car.showroom?.name || 'Manhattan Flagship'}
                  {car.slot ? ` · Bay ${car.slot.label}` : ''} · VIN {car.vin}
                </p>
              </div>
            </button>
          </div>
        </>
      )}

      {/* ==================== 3D STUDIO VIEWPORT (SKETCHFAB EMBED OR THREE.JS CANVAS) ==================== */}
      {isExternalSketchfab ? (
        <Sketchfab3DStage
          url={activeModelUrl}
          carTitle={car.title}
          onOpenLinkModal={() => setLinkModalOpen(true)}
        />
      ) : (
        <Canvas shadows camera={{ position: [0.0, 1.28, 3.95], fov: 38 }}>
          <PerspectiveCamera makeDefault position={[0.0, 1.28, 3.95]} fov={38} />

          {/* Dynamic Procedural IBL Reflections */}
          <DynamicStudioEnvironment presetId={lightingPresetId} />

          {/* Dynamic Multi-Light & Softbox Rig with Smooth Damping */}
          <DynamicLightingRig preset={activeLighting} />

          {renderMode === 'external_3d' && hasExternalModel ? (
            <ExternalGLBMesh
              url={activeModelUrl}
              colorHex={selectedColor.hex}
              tintCustomPaint={tintCustomGlb}
              lightingPreset={activeLighting}
              onLoadStatus={(status, msg) => {
                setGlbLoadStatus(status);
                setGlbErrorMsg(msg || null);
              }}
            />
          ) : renderMode === 'photo_3d' ? (
            <RealPhotoTo3DMesh
              imageUrl={activePhotoUrl}
              depthIntensity={depthIntensity}
              shaderView={shaderView}
              lightingPreset={activeLighting}
            />
          ) : (
            <SculptedSupercar
              car={car}
              colorHex={selectedColor.hex}
              wheelCode={selectedWheel.code}
              doorsOpen={doorsOpen}
              lightingPreset={activeLighting}
            />
          )}

          {/* Soft Studio Contact Shadow Grounding */}
          <ContactShadows
            position={[0, 0, 0]}
            opacity={0.85}
            scale={11}
            blur={2.1}
            far={4}
            resolution={512}
            color="#000000"
          />

          {/* Smooth Camera Controller */}
          <CameraRig preset={cameraPreset} renderMode={renderMode} autoRotate={autoRotate} />
        </Canvas>
      )}

      {/* Loading / Error Overlay for Direct GLB Mesh */}
      {renderMode === 'external_3d' && !isExternalSketchfab && glbLoadStatus === 'loading' && (
        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-[#05080D]/80 pointer-events-none">
          <div className="w-9 h-9 border-2 border-purple-400 border-t-transparent rounded-full animate-spin mb-2" />
          <p className="text-xs font-mono text-purple-300 uppercase tracking-wider">
            Loading External GLB 3D Mesh...
          </p>
        </div>
      )}

      {renderMode === 'external_3d' && !isExternalSketchfab && glbLoadStatus === 'error' && (
        <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-[#05080D]/90 p-6 text-center space-y-3">
          <AlertCircle className="w-8 h-8 text-amber-400" />
          <p className="text-sm font-semibold text-white">
            Could not load binary .GLB from this URL
          </p>
          <p className="text-xs text-slate-400 max-w-md font-mono break-all">
            {glbErrorMsg || activeModelUrl}
          </p>
          <div className="flex items-center gap-2 pt-1">
            <button
              type="button"
              onClick={() => setLinkModalOpen(true)}
              className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold"
            >
              Change 3D Link / Try Preset
            </button>
            <button
              type="button"
              onClick={() => setRenderMode('photo_3d')}
              className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold"
            >
              Switch to Real Photo → 3D
            </button>
          </div>
        </div>
      )}

      {/* ==================== ADD / CONFIGURE 3D MODEL LINK MODAL ==================== */}
      {linkModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 animate-fadeIn">
          <form
            onSubmit={handleSaveModelLink}
            className="relative w-full max-w-lg rounded-3xl bg-slate-900 border border-slate-700 shadow-2xl p-6 space-y-4 text-left"
          >
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold text-white font-display">
                  3D Asset Configuration
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">{car.title}</p>
              </div>
              <button
                type="button"
                onClick={() => setLinkModalOpen(false)}
                className="p-2 rounded-full hover:bg-slate-800 text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-sm">
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                  GLB Model Asset URL or Sketchfab 3D Link
                </label>
                <input
                  type="text"
                  required
                  placeholder="https://skfb.ly/pNSGJ or https://.../model.glb"
                  value={linkInputUrl}
                  onChange={(e) => setLinkInputUrl(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white font-mono text-xs focus:outline-none focus:border-purple-500"
                />
              </div>

              {/* Quick Verified 3D Model Presets */}
              <div className="space-y-1.5">
                <span className="text-[11px] font-semibold text-slate-400 block">
                  Quick-Load Verified 3D Links (or Upload Local .GLB):
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {SAMPLE_3D_MODEL_LINKS.map((item) => (
                    <button
                      key={item.url}
                      type="button"
                      onClick={() => setLinkInputUrl(item.url)}
                      className={`px-2.5 py-1.5 rounded-lg text-[11px] font-medium border transition-colors flex items-center gap-1.5 ${
                        linkInputUrl.trim() === item.url
                          ? 'bg-purple-600/30 border-purple-400 text-white'
                          : 'bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700'
                      }`}
                    >
                      <Link2 className="w-3 h-3 text-purple-400" />
                      <span>{item.label}</span>
                    </button>
                  ))}

                  <button
                    type="button"
                    onClick={() => glbFileInputRef.current?.click()}
                    className="px-2.5 py-1.5 rounded-lg text-[11px] font-medium bg-cyan-500/15 hover:bg-cyan-500/25 border border-cyan-500/30 text-cyan-300 flex items-center gap-1"
                  >
                    <Upload className="w-3 h-3" />
                    <span>Upload .GLB File</span>
                  </button>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-400 space-y-2">
                <p className="font-bold text-white flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-purple-400" />
                  <span>3D Features Enabled for Kiosk & Web:</span>
                </p>
                <ul className="list-disc pl-4 space-y-1">
                  <li>Supports Sketchfab shortlinks (<code className="text-purple-300">https://skfb.ly/pNSGJ</code>) & 3D URLs</li>
                  <li>Supports direct <code className="text-cyan-300">.glb</code> / <code className="text-cyan-300">.gltf</code> binary mesh links & file uploads</li>
                  <li>Full 360° Orbit Controls with left & right architectural spec callouts</li>
                  <li>Persists automatically across Showroom Portal, Kiosk & Admin</li>
                </ul>
              </div>
            </div>

            <button
              type="submit"
              disabled={linkSaving}
              className="w-full py-3.5 rounded-2xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-sm uppercase tracking-wider transition-all shadow-lg"
            >
              {linkSaving ? 'Saving 3D Configuration...' : 'Save 3D Configuration & Show Model'}
            </button>
          </form>
        </div>
      )}

      {/* ==================== UNIFIED COLLAPSIBLE BOTTOM STUDIO DOCK ==================== */}
      {allowCustomize && (
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-20 w-[94%] max-w-[940px] flex flex-col items-center">
          <button
            type="button"
            onClick={() => setDockCollapsed(!dockCollapsed)}
            className="px-3 py-1 rounded-t-lg bg-[#0B121C] border border-b-0 border-white/[0.12] text-[11px] font-mono text-slate-300 hover:text-white flex items-center gap-1 transition-colors"
          >
            {dockCollapsed ? (
              <>
                <ChevronUp className="w-3 h-3 text-cyan-400" />
                <span>Show 3D Studio Controls</span>
              </>
            ) : (
              <>
                <ChevronDown className="w-3 h-3 text-cyan-400" />
                <span>Hide Controls</span>
              </>
            )}
          </button>

          {!dockCollapsed && (
            <div className="w-full px-4 py-3 rounded-2xl bg-[#0B121C]/95 border border-white/[0.12] shadow-2xl flex flex-wrap items-center justify-between gap-4">
              {renderMode === 'external_3d' ? (
                <>
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span className="px-2.5 py-1 rounded-lg bg-purple-500/20 border border-purple-500/40 text-purple-300 text-xs font-semibold flex items-center gap-1.5 shrink-0">
                      <CheckCircle2 className="w-3.5 h-3.5 text-purple-400" />
                      <span>{isExternalSketchfab ? 'Sketchfab 3D Active' : 'External GLB Active'}</span>
                    </span>
                    <span className="text-xs font-mono text-slate-300 truncate max-w-[260px] sm:max-w-[360px]">
                      {activeModelUrl}
                    </span>
                  </div>

                  {!isExternalSketchfab && (
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-slate-400">Tint GLB Paint:</span>
                      {colorVariants.map((c) => (
                        <button
                          key={c.name}
                          type="button"
                          onClick={() => {
                            setSelectedColor(c);
                            setTintCustomGlb(true);
                          }}
                          className={`w-5 h-5 rounded-full border transition-transform ${
                            tintCustomGlb && selectedColor.name === c.name
                              ? 'scale-125 border-white ring-2 ring-purple-400'
                              : 'border-white/20 hover:scale-110'
                          }`}
                          style={{ backgroundColor: c.hex }}
                          title={`Tint GLB with ${c.name}`}
                        />
                      ))}
                    </div>
                  )}

                  <div className="flex items-center gap-2 ml-auto">
                    <button
                      type="button"
                      onClick={() => setLinkModalOpen(true)}
                      className="px-3 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors"
                    >
                      <Link2 className="w-3.5 h-3.5" />
                      <span>Change 3D Model Link</span>
                    </button>

                    {activeModelUrl.startsWith('http') && (
                      <a
                        href={activeModelUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-1.5 rounded-xl bg-white/[0.06] hover:bg-white/[0.12] text-slate-300 hover:text-white border border-white/[0.1] transition-colors"
                        title="Open Original 3D Source URL"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    )}
                  </div>
                </>
              ) : renderMode === 'photo_3d' ? (
                <>
                  {/* Photo Angle / Source Selector */}
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-300 font-medium flex items-center gap-1.5">
                      <ImageIcon className="w-3.5 h-3.5 text-cyan-400" />
                      <span>Source Photo:</span>
                    </span>
                    <div className="flex items-center gap-1.5">
                      {(car.images && car.images.length > 0
                        ? car.images
                        : [{ id: 1, url: FALLBACK_CAR_PHOTO }]
                      ).map((img, idx) => (
                        <button
                          key={img.id || idx}
                          type="button"
                          onClick={() => {
                            setCustomPhotoUrl(null);
                            setSelectedPhotoIdx(idx);
                          }}
                          className={`w-10 h-7 rounded-md overflow-hidden border transition-all ${
                            !customPhotoUrl && selectedPhotoIdx === idx
                              ? 'border-cyan-400 scale-110 ring-1 ring-cyan-400'
                              : 'border-white/15 opacity-60 hover:opacity-100'
                          }`}
                        >
                          <img
                            src={img.url}
                            alt={`Angle ${idx + 1}`}
                            className="w-full h-full object-cover"
                          />
                        </button>
                      ))}
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="px-2.5 py-1 rounded-md bg-[#141E30] hover:bg-white/[0.1] border border-cyan-500/30 text-[11px] font-medium text-cyan-300 flex items-center gap-1 whitespace-nowrap shrink-0"
                      >
                        <Upload className="w-3 h-3" />
                        <span>Custom Photo</span>
                      </button>
                    </div>
                  </div>

                  {/* 3D Depth Relief Extrusion Slider */}
                  <div className="flex items-center gap-2.5">
                    <span className="text-xs text-slate-300 font-medium flex items-center gap-1">
                      <Layers className="w-3.5 h-3.5 text-cyan-400" />
                      <span>3D Depth Relief:</span>
                    </span>
                    <input
                      type="range"
                      min="0.2"
                      max="2.2"
                      step="0.1"
                      value={depthIntensity}
                      onChange={(e) => setDepthIntensity(Number(e.target.value))}
                      className="w-24 cursor-pointer"
                    />
                    <span className="text-xs font-mono tabular-nums text-cyan-400">
                      {Math.round(depthIntensity * 100)}%
                    </span>
                  </div>

                  {/* 3D Surface Inspector Mode (Photo 3D / Normal Map / 3D Mesh Wireframe) */}
                  <div className="flex items-center gap-1 bg-[#060A10] p-1 rounded-xl border border-white/[0.08]">
                    {(
                      [
                        { id: 'textured', label: '3D Photo' },
                        { id: 'normal_map', label: '3D Normals' },
                        { id: 'wireframe', label: '3D Mesh' },
                      ] as { id: PhotoShaderView; label: string }[]
                    ).map((mode) => (
                      <button
                        key={mode.id}
                        type="button"
                        onClick={() => setShaderView(mode.id)}
                        className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition-colors whitespace-nowrap shrink-0 ${
                          shaderView === mode.id
                            ? 'bg-cyan-500 text-slate-950 font-semibold'
                            : 'text-slate-400 hover:text-white'
                        }`}
                      >
                        {mode.label}
                      </button>
                    ))}
                  </div>
                </>
              ) : (
                <>
                  {/* 1. Paint Finish Swatches */}
                  <div className="flex items-center gap-2.5">
                    <div className="flex items-center gap-1.5 text-xs text-slate-300 font-medium">
                      <Palette className="w-3.5 h-3.5 text-cyan-400" />
                      <span className="hidden sm:inline">Finish:</span>
                      <span className="text-white font-semibold">{selectedColor.name}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      {colorVariants.map((c) => (
                        <button
                          key={c.name}
                          type="button"
                          onClick={() => setSelectedColor(c)}
                          className={`w-6 h-6 rounded-full transition-transform border ${
                            selectedColor.name === c.name
                              ? 'scale-125 border-white ring-2 ring-cyan-400/80'
                              : 'border-white/20 hover:scale-110'
                          }`}
                          style={{ backgroundColor: c.hex }}
                          title={c.name}
                        />
                      ))}
                    </div>
                  </div>

                  {/* 2. Camera Studio Angle Presets */}
                  <div className="flex items-center gap-1 bg-[#060A10] p-1 rounded-xl border border-white/[0.08]">
                    <Camera className="w-3.5 h-3.5 text-cyan-400 ml-1.5 mr-1 hidden sm:inline" />
                    {(
                      [
                        { id: 'front', label: 'Front Studio' },
                        { id: 'hero', label: '3/4 Hero' },
                        { id: 'wheel', label: 'Forged Wheel' },
                        { id: 'rear', label: 'Rear Aero' },
                        { id: 'cockpit', label: 'Cockpit' },
                      ] as { id: CameraPreset; label: string }[]
                    ).map((cam) => (
                      <button
                        key={cam.id}
                        type="button"
                        onClick={() => {
                          setCameraPreset(cam.id);
                          setAutoRotate(false);
                        }}
                        className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition-colors whitespace-nowrap shrink-0 ${
                          cameraPreset === cam.id
                            ? 'bg-cyan-500 text-slate-950 font-semibold'
                            : 'text-slate-400 hover:text-white'
                        }`}
                      >
                        {cam.label}
                      </button>
                    ))}
                  </div>

                  {/* 3. Forged Wheel Selector */}
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs text-slate-400 hidden lg:inline">Wheels:</span>
                    {wheelVariants.map((w) => (
                      <button
                        key={w.code}
                        type="button"
                        onClick={() => setSelectedWheel(w)}
                        className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition-colors whitespace-nowrap shrink-0 ${
                          selectedWheel.code === w.code
                            ? 'bg-white text-slate-950 font-semibold'
                            : 'bg-[#141C2B] text-slate-300 hover:text-white'
                        }`}
                      >
                        {w.name.replace('21" ', '')}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
