import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  MapPin,
  Heart,
  Layers,
  User,
  Scale,
  Monitor,
  Menu,
  X,
  PhoneCall,
  Clock,
  Zap,
  ChevronDown,
  ShieldCheck,
  Building2,
  Wrench,
  Percent,
} from 'lucide-react';
import { Showroom } from '../../types';

interface NavbarProps {
  currentView: 'public' | 'kiosk' | 'admin';
  onChangeView: (view: 'public' | 'kiosk' | 'admin') => void;
  publicPage: 'home' | 'cars' | 'showrooms' | 'car-detail';
  onNavigate: (page: 'home' | 'cars' | 'showrooms') => void;
  favoritesCount: number;
  compareCount: number;
  onOpenCompare: () => void;
  onOpenAccount: () => void;
  onFastTrackClick?: () => void;
  showrooms?: Showroom[];
}

export const Navbar: React.FC<NavbarProps> = ({
  currentView,
  onChangeView,
  publicPage,
  onNavigate,
  favoritesCount,
  compareCount,
  onOpenCompare,
  onOpenAccount,
  onFastTrackClick,
  showrooms = [],
}) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);

  const showroomCities =
    showrooms.length > 0
      ? showrooms.map((s) => s.city).join(' • ')
      : 'New York, NY • Beverly Hills, CA • Miami, FL';

  const primaryPhone =
    showrooms[0]?.phone || '+1 (212) 555-0199';

  const primaryHours =
    showrooms[0]?.opening_hours || 'Mon – Sat: 9:00 AM – 8:00 PM';

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
      const totalScroll = document.documentElement.scrollHeight - window.innerHeight;
      if (totalScroll > 0) {
        setScrollProgress((window.scrollY / totalScroll) * 100);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (id: string) => {
    if (publicPage !== 'home') {
      onNavigate('home');
      setTimeout(() => {
        document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
      }, 200);
    } else {
      document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
    }
    setMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-50 transition-all duration-300 w-full">
      {/* Scroll Progress Bar */}
      <div
        className="h-[2px] bg-gradient-to-r from-red-600 via-amber-500 to-red-600 transition-all duration-150 fixed top-0 left-0 right-0 z-50 pointer-events-none"
        style={{ width: `${scrollProgress}%` }}
      />

      {/* Top Corporate Status Micro-Bar (Full Width) */}
      <div className="bg-[#03060C] border-b border-white/[0.08] py-2 px-4 sm:px-8 xl:px-12 text-[11px] text-slate-400 w-full">
        <div className="w-full max-w-[1720px] mx-auto flex flex-col md:flex-row items-center justify-between gap-2">
          {/* Left: Contact Hotline & Working Hours */}
          <div className="flex flex-wrap items-center gap-4 sm:gap-6 text-slate-300">
            <a
              href={`tel:${primaryPhone}`}
              className="flex items-center gap-1.5 text-red-400 hover:text-red-300 font-bold transition-colors"
            >
              <PhoneCall className="w-3.5 h-3.5 text-red-500" />
              <span>Hotline: {primaryPhone}</span>
            </a>

            <span className="text-slate-600 hidden sm:inline">•</span>

            <span className="flex items-center gap-1.5 text-slate-400 hidden sm:flex">
              <Clock className="w-3.5 h-3.5 text-emerald-400" />
              <span>{primaryHours}</span>
            </span>

            <span className="text-slate-600 hidden lg:inline">•</span>

            <span className="text-slate-400 hidden lg:flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-red-400" />
              <span>{showroomCities}</span>
            </span>
          </div>

          {/* Right: Quick Links & Mode Switcher */}
          <div className="flex items-center gap-4">
            <button
              onClick={() => scrollToSection('fast-track')}
              className="text-red-400 hover:text-red-300 font-semibold flex items-center gap-1 text-[11px] transition-colors"
            >
              <Zap className="w-3 h-3 fill-current" />
              <span>Fast Track Valuation</span>
            </button>

            <span className="text-slate-700 hidden sm:inline">|</span>

            {/* Mode Switcher Pills */}
            <div className="flex items-center gap-1 p-0.5 rounded-full bg-slate-900 border border-white/10 shadow-inner">
              <button
                onClick={() => onChangeView('public')}
                className={`px-3 py-1 rounded-full text-[10px] font-bold transition-all flex items-center gap-1.5 ${
                  currentView === 'public'
                    ? 'bg-red-600 text-white shadow-sm shadow-red-600/30'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <span>Public Portal</span>
              </button>

              <button
                onClick={() => onChangeView('kiosk')}
                className={`px-3 py-1 rounded-full text-[10px] font-bold transition-all flex items-center gap-1.5 ${
                  currentView === 'kiosk'
                    ? 'bg-sky-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Monitor className="w-3 h-3" />
                <span>Touch Kiosk</span>
              </button>

              <button
                onClick={() => onChangeView('admin')}
                className={`px-3 py-1 rounded-full text-[10px] font-bold transition-all flex items-center gap-1.5 ${
                  currentView === 'admin'
                    ? 'bg-purple-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Layers className="w-3 h-3" />
                <span>Admin</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Floating Glass Navbar (Full Width) */}
      <div
        className={`w-full transition-all duration-300 px-4 sm:px-8 xl:px-12 ${
          isScrolled
            ? 'bg-slate-950/90 backdrop-blur-xl border-b border-white/[0.08] shadow-2xl shadow-black/60'
            : 'bg-slate-950/70 backdrop-blur-md border-b border-white/[0.04]'
        }`}
      >
        <div className="w-full max-w-[1720px] mx-auto h-20 flex items-center justify-between">
          {/* Brand Logo - AURA MOTORS */}
          <div
            onClick={() => {
              onNavigate('home');
              setMobileMenuOpen(false);
            }}
            className="flex items-center gap-3.5 cursor-pointer select-none group"
          >
            <div className="relative">
              <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-red-600 via-red-500 to-amber-500 flex items-center justify-center text-white shadow-lg shadow-red-600/30 group-hover:scale-105 group-hover:shadow-red-600/50 transition-all duration-300 font-display font-black text-xl">
                AM
              </div>
              <div className="absolute -inset-1 rounded-2xl bg-red-500/20 blur-sm -z-10 group-hover:opacity-100 opacity-0 transition-opacity" />
            </div>

            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xl sm:text-2xl font-black tracking-wider text-white uppercase font-display leading-none">
                  AURA
                </span>
                <span className="text-xl sm:text-2xl font-black tracking-wider text-red-500 uppercase font-display leading-none">
                  MOTORS
                </span>
              </div>
              <span className="text-[10px] tracking-wider uppercase font-semibold text-slate-400 block mt-0.5">
                Luxury & Performance Network • Est. 1975
              </span>
            </div>
          </div>

          {/* Desktop Navigation Links */}
          {currentView === 'public' && (
            <nav className="hidden xl:flex items-center gap-1 bg-slate-900/60 p-1.5 rounded-full border border-white/[0.06] backdrop-blur-md text-xs font-bold uppercase tracking-wider">
              {/* Home */}
              <button
                onClick={() => onNavigate('home')}
                className={`px-4 py-2 rounded-full transition-all ${
                  publicPage === 'home'
                    ? 'text-white bg-white/10 shadow-sm'
                    : 'text-slate-300 hover:text-white hover:bg-white/[0.04]'
                }`}
              >
                Home
              </button>

              {/* Vehicles Inventory */}
              <button
                onClick={() => onNavigate('cars')}
                className={`px-4 py-2 rounded-full transition-all flex items-center gap-1 ${
                  publicPage === 'cars' || publicPage === 'car-detail'
                    ? 'text-white bg-white/10 shadow-sm'
                    : 'text-slate-300 hover:text-white hover:bg-white/[0.04]'
                }`}
              >
                <span>Vehicles</span>
              </button>

              {/* Fast Track */}
              <button
                onClick={() => scrollToSection('fast-track')}
                className="px-4 py-2 rounded-full text-slate-300 hover:text-red-400 hover:bg-white/[0.04] transition-all flex items-center gap-1"
              >
                <Zap className="w-3.5 h-3.5 text-red-500" />
                <span>Fast Track</span>
              </button>

              {/* Service Park */}
              <button
                onClick={() => scrollToSection('service-park')}
                className="px-4 py-2 rounded-full text-slate-300 hover:text-white hover:bg-white/[0.04] transition-all flex items-center gap-1"
              >
                <Wrench className="w-3.5 h-3.5 text-slate-400" />
                <span>Service Park</span>
              </button>

              {/* Leasing */}
              <button
                onClick={() => scrollToSection('leasing')}
                className="px-4 py-2 rounded-full text-slate-300 hover:text-white hover:bg-white/[0.04] transition-all"
              >
                <span>Leasing</span>
              </button>

              {/* 3D Showrooms / Branches */}
              <button
                onClick={() => onNavigate('showrooms')}
                className={`px-4 py-2 rounded-full transition-all flex items-center gap-1 ${
                  publicPage === 'showrooms'
                    ? 'text-white bg-white/10 shadow-sm'
                    : 'text-slate-300 hover:text-white hover:bg-white/[0.04]'
                }`}
              >
                <MapPin className="w-3.5 h-3.5 text-emerald-400" />
                <span>Branches & 3D</span>
              </button>
            </nav>
          )}

          {/* Right Action Icons & Sell Car Button */}
          <div className="flex items-center gap-2.5">
            {/* Signature "Sell Your Car / Fast Track" CTA Button */}
            {currentView === 'public' && (
              <button
                onClick={() => {
                  if (onFastTrackClick) {
                    onFastTrackClick();
                  } else {
                    scrollToSection('fast-track');
                  }
                }}
                className="hidden sm:flex items-center gap-1.5 px-4 py-2.5 rounded-2xl bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white text-xs font-black uppercase tracking-wider shadow-lg shadow-red-600/30 transition-all hover:scale-105 active:scale-95 group"
              >
                <Zap className="w-3.5 h-3.5 fill-current animate-pulse text-amber-300" />
                <span>Sell Your Car</span>
              </button>
            )}

            {/* Compare Vehicles Button */}
            {currentView === 'public' && (
              <button
                onClick={onOpenCompare}
                className="relative p-2.5 rounded-2xl bg-slate-900/80 border border-white/[0.08] hover:border-red-500/40 text-slate-300 hover:text-white transition-all shadow-sm hover:scale-105 active:scale-95"
                title="Compare Vehicles"
              >
                <Scale className="w-4 h-4" />
                {compareCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-red-600 text-white text-[10px] font-black flex items-center justify-center animate-bounce shadow-md">
                    {compareCount}
                  </span>
                )}
              </button>
            )}

            {/* Favorites Counter Badge */}
            {currentView === 'public' && favoritesCount > 0 && (
              <div
                className="hidden sm:flex items-center gap-1.5 px-3 py-2 rounded-2xl bg-red-600/10 border border-red-500/30 text-red-400 text-xs font-bold"
                title={`${favoritesCount} vehicles saved`}
              >
                <Heart className="w-3.5 h-3.5 fill-current" />
                <span>{favoritesCount}</span>
              </div>
            )}

            {/* VIP Concierge Account Button */}
            <button
              onClick={onOpenAccount}
              className="flex items-center gap-2 px-3.5 py-2.5 rounded-2xl bg-slate-900/80 hover:bg-slate-800 border border-white/10 hover:border-red-500/40 text-slate-200 text-xs font-bold transition-all shadow-md group"
            >
              <div className="w-5 h-5 rounded-full bg-red-600/20 text-red-400 flex items-center justify-center">
                <User className="w-3 h-3" />
              </div>
              <span className="hidden md:inline">Account</span>
            </button>

            {/* Mobile Hamburger Menu */}
            {currentView === 'public' && (
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2.5 rounded-2xl bg-slate-900 border border-white/10 text-slate-300 hover:text-white xl:hidden"
              >
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            )}
          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        {mobileMenuOpen && currentView === 'public' && (
          <div className="xl:hidden px-4 py-4 bg-slate-950 border-b border-white/10 space-y-2 animate-fade-in-down text-xs font-bold uppercase tracking-wider">
            <button
              onClick={() => {
                onNavigate('home');
                setMobileMenuOpen(false);
              }}
              className={`w-full text-left px-4 py-3 rounded-xl ${
                publicPage === 'home' ? 'bg-red-600 text-white font-black' : 'text-slate-300 hover:bg-slate-900'
              }`}
            >
              Home
            </button>

            <button
              onClick={() => {
                onNavigate('cars');
                setMobileMenuOpen(false);
              }}
              className={`w-full text-left px-4 py-3 rounded-xl ${
                publicPage === 'cars' ? 'bg-red-600 text-white font-black' : 'text-slate-300 hover:bg-slate-900'
              }`}
            >
              Vehicles Inventory
            </button>

            <button
              onClick={() => scrollToSection('fast-track')}
              className="w-full text-left px-4 py-3 rounded-xl text-red-400 hover:bg-slate-900 flex items-center gap-2"
            >
              <Zap className="w-4 h-4" />
              <span>Aura Fast Track (Sell / Trade-in)</span>
            </button>

            <button
              onClick={() => scrollToSection('service-park')}
              className="w-full text-left px-4 py-3 rounded-xl text-slate-300 hover:bg-slate-900 flex items-center gap-2"
            >
              <Wrench className="w-4 h-4" />
              <span>Aura Service Park & Parts</span>
            </button>

            <button
              onClick={() => scrollToSection('leasing')}
              className="w-full text-left px-4 py-3 rounded-xl text-slate-300 hover:bg-slate-900 flex items-center gap-2"
            >
              <Percent className="w-4 h-4" />
              <span>Easy Leasing Calculator</span>
            </button>

            <button
              onClick={() => {
                onNavigate('showrooms');
                setMobileMenuOpen(false);
              }}
              className={`w-full text-left px-4 py-3 rounded-xl ${
                publicPage === 'showrooms' ? 'bg-red-600 text-white font-black' : 'text-slate-300 hover:bg-slate-900'
              }`}
            >
              Branch Network & 3D Showrooms
            </button>

            <div className="pt-2 border-t border-white/10">
              <a
                href="tel:+94777874422"
                className="w-full py-3 px-4 rounded-xl bg-red-600/20 text-red-400 font-bold flex items-center justify-center gap-2"
              >
                <PhoneCall className="w-4 h-4" />
                <span>Call Hotline: +94 77 787 4422</span>
              </a>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};
