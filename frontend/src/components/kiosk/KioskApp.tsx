import React, { useState, useEffect, useRef } from 'react';
import { Car, KioskConfig, ShowroomSlot } from '../../types';
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
  ShieldCheck,
  CheckCircle2,
  RefreshCw,
  Search,
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

  // Kiosk tokens list for testing different locations
  const availableKiosks = [
    { name: 'NYC Main Entrance', token: 'KIOSK_TOKEN_NYC_01' },
    { name: 'NYC West Gallery Lounge', token: 'KIOSK_TOKEN_NYC_02' },
    { name: 'LA Beverly Atrium', token: 'KIOSK_TOKEN_LA_01' },
  ];

  // Fetch Kiosk Configuration & Cars
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
          // Reset to attract screen
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

  // Periodic heartbeat
  useEffect(() => {
    const heartbeatTimer = setInterval(() => {
      api.sendKioskHeartbeat().catch(() => {});
    }, 30000);
    return () => clearInterval(heartbeatTimer);
  }, []);

  // Filtered cars for this showroom
  const filteredCars = cars.filter((car) => {
    if (selectedBrand !== 'all' && car.model?.brand?.slug !== selectedBrand) return false;
    if (selectedBodyType !== 'all' && car.model?.body_type !== selectedBodyType) return false;
    return true;
  });

  const brands = ['all', ...Array.from(new Set(cars.map((c) => c.model?.brand?.slug).filter(Boolean)))];
  const bodyTypes = ['all', ...Array.from(new Set(cars.map((c) => c.model?.body_type).filter(Boolean)))];

  if (!config) {
    return (
      <div className="w-full h-screen bg-slate-950 flex flex-col items-center justify-center text-white">
        <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-sm font-semibold tracking-wider uppercase text-slate-400">
          Connecting to Kiosk Terminal Network...
        </p>
      </div>
    );
  }

  // 1. Attract Screen Mode
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
    <div className="w-full h-screen bg-slate-950 text-slate-100 flex flex-col overflow-hidden select-none">
      {/* Top Kiosk Bar */}
      <header className="h-20 bg-slate-900/90 border-b border-slate-800 px-8 flex items-center justify-between z-20 backdrop-blur-md">
        <div className="flex items-center gap-4">
          {selectedCar ? (
            <button
              onClick={() => {
                setSelectedCar(null);
                setActiveTab('3d_car');
              }}
              className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-slate-800 hover:bg-slate-750 text-white font-bold transition-all touch-target"
            >
              <ArrowLeft className="w-5 h-5 text-emerald-400" />
              <span>Back to Cars</span>
            </button>
          ) : (
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center justify-center">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h1 className="text-xl font-black uppercase tracking-wider text-white font-display">
                  {config.name}
                </h1>
                <p className="text-xs text-emerald-400 font-semibold flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5" />
                  {config.showroom.name} ({cars.length} In-Stock Vehicles)
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Center / Right controls */}
        <div className="flex items-center gap-3">
          {/* Quick Terminal Switcher for Testing */}
          <div className="flex items-center rounded-2xl bg-slate-950 border border-slate-800 p-1">
            <span className="text-[11px] text-slate-400 px-2 font-medium">Terminal:</span>
            {availableKiosks.map((k) => (
              <button
                key={k.token}
                onClick={() => loadKioskData(k.token)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  config.token === k.token
                    ? 'bg-emerald-500 text-slate-950 shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {k.name.split(' ')[0]}
              </button>
            ))}
          </div>

          {/* Idle Reset Countdown Indicator */}
          <div className="px-3.5 py-1.5 rounded-xl bg-slate-800/80 border border-slate-700 text-xs text-slate-400 font-mono">
            Idle Reset: {60 - idleSeconds}s
          </div>

          {/* Staff Dispatch CTA */}
          <button
            onClick={() => setLeadModalTab('staff')}
            className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-sm uppercase tracking-wide transition-all shadow-lg shadow-emerald-500/20 touch-target"
          >
            <PhoneCall className="w-4 h-4" />
            <span>Call Staff</span>
          </button>
        </div>
      </header>

      {/* Main Kiosk Content Area */}
      <main className="flex-1 overflow-hidden relative">
        {!selectedCar ? (
          /* 2. Car List Mode (Only this showroom's available cars) */
          <div className="w-full h-full flex flex-col p-8 overflow-y-auto no-scrollbar">
            {/* Filter Pills */}
            <div className="flex flex-wrap items-center justify-between gap-4 mb-6 pb-4 border-b border-slate-800/80">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-widest mr-2 flex items-center gap-1.5">
                  <Filter className="w-3.5 h-3.5 text-emerald-400" /> Brand:
                </span>
                {brands.map((b) => (
                  <button
                    key={b}
                    onClick={() => setSelectedBrand(b || 'all')}
                    className={`px-4 py-2.5 rounded-2xl text-xs font-bold capitalize transition-all touch-target ${
                      selectedBrand === b
                        ? 'bg-emerald-500 text-slate-950 shadow-md'
                        : 'bg-slate-900 border border-slate-800 text-slate-300 hover:bg-slate-850'
                    }`}
                  >
                    {b}
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-widest mr-2">Body:</span>
                {bodyTypes.map((bt) => (
                  <button
                    key={bt}
                    onClick={() => setSelectedBodyType(bt || 'all')}
                    className={`px-4 py-2.5 rounded-2xl text-xs font-bold capitalize transition-all touch-target ${
                      selectedBodyType === bt
                        ? 'bg-sky-500 text-white shadow-md'
                        : 'bg-slate-900 border border-slate-800 text-slate-300 hover:bg-slate-850'
                    }`}
                  >
                    {bt}
                  </button>
                ))}
              </div>
            </div>

            {/* Car Cards Grid */}
            <div className="grid grid-cols-3 gap-6 flex-1">
              {filteredCars.map((car) => {
                const coverImage = car.images?.[0]?.url || '/src/assets/images/car_bmw_m4_emerald_1793964978767.jpg';
                return (
                  <div
                    key={car.id}
                    onClick={() => {
                      setSelectedCar(car);
                      setActiveTab('3d_car');
                    }}
                    className="group rounded-3xl bg-slate-900 border border-slate-800 hover:border-emerald-500/50 p-5 flex flex-col justify-between transition-all hover:shadow-2xl hover:shadow-emerald-500/10 cursor-pointer touch-target select-none"
                  >
                    {/* Image & Badges */}
                    <div className="relative h-56 rounded-2xl overflow-hidden bg-slate-950 mb-4">
                      <img
                        src={coverImage}
                        alt={car.title}
                        className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute top-3 left-3 flex gap-2">
                        <span className="px-3 py-1 rounded-full text-xs font-bold bg-slate-900/90 text-white border border-slate-700 backdrop-blur-md">
                          {car.condition}
                        </span>
                        {car.slot && (
                          <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/90 text-slate-950 backdrop-blur-md flex items-center gap-1">
                            <MapPin className="w-3 h-3" />
                            {car.slot.label}
                          </span>
                        )}
                      </div>
                      <div className="absolute bottom-3 right-3">
                        <span className="px-3 py-1 rounded-full text-xs font-black bg-emerald-500 text-slate-950 uppercase tracking-wider">
                          3D View Available
                        </span>
                      </div>
                    </div>

                    {/* Details */}
                    <div className="space-y-2 mb-4">
                      <p className="text-xs font-bold uppercase tracking-widest text-emerald-400">
                        {car.model?.brand?.name} • {car.year}
                      </p>
                      <h3 className="text-xl font-bold text-white line-clamp-1 font-display">
                        {car.title}
                      </h3>
                      <p className="text-2xl font-black text-white font-mono">
                        ${car.price.toLocaleString()}
                      </p>
                    </div>

                    {/* Specs Badges */}
                    <div className="grid grid-cols-3 gap-2 pt-3 border-t border-slate-800 text-xs text-slate-400">
                      <div className="flex items-center gap-1.5">
                        <Gauge className="w-3.5 h-3.5 text-slate-500" />
                        <span>{car.mileage.toLocaleString()} mi</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Fuel className="w-3.5 h-3.5 text-slate-500" />
                        <span>{car.fuel}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Settings2 className="w-3.5 h-3.5 text-slate-500" />
                        <span className="truncate">{car.transmission.split(' ')[0]}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          /* 3. Car Detail & 3D Viewer / In-Showroom Locator Mode */
          <div className="w-full h-full flex flex-col p-6">
            {/* Mode Switcher Tabs */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setActiveTab('3d_car')}
                  className={`px-6 py-3 rounded-2xl font-extrabold text-sm uppercase tracking-wider flex items-center gap-2 transition-all touch-target ${
                    activeTab === '3d_car'
                      ? 'bg-emerald-500 text-slate-950 shadow-xl shadow-emerald-500/25'
                      : 'bg-slate-900 border border-slate-800 text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  <Sparkles className="w-4 h-4" />
                  <span>3D Interactive Car Viewer</span>
                </button>

                <button
                  onClick={() => setActiveTab('where_is_car')}
                  className={`px-6 py-3 rounded-2xl font-extrabold text-sm uppercase tracking-wider flex items-center gap-2 transition-all touch-target ${
                    activeTab === 'where_is_car'
                      ? 'bg-sky-500 text-white shadow-xl shadow-sky-500/25'
                      : 'bg-slate-900 border border-slate-800 text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  <Compass className="w-4 h-4" />
                  <span>Where is This Car in Showroom?</span>
                </button>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setLeadModalTab('test_drive')}
                  className="px-5 py-3 rounded-2xl bg-slate-800 hover:bg-slate-750 text-white font-bold text-sm flex items-center gap-2 border border-slate-700 touch-target"
                >
                  <Calendar className="w-4 h-4 text-emerald-400" />
                  <span>Book Test Drive</span>
                </button>

                <button
                  onClick={() => setLeadModalTab('qr')}
                  className="px-5 py-3 rounded-2xl bg-slate-800 hover:bg-slate-750 text-white font-bold text-sm flex items-center gap-2 border border-slate-700 touch-target"
                >
                  <QrCode className="w-4 h-4 text-sky-400" />
                  <span>Send to Phone</span>
                </button>
              </div>
            </div>

            {/* Dynamic Viewport (Car 3D or Showroom 3D Route) */}
            <div className="flex-1 relative rounded-3xl overflow-hidden border border-slate-800 shadow-2xl">
              {activeTab === '3d_car' ? (
                <CarViewer3D car={selectedCar} className="w-full h-full" allowCustomize={true} />
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

      {/* Modal for Call Specialist / Test Drive / QR Handoff */}
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
