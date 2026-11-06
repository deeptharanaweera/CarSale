import React from 'react';
import { Car } from '../../types';
import {
  Heart,
  Scale,
  MapPin,
  Sparkles,
  Gauge,
  Fuel,
  ChevronRight,
  ShieldCheck,
  Eye,
  MessageCircle,
  Award,
} from 'lucide-react';

interface CarCardProps {
  car: Car;
  isFavorited?: boolean;
  isCompared?: boolean;
  onToggleFavorite?: (car: Car) => void;
  onToggleCompare?: (car: Car) => void;
  onSelect: (car: Car) => void;
}

export const CarCard: React.FC<CarCardProps> = ({
  car,
  isFavorited = false,
  isCompared = false,
  onToggleFavorite,
  onToggleCompare,
  onSelect,
}) => {
  const coverImage =
    car.images?.[0]?.url ||
    'https://images.unsplash.com/photo-1614162692292-7ac56d7f7f1e?auto=format&fit=crop&w=800&q=80';

  const monthlyEst = Math.round(car.price / 60);

  const handleWhatsAppInquiry = (e: React.MouseEvent) => {
    e.stopPropagation();
    const text = encodeURIComponent(
      `Hello Aura Motors, I am interested in inquiring about the ${car.year} ${car.title} listed for $${car.price.toLocaleString()} (${car.condition}). Please share more details.`
    );
    window.open(`https://wa.me/94777874422?text=${text}`, '_blank');
  };

  return (
    <div className="group rounded-3xl bg-slate-900/75 hover:bg-slate-900/90 border border-white/[0.08] hover:border-red-500/40 p-3.5 sm:p-4 flex flex-col justify-between transition-all duration-300 card-hover-lift relative overflow-hidden backdrop-blur-xl">
      {/* Glow on hover behind card */}
      <div className="absolute -inset-2 bg-gradient-to-r from-red-600/0 via-red-600/10 to-amber-500/0 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity blur-xl -z-10" />

      {/* Media Image Showcase */}
      <div
        onClick={() => onSelect(car)}
        className="relative h-64 sm:h-72 rounded-2xl overflow-hidden bg-slate-950 cursor-pointer mb-4"
      >
        <img
          src={coverImage}
          alt={car.title}
          className="w-full h-full object-cover object-center group-hover:scale-108 transition-transform duration-700 ease-out"
        />

        {/* Ambient Bottom Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent opacity-80 group-hover:opacity-60 transition-opacity" />

        {/* Top Floating Badges */}
        <div className="absolute top-3 left-3 flex flex-wrap gap-1.5 z-10">
          <span
            className={`px-3 py-1 rounded-full text-xs font-bold shadow-md backdrop-blur-md ${
              car.condition === 'New'
                ? 'bg-red-600 text-white'
                : car.condition === 'Certified Pre-Owned'
                ? 'bg-amber-500/90 text-slate-950'
                : 'bg-slate-950/80 text-white border border-white/15'
            }`}
          >
            {car.condition === 'New' ? 'Brand New' : car.condition === 'Certified Pre-Owned' ? 'Reconditioned' : 'Pre-Owned'}
          </span>

          {car.is_featured && (
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 flex items-center gap-1 shadow-lg shadow-amber-500/20">
              <Sparkles className="w-3 h-3" /> Featured
            </span>
          )}

          <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-500/90 text-slate-950 flex items-center gap-1 shadow-sm backdrop-blur-md">
            <Award className="w-3 h-3" /> JEVIC Certified
          </span>
        </div>

        {/* 3D Available Badge */}
        {car.model3d && (
          <div className="absolute bottom-3 left-3 z-10">
            <span className="px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-wider bg-slate-950/90 text-emerald-400 backdrop-blur-md flex items-center gap-1.5 shadow-lg border border-emerald-500/30">
              <Sparkles className="w-3.5 h-3.5 animate-spinSlow" /> 3D Virtual Model
            </span>
          </div>
        )}

        {/* Top Right Quick Actions (Favorite & Compare) */}
        <div className="absolute top-3 right-3 flex items-center gap-1.5 z-10">
          {onToggleCompare && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onToggleCompare(car);
              }}
              className={`p-2.5 rounded-full backdrop-blur-md transition-all ${
                isCompared
                  ? 'bg-red-600 text-white shadow-md shadow-red-600/30 scale-105'
                  : 'bg-slate-950/70 text-slate-300 hover:text-white hover:bg-slate-900 border border-white/10'
              }`}
              title={isCompared ? 'Remove from Compare' : 'Add to Compare'}
            >
              <Scale className="w-4 h-4" />
            </button>
          )}

          {onToggleFavorite && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onToggleFavorite(car);
              }}
              className={`p-2.5 rounded-full backdrop-blur-md transition-all ${
                isFavorited
                  ? 'bg-red-600 text-white shadow-md shadow-red-600/30 scale-105'
                  : 'bg-slate-950/70 text-slate-300 hover:text-red-400 hover:bg-slate-900 border border-white/10'
              }`}
              title="Save to Favorites"
            >
              <Heart className={`w-4 h-4 ${isFavorited ? 'fill-current' : ''}`} />
            </button>
          )}
        </div>

        {/* Instant View Overlay Button on Hover */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/40 backdrop-blur-[2px]">
          <span className="px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs uppercase tracking-wider flex items-center gap-2 shadow-xl shadow-red-600/40 transform translate-y-2 group-hover:translate-y-0 transition-all">
            <Eye className="w-4 h-4" /> View 3D & Specs
          </span>
        </div>
      </div>

      {/* Car Info Section */}
      <div className="space-y-3 mb-4 px-1">
        <div className="flex items-center justify-between">
          <p className="text-xs font-bold uppercase tracking-widest text-red-400 flex items-center gap-1.5 font-mono">
            <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
            {car.model?.brand?.name || 'GENUINE IMPORT'} • {car.year}
          </p>
          <span
            className={`text-[11px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${
              car.status === 'available'
                ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30'
                : 'text-amber-400 bg-amber-500/10 border-amber-500/30'
            }`}
          >
            {car.status}
          </span>
        </div>

        <h3
          onClick={() => onSelect(car)}
          className="text-lg font-bold text-white line-clamp-1 font-display cursor-pointer hover:text-red-400 transition-colors"
        >
          {car.title}
        </h3>

        {/* Showroom & Slot Positioning Tag */}
        <div className="flex items-center gap-1.5 text-xs text-slate-400">
          <MapPin className="w-3.5 h-3.5 text-red-400 shrink-0" />
          <span className="truncate">{car.showroom?.name || 'Aura Flagship Showroom'}</span>
          {car.slot && (
            <span className="text-emerald-400 font-semibold">• Bay {car.slot.label}</span>
          )}
        </div>

        {/* Price & Monthly EMI Estimate */}
        <div className="pt-2 flex items-baseline justify-between border-t border-white/[0.06]">
          <div>
            <span className="text-2xl font-black text-white font-mono tracking-tight">
              ${car.price.toLocaleString()}
            </span>
          </div>
          <div className="text-right">
            <span className="text-[11px] text-slate-400 font-mono block">
              Leasing est. <strong className="text-emerald-400">${monthlyEst.toLocaleString()}</strong>/mo
            </span>
          </div>
        </div>
      </div>

      {/* Specs Badges & Details CTA */}
      <div className="pt-3 border-t border-white/[0.08] flex items-center justify-between text-xs text-slate-400 px-1 gap-2">
        <div className="flex items-center gap-2">
          <span className="px-2.5 py-1 rounded-lg bg-slate-950/80 border border-white/[0.05] flex items-center gap-1 font-medium text-[11px]">
            <Gauge className="w-3.5 h-3.5 text-slate-400" />
            {car.mileage.toLocaleString()} km
          </span>
          <span className="px-2.5 py-1 rounded-lg bg-slate-950/80 border border-white/[0.05] flex items-center gap-1 font-medium text-[11px]">
            <Fuel className="w-3.5 h-3.5 text-slate-400" />
            {car.fuel}
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={handleWhatsAppInquiry}
            className="p-1.5 rounded-lg bg-emerald-500/15 hover:bg-emerald-500/30 text-emerald-400 border border-emerald-500/30 transition-colors"
            title="Inquire on WhatsApp (+94 77 787 4422)"
          >
            <MessageCircle className="w-4 h-4" />
          </button>

          <button
            onClick={() => onSelect(car)}
            className="text-xs font-bold text-white hover:text-red-400 flex items-center gap-0.5 group-hover:translate-x-0.5 transition-transform"
          >
            <span>Details</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
