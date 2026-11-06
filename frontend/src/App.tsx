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
  Radio,
  Calendar,
  BarChart3,
  ChevronRight,
  ArrowUpRight,
  Scale,
  Trash2,
  User,
  Monitor,
  Heart,
  CheckCircle2,
  X,
} from 'lucide-react';

const FALLBACK_DOCK_IMG = '/src/assets/images/car_bmw_m4_emerald_1793964978767.jpg';

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
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [newsletterSubscribed, setNewsletterSubscribed] = useState(false);

  const loadInitialData = async () => {
    try {
      setLoading(true);
      const [carsRes, showroomsRes] = await Promise.all([
        api.getCars(),
        api.getShowrooms(),
      ]);
      const loadedCars = carsRes.data;
      setCars(loadedCars);
      setShowrooms(showroomsRes.data);

      // Check URL query parameter ?car=<slug_or_id> for QR code deep-linking
      const params = new URLSearchParams(window.location.search);
      const carParam = params.get('car');
      if (carParam && loadedCars.length > 0) {
        const matched = loadedCars.find(
          (c) => c.slug === carParam || String(c.id) === carParam
        );
        if (matched) {
          setSelectedCar(matched);
          setPublicPage('car-detail');
        }
      }
    } catch (err) {
      console.error('Error loading initial data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadInitialData();

    const handleCarsUpdated = async () => {
      try {
        const carsRes = await api.getCars();
        const updatedCars = carsRes.data;
        setCars(updatedCars);
        setSelectedCar((prev) =>
          prev ? updatedCars.find((c) => c.id === prev.id) || prev : null
        );
      } catch {
        // ignore
      }
    };

    window.addEventListener('aura-cars-updated', handleCarsUpdated);
    return () => window.removeEventListener('aura-cars-updated', handleCarsUpdated);
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
        setToastMessage('Comparison tray supports up to 3 vehicles simultaneously.');
        return prev;
      }
      return [...prev, car];
    });
  };

  const featuredCars = cars.filter((c) => {
    const baseMatch = c.is_featured || cars.indexOf(c) < 6;
    if (activeCategory === 'ALL') return baseMatch;
    if (activeCategory === 'HYBRID / EV' || activeCategory === 'EV / Hybrid' || activeCategory === 'Electric') {
      return (
        (c.fuel || '').toLowerCase().includes('electric') ||
        (c.fuel || '').toLowerCase().includes('hybrid') ||
        (c.model?.body_type || '').toLowerCase() === 'electric'
      );
    }
    if (activeCategory === 'BRAND NEW' || activeCategory === 'New') {
      return c.condition === 'New';
    }
    if (activeCategory === 'RECONDITIONED' || activeCategory === 'Certified Pre-Owned') {
      return c.condition === 'Certified Pre-Owned';
    }
    if (activeCategory === 'Coupe' || activeCategory === 'TRACK') {
      return (c.model?.body_type || '').toLowerCase().includes('coupe');
    }
    if (activeCategory === 'SUV') {
      return (c.model?.body_type || '').toLowerCase().includes('suv');
    }
    if (activeCategory === 'Sedan') {
      return (c.model?.body_type || '').toLowerCase().includes('sedan');
    }
    return baseMatch;
  });

  // ==================== KIOSK MODE (STANDALONE TOUCH DISPLAY) ====================
  if (currentView === 'kiosk') {
    return (
      <div className="relative w-full h-screen bg-[#090B10] overflow-hidden select-none">
        <div className="absolute top-5 right-5 z-50 flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => setCurrentView('public')}
            className="px-4 py-2 rounded-lg bg-[#11151F] text-slate-200 hover:text-white border border-white/[0.15] text-xs font-semibold transition-colors"
          >
            Exit Touch Kiosk
          </button>
        </div>
        <KioskApp />
      </div>
    );
  }

  return (
    <div id="top" className="min-h-screen bg-[#090B10] text-[#F3F4F6] flex flex-col font-sans relative overflow-x-hidden">
      {/* Top Navigation (Strict 3-Zone Top Bar Contract) */}
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

      {/* Secondary Workspace & Client Utility Toolbar (Below Top Header) */}
      <div className="w-full bg-[#0D1017] border-b border-white/[0.06]">
        <div className="w-full max-w-[1440px] mx-auto px-6 lg:px-12 py-2.5 flex flex-wrap items-center justify-between gap-4 text-xs">
          {/* Left: Regional Gallery Status */}
          <div className="flex items-center gap-2 text-slate-400">
            <span>Manhattan Flagship</span>
            <span aria-hidden="true">·</span>
            <span>Beverly Hills Pavilion</span>
            <span aria-hidden="true">·</span>
            <span>Miami Grand Bay</span>
            <span aria-hidden="true" className="hidden sm:inline">·</span>
            <a
              href={`tel:${showrooms[0]?.phone || '+1 (212) 555-0199'}`}
              className="hidden sm:inline font-mono tabular-nums text-slate-300 hover:text-white transition-colors"
            >
              {showrooms[0]?.phone || '+1 (212) 555-0199'}
            </a>
          </div>

          {/* Right: Interactive Workspace Mode Switcher & Client Utilities */}
          <div className="flex items-center gap-3 ml-auto">
            {currentView === 'public' && (
              <>
                <button
                  type="button"
                  onClick={() => setCompareModalOpen(true)}
                  className="flex items-center gap-1.5 text-slate-300 hover:text-white transition-colors whitespace-nowrap shrink-0"
                >
                  <Scale className="w-3.5 h-3.5 text-rose-500" />
                  <span>Compare ({comparedCars.length})</span>
                </button>

                <span aria-hidden="true" className="text-slate-700">·</span>

                <button
                  type="button"
                  onClick={() => {
                    setPublicPage('cars');
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="flex items-center gap-1.5 text-slate-300 hover:text-white transition-colors whitespace-nowrap shrink-0"
                >
                  <Heart className="w-3.5 h-3.5 text-rose-500" />
                  <span>Saved ({favorites.length})</span>
                </button>

                <span aria-hidden="true" className="text-slate-700">·</span>

                <button
                  type="button"
                  onClick={() => setAccountModalOpen(true)}
                  className="flex items-center gap-1.5 text-slate-300 hover:text-white transition-colors whitespace-nowrap shrink-0"
                >
                  <User className="w-3.5 h-3.5 text-slate-400" />
                  <span>Client Portal</span>
                </button>

                <span aria-hidden="true" className="text-slate-700">|</span>
              </>
            )}

            {/* Segmented Mode Switcher */}
            <div className="flex items-center gap-1 p-0.5 rounded-lg bg-[#11151F] border border-white/[0.08]">
              <button
                type="button"
                onClick={() => {
                  setCurrentView('public');
                  setPublicPage('home');
                }}
                className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-colors whitespace-nowrap shrink-0 ${
                  currentView === 'public'
                    ? 'bg-rose-600 text-white'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Showroom Portal
              </button>

              <button
                type="button"
                onClick={() => setCurrentView('kiosk')}
                className="px-2.5 py-1 rounded-md text-[11px] font-medium text-slate-400 hover:text-white transition-colors flex items-center gap-1 whitespace-nowrap shrink-0"
              >
                <Monitor className="w-3 h-3" />
                <span>Touch Kiosk</span>
              </button>

              <button
                type="button"
                onClick={() => setCurrentView('admin')}
                className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-colors whitespace-nowrap shrink-0 ${
                  currentView === 'admin'
                    ? 'bg-rose-600 text-white'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Executive Admin
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Inline Toast Notification */}
      {toastMessage && (
        <div className="fixed top-24 right-6 z-50 p-4 rounded-xl bg-[#11151F] border border-white/[0.15] text-xs text-white flex items-center gap-3 shadow-2xl animate-fade-in-down">
          <span>{toastMessage}</span>
          <button
            type="button"
            onClick={() => setToastMessage(null)}
            className="text-slate-400 hover:text-white"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Main Content Area */}
      <main className="flex-1 relative z-10">
        {currentView === 'public' ? (
          <>
            {publicPage === 'home' && (
              <div className="space-y-24 pb-24">
                {/* 1. Editorial Hero & Search Section */}
                <HeroSection
                  cars={cars}
                  onSearch={(q) => {
                    setSearchQuery(q);
                    setPublicPage('cars');
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  onExplore={() => {
                    setPublicPage('cars');
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                />

                {/* 2. Featured Showroom Inventory Collection */}
                <section id="inventory-fleet" className="w-full max-w-[1440px] mx-auto px-6 lg:px-12 space-y-8">
                  <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 pb-6 border-b border-white/[0.08]">
                    <div className="space-y-1.5">
                      <div className="text-xs text-slate-400">
                        <span>Curated Dealership Fleet</span>
                        <span aria-hidden="true" className="mx-2">·</span>
                        <span>150-Point Certified & 3D Twin Ready</span>
                      </div>
                      <h2 className="text-2xl sm:text-4xl font-bold text-white font-display tracking-tight">
                        Featured Showroom Allocations
                      </h2>
                    </div>

                    {/* Interactive Segmented Category Tabs */}
                    <div className="flex flex-wrap items-center gap-2">
                      <div className="flex items-center gap-1 p-1 rounded-lg bg-[#11151F] border border-white/[0.08] overflow-x-auto no-scrollbar">
                        {[
                          { id: 'ALL', label: 'All Featured' },
                          { id: 'BRAND NEW', label: 'Brand New' },
                          { id: 'RECONDITIONED', label: 'Certified Pre-Owned' },
                          { id: 'HYBRID / EV', label: 'Electric & Hybrid' },
                        ].map((item) => (
                          <button
                            key={item.id}
                            type="button"
                            onClick={() => setActiveCategory(item.id)}
                            className={`px-3.5 py-1.5 rounded-md text-xs font-medium transition-colors whitespace-nowrap shrink-0 ${
                              activeCategory === item.id
                                ? 'bg-rose-600 text-white'
                                : 'text-slate-400 hover:text-white'
                            }`}
                          >
                            {item.label}
                          </button>
                        ))}
                      </div>

                      <button
                        type="button"
                        onClick={() => {
                          setPublicPage('cars');
                          window.scrollTo({ top: 0, behavior: 'smooth' });
                        }}
                        className="px-4 py-2 rounded-lg bg-[#11151F] hover:bg-white/[0.08] border border-white/[0.1] text-xs font-semibold text-white flex items-center gap-1.5 transition-colors whitespace-nowrap shrink-0"
                      >
                        <span>Full Collection ({cars.length})</span>
                        <ArrowUpRight className="w-3.5 h-3.5 text-rose-500" />
                      </button>
                    </div>
                  </div>

                  {loading ? (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      {[1, 2, 3].map((n) => (
                        <div
                          key={n}
                          className="h-[380px] rounded-2xl bg-[#11151F] border border-white/[0.08] p-5 flex flex-col justify-between"
                        >
                          <div className="aspect-[4/3] rounded-xl bg-[#090B10]" />
                          <div className="space-y-2">
                            <div className="h-3 w-1/3 bg-white/[0.06] rounded" />
                            <div className="h-5 w-2/3 bg-white/[0.08] rounded" />
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

                {/* 3. Browse By Body Type */}
                <BrowseByBodyType
                  cars={cars}
                  selectedCategory={activeCategory}
                  onSelectCategory={(cat) => {
                    if (cat === 'all') {
                      setActiveCategory('ALL');
                      setPublicPage('cars');
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    } else {
                      setActiveCategory(cat);
                      document.getElementById('inventory-fleet')?.scrollIntoView({ behavior: 'smooth' });
                    }
                  }}
                />

                {/* 4. The Aura Standard of Ownership */}
                <TheAuraAdvantage
                  onExploreServicePark={() => {
                    document.getElementById('service-park')?.scrollIntoView({ behavior: 'smooth' });
                  }}
                  onExploreFastTrack={() => {
                    document.getElementById('fast-track')?.scrollIntoView({ behavior: 'smooth' });
                  }}
                />

                {/* 5. Aura Fast Track (30-Minute Valuation) */}
                <FastTrackSection />

                {/* 6. Aura Service Center & OEM Parts */}
                <ServiceParkSection />

                {/* 7. Tailored Leasing & Capital Structuring */}
                <BankLeasingSection />

                {/* 8. Flagship Showroom Galleries */}
                <BranchNetworkSection
                  showrooms={showrooms}
                  cars={cars}
                  onExploreFloorMap={() => {
                    setPublicPage('showrooms');
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
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
          /* ==================== EXECUTIVE ADMIN COMMAND CENTER ==================== */
          <div className="flex min-h-[calc(100vh-120px)] bg-[#090B10]">
            <aside className="w-64 bg-[#0D1017] border-r border-white/[0.08] p-6 flex flex-col justify-between shrink-0">
              <div className="space-y-6">
                <div className="space-y-1 pb-4 border-b border-white/[0.08]">
                  <span className="text-xs text-slate-400 block">Dealership Operations</span>
                  <h3 className="text-base font-bold text-white font-display">
                    Executive Management
                  </h3>
                </div>

                <nav className="space-y-1 text-xs font-medium">
                  {[
                    { id: 'dashboard', label: 'Portfolio Analytics', icon: BarChart3 },
                    { id: 'inventory', label: 'Showroom Inventory', icon: CarIcon },
                    { id: 'floors', label: '3D Floor Plan Editor', icon: Layers },
                    { id: 'kiosks', label: 'Showroom Kiosks', icon: Radio },
                    { id: 'sales', label: 'Client Allocations', icon: Calendar },
                  ].map((item) => {
                    const Icon = item.icon;
                    const isActive = adminTab === item.id;
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => setAdminTab(item.id as typeof adminTab)}
                        className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-lg transition-colors ${
                          isActive
                            ? 'bg-rose-600 text-white'
                            : 'text-slate-400 hover:text-white hover:bg-white/[0.04]'
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <Icon className="w-4 h-4" />
                          <span>{item.label}</span>
                        </div>
                        {isActive && <ChevronRight className="w-3.5 h-3.5" />}
                      </button>
                    );
                  })}
                </nav>
              </div>

              <div className="pt-6 border-t border-white/[0.08]">
                <button
                  type="button"
                  onClick={() => setCurrentView('kiosk')}
                  className="w-full py-2.5 px-4 rounded-lg bg-[#11151F] hover:bg-white/[0.08] border border-white/[0.1] text-white text-xs font-semibold flex items-center justify-center gap-2 transition-colors"
                >
                  <Radio className="w-3.5 h-3.5 text-rose-500" />
                  <span>Launch Kiosk Mode</span>
                </button>
              </div>
            </aside>

            <div className="flex-1 bg-[#090B10] overflow-y-auto">
              {adminTab === 'dashboard' && <AdminDashboard />}
              {adminTab === 'inventory' && <AdminInventory />}
              {adminTab === 'floors' && <AdminFloorPlanEditor />}
              {adminTab === 'kiosks' && <AdminKioskManager />}
              {adminTab === 'sales' && <AdminSalesManager />}
            </div>
          </div>
        )}
      </main>

      {/* Floating Comparison Dock */}
      {comparedCars.length > 0 && currentView === 'public' && !compareModalOpen && (
        <div className="fixed bottom-6 right-6 z-40 animate-fade-in-up">
          <div className="p-3.5 rounded-2xl bg-[#11151F]/95 backdrop-blur-xl border border-white/[0.15] shadow-2xl flex items-center gap-4">
            <div className="flex -space-x-2 pl-1">
              {comparedCars.map((c) => (
                <div
                  key={c.id}
                  className="w-10 h-10 rounded-lg overflow-hidden border border-white/20 bg-[#090B10]"
                >
                  <img
                    src={c.images?.[0]?.url || FALLBACK_DOCK_IMG}
                    alt={c.title}
                    referrerPolicy="no-referrer"
                    onError={(e) => {
                      const target = e.currentTarget;
                      if (target.src !== window.location.origin + FALLBACK_DOCK_IMG) {
                        target.src = FALLBACK_DOCK_IMG;
                      }
                    }}
                    className="w-full h-full object-cover"
                  />
                </div>
              ))}
            </div>
            <div className="text-xs pr-2">
              <p className="font-semibold text-white font-mono tabular-nums">
                {comparedCars.length} / 3 Vehicles Selected
              </p>
              <p className="text-[11px] text-slate-400">Side-by-side specification matrix</p>
            </div>
            <button
              type="button"
              onClick={() => setCompareModalOpen(true)}
              className="px-4 py-2 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-semibold text-xs transition-colors whitespace-nowrap shrink-0"
            >
              Compare Specs
            </button>
            <button
              type="button"
              onClick={() => setComparedCars([])}
              aria-label="Clear Comparison"
              className="p-2 rounded-lg hover:bg-white/[0.06] text-slate-400 hover:text-rose-400 transition-colors"
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

      {/* Quiet Architectural Corporate Footer */}
      {currentView === 'public' && (
        <footer className="bg-[#06080C] border-t border-white/[0.08] pt-16 pb-12 w-full relative z-10">
          <div className="w-full max-w-[1440px] mx-auto px-6 lg:px-12 space-y-12">
            {/* Priority Allocation Dispatch */}
            <div className="rounded-2xl bg-[#11151F] border border-white/[0.08] p-8 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
              <div className="space-y-1.5 max-w-xl">
                <span className="text-xs text-slate-400 block">
                  Direct Factory & Consignment Allocations
                </span>
                <h3 className="text-xl sm:text-2xl font-bold text-white font-display">
                  Receive Priority Dossiers on Incoming Vehicles
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Private client alerts for incoming European supercars, certified grand tourers, and rare allocations prior to public gallery listing.
                </p>
              </div>

              {newsletterSubscribed ? (
                <div className="flex items-center gap-2 text-xs text-emerald-400 font-medium">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>Registered for priority allocation dossiers.</span>
                </div>
              ) : (
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (newsletterEmail.trim()) setNewsletterSubscribed(true);
                  }}
                  className="flex w-full lg:w-auto gap-2.5"
                >
                  <input
                    type="email"
                    required
                    value={newsletterEmail}
                    onChange={(e) => setNewsletterEmail(e.target.value)}
                    placeholder="Enter private email address..."
                    className="w-full lg:w-72 px-4 py-2.5 rounded-lg bg-[#090B10] border border-white/[0.1] text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-rose-500"
                  />
                  <button
                    type="submit"
                    className="px-5 py-2.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-semibold text-xs shrink-0 transition-colors whitespace-nowrap"
                  >
                    Subscribe
                  </button>
                </form>
              )}
            </div>

            {/* Footer Navigation Columns */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 text-xs text-slate-400">
              <div className="lg:col-span-2 space-y-3 pr-6">
                <span className="font-bold text-white font-display text-lg block">
                  Aura Motors
                </span>
                <p className="text-slate-400 leading-relaxed text-xs max-w-sm">
                  Curating factory-new and JEVIC-certified automobiles since 1975. Supported by interactive 3D showroom digital twins, OEM diagnostic bays, and Tier-1 private leasing.
                </p>
                <div className="pt-1 flex flex-wrap items-center gap-2 text-xs font-mono tabular-nums text-slate-300">
                  <a
                    href={`tel:${showrooms[0]?.phone || '+1 (212) 555-0199'}`}
                    className="hover:text-white transition-colors"
                  >
                    {showrooms[0]?.phone || '+1 (212) 555-0199'}
                  </a>
                  <span aria-hidden="true" className="text-slate-600">·</span>
                  <span>concierge@auramotors.com</span>
                </div>
              </div>

              <div className="space-y-2.5">
                <h4 className="text-white font-semibold text-xs">
                  Flagship Galleries
                </h4>
                <ul className="space-y-2 text-slate-400">
                  {(showrooms.length > 0
                    ? showrooms
                    : [
                        { id: 1, name: 'Manhattan Flagship', city: 'New York, NY' },
                        { id: 2, name: 'Beverly Pavilion', city: 'Beverly Hills, CA' },
                        { id: 3, name: 'Grand Bay Gallery', city: 'Miami, FL' },
                      ]
                  ).map((s) => (
                    <li key={s.id}>
                      <button
                        type="button"
                        onClick={() => {
                          setPublicPage('showrooms');
                          window.scrollTo({ top: 0, behavior: 'smooth' });
                        }}
                        className="hover:text-white transition-colors text-left"
                      >
                        {s.city} — {s.name}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="space-y-2.5">
                <h4 className="text-white font-semibold text-xs">
                  Client Services
                </h4>
                <ul className="space-y-2 text-slate-400">
                  <li>
                    <button
                      type="button"
                      onClick={() => {
                        setPublicPage('home');
                        setTimeout(() => {
                          document.getElementById('fast-track')?.scrollIntoView({ behavior: 'smooth' });
                        }, 150);
                      }}
                      className="hover:text-white transition-colors"
                    >
                      Fast Track 30-Minute Valuation
                    </button>
                  </li>
                  <li>
                    <button
                      type="button"
                      onClick={() => {
                        setPublicPage('home');
                        setTimeout(() => {
                          document.getElementById('service-park')?.scrollIntoView({ behavior: 'smooth' });
                        }, 150);
                      }}
                      className="hover:text-white transition-colors"
                    >
                      OEM Diagnostic Service Center
                    </button>
                  </li>
                  <li>
                    <button
                      type="button"
                      onClick={() => {
                        setPublicPage('home');
                        setTimeout(() => {
                          document.getElementById('leasing')?.scrollIntoView({ behavior: 'smooth' });
                        }, 150);
                      }}
                      className="hover:text-white transition-colors"
                    >
                      Private Leasing & Amortization
                    </button>
                  </li>
                  <li>
                    <button
                      type="button"
                      onClick={() => {
                        setPublicPage('showrooms');
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }}
                      className="hover:text-white transition-colors"
                    >
                      3D Spatial Showroom Twins
                    </button>
                  </li>
                </ul>
              </div>

              <div className="space-y-2.5">
                <h4 className="text-white font-semibold text-xs">
                  Gallery Hours
                </h4>
                <div className="space-y-1.5 text-slate-400 font-mono tabular-nums">
                  <p className="flex justify-between">
                    <span className="font-sans">Mon – Sat</span>
                    <span className="text-white">09:00 – 20:00</span>
                  </p>
                  <p className="flex justify-between">
                    <span className="font-sans">Sunday</span>
                    <span className="text-white">10:00 – 18:00</span>
                  </p>
                  <p className="font-sans text-[11px] text-slate-500 pt-1 leading-relaxed">
                    Private after-hours gallery viewings available by appointment.
                  </p>
                </div>
              </div>
            </div>

            {/* Quiet Legal Bar */}
            <div className="pt-8 border-t border-white/[0.06] flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
              <p>© {new Date().getFullYear()} Aura Motors Ltd. All rights reserved.</p>
              <div className="flex flex-wrap items-center gap-6">
                <span>ISO 9001:2015 Certified</span>
                <span>JEVIC Provenance Guarantee</span>
                <span>Privacy & Terms</span>
              </div>
            </div>
          </div>
        </footer>
      )}
    </div>
  );
}

export default App;