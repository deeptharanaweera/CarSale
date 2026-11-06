import React from 'react';
import { MapPin, ChevronRight } from 'lucide-react';
import { Showroom } from '../../types';

interface KioskAttractScreenProps {
  showroom: Showroom;
  onStart: () => void;
  availableCarsCount?: number;
}

const FALLBACK_KIOSK_BG = '/src/assets/images/hero_hypercar_pavilion_1793964975599.jpg';

export const KioskAttractScreen: React.FC<KioskAttractScreenProps> = ({
  showroom,
  onStart,
  availableCarsCount = 5,
}) => {
  return (
    <div
      onClick={onStart}
      className="relative w-full h-screen bg-[#090B10] overflow-hidden cursor-pointer select-none flex flex-col justify-between p-12"
    >
      {/* Background Studio Showcase */}
      <div className="absolute inset-0 z-0">
        <img
          src={FALLBACK_KIOSK_BG}
          alt="Aura Motors Flagship Showroom"
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover object-center brightness-60"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#090B10] via-[#090B10]/55 to-[#090B10]/40" />
      </div>

      {/* Top Header */}
      <div className="relative z-10 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white font-display">
            Aura Motors
          </h1>
          <p className="text-xs text-slate-300 mt-0.5">
            Interactive 3D Showroom Terminal
          </p>
        </div>

        <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#11151F]/90 border border-white/[0.12] backdrop-blur-md">
          <MapPin className="w-4 h-4 text-rose-500" />
          <span className="text-xs font-medium text-slate-200">{showroom.name}</span>
        </div>
      </div>

      {/* Center Hero Attraction */}
      <div className="relative z-10 max-w-3xl space-y-5">
        <div className="text-xs font-mono tabular-nums text-slate-300">
          <span>{availableCarsCount} Allocated Vehicles Stationed On-Site</span>
          <span aria-hidden="true" className="mx-2">·</span>
          <span>Live 3D Bay Wayfinding</span>
        </div>

        <h2 className="text-5xl sm:text-6xl font-bold tracking-tight text-white leading-tight font-display">
          Touch Anywhere to Explore the Showroom Fleet
        </h2>

        <p className="text-lg text-slate-300 leading-relaxed max-w-2xl">
          Inspect vehicles in interactive 3D, customize factory finishes, and display real-time walking directions to any standing bay on the gallery floor.
        </p>
      </div>

      {/* Bottom Action Bar */}
      <div className="relative z-10 flex items-center justify-between pt-8 border-t border-white/[0.12]">
        <span className="text-slate-400 text-xs">
          Touch screen to begin interactive session
        </span>

        <div className="flex items-center gap-2 px-7 py-3.5 rounded-xl bg-rose-600 text-white font-semibold text-sm tracking-wide">
          <span>Begin Interactive Tour</span>
          <ChevronRight className="w-5 h-5" />
        </div>
      </div>
    </div>
  );
};
