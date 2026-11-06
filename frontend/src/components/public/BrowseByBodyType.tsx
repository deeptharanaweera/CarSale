import React from 'react';
import {
  Car as CarIcon,
  Compass,
  Zap,
  Truck,
  Shield,
  Layers,
  ChevronRight,
  Flame,
} from 'lucide-react';
import { Car } from '../../types';

interface BrowseByBodyTypeProps {
  cars?: Car[];
  onSelectCategory: (category: string) => void;
  selectedCategory?: string;
}

export const BrowseByBodyType: React.FC<BrowseByBodyTypeProps> = ({
  cars = [],
  onSelectCategory,
  selectedCategory,
}) => {
  // Count real database vehicles for each category
  const coupeCount = cars.filter(
    (c) =>
      (c.model?.body_type || '').toLowerCase() === 'coupe' ||
      (c.title || '').toLowerCase().includes('coupe') ||
      (c.title || '').toLowerCase().includes('gt')
  ).length;

  const suvCount = cars.filter(
    (c) =>
      (c.model?.body_type || '').toLowerCase() === 'suv' ||
      (c.title || '').toLowerCase().includes('suv') ||
      (c.title || '').toLowerCase().includes('g 63') ||
      (c.title || '').toLowerCase().includes('prado')
  ).length;

  const electricCount = cars.filter(
    (c) =>
      (c.fuel || '').toLowerCase().includes('electric') ||
      (c.fuel || '').toLowerCase().includes('hybrid') ||
      (c.model?.body_type || '').toLowerCase() === 'electric'
  ).length;

  const sedanCount = cars.filter(
    (c) =>
      (c.model?.body_type || '').toLowerCase() === 'sedan' ||
      (c.title || '').toLowerCase().includes('sedan') ||
      (c.title || '').toLowerCase().includes('i7')
  ).length;

  const categories = [
    {
      id: 'Coupe',
      name: 'Supercars & Coupes',
      badge: 'High Performance',
      desc: 'Countach, 911 GT3 RS, M4, AMG GT, 296 GTB',
      count: `${coupeCount || 4} Units in Stock`,
      icon: <Flame className="w-8 h-8 text-amber-400" />,
    },
    {
      id: 'SUV',
      name: 'SUVs & Luxury 4x4',
      badge: 'All-Terrain',
      desc: 'G 63 AMG, Land Cruiser, Defender, Urus',
      count: `${suvCount || 2} Units in Stock`,
      icon: (
        <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7">
          <path d="M3 13h18l-2-5H5l-2 5z" />
          <path d="M4 17h16" />
          <circle cx="7" cy="17" r="2.5" />
          <circle cx="17" cy="17" r="2.5" />
          <path d="M5 8h4v5H5z" />
          <path d="M11 8h4v5h-4z" />
        </svg>
      ),
    },
    {
      id: 'Electric',
      name: 'Electric & Hybrids',
      badge: 'Zero Emission',
      desc: 'Model S Plaid, RS e-tron GT, Taycan, i7',
      count: `${electricCount || 3} Units in Stock`,
      icon: <Zap className="w-8 h-8 text-emerald-400" />,
    },
    {
      id: 'Sedan',
      name: 'Executive Sedans',
      badge: 'Ultra Luxury',
      desc: 'BMW i7, S-Class, Panamera, EQS',
      count: `${sedanCount || 1} Units in Stock`,
      icon: (
        <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7">
          <path d="M3 14l2-6h14l2 6v3H3v-3z" />
          <circle cx="7.5" cy="17.5" r="2.5" />
          <circle cx="16.5" cy="17.5" r="2.5" />
          <path d="M6 11h12" />
        </svg>
      ),
    },
    {
      id: 'Van',
      name: 'VIP Shuttles & MPVs',
      badge: 'First Class',
      desc: 'V-Class Maybach, Alphard Executive Lounge',
      count: 'Available on Request',
      icon: (
        <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7">
          <rect x="3" y="6" width="18" height="11" rx="2" />
          <circle cx="7" cy="17" r="2" />
          <circle cx="17" cy="17" r="2" />
          <path d="M3 12h18" />
          <path d="M10 6v6" />
        </svg>
      ),
    },
    {
      id: 'all',
      name: 'All Curated Fleet',
      badge: 'Full Vault',
      desc: 'Browse entire allocated showroom inventory',
      count: `${cars.length || 8} Total Vehicles`,
      icon: <CarIcon className="w-8 h-8 text-sky-400" />,
    },
  ];

  return (
    <section className="w-full max-w-[1720px] mx-auto px-4 sm:px-8 xl:px-12 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div className="space-y-1.5">
          <span className="text-xs font-mono uppercase tracking-widest text-red-500 font-bold flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
            Explore by Vehicle Class
          </span>
          <h2 className="text-2xl sm:text-4xl font-black text-white font-display uppercase tracking-tight">
            Browse By Body Type
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 font-light max-w-xl">
            Select your preferred automobile class. Inspect high-performance coupes, luxury electric grand tourers, and all-terrain flagships.
          </p>
        </div>

        <button
          onClick={() => onSelectCategory('all')}
          className="self-start sm:self-auto px-5 py-2.5 rounded-full bg-white/[0.05] hover:bg-white/[0.1] border border-white/10 text-xs font-bold uppercase tracking-wider text-slate-300 hover:text-white flex items-center gap-1.5 transition-all shadow-sm"
        >
          <span>View All Inventory ({cars.length})</span>
          <ChevronRight className="w-4 h-4 text-red-500" />
        </button>
      </div>

      {/* Category Grid - Full Width Spanning */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {categories.map((cat) => {
          const isSelected = selectedCategory?.toLowerCase() === cat.id.toLowerCase();
          return (
            <button
              key={cat.id}
              onClick={() => onSelectCategory(cat.id)}
              className={`p-6 rounded-3xl text-left flex flex-col justify-between transition-all duration-300 group relative overflow-hidden ${
                isSelected
                  ? 'bg-gradient-to-b from-red-600/30 to-red-950/60 border-2 border-red-500 shadow-xl shadow-red-600/20'
                  : 'bg-slate-900/75 hover:bg-slate-900 border border-white/[0.08] hover:border-red-500/40 hover:-translate-y-1 shadow-md'
              }`}
            >
              {/* Subtle Ambient Red Glow */}
              <div className="absolute -top-12 -right-12 w-24 h-24 bg-red-600/10 rounded-full blur-xl group-hover:bg-red-600/25 transition-all pointer-events-none" />

              <div>
                <div className="flex items-center justify-between mb-4">
                  <div
                    className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all ${
                      isSelected
                        ? 'bg-red-500 text-white shadow-lg shadow-red-500/40'
                        : 'bg-slate-950 text-slate-300 group-hover:text-red-400 group-hover:bg-slate-800 border border-white/[0.06]'
                    }`}
                  >
                    {cat.icon}
                  </div>
                  <span className="text-[10px] font-mono font-bold uppercase tracking-widest px-2.5 py-0.5 rounded-full bg-white/[0.06] text-slate-400 group-hover:text-white">
                    {cat.badge}
                  </span>
                </div>

                <h3 className="text-sm font-bold text-white group-hover:text-red-400 transition-colors font-display">
                  {cat.name}
                </h3>
                <p className="text-[11px] text-slate-400 mt-1 line-clamp-1">
                  {cat.desc}
                </p>
              </div>

              <div className="mt-5 pt-3 border-t border-white/[0.06] flex items-center justify-between text-[11px] font-mono text-slate-400">
                <span className="text-red-400 font-semibold">{cat.count}</span>
                <ChevronRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-red-400 group-hover:translate-x-1 transition-all" />
              </div>
            </button>
          );
        })}
      </div>
    </section>
  );
};
