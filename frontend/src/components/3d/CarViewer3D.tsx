import React, { useRef, useState, useEffect, Suspense, useMemo, Component, ErrorInfo, ReactNode } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, ContactShadows, Html, PerspectiveCamera, Center, useGLTF, Environment } from '@react-three/drei';
import * as THREE from 'three';
import { Car, CarColorVariant, CarWheelVariant } from '../../types';
import { Eye, RotateCcw, Palette, CircleDot, Info, Maximize2, Sparkles, Box } from 'lucide-react';

interface CarViewer3DProps {
  car: Car;
  className?: string;
  allowCustomize?: boolean;
}

// Fallback error boundary to guarantee the canvas never crashes if a 3D model fails to load
class ModelErrorBoundary extends Component<
  { fallback: ReactNode; children: ReactNode },
  { hasError: boolean }
> {
  constructor(props: { fallback: ReactNode; children: ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError() {
    return { hasError: true };
  }
  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.warn('3D Model could not be loaded, using procedural fallback:', error, errorInfo);
  }
  render() {
    if (this.state.hasError) {
      return this.props.fallback;
    }
    return this.props.children;
  }
}

// 3D Loading Spinner
function Car3DLoader() {
  return (
    <Html center>
      <div className="flex flex-col items-center gap-2 p-3.5 rounded-xl bg-slate-900/90 border border-slate-700/80 text-white backdrop-blur-md shadow-2xl">
        <div className="w-6 h-6 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
        <span className="text-xs font-semibold text-slate-200">Loading Photorealistic 3D Model...</span>
      </div>
    </Html>
  );
}

// Real GLB Car Model Loader with auto-centering, dynamic materials & paint coloring
function GLBCarModel({
  url,
  colorHex,
  wheelCode,
}: {
  url: string;
  colorHex: string;
  wheelCode: string;
}) {
  const { scene } = useGLTF(url);

  // Clone scene so multiple viewers don't share mutated materials
  const clonedScene = useMemo(() => {
    const clone = scene.clone(true);
    clone.traverse((child: any) => {
      if (child.isMesh) {
        child.castShadow = true;
        child.receiveShadow = true;
        if (child.material) {
          if (Array.isArray(child.material)) {
            child.material = child.material.map((m: any) => m.clone());
          } else {
            child.material = child.material.clone();
          }
        }
      }
    });
    return clone;
  }, [scene]);

  // Dynamically update car body paint color
  useEffect(() => {
    if (!clonedScene) return;
    const targetColor = new THREE.Color(colorHex);
    clonedScene.traverse((child: any) => {
      if (child.isMesh && child.material) {
        const mats = Array.isArray(child.material) ? child.material : [child.material];
        mats.forEach((mat: any) => {
          const name = (mat.name || '').toLowerCase();
          // In the countach model: Material.025 & Material.003 are the exterior body paint
          if (
            name.includes('025') ||
            name.includes('003') ||
            name.includes('paint') ||
            name.includes('body') ||
            name.includes('carpaint')
          ) {
            if (mat.color) {
              mat.color.copy(targetColor);
            }
          }
        });
      }
    });
  }, [clonedScene, colorHex]);

  return (
    <Center bottom position={[0, 0, 0]}>
      <primitive object={clonedScene} scale={0.48} />
    </Center>
  );
}

// Procedural stylized high-end supercar mesh with animated doors & customizable materials
function ProceduralCar({
  colorHex,
  wheelCode,
  doorsOpen,
  isInteriorView,
  onSelectHotspot,
}: {
  colorHex: string;
  wheelCode: string;
  doorsOpen: boolean;
  isInteriorView: boolean;
  onSelectHotspot: (spot: string) => void;
}) {
  const leftDoorRef = useRef<THREE.Group>(null);
  const rightDoorRef = useRef<THREE.Group>(null);
  const leftDoorAngle = useRef(0);
  const rightDoorAngle = useRef(0);

  // Smooth door animation
  useFrame((_, delta) => {
    const targetAngle = doorsOpen ? 0.85 : 0;
    leftDoorAngle.current = THREE.MathUtils.damp(leftDoorAngle.current, targetAngle, 6, delta);
    rightDoorAngle.current = THREE.MathUtils.damp(rightDoorAngle.current, -targetAngle, 6, delta);

    if (leftDoorRef.current) {
      leftDoorRef.current.rotation.y = leftDoorAngle.current;
      leftDoorRef.current.rotation.z = doorsOpen ? 0.2 : 0; // dihedral tilt
    }
    if (rightDoorRef.current) {
      rightDoorRef.current.rotation.y = rightDoorAngle.current;
      rightDoorRef.current.rotation.z = doorsOpen ? -0.2 : 0;
    }
  });

  const carPaintMaterial = new THREE.MeshPhysicalMaterial({
    color: new THREE.Color(colorHex),
    metalness: 0.7,
    roughness: 0.15,
    clearcoat: 1.0,
    clearcoatRoughness: 0.05,
    reflectivity: 0.9,
  });

  const carbonMaterial = new THREE.MeshStandardMaterial({
    color: 0x111111,
    roughness: 0.35,
    metalness: 0.2,
  });

  const glassMaterial = new THREE.MeshPhysicalMaterial({
    color: 0x1a2230,
    transparent: true,
    opacity: 0.45,
    roughness: 0.05,
    metalness: 0.1,
    transmission: 0.85,
    ior: 1.5,
  });

  const rimColor = wheelCode === 'W02' ? '#111111' : (wheelCode === 'W03' ? '#D4AF37' : '#999999');
  const rimMaterial = new THREE.MeshStandardMaterial({
    color: new THREE.Color(rimColor),
    metalness: 0.9,
    roughness: 0.18,
  });

  const tireMaterial = new THREE.MeshStandardMaterial({
    color: 0x141416,
    roughness: 0.85,
  });

  const brakeMaterial = new THREE.MeshStandardMaterial({
    color: 0xffcc00, // Ceramic yellow
    metalness: 0.8,
    roughness: 0.2,
  });

  return (
    <group position={[0, 0, 0]} dispose={null}>
      {/* Main Body Chassis */}
      <mesh position={[0, 0.45, 0]} material={carPaintMaterial} castShadow receiveShadow>
        <boxGeometry args={[1.9, 0.42, 4.3]} />
      </mesh>

      {/* Aerodynamic Front Hood Slope */}
      <mesh position={[0, 0.42, 1.65]} rotation={[-0.18, 0, 0]} material={carPaintMaterial} castShadow>
        <boxGeometry args={[1.82, 0.22, 1.3]} />
      </mesh>

      {/* Front Hood Aero Vents (Carbon) */}
      <mesh position={[-0.4, 0.54, 1.5]} rotation={[-0.18, 0, 0]} material={carbonMaterial}>
        <boxGeometry args={[0.3, 0.04, 0.6]} />
      </mesh>
      <mesh position={[0.4, 0.54, 1.5]} rotation={[-0.18, 0, 0]} material={carbonMaterial}>
        <boxGeometry args={[0.3, 0.04, 0.6]} />
      </mesh>

      {/* Front Carbon Splitter */}
      <mesh position={[0, 0.15, 2.3]} material={carbonMaterial} castShadow>
        <boxGeometry args={[2.0, 0.06, 0.4]} />
      </mesh>

      {/* Cabin Greenhouse / Windshield */}
      <mesh position={[0, 0.82, -0.1]} material={glassMaterial} castShadow>
        <boxGeometry args={[1.5, 0.46, 2.1]} />
      </mesh>

      {/* Roof Carbon Panel */}
      <mesh position={[0, 1.06, -0.1]} material={carbonMaterial} castShadow>
        <boxGeometry args={[1.36, 0.04, 1.8]} />
      </mesh>

      {/* Rear Engine Decklid & Louvers */}
      <mesh position={[0, 0.58, -1.4]} rotation={[0.22, 0, 0]} material={carPaintMaterial} castShadow>
        <boxGeometry args={[1.76, 0.2, 1.4]} />
      </mesh>

      {/* Massive Swan-Neck GT Rear Wing (Active DRS) */}
      <group position={[0, 1.15, -1.95]}>
        {/* Wing Blade */}
        <mesh position={[0, 0, 0]} material={carbonMaterial} castShadow>
          <boxGeometry args={[2.1, 0.05, 0.55]} />
        </mesh>
        {/* Endplates */}
        <mesh position={[-1.04, 0.05, 0]} material={carbonMaterial}>
          <boxGeometry args={[0.04, 0.35, 0.6]} />
        </mesh>
        <mesh position={[1.04, 0.05, 0]} material={carbonMaterial}>
          <boxGeometry args={[0.04, 0.35, 0.6]} />
        </mesh>
        {/* Swan Neck Pylons */}
        <mesh position={[-0.45, -0.3, 0]} rotation={[0.1, 0, 0]} material={carbonMaterial}>
          <boxGeometry args={[0.06, 0.65, 0.15]} />
        </mesh>
        <mesh position={[0.45, -0.3, 0]} rotation={[0.1, 0, 0]} material={carbonMaterial}>
          <boxGeometry args={[0.06, 0.65, 0.15]} />
        </mesh>
      </group>

      {/* Rear Carbon Diffuser & Dual Exhausts */}
      <mesh position={[0, 0.2, -2.15]} material={carbonMaterial}>
        <boxGeometry args={[1.9, 0.18, 0.3]} />
      </mesh>
      <mesh position={[-0.2, 0.25, -2.25]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.08, 0.08, 0.2, 16]} />
        <meshStandardMaterial color={0x222222} metalness={0.9} roughness={0.2} />
      </mesh>
      <mesh position={[0.2, 0.25, -2.25]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.08, 0.08, 0.2, 16]} />
        <meshStandardMaterial color={0x222222} metalness={0.9} roughness={0.2} />
      </mesh>

      {/* Headlights (Projector LED with high emission) */}
      <mesh position={[-0.7, 0.46, 2.12]} rotation={[-0.1, 0.2, 0]}>
        <boxGeometry args={[0.38, 0.12, 0.1]} />
        <meshStandardMaterial color={0xffffff} emissive={0xffffff} emissiveIntensity={3} />
      </mesh>
      <mesh position={[0.7, 0.46, 2.12]} rotation={[-0.1, -0.2, 0]}>
        <boxGeometry args={[0.38, 0.12, 0.1]} />
        <meshStandardMaterial color={0xffffff} emissive={0xffffff} emissiveIntensity={3} />
      </mesh>

      {/* Full-width Rear LED Light Bar */}
      <mesh position={[0, 0.52, -2.16]}>
        <boxGeometry args={[1.75, 0.05, 0.05]} />
        <meshStandardMaterial color={0xff0022} emissive={0xff0022} emissiveIntensity={4} />
      </mesh>

      {/* Left Dihedral Door */}
      <group position={[-0.95, 0.5, 0.6]} ref={leftDoorRef}>
        <mesh position={[0, 0, -0.6]} material={carPaintMaterial} castShadow>
          <boxGeometry args={[0.1, 0.5, 1.2]} />
        </mesh>
        <mesh position={[0, 0.35, -0.6]} material={glassMaterial}>
          <boxGeometry args={[0.08, 0.3, 1.1]} />
        </mesh>
      </group>

      {/* Right Dihedral Door */}
      <group position={[0.95, 0.5, 0.6]} ref={rightDoorRef}>
        <mesh position={[0, 0, -0.6]} material={carPaintMaterial} castShadow>
          <boxGeometry args={[0.1, 0.5, 1.2]} />
        </mesh>
        <mesh position={[0, 0.35, -0.6]} material={glassMaterial}>
          <boxGeometry args={[0.08, 0.3, 1.1]} />
        </mesh>
      </group>

      {/* Cockpit Interior */}
      <group position={[0, 0.55, 0]}>
        {/* Dashboard */}
        <mesh position={[0, 0.2, 0.65]} material={carbonMaterial}>
          <boxGeometry args={[1.3, 0.25, 0.4]} />
        </mesh>
        {/* Digital Screen Display */}
        <mesh position={[0, 0.28, 0.6]}>
          <planeGeometry args={[0.4, 0.15]} />
          <meshBasicMaterial color={0x00e5ff} />
        </mesh>
        {/* Steering Wheel */}
        <mesh position={[-0.35, 0.25, 0.45]} rotation={[0.4, 0, 0]}>
          <torusGeometry args={[0.14, 0.02, 12, 24]} />
          <meshStandardMaterial color={0x111111} roughness={0.3} />
        </mesh>
        {/* Driver Carbon Bucket Seat */}
        <mesh position={[-0.35, 0.1, -0.15]} material={carbonMaterial}>
          <boxGeometry args={[0.42, 0.6, 0.45]} />
        </mesh>
        {/* Passenger Carbon Bucket Seat */}
        <mesh position={[0.35, 0.1, -0.15]} material={carbonMaterial}>
          <boxGeometry args={[0.42, 0.6, 0.45]} />
        </mesh>
      </group>

      {/* Four Wheels with Ceramic Brakes and Swappable Rims */}
      {/* Front Left */}
      <group position={[-1.02, 0.34, 1.4]} rotation={[0, 0, Math.PI / 2]}>
        <mesh material={tireMaterial} castShadow>
          <cylinderGeometry args={[0.34, 0.34, 0.28, 32]} />
        </mesh>
        <mesh material={rimMaterial}>
          <cylinderGeometry args={[0.26, 0.26, 0.29, 20]} />
        </mesh>
        <mesh material={brakeMaterial} position={[0, -0.05, 0]}>
          <cylinderGeometry args={[0.2, 0.2, 0.08, 16]} />
        </mesh>
      </group>

      {/* Front Right */}
      <group position={[1.02, 0.34, 1.4]} rotation={[0, 0, -Math.PI / 2]}>
        <mesh material={tireMaterial} castShadow>
          <cylinderGeometry args={[0.34, 0.34, 0.28, 32]} />
        </mesh>
        <mesh material={rimMaterial}>
          <cylinderGeometry args={[0.26, 0.26, 0.29, 20]} />
        </mesh>
        <mesh material={brakeMaterial} position={[0, -0.05, 0]}>
          <cylinderGeometry args={[0.2, 0.2, 0.08, 16]} />
        </mesh>
      </group>

      {/* Rear Left */}
      <group position={[-1.04, 0.36, -1.35]} rotation={[0, 0, Math.PI / 2]}>
        <mesh material={tireMaterial} castShadow>
          <cylinderGeometry args={[0.36, 0.36, 0.34, 32]} />
        </mesh>
        <mesh material={rimMaterial}>
          <cylinderGeometry args={[0.28, 0.28, 0.35, 20]} />
        </mesh>
        <mesh material={brakeMaterial} position={[0, -0.05, 0]}>
          <cylinderGeometry args={[0.22, 0.22, 0.08, 16]} />
        </mesh>
      </group>

      {/* Rear Right */}
      <group position={[1.04, 0.36, -1.35]} rotation={[0, 0, -Math.PI / 2]}>
        <mesh material={tireMaterial} castShadow>
          <cylinderGeometry args={[0.36, 0.36, 0.34, 32]} />
        </mesh>
        <mesh material={rimMaterial}>
          <cylinderGeometry args={[0.28, 0.28, 0.35, 20]} />
        </mesh>
        <mesh material={brakeMaterial} position={[0, -0.05, 0]}>
          <cylinderGeometry args={[0.22, 0.22, 0.08, 16]} />
        </mesh>
      </group>

      {/* Interactive 3D Hotspots (hidden in interior view) */}
      {!isInteriorView && (
        <>
          {/* Aerodynamics / Wing Hotspot */}
          <Html position={[0, 1.45, -1.95]} center distanceFactor={10}>
            <button
              onClick={() => onSelectHotspot('Active DRS Wing')}
              className="group flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-900/90 text-white text-xs border border-emerald-500/60 shadow-lg hover:bg-emerald-600 transition-all cursor-pointer backdrop-blur-md"
            >
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping inline-block" />
              <span className="font-semibold tracking-wide">DRS Aero Wing</span>
            </button>
          </Html>

          {/* Engine Powertrain Hotspot */}
          <Html position={[0, 0.85, -1.1]} center distanceFactor={10}>
            <button
              onClick={() => onSelectHotspot('High-Output Powertrain')}
              className="group flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-900/90 text-white text-xs border border-amber-500/60 shadow-lg hover:bg-amber-600 transition-all cursor-pointer backdrop-blur-md"
            >
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse inline-block" />
              <span className="font-semibold tracking-wide">Powertrain</span>
            </button>
          </Html>

          {/* Carbon Ceramic Brakes Hotspot */}
          <Html position={[-1.25, 0.45, 1.4]} center distanceFactor={10}>
            <button
              onClick={() => onSelectHotspot('Carbon Ceramic Brakes (PCCB)')}
              className="group flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-900/90 text-white text-xs border border-sky-500/60 shadow-lg hover:bg-sky-600 transition-all cursor-pointer backdrop-blur-md"
            >
              <span className="w-2 h-2 rounded-full bg-sky-400 animate-pulse inline-block" />
              <span className="font-semibold tracking-wide">Ceramic Brakes</span>
            </button>
          </Html>

          {/* Cockpit Hotspot */}
          <Html position={[-0.4, 1.15, 0.1]} center distanceFactor={10}>
            <button
              onClick={() => onSelectHotspot('Cockpit Ergonomics')}
              className="group flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-900/90 text-white text-xs border border-purple-500/60 shadow-lg hover:bg-purple-600 transition-all cursor-pointer backdrop-blur-md"
            >
              <span className="w-2 h-2 rounded-full bg-purple-400 animate-pulse inline-block" />
              <span className="font-semibold tracking-wide">Cockpit</span>
            </button>
          </Html>
        </>
      )}
    </group>
  );
}

// Camera controller for smooth transitions between exterior orbit and interior camera preset
function CameraRig({ isInteriorView, autoRotate }: { isInteriorView: boolean; autoRotate: boolean }) {
  const controlsRef = useRef<any>(null);

  useEffect(() => {
    if (!controlsRef.current) return;

    if (isInteriorView) {
      // Move into cockpit
      controlsRef.current.target.set(0, 0.8, -0.2);
      controlsRef.current.object.position.set(-0.3, 0.95, 0.2);
      controlsRef.current.minDistance = 0.2;
      controlsRef.current.maxDistance = 2.5;
    } else {
      // Exterior orbit
      controlsRef.current.target.set(0, 0.5, 0);
      controlsRef.current.object.position.set(3.8, 2.2, 4.2);
      controlsRef.current.minDistance = 2.5;
      controlsRef.current.maxDistance = 12.0;
    }
  }, [isInteriorView]);

  return (
    <OrbitControls
      ref={controlsRef}
      enablePan={false}
      enableDamping
      dampingFactor={0.06}
      autoRotate={autoRotate && !isInteriorView}
      autoRotateSpeed={1.2}
      maxPolarAngle={isInteriorView ? Math.PI : Math.PI / 2 - 0.05} // don't go below floor in exterior view
    />
  );
}

export const CarViewer3D: React.FC<CarViewer3DProps> = ({ car, className = 'h-[500px] w-full', allowCustomize = true }) => {
  // Use specified GLB or default to the downloaded Countach model
  const availableGlbUrl =
    car.model3d?.glb_url && !car.model3d.glb_url.includes('porsche_gt3rs')
      ? car.model3d.glb_url
      : '/models/2021_lamborghini_countach_lpi_800-4.glb';
  const [useRealisticModel, setUseRealisticModel] = useState<boolean>(true);

  // Color variants from car 3D model config or defaults
  const colorVariants: CarColorVariant[] = car.model3d?.variants?.colors || [
    { name: 'Impact White', hex: '#F0F0F2' },
    { name: 'Giallo Countach Yellow', hex: '#FFC800' },
    { name: 'Rosso Siviglia Red', hex: '#D91E18' },
    { name: 'Verde Ermes Green', hex: '#1DB954' },
    { name: 'Shark Blue', hex: '#0F4C81' },
    { name: 'Nero Noctis Black', hex: '#111215' },
  ];

  const wheelVariants: CarWheelVariant[] = car.model3d?.variants?.wheels || [
    { name: 'Forged Performance Alloy', code: 'W01', price: 0 },
    { name: 'Satin Carbon Magnesium', code: 'W02', price: 14000 },
    { name: 'Neodyme Gold Edition', code: 'W03', price: 4500 },
  ];

  const [selectedColor, setSelectedColor] = useState<CarColorVariant>(colorVariants[0]);
  const [selectedWheel, setSelectedWheel] = useState<CarWheelVariant>(wheelVariants[0]);
  const [doorsOpen, setDoorsOpen] = useState(false);
  const [isInteriorView, setIsInteriorView] = useState(false);
  const [autoRotate, setAutoRotate] = useState(true);
  const [activeHotspot, setActiveHotspot] = useState<string | null>(null);

  // Sync color if car changes
  useEffect(() => {
    if (colorVariants.length > 0) {
      setSelectedColor(colorVariants[0]);
    }
  }, [car.id]);

  return (
    <div className={`relative overflow-hidden rounded-2xl bg-gradient-to-b from-slate-900 to-slate-950 border border-slate-800 ${className}`}>
      {/* 3D Canvas */}
      <Canvas shadows camera={{ position: [3.8, 2.2, 4.2], fov: 42 }}>
        <PerspectiveCamera makeDefault position={[3.8, 2.2, 4.2]} fov={42} />

        {/* Ambient & Directional Lighting */}
        <ambientLight intensity={0.8} />
        <directionalLight position={[6, 8, 4]} intensity={2.2} castShadow shadow-mapSize={[2048, 2048]} />
        <directionalLight position={[-6, 6, -4]} intensity={1.2} />
        <directionalLight position={[0, -2, 0]} intensity={0.4} color="#10b981" />

        {/* HDRI Environment for realistic reflections on metal, paint and glass */}
        <Suspense fallback={null}>
          <Environment preset="city" />
        </Suspense>

        {/* Supercar Mesh: Photorealistic GLB or Procedural */}
        <Suspense fallback={<Car3DLoader />}>
          {useRealisticModel && availableGlbUrl ? (
            <ModelErrorBoundary
              fallback={
                <ProceduralCar
                  colorHex={selectedColor.hex}
                  wheelCode={selectedWheel.code}
                  doorsOpen={doorsOpen}
                  isInteriorView={isInteriorView}
                  onSelectHotspot={(spot) => setActiveHotspot(spot)}
                />
              }
            >
              <GLBCarModel
                url={availableGlbUrl}
                colorHex={selectedColor.hex}
                wheelCode={selectedWheel.code}
              />
            </ModelErrorBoundary>
          ) : (
            <ProceduralCar
              colorHex={selectedColor.hex}
              wheelCode={selectedWheel.code}
              doorsOpen={doorsOpen}
              isInteriorView={isInteriorView}
              onSelectHotspot={(spot) => setActiveHotspot(spot)}
            />
          )}

          {/* Realistic Contact Shadow on floor */}
          <ContactShadows
            position={[0, 0, 0]}
            opacity={0.8}
            scale={12}
            blur={2.2}
            far={4}
            resolution={1024}
            color="#000000"
          />
        </Suspense>

        {/* Controls Rig */}
        <CameraRig isInteriorView={isInteriorView} autoRotate={autoRotate} />
      </Canvas>

      {/* Top Overlay Badge & Quick Info */}
      <div className="absolute top-4 left-4 z-10 flex items-center gap-2">
        <span className="px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 backdrop-blur-md flex items-center gap-1.5">
          <Sparkles className="w-3 h-3" />
          Interactive 3D Virtual Showroom
        </span>
        <span className="px-3 py-1 rounded-full text-xs font-medium bg-slate-800/80 text-slate-300 border border-slate-700/60 backdrop-blur-md">
          {car.title}
        </span>
      </div>

      {/* Top Right View Toggles */}
      <div className="absolute top-4 right-4 z-10 flex items-center gap-2">
        {/* Toggle Real GLB vs Procedural */}
        <button
          onClick={() => setUseRealisticModel(!useRealisticModel)}
          className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium transition-all backdrop-blur-md border ${
            useRealisticModel
              ? 'bg-emerald-600 text-white border-emerald-400 shadow-lg shadow-emerald-500/20'
              : 'bg-slate-900/80 text-slate-300 border-slate-700 hover:bg-slate-800'
          }`}
          title="Toggle between photorealistic GLB 3D model and procedural mesh"
        >
          {useRealisticModel ? <Sparkles className="w-3.5 h-3.5 text-amber-300" /> : <Box className="w-3.5 h-3.5" />}
          {useRealisticModel ? 'Realistic GLB' : 'Procedural Mesh'}
        </button>

        {/* Interior / Exterior Toggle */}
        <button
          onClick={() => {
            setIsInteriorView(!isInteriorView);
            setAutoRotate(false);
          }}
          className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium transition-all backdrop-blur-md border ${
            isInteriorView
              ? 'bg-purple-600 text-white border-purple-400 shadow-lg shadow-purple-500/20'
              : 'bg-slate-900/80 text-slate-200 border-slate-700 hover:bg-slate-800'
          }`}
          title="Toggle Cockpit View"
        >
          <Eye className="w-3.5 h-3.5" />
          {isInteriorView ? 'Exterior Orbit' : 'Interior Cockpit'}
        </button>

        {/* Doors Open / Close Toggle */}
        <button
          onClick={() => setDoorsOpen(!doorsOpen)}
          className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium transition-all backdrop-blur-md border ${
            doorsOpen
              ? 'bg-emerald-600 text-white border-emerald-400 shadow-lg shadow-emerald-500/20'
              : 'bg-slate-900/80 text-slate-200 border-slate-700 hover:bg-slate-800'
          }`}
          title="Open or Close Dihedral Doors"
        >
          <RotateCcw className={`w-3.5 h-3.5 transition-transform ${doorsOpen ? 'rotate-90' : ''}`} />
          {doorsOpen ? 'Close Doors' : 'Open Doors'}
        </button>

        {/* 360 Auto-Rotate Toggle */}
        <button
          onClick={() => setAutoRotate(!autoRotate)}
          className={`p-2 rounded-xl text-xs transition-all backdrop-blur-md border ${
            autoRotate
              ? 'bg-amber-600/30 text-amber-300 border-amber-500/40'
              : 'bg-slate-900/80 text-slate-400 border-slate-700 hover:text-white'
          }`}
          title="Toggle 360 Spin"
        >
          <CircleDot className="w-4 h-4" />
        </button>
      </div>

      {/* Hotspot Info Banner if Selected */}
      {activeHotspot && (
        <div className="absolute top-16 left-4 right-4 z-10 flex items-center justify-between p-3.5 rounded-xl bg-slate-900/90 border border-emerald-500/40 backdrop-blur-md shadow-xl animate-fadeIn">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-emerald-500/20 text-emerald-400">
              <Info className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-bold text-emerald-400 uppercase tracking-wider">Feature Highlight</p>
              <p className="text-sm text-slate-100 font-semibold">{activeHotspot}</p>
            </div>
          </div>
          <button
            onClick={() => setActiveHotspot(null)}
            className="text-xs text-slate-400 hover:text-white px-2 py-1 rounded bg-slate-800"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Bottom Customizer Bar (Color Variants & Wheel Styles) */}
      {allowCustomize && (
        <div className="absolute bottom-4 left-4 right-4 z-10 flex flex-wrap items-center justify-between gap-3 p-3 rounded-2xl bg-slate-900/85 border border-slate-700/80 backdrop-blur-lg shadow-2xl">
          {/* Paint Colors */}
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 text-xs text-slate-300 font-medium mr-1">
              <Palette className="w-3.5 h-3.5 text-emerald-400" />
              <span>Color:</span>
              <span className="text-white font-semibold">{selectedColor.name}</span>
            </div>
            <div className="flex items-center gap-2">
              {colorVariants.map((c) => (
                <button
                  key={c.name}
                  onClick={() => setSelectedColor(c)}
                  className={`w-7 h-7 rounded-full transition-all border-2 shadow-sm ${
                    selectedColor.name === c.name
                      ? 'scale-125 border-white ring-2 ring-emerald-500/70'
                      : 'border-slate-700 hover:scale-110'
                  }`}
                  style={{ backgroundColor: c.hex }}
                  title={c.name}
                />
              ))}
            </div>
          </div>

          {/* Wheel Selector */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-300 font-medium">Wheels:</span>
            <div className="flex items-center gap-1.5">
              {wheelVariants.map((w) => (
                <button
                  key={w.code}
                  onClick={() => setSelectedWheel(w)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
                    selectedWheel.code === w.code
                      ? 'bg-emerald-500 text-slate-950 font-bold shadow-md'
                      : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                  }`}
                >
                  {w.name.split(' ')[0]}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Preload the photorealistic GLB asset for instant rendering
useGLTF.preload('/models/2021_lamborghini_countach_lpi_800-4.glb');

