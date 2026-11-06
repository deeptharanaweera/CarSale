import React, { useState, useEffect } from 'react';
import { Car, Showroom } from './types';
import { api } from './services/api';
import { Navbar } from './components/public/Navbar';
import { HeroSection } from './components/public/HeroSection';
import { BrowseByBodyType } from './components/public/BrowseByBodyType';
import { TheAuraAdvantage } from './components/public/TheAuraAdvantage';
import { FastTrackSection } from './components/public/FastTrackSection';
import { ServiceParkSection } from './components/public/ServiceParkSection';
import { BankLeasingSection } from './components/public/BankLeasingSection';
import { BranchNetworkSection } from './components/public/BranchNetworkSection';
import { CarListing } from './components/public/CarListing';
import { CarDetailPage } from './components/public/CarDetailPage';
import { ShowroomsPage } from './components/public/ShowroomsPage';
import { CompareModal } from './components/public/CompareModal';
import { UserAccountModal } from './components/public/UserAccountModal';
import { KioskApp } from './components/kiosk/KioskApp';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { AdminInventory } from './components/admin/AdminInventory';
import { AdminFloorPlanEditor } from './components/admin/AdminFloorPlanEditor';
import { AdminKioskManager } from './components/admin/AdminKioskManager';
import { AdminSalesManager } from './components/admin/AdminSalesManager';
import {
  Car as CarIcon,
  Layers,
  MapPin,
  Radio,
  Calendar,
  Sparkles,
  BarChart3,
  ShieldCheck,
  ChevronRight,
  ArrowRight,
  ArrowUpRight,
  Compass,
  Award,
  Clock,
  PhoneCall,
  Scale,
  Trash2,
  Lock,
  Globe,
  Cpu,
  CheckCircle2,
  Eye,
  SlidersHorizontal,
} from 'lucide-react';

export function App() {
  // Navigation State
  const [currentView, setCurrentView] = useState<'public' | 'kiosk' | 'admin'>('public');
  const [publicPage, setPublicPage] = useState<'home' | 'cars' | 'showrooms' | 'car-detail'>('home');
  const [adminTab, setAdminTab] = useState<'dashboard' | 'inventory' | 'floors' | 'kiosks' | 'sales'>('dashboard');

  // Data State
  const [cars, setCars] = useState<Car[]>([]);
  const [showrooms, setShowrooms] = useState<Showroom[]>([]);
  const [selectedCar, setSelectedCar] = useState<Car | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState<string>('ALL');

  // User Actions State
  const [favorites, setFavorites] = useState<number[]>([1]);
  const [comparedCars, setComparedCars] = useState<Car[]>([]);
  const [compareModalOpen, setCompareModalOpen] = useState(false);
  const [accountModalOpen, setAccountModalOpen] = useState(false);

  // Load Initial Data
  const loadInitialData = async () => {
    try {
      setLoading(true);
      const [carsRes, showroomsRes] = await Promise.all([
        api.getCars(),
        api.getShowrooms(),
      ]);
      setCars(carsRes.data);
      setShowrooms(showroomsRes.data);
    } catch (err) {
      console.error('Error loading initial data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadInitialData();
  }, []);

  const handleSelectCar = (car: Car) => {
    setSelectedCar(car);
    setPublicPage('car-detail');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleToggleFavorite = (car: Car) => {
    setFavorites((prev) =>
      prev.includes(car.id) ? prev.filter((id) => id !== car.id) : [...prev, car.id]
    );
  };

  const handleToggleCompare = (car: Car) => {
    setComparedCars((prev) => {
      const exists = prev.some((c) => c.id === car.id);
      if (exists) {
        return prev.filter((c) => c.id !== car.id);
      }
      if (prev.length >= 3) {
        alert('You can compare a maximum of 3 vehicles simultaneously.');
        return prev;
      }
      return [...prev, car];
    });
  };

  // Filtered Featured Cars for Home Quick-Tabs
  const featuredCars = cars.filter((c) => {
    const baseMatch = c.is_featured || cars.indexOf(c) < 6;
    if (activeCategory === 'ALL') return baseMatch;
    if (activeCategory === 'HYBRID / EV' || activeCategory === 'EV / Hybrid') {
      return (c.fuel || '').toLowerCase().includes('electric') || (c.fuel || '').toLowerCase().includes('hybrid');
    }
    if (activeCategory === 'BRAND NEW' || activeCategory === 'New') {
      return c.condition === 'New';
    }
    if (activeCategory === 'RECONDITIONED' || activeCategory === 'Certified Pre-Owned') {
      return c.condition === 'Certified Pre-Owned';
    }
    if (activeCategory === 'SUV') {
      return (
        (c.model?.body_type || '').toLowerCase().includes('suv') ||
        (c.title || '').toLowerCase().includes('prado') ||
        (c.title || '').toLowerCase().includes('land') ||
        (c.title || '').toLowerCase().includes('defender')
      );
    }
    if (activeCategory === 'Sedan') {
      return (
        (c.model?.body_type || '').toLowerCase().includes('sedan') ||
        (c.title || '').toLowerCase().includes('premio') ||
        (c.title || '').toLowerCase().includes('c-class') ||
        (c.title || '').toLowerCase().includes('civic')
      );
    }
    if (activeCategory === 'Supercar' || activeCategory === 'TRACK') {
      return (
        (c.description || '').toLowerCase().includes('track') ||
        (c.description || '').toLowerCase().includes('hp') ||
        (c.model?.body_type || '').toLowerCase().includes('coupe') ||
        (c.title || '').toLowerCase().includes('porsche')
      );
    }
    if (activeCategory === 'Van') {
      return (c.model?.body_type || '').toLowerCase().includes('van') || (c.title || '').toLowerCase().includes('hiace');
    }
    if (activeCategory === 'Double Cab') {
      return (c.model?.body_type || '').toLowerCase().includes('cab') || (c.title || '').toLowerCase().includes('hilux');
    }
    return baseMatch;
  });

  // ==================== KIOSK MODE (STANDALONE TOUCH DISPLAY) ====================
  if (currentView === 'kiosk') {
    return (
      <div className="relative w-full h-screen bg-[#05070B] overflow-hidden select-none">
        <div className="absolute top-5 right-5 z-50 flex items-center gap-2.5">
          <div className="px-3.5 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[11px] font-mono uppercase tracking-widest flex items-center gap-2 backdrop-blur-xl">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            Terminal Active • 4K Touch
          </div>
          <button
            onClick={() => setCurrentView('public')}
            className="px-4 py-2 rounded-full bg-slate-900/90 text-slate-300 hover:text-white border border-white/15 text-xs font-semibold backdrop-blur-xl shadow-2xl transition-all hover:bg-slate-800 active:scale-95"
          >
            Exit Terminal
          </button>
        </div>
        <KioskApp />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#06090F] text-slate-100 flex flex-col font-sans selection:bg-emerald-500 selection:text-slate-950 relative overflow-x-hidden">
      {/* Ambient Architectural Studio Lighting */}
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
        <div className="absolute -top-48 left-1/4 w-[700px] h-[500px] bg-emerald-500/[0.05] rounded-full blur-[150px]" />
        <div className="absolute top-[35%] -right-48 w-[600px] h-[600px] bg-sky-500/[0.04] rounded-full blur-[150px]" />
        <div
          className="absolute inset-0 opacity-[0.025]"
          style={{
            backgroundImage: `linear-gradient(to right, #ffffff 1px, transparent 1px), linear-gradient(to bottom, #ffffff 1px, transparent 1px)`,
            backgroundSize: '64px 64px',
          }}
        />
      </div>

      {/* Universal Top Navigation */}
      <Navbar
        currentView={currentView}
        showrooms={showrooms}
        onChangeView={(view) => {
          setCurrentView(view);
          if (view === 'public') {
            setPublicPage('home');
          }
        }}
        publicPage={publicPage}
        onNavigate={(page) => {
          setPublicPage(page);
          setSelectedCar(null);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        favoritesCount={favorites.length}
        compareCount={comparedCars.length}
        onOpenCompare={() => setCompareModalOpen(true)}
        onOpenAccount={() => setAccountModalOpen(true)}
        onFastTrackClick={() => {
          setPublicPage('home');
          setTimeout(() => {
            document.getElementById('fast-track')?.scrollIntoView({ behavior: 'smooth' });
          }, 150);
        }}
      />

      {/* Main Content Area */}
      <main className="flex-1 relative z-10">
        {currentView === 'public' ? (
          /* ==================== 1. PUBLIC LUXURY PORTAL ==================== */
          <>
            {publicPage === 'home' && (
              <div className="space-y-24 sm:space-y-32 pb-28">
                {/* 1. Aura Motors Dynamic Hero Section */}
                <HeroSection
                  cars={cars}
                  onSearch={(q) => {
                    setSearchQuery(q);
                    setPublicPage('cars');
                  }}
                  onExplore={() => setPublicPage('cars')}
                />

                {/* 2. Browse By Body Type (SUVs, Sedans, Cabs, Vans, Hybrids) */}
                <BrowseByBodyType
                  cars={cars}
                  selectedCategory={activeCategory}
                  onSelectCategory={(cat) => {
                    if (cat === 'all') {
                      setActiveCategory('ALL');
                    } else {
                      setActiveCategory(cat);
                      document.getElementById('inventory-fleet')?.scrollIntoView({ behavior: 'smooth' });
                    }
                  }}
                />

                {/* 3. The Aura Advantage Trust Pillars */}
                <TheAuraAdvantage
                  onExploreServicePark={() => {
                    document.getElementById('service-park')?.scrollIntoView({ behavior: 'smooth' });
                  }}
                  onExploreFastTrack={() => {
                    document.getElementById('fast-track')?.scrollIntoView({ behavior: 'smooth' });
                  }}
                />

                {/* 4. Featured Automobile Fleet Section */}
                <section id="inventory-fleet" className="w-full max-w-[1720px] mx-auto px-4 sm:px-8 xl:px-12 space-y-10">
                  <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 pb-6 border-b border-white/[0.08]">
                    <div className="space-y-2">
                      <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-red-600/10 border border-red-500/20 text-red-400 text-xs font-mono uppercase tracking-widest font-bold">
                        <Sparkles className="w-3.5 h-3.5" />
                        Verified Dealership Inventory
                      </div>
                      <h2 className="text-3xl sm:text-5xl font-black text-white font-display uppercase tracking-tight">
                        Featured Inventory Fleet
                      </h2>
                      <p className="text-slate-400 text-sm max-w-xl font-light">
                        Every vehicle undergoes a 150-point diagnostic inspection, genuine JEVIC odometer verification, and is paired with an interactive 3D digital model.
                      </p>
                    </div>

                    {/* Quick Category Filter Pills */}
                    <div className="flex flex-wrap items-center gap-2">
                      {[
                        { id: 'ALL', label: 'All Featured' },
                        { id: 'BRAND NEW', label: 'Brand New' },
                        { id: 'RECONDITIONED', label: 'Reconditioned' },
                        { id: 'HYBRID / EV', label: 'Electric & Hybrid' },
                        { id: 'TRACK', label: 'Performance 3D' },
                      ].map((item) => (
                        <button
                          key={item.id}
                          onClick={() => setActiveCategory(item.id)}
                          className={`px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider transition-all ${
                            activeCategory === item.id
                              ? 'bg-red-600 text-white shadow-lg shadow-red-600/30'
                              : 'bg-slate-900/90 text-slate-400 hover:text-white border border-white/10'
                          }`}
                        >
                          {item.label}
                        </button>
                      ))}

                      <button
                        onClick={() => setPublicPage('cars')}
                        className="ml-2 px-5 py-2 rounded-full bg-white/[0.05] hover:bg-white/[0.1] border border-white/15 text-xs font-bold uppercase tracking-wider text-white flex items-center gap-1.5 group transition-all"
                      >
                        <span>Full Fleet ({cars.length})</span>
                        <ArrowUpRight className="w-4 h-4 text-red-400 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                      </button>
                    </div>
                  </div>

                  {loading ? (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      {[1, 2, 3].map((n) => (
                        <div
                          key={n}
                          className="h-[420px] rounded-3xl bg-slate-900/50 border border-white/[0.06] animate-pulse p-6 flex flex-col justify-between"
                        >
                          <div className="h-52 rounded-2xl bg-slate-800/70" />
                          <div className="space-y-3">
                            <div className="h-4 w-1/3 bg-slate-800 rounded" />
                            <div className="h-6 w-2/3 bg-slate-800 rounded" />
                            <div className="h-10 w-full bg-slate-800/60 rounded-xl mt-4" />
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <CarListing
                      cars={featuredCars}
                      showrooms={showrooms}
                      onSelectCar={handleSelectCar}
                      favorites={favorites}
                      comparedCars={comparedCars}
                      onToggleFavorite={handleToggleFavorite}
                      onToggleCompare={handleToggleCompare}
                    />
                  )}
                </section>

                {/* 5. Aura Fast Track (Sell or Trade In Vehicle in 30 Mins) */}
                <FastTrackSection />

                {/* 6. Aura Service Center & Genuine Spare Parts Showcase */}
                <ServiceParkSection />

                {/* 7. Easy Leasing & Bank Partnerships */}
                <BankLeasingSection />

                {/* 8. Island-Wide Branch Network Showcase */}
                <BranchNetworkSection
                  showrooms={showrooms}
                  cars={cars}
                  onExploreFloorMap={() => setPublicPage('showrooms')}
                />
              </div>
            )}

            {publicPage === 'cars' && (
              <CarListing
                cars={cars}
                showrooms={showrooms}
                onSelectCar={handleSelectCar}
                favorites={favorites}
                comparedCars={comparedCars}
                onToggleFavorite={handleToggleFavorite}
                onToggleCompare={handleToggleCompare}
                initialSearch={searchQuery}
              />
            )}

            {publicPage === 'showrooms' && (
              <ShowroomsPage
                showrooms={showrooms}
                cars={cars}
                onSelectCar={handleSelectCar}
              />
            )}

            {publicPage === 'car-detail' && selectedCar && (
              <CarDetailPage
                car={selectedCar}
                similarCars={cars.filter((c) => c.id !== selectedCar.id)}
                onBack={() => setPublicPage('cars')}
                onSelectSimilar={handleSelectCar}
                isFavorited={favorites.includes(selectedCar.id)}
                onToggleFavorite={() => handleToggleFavorite(selectedCar)}
                isCompared={comparedCars.some((c) => c.id === selectedCar.id)}
                onToggleCompare={() => handleToggleCompare(selectedCar)}
              />
            )}
          </>
        ) : (
          /* ==================== 2. EXECUTIVE ADMIN COMMAND CENTER ==================== */
          <div className="flex min-h-[calc(100vh-80px)] bg-[#05070B]">
            {/* Sleek Glassmorphic Command Sidebar */}
            <aside className="w-72 bg-slate-950/95 border-r border-white/[0.08] p-6 flex flex-col justify-between shrink-0">
              <div className="space-y-8">
                <div className="p-4 rounded-2xl bg-gradient-to-br from-purple-950/40 via-slate-900 to-slate-950 border border-purple-500/20 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-purple-400">
                      AURA OS • v4.2
                    </span>
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  </div>
                  <h3 className="text-lg font-black text-white font-display tracking-tight">
                    Executive Command
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    Multi-Showroom Telemetry & CRM
                  </p>
                </div>

                <nav className="space-y-1.5 text-xs font-bold uppercase tracking-wider">
                  {[
                    { id: 'dashboard', label: 'Analytics & Telemetry', icon: BarChart3 },
                    { id: 'inventory', label: 'Vault Fleet Inventory', icon: CarIcon },
                    { id: 'floors', label: '3D Spatial Floor Editor', icon: Layers },
                    { id: 'kiosks', label: 'Showroom Kiosk Nodes', icon: Radio },
                    { id: 'sales', label: 'VIP Allocations & Leads', icon: Calendar },
                  ].map((item) => {
                    const Icon = item.icon;
                    const isActive = adminTab === item.id;
                    return (
                      <button
                        key={item.id}
                        onClick={() => setAdminTab(item.id as typeof adminTab)}
                        className={`w-full flex items-center justify-between px-4 py-3.5 rounded-2xl transition-all ${isActive
                          ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/25 border border-purple-400/30'
                          : 'text-slate-400 hover:text-white hover:bg-white/[0.04]'
                          }`}
                      >
                        <div className="flex items-center gap-3">
                          <Icon className="w-4 h-4" />
                          <span>{item.label}</span>
                        </div>
                        {isActive && <ChevronRight className="w-4 h-4" />}
                      </button>
                    );
                  })}
                </nav>
              </div>

              {/* Quick Kiosk & System Status Footer in Sidebar */}
              <div className="space-y-3 pt-6 border-t border-white/[0.08]">
                <button
                  onClick={() => setCurrentView('kiosk')}
                  className="w-full py-3 px-4 rounded-2xl bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 text-xs font-bold flex items-center justify-center gap-2 transition-all"
                >
                  <Radio className="w-4 h-4" />
                  Launch Kiosk Mode
                </button>
                <div className="px-2 flex items-center justify-between text-[11px] text-slate-500 font-mono">
                  <span>RFID BAY SYNC</span>
                  <span className="text-emerald-400">99.98% UPTIME</span>
                </div>
              </div>
            </aside>

            {/* Admin Content Pane */}
            <div className="flex-1 bg-[#06090F] overflow-y-auto">
              {adminTab === 'dashboard' && <AdminDashboard />}
              {adminTab === 'inventory' && <AdminInventory />}
              {adminTab === 'floors' && <AdminFloorPlanEditor />}
              {adminTab === 'kiosks' && <AdminKioskManager />}
              {adminTab === 'sales' && <AdminSalesManager />}
            </div>
          </div>
        )}
      </main>

      {/* Sleek Floating Bottom Comparison Dock */}
      {comparedCars.length > 0 && currentView === 'public' && !compareModalOpen && (
        <div className="fixed bottom-6 right-6 z-40 animate-fade-in-up">
          <div className="p-3.5 rounded-3xl bg-slate-950/90 backdrop-blur-2xl border border-emerald-500/40 shadow-[0_20px_50px_rgba(0,0,0,0.85)] flex items-center gap-4">
            <div className="flex -space-x-3 pl-1">
              {comparedCars.map((c) => (
                <div
                  key={c.id}
                  className="w-11 h-11 rounded-2xl overflow-hidden border-2 border-emerald-500 bg-slate-900 shadow-md"
                >
                  <img
                    src={c.images?.[0]?.url}
                    alt={c.title}
                    className="w-full h-full object-cover"
                  />
                </div>
              ))}
            </div>
            <div className="text-xs pr-2">
              <p className="font-bold text-white flex items-center gap-1.5">
                <Scale className="w-3.5 h-3.5 text-emerald-400" />
                {comparedCars.length} / 3 Vehicles Selected
              </p>
              <p className="text-[11px] text-slate-400">Side-by-side telemetry matrix</p>
            </div>
            <button
              onClick={() => setCompareModalOpen(true)}
              className="px-5 py-2.5 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs uppercase tracking-wider shadow-lg shadow-emerald-500/25 transition-all"
            >
              Compare Specs
            </button>
            <button
              onClick={() => setComparedCars([])}
              className="p-2 rounded-xl hover:bg-slate-800 text-slate-400 hover:text-rose-400 transition-colors"
              title="Clear Comparison"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Global Modals */}
      {compareModalOpen && (
        <CompareModal
          cars={comparedCars}
          onRemove={(id) => setComparedCars((prev) => prev.filter((c) => c.id !== id))}
          onClear={() => setComparedCars([])}
          onClose={() => setCompareModalOpen(false)}
          onSelectCar={handleSelectCar}
        />
      )}

      {accountModalOpen && (
        <UserAccountModal
          onClose={() => setAccountModalOpen(false)}
          onSelectCar={handleSelectCar}
        />
      )}

      {/* Aura Motors Corporate Dealership Footer */}
      {currentView === 'public' && (
        <footer className="bg-[#03060C] border-t border-white/[0.08] pt-20 pb-12 w-full relative z-10">
          <div className="w-full max-w-[1720px] mx-auto px-4 sm:px-8 xl:px-12 space-y-16">
            {/* Top Priority Allocation / Stock Alerts Banner */}
            <div className="rounded-3xl bg-gradient-to-r from-red-950/50 via-slate-900 to-slate-950 border border-red-500/20 p-8 sm:p-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 shadow-2xl">
              <div className="space-y-2 max-w-xl">
                <span className="text-[11px] font-mono uppercase tracking-widest text-red-400 font-bold flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                  Direct Japan & UK Vehicle Shipments
                </span>
                <h4 className="text-2xl sm:text-3xl font-black text-white font-display">
                  Get Priority Alerts on Incoming Shipments
                </h4>
                <p className="text-xs sm:text-sm text-slate-400 leading-relaxed font-light">
                  Be the first to receive notifications on incoming Land Cruiser 300, Prado, Premio, Vezel, and luxury European consignments arriving at port.
                </p>
              </div>
              <div className="flex w-full lg:w-auto gap-3">
                <input
                  type="email"
                  placeholder="Enter your phone or email..."
                  className="w-full lg:w-72 px-4 py-3.5 rounded-2xl bg-slate-950/90 border border-white/15 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-red-500 font-medium"
                />
                <button className="px-6 py-3.5 rounded-2xl bg-red-600 hover:bg-red-500 text-white font-black text-xs uppercase tracking-wider shrink-0 transition-all shadow-lg shadow-red-600/30">
                  Subscribe
                </button>
              </div>
            </div>

            {/* Multi-Column Dealership Links */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 text-xs text-slate-400">
              <div className="lg:col-span-2 space-y-4 pr-6">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-red-600 via-red-500 to-amber-500 text-white flex items-center justify-center font-display font-black text-xl shadow-lg shadow-red-600/30">
                    AM
                  </div>
                  <div>
                    <span className="font-black text-white uppercase tracking-wider font-display text-lg block leading-none">
                      AURA MOTORS
                    </span>
                    <span className="text-[10px] font-mono uppercase tracking-widest text-red-400 block mt-0.5">
                      (Pvt) Ltd • Automotive Excellence
                    </span>
                  </div>
                </div>
                <p className="text-slate-400 leading-relaxed text-xs max-w-sm font-light">
                  Serving motorists with unmatched trust since 1975. Offering brand new, reconditioned, and pre-owned automobiles, supported by our nationwide service network and guaranteed genuine odometer certification.
                </p>
                <div className="pt-2 flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-[11px] font-mono text-slate-300">
                  <a
                    href={`tel:${showrooms[0]?.phone || '+1 (212) 555-0199'}`}
                    className="flex items-center gap-1.5 text-red-400 hover:underline"
                  >
                    <PhoneCall className="w-3.5 h-3.5 text-red-500 shrink-0" />
                    {showrooms[0]?.phone || '+1 (212) 555-0199'} (Showroom Desk)
                  </a>
                  <span className="hidden sm:inline text-slate-700">•</span>
                  <span>concierge@auramotors.com</span>
                </div>
              </div>

              <div className="space-y-3">
                <h4 className="text-white font-bold uppercase tracking-wider text-xs">
                  Nationwide Showrooms
                </h4>
                <ul className="space-y-2.5 text-slate-400">
                  {(showrooms.length > 0
                    ? showrooms
                    : [
                        { id: 1, name: 'Manhattan Flagship Showroom', city: 'New York, NY', address: "540 W 55th St" },
                        { id: 2, name: 'Los Angeles Beverly Pavilion', city: 'Beverly Hills, CA', address: '9400 Wilshire Blvd' },
                        { id: 3, name: 'Miami Grand Bay Gallery', city: 'Miami, FL', address: '1100 Biscayne Blvd' },
                      ]
                  ).map((s) => (
                    <li
                      key={s.id}
                      onClick={() => {
                        setPublicPage('home');
                        document.getElementById('branches')?.scrollIntoView({ behavior: 'smooth' });
                      }}
                      className="hover:text-red-400 cursor-pointer transition-colors flex items-center justify-between"
                    >
                      <span>{s.city} — {s.name.replace('Showroom', '').replace('Pavilion', '').trim()}</span>
                      <ChevronRight className="w-3 h-3 text-slate-600" />
                    </li>
                  ))}
                </ul>
              </div>

              <div className="space-y-3">
                <h4 className="text-white font-bold uppercase tracking-wider text-xs">
                  Automotive Services
                </h4>
                <ul className="space-y-2.5 text-slate-400">
                  <li
                    onClick={() => {
                      setPublicPage('home');
                      document.getElementById('fast-track')?.scrollIntoView({ behavior: 'smooth' });
                    }}
                    className="hover:text-red-400 cursor-pointer transition-colors"
                  >
                    Aura Fast Track (30-Min Sell)
                  </li>
                  <li
                    onClick={() => {
                      setPublicPage('home');
                      document.getElementById('service-park')?.scrollIntoView({ behavior: 'smooth' });
                    }}
                    className="hover:text-red-400 cursor-pointer transition-colors"
                  >
                    Aura Service Center Diagnostics
                  </li>
                  <li
                    onClick={() => {
                      setPublicPage('home');
                      document.getElementById('leasing')?.scrollIntoView({ behavior: 'smooth' });
                    }}
                    className="hover:text-red-400 cursor-pointer transition-colors"
                  >
                    Bank Leasing & EMI Calculator
                  </li>
                  <li
                    onClick={() => {
                      setPublicPage('home');
                      document.getElementById('service-park')?.scrollIntoView({ behavior: 'smooth' });
                    }}
                    className="hover:text-red-400 cursor-pointer transition-colors"
                  >
                    Genuine OEM Auto Parts
                  </li>
                  <li
                    onClick={() => setPublicPage('showrooms')}
                    className="text-red-400 hover:text-red-300 cursor-pointer font-semibold pt-1 block"
                  >
                    Interactive 3D Showrooms →
                  </li>
                </ul>
              </div>

              <div className="space-y-3">
                <h4 className="text-white font-bold uppercase tracking-wider text-xs">
                  Showroom Timings
                </h4>
                <div className="space-y-2 text-slate-400">
                  <p className="flex justify-between">
                    <span>Mon – Sat:</span>
                    <span className="text-white font-mono font-bold">08:30 – 18:00</span>
                  </p>
                  <p className="flex justify-between">
                    <span>Sunday:</span>
                    <span className="text-white font-mono font-bold">08:30 – 18:00</span>
                  </p>
                  <p className="text-[11px] text-slate-500 pt-2 leading-relaxed">
                    Open 7 days a week across all flagship branches with on-site bank leasing officers.
                  </p>
                </div>
              </div>
            </div>

            {/* Bottom Legal & Telemetry Status Bar */}
            <div className="pt-8 border-t border-white/[0.06] flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-slate-500">
              <p>© {new Date().getFullYear()} Aura Motors (Pvt) Ltd. All Rights Reserved.</p>
              <div className="flex flex-wrap items-center gap-6">
                <span className="hover:text-slate-300 cursor-pointer">Warranty Policy</span>
                <span className="hover:text-slate-300 cursor-pointer">JEVIC Verification</span>
                <span className="hover:text-slate-300 cursor-pointer">Bank Leasing Terms</span>
                <span className="flex items-center gap-1.5 text-emerald-400 font-mono">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  3D Dealership Telemetry: Online
                </span>
              </div>
            </div>
          </div>
        </footer>
      )}
    </div>
  );
}

export default App;