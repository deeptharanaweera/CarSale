import React, { useState, useMemo } from 'react';
import { Car, Showroom } from '../../types';
import { CarCard } from './CarCard';
import {
  Filter,
  SlidersHorizontal,
  RotateCcw,
  Search,
  Sparkles,
  LayoutGrid,
  List,
  ChevronDown,
  X,
  Gauge,
  Fuel,
  MapPin,
  Scale,
  Heart,
} from 'lucide-react';

interface CarListingProps {
  cars: Car[];
  showrooms: Showroom[];
  onSelectCar: (car: Car) => void;
  favorites: number[];
  comparedCars: Car[];
  onToggleFavorite: (car: Car) => void;
  onToggleCompare: (car: Car) => void;
  initialSearch?: string;
}

export const CarListing: React.FC<CarListingProps> = ({
  cars,
  showrooms,
  onSelectCar,
  favorites,
  comparedCars,
  onToggleFavorite,
  onToggleCompare,
  initialSearch = '',
}) => {
  const [search, setSearch] = useState(initialSearch);
  const [selectedBrand, setSelectedBrand] = useState<string>('all');
  const [selectedBodyType, setSelectedBodyType] = useState<string>('all');
  const [selectedShowroom, setSelectedShowroom] = useState<string>('all');
  const [selectedFuel, setSelectedFuel] = useState<string>('all');
  const [maxPrice, setMaxPrice] = useState<number>(400000);
  const [sortBy, setSortBy] = useState<string>('featured');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  const brands = useMemo(() => {
    return ['all', ...Array.from(new Set(cars.map((c) => c.model?.brand?.slug).filter(Boolean)))];
  }, [cars]);

  const bodyTypes = useMemo(() => {
    return ['all', ...Array.from(new Set(cars.map((c) => c.model?.body_type).filter(Boolean)))];
  }, [cars]);

  const fuelTypes = useMemo(() => {
    return ['all', ...Array.from(new Set(cars.map((c) => c.fuel).filter(Boolean)))];
  }, [cars]);

  // Filter and sort cars
  const filteredCars = useMemo(() => {
    return cars
      .filter((car) => {
        if (selectedBrand !== 'all' && car.model?.brand?.slug !== selectedBrand) return false;
        if (selectedBodyType !== 'all' && car.model?.body_type !== selectedBodyType) return false;
        if (selectedShowroom !== 'all' && car.showroom_id !== Number(selectedShowroom)) return false;
        if (selectedFuel !== 'all' && car.fuel !== selectedFuel) return false;
        if (car.price > maxPrice) return false;
        if (search) {
          const s = search.toLowerCase();
          const matchTitle = car.title.toLowerCase().includes(s);
          const matchBrand = car.model?.brand?.name?.toLowerCase().includes(s);
          const matchVin = car.vin?.toLowerCase().includes(s);
          if (!matchTitle && !matchBrand && !matchVin) return false;
        }
        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'price_asc') return a.price - b.price;
        if (sortBy === 'price_desc') return b.price - a.price;
        if (sortBy === 'year_desc') return b.year - a.year;
        if (sortBy === 'mileage_asc') return a.mileage - b.mileage;
        return (b.is_featured ? 1 : 0) - (a.is_featured ? 1 : 0);
      });
  }, [cars, selectedBrand, selectedBodyType, selectedShowroom, selectedFuel, maxPrice, search, sortBy]);

  const handleResetFilters = () => {
    setSearch('');
    setSelectedBrand('all');
    setSelectedBodyType('all');
    setSelectedShowroom('all');
    setSelectedFuel('all');
    setMaxPrice(400000);
    setSortBy('featured');
  };

  const hasActiveFilters =
    search ||
    selectedBrand !== 'all' ||
    selectedBodyType !== 'all' ||
    selectedShowroom !== 'all' ||
    selectedFuel !== 'all' ||
    maxPrice < 400000;

  return (
    <div className="w-full max-w-[1720px] mx-auto px-4 sm:px-8 xl:px-12 py-10 space-y-8 animate-fade-in-up">
      {/* Top Banner & Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-6 border-b border-white/[0.08]">
        <div>
          <span className="px-3.5 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider bg-red-600/15 text-red-400 border border-red-500/30 inline-block mb-2 font-mono">
            100% Verified Dealership Inventory
          </span>
          <h2 className="text-3xl sm:text-4xl font-black text-white font-display">
            Automobile Fleet Inventory
          </h2>
          <p className="text-sm text-slate-400 mt-1">
            Displaying <strong className="text-red-400 font-mono">{filteredCars.length}</strong> available Japanese & European vehicles
          </p>
        </div>

        {/* View Switcher & Sorting Bar */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Mobile Filter Toggle */}
          <button
            onClick={() => setMobileFilterOpen(!mobileFilterOpen)}
            className="md:hidden flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-slate-900 border border-white/10 text-white text-xs font-bold"
          >
            <Filter className="w-4 h-4 text-emerald-400" />
            <span>Filters {hasActiveFilters && '•'}</span>
          </button>

          {/* Grid / List Switcher */}
          <div className="hidden sm:flex items-center p-1 rounded-2xl bg-slate-900 border border-white/10">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-xl transition-all ${
                viewMode === 'grid' ? 'bg-emerald-500 text-slate-950 shadow-sm' : 'text-slate-400 hover:text-white'
              }`}
              title="Grid View"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-xl transition-all ${
                viewMode === 'list' ? 'bg-emerald-500 text-slate-950 shadow-sm' : 'text-slate-400 hover:text-white'
              }`}
              title="List View"
            >
              <List className="w-4 h-4" />
            </button>
          </div>

          {/* Sorting Dropdown */}
          <div className="flex items-center gap-2">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-4 py-2.5 rounded-2xl bg-slate-900 border border-white/10 text-xs font-bold text-white focus:outline-none focus:border-emerald-500 cursor-pointer shadow-sm"
            >
              <option value="featured">Featured First</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
              <option value="year_desc">Year: Newest First</option>
              <option value="mileage_asc">Mileage: Lowest First</option>
            </select>
          </div>
        </div>
      </div>

      {/* Active Filter Chips Pill Row */}
      {hasActiveFilters && (
        <div className="flex flex-wrap items-center gap-2 pt-1 pb-3 text-xs">
          <span className="text-slate-500 uppercase tracking-wider font-bold text-[10px]">Active Filters:</span>
          {selectedBrand !== 'all' && (
            <span className="px-3 py-1 rounded-full bg-slate-800 border border-white/10 text-emerald-400 flex items-center gap-1.5 font-semibold">
              Brand: {selectedBrand}
              <X className="w-3.5 h-3.5 cursor-pointer hover:text-white" onClick={() => setSelectedBrand('all')} />
            </span>
          )}
          {selectedBodyType !== 'all' && (
            <span className="px-3 py-1 rounded-full bg-slate-800 border border-white/10 text-sky-400 flex items-center gap-1.5 font-semibold">
              Type: {selectedBodyType}
              <X className="w-3.5 h-3.5 cursor-pointer hover:text-white" onClick={() => setSelectedBodyType('all')} />
            </span>
          )}
          {selectedFuel !== 'all' && (
            <span className="px-3 py-1 rounded-full bg-slate-800 border border-white/10 text-teal-400 flex items-center gap-1.5 font-semibold">
              Fuel: {selectedFuel}
              <X className="w-3.5 h-3.5 cursor-pointer hover:text-white" onClick={() => setSelectedFuel('all')} />
            </span>
          )}
          {maxPrice < 400000 && (
            <span className="px-3 py-1 rounded-full bg-slate-800 border border-white/10 text-amber-400 flex items-center gap-1.5 font-semibold">
              Max: ${maxPrice.toLocaleString()}
              <X className="w-3.5 h-3.5 cursor-pointer hover:text-white" onClick={() => setMaxPrice(400000)} />
            </span>
          )}
          <button
            onClick={handleResetFilters}
            className="text-xs text-slate-400 hover:text-emerald-400 flex items-center gap-1 ml-2 underline"
          >
            Clear All
          </button>
        </div>
      )}

      {/* Main 2-Column Grid (Sticky Filters Sidebar + Car Grid) */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-8 items-start">
        {/* Filters Sidebar */}
        <aside
          className={`${
            mobileFilterOpen ? 'block' : 'hidden'
          } md:block p-6 rounded-3xl glass-panel border border-white/10 shadow-2xl space-y-6 md:sticky md:top-28 z-20`}
        >
          <div className="flex items-center justify-between pb-4 border-b border-white/10">
            <span className="text-sm font-bold text-white flex items-center gap-2">
              <SlidersHorizontal className="w-4 h-4 text-emerald-400" />
              <span>Refine Inventory</span>
            </span>
            <button
              onClick={handleResetFilters}
              className="text-xs text-slate-400 hover:text-emerald-400 flex items-center gap-1 transition-colors"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset</span>
            </button>
          </div>

          {/* Keyword Search Box */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">Search Keyword</label>
            <div className="relative">
              <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Model, trim, VIN..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-2 rounded-2xl bg-slate-950/80 border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          {/* Brand Filter */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">Manufacturer</label>
            <div className="space-y-1 max-h-48 overflow-y-auto no-scrollbar">
              {brands.map((b) => (
                <button
                  key={b}
                  type="button"
                  onClick={() => setSelectedBrand(b || 'all')}
                  className={`w-full px-3 py-2 rounded-xl text-xs font-semibold text-left capitalize transition-all flex items-center justify-between ${
                    selectedBrand === b
                      ? 'bg-emerald-500 text-slate-950 font-black shadow-md shadow-emerald-500/20'
                      : 'text-slate-300 hover:text-white hover:bg-white/[0.04]'
                  }`}
                >
                  <span>{b === 'all' ? 'All Brands' : b}</span>
                  {selectedBrand === b && <span className="text-slate-950 font-bold">•</span>}
                </button>
              ))}
            </div>
          </div>

          {/* Max Price Range Slider */}
          <div className="space-y-2 pt-2 border-t border-white/10">
            <div className="flex justify-between text-xs font-bold">
              <span className="text-slate-300 uppercase tracking-wider">Price Cap:</span>
              <span className="text-emerald-400 font-mono font-bold">${maxPrice.toLocaleString()}</span>
            </div>
            <input
              type="range"
              min="80000"
              max="400000"
              step="10000"
              value={maxPrice}
              onChange={(e) => setMaxPrice(Number(e.target.value))}
              className="w-full cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-500 font-mono">
              <span>$80k</span>
              <span>$400k+</span>
            </div>
          </div>

          {/* Body Style Chips */}
          <div className="space-y-2 pt-2 border-t border-white/10">
            <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">Body Style</label>
            <div className="flex flex-wrap gap-1.5">
              {bodyTypes.map((bt) => (
                <button
                  key={bt}
                  type="button"
                  onClick={() => setSelectedBodyType(bt || 'all')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold capitalize transition-all ${
                    selectedBodyType === bt
                      ? 'bg-sky-500 text-white font-bold shadow-md shadow-sky-500/20'
                      : 'bg-slate-950 border border-white/10 text-slate-300 hover:text-white'
                  }`}
                >
                  {bt}
                </button>
              ))}
            </div>
          </div>

          {/* Showroom Location Filter */}
          <div className="space-y-2 pt-2 border-t border-white/10">
            <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">Showroom Branch</label>
            <select
              value={selectedShowroom}
              onChange={(e) => setSelectedShowroom(e.target.value)}
              className="w-full px-3 py-2.5 rounded-2xl bg-slate-950 border border-white/10 text-xs text-slate-200 focus:outline-none focus:border-emerald-500 cursor-pointer"
            >
              <option value="all">All Dealership Branches</option>
              {showrooms.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>

          {/* Powertrain / Fuel Filter */}
          <div className="space-y-2 pt-2 border-t border-white/10">
            <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">Powertrain</label>
            <div className="flex flex-wrap gap-1.5">
              {fuelTypes.map((ft) => (
                <button
                  key={ft}
                  type="button"
                  onClick={() => setSelectedFuel(ft || 'all')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold capitalize transition-all ${
                    selectedFuel === ft
                      ? 'bg-emerald-500 text-slate-950 font-bold shadow-md shadow-emerald-500/20'
                      : 'bg-slate-950 border border-white/10 text-slate-300 hover:text-white'
                  }`}
                >
                  {ft}
                </button>
              ))}
            </div>
          </div>
        </aside>

        {/* Cars Fleet Listing Area */}
        <div className="md:col-span-3">
          {filteredCars.length > 0 ? (
            viewMode === 'grid' ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredCars.map((car) => (
                  <CarCard
                    key={car.id}
                    car={car}
                    isFavorited={favorites.includes(car.id)}
                    isCompared={comparedCars.some((c) => c.id === car.id)}
                    onToggleFavorite={() => onToggleFavorite(car)}
                    onToggleCompare={() => onToggleCompare(car)}
                    onSelect={onSelectCar}
                  />
                ))}
              </div>
            ) : (
              /* List View Mode */
              <div className="space-y-4">
                {filteredCars.map((car) => (
                  <div
                    key={car.id}
                    onClick={() => onSelectCar(car)}
                    className="p-4 rounded-3xl glass-panel border border-white/10 hover:border-emerald-500/40 flex flex-col sm:flex-row items-center gap-5 transition-all card-hover-lift cursor-pointer"
                  >
                    <div className="w-full sm:w-64 h-44 rounded-2xl overflow-hidden bg-slate-950 shrink-0 relative">
                      <img
                        src={car.images?.[0]?.url || 'https://images.unsplash.com/photo-1614162692292-7ac56d7f7f1e'}
                        alt={car.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      {car.model3d && (
                        <span className="absolute bottom-2 left-2 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-purple-600 text-white flex items-center gap-1">
                          <Sparkles className="w-3 h-3" /> 3D Model
                        </span>
                      )}
                    </div>

                    <div className="flex-1 space-y-2 w-full">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-emerald-400 uppercase tracking-widest">
                          {car.model?.brand?.name} • {car.year}
                        </span>
                        <span className="text-xs font-bold text-slate-300 font-mono">VIN: {car.vin}</span>
                      </div>
                      <h3 className="text-xl font-bold text-white hover:text-emerald-400 transition-colors">
                        {car.title}
                      </h3>
                      <p className="text-xs text-slate-400 line-clamp-2">{car.description}</p>
                      <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400 pt-1">
                        <span className="flex items-center gap-1 font-mono">
                          <Gauge className="w-3.5 h-3.5 text-emerald-400" /> {car.mileage.toLocaleString()} mi
                        </span>
                        <span className="flex items-center gap-1">
                          <Fuel className="w-3.5 h-3.5 text-sky-400" /> {car.fuel}
                        </span>
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5 text-emerald-400" /> {car.showroom?.name}
                        </span>
                      </div>
                    </div>

                    <div className="sm:border-l border-white/10 sm:pl-6 text-right shrink-0 w-full sm:w-auto flex sm:flex-col justify-between items-center sm:items-end">
                      <div>
                        <span className="text-2xl font-black text-white font-mono block">
                          ${car.price.toLocaleString()}
                        </span>
                        <span className="text-xs text-slate-400 font-mono block">
                          Est. ${Math.round(car.price / 60)}/mo
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectCar(car);
                        }}
                        className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs uppercase tracking-wider transition-all shadow-md shadow-emerald-500/20"
                      >
                        Explore 3D
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )
          ) : (
            /* Empty State */
            <div className="py-24 text-center rounded-3xl glass-panel border border-white/10 space-y-4">
              <div className="w-16 h-16 rounded-3xl bg-slate-900 text-slate-500 flex items-center justify-center mx-auto border border-white/10">
                <Sparkles className="w-8 h-8" />
              </div>
              <h3 className="text-2xl font-bold text-white">No Vehicles Match Your Search</h3>
              <p className="text-slate-400 text-sm max-w-md mx-auto">
                Try widening your price cap, clearing body style filters, or selecting "All Brands" to view our complete luxury fleet.
              </p>
              <button
                onClick={handleResetFilters}
                className="px-6 py-3 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs uppercase tracking-wider transition-all shadow-lg shadow-emerald-500/20"
              >
                Clear All Filters
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
