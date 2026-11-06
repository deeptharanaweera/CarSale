import React, { useState } from 'react';
import { Showroom, Car } from '../../types';
import { ShowroomViewer3D } from '../3d/ShowroomViewer3D';
import { CarCard } from './CarCard';
import { MapPin, Phone, Clock, Compass, Layers, ShieldCheck, ChevronRight, Sparkles, Navigation } from 'lucide-react';

interface ShowroomsPageProps {
  showrooms: Showroom[];
  cars: Car[];
  onSelectCar: (car: Car) => void;
}

export const ShowroomsPage: React.FC<ShowroomsPageProps> = ({
  showrooms,
  cars,
  onSelectCar,
}) => {
  const [selectedShowroom, setSelectedShowroom] = useState<Showroom>(showrooms[0] || null);

  if (!selectedShowroom) return null;

  const showroomCars = cars.filter((c) => c.showroom_id === selectedShowroom.id);

  return (
    <div className="w-full max-w-[1720px] mx-auto px-4 sm:px-8 xl:px-12 py-12 space-y-12 animate-fade-in-up">
      {/* Page Header */}
      <div className="space-y-3 text-center max-w-3xl mx-auto">
        <span className="px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 inline-flex items-center gap-2">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Flagship Dealership Architecture</span>
        </span>
        <h2 className="text-4xl sm:text-6xl font-black text-white font-display uppercase tracking-tight">
          Visit Our Showroom Galleries
        </h2>
        <p className="text-slate-300 text-base font-light">
          Experience our interactive touchscreen kiosks, explore vehicles in architectural digital twins, or take an instant 3D virtual tour from anywhere in the world.
        </p>
      </div>

      {/* Showroom Destination Selector Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {showrooms.map((sr) => {
          const isSelected = sr.id === selectedShowroom.id;
          const inStock = cars.filter((c) => c.showroom_id === sr.id).length;
          return (
            <div
              key={sr.id}
              onClick={() => setSelectedShowroom(sr)}
              className={`rounded-3xl p-6 cursor-pointer transition-all duration-300 border flex flex-col justify-between card-hover-lift ${
                isSelected
                  ? 'glass-panel-elevated border-emerald-500/80 ring-2 ring-emerald-500/30 shadow-2xl shadow-emerald-500/15'
                  : 'glass-panel border-white/10 hover:border-white/20'
              }`}
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-slate-950 text-emerald-400 font-mono border border-emerald-500/30">
                    {sr.code}
                  </span>
                  <span className="text-xs font-semibold text-slate-300 bg-slate-950/80 px-2.5 py-1 rounded-full border border-white/10">
                    {inStock} Vehicles In-Stock
                  </span>
                </div>

                <div>
                  <h3 className="text-2xl font-bold text-white font-display">{sr.name}</h3>
                  <p className="text-xs text-slate-400 flex items-center gap-1.5 mt-1">
                    <MapPin className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    {sr.address}, {sr.city}
                  </p>
                </div>

                <div className="pt-2 text-xs text-slate-400 space-y-1.5 border-t border-white/[0.06]">
                  <p className="flex items-center gap-2">
                    <Clock className="w-3.5 h-3.5 text-emerald-400" />
                    {sr.opening_hours}
                  </p>
                  <p className="flex items-center gap-2">
                    <Phone className="w-3.5 h-3.5 text-emerald-400" />
                    {sr.phone}
                  </p>
                </div>
              </div>

              <div className="pt-5 border-t border-white/10 mt-5 flex justify-between items-center text-xs font-bold">
                <span className={isSelected ? 'text-emerald-400' : 'text-slate-400'}>
                  {isSelected ? 'Viewing Digital Twin' : 'Click to Load 3D Twin'}
                </span>
                <ChevronRight className={`w-4 h-4 ${isSelected ? 'text-emerald-400' : 'text-slate-600'}`} />
              </div>
            </div>
          );
        })}
      </div>

      {/* 3D Architectural Floor Plan Twin */}
      <div className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="text-2xl sm:text-3xl font-black text-white flex items-center gap-2 font-display">
              <Compass className="w-6 h-6 text-emerald-400" />
              <span>3D Digital Twin: {selectedShowroom.name}</span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Interactive 3D model of this gallery. View parked cars in live standing slots and navigate waypoints.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="px-3.5 py-1.5 rounded-2xl glass-panel border border-white/10 text-xs text-slate-300 flex items-center gap-1.5 font-medium">
              <Navigation className="w-3.5 h-3.5 text-emerald-400" />
              <span>Drag to orbit • Scroll to zoom</span>
            </span>
          </div>
        </div>

        <div className="h-[520px] rounded-3xl overflow-hidden border border-white/10 shadow-2xl bg-slate-950 relative">
          <ShowroomViewer3D showroom={selectedShowroom} className="w-full h-full" />
        </div>
      </div>

      {/* Vehicles Available at Selected Showroom */}
      <div className="space-y-6 pt-6">
        <div>
          <span className="text-xs font-bold uppercase tracking-widest text-emerald-400">Stationed Inventory</span>
          <h3 className="text-3xl font-black text-white font-display">
            Vehicles at {selectedShowroom.name}
          </h3>
          <p className="text-xs text-slate-400">Ready for walk-in VIP inspection and immediate test drives</p>
        </div>

        {showroomCars.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {showroomCars.map((car) => (
              <CarCard key={car.id} car={car} onSelect={onSelectCar} />
            ))}
          </div>
        ) : (
          <div className="py-16 text-center rounded-3xl glass-panel border border-white/10 text-slate-400 text-sm">
            No vehicles currently stationed at this branch. Check other showrooms in our network.
          </div>
        )}
      </div>
    </div>
  );
};
