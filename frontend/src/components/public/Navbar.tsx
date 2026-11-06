import React, { useState } from 'react';
import { Menu, X } from 'lucide-react';
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
  onFastTrackClick,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const scrollToSection = (id: string) => {
    if (currentView !== 'public') {
      onChangeView('public');
    }
    if (publicPage !== 'home') {
      onNavigate('home');
      setTimeout(() => {
        document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
      }, 180);
    } else {
      document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
    }
    setMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-50 w-full bg-[#090B10]/90 backdrop-blur-xl border-b border-white/[0.08]">
      <div className="w-full max-w-[1440px] mx-auto px-6 lg:px-12 h-20 flex items-center justify-between gap-8">
        {/* Zone 1: Single text element wordmark */}
        <a
          href="#top"
          onClick={(e) => {
            e.preventDefault();
            if (currentView !== 'public') onChangeView('public');
            onNavigate('home');
            setMobileMenuOpen(false);
          }}
          className="text-xl font-bold tracking-tight text-white font-display whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-500 rounded"
        >
          Aura Motors
        </a>

        {/* Zone 2: 5 concise single-line text navigation links */}
        <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-300">
          <button
            type="button"
            onClick={() => {
              if (currentView !== 'public') onChangeView('public');
              onNavigate('cars');
            }}
            className={`py-1 transition-colors whitespace-nowrap shrink-0 border-b-2 ${
              currentView === 'public' && (publicPage === 'cars' || publicPage === 'car-detail')
                ? 'text-white border-rose-500'
                : 'border-transparent hover:text-white hover:border-white/40'
            }`}
          >
            Inventory
          </button>

          <button
            type="button"
            onClick={() => scrollToSection('fast-track')}
            className="py-1 border-b-2 border-transparent hover:text-white hover:border-white/40 transition-colors whitespace-nowrap shrink-0"
          >
            Fast Track
          </button>

          <button
            type="button"
            onClick={() => scrollToSection('service-park')}
            className="py-1 border-b-2 border-transparent hover:text-white hover:border-white/40 transition-colors whitespace-nowrap shrink-0"
          >
            Service Center
          </button>

          <button
            type="button"
            onClick={() => scrollToSection('leasing')}
            className="py-1 border-b-2 border-transparent hover:text-white hover:border-white/40 transition-colors whitespace-nowrap shrink-0"
          >
            Leasing
          </button>

          <button
            type="button"
            onClick={() => {
              if (currentView !== 'public') onChangeView('public');
              onNavigate('showrooms');
            }}
            className={`py-1 transition-colors whitespace-nowrap shrink-0 border-b-2 ${
              currentView === 'public' && publicPage === 'showrooms'
                ? 'text-white border-rose-500'
                : 'border-transparent hover:text-white hover:border-white/40'
            }`}
          >
            Showrooms
          </button>
        </nav>

        {/* Zone 3: 1 primary action */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            type="button"
            onClick={() => {
              if (onFastTrackClick) {
                onFastTrackClick();
              } else {
                scrollToSection('fast-track');
              }
            }}
            className="px-4 py-2 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-500 rounded-lg transition-colors whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-400"
          >
            Sell Your Car
          </button>

          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle Menu"
            className="p-2 rounded-lg text-slate-300 hover:text-white hover:bg-white/[0.06] md:hidden"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden px-6 py-4 bg-[#0D1017] border-b border-white/[0.08] space-y-2 text-sm font-medium">
          <button
            type="button"
            onClick={() => {
              if (currentView !== 'public') onChangeView('public');
              onNavigate('home');
              setMobileMenuOpen(false);
            }}
            className="w-full text-left py-2.5 text-slate-200 hover:text-white border-b border-white/[0.06]"
          >
            Home
          </button>
          <button
            type="button"
            onClick={() => {
              if (currentView !== 'public') onChangeView('public');
              onNavigate('cars');
              setMobileMenuOpen(false);
            }}
            className="w-full text-left py-2.5 text-slate-200 hover:text-white border-b border-white/[0.06]"
          >
            Inventory
          </button>
          <button
            type="button"
            onClick={() => scrollToSection('fast-track')}
            className="w-full text-left py-2.5 text-slate-200 hover:text-white border-b border-white/[0.06]"
          >
            Fast Track Valuation
          </button>
          <button
            type="button"
            onClick={() => scrollToSection('service-park')}
            className="w-full text-left py-2.5 text-slate-200 hover:text-white border-b border-white/[0.06]"
          >
            Service Center
          </button>
          <button
            type="button"
            onClick={() => scrollToSection('leasing')}
            className="w-full text-left py-2.5 text-slate-200 hover:text-white border-b border-white/[0.06]"
          >
            Leasing
          </button>
          <button
            type="button"
            onClick={() => {
              if (currentView !== 'public') onChangeView('public');
              onNavigate('showrooms');
              setMobileMenuOpen(false);
            }}
            className="w-full text-left py-2.5 text-slate-200 hover:text-white"
          >
            Showrooms
          </button>
        </div>
      )}
    </header>
  );
};
