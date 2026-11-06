import React, { useState } from 'react';
import {
  Wrench,
  Cpu,
  Zap,
  ShieldCheck,
  PhoneCall,
  CheckCircle2,
  Clock,
  Sparkles,
  ArrowRight,
  MapPin,
  Calendar,
} from 'lucide-react';

export const ServiceParkSection: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'diagnostics' | 'hybrid' | 'alignment' | 'parts'>('diagnostics');

  const services = [
    {
      id: 'diagnostics',
      title: 'Computerized EFI Diagnostics',
      badge: 'OEM Level Scanners',
      desc: 'Factory-grade diagnostic scanners for Toyota, Mercedes-Benz, BMW, Porsche, Honda, and Nissan. Identifies sensor faults, ECU errors, and performance calibration.',
      points: [
        'Real-time live telemetry data logging',
        'ECU software updates & coding',
        'Fuel injection & emission calibration',
      ],
      icon: <Cpu className="w-6 h-6 text-red-500" />,
    },
    {
      id: 'hybrid',
      title: 'Hybrid & EV Battery Care',
      badge: 'High-Voltage Certified',
      desc: 'Specialized testing and conditioning of lithium-ion and NiMH hybrid battery cells. Individual cell voltage balancing and inverter cooling system maintenance.',
      points: [
        'Cell capacity & internal resistance reports',
        'High-voltage inverter circuit checks',
        'Cooling fan filter service & cleaning',
      ],
      icon: <Zap className="w-6 h-6 text-emerald-400" />,
    },
    {
      id: 'alignment',
      title: '3D Laser Wheel Alignment',
      badge: 'Sub-Millimeter Precision',
      desc: 'Ultra-accurate multi-camera 3D laser alignment and computerized high-speed wheel balancing. Extends tire life and guarantees high-speed stability.',
      points: [
        'Camber, caster, and toe-in laser calibration',
        'Suspension bushing & ball joint inspection',
        'High-speed vibration diagnostics',
      ],
      icon: <Wrench className="w-6 h-6 text-sky-400" />,
    },
    {
      id: 'parts',
      title: '100% Genuine Auto Parts',
      badge: 'Direct Japan & Europe Imports',
      desc: 'Comprehensive inventory of genuine OEM replacement components, brake pads, filters, suspension arms, hybrid pumps, and manufacturer-approved synthetic fluids.',
      points: [
        'Direct OEM Japanese & European parts supply',
        'Warranty on all installed components',
        'Genuine Mobil & Motul synthetic lubricants',
      ],
      icon: <ShieldCheck className="w-6 h-6 text-amber-400" />,
    },
  ];

  const currentService = services.find((s) => s.id === activeTab) || services[0];

  return (
    <section id="service-park" className="w-full max-w-[1720px] mx-auto px-4 sm:px-8 xl:px-12 space-y-10">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 pb-6 border-b border-white/10">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-600/10 border border-red-500/20 text-red-400 text-xs font-mono uppercase tracking-widest font-bold">
            <Wrench className="w-3.5 h-3.5 text-red-500" />
            Nationwide After-Sales Support
          </div>
          <h2 className="text-3xl sm:text-5xl font-black text-white font-display uppercase tracking-tight">
            Aura Service Center & Parts
          </h2>
          <p className="text-slate-400 text-sm max-w-xl font-light">
            Advanced multi-bay automotive service centers. Factory trained master engineers, OEM diagnostic equipment, and genuine spare parts under one roof.
          </p>
        </div>

        {/* 24/7 Breakdown Hotline CTA */}
        <div className="p-4 rounded-2xl bg-gradient-to-r from-red-950/60 to-slate-900 border border-red-500/30 flex items-center gap-4 shrink-0 shadow-lg">
          <div className="w-12 h-12 rounded-xl bg-red-600 text-white flex items-center justify-center shrink-0 shadow-lg shadow-red-600/30">
            <PhoneCall className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <span className="text-[10px] font-mono uppercase text-red-400 font-bold block">
              24/7 Emergency Breakdown Rescue
            </span>
            <a
              href="tel:+94777874422"
              className="text-lg font-black text-white hover:text-red-400 font-mono transition-colors"
            >
              +94 77 787 4422
            </a>
          </div>
        </div>
      </div>

      {/* Interactive Service Bay Tabs & Showcase */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        {/* Left: Tab Selectors */}
        <div className="lg:col-span-5 space-y-3">
          {services.map((srv) => {
            const isActive = activeTab === srv.id;
            return (
              <button
                key={srv.id}
                onClick={() => setActiveTab(srv.id as typeof activeTab)}
                className={`w-full p-5 rounded-2xl text-left flex items-start gap-4 transition-all duration-300 ${
                  isActive
                    ? 'bg-slate-900 border-2 border-red-500 shadow-xl shadow-red-600/20 translate-x-2'
                    : 'bg-slate-950/60 hover:bg-slate-900/80 border border-white/[0.08] hover:border-white/20'
                }`}
              >
                <div
                  className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 transition-colors ${
                    isActive ? 'bg-red-600 text-white' : 'bg-slate-900 text-slate-400'
                  }`}
                >
                  {srv.icon}
                </div>

                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h3 className="text-base font-bold text-white font-display">
                      {srv.title}
                    </h3>
                    {isActive && <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />}
                  </div>
                  <span className="text-[11px] font-mono text-red-400 font-semibold block mt-0.5">
                    {srv.badge}
                  </span>
                  <p className="text-xs text-slate-400 mt-1 line-clamp-1">
                    {srv.desc}
                  </p>
                </div>
              </button>
            );
          })}
        </div>

        {/* Right: Detailed Feature Display Card */}
        <div className="lg:col-span-7">
          <div className="rounded-3xl bg-slate-900/90 border border-white/10 p-8 sm:p-10 relative overflow-hidden backdrop-blur-2xl shadow-2xl flex flex-col justify-between space-y-8">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="px-3.5 py-1.5 rounded-full text-xs font-mono uppercase tracking-widest bg-red-600/15 text-red-400 border border-red-500/30 font-bold">
                  {currentService.badge}
                </span>
                <span className="text-xs font-mono text-slate-400 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-emerald-400" />
                  Same-Day Turnaround Available
                </span>
              </div>

              <h3 className="text-2xl sm:text-3xl font-black text-white font-display">
                {currentService.title}
              </h3>

              <p className="text-sm text-slate-300 leading-relaxed font-light">
                {currentService.desc}
              </p>

              <div className="pt-4 space-y-2.5">
                {currentService.points.map((pt, i) => (
                  <div key={i} className="flex items-center gap-3 text-xs sm:text-sm text-slate-200">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>{pt}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="pt-6 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3 text-xs text-slate-400">
                <MapPin className="w-4 h-4 text-red-400" />
                <span>Available across all regional service bays</span>
              </div>

              <button
                onClick={() => {
                  const text = encodeURIComponent(
                    `Hello Service Center, I would like to book a service appointment for "${currentService.title}". Please let me know available slots.`
                  );
                  window.open(`https://wa.me/94777874422?text=${text}`, '_blank');
                }}
                className="w-full sm:w-auto px-6 py-3 rounded-xl bg-red-600 hover:bg-red-500 text-white font-black text-xs uppercase tracking-wider transition-all shadow-lg shadow-red-600/30 flex items-center justify-center gap-2 active:scale-95"
              >
                <span>Book Service Appointment</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

