import React, { useState } from 'react';
import { ArrowRight, ExternalLink } from 'lucide-react';
import { Showroom, Car } from '../../types';

interface BranchNetworkSectionProps {
  showrooms: Showroom[];
  cars?: Car[];
  onSelectShowroom?: (showroom: Showroom) => void;
  onExploreFloorMap?: () => void;
}

const FALLBACK_SHOWROOM_IMG = '/src/assets/images/showroom_flagship_interior_1793964980878.jpg';

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
    image: '/src/assets/images/showroom_flagship_interior_1793964980878.jpg',
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
    image: '/src/assets/images/hero_hypercar_pavilion_1793964975599.jpg',
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
    image: '/src/assets/images/showroom_flagship_interior_1793964980878.jpg',
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
  onExploreFloorMap,
}) => {
  const [selectedId, setSelectedId] = useState<number | null>(null);

  const displayShowrooms =
    showrooms && showrooms.length > 0 ? showrooms : defaultFallbackShowrooms;

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

  const showroomImg =
    activeShowroom.image && !activeShowroom.image.includes('unsplash.com')
      ? activeShowroom.image
      : FALLBACK_SHOWROOM_IMG;

  return (
    <section id="branches" className="w-full max-w-[1440px] mx-auto px-6 lg:px-12 space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-6 border-b border-white/[0.08]">
        <div className="space-y-1.5">
          <div className="text-xs text-slate-400">
            <span>Architectural Flagship Galleries</span>
            <span aria-hidden="true" className="mx-2">·</span>
            <span>Interactive 3D Floor Twins</span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-bold text-white font-display tracking-tight">
            Showroom Network & Spatial Wayfinding
          </h2>
        </div>

        {/* Segmented Branch Selector */}
        <div className="flex items-center gap-1 p-1 bg-[#11151F] rounded-lg border border-white/[0.08] overflow-x-auto no-scrollbar">
          {displayShowrooms.map((s) => {
            const isSelected = activeShowroom.id === s.id;
            return (
              <button
                key={s.id}
                type="button"
                onClick={() => setSelectedId(s.id)}
                className={`px-3.5 py-2 rounded-md text-xs font-medium transition-colors whitespace-nowrap shrink-0 ${
                  isSelected
                    ? 'bg-rose-600 text-white'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {s.city} ({s.code})
              </button>
            );
          })}
        </div>
      </div>

      {/* 2-Column Stretched Architectural Showcase */}
      <div className="rounded-2xl bg-[#11151F] border border-white/[0.08] overflow-hidden grid grid-cols-1 lg:grid-cols-12 items-stretch">
        <div className="lg:col-span-6 relative min-h-[320px] lg:h-full bg-[#090B10] overflow-hidden">
          <img
            src={showroomImg}
            alt={activeShowroom.name}
            referrerPolicy="no-referrer"
            onError={(e) => {
              const target = e.currentTarget;
              if (target.src !== window.location.origin + FALLBACK_SHOWROOM_IMG) {
                target.src = FALLBACK_SHOWROOM_IMG;
              }
            }}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent pointer-events-none" />
          <div className="absolute bottom-6 left-6 right-6 space-y-1">
            <div className="text-xs text-slate-300 font-mono tabular-nums">
              <span>{activeShowroom.code}</span>
              <span aria-hidden="true" className="mx-2">·</span>
              <span>{activeShowroom.city}</span>
            </div>
            <h3 className="text-2xl font-bold text-white font-display">
              {activeShowroom.name}
            </h3>
          </div>
        </div>

        <div className="lg:col-span-6 p-8 sm:p-10 flex flex-col justify-between space-y-8">
          <div className="space-y-6">
            <div className="space-y-1">
              <span className="text-xs text-slate-400 block">Gallery Location</span>
              <p className="text-base font-medium text-white">
                {activeShowroom.address}, {activeShowroom.city}
              </p>
            </div>

            <div className="grid grid-cols-3 gap-4 pt-2">
              <div className="p-4 rounded-xl bg-[#090B10] border border-white/[0.06] space-y-1">
                <span className="text-xs text-slate-400 block">Stationed Fleet</span>
                <p className="text-lg font-mono tabular-nums font-bold text-white">
                  {showroomCarsCount || activeShowroom.cars_count || 5} Units
                </p>
              </div>

              <div className="p-4 rounded-xl bg-[#090B10] border border-white/[0.06] space-y-1">
                <span className="text-xs text-slate-400 block">Display Bays</span>
                <p className="text-lg font-mono tabular-nums font-bold text-white">
                  {totalSlots} Slots · {totalFloors}F
                </p>
              </div>

              <div className="p-4 rounded-xl bg-[#090B10] border border-white/[0.06] space-y-1">
                <span className="text-xs text-slate-400 block">Concierge Desk</span>
                <a
                  href={`tel:${activeShowroom.phone}`}
                  className="text-xs font-mono tabular-nums font-semibold text-rose-400 hover:underline block pt-1 truncate"
                >
                  {activeShowroom.phone}
                </a>
              </div>
            </div>

            <div className="space-y-1 pt-2">
              <span className="text-xs text-slate-400 block">Visiting Hours</span>
              <p className="text-xs font-mono tabular-nums text-slate-200">
                {activeShowroom.opening_hours}
              </p>
            </div>
          </div>

          <div className="pt-6 border-t border-white/[0.08] flex flex-wrap items-center justify-between gap-4">
            <a
              href={`https://maps.google.com/?q=${encodeURIComponent(
                activeShowroom.address + ' ' + activeShowroom.city
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs font-medium text-slate-300 hover:text-white flex items-center gap-1.5 transition-colors whitespace-nowrap shrink-0"
            >
              <span>Directions in Google Maps</span>
              <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
            </a>

            {onExploreFloorMap && (
              <button
                type="button"
                onClick={onExploreFloorMap}
                className="px-5 py-2.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-semibold text-xs transition-colors flex items-center gap-2 whitespace-nowrap shrink-0"
              >
                <span>Explore 3D Showroom Twin</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};
