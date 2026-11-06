import React, { useState, useEffect } from 'react';
import {
  Search,
  Sparkles,
  Compass,
  ShieldCheck,
  ArrowRight,
  Zap,
  ChevronDown,
  CheckCircle2,
  Car as CarIcon,
  ChevronLeft,
  ChevronRight,
  Award,
  PhoneCall,
  SlidersHorizontal,
} from 'lucide-react';
import { Car } from '../../types';

interface HeroSectionProps {
  cars?: Car[];
  onSearch: (query: string) => void;
  onExplore: () => void;
}

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

  // Dynamically derive available options from actual database cars
  const availableBrands = Array.from(
    new Set(
      cars
        .map((c) => c.model?.brand?.name || '')
        .filter(Boolean)
    )
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
    new Set(
      cars
        .map((c) => c.model?.body_type || '')
        .filter(Boolean)
    )
  ).sort();

  const quickPills =
    cars.length > 0
      ? cars.slice(0, 7).map((c) => c.model?.name || c.title.replace(/^\d{4}\s+/, ''))
      : ['Countach LPI', '911 GT3 RS', 'M4 Competition', 'AMG GT 63 S', 'Model S Plaid', '296 GTB', 'G 63 AMG'];

  const slides = [
    {
      badge: 'Premier Automotive Retail & 3D Showroom Network',
      title: 'Pioneering Luxury &',
      highlight: 'Automotive Excellence',
      description:
        'Discover brand new imports, certified reconditioned vehicles, and high-performance exotics with 100% verified provenance, factory warranty, and spatial 3D inspection.',
      ctaPrimary: 'Explore Available Fleet',
      ctaSecondary: 'Fast Track Trade-In',
      image:
        'https://images.unsplash.com/photo-1617814076367-b759c7d7e738?auto=format&fit=crop&w=2400&q=85',
    },
    {
      badge: 'Aura Fast Track Trade-In Service',
      title: 'Upgrade Your Car in',
      highlight: '30 Minutes Flat',
      description:
        'Receive the highest market valuation for your vehicle with our 15-minute diagnostic evaluation. Instant wire settlement or same-day trade-in upgrade.',
      ctaPrimary: 'Value My Car Now',
      ctaSecondary: 'How Fast Track Works',
      image:
        'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=2400&q=85',
    },
    {
      badge: 'Competitive Bank Financing & Leasing',
      title: 'Commercial Bank & HNB',
      highlight: 'Special Leasing Rates',
      description:
        'Unprecedented leasing rates starting from 10.25% p.a., up to 80% financing, rapid 24-hour loan approvals, and flexible repayment terms up to 7 years.',
      ctaPrimary: 'Calculate Monthly Lease',
      ctaSecondary: 'Leasing Partners',
      image:
        'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=2400&q=85',
    },
    {
      badge: 'Next-Generation Spatial Retail Architecture',
      title: 'Photorealistic 3D &',
      highlight: 'Virtual Showroom Bays',
      description:
        'Inspect high-resolution 3D digital twins, configure OEM paint finishes, and navigate exact showroom bay positions with LiDAR millimeter precision.',
      ctaPrimary: 'Launch 3D Configurator',
      ctaSecondary: 'Showroom Floor Maps',
      image:
        'https://images.unsplash.com/photo-1580273916550-e323be2ae537?auto=format&fit=crop&w=2400&q=85',
    },
  ];

  // Auto slide transition
  useEffect(() => {
    const timer = setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % slides.length);
    }, 6500);
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

  const handlePillClick = (pill: string) => {
    setSearchTerm(pill);
    onSearch(pill);
  };

  const currentSlide = slides[activeSlide];

  return (
    <div className="relative min-h-[92vh] flex flex-col justify-between overflow-hidden pt-6 pb-20 w-full">
      {/* Dynamic Background Image Carousel - VIVID & HIGH-CONTRAST */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        {slides.map((s, idx) => (
          <div
            key={idx}
            className={`absolute inset-0 transition-all duration-1000 ease-in-out ${activeSlide === idx
                ? 'opacity-85 scale-100 z-10'
                : 'opacity-0 scale-105 pointer-events-none'
              }`}
          >
            <img
              src={s.image}
              alt={s.title}
              className="w-full h-full object-cover object-center filter brightness-[0.92] contrast-[1.08]"
            />
          </div>
        ))}

        {/* Professional Cinematic Vignette Overlays that keep imagery vivid while preserving text readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#06090F] via-[#06090F]/50 to-slate-950/60 z-20 pointer-events-none" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#06090F]/70 via-transparent to-[#06090F]/70 z-20 pointer-events-none" />
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[500px] bg-red-600/15 blur-[160px] rounded-full pointer-events-none z-20" />
      </div>

      {/* Main Full-Width Container */}
      <div className="w-full max-w-[1720px] mx-auto px-4 sm:px-8 xl:px-12 relative z-30 flex flex-col items-center text-center space-y-8 my-auto">
        {/* Animated Slide Pill Badge */}
        <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full bg-slate-950/90 border border-red-500/40 text-red-400 text-xs font-bold tracking-wider uppercase backdrop-blur-xl shadow-xl shadow-red-600/15 animate-fade-in-down">
          <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
          <Award className="w-3.5 h-3.5 text-red-500" />
          <span>{currentSlide.badge}</span>
        </div>

        {/* Dynamic Title & Subtitle */}
        <div className="space-y-4 max-w-5xl drop-shadow-md">
          <h1 className="text-4xl sm:text-6xl lg:text-7xl xl:text-8xl font-black text-white tracking-tight uppercase font-display leading-[0.98]">
            {currentSlide.title} <br />
            <span className="gradient-text-red">{currentSlide.highlight}</span>
          </h1>
          <p className="text-sm sm:text-lg lg:text-xl text-slate-200 max-w-3xl mx-auto font-light leading-relaxed drop-shadow">
            {currentSlide.description}
          </p>
        </div>

        {/* Slide Selector Indicators & Controls */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setActiveSlide((prev) => (prev === 0 ? slides.length - 1 : prev - 1))}
            className="p-2 rounded-full bg-slate-950/80 hover:bg-slate-900 text-slate-300 hover:text-white border border-white/20 backdrop-blur-md transition-all active:scale-95 shadow-lg"
            title="Previous Slide"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <div className="flex items-center gap-2">
            {slides.map((_, i) => (
              <button
                key={i}
                onClick={() => setActiveSlide(i)}
                className={`h-2.5 rounded-full transition-all duration-300 ${activeSlide === i ? 'w-10 bg-red-500 shadow-lg shadow-red-500/50' : 'w-2.5 bg-white/40 hover:bg-white/70'
                  }`}
                title={`Slide ${i + 1}`}
              />
            ))}
          </div>

          <button
            onClick={() => setActiveSlide((prev) => (prev + 1) % slides.length)}
            className="p-2 rounded-full bg-slate-950/80 hover:bg-slate-900 text-slate-300 hover:text-white border border-white/20 backdrop-blur-md transition-all active:scale-95 shadow-lg"
            title="Next Slide"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* =========================================================================
            FULL-WIDTH MULTI-CRITERIA VEHICLE SEARCH & FILTER ENGINE
            ========================================================================= */}
        <div className="w-full max-w-5xl space-y-4 pt-2">
          <div className="rounded-[2.2rem] bg-slate-950/85 border border-white/20 backdrop-blur-2xl shadow-[0_25px_70px_rgba(0,0,0,0.85)] p-5 sm:p-7 text-left space-y-4">
            {/* Condition Category Tabs */}
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1 border-b border-white/[0.1]">
              {[
                { id: 'all', label: 'All Inventory' },
                { id: 'new', label: 'Brand New' },
                { id: 'reconditioned', label: 'Reconditioned / Certified' },
                { id: 'pre-owned', label: 'Pre-Owned' },
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
                    className={`px-4 sm:px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider whitespace-nowrap transition-all ${isActive
                        ? 'bg-red-600 text-white shadow-lg shadow-red-600/35'
                        : 'text-slate-300 hover:text-white hover:bg-white/[0.06]'
                      }`}
                  >
                    {tab.label}
                  </button>
                );
              })}
            </div>

            {/* Filter Dropdown Matrix - Dynamically loaded from database */}
            <form onSubmit={handleSearchSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
                {/* 1. Make / Brand */}
                <div className="space-y-1">
                  <label className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-bold block">
                    Select Make
                  </label>
                  <select
                    value={selectedMake}
                    onChange={(e) => {
                      setSelectedMake(e.target.value);
                      setSelectedModel('all');
                    }}
                    className="w-full px-3.5 py-3 rounded-xl bg-slate-900/90 border border-white/15 text-white text-xs font-semibold focus:outline-none focus:border-red-500 shadow-inner"
                  >
                    <option value="all">All Brands ({availableBrands.length})</option>
                    {availableBrands.map((brand) => (
                      <option key={brand} value={brand}>
                        {brand}
                      </option>
                    ))}
                  </select>
                </div>

                {/* 2. Model */}
                <div className="space-y-1">
                  <label className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-bold block">
                    Vehicle Model
                  </label>
                  <select
                    value={selectedModel}
                    onChange={(e) => setSelectedModel(e.target.value)}
                    className="w-full px-3.5 py-3 rounded-xl bg-slate-900/90 border border-white/15 text-white text-xs font-semibold focus:outline-none focus:border-red-500 shadow-inner"
                  >
                    <option value="all">All Models ({availableModels.length})</option>
                    {availableModels.map((model) => (
                      <option key={model} value={model}>
                        {model}
                      </option>
                    ))}
                  </select>
                </div>

                {/* 3. Body Type */}
                <div className="space-y-1">
                  <label className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-bold block">
                    Body Type
                  </label>
                  <select
                    value={selectedBodyType}
                    onChange={(e) => setSelectedBodyType(e.target.value)}
                    className="w-full px-3.5 py-3 rounded-xl bg-slate-900/90 border border-white/15 text-white text-xs font-semibold focus:outline-none focus:border-red-500 shadow-inner"
                  >
                    <option value="all">All Body Types ({availableBodyTypes.length})</option>
                    {availableBodyTypes.map((type) => (
                      <option key={type} value={type}>
                        {type}
                      </option>
                    ))}
                  </select>
                </div>

                {/* 4. Budget Range */}
                <div className="space-y-1">
                  <label className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-bold block">
                    Price Range
                  </label>
                  <select
                    value={selectedBudget}
                    onChange={(e) => setSelectedBudget(e.target.value)}
                    className="w-full px-3.5 py-3 rounded-xl bg-slate-900/90 border border-white/15 text-white text-xs font-semibold focus:outline-none focus:border-red-500 shadow-inner"
                  >
                    <option value="all">Any Price</option>
                    <option value="under150k">Under $150,000</option>
                    <option value="150to300k">$150,000 – $300,000</option>
                    <option value="above300k">$300,000+</option>
                  </select>
                </div>
              </div>

              {/* Free Text Search & CTA Row */}
              <div className="flex flex-col sm:flex-row items-center gap-3 pt-1">
                <div className="flex-1 w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl bg-slate-900/90 border border-white/15 focus-within:border-red-500/70 transition-all shadow-inner">
                  <Search className="w-4 h-4 text-red-500 shrink-0" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search database inventory by model, brand, color, or VIN..."
                    className="w-full bg-transparent text-xs sm:text-sm text-white placeholder-slate-400 focus:outline-none font-medium"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full sm:w-auto px-9 py-4 rounded-2xl bg-gradient-to-r from-red-600 via-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white font-black text-xs sm:text-sm uppercase tracking-wider transition-all shadow-xl shadow-red-600/35 shrink-0 flex items-center justify-center gap-2 group active:scale-95"
                >
                  <Search className="w-4 h-4" />
                  <span>Find Vehicles</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            </form>

            {/* Quick Trending Filter Pills from Real Database */}
            <div className="pt-2 flex flex-wrap items-center gap-2 text-xs border-t border-white/[0.08]">
              <span className="text-slate-400 font-semibold uppercase tracking-wider text-[10px] mr-1">
                Trending Inventory:
              </span>
              {quickPills.map((pill) => (
                <button
                  key={pill}
                  type="button"
                  onClick={() => handlePillClick(pill)}
                  className="px-3.5 py-1.5 rounded-full bg-slate-900/90 hover:bg-slate-800 border border-white/10 hover:border-red-500/50 text-slate-300 hover:text-white transition-all text-xs font-medium"
                >
                  {pill}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* 4 Brand Authority Credentials */}
        <div className="pt-4 grid grid-cols-2 lg:grid-cols-4 gap-4 w-full max-w-5xl text-left">
          <div className="p-4 rounded-2xl bg-slate-950/75 border border-white/15 backdrop-blur-md flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-red-600/20 text-red-500 flex items-center justify-center shrink-0">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-bold text-white font-display">Verified Provenance</p>
              <p className="text-[11px] text-slate-400">150-Point Factory Inspection</p>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-950/75 border border-white/15 backdrop-blur-md flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-bold text-white font-display">100% Genuine Odometer</p>
              <p className="text-[11px] text-slate-400">JEVIC Certified Records</p>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-950/75 border border-white/15 backdrop-blur-md flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0">
              <Zap className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-bold text-white font-display">Fast Track 30-Min</p>
              <p className="text-[11px] text-slate-400">Trade-In & Sell Your Car</p>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-950/75 border border-white/15 backdrop-blur-md flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-sky-500/20 text-sky-400 flex items-center justify-center shrink-0">
              <Compass className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-bold text-white font-display">Live Bay Wayfinding</p>
              <p className="text-[11px] text-slate-400">Real-Time RFID Showroom Sync</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
