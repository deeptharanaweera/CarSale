import React, { useRef, useState, useEffect, useMemo } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, ContactShadows, PerspectiveCamera } from '@react-three/drei';
import * as THREE from 'three';
import { RectAreaLightUniformsLib } from 'three/examples/jsm/lights/RectAreaLightUniformsLib.js';
import { Car, CarColorVariant, CarWheelVariant } from '../../types';
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
 * Builds a tailored procedural 3D light-dome scene for PMREMGenerator
 * so metallic clearcoat paint and glass reflect authentic softboxes, sunset horizons,
 * bright daylight skies, or nocturnal neon light arches.
 */
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
    // Overhead elongated studio softbox strips
    addPanel([0, 12, 0], [0, 0, 0], [10, 0.2, 18], '#ffffff', 4.5);
    addPanel([-8, 6, 0], [0, 0, -0.5], [0.2, 5, 16], '#bae6fd', 2.8);
    addPanel([8, 6, 0], [0, 0, 0.5], [0.2, 5, 16], '#e0f2fe', 2.8);
    addPanel([0, 4, 12], [0.3, 0, 0], [12, 4, 0.2], '#38bdf8', 2.2);
    addPanel([0, 4, -12], [-0.3, 0, 0], [12, 3, 0.2], '#94a3b8', 1.8);
  } else if (presetId === 'sunset_glow') {
    envScene.background = new THREE.Color('#12091c');
    // Blazing low golden-hour horizon band & sun disc
    addPanel([10, 3.5, 8], [0, -0.6, 0], [8, 4.5, 0.3], '#ff6b1a', 6.5);
    addPanel([0, 2.2, 13], [0, 0, 0], [22, 2.5, 0.3], '#fb923c', 4.2);
    addPanel([0, 2.2, -13], [0, 0, 0], [22, 2.5, 0.3], '#ec4899', 3.0);
    addPanel([-11, 5, 0], [0, 0, -0.4], [0.3, 5, 18], '#a855f7', 2.6);
    addPanel([0, 13, 0], [0, 0, 0], [12, 0.2, 16], '#fde68a', 3.2);
  } else if (presetId === 'daylight_bright') {
    envScene.background = new THREE.Color('#1e3a5f');
    // High-noon solar canopy + wrap-around sky bounce
    addPanel([0, 13, 0], [0, 0, 0], [18, 0.3, 22], '#ffffff', 6.0);
    addPanel([-11, 7, 0], [0, 0, -0.3], [0.3, 8, 20], '#bae6fd', 4.0);
    addPanel([11, 7, 0], [0, 0, 0.3], [0.3, 8, 20], '#e0f2fe', 4.0);
    addPanel([0, 6, 13], [0, 0, 0], [18, 6, 0.3], '#f8fafc', 3.8);
    addPanel([0, 6, -13], [0, 0, 0], [18, 6, 0.3], '#7dd3fc', 3.2);
  } else {
    // midnight_neon
    envScene.background = new THREE.Color('#020408');
    // Sharp cyber-cyan and crimson neon light arches
    addPanel([-4, 11, 0], [0, 0, 0], [1.2, 0.2, 20], '#00e5ff', 6.5);
    addPanel([4, 11, 0], [0, 0, 0], [1.2, 0.2, 20], '#f43f5e', 6.0);
    addPanel([-10, 4, 0], [0, 0, 0], [0.2, 2.5, 18], '#00e5ff', 4.2);
    addPanel([10, 4, 0], [0, 0, 0], [0.2, 2.5, 18], '#a855f7', 4.2);
  }

  return envScene;
}

/**
 * Dynamic Procedural Studio Environment Map
 * Updates the scene's IBL reflection texture whenever the active lighting preset changes.
 */
function DynamicStudioEnvironment({ presetId }: { presetId: LightingPresetId }) {
  const { gl, scene } = useThree();

  useEffect(() => {
    const pmremGenerator = new THREE.PMREMGenerator(gl);
    pmremGenerator.compileEquirectangularShader();
    const envScene = buildProceduralEnvScene(presetId);
    const envTexture = pmremGenerator.fromScene(envScene, 0.035).texture;

    // Assign to Three.js scene environment for PBR clearcoat & glass reflections
    const targetScene = scene;
    targetScene.environment = envTexture;

    return () => {
      envTexture.dispose();
      pmremGenerator.dispose();
    };
  }, [gl, scene, presetId]);

  return null;
}

/**
 * Dynamic Studio Lighting Rig with Smooth Frame-by-Frame Color & Intensity Damping
 * Plus Physical Overhead Studio Softbox Bars
 */
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

      {/* Physical Studio Softbox Area Lights for Elongated Specular Highlights */}
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

      {/* Overhead Architectural Studio Light Strips (Visible in High-Angle Orbits) */}
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

/**
 * Multi-spoke Forged Alloy Wheel & Pirelli-style Sculpted Tire + Drilled Ceramic Rotor + 6-Piston Caliper
 */
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

/**
 * High-Detail Sculpted 3D Vehicle Model
 */
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

  // Materials responsive to active lighting preset's envMapIntensity
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
      {/* Main Sculpted Monocoque Body */}
      <mesh
        position={[0, 0.46 * heightScale, 0.04]}
        geometry={mainBodyGeo}
        material={carPaintMaterial}
        castShadow
        receiveShadow
      />

      {/* Sculpted Hood Power Bulge */}
      <mesh
        position={[0, 0.64 * heightScale, 1.38]}
        rotation={[0.14, 0, 0]}
        material={carPaintMaterial}
        castShadow
      >
        <capsuleGeometry args={[0.38, 0.75, 12, 24]} />
      </mesh>

      {/* Recessed Hood Carbon NACA Ducts */}
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

      {/* Widebody Fender Haunches */}
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

      {/* Curved Teardrop Greenhouse Canopy */}
      <mesh
        position={[0, 0.89 * heightScale, -0.14]}
        geometry={cabinCanopyGeo}
        material={glassMaterial}
        castShadow
      />

      {/* Sculpted Carbon Fiber Roof Panel */}
      <mesh
        position={[0, 1.12 * heightScale, -0.18]}
        rotation={[0.03, 0, 0]}
        material={satinCarbonMaterial}
        castShadow
      >
        <boxGeometry args={[1.12, 0.045, 1.25]} />
      </mesh>

      {/* Front Ground-Effect Splitter & Grille */}
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

      {/* Matrix LED Headlights */}
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

      {/* Side Skirts & Animated Dihedral Doors */}
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

      {/* Rear Aero Wing, Louvers, Diffuser & Quad Exhausts */}
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

      {/* Bespoke Cockpit Interior */}
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

      {/* Four Forged Wheel & Ceramic Brake Assemblies */}
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

      {/* Reflective Studio Turntable Ring under Vehicle */}
      <mesh position={[0, 0.005, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[2.55, 2.61, 64]} />
        <meshBasicMaterial color={lightingPreset.ringColor} transparent opacity={0.6} />
      </mesh>
    </group>
  );
}

/**
 * Smooth Damped Camera Controller for Studio Presets & Orbit
 */
function CameraRig({
  preset,
  autoRotate,
}: {
  preset: CameraPreset;
  autoRotate: boolean;
}) {
  const controlsRef = useRef<any>(null);

  useEffect(() => {
    if (!controlsRef.current) return;
    const ctrl = controlsRef.current;

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
  }, [preset]);

  return (
    <OrbitControls
      ref={controlsRef}
      enablePan={false}
      enableDamping
      dampingFactor={0.06}
      autoRotate={autoRotate && preset === 'hero'}
      autoRotateSpeed={0.85}
      maxPolarAngle={preset === 'cockpit' ? Math.PI : Math.PI / 2 - 0.04}
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

  return (
    <div
      className={`relative overflow-hidden rounded-2xl bg-[#05080D] border border-cyan-500/20 select-none ${className}`}
    >
      {/* Dynamic Environmental Atmospheric Stage Glow */}
      <div
        className="absolute inset-0 pointer-events-none transition-all duration-500"
        style={{
          background: activeLighting.backdropGradient,
        }}
      />

      {/* Top Architectural Accent Line */}
      <div className="absolute top-0 left-12 right-12 h-[1px] bg-gradient-to-r from-transparent via-cyan-400/50 to-transparent z-10 pointer-events-none" />

      {/* Top Studio Header & Environmental Lighting Preset Bar */}
      <div className="absolute top-4 left-5 right-5 z-20 flex flex-wrap items-center justify-between gap-3 pointer-events-none">
        {/* Left: Marque & Active Lighting Telemetry */}
        <div className="flex items-center gap-2.5 pointer-events-auto">
          <span className="px-3 py-1 rounded-md text-[11px] font-mono uppercase tracking-widest bg-[#0B121C]/90 text-cyan-400 border border-cyan-500/30 flex items-center gap-1.5">
            <Sparkles className="w-3 h-3" />
            <span>3D Studio Twin</span>
          </span>
          <span className="text-xs font-mono text-slate-300 hidden lg:inline">
            {activeLighting.label} · {activeLighting.kelvin}
          </span>
        </div>

        {/* Center: Dynamic Environmental Lighting Switcher */}
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
                <span>{preset.label}</span>
              </button>
            );
          })}
        </div>

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
            <span>{cameraPreset === 'cockpit' ? 'Exterior Studio' : 'Cockpit'}</span>
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
            title="Toggle 360° Studio Turntable"
          >
            <CircleDot className="w-4 h-4" />
          </button>
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
              className="group text-left pointer-events-auto focus:outline-none"
            >
              <div className="flex items-center mb-2">
                <div className="w-24 h-3 border-t border-l border-cyan-400/60 group-hover:border-cyan-300 transition-colors" />
                <div className="flex-1 h-[1px] bg-cyan-400/60 group-hover:bg-cyan-300 transition-colors" />
                <span className="w-2 h-2 rounded-full bg-cyan-400 shadow-[0_0_8px_#22d3ee]" />
              </div>

              <div className="pr-4 space-y-1">
                <span className="text-[10px] font-mono uppercase tracking-widest text-cyan-400 block">
                  01 · Body & Aero Architecture
                </span>
                <h4 className="text-base font-bold text-white font-display group-hover:text-cyan-300 transition-colors">
                  {car.model?.body_type || 'Coupe'} Monocoque
                </h4>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  Finished in <span className="text-slate-200">{selectedColor.name}</span> under{' '}
                  <span className="text-slate-200">{activeLighting.label}</span> ({activeLighting.kelvin}) with active DRS wing.
                </p>
              </div>
            </button>

            <button
              type="button"
              onClick={() => {
                setCameraPreset('wheel');
                setAutoRotate(false);
              }}
              className="group text-left pointer-events-auto focus:outline-none"
            >
              <div className="flex items-center mb-2">
                <div className="w-20 h-3 border-t border-l border-cyan-400/60 group-hover:border-cyan-300 transition-colors" />
                <div className="flex-1 h-[1px] bg-cyan-400/60 group-hover:bg-cyan-300 transition-colors" />
                <span className="w-2 h-2 rounded-full bg-cyan-400 shadow-[0_0_8px_#22d3ee]" />
              </div>

              <div className="pr-4 space-y-1">
                <span className="text-[10px] font-mono uppercase tracking-widest text-cyan-400 block">
                  02 · Chassis & Telemetry
                </span>
                <h4 className="text-base font-bold text-white font-display group-hover:text-cyan-300 transition-colors">
                  {selectedWheel.name}
                </h4>
                <p className="text-[11px] text-slate-400 leading-relaxed font-mono tabular-nums">
                  Odometer: <span className="text-slate-200">{car.mileage.toLocaleString()} mi</span> · 6-Piston PCCB Ceramic Rotors · Center-Lock Hubs.
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
              className="group text-right pointer-events-auto focus:outline-none"
            >
              <div className="flex items-center mb-2">
                <span className="w-2 h-2 rounded-full bg-cyan-400 shadow-[0_0_8px_#22d3ee]" />
                <div className="flex-1 h-[1px] bg-cyan-400/60 group-hover:bg-cyan-300 transition-colors" />
                <div className="w-24 h-3 border-t border-r border-cyan-400/60 group-hover:border-cyan-300 transition-colors" />
              </div>

              <div className="pl-4 space-y-1">
                <span className="text-[10px] font-mono uppercase tracking-widest text-cyan-400 block">
                  03 · Powertrain & Drivetrain
                </span>
                <h4 className="text-base font-bold text-white font-display group-hover:text-cyan-300 transition-colors">
                  {car.fuel} · {car.transmission.split(' ')[0]}
                </h4>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  JEVIC-verified factory calibration with active torque vectoring, launch control, and titanium quad exhaust system.
                </p>
              </div>
            </button>

            <button
              type="button"
              onClick={() => {
                setCameraPreset('front');
                setAutoRotate(false);
              }}
              className="group text-right pointer-events-auto focus:outline-none"
            >
              <div className="flex items-center mb-2">
                <span className="w-2 h-2 rounded-full bg-cyan-400 shadow-[0_0_8px_#22d3ee]" />
                <div className="flex-1 h-[1px] bg-cyan-400/60 group-hover:bg-cyan-300 transition-colors" />
                <div className="w-20 h-3 border-t border-r border-cyan-400/60 group-hover:border-cyan-300 transition-colors" />
              </div>

              <div className="pl-4 space-y-1">
                <span className="text-[10px] font-mono uppercase tracking-widest text-cyan-400 block">
                  04 · Direct Showroom Valuation
                </span>
                <h4 className="text-base font-bold text-white font-mono tabular-nums group-hover:text-cyan-300 transition-colors">
                  ${car.price.toLocaleString()}{' '}
                  <span className="text-xs font-normal text-slate-400">
                    (${monthlyEst.toLocaleString()}/mo)
                  </span>
                </h4>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  {car.showroom?.name || 'Manhattan Flagship'}
                  {car.slot ? ` · Bay ${car.slot.label}` : ''} · VIN {car.vin}
                </p>
              </div>
            </button>
          </div>
        </>
      )}

      {/* ==================== 3D STUDIO CANVAS ==================== */}
      <Canvas shadows camera={{ position: [0.0, 1.05, 4.55], fov: 38 }}>
        <PerspectiveCamera makeDefault position={[0.0, 1.05, 4.55]} fov={38} />

        {/* Dynamic Procedural IBL Reflections (Rebuilds Cubemap per Lighting Preset) */}
        <DynamicStudioEnvironment presetId={lightingPresetId} />

        {/* Dynamic Multi-Light & Softbox Rig with Smooth Damping */}
        <DynamicLightingRig preset={activeLighting} />

        {/* High-Detail Sculpted 3D Supercar / GT Mesh */}
        <SculptedSupercar
          car={car}
          colorHex={selectedColor.hex}
          wheelCode={selectedWheel.code}
          doorsOpen={doorsOpen}
          lightingPreset={activeLighting}
        />

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
        <CameraRig preset={cameraPreset} autoRotate={autoRotate} />
      </Canvas>

      {/* ==================== UNIFIED COLLAPSIBLE BOTTOM STUDIO DOCK ==================== */}
      {allowCustomize && (
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-20 w-[94%] max-w-[920px] flex flex-col items-center">
          <button
            type="button"
            onClick={() => setDockCollapsed(!dockCollapsed)}
            className="px-3 py-1 rounded-t-lg bg-[#0B121C] border border-b-0 border-white/[0.12] text-[11px] font-mono text-slate-300 hover:text-white flex items-center gap-1 transition-colors"
          >
            {dockCollapsed ? (
              <>
                <ChevronUp className="w-3 h-3 text-cyan-400" />
                <span>Show Studio Controls</span>
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
            </div>
          )}
        </div>
      )}
    </div>
  );
};
