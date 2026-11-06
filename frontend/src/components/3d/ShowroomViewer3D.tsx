import React, { useRef, useEffect, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Html, Line } from '@react-three/drei';
import * as THREE from 'three';
import { Showroom, ShowroomSlot, Car } from '../../types';
import { MapPin, Navigation, Compass, Layers, Maximize2 } from 'lucide-react';

interface ShowroomViewer3DProps {
  showroom: Showroom;
  targetCar?: Car | null;
  targetSlotId?: number | null;
  kioskPos?: { x: number; y: number; z: number };
  className?: string;
  onSelectSlot?: (slot: ShowroomSlot) => void;
}

// Low-poly placeholder car on slot
function PlaceholderCar({
  position,
  rotationY,
  color,
  isSelected,
  label,
  carTitle,
}: {
  position: [number, number, number];
  rotationY: number;
  color: string;
  isSelected: boolean;
  label: string;
  carTitle?: string;
}) {
  const meshRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (isSelected && meshRef.current) {
      // gentle floating hover when highlighted
      meshRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 3) * 0.08 + 0.05;
    }
  });

  return (
    <group ref={meshRef} position={position} rotation={[0, rotationY, 0]}>
      {/* Chassis */}
      <mesh position={[0, 0.28, 0]} castShadow>
        <boxGeometry args={[1.5, 0.35, 3.2]} />
        <meshStandardMaterial
          color={new THREE.Color(color)}
          metalness={0.7}
          roughness={0.25}
          emissive={isSelected ? new THREE.Color(color) : new THREE.Color(0x000000)}
          emissiveIntensity={isSelected ? 0.35 : 0}
        />
      </mesh>

      {/* Cabin */}
      <mesh position={[0, 0.58, -0.1]} castShadow>
        <boxGeometry args={[1.2, 0.32, 1.6]} />
        <meshStandardMaterial color="#1a202c" metalness={0.5} roughness={0.1} />
      </mesh>

      {/* Wheels */}
      <mesh position={[-0.8, 0.22, 1.0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.22, 0.22, 0.18, 16]} />
        <meshStandardMaterial color="#2d3748" />
      </mesh>
      <mesh position={[0.8, 0.22, 1.0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.22, 0.22, 0.18, 16]} />
        <meshStandardMaterial color="#2d3748" />
      </mesh>
      <mesh position={[-0.8, 0.22, -1.0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.22, 0.22, 0.18, 16]} />
        <meshStandardMaterial color="#2d3748" />
      </mesh>
      <mesh position={[0.8, 0.22, -1.0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.22, 0.22, 0.18, 16]} />
        <meshStandardMaterial color="#2d3748" />
      </mesh>

      {/* Slot Base Turntable Plate */}
      <mesh position={[0, 0.02, 0]} receiveShadow>
        <cylinderGeometry args={[2.0, 2.0, 0.04, 32]} />
        <meshStandardMaterial
          color={isSelected ? '#10b981' : '#1e293b'}
          roughness={0.4}
          metalness={0.6}
        />
      </mesh>

      {/* 3D Highlight Beacon Pin if Selected */}
      {isSelected && (
        <group position={[0, 1.8, 0]}>
          <mesh>
            <cylinderGeometry args={[0.25, 0.02, 0.6, 16]} />
            <meshStandardMaterial color="#10b981" emissive="#10b981" emissiveIntensity={3} />
          </mesh>
          <Html position={[0, 0.6, 0]} center distanceFactor={14}>
            <div className="flex flex-col items-center pointer-events-none animate-bounce">
              <div className="px-3 py-1 rounded-lg bg-emerald-500 text-slate-950 text-xs font-black tracking-wider uppercase shadow-xl whitespace-nowrap">
                {carTitle || label}
              </div>
              <div className="w-2.5 h-2.5 bg-emerald-500 rotate-45 -mt-1" />
            </div>
          </Html>
        </group>
      )}

      {/* Normal Slot Tag (when not selected) */}
      {!isSelected && (
        <Html position={[0, 1.1, 0]} center distanceFactor={16}>
          <div className="px-2 py-0.5 rounded bg-slate-900/80 text-[10px] text-slate-300 border border-slate-700 whitespace-nowrap">
            {label}
          </div>
        </Html>
      )}
    </group>
  );
}

// 3D Kiosk Pillar Terminal representation
function KioskTerminalMesh({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      {/* Kiosk Pedestal */}
      <mesh position={[0, 0.7, 0]}>
        <cylinderGeometry args={[0.2, 0.25, 1.4, 16]} />
        <meshStandardMaterial color="#0f172a" metalness={0.8} roughness={0.2} />
      </mesh>
      {/* Touch Screen Display */}
      <mesh position={[0, 1.45, 0]} rotation={[-0.3, 0, 0]}>
        <boxGeometry args={[0.55, 0.75, 0.06]} />
        <meshStandardMaterial color="#0284c7" emissive="#0284c7" emissiveIntensity={2} />
      </mesh>
      {/* Pulsing "You Are Here" Beacon */}
      <Html position={[0, 2.1, 0]} center distanceFactor={14}>
        <div className="flex flex-col items-center pointer-events-none">
          <div className="px-3 py-1 rounded-full bg-sky-500 text-white text-xs font-extrabold uppercase shadow-lg shadow-sky-500/50 flex items-center gap-1.5 whitespace-nowrap">
            <span className="w-2 h-2 rounded-full bg-white animate-ping" />
            YOU ARE HERE
          </div>
          <div className="w-2.5 h-2.5 bg-sky-500 rotate-45 -mt-1" />
        </div>
      </Html>
    </group>
  );
}

// Architectural Showroom Floor & Lighting
function ShowroomArchitecture() {
  return (
    <group>
      {/* Showroom Polished Floor */}
      <mesh position={[0, 0, 0]} receiveShadow>
        <planeGeometry args={[32, 28]} />
        <meshStandardMaterial
          color="#0f172a"
          roughness={0.15}
          metalness={0.4}
        />
      </mesh>

      {/* Grid Floor Lines for high-tech showroom vibe */}
      <gridHelper args={[32, 32, '#1e293b', '#1e293b']} position={[0, 0.01, 0]} />

      {/* Perimeter Showroom Walls */}
      {/* Back Wall */}
      <mesh position={[0, 3, -14]} receiveShadow>
        <boxGeometry args={[32, 6, 0.4]} />
        <meshStandardMaterial color="#1e293b" roughness={0.6} />
      </mesh>
      {/* Brand Signage on Back Wall */}
      <mesh position={[0, 4.2, -13.7]}>
        <planeGeometry args={[8, 1.2]} />
        <meshStandardMaterial color="#10b981" emissive="#10b981" emissiveIntensity={0.8} />
      </mesh>

      {/* Left Wall */}
      <mesh position={[-16, 3, 0]} receiveShadow>
        <boxGeometry args={[0.4, 6, 28]} />
        <meshStandardMaterial color="#1e293b" roughness={0.6} />
      </mesh>

      {/* Right Wall */}
      <mesh position={[16, 3, 0]} receiveShadow>
        <boxGeometry args={[0.4, 6, 28]} />
        <meshStandardMaterial color="#1e293b" roughness={0.6} />
      </mesh>

      {/* Front Entrance Glass Facade */}
      <mesh position={[0, 3, 14]}>
        <boxGeometry args={[32, 6, 0.2]} />
        <meshPhysicalMaterial color="#38bdf8" transparent opacity={0.15} roughness={0.05} transmission={0.9} />
      </mesh>

      {/* Overhead Lighting Trusses */}
      <mesh position={[0, 5.8, 0]}>
        <boxGeometry args={[26, 0.3, 20]} />
        <meshStandardMaterial color="#090d16" wireframe />
      </mesh>
    </group>
  );
}

// Camera Flight Controller: flies to car slot or top-down
function ShowroomCameraController({
  targetPos,
  isTopDown,
}: {
  targetPos: [number, number, number] | null;
  isTopDown: boolean;
}) {
  const controlsRef = useRef<any>(null);

  useEffect(() => {
    if (!controlsRef.current) return;

    if (isTopDown) {
      // 2D Top-down orthographic/high perspective
      controlsRef.current.target.set(0, 0, 0);
      controlsRef.current.object.position.set(0, 22, 0.1);
      controlsRef.current.maxPolarAngle = 0;
    } else if (targetPos) {
      // Fly directly to focus on target slot
      controlsRef.current.target.set(targetPos[0], targetPos[1] + 0.5, targetPos[2]);
      controlsRef.current.object.position.set(targetPos[0] + 4.5, targetPos[1] + 3.5, targetPos[2] + 5.5);
      controlsRef.current.maxPolarAngle = Math.PI / 2 - 0.05;
    } else {
      // Overview perspective
      controlsRef.current.target.set(0, 0, 0);
      controlsRef.current.object.position.set(0, 14, 18);
      controlsRef.current.maxPolarAngle = Math.PI / 2 - 0.05;
    }
  }, [targetPos, isTopDown]);

  return (
    <OrbitControls
      ref={controlsRef}
      enableDamping
      dampingFactor={0.08}
      minDistance={2}
      maxDistance={35}
    />
  );
}

export const ShowroomViewer3D: React.FC<ShowroomViewer3DProps> = ({
  showroom,
  targetCar,
  targetSlotId,
  kioskPos = { x: 0, y: 0, z: 8.5 },
  className = 'h-[500px] w-full',
  onSelectSlot,
}) => {
  const [isTopDown, setIsTopDown] = useState(false);
  const [selectedFloorLevel, setSelectedFloorLevel] = useState(1);

  // Active floor
  const activeFloor = showroom.floors?.find((f) => f.level === selectedFloorLevel) || showroom.floors?.[0];
  const slots: ShowroomSlot[] = activeFloor?.slots || [];

  // Determine target slot
  const resolvedTargetSlot = slots.find((s) => s.id === (targetCar?.slot_id ?? targetSlotId));

  const targetCoords: [number, number, number] | null = resolvedTargetSlot
    ? [resolvedTargetSlot.pos_x, resolvedTargetSlot.pos_y, resolvedTargetSlot.pos_z]
    : null;

  // Build route path points from kiosk to target slot
  const routePoints = resolvedTargetSlot
    ? [
        new THREE.Vector3(kioskPos.x, 0.08, kioskPos.z),
        new THREE.Vector3(kioskPos.x, 0.08, (kioskPos.z + resolvedTargetSlot.pos_z) / 2),
        new THREE.Vector3(resolvedTargetSlot.pos_x, 0.08, (kioskPos.z + resolvedTargetSlot.pos_z) / 2),
        new THREE.Vector3(resolvedTargetSlot.pos_x, 0.08, resolvedTargetSlot.pos_z),
      ]
    : [];

  return (
    <div className={`relative overflow-hidden rounded-2xl bg-slate-950 border border-slate-800 ${className}`}>
      {/* 3D Scene Canvas */}
      <Canvas shadows camera={{ position: [0, 14, 18], fov: 45 }}>
        <ambientLight intensity={0.6} />
        <directionalLight position={[10, 16, 10]} intensity={2.0} castShadow shadow-mapSize={[2048, 2048]} />
        <directionalLight position={[-10, 12, -10]} intensity={1.0} />
        <spotLight position={[0, 12, 0]} intensity={1.5} angle={0.8} penumbra={0.6} color="#ffffff" />

        {/* Showroom Architectural Walls & Floor */}
        <ShowroomArchitecture />

        {/* Kiosk Position Terminal */}
        <KioskTerminalMesh position={[kioskPos.x, kioskPos.y, kioskPos.z]} />

        {/* Render Slots with Cars */}
        {slots.map((slot) => {
          const isTarget = slot.id === resolvedTargetSlot?.id;
          const assignedCar = slot.car || (isTarget ? targetCar : undefined);
          const carColor = assignedCar?.color
            ? (assignedCar.color.toLowerCase().includes('green')
                ? '#1DB954'
                : assignedCar.color.toLowerCase().includes('red')
                ? '#D91E18'
                : assignedCar.color.toLowerCase().includes('yellow')
                ? '#FFC800'
                : assignedCar.color.toLowerCase().includes('blue')
                ? '#0F4C81'
                : '#CCCCCC')
            : '#888888';

          return (
            <group key={slot.id} onClick={() => onSelectSlot?.(slot)}>
              <PlaceholderCar
                position={[slot.pos_x, slot.pos_y, slot.pos_z]}
                rotationY={slot.rotation_y}
                color={carColor}
                isSelected={isTarget}
                label={slot.label}
                carTitle={assignedCar?.title}
              />
            </group>
          );
        })}

        {/* Dynamic Navigation Line between Kiosk and Car */}
        {routePoints.length > 0 && (
          <Line
            points={routePoints}
            color="#10b981"
            lineWidth={4}
            dashed
            dashScale={1.5}
            dashSize={0.6}
            gapSize={0.3}
          />
        )}

        <ShowroomCameraController targetPos={targetCoords} isTopDown={isTopDown} />
      </Canvas>

      {/* Top Left Navigation Header */}
      <div className="absolute top-4 left-4 z-10 flex flex-col gap-1.5">
        <div className="flex items-center gap-2">
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-sky-500/20 text-sky-400 border border-sky-500/30 backdrop-blur-md flex items-center gap-1.5">
            <Navigation className="w-3.5 h-3.5 text-sky-400" />
            3D In-Showroom Locator
          </span>
          <span className="px-3 py-1 rounded-full text-xs font-medium bg-slate-900/80 text-slate-300 border border-slate-700/80 backdrop-blur-md">
            {showroom.name}
          </span>
        </div>

        {resolvedTargetSlot && (
          <div className="px-3.5 py-1.5 rounded-xl bg-emerald-950/90 border border-emerald-500/50 backdrop-blur-md shadow-lg animate-fadeIn text-xs text-emerald-300 font-semibold flex items-center gap-2">
            <MapPin className="w-3.5 h-3.5 text-emerald-400 animate-bounce" />
            <span>Stationed at: <strong className="text-white font-bold">{resolvedTargetSlot.label}</strong></span>
          </div>
        )}
      </div>

      {/* Top Right Controls (2D/3D Toggle & Floor Selector) */}
      <div className="absolute top-4 right-4 z-10 flex items-center gap-2">
        {/* Floor selector if multiple levels */}
        {(showroom.floors?.length || 0) > 1 && (
          <div className="flex items-center rounded-xl bg-slate-900/90 border border-slate-700 p-1 backdrop-blur-md">
            {showroom.floors?.map((f) => (
              <button
                key={f.id}
                onClick={() => setSelectedFloorLevel(f.level)}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                  selectedFloorLevel === f.level
                    ? 'bg-emerald-500 text-slate-950'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Level {f.level}
              </button>
            ))}
          </div>
        )}

        {/* 2D Top-Down Toggle */}
        <button
          onClick={() => setIsTopDown(!isTopDown)}
          className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium transition-all backdrop-blur-md border ${
            isTopDown
              ? 'bg-emerald-600 text-white border-emerald-400 shadow-lg shadow-emerald-500/20'
              : 'bg-slate-900/80 text-slate-200 border-slate-700 hover:bg-slate-800'
          }`}
        >
          <Compass className="w-3.5 h-3.5" />
          {isTopDown ? '3D Perspective' : '2D Floor Plan'}
        </button>
      </div>

      {/* Bottom Route Summary Bar if target selected */}
      {resolvedTargetSlot && (
        <div className="absolute bottom-4 left-4 right-4 z-10 flex items-center justify-between p-3 rounded-2xl bg-slate-900/90 border border-emerald-500/30 backdrop-blur-md shadow-2xl">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400">
              <Navigation className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <p className="text-xs text-slate-400 font-medium">Step-by-Step Direction</p>
              <p className="text-sm font-bold text-slate-100">
                Walk forward past North Corridor directly to <span className="text-emerald-400">{resolvedTargetSlot.label}</span>
              </p>
            </div>
          </div>
          <div className="text-right">
            <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider block">Estimated Walk</span>
            <span className="text-sm font-mono text-slate-200">~15 paces (12m)</span>
          </div>
        </div>
      )}
    </div>
  );
};

