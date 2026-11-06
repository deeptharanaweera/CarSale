import React from 'react';
import { Sparkles, MapPin, ShieldCheck, ChevronRight } from 'lucide-react';
import { Showroom } from '../../types';

interface KioskAttractScreenProps {
  showroom: Showroom;
  onStart: () => void;
  availableCarsCount?: number;
}

export const KioskAttractScreen: React.FC<KioskAttractScreenProps> = ({
  showroom,
  onStart,
  availableCarsCount = 6,
}) => {
  return (
    <div
      onClick={onStart}
      className="relative w-full h-screen bg-slate-950 overflow-hidden cursor-pointer select-none flex flex-col justify-between p-12"
    >
      {/* Background Ambient Video / Visual */}
      <div className="absolute inset-0 z-0">
        <img
          src="https://images.unsplash.com/photo-1614162692292-7ac56d7f7f1e?auto=format&fit=crop&w=2000&q=85"
          alt="Luxury Supercar Showcase"
          className="w-full h-full object-cover object-center brightness-50 scale-105 animate-pulse"
          style={{ animationDuration: '8s' }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/60 to-slate-950/40" />
      </div>

      {/* Top Header */}
      <div className="relative z-10 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
            <Sparkles className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-black tracking-wider text-white uppercase font-display">
              AURA <span className="text-emerald-400">MOTORS</span>
            </h1>
            <p className="text-xs text-slate-300 font-medium tracking-widest uppercase">
              Virtual Showroom Terminal
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-slate-900/80 border border-slate-700/80 backdrop-blur-md">
          <MapPin className="w-4 h-4 text-emerald-400" />
          <span className="text-sm font-semibold text-slate-200">{showroom.name}</span>
        </div>
      </div>

      {/* Center Hero Attraction */}
      <div className="relative z-10 max-w-3xl space-y-6">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 text-sm font-bold tracking-wide backdrop-blur-md">
          <ShieldCheck className="w-4 h-4" />
          <span>{availableCarsCount} Vehicles Ready for Immediate Inspection & Test Drive</span>
        </div>

        <h2 className="text-6xl font-black tracking-tight text-white leading-tight font-display">
          Touch the Screen <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-200">
            To Begin Your Journey
          </span>
        </h2>

        <p className="text-xl text-slate-300 font-light leading-relaxed">
          Explore vehicles in full interactive 3D, customize specifications, and locate their exact standing position inside this showroom with live path routing.
        </p>
      </div>

      {/* Bottom CTA Button / Pulsing Bar */}
      <div className="relative z-10 flex items-center justify-between pt-8 border-t border-slate-800/80">
        <div className="flex items-center gap-4">
          <span className="w-3 h-3 rounded-full bg-emerald-400 animate-ping" />
          <span className="text-slate-400 text-sm font-medium">Touch anywhere on screen to activate</span>
        </div>

        <div className="flex items-center gap-3 px-8 py-4 rounded-2xl bg-emerald-500 text-slate-950 font-black text-lg tracking-wide uppercase shadow-2xl shadow-emerald-500/30 animate-pulse">
          <span>Touch to Start</span>
          <ChevronRight className="w-6 h-6 stroke-[3]" />
        </div>
      </div>
    </div>
  );
};

