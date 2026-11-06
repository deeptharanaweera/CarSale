import React from 'react';
import {
  ShieldCheck,
  Award,
  Zap,
  Wrench,
  CheckCircle2,
  Clock,
  MapPin,
  Headphones,
  ArrowRight,
} from 'lucide-react';

interface TheAuraAdvantageProps {
  onExploreServicePark?: () => void;
  onExploreFastTrack?: () => void;
}

export const TheAuraAdvantage: React.FC<TheAuraAdvantageProps> = ({
  onExploreServicePark,
  onExploreFastTrack,
}) => {
  const pillars = [
    {
      icon: <Award className="w-7 h-7 text-red-500" />,
      badge: 'JEVIC & EXPORT CERTIFIED',
      title: '100% Guaranteed Genuine Mileage',
      description:
        'Every vehicle in our collection is backed by original Japanese and European auction inspection sheets and third-party JEVIC certification. Zero odometer rollbacks guaranteed.',
      highlight: 'Original Auction Sheet Included',
    },
    {
      icon: <ShieldCheck className="w-7 h-7 text-emerald-400" />,
      badge: 'UNRIVALED PROTECTION',
      title: 'Comprehensive In-House Warranty',
      description:
        'Enjoy worry-free ownership with up to 3 Years / 100,000 km bumper-to-bumper and hybrid system warranty, honored across our nationwide service network.',
      highlight: 'Free Periodic Services Included',
    },
    {
      icon: <Zap className="w-7 h-7 text-amber-400" />,
      badge: 'FAST TRACK TRADE-IN',
      title: 'Sell or Upgrade in 30 Minutes',
      description:
        'Need to sell your existing car or trade in for an upgrade? Our Fast Track system conducts a 15-minute diagnostic evaluation and offers the highest guaranteed market valuation.',
      highlight: 'Instant Bank Wire Payout',
      action: onExploreFastTrack,
      actionText: 'Fast Track Valuation →',
    },
    {
      icon: <Wrench className="w-7 h-7 text-sky-400" />,
      badge: 'AFTER-SALES MASTERY',
      title: 'State-of-the-Art Service Center',
      description:
        'Equipped with OEM computerized diagnostic scanners, high-voltage EV battery balancing, 3D laser wheel alignment, and 100% genuine Japanese & European spare parts.',
      highlight: '24/7 Island-Wide Breakdown Rescue',
      action: onExploreServicePark,
      actionText: 'Discover Service Center →',
    },
  ];

  return (
    <section className="w-full max-w-[1720px] mx-auto px-4 sm:px-8 xl:px-12 space-y-12">
      {/* Section Header */}
      <div className="text-center max-w-3xl mx-auto space-y-3">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-red-600/10 border border-red-500/30 text-red-400 text-xs font-mono uppercase tracking-widest">
          <Award className="w-3.5 h-3.5 text-red-500" />
          The Gold Standard in Automotive Retail
        </div>
        <h2 className="text-3xl sm:text-5xl font-black text-white font-display uppercase tracking-tight">
          The Aura Advantage
        </h2>
        <p className="text-slate-400 text-sm sm:text-base font-light leading-relaxed">
          Over 50 years of uncompromising integrity, premium automobile provenance, and dedicated customer care. Here is why discerning drivers choose our dealership.
        </p>
      </div>

      {/* 4 Trust Pillars Bento Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {pillars.map((pillar, idx) => (
          <div
            key={idx}
            className="rounded-3xl bg-slate-900/60 hover:bg-slate-900/90 border border-white/[0.08] hover:border-red-500/40 p-6 sm:p-8 flex flex-col justify-between transition-all duration-300 card-hover-lift group relative overflow-hidden shadow-lg"
          >
            {/* Ambient Background Gradient */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-red-600/5 group-hover:bg-red-600/15 rounded-full blur-2xl transition-all pointer-events-none" />

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="w-14 h-14 rounded-2xl bg-slate-950 border border-white/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                  {pillar.icon}
                </div>
                <span className="text-2xl font-black font-mono text-white/15 group-hover:text-red-500/30 transition-colors">
                  0{idx + 1}
                </span>
              </div>

              <div>
                <span className="text-[10px] font-mono uppercase tracking-widest text-red-400 font-bold block mb-1">
                  {pillar.badge}
                </span>
                <h3 className="text-xl font-bold text-white font-display">
                  {pillar.title}
                </h3>
              </div>

              <p className="text-xs sm:text-sm text-slate-400 leading-relaxed font-light">
                {pillar.description}
              </p>
            </div>

            <div className="mt-6 pt-4 border-t border-white/[0.06] space-y-2">
              <div className="flex items-center gap-2 text-xs text-emerald-400 font-medium">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>{pillar.highlight}</span>
              </div>

              {pillar.action && (
                <button
                  onClick={pillar.action}
                  className="text-xs font-bold text-red-400 hover:text-red-300 flex items-center gap-1 pt-1 transition-colors group-hover:translate-x-1"
                >
                  {pillar.actionText}
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Quick Trust Credentials Banner */}
      <div className="rounded-3xl bg-gradient-to-r from-red-950/40 via-slate-900 to-slate-950 border border-red-500/20 p-6 sm:p-8 flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-red-600 text-white flex items-center justify-center shrink-0 shadow-lg shadow-red-600/30 font-display font-black text-xl">
            50+
          </div>
          <div>
            <h4 className="text-white font-bold text-base font-display">
              Celebrating Half a Century of Automobile Excellence
            </h4>
            <p className="text-xs text-slate-400">
              Founded in 1975 • Over 45,000+ satisfied clients across Sri Lanka and worldwide
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-6 text-xs text-slate-300 font-mono">
          <span className="flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            ISO 9001:2015 Certified
          </span>
          <span className="flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            JEVIC Approved Importer
          </span>
          <span className="flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            Approved Bank Leasing Facilities
          </span>
        </div>
      </div>
    </section>
  );
};

