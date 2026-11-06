import React, { useState, useEffect } from 'react';
import { Car, KioskConfig } from '../../types';
import { api } from '../../services/api';
import { KioskAttractScreen } from './KioskAttractScreen';
import { KioskLeadModal } from './KioskLeadModal';
import { CarViewer3D } from '../3d/CarViewer3D';
import { ShowroomViewer3D } from '../3d/ShowroomViewer3D';
import {
  MapPin,
  Compass,
  ArrowLeft,
  PhoneCall,
  Calendar,
  QrCode,
  Gauge,
  Fuel,
  Settings2,
  Sparkles,
  Filter,
} from 'lucide-react';

export const KioskApp: React.FC = () => {
  const [config, setConfig] = useState<KioskConfig | null>(null);
  const [cars, setCars] = useState<Car[]>([]);
  const [selectedCar, setSelectedCar] = useState<Car | null>(null);
  const [isAttractMode, setIsAttractMode] = useState(true);
  const [activeTab, setActiveTab] = useState<'3d_car' | 'where_is_car'>('3d_car');
  const [leadModalTab, setLeadModalTab] = useState<'staff' | 'test_drive' | 'qr' | null>(null);
  const [selectedBrand, setSelectedBrand] = useState<string>('all');
  const [selectedBodyType, setSelectedBodyType] = useState<string>('all');
  const [idleSeconds, setIdleSeconds] = useState(0);

  const availableKiosks = [
    { name: 'NYC Main Entrance', token: 'KIOSK_TOKEN_NYC_01' },
    { name: 'NYC West Gallery Lounge', token: 'KIOSK_TOKEN_NYC_02' },
    { name: 'LA Beverly Atrium', token: 'KIOSK_TOKEN_LA_01' },
  ];

  const loadKioskData = async (token?: string) => {
    if (token) {
      api.setKioskToken(token);
    }
    try {
      const configRes = await api.getKioskConfig();
      setConfig(configRes.data);

      const carsRes = await api.getKioskCars();
      setCars(carsRes.data);
    } catch (err) {
      console.error('Failed to load kiosk data:', err);
    }
  };

  useEffect(() => {
    loadKioskData();

    const handleCarsUpdated = async () => {
      try {
        const carsRes = await api.getKioskCars();
        const updatedCars = carsRes.data;
        setCars(updatedCars);
        setSelectedCar((prev) =>
          prev ? updatedCars.find((c) => c.id === prev.id) || prev : null
        );
      } catch {
        // ignore
      }
    };

    window.addEventListener('aura-cars-updated', handleCarsUpdated);
    return () => window.removeEventListener('aura-cars-updated', handleCarsUpdated);
  }, []);

  // 60-Second Inactivity Idle Guard
  useEffect(() => {
    const handleUserActivity = () => {
      setIdleSeconds(0);
    };

    window.addEventListener('click', handleUserActivity);
    window.addEventListener('touchstart', handleUserActivity);
    window.addEventListener('mousemove', handleUserActivity);

    const interval = setInterval(() => {
      setIdleSeconds((prev) => {
        if (prev >= 60 && !isAttractMode) {
          setIsAttractMode(true);
          setSelectedCar(null);
          setLeadModalTab(null);
          setActiveTab('3d_car');
          return 0;
        }
        return prev + 1;
      });
    }, 1000);

    return () => {
      clearInterval(interval);
      window.removeEventListener('click', handleUserActivity);
      window.removeEventListener('touchstart', handleUserActivity);
      window.removeEventListener('mousemove', handleUserActivity);
    };
  }, [isAttractMode]);

  useEffect(() => {
    const heartbeatTimer = setInterval(() => {
      api.sendKioskHeartbeat().catch(() => {});
    }, 30000);
    return () => clearInterval(heartbeatTimer);
  }, []);

  const filteredCars = cars.filter((car) => {
    if (selectedBrand !== 'all' && car.model?.brand?.slug !== selectedBrand) return false;
    if (selectedBodyType !== 'all' && car.model?.body_type !== selectedBodyType) return false;
    return true;
  });

  const brands = [
    'all',
    ...Array.from(new Set(cars.map((c) => c.model?.brand?.slug).filter(Boolean))),
  ];
  const bodyTypes = [
    'all',
    ...Array.from(new Set(cars.map((c) => c.model?.body_type).filter(Boolean))),
  ];

  if (!config) {
    return (
      <div className="w-full h-screen bg-[#05080D] flex flex-col items-center justify-center text-white">
        <div className="w-10 h-10 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-xs font-mono tracking-widest uppercase text-slate-400">
          Connecting to Showroom Kiosk Terminal...
        </p>
      </div>
    );
  }

  if (isAttractMode) {
    return (
      <KioskAttractScreen
        showroom={config.showroom}
        availableCarsCount={cars.length}
        onStart={() => {
          setIsAttractMode(false);
          setIdleSeconds(0);
        }}
      />
    );
  }

  return (
    <div className="w-full h-screen bg-[#05080D] text-slate-100 flex flex-col overflow-hidden select-none">
      {/* Top Kiosk Bar */}
      <header className="h-18 bg-[#090E17] border-b border-white/[0.08] px-8 py-3.5 flex items-center justify-between z-20">
        <div className="flex items-center gap-4">
          {selectedCar ? (
            <button
              type="button"
              onClick={() => {
                setSelectedCar(null);
                setActiveTab('3d_car');
              }}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#111827] hover:bg-white/[0.08] border border-white/[0.12] text-white text-xs font-semibold transition-colors"
            >
              <ArrowLeft className="w-4 h-4 text-cyan-400" />
              <span>Back to Showroom Fleet</span>
            </button>
          ) : (
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-cyan-500/15 text-cyan-400 border border-cyan-500/30 flex items-center justify-center">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <h1 className="text-base font-bold uppercase tracking-wider text-white font-display">
                  {config.name}
                </h1>
                <p className="text-xs text-cyan-400 font-medium flex items-center gap-1.5">
                  <MapPin className="w-3 h-3" />
                  <span>
                    {config.showroom.name} · {cars.length} Allocated Vehicles
                  </span>
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Center / Right Controls */}
        <div className="flex items-center gap-3 pr-36">
          <div className="flex items-center rounded-xl bg-[#05080D] border border-white/[0.08] p-1">
            <span className="text-[11px] text-slate-400 px-2 font-medium">Terminal:</span>
            {availableKiosks.map((k, idx) => (
              <button
                key={k.token}
                type="button"
                onClick={() => loadKioskData(k.token)}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors ${
                  config.token === k.token
                    ? 'bg-cyan-500 text-slate-950'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {idx === 0 ? 'NYC Main' : idx === 1 ? 'NYC West' : 'LA Beverly'}
              </button>
            ))}
          </div>

          <div className="px-3 py-1.5 rounded-lg bg-[#111827] border border-white/[0.08] text-xs text-slate-400 font-mono tabular-nums">
            Idle Reset: {60 - idleSeconds}s
          </div>

          <button
            type="button"
            onClick={() => setLeadModalTab('staff')}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs uppercase tracking-wider transition-colors"
          >
            <PhoneCall className="w-3.5 h-3.5" />
            <span>Call Advisor</span>
          </button>
        </div>
      </header>

      {/* Main Kiosk Content Area */}
      <main className="flex-1 overflow-hidden relative">
        {!selectedCar ? (
          /* Kiosk Fleet Grid Mode */
          <div className="w-full h-full flex flex-col p-8 overflow-y-auto no-scrollbar">
            <div className="flex flex-wrap items-center justify-between gap-4 mb-6 pb-4 border-b border-white/[0.08]">
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider mr-1 flex items-center gap-1.5">
                  <Filter className="w-3.5 h-3.5 text-cyan-400" /> Marque:
                </span>
                {brands.map((b) => (
                  <button
                    key={b}
                    type="button"
                    onClick={() => setSelectedBrand(b || 'all')}
                    className={`px-3.5 py-2 rounded-xl text-xs font-semibold capitalize transition-colors ${
                      selectedBrand === b
                        ? 'bg-cyan-500 text-slate-950'
                        : 'bg-[#0D131F] border border-white/[0.08] text-slate-300 hover:text-white'
                    }`}
                  >
                    {b}
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider mr-1">
                  Silhouette:
                </span>
                {bodyTypes.map((bt) => (
                  <button
                    key={bt}
                    type="button"
                    onClick={() => setSelectedBodyType(bt || 'all')}
                    className={`px-3.5 py-2 rounded-xl text-xs font-semibold capitalize transition-colors ${
                      selectedBodyType === bt
                        ? 'bg-white text-slate-950'
                        : 'bg-[#0D131F] border border-white/[0.08] text-slate-300 hover:text-white'
                    }`}
                  >
                    {bt}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 flex-1">
              {filteredCars.map((car) => {
                const coverImage =
                  car.images?.[0]?.url ||
                  '/src/assets/images/car_bmw_m4_emerald_1793964978767.jpg';
                return (
                  <div
                    key={car.id}
                    onClick={() => {
                      setSelectedCar(car);
                      setActiveTab('3d_car');
                    }}
                    className="group rounded-2xl bg-[#0D131F] border border-white/[0.08] hover:border-cyan-400/50 p-5 flex flex-col justify-between transition-all cursor-pointer select-none"
                  >
                    <div className="relative aspect-[16/10] rounded-xl overflow-hidden bg-[#05080D] mb-4">
                      <img
                        src={coverImage}
                        alt={car.title}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute top-3 left-3 flex gap-2">
                        <span className="px-2.5 py-1 rounded-md text-[11px] font-medium bg-black/75 text-slate-200 border border-white/10">
                          {car.condition}
                        </span>
                        {car.slot && (
                          <span className="px-2.5 py-1 rounded-md text-[11px] font-mono font-semibold bg-cyan-500 text-slate-950 flex items-center gap-1">
                            <MapPin className="w-3 h-3" />
                            Bay {car.slot.label}
                          </span>
                        )}
                      </div>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedCar(car);
                          setLeadModalTab('qr');
                        }}
                        title="Scan QR on Mobile"
                        className="absolute top-3 right-3 p-2 rounded-lg bg-black/75 hover:bg-cyan-500 text-slate-200 hover:text-slate-950 border border-white/15 transition-colors"
                      >
                        <QrCode className="w-4 h-4" />
                      </button>
                      <div className="absolute bottom-3 left-3">
                        <span className="px-2.5 py-1 rounded text-[10px] font-mono uppercase tracking-wider bg-[#05080D]/90 text-cyan-400 border border-cyan-500/30">
                          3D Studio + Side Telemetry
                        </span>
                      </div>
                    </div>

                    <div className="space-y-1.5 mb-4">
                      <p className="text-xs font-mono uppercase tracking-wider text-cyan-400">
                        {car.model?.brand?.name} · {car.year}
                      </p>
                      <h3 className="text-lg font-bold text-white line-clamp-1 font-display">
                        {car.title}
                      </h3>
                      <p className="text-2xl font-bold text-white font-mono tabular-nums">
                        ${car.price.toLocaleString()}
                      </p>
                    </div>

                    <div className="grid grid-cols-3 gap-2 pt-3 border-t border-white/[0.08] text-xs text-slate-400 font-mono tabular-nums">
                      <div className="flex items-center gap-1.5">
                        <Gauge className="w-3.5 h-3.5 text-cyan-400" />
                        <span>{car.mileage.toLocaleString()} mi</span>
                      </div>
                      <div className="flex items-center gap-1.5 font-sans">
                        <Fuel className="w-3.5 h-3.5 text-cyan-400" />
                        <span>{car.fuel}</span>
                      </div>
                      <div className="flex items-center gap-1.5 font-sans">
                        <Settings2 className="w-3.5 h-3.5 text-cyan-400" />
                        <span className="truncate">{car.transmission.split(' ')[0]}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          /* 3D Vehicle Studio Showcase & Side Telemetry View (Matches Reference Image 2) */
          <div className="w-full h-full flex flex-col px-8 py-5">
            {/* Top Mode Switcher & Direct Mobile Handoff */}
            <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
              <div className="flex items-center gap-2.5">
                <button
                  type="button"
                  onClick={() => setActiveTab('3d_car')}
                  className={`px-5 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider flex items-center gap-2 transition-colors ${
                    activeTab === '3d_car'
                      ? 'bg-cyan-500 text-slate-950 shadow-lg shadow-cyan-500/20'
                      : 'bg-[#0D131F] border border-white/[0.08] text-slate-300 hover:text-white'
                  }`}
                >
                  <Sparkles className="w-4 h-4" />
                  <span>3D Interactive Vehicle Showcase</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab('where_is_car')}
                  className={`px-5 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider flex items-center gap-2 transition-colors ${
                    activeTab === 'where_is_car'
                      ? 'bg-cyan-500 text-slate-950 shadow-lg shadow-cyan-500/20'
                      : 'bg-[#0D131F] border border-white/[0.08] text-slate-300 hover:text-white'
                  }`}
                >
                  <Compass className="w-4 h-4" />
                  <span>Where is This Car in Showroom?</span>
                </button>
              </div>

              <div className="flex items-center gap-2.5">
                <button
                  type="button"
                  onClick={() => setLeadModalTab('test_drive')}
                  className="px-4 py-2.5 rounded-xl bg-[#0D131F] hover:bg-white/[0.08] text-white font-semibold text-xs flex items-center gap-2 border border-white/[0.12] transition-colors"
                >
                  <Calendar className="w-4 h-4 text-cyan-400" />
                  <span>Book Private Drive</span>
                </button>

                <button
                  type="button"
                  onClick={() => setLeadModalTab('qr')}
                  className="px-4 py-2.5 rounded-xl bg-[#0D131F] hover:bg-white/[0.08] text-white font-semibold text-xs flex items-center gap-2 border border-cyan-500/40 transition-colors"
                >
                  <QrCode className="w-4 h-4 text-cyan-400" />
                  <span>Scan QR to Phone</span>
                </button>
              </div>
            </div>

            {/* Full-Height 3D Studio Viewport with Left & Right Architectural Side Callouts */}
            <div className="flex-1 relative rounded-2xl overflow-hidden shadow-2xl">
              {activeTab === '3d_car' ? (
                <CarViewer3D
                  car={selectedCar}
                  className="w-full h-full"
                  allowCustomize={true}
                  showSideDetails={true}
                />
              ) : (
                <ShowroomViewer3D
                  showroom={config.showroom}
                  targetCar={selectedCar}
                  kioskPos={config.kiosk_position}
                  className="w-full h-full"
                />
              )}
            </div>
          </div>
        )}
      </main>

      {leadModalTab && (
        <KioskLeadModal
          car={selectedCar || undefined}
          kioskConfig={config}
          initialTab={leadModalTab}
          onClose={() => setLeadModalTab(null)}
        />
      )}
    </div>
  );
};
