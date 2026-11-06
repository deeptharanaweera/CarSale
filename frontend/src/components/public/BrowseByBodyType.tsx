import React from 'react';
import { ChevronRight } from 'lucide-react';
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
      (c.title || '').toLowerCase().includes('g 63')
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
      (c.title || '').toLowerCase().includes('sedan')
  ).length;

  const categories = [
    {
      id: 'Coupe',
      index: '01',
      name: 'Supercars & Coupes',
      spec: 'V12, Flat-6 & Twin-Turbo V8',
      models: 'Countach LPI, 911 Turbo S, AMG GT, M4',
      count: coupeCount || 4,
    },
    {
      id: 'Electric',
      index: '02',
      name: 'Electric & Hybrid GT',
      spec: '800V Architecture & Tri-Motor',
      models: 'RS e-tron GT, Taycan Turbo, Model S',
      count: electricCount || 3,
    },
    {
      id: 'SUV',
      index: '03',
      name: 'Luxury Performance SUVs',
      spec: 'All-Terrain Flagships',
      models: 'G 63 AMG, Land Cruiser 300, Urus',
      count: suvCount || 2,
    },
    {
      id: 'Sedan',
      index: '04',
      name: 'Executive Saloons',
      spec: 'Chauffeur & Long-Wheelbase',
      models: 'S-Class Maybach, BMW i7, Panamera',
      count: sedanCount || 2,
    },
  ];

  return (
    <section className="w-full max-w-[1440px] mx-auto px-6 lg:px-12 space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-6 border-b border-white/[0.08]">
        <div className="space-y-1.5">
          <div className="text-xs text-slate-400">
            <span>Vehicle Architecture</span>
            <span aria-hidden="true" className="mx-2">·</span>
            <span>Curated Showroom Classifications</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-white font-display tracking-tight">
            Browse by Chassis Classification
          </h2>
        </div>

        <button
          type="button"
          onClick={() => onSelectCategory('all')}
          className="self-start sm:self-auto text-xs font-semibold text-slate-300 hover:text-white flex items-center gap-1 transition-colors whitespace-nowrap shrink-0"
        >
          <span>View Complete Inventory ({cars.length || 5})</span>
          <ChevronRight className="w-4 h-4 text-rose-500" />
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {categories.map((cat) => {
          const isSelected = selectedCategory?.toLowerCase() === cat.id.toLowerCase();
          return (
            <button
              key={cat.id}
              type="button"
              onClick={() => onSelectCategory(cat.id)}
              className={`p-6 rounded-2xl text-left flex flex-col justify-between transition-all duration-150 group ${
                isSelected
                  ? 'bg-[#161B26] border border-rose-500'
                  : 'bg-[#11151F] border border-white/[0.08] hover:border-white/[0.22] card-hover-lift'
              }`}
            >
              <div className="space-y-4">
                <div className="flex items-baseline justify-between text-xs text-slate-400">
                  <span className="font-mono tabular-nums text-slate-500">{cat.index}.</span>
                  <span className="font-mono tabular-nums text-slate-300">
                    {cat.count} {cat.count === 1 ? 'Unit' : 'Units'}
                  </span>
                </div>

                <div className="space-y-1">
                  <h3 className="text-lg font-semibold text-white group-hover:text-rose-400 transition-colors font-display">
                    {cat.name}
                  </h3>
                  <p className="text-xs text-slate-400">{cat.spec}</p>
                </div>

                <p className="text-xs text-slate-500 line-clamp-1 pt-1">
                  {cat.models}
                </p>
              </div>

              <div className="mt-6 pt-4 border-t border-white/[0.06] flex items-center justify-between text-xs font-medium text-slate-300 group-hover:text-white">
                <span>Filter Class</span>
                <ChevronRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-rose-400 group-hover:translate-x-0.5 transition-transform" />
              </div>
            </button>
          );
        })}
      </div>
    </section>
  );
};
