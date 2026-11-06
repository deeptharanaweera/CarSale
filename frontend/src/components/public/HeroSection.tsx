import React, { useState, useEffect } from 'react';
import {
  Search,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { Car } from '../../types';

interface HeroSectionProps {
  cars?: Car[];
  onSearch: (query: string) => void;
  onExplore: () => void;
}

const FALLBACK_HERO_IMG = '/src/assets/images/hero_hypercar_pavilion_1793964975599.jpg';

export const HeroSection: React.FC<HeroSectionProps> = ({
  cars = [],
  onSearch,
  onExplore,
}) => {
  const [activeSlide, setActiveSlide] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [conditionTab, setConditionTab] = useState<'all' | 'new' | 'reconditioned' | 'pre-owned' | 'hybrid'>('all');
  const [selectedMake, setSelectedMake] = useState('all');
  const [selectedModel, setSelectedModel] = useState('all');
  const [selectedBodyType, setSelectedBodyType] = useState('all');
  const [selectedBudget, setSelectedBudget] = useState('all');

  const availableBrands = Array.from(
    new Set(cars.map((c) => c.model?.brand?.name || '').filter(Boolean))
  ).sort();

  const availableModels = Array.from(
    new Set(
      cars
        .filter((c) => selectedMake === 'all' || c.model?.brand?.name === selectedMake)
        .map((c) => c.model?.name || '')
        .filter(Boolean)
    )
  ).sort();

  const availableBodyTypes = Array.from(
    new Set(cars.map((c) => c.model?.body_type || '').filter(Boolean))
  ).sort();

  const slides = [
    {
      kicker: 'Flagship Architectural Galleries · Manhattan · Beverly Hills · Miami',
      title: 'Curated Supercars & Spatial 3D Provenance',
      description:
        'Explore factory-allocated hypercars, certified grand tourers, and electric flagships backed by 150-point telemetry verification and interactive 3D showroom twins.',
      ctaPrimary: 'Explore Available Fleet',
      specHighlight: '2022 Lamborghini Countach LPI 800-4 · 803 HP V12 Hybrid',
      specPrice: '$2,640,000',
      image: '/src/assets/images/hero_hypercar_pavilion_1793964975599.jpg',
    },
    {
      kicker: 'Handcrafted Performance · Certified Showroom Collection',
      title: 'Bespoke Engineering Meets Digital Precision',
      description:
        'Inspect OEM paint finishes, carbon-ceramic brake packages, and real-time showroom bay coordinates before scheduling your private gallery appointment.',
      ctaPrimary: 'Browse Performance Coupes',
      specHighlight: '2024 Mercedes-AMG GT 63 S E-Performance · 831 HP',
      specPrice: '$189,000',
      image: '/src/assets/images/car_amg_gt_solar_1793964978824.jpg',
    },
    {
      kicker: '800V Electric Architecture · Zero-Emission Grand Touring',
      title: 'Next-Generation Electric Flagships in Stock',
      description:
        'Immediate delivery on flagship electric grand tourers with verified battery cell health certification and nationwide high-voltage service support.',
      ctaPrimary: 'View Electric & Hybrid Fleet',
      specHighlight: '2024 Audi RS e-tron GT Carbon Edition · 637 HP',
      specPrice: '$152,000',
      image: '/src/assets/images/car_audi_etron_gt_1793964980908.jpg',
    },
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % slides.length);
    }, 7500);
    return () => clearInterval(timer);
  }, [slides.length]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    let query = searchTerm.trim();
    if (!query) {
      if (selectedMake !== 'all') query += selectedMake + ' ';
      if (selectedModel !== 'all') query += selectedModel + ' ';
      if (selectedBodyType !== 'all') query += selectedBodyType + ' ';
    }
    onSearch(query.trim());
  };

  const currentSlide = slides[activeSlide];

  return (
    <section className="w-full max-w-[1440px] mx-auto px-6 lg:px-12 pt-8 pb-6 space-y-8">
      {/* Main 2-Column Asymmetric Editorial Split */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
        {/* Left Column: Editorial Value Proposition (5 cols) */}
        <div className="lg:col-span-5 flex flex-col justify-between p-8 sm:p-10 rounded-2xl bg-[#11151F] border border-white/[0.08]">
          <div className="space-y-6">
            {/* Unboxed Metadata Kicker */}
            <div className="text-xs font-medium text-slate-400 tracking-wide">
              <span>{currentSlide.kicker}</span>
            </div>

            {/* Display Headline (clamp 2.25rem to 3.75rem, balanced) */}
            <h1
              className="font-display font-bold text-white tracking-tight leading-[1.08]"
              style={{ fontSize: 'clamp(2.25rem, 3.5vw, 3.5rem)' }}
            >
              {currentSlide.title}
            </h1>

            <p className="text-slate-300 text-base leading-relaxed font-normal max-w-[60ch]">
              {currentSlide.description}
            </p>
          </div>

          <div className="pt-8 mt-8 border-t border-white/[0.08] space-y-6">
            {/* Primary Action */}
            <div className="flex flex-wrap items-center gap-4">
              <button
                type="button"
                onClick={onExplore}
                className="px-6 py-3.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-semibold text-sm transition-colors flex items-center gap-2 whitespace-nowrap shrink-0"
              >
                <span>{currentSlide.ctaPrimary}</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              {/* Slide Controls */}
              <div className="flex items-center gap-2 ml-auto">
                <button
                  type="button"
                  onClick={() => setActiveSlide((prev) => (prev === 0 ? slides.length - 1 : prev - 1))}
                  aria-label="Previous featured vehicle"
                  className="p-2.5 rounded-lg bg-[#090B10] hover:bg-white/[0.06] text-slate-300 hover:text-white border border-white/[0.08] transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <span className="text-xs font-mono tabular-nums text-slate-400 px-2">
                  0{activeSlide + 1} / 0{slides.length}
                </span>
                <button
                  type="button"
                  onClick={() => setActiveSlide((prev) => (prev + 1) % slides.length)}
                  aria-label="Next featured vehicle"
                  className="p-2.5 rounded-lg bg-[#090B10] hover:bg-white/[0.06] text-slate-300 hover:text-white border border-white/[0.08] transition-colors"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Featured Spec Caption */}
            <div className="flex items-baseline justify-between gap-4 text-xs text-slate-400 pt-2">
              <span className="truncate">{currentSlide.specHighlight}</span>
              <span className="font-mono tabular-nums text-white font-semibold shrink-0">
                {currentSlide.specPrice}
              </span>
            </div>
          </div>
        </div>

        {/* Right Column: High-Impact 16:9 Studio Visual Showcase (7 cols) */}
        <div className="lg:col-span-7 relative rounded-2xl overflow-hidden bg-[#11151F] border border-white/[0.08] min-h-[380px] sm:min-h-[480px]">
          <img
            src={currentSlide.image}
            alt={currentSlide.title}
            referrerPolicy="no-referrer"
            onError={(e) => {
              const target = e.currentTarget;
              if (target.src !== window.location.origin + FALLBACK_HERO_IMG) {
                target.src = FALLBACK_HERO_IMG;
              }
            }}
            className="w-full h-full object-cover object-center"
          />

          {/* Measured Contrast Scrim at Bottom for Caption Legibility */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-transparent pointer-events-none" />

          <div className="absolute bottom-6 left-6 right-6 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div className="space-y-1">
              <div className="text-xs text-slate-300">
                <span>Manhattan Flagship Gallery</span>
                <span aria-hidden="true" className="mx-2">·</span>
                <span>Center Stage VIP Bay</span>
              </div>
              <p className="text-lg font-display font-semibold text-white">
                {currentSlide.specHighlight}
              </p>
            </div>

            <div className="flex items-center gap-1.5">
              {slides.map((_, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setActiveSlide(i)}
                  aria-label={`Select slide ${i + 1}`}
                  className={`h-1.5 rounded-full transition-all ${
                    activeSlide === i ? 'w-8 bg-rose-500' : 'w-2 bg-white/30 hover:bg-white/60'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Full-Width Multi-Criteria Vehicle Search & Filter Bar Below Hero Split */}
      <div className="rounded-2xl bg-[#11151F] border border-white/[0.08] p-6 sm:p-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/[0.08]">
          <div className="space-y-0.5">
            <h2 className="text-base font-display font-semibold text-white">
              Search Verified Dealership Inventory
            </h2>
            <p className="text-xs text-slate-400">
              Filter by condition, manufacturer, body architecture, or VIN
            </p>
          </div>

          {/* Interactive Segmented Condition Controls */}
          <div className="flex items-center gap-1 p-1 bg-[#090B10] rounded-lg border border-white/[0.06] overflow-x-auto no-scrollbar">
            {[
              { id: 'all', label: 'All Vehicles' },
              { id: 'new', label: 'Brand New' },
              { id: 'reconditioned', label: 'Certified Pre-Owned' },
              { id: 'hybrid', label: 'Electric & Hybrid' },
            ].map((tab) => {
              const isActive = conditionTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => {
                    setConditionTab(tab.id as typeof conditionTab);
                    if (tab.id === 'all') onSearch('');
                    else if (tab.id === 'new') onSearch('New');
                    else if (tab.id === 'reconditioned') onSearch('Certified');
                    else if (tab.id === 'hybrid') onSearch('Electric');
                  }}
                  className={`px-3.5 py-1.5 rounded-md text-xs font-medium whitespace-nowrap shrink-0 transition-colors ${
                    isActive
                      ? 'bg-[#161B26] text-white border border-white/[0.12]'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        <form onSubmit={handleSearchSubmit} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-4 items-end">
          {/* Make */}
          <div className="lg:col-span-2 space-y-1.5">
            <label className="text-xs font-medium text-slate-400 block">
              Manufacturer
            </label>
            <select
              value={selectedMake}
              onChange={(e) => {
                setSelectedMake(e.target.value);
                setSelectedModel('all');
              }}
              className="w-full px-3.5 py-2.5 rounded-lg bg-[#090B10] border border-white/[0.1] text-white text-xs font-medium focus:outline-none focus:border-rose-500"
            >
              <option value="all">All Brands ({availableBrands.length})</option>
              {availableBrands.map((brand) => (
                <option key={brand} value={brand}>
                  {brand}
                </option>
              ))}
            </select>
          </div>

          {/* Model */}
          <div className="lg:col-span-2 space-y-1.5">
            <label className="text-xs font-medium text-slate-400 block">
              Model
            </label>
            <select
              value={selectedModel}
              onChange={(e) => setSelectedModel(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-lg bg-[#090B10] border border-white/[0.1] text-white text-xs font-medium focus:outline-none focus:border-rose-500"
            >
              <option value="all">All Models ({availableModels.length})</option>
              {availableModels.map((model) => (
                <option key={model} value={model}>
                  {model}
                </option>
              ))}
            </select>
          </div>

          {/* Body Type */}
          <div className="lg:col-span-2 space-y-1.5">
            <label className="text-xs font-medium text-slate-400 block">
              Body Style
            </label>
            <select
              value={selectedBodyType}
              onChange={(e) => setSelectedBodyType(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-lg bg-[#090B10] border border-white/[0.1] text-white text-xs font-medium focus:outline-none focus:border-rose-500"
            >
              <option value="all">All Styles ({availableBodyTypes.length})</option>
              {availableBodyTypes.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </div>

          {/* Price Range */}
          <div className="lg:col-span-2 space-y-1.5">
            <label className="text-xs font-medium text-slate-400 block">
              Price Ceiling
            </label>
            <select
              value={selectedBudget}
              onChange={(e) => setSelectedBudget(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-lg bg-[#090B10] border border-white/[0.1] text-white text-xs font-medium focus:outline-none focus:border-rose-500"
            >
              <option value="all">No Limit</option>
              <option value="under150k">Under $150,000</option>
              <option value="150to300k">$150,000 – $300,000</option>
              <option value="above300k">$300,000+</option>
            </select>
          </div>

          {/* Keyword Input */}
          <div className="lg:col-span-2 space-y-1.5">
            <label className="text-xs font-medium text-slate-400 block">
              Direct Search
            </label>
            <div className="flex items-center gap-2 px-3.5 py-2.5 rounded-lg bg-[#090B10] border border-white/[0.1] focus-within:border-rose-500">
              <Search className="w-3.5 h-3.5 text-slate-500 shrink-0" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Model, finish, VIN..."
                className="w-full bg-transparent text-xs text-white placeholder-slate-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Submit Button */}
          <div className="lg:col-span-2">
            <button
              type="submit"
              className="w-full py-2.5 px-4 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-semibold text-xs transition-colors flex items-center justify-center gap-2 whitespace-nowrap shrink-0"
            >
              <span>Search Fleet</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </form>
      </div>

      {/* 4-Column Quantitative Authority Strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-xl bg-[#11151F] border border-white/[0.08] space-y-1">
          <p className="text-2xl font-mono tabular-nums font-bold text-white">150-Point</p>
          <p className="text-xs text-slate-400">Factory Telemetry & Mechanical Certification</p>
        </div>

        <div className="p-5 rounded-xl bg-[#11151F] border border-white/[0.08] space-y-1">
          <p className="text-2xl font-mono tabular-nums font-bold text-white">100% JEVIC</p>
          <p className="text-xs text-slate-400">Verified Odometer & Original Auction Dossier</p>
        </div>

        <div className="p-5 rounded-xl bg-[#11151F] border border-white/[0.08] space-y-1">
          <p className="text-2xl font-mono tabular-nums font-bold text-white">30 Minutes</p>
          <p className="text-xs text-slate-400">Fast Track Diagnostic Valuation & Wire Payout</p>
        </div>

        <div className="p-5 rounded-xl bg-[#11151F] border border-white/[0.08] space-y-1">
          <p className="text-2xl font-mono tabular-nums font-bold text-white">3 Galleries</p>
          <p className="text-xs text-slate-400">Manhattan, Beverly Hills & Miami 3D Showrooms</p>
        </div>
      </div>
    </section>
  );
};
