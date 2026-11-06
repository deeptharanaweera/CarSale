import React, { useState, useMemo } from 'react';
import { Car, Showroom } from '../../types';
import { CarCard } from './CarCard';
import { CarQrCodeModal } from './CarQrCodeModal';
import {
  Filter,
  SlidersHorizontal,
  RotateCcw,
  Search,
  LayoutGrid,
  List,
  X,
  ChevronRight,
  QrCode,
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

const FALLBACK_CAR_IMG = '/src/assets/images/car_bmw_m4_emerald_1793964978767.jpg';

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
  const [maxPrice, setMaxPrice] = useState<number>(3000000);
  const [sortBy, setSortBy] = useState<string>('featured');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);
  const [qrModalCar, setQrModalCar] = useState<Car | null>(null);

  const brands = useMemo(() => {
    return ['all', ...Array.from(new Set(cars.map((c) => c.model?.brand?.slug).filter(Boolean)))];
  }, [cars]);

  const bodyTypes = useMemo(() => {
    return ['all', ...Array.from(new Set(cars.map((c) => c.model?.body_type).filter(Boolean)))];
  }, [cars]);

  const fuelTypes = useMemo(() => {
    return ['all', ...Array.from(new Set(cars.map((c) => c.fuel).filter(Boolean)))];
  }, [cars]);

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
          const matchCondition = car.condition?.toLowerCase().includes(s);
          const matchFuel = car.fuel?.toLowerCase().includes(s);
          if (!matchTitle && !matchBrand && !matchVin && !matchCondition && !matchFuel) return false;
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
    setMaxPrice(3000000);
    setSortBy('featured');
  };

  const hasActiveFilters =
    Boolean(search) ||
    selectedBrand !== 'all' ||
    selectedBodyType !== 'all' ||
    selectedShowroom !== 'all' ||
    selectedFuel !== 'all' ||
    maxPrice < 3000000;

  return (
    <div className="w-full max-w-[1440px] mx-auto px-6 lg:px-12 py-6 space-y-8">
      {/* Top Toolbar */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-6 border-b border-white/[0.08]">
        <div className="space-y-1">
          <div className="text-xs text-slate-400">
            <span>Verified Dealership Collection</span>
            <span aria-hidden="true" className="mx-2">·</span>
            <span className="font-mono tabular-nums text-slate-200">{filteredCars.length} Vehicles Available</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-white font-display tracking-tight">
            Allocated Showroom Inventory
          </h2>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={() => setMobileFilterOpen(!mobileFilterOpen)}
            className="md:hidden flex items-center gap-2 px-3.5 py-2 rounded-lg bg-[#11151F] border border-white/[0.1] text-white text-xs font-medium"
          >
            <Filter className="w-3.5 h-3.5 text-rose-400" />
            <span>Filters</span>
          </button>

          {/* Grid / List View Switcher */}
          <div className="hidden sm:flex items-center p-1 rounded-lg bg-[#11151F] border border-white/[0.08]">
            <button
              type="button"
              onClick={() => setViewMode('grid')}
              aria-label="Grid View"
              className={`p-1.5 rounded-md transition-colors ${
                viewMode === 'grid' ? 'bg-rose-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
              title="Grid View"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => setViewMode('list')}
              aria-label="List View"
              className={`p-1.5 rounded-md transition-colors ${
                viewMode === 'list' ? 'bg-rose-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
              title="List View"
            >
              <List className="w-4 h-4" />
            </button>
          </div>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-3.5 py-2 rounded-lg bg-[#11151F] border border-white/[0.1] text-xs font-medium text-white focus:outline-none focus:border-rose-500 cursor-pointer"
          >
            <option value="featured">Sort: Featured First</option>
            <option value="price_asc">Price: Low to High</option>
            <option value="price_desc">Price: High to Low</option>
            <option value="year_desc">Year: Newest First</option>
            <option value="mileage_asc">Mileage: Lowest First</option>
          </select>
        </div>
      </div>

      {/* Active Filter Bar */}
      {hasActiveFilters && (
        <div className="flex flex-wrap items-center gap-3 text-xs text-slate-300">
          <span className="text-slate-400">Active Refinement:</span>
          {selectedBrand !== 'all' && (
            <button
              type="button"
              onClick={() => setSelectedBrand('all')}
              className="px-2.5 py-1 rounded bg-[#11151F] border border-white/[0.1] flex items-center gap-1.5 hover:border-white/30"
            >
              <span className="capitalize">Make: {selectedBrand}</span>
              <X className="w-3 h-3 text-slate-400" />
            </button>
          )}
          {selectedBodyType !== 'all' && (
            <button
              type="button"
              onClick={() => setSelectedBodyType('all')}
              className="px-2.5 py-1 rounded bg-[#11151F] border border-white/[0.1] flex items-center gap-1.5 hover:border-white/30"
            >
              <span>Style: {selectedBodyType}</span>
              <X className="w-3 h-3 text-slate-400" />
            </button>
          )}
          {selectedFuel !== 'all' && (
            <button
              type="button"
              onClick={() => setSelectedFuel('all')}
              className="px-2.5 py-1 rounded bg-[#11151F] border border-white/[0.1] flex items-center gap-1.5 hover:border-white/30"
            >
              <span>Powertrain: {selectedFuel}</span>
              <X className="w-3 h-3 text-slate-400" />
            </button>
          )}
          {maxPrice < 3000000 && (
            <button
              type="button"
              onClick={() => setMaxPrice(3000000)}
              className="px-2.5 py-1 rounded bg-[#11151F] border border-white/[0.1] flex items-center gap-1.5 font-mono tabular-nums hover:border-white/30"
            >
              <span>Max: ${maxPrice.toLocaleString()}</span>
              <X className="w-3 h-3 text-slate-400" />
            </button>
          )}
          <button
            type="button"
            onClick={handleResetFilters}
            className="text-xs text-rose-400 hover:text-rose-300 underline ml-1"
          >
            Reset All
          </button>
        </div>
      )}

      {/* Main 12-Column Layout: 3-Col Filter Sidebar + 9-Col Vehicle Grid */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
        <aside
          className={`${
            mobileFilterOpen ? 'block' : 'hidden'
          } md:block md:col-span-3 p-6 rounded-2xl bg-[#11151F] border border-white/[0.08] space-y-6 md:sticky md:top-28`}
        >
          <div className="flex items-center justify-between pb-4 border-b border-white/[0.08]">
            <span className="text-xs font-semibold text-white flex items-center gap-2">
              <SlidersHorizontal className="w-3.5 h-3.5 text-rose-500" />
              <span>Filter Specifications</span>
            </span>
            <button
              type="button"
              onClick={handleResetFilters}
              className="text-xs text-slate-400 hover:text-white flex items-center gap-1 transition-colors"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset</span>
            </button>
          </div>

          {/* Keyword */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-slate-400 block">Keyword or VIN</label>
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Model, color, VIN..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-8 pr-3 py-2 rounded-lg bg-[#090B10] border border-white/[0.1] text-xs text-white placeholder-slate-500 focus:outline-none focus:border-rose-500"
              />
            </div>
          </div>

          {/* Brand */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-slate-400 block">Manufacturer</label>
            <div className="space-y-1">
              {brands.map((b) => (
                <button
                  key={b}
                  type="button"
                  onClick={() => setSelectedBrand(b || 'all')}
                  className={`w-full px-3 py-2 rounded-lg text-xs font-medium text-left capitalize transition-colors flex items-center justify-between ${
                    selectedBrand === b
                      ? 'bg-rose-600 text-white'
                      : 'text-slate-300 hover:text-white hover:bg-white/[0.04]'
                  }`}
                >
                  <span>{b === 'all' ? 'All Marques' : b}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Max Price */}
          <div className="space-y-2 pt-3 border-t border-white/[0.08]">
            <div className="flex justify-between text-xs">
              <span className="text-slate-400">Price Ceiling</span>
              <span className="text-white font-mono tabular-nums font-semibold">
                ${maxPrice.toLocaleString()}
              </span>
            </div>
            <input
              type="range"
              min={80000}
              max={3000000}
              step={20000}
              value={maxPrice}
              onChange={(e) => setMaxPrice(Number(e.target.value))}
              className="w-full cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-500 font-mono tabular-nums">
              <span>$80,000</span>
              <span>$3,000,000</span>
            </div>
          </div>

          {/* Body Style */}
          <div className="space-y-2 pt-3 border-t border-white/[0.08]">
            <label className="text-xs font-medium text-slate-400 block">Body Style</label>
            <div className="flex flex-wrap gap-1.5">
              {bodyTypes.map((bt) => (
                <button
                  key={bt}
                  type="button"
                  onClick={() => setSelectedBodyType(bt || 'all')}
                  className={`px-2.5 py-1.5 rounded-md text-xs font-medium capitalize transition-colors whitespace-nowrap shrink-0 ${
                    selectedBodyType === bt
                      ? 'bg-rose-600 text-white'
                      : 'bg-[#090B10] border border-white/[0.08] text-slate-300 hover:text-white'
                  }`}
                >
                  {bt}
                </button>
              ))}
            </div>
          </div>

          {/* Showroom Location */}
          <div className="space-y-2 pt-3 border-t border-white/[0.08]">
            <label className="text-xs font-medium text-slate-400 block">Showroom Gallery</label>
            <select
              value={selectedShowroom}
              onChange={(e) => setSelectedShowroom(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-[#090B10] border border-white/[0.1] text-xs text-slate-200 focus:outline-none focus:border-rose-500"
            >
              <option value="all">All Galleries</option>
              {showrooms.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>

          {/* Powertrain */}
          <div className="space-y-2 pt-3 border-t border-white/[0.08]">
            <label className="text-xs font-medium text-slate-400 block">Powertrain</label>
            <div className="flex flex-wrap gap-1.5">
              {fuelTypes.map((ft) => (
                <button
                  key={ft}
                  type="button"
                  onClick={() => setSelectedFuel(ft || 'all')}
                  className={`px-2.5 py-1.5 rounded-md text-xs font-medium capitalize transition-colors whitespace-nowrap shrink-0 ${
                    selectedFuel === ft
                      ? 'bg-rose-600 text-white'
                      : 'bg-[#090B10] border border-white/[0.08] text-slate-300 hover:text-white'
                  }`}
                >
                  {ft}
                </button>
              ))}
            </div>
          </div>
        </aside>

        {/* Vehicle Grid */}
        <div className="md:col-span-9">
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
                    onOpenQr={(c) => setQrModalCar(c)}
                    onSelect={onSelectCar}
                  />
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                {filteredCars.map((car) => (
                  <div
                    key={car.id}
                    onClick={() => onSelectCar(car)}
                    className="p-5 rounded-2xl bg-[#11151F] border border-white/[0.08] hover:border-white/[0.22] flex flex-col sm:flex-row items-center gap-6 transition-all card-hover-lift cursor-pointer"
                  >
                    <div className="w-full sm:w-64 aspect-[4/3] rounded-xl overflow-hidden bg-[#090B10] shrink-0 relative">
                      <img
                        src={car.images?.[0]?.url || FALLBACK_CAR_IMG}
                        alt={car.title}
                        referrerPolicy="no-referrer"
                        onError={(e) => {
                          const target = e.currentTarget;
                          if (target.src !== window.location.origin + FALLBACK_CAR_IMG) {
                            target.src = FALLBACK_CAR_IMG;
                          }
                        }}
                        className="w-full h-full object-cover"
                      />
                    </div>

                    <div className="flex-1 space-y-2 w-full">
                      <div className="flex items-center justify-between text-xs text-slate-400">
                        <span>
                          {car.model?.brand?.name} · {car.year} · {car.condition}
                        </span>
                        <span className="font-mono tabular-nums">VIN: {car.vin}</span>
                      </div>
                      <h3 className="text-lg font-semibold text-white font-display">
                        {car.title}
                      </h3>
                      <p className="text-xs text-slate-400 line-clamp-2">{car.description}</p>
                      <div className="flex flex-wrap items-center gap-2 text-xs text-slate-400 pt-1">
                        <span className="font-mono tabular-nums">{car.mileage.toLocaleString()} mi</span>
                        <span aria-hidden="true">·</span>
                        <span>{car.fuel}</span>
                        <span aria-hidden="true">·</span>
                        <span>{car.showroom?.name}</span>
                      </div>
                    </div>

                    <div className="sm:border-l border-white/[0.08] sm:pl-6 text-right shrink-0 w-full sm:w-auto flex sm:flex-col justify-between items-center sm:items-end gap-3">
                      <div>
                        <span className="text-xl font-bold text-white font-mono tabular-nums block">
                          ${car.price.toLocaleString()}
                        </span>
                        <span className="text-xs text-slate-400 font-mono tabular-nums block">
                          Est. ${Math.round(car.price / 60).toLocaleString()}/mo
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setQrModalCar(car);
                          }}
                          className="p-2 rounded-lg bg-[#090B10] hover:bg-white/[0.08] border border-cyan-500/30 text-cyan-400 transition-colors"
                          title="Generate Mobile QR Code"
                        >
                          <QrCode className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onSelectCar(car);
                          }}
                          className="px-4 py-2 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-semibold text-xs transition-colors flex items-center gap-1 whitespace-nowrap shrink-0"
                        >
                          <span>Inspect 3D</span>
                          <ChevronRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )
          ) : (
            <div className="py-20 text-center rounded-2xl bg-[#11151F] border border-white/[0.08] space-y-4">
              <h3 className="text-xl font-semibold text-white font-display">
                No Vehicles Match Your Selected Criteria
              </h3>
              <p className="text-slate-400 text-xs max-w-md mx-auto">
                Adjust your price ceiling or clear active filters to inspect our full showroom collection.
              </p>
              <button
                type="button"
                onClick={handleResetFilters}
                className="px-5 py-2.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-semibold text-xs transition-colors"
              >
                Reset All Filters
              </button>
            </div>
          )}
        </div>
      </div>

      {/* QR Code Generator Modal */}
      {qrModalCar && (
        <CarQrCodeModal car={qrModalCar} onClose={() => setQrModalCar(null)} />
      )}
    </div>
  );
};
