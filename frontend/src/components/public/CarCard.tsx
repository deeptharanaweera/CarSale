import React from 'react';
import { Car } from '../../types';
import {
  Heart,
  Scale,
  ChevronRight,
  QrCode,
} from 'lucide-react';

interface CarCardProps {
  car: Car;
  isFavorited?: boolean;
  isCompared?: boolean;
  onToggleFavorite?: (car: Car) => void;
  onToggleCompare?: (car: Car) => void;
  onOpenQr?: (car: Car) => void;
  onSelect: (car: Car) => void;
}

const FALLBACK_CAR_IMAGE = '/src/assets/images/car_bmw_m4_emerald_1793964978767.jpg';

export const CarCard: React.FC<CarCardProps> = ({
  car,
  isFavorited = false,
  isCompared = false,
  onToggleFavorite,
  onToggleCompare,
  onOpenQr,
  onSelect,
}) => {
  const coverImage = car.images?.[0]?.url || FALLBACK_CAR_IMAGE;
  const monthlyEst = Math.round(car.price / 60);

  const conditionLabel =
    car.condition === 'New'
      ? 'Brand New'
      : car.condition === 'Certified Pre-Owned'
      ? 'Certified Pre-Owned'
      : 'Pre-Owned';

  return (
    <article
      onClick={() => onSelect(car)}
      className="group rounded-2xl bg-[#11151F] border border-white/[0.08] hover:border-white/[0.22] overflow-hidden flex flex-col justify-between transition-all duration-150 card-hover-lift cursor-pointer"
    >
      {/* Product Image Container (68% visual weight on neutral dark backdrop) */}
      <div className="relative aspect-[4/3] w-full bg-[#090B10] overflow-hidden">
        <img
          src={coverImage}
          alt={car.title}
          referrerPolicy="no-referrer"
          onError={(e) => {
            const target = e.currentTarget;
            if (target.src !== window.location.origin + FALLBACK_CAR_IMAGE) {
              target.src = FALLBACK_CAR_IMAGE;
            }
          }}
          className="w-full h-full object-cover object-center group-hover:scale-[1.03] transition-transform duration-200 ease-out"
        />

        <div className="absolute inset-0 bg-gradient-to-t from-[#11151F] via-transparent to-black/25 opacity-75 pointer-events-none" />

        {/* Maximum 1 subtle text tag on media */}
        {car.model3d && (
          <span className="absolute bottom-3 left-4 text-[11px] font-mono font-medium text-slate-200 bg-black/70 backdrop-blur-md px-2.5 py-1 rounded">
            3D Configurator Ready
          </span>
        )}

        {/* Functional Affordance Buttons (QR Code, Compare & Save) */}
        <div className="absolute top-3 right-3 flex items-center gap-1.5 z-10">
          {onOpenQr && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onOpenQr(car);
              }}
              aria-label="Open mobile QR code"
              className="p-2 rounded-lg bg-black/60 text-slate-300 hover:text-cyan-400 border border-white/[0.12] transition-colors"
              title="Mobile QR Code"
            >
              <QrCode className="w-3.5 h-3.5" />
            </button>
          )}

          {onToggleCompare && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onToggleCompare(car);
              }}
              aria-label={isCompared ? 'Remove from comparison' : 'Add to comparison'}
              className={`p-2 rounded-lg transition-colors ${
                isCompared
                  ? 'bg-rose-600 text-white'
                  : 'bg-black/60 text-slate-300 hover:text-white border border-white/[0.12]'
              }`}
              title={isCompared ? 'Remove from Compare' : 'Compare Vehicle'}
            >
              <Scale className="w-3.5 h-3.5" />
            </button>
          )}

          {onToggleFavorite && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onToggleFavorite(car);
              }}
              aria-label={isFavorited ? 'Remove from saved' : 'Save vehicle'}
              className={`p-2 rounded-lg transition-colors ${
                isFavorited
                  ? 'bg-rose-600 text-white'
                  : 'bg-black/60 text-slate-300 hover:text-white border border-white/[0.12]'
              }`}
              title="Save Vehicle"
            >
              <Heart className={`w-3.5 h-3.5 ${isFavorited ? 'fill-current' : ''}`} />
            </button>
          )}
        </div>
      </div>

      {/* Clean Unboxed Metadata, Title & Tabular Pricing */}
      <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
        <div className="space-y-1.5">
          {/* Unboxed Metadata Line 1: Brand · Year · Condition */}
          <div className="flex items-center gap-1.5 text-xs text-slate-400">
            <span className="uppercase tracking-wider font-medium text-slate-300">
              {car.model?.brand?.name || 'Luxury Import'}
            </span>
            <span aria-hidden="true">·</span>
            <span className="font-mono tabular-nums">{car.year}</span>
            <span aria-hidden="true">·</span>
            <span>{conditionLabel}</span>
          </div>

          {/* Vehicle Name in 16px SemiBold */}
          <h3 className="text-base font-semibold text-white group-hover:text-rose-400 transition-colors line-clamp-1 font-display">
            {car.title}
          </h3>

          {/* Unboxed Metadata Line 2: Mileage · Powertrain · Bay Location */}
          <div className="flex flex-wrap items-center gap-1.5 text-xs text-slate-400 pt-0.5">
            <span className="font-mono tabular-nums">{car.mileage.toLocaleString()} mi</span>
            <span aria-hidden="true">·</span>
            <span>{car.fuel}</span>
            {car.slot && (
              <>
                <span aria-hidden="true">·</span>
                <span className="text-slate-300">Bay {car.slot.label}</span>
              </>
            )}
          </div>
        </div>

        {/* Baseline-Aligned Price Row */}
        <div className="pt-3.5 border-t border-white/[0.08] flex items-baseline justify-between gap-2">
          <div>
            <span className="text-[15px] font-mono tabular-nums font-bold text-white">
              ${car.price.toLocaleString()}
            </span>
            <span className="text-xs text-slate-400 font-mono tabular-nums ml-2">
              · Est. ${monthlyEst.toLocaleString()}/mo
            </span>
          </div>

          <span className="text-xs font-medium text-slate-300 group-hover:text-white flex items-center gap-0.5 shrink-0">
            <span>Inspect</span>
            <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
          </span>
        </div>
      </div>
    </article>
  );
};
