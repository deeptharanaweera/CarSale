import React, { useState } from 'react';
import { Showroom, Car } from '../../types';
import { ShowroomViewer3D } from '../3d/ShowroomViewer3D';
import { CarCard } from './CarCard';
import { ChevronRight } from 'lucide-react';

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
    <div className="w-full max-w-[1440px] mx-auto px-6 lg:px-12 py-10 space-y-12 animate-fade-in-up">
      {/* Header */}
      <div className="space-y-2 pb-6 border-b border-white/[0.08]">
        <div className="text-xs text-slate-400">
          <span>Architectural Galleries</span>
          <span aria-hidden="true" className="mx-2">·</span>
          <span>Spatial 3D Digital Twins</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-bold text-white font-display tracking-tight">
          Flagship Showroom Galleries
        </h1>
        <p className="text-slate-400 text-sm max-w-2xl">
          Select a regional flagship below to inspect its real-time 3D architectural floor plan, bay coordinates, and stationed vehicles.
        </p>
      </div>

      {/* Showroom Selector Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {showrooms.map((sr) => {
          const isSelected = sr.id === selectedShowroom.id;
          const inStock = cars.filter((c) => c.showroom_id === sr.id).length;
          return (
            <button
              key={sr.id}
              type="button"
              onClick={() => setSelectedShowroom(sr)}
              className={`rounded-2xl p-6 text-left transition-all duration-150 border flex flex-col justify-between ${
                isSelected
                  ? 'bg-[#161B26] border-rose-500'
                  : 'bg-[#11151F] border-white/[0.08] hover:border-white/[0.22] card-hover-lift'
              }`}
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs text-slate-400 font-mono tabular-nums">
                  <span className="text-rose-400 font-semibold">{sr.code}</span>
                  <span>{inStock} Vehicles Stationed</span>
                </div>

                <div>
                  <h2 className="text-xl font-bold text-white font-display">{sr.name}</h2>
                  <p className="text-xs text-slate-400 mt-1">
                    {sr.address}, {sr.city}
                  </p>
                </div>

                <div className="pt-3 text-xs text-slate-400 space-y-1 border-t border-white/[0.06] font-mono tabular-nums">
                  <p>{sr.opening_hours}</p>
                  <p className="text-slate-300">{sr.phone}</p>
                </div>
              </div>

              <div className="pt-4 border-t border-white/[0.08] mt-5 flex justify-between items-center text-xs font-medium">
                <span className={isSelected ? 'text-white' : 'text-slate-400'}>
                  {isSelected ? 'Active 3D Floor Twin' : 'Load 3D Floor Twin'}
                </span>
                <ChevronRight className={`w-4 h-4 ${isSelected ? 'text-rose-500' : 'text-slate-500'}`} />
              </div>
            </button>
          );
        })}
      </div>

      {/* 3D Architectural Floor Plan Twin */}
      <div className="space-y-4">
        <div className="flex flex-wrap items-baseline justify-between gap-3">
          <div>
            <h2 className="text-2xl font-bold text-white font-display">
              3D Spatial Twin: {selectedShowroom.name}
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Interactive 3D bay layout · Drag to orbit · Scroll to zoom · Click any bay to inspect vehicle
            </p>
          </div>
          <span className="text-xs font-mono tabular-nums text-slate-400">
            Branch Code: {selectedShowroom.code}
          </span>
        </div>

        <div className="h-[520px] rounded-2xl overflow-hidden border border-white/[0.08] bg-[#090B10] relative">
          <ShowroomViewer3D showroom={selectedShowroom} className="w-full h-full" />
        </div>
      </div>

      {/* Vehicles Stationed at Selected Showroom */}
      <div className="space-y-6 pt-4">
        <div className="pb-4 border-b border-white/[0.08]">
          <div className="text-xs text-slate-400">
            <span>Stationed Fleet</span>
            <span aria-hidden="true" className="mx-2">·</span>
            <span>Immediate Gallery Viewing</span>
          </div>
          <h3 className="text-2xl font-bold text-white font-display mt-1">
            Allocated Vehicles at {selectedShowroom.name}
          </h3>
        </div>

        {showroomCars.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {showroomCars.map((car) => (
              <CarCard key={car.id} car={car} onSelect={onSelectCar} />
            ))}
          </div>
        ) : (
          <div className="py-16 text-center rounded-2xl bg-[#11151F] border border-white/[0.08] text-slate-400 text-xs">
            All vehicles for this gallery are currently in transit or stationed at our Manhattan Flagship.
          </div>
        )}
      </div>
    </div>
  );
};
