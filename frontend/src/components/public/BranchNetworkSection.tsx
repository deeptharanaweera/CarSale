import React, { useState } from 'react';
import {
  MapPin,
  PhoneCall,
  Clock,
  Compass,
  ArrowRight,
  ShieldCheck,
  Building2,
  ExternalLink,
  Layers,
  Sparkles,
} from 'lucide-react';
import { Showroom, Car } from '../../types';

interface BranchNetworkSectionProps {
  showrooms: Showroom[];
  cars?: Car[];
  onSelectShowroom?: (showroom: Showroom) => void;
  onExploreFloorMap?: () => void;
}

const defaultFallbackShowrooms: Showroom[] = [
  {
    id: 1,
    name: 'Manhattan Flagship Showroom',
    code: 'NYC-01',
    address: "540 W 55th St, Hell's Kitchen",
    city: 'New York, NY',
    lat: 40.7684,
    lng: -73.9918,
    phone: '+1 (212) 555-0199',
    opening_hours: 'Mon - Sat: 9:00 AM - 8:00 PM | Sun: 10:00 AM - 6:00 PM',
    image: 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=1400&q=80',
    cars_count: 5,
    floors: [
      {
        id: 1,
        showroom_id: 1,
        name: 'Ground Level - Supercars & EVs',
        level: 1,
        scale: 1,
      },
    ],
  },
  {
    id: 2,
    name: 'Los Angeles Beverly Pavilion',
    code: 'LA-01',
    address: '9400 Wilshire Blvd',
    city: 'Beverly Hills, CA',
    lat: 34.0664,
    lng: -118.4004,
    phone: '+1 (310) 555-0144',
    opening_hours: 'Mon - Sat: 10:00 AM - 7:00 PM | Sun: 11:00 AM - 5:00 PM',
    image: 'https://images.unsplash.com/photo-1563720223185-11003d516935?auto=format&fit=crop&w=1400&q=80',
    cars_count: 1,
    floors: [
      {
        id: 3,
        showroom_id: 2,
        name: 'Main Showcase Atrium',
        level: 1,
        scale: 1,
      },
    ],
  },
  {
    id: 3,
    name: 'Miami Grand Bay Gallery',
    code: 'MIA-01',
    address: '1100 Biscayne Blvd',
    city: 'Miami, FL',
    lat: 25.7854,
    lng: -80.1901,
    phone: '+1 (305) 555-0188',
    opening_hours: 'Mon - Sat: 9:30 AM - 7:30 PM | Sun: 11:00 AM - 5:00 PM',
    image: 'https://images.unsplash.com/photo-1517524008697-84bbe3c3fd98?auto=format&fit=crop&w=1400&q=80',
    cars_count: 2,
    floors: [
      {
        id: 4,
        showroom_id: 3,
        name: 'Grand Bay Pavilion',
        level: 1,
        scale: 1,
      },
    ],
  },
];

export const BranchNetworkSection: React.FC<BranchNetworkSectionProps> = ({
  showrooms,
  cars = [],
  onSelectShowroom,
  onExploreFloorMap,
}) => {
  const [selectedId, setSelectedId] = useState<number | null>(null);

  const displayShowrooms =
    showrooms && showrooms.length > 0 ? showrooms : defaultFallbackShowrooms;

  // Active showroom: fallback to first showroom if not selected
  const activeShowroom =
    displayShowrooms.find((s) => s.id === selectedId) || displayShowrooms[0];

  const showroomCarsCount = cars.filter(
    (c) => c.showroom_id === activeShowroom.id
  ).length;

  const totalFloors = activeShowroom.floors?.length || 1;
  const totalSlots =
    activeShowroom.slots?.length ||
    activeShowroom.floors?.reduce((sum, f) => sum + (f.slots?.length || 0), 0) ||
    6;

  const defaultImage =
    activeShowroom.image ||
    'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=1400&q=80';

  return (
    <section id="branches" className="w-full max-w-[1720px] mx-auto px-4 sm:px-8 xl:px-12 space-y-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-6 border-b border-white/10">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-600/10 border border-red-500/20 text-red-400 text-xs font-mono uppercase tracking-widest font-bold">
            <MapPin className="w-3.5 h-3.5 text-red-500" />
            Live Showroom & Service Hub Network
          </div>
          <h2 className="text-3xl sm:text-5xl font-black text-white font-display uppercase tracking-tight">
            Our Showroom Network
          </h2>
          <p className="text-slate-400 text-sm max-w-xl font-light">
            Architectural galleries equipped with high-precision IoT bay wayfinding, 4K interactive kiosks, and live stock telemetry.
          </p>
        </div>

        {onExploreFloorMap && (
          <button
            onClick={onExploreFloorMap}
            className="self-start sm:self-auto px-5 py-2.5 rounded-full bg-white/[0.06] hover:bg-white/[0.12] border border-white/15 text-xs font-bold uppercase tracking-wider text-white flex items-center gap-2 transition-all shadow-sm group"
          >
            <Compass className="w-4 h-4 text-emerald-400 group-hover:rotate-45 transition-transform" />
            <span>Interactive 3D Floor Maps</span>
          </button>
        )}
      </div>

      {/* Database Showroom Tabs */}
      <div className="flex flex-wrap gap-2.5">
        {displayShowrooms.map((s) => {
          const isSelected = activeShowroom.id === s.id;
          return (
            <button
              key={s.id}
              onClick={() => setSelectedId(s.id)}
              className={`px-5 py-3 rounded-2xl text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-2 ${
                isSelected
                  ? 'bg-red-600 text-white shadow-lg shadow-red-600/30'
                  : 'bg-slate-900 text-slate-400 hover:text-white border border-white/10 hover:border-white/20'
              }`}
            >
              <Building2 className="w-3.5 h-3.5" />
              <span>{s.city}</span>
              <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full ml-1 ${
                isSelected ? 'bg-black/30 text-white' : 'bg-white/10 text-slate-400'
              }`}>
                {s.code}
              </span>
            </button>
          );
        })}
      </div>

      {/* Active Showroom Detailed Display (Using Real Database Records) */}
      <div className="rounded-3xl bg-slate-900/80 border border-white/10 overflow-hidden shadow-2xl grid grid-cols-1 lg:grid-cols-12 backdrop-blur-xl">
        {/* Showroom Image Showcase */}
        <div className="lg:col-span-5 relative h-72 lg:h-auto min-h-[360px] bg-slate-950 overflow-hidden group">
          <img
            src={defaultImage}
            alt={activeShowroom.name}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/25 to-transparent" />

          {/* Top Badges */}
          <div className="absolute top-4 left-4 right-4 flex items-center justify-between">
            <span className="px-3.5 py-1.5 rounded-full text-xs font-mono font-bold bg-red-600 text-white shadow-md">
              {activeShowroom.code} • {activeShowroom.city}
            </span>
            <span className="px-3 py-1 rounded-full text-[11px] font-mono bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 backdrop-blur-md flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              Live Telemetry
            </span>
          </div>

          {/* Bottom Title */}
          <div className="absolute bottom-4 left-4 right-4">
            <p className="text-xs font-mono uppercase tracking-widest text-emerald-400 mb-1 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5" />
              {activeShowroom.city}
            </p>
            <h3 className="text-2xl font-black text-white font-display">
              {activeShowroom.name}
            </h3>
          </div>
        </div>

        {/* Showroom Database Details */}
        <div className="lg:col-span-7 p-6 sm:p-10 flex flex-col justify-between space-y-6">
          <div className="space-y-5">
            {/* Address */}
            <div className="space-y-1.5">
              <span className="text-[11px] font-mono uppercase tracking-widest text-slate-400 font-bold block">
                Physical Location & Gallery Address
              </span>
              <p className="text-base sm:text-lg text-white font-medium flex items-start gap-2.5">
                <MapPin className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                <span>{activeShowroom.address}, {activeShowroom.city}</span>
              </p>
            </div>

            {/* Metrics Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 pt-2">
              <div className="p-4 rounded-2xl bg-slate-950/80 border border-white/[0.08] space-y-1">
                <span className="text-[10px] font-mono uppercase text-slate-400 block font-bold">
                  Allocated Fleet
                </span>
                <p className="text-base font-black text-white font-mono">
                  {showroomCarsCount || activeShowroom.cars_count || 'Active'} Vehicles
                </p>
                <p className="text-[11px] text-emerald-400 font-mono">Ready for Inspection</p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-950/80 border border-white/[0.08] space-y-1">
                <span className="text-[10px] font-mono uppercase text-slate-400 block font-bold">
                  Gallery Bays & Slots
                </span>
                <p className="text-base font-black text-white font-mono">
                  {totalSlots} RFID Bays
                </p>
                <p className="text-[11px] text-sky-400 font-mono">{totalFloors} Floor Levels</p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-950/80 border border-white/[0.08] space-y-1">
                <span className="text-[10px] font-mono uppercase text-slate-400 block font-bold">
                  Direct Line
                </span>
                <a
                  href={`tel:${activeShowroom.phone}`}
                  className="text-sm font-bold text-red-400 hover:underline font-mono block truncate"
                >
                  {activeShowroom.phone}
                </a>
                <p className="text-[11px] text-slate-400 font-mono">VIP Concierge Desk</p>
              </div>
            </div>

            {/* Operating Hours */}
            <div className="p-4 rounded-2xl bg-slate-950/60 border border-white/[0.06] space-y-1.5">
              <span className="text-[10px] font-mono uppercase text-slate-400 font-bold block">
                Showroom Visiting Hours
              </span>
              <p className="text-sm font-semibold text-emerald-400 flex items-center gap-2">
                <Clock className="w-4 h-4 shrink-0" />
                <span>{activeShowroom.opening_hours}</span>
              </p>
            </div>
          </div>

          {/* Action CTAs */}
          <div className="pt-4 border-t border-white/10 flex flex-wrap items-center justify-between gap-3">
            <a
              href={`https://maps.google.com/?q=${encodeURIComponent(
                activeShowroom.address + ' ' + activeShowroom.city
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold flex items-center gap-2 transition-colors"
            >
              <span>Open in Google Maps</span>
              <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
            </a>

            <div className="flex items-center gap-2.5">
              <a
                href={`tel:${activeShowroom.phone}`}
                className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold flex items-center gap-1.5 transition-colors"
              >
                <PhoneCall className="w-3.5 h-3.5 text-red-400" />
                <span>Call Showroom</span>
              </a>

              {onExploreFloorMap && (
                <button
                  onClick={onExploreFloorMap}
                  className="px-6 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs uppercase tracking-wider transition-all shadow-lg shadow-red-600/30 flex items-center gap-1.5"
                >
                  <Compass className="w-3.5 h-3.5" />
                  <span>Inspect 3D Floor Plan</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
