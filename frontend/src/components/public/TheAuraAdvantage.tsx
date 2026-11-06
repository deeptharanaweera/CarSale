import React from 'react';
import { ArrowRight } from 'lucide-react';

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
      index: '01',
      kicker: 'JEVIC & Export Certified',
      title: '01. Guaranteed Genuine Mileage',
      description:
        'Every vehicle in our collection is backed by original Japanese and European auction inspection dossiers and independent JEVIC odometer verification.',
      proof: '100% Original Auction Dossier Included',
    },
    {
      index: '02',
      kicker: 'Factory-Grade Coverage',
      title: '02. Comprehensive 3-Year Warranty',
      description:
        'Ownership protected by up to 3 Years or 100,000 km bumper-to-bumper powertrain and high-voltage hybrid battery warranty across our branch network.',
      proof: '3 Years / 100,000 km Powertrain Protection',
    },
    {
      index: '03',
      kicker: 'Rapid Liquidity & Trade-In',
      title: '03. Fast Track 30-Minute Valuation',
      description:
        'Our diagnostic bays evaluate your current vehicle in 15 minutes and issue a guaranteed market buyback or direct trade-in credit on the same day.',
      proof: 'Same-Day Wire Settlement Available',
      action: onExploreFastTrack,
      actionText: 'Launch Valuation Calculator',
    },
    {
      index: '04',
      kicker: 'Master Engineering Bays',
      title: '04. OEM Diagnostic Service Center',
      description:
        'Equipped with factory telemetry scanners, high-voltage EV cell balancing rigs, 3D laser alignment, and direct-import OEM replacement components.',
      proof: '24/7 Nationwide Roadside Recovery',
      action: onExploreServicePark,
      actionText: 'Explore Service Capabilities',
    },
  ];

  return (
    <section className="w-full max-w-[1440px] mx-auto px-6 lg:px-12 space-y-10">
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 pb-6 border-b border-white/[0.08]">
        <div className="space-y-1.5 max-w-2xl">
          <div className="text-xs text-slate-400">
            <span>Institutional Standards</span>
            <span aria-hidden="true" className="mx-2">·</span>
            <span>Established 1975</span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-bold text-white font-display tracking-tight">
            The Aura Standard of Ownership
          </h2>
        </div>
        <p className="text-sm text-slate-400 max-w-md leading-relaxed">
          Five decades of transparent automotive provenance, certified telemetry inspections, and dedicated after-sales engineering.
        </p>
      </div>

      {/* Asymmetric Bento Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {pillars.map((pillar) => (
          <div
            key={pillar.index}
            className="rounded-2xl bg-[#11151F] border border-white/[0.08] p-8 flex flex-col justify-between space-y-6"
          >
            <div className="space-y-3">
              <div className="text-xs text-slate-400 font-medium">
                <span>{pillar.kicker}</span>
              </div>
              <h3 className="text-xl font-semibold text-white font-display">
                {pillar.title}
              </h3>
              <p className="text-sm text-slate-300 leading-relaxed max-w-[65ch]">
                {pillar.description}
              </p>
            </div>

            <div className="pt-5 border-t border-white/[0.08] flex flex-wrap items-center justify-between gap-4">
              <span className="text-xs font-mono tabular-nums text-slate-400">
                {pillar.proof}
              </span>

              {pillar.action && (
                <button
                  type="button"
                  onClick={pillar.action}
                  className="text-xs font-semibold text-rose-400 hover:text-rose-300 flex items-center gap-1.5 transition-colors whitespace-nowrap shrink-0"
                >
                  <span>{pillar.actionText}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Claim-to-Proof Adjacency Strip */}
      <div className="rounded-2xl bg-[#11151F] border border-white/[0.08] p-6 sm:p-8 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div className="space-y-1">
          <h3 className="text-base font-semibold text-white font-display">
            45,000+ Vehicles Delivered Since 1975
          </h3>
          <p className="text-xs text-slate-400">
            Audited under ISO 9001:2015 quality management with direct importation from Japan, Germany, and the United Kingdom.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 text-xs text-slate-300 font-mono tabular-nums">
          <span>ISO 9001:2015 Certified</span>
          <span aria-hidden="true" className="text-slate-600">·</span>
          <span>JEVIC Approved Importer</span>
          <span aria-hidden="true" className="text-slate-600">·</span>
          <span>Tier-1 Bank Leasing Partner</span>
        </div>
      </div>
    </section>
  );
};
