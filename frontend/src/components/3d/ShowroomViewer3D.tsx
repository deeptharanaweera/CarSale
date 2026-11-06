import React, { useRef, useEffect, useState, useMemo } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, Html, Line } from '@react-three/drei';
import * as THREE from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { Showroom, ShowroomSlot, Car } from '../../types';
import { MapPin, Navigation, Compass } from 'lucide-react';

interface ShowroomViewer3DProps {
  showroom: Showroom;
  targetCar?: Car | null;
  targetSlotId?: number | null;
  kioskPos?: { x: number; y: number; z: number };
  className?: string;
  onSelectSlot?: (slot: ShowroomSlot) => void;
}

function ShowroomStudioEnv() {
  const { gl, scene } = useThree();
  useEffect(() => {
    const pmrem = new THREE.PMREMGenerator(gl);
    const tex = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
    scene.environment = tex;
    return () => {
      tex.dispose();
      pmrem.dispose();
    };
  }, [gl, scene]);
  return null;
}

// Sculpted 3D Showroom Bay Vehicle
function SculptedSlotCar({
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

  const hullGeo = useMemo(() => {
    const shape = new THREE.Shape();
    shape.moveTo(-1.6, 0.14);
    shape.quadraticCurveTo(-1.7, 0.36, -1.55, 0.52);
    shape.lineTo(-0.85, 0.56);
    shape.quadraticCurveTo(-0.4, 0.88, 0.15, 0.86);
    shape.quadraticCurveTo(0.65, 0.82, 0.92, 0.54);
    shape.quadraticCurveTo(1.45, 0.48, 1.65, 0.28);
    shape.lineTo(1.62, 0.14);
    shape.closePath();

    const geo = new THREE.ExtrudeGeometry(shape, {
      steps: 1,
      depth: 1.28,
      bevelEnabled: true,
      bevelThickness: 0.12,
      bevelSize: 0.1,
      bevelSegments: 5,
      curveSegments: 20,
    });
    geo.center();
    geo.rotateY(Math.PI / 2);
    return geo;
  }, []);

  useFrame((state) => {
    if (isSelected && meshRef.current) {
      meshRef.current.position.y =
        position[1] + Math.sin(state.clock.elapsedTime * 2.5) * 0.04 + 0.03;
    }
  });

  return (
    <group ref={meshRef} position={position} rotation={[0, rotationY, 0]}>
      {/* Sculpted Car Body */}
      <mesh position={[0, 0.48, 0]} geometry={hullGeo} castShadow receiveShadow>
        <meshPhysicalMaterial
          color={new THREE.Color(color)}
          metalness={0.8}
          roughness={0.16}
          clearcoat={1.0}
          clearcoatRoughness={0.06}
          emissive={isSelected ? new THREE.Color(color) : new THREE.Color(0x000000)}
          emissiveIntensity={isSelected ? 0.22 : 0}
        />
      </mesh>

      {/* Headlight DRL Blades */}
      <mesh position={[-0.48, 0.38, 1.62]}>
        <boxGeometry args={[0.26, 0.04, 0.05]} />
        <meshStandardMaterial color="#e0ffff" emissive="#00e5ff" emissiveIntensity={4} />
      </mesh>
      <mesh position={[0.48, 0.38, 1.62]}>
        <boxGeometry args={[0.26, 0.04, 0.05]} />
        <meshStandardMaterial color="#e0ffff" emissive="#00e5ff" emissiveIntensity={4} />
      </mesh>

      {/* Rear Taillight Bar */}
      <mesh position={[0, 0.44, -1.62]}>
        <boxGeometry args={[1.28, 0.04, 0.04]} />
        <meshStandardMaterial color="#ff1e42" emissive="#ff0033" emissiveIntensity={4} />
      </mesh>

      {/* 4 Forged Wheels */}
      {(
        [
          [-0.72, 0.24, 1.02],
          [0.72, 0.24, 1.02],
          [-0.74, 0.25, -1.02],
          [0.74, 0.25, -1.02],
        ] as [number, number, number][]
      ).map((wPos, i) => (
        <group key={i} position={wPos} rotation={[0, 0, Math.PI / 2]}>
          <mesh castShadow>
            <cylinderGeometry args={[0.24, 0.24, 0.2, 24]} />
            <meshStandardMaterial color="#0f131a" roughness={0.8} />
          </mesh>
          <mesh>
            <cylinderGeometry args={[0.17, 0.17, 0.21, 16]} />
            <meshStandardMaterial color="#cbd5e1" metalness={0.9} roughness={0.2} />
          </mesh>
        </group>
      ))}

      {/* Turntable Base */}
      <mesh position={[0, 0.02, 0]} receiveShadow>
        <cylinderGeometry args={[2.05, 2.15, 0.04, 48]} />
        <meshStandardMaterial
          color={isSelected ? '#0891b2' : '#111827'}
          roughness={0.25}
          metalness={0.7}
        />
      </mesh>

      {/* Glowing Rim Ring on Turntable */}
      <mesh position={[0, 0.045, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[1.98, 2.04, 48]} />
        <meshBasicMaterial color={isSelected ? '#00e5ff' : '#334155'} />
      </mesh>

      {/* Selected Beacon */}
      {isSelected ? (
        <Html position={[0, 1.65, 0]} center distanceFactor={14}>
          <div className="flex flex-col items-center pointer-events-none">
            <div className="px-3 py-1 rounded-md bg-cyan-500 text-slate-950 text-xs font-bold tracking-wider uppercase shadow-xl whitespace-nowrap">
              {carTitle || label}
            </div>
            <div className="w-2 h-2 bg-cyan-500 rotate-45 -mt-1" />
          </div>
        </Html>
      ) : (
        <Html position={[0, 1.15, 0]} center distanceFactor={16}>
          <div className="px-2 py-0.5 rounded bg-[#0B121C]/90 text-[10px] font-mono text-slate-300 border border-white/15 whitespace-nowrap">
            Bay {label}
          </div>
        </Html>
      )}
    </group>
  );
}

// Kiosk Terminal Pedestal
function KioskTerminalMesh({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      <mesh position={[0, 0.7, 0]}>
        <cylinderGeometry args={[0.2, 0.25, 1.4, 24]} />
        <meshStandardMaterial color="#0f172a" metalness={0.85} roughness={0.2} />
      </mesh>
      <mesh position={[0, 1.45, 0]} rotation={[-0.3, 0, 0]}>
        <boxGeometry args={[0.55, 0.75, 0.06]} />
        <meshStandardMaterial color="#00e5ff" emissive="#00e5ff" emissiveIntensity={2} />
      </mesh>
      <Html position={[0, 2.1, 0]} center distanceFactor={14}>
        <div className="flex flex-col items-center pointer-events-none">
          <div className="px-3 py-1 rounded-md bg-sky-500 text-slate-950 text-xs font-bold uppercase shadow-lg whitespace-nowrap">
            Kiosk Terminal · You Are Here
          </div>
          <div className="w-2 h-2 bg-sky-500 rotate-45 -mt-1" />
        </div>
      </Html>
    </group>
  );
}

function ShowroomArchitecture() {
  return (
    <group>
      <mesh position={[0, 0, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[34, 30]} />
        <meshStandardMaterial color="#070a10" roughness={0.14} metalness={0.5} />
      </mesh>
      <gridHelper args={[34, 34, '#1e293b', '#111827']} position={[0, 0.01, 0]} />
      <mesh position={[0, 3, -14]} receiveShadow>
        <boxGeometry args={[34, 6, 0.4]} />
        <meshStandardMaterial color="#0f172a" roughness={0.5} />
      </mesh>
      <mesh position={[0, 4.2, -13.7]}>
        <planeGeometry args={[8, 1.0]} />
        <meshStandardMaterial color="#00e5ff" emissive="#00e5ff" emissiveIntensity={0.9} />
      </mesh>
    </group>
  );
}

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
      controlsRef.current.target.set(0, 0, 0);
      controlsRef.current.object.position.set(0, 22, 0.1);
      controlsRef.current.maxPolarAngle = 0;
    } else if (targetPos) {
      controlsRef.current.target.set(targetPos[0], targetPos[1] + 0.5, targetPos[2]);
      controlsRef.current.object.position.set(
        targetPos[0] + 4.5,
        targetPos[1] + 3.2,
        targetPos[2] + 5.2
      );
      controlsRef.current.maxPolarAngle = Math.PI / 2 - 0.05;
    } else {
      controlsRef.current.target.set(0, 0, 0);
      controlsRef.current.object.position.set(0, 13, 17);
      controlsRef.current.maxPolarAngle = Math.PI / 2 - 0.05;
    }
    controlsRef.current.update();
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

  const activeFloor =
    showroom.floors?.find((f) => f.level === selectedFloorLevel) || showroom.floors?.[0];
  const slots: ShowroomSlot[] = activeFloor?.slots || [];

  const resolvedTargetSlot = slots.find((s) => s.id === (targetCar?.slot_id ?? targetSlotId));

  const targetCoords: [number, number, number] | null = resolvedTargetSlot
    ? [resolvedTargetSlot.pos_x, resolvedTargetSlot.pos_y, resolvedTargetSlot.pos_z]
    : null;

  const routePoints = resolvedTargetSlot
    ? [
        new THREE.Vector3(kioskPos.x, 0.08, kioskPos.z),
        new THREE.Vector3(kioskPos.x, 0.08, (kioskPos.z + resolvedTargetSlot.pos_z) / 2),
        new THREE.Vector3(
          resolvedTargetSlot.pos_x,
          0.08,
          (kioskPos.z + resolvedTargetSlot.pos_z) / 2
        ),
        new THREE.Vector3(resolvedTargetSlot.pos_x, 0.08, resolvedTargetSlot.pos_z),
      ]
    : [];

  return (
    <div
      className={`relative overflow-hidden rounded-2xl bg-[#05080D] border border-cyan-500/20 ${className}`}
    >
      <Canvas shadows camera={{ position: [0, 13, 17], fov: 42 }}>
        <ShowroomStudioEnv />
        <ambientLight intensity={0.65} />
        <directionalLight
          position={[10, 16, 10]}
          intensity={2.2}
          castShadow
          shadow-mapSize={[1024, 1024]}
        />
        <directionalLight position={[-10, 12, -10]} intensity={1.2} color="#38bdf8" />

        <ShowroomArchitecture />
        <KioskTerminalMesh position={[kioskPos.x, kioskPos.y, kioskPos.z]} />

        {slots.map((slot) => {
          const isTarget = slot.id === resolvedTargetSlot?.id;
          const assignedCar = slot.car || (isTarget ? targetCar : undefined);
          const carColor = assignedCar?.color
            ? assignedCar.color.toLowerCase().includes('green')
              ? '#10B981'
              : assignedCar.color.toLowerCase().includes('red')
              ? '#E11D48'
              : assignedCar.color.toLowerCase().includes('yellow')
              ? '#EAB308'
              : assignedCar.color.toLowerCase().includes('blue')
              ? '#0284C7'
              : '#94A3B8'
            : '#475569';

          return (
            <group key={slot.id} onClick={() => onSelectSlot?.(slot)}>
              <SculptedSlotCar
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

        {routePoints.length > 0 && (
          <Line
            points={routePoints}
            color="#00e5ff"
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
          <span className="px-3 py-1 rounded-md text-xs font-mono uppercase tracking-wider bg-[#0B121C]/90 text-cyan-400 border border-cyan-500/30 flex items-center gap-1.5">
            <Navigation className="w-3.5 h-3.5 text-cyan-400" />
            <span>3D In-Showroom Locator</span>
          </span>
          <span className="px-3 py-1 rounded-md text-xs font-medium bg-[#0B121C]/90 text-slate-300 border border-white/10">
            {showroom.name}
          </span>
        </div>

        {resolvedTargetSlot && (
          <div className="px-3.5 py-1.5 rounded-lg bg-[#0B121C]/95 border border-cyan-500/40 text-xs text-cyan-300 font-medium flex items-center gap-2">
            <MapPin className="w-3.5 h-3.5 text-cyan-400" />
            <span>
              Allocated Bay: <strong className="text-white font-mono">{resolvedTargetSlot.label}</strong>
            </span>
          </div>
        )}
      </div>

      {/* Top Right Controls */}
      <div className="absolute top-4 right-4 z-10 flex items-center gap-2">
        {(showroom.floors?.length || 0) > 1 && (
          <div className="flex items-center rounded-lg bg-[#0B121C]/90 border border-white/10 p-1">
            {showroom.floors?.map((f) => (
              <button
                key={f.id}
                type="button"
                onClick={() => setSelectedFloorLevel(f.level)}
                className={`px-2.5 py-1 rounded-md text-xs font-semibold transition-colors ${
                  selectedFloorLevel === f.level
                    ? 'bg-cyan-500 text-slate-950'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Level {f.level}
              </button>
            ))}
          </div>
        )}

        <button
          type="button"
          onClick={() => setIsTopDown(!isTopDown)}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors border ${
            isTopDown
              ? 'bg-cyan-500 text-slate-950 font-semibold border-cyan-400'
              : 'bg-[#0B121C]/90 text-slate-200 border-white/10 hover:text-white'
          }`}
        >
          <Compass className="w-3.5 h-3.5" />
          <span>{isTopDown ? '3D Perspective' : '2D Floor Plan'}</span>
        </button>
      </div>

      {/* Bottom Route Summary Bar */}
      {resolvedTargetSlot && (
        <div className="absolute bottom-4 left-4 right-4 z-10 flex items-center justify-between p-3.5 rounded-xl bg-[#0B121C]/95 border border-cyan-500/30 shadow-2xl">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-cyan-500/15 text-cyan-400">
              <Navigation className="w-4 h-4" />
            </div>
            <div>
              <p className="text-[11px] text-slate-400 font-medium">Guided Walkway Route</p>
              <p className="text-xs font-semibold text-white">
                Proceed along North Gallery Corridor directly to{' '}
                <span className="text-cyan-400 font-mono">Bay {resolvedTargetSlot.label}</span>
              </p>
            </div>
          </div>
          <div className="text-right">
            <span className="text-[10px] font-mono text-cyan-400 uppercase tracking-wider block">
              Walking Distance
            </span>
            <span className="text-xs font-mono tabular-nums text-slate-200">~15 paces (12m)</span>
          </div>
        </div>
      )}
    </div>
  );
};
