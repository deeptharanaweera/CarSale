import React, { useState } from 'react';
import { CheckCircle2, ArrowRight } from 'lucide-react';

export const ServiceParkSection: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'diagnostics' | 'hybrid' | 'alignment' | 'parts'>('diagnostics');
  const [bookedService, setBookedService] = useState<string | null>(null);

  const services = [
    {
      id: 'diagnostics',
      index: '01',
      title: 'Computerized OEM Telemetry Diagnostics',
      kicker: 'Factory-Level ECU Interrogation',
      desc: 'Equipped with Porsche PIWIS, Mercedes XENTRY, BMW ISTA, and Lamborghini ODIS diagnostic suites for full module interrogation, fault tracing, and calibration.',
      metrics: 'Sub-millisecond CAN-bus logging · Full ECU firmware coding · Dyno health verification',
      turnaround: '90-Minute Diagnostic Protocol',
    },
    {
      id: 'hybrid',
      index: '02',
      title: 'High-Voltage EV & Hybrid Battery Conditioning',
      kicker: '800V & 400V Certified Engineering Bays',
      desc: 'Individual lithium-ion cell voltage balancing, internal resistance mapping, thermal inverter servicing, and state-of-health (SoH) certification.',
      metrics: 'Cell-level impedance testing · Dielectric coolant flush · High-voltage interlock audit',
      turnaround: 'Same-Day High-Voltage Service',
    },
    {
      id: 'alignment',
      index: '03',
      title: '3D Optical Laser Suspension Geometry',
      kicker: 'Sub-Millimeter Track & Street Setup',
      desc: 'Multi-camera 3D laser alignment and road-force wheel balancing calibrated for carbon-ceramic brake assemblies, center-lock hubs, and active air suspension.',
      metrics: '0.01° camber/caster precision · Corner-weight scaling · Active ride-height calibration',
      turnaround: '60-Minute Geometry Session',
    },
    {
      id: 'parts',
      index: '04',
      title: 'Direct-Import Genuine OEM Components',
      kicker: 'Stuttgart, Sant’Agata, Munich & Tokyo Supply Chain',
      desc: 'Bonded warehouse inventory of factory-sealed brake rotors, air suspension struts, dual-clutch mechatronics, and manufacturer-specified ester lubricants.',
      metrics: '100% VIN-matched serial numbers · 24-month parts warranty · Express air-freight desk',
      turnaround: 'Immediate Bay Dispatch',
    },
  ];

  const currentService = services.find((s) => s.id === activeTab) || services[0];

  return (
    <section id="service-park" className="w-full max-w-[1440px] mx-auto px-6 lg:px-12 space-y-10">
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 pb-6 border-b border-white/[0.08]">
        <div className="space-y-1.5">
          <div className="text-xs text-slate-400">
            <span>After-Sales Engineering</span>
            <span aria-hidden="true" className="mx-2">·</span>
            <span>Master Technician Bays</span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-bold text-white font-display tracking-tight">
            Aura Service Center & OEM Parts Vault
          </h2>
        </div>

        <div className="text-left lg:text-right space-y-0.5">
          <span className="text-xs text-slate-400 block">24/7 Enclosed Flatbed Recovery Desk</span>
          <a
            href="tel:+12125550199"
            className="text-base font-mono tabular-nums font-bold text-white hover:text-rose-400 transition-colors"
          >
            +1 (212) 555-0199
          </a>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
        {/* Left: Numbered Service Selector List (5 cols) */}
        <div className="lg:col-span-5 flex flex-col justify-between gap-3">
          {services.map((srv) => {
            const isActive = activeTab === srv.id;
            return (
              <button
                key={srv.id}
                type="button"
                onClick={() => {
                  setActiveTab(srv.id as typeof activeTab);
                  setBookedService(null);
                }}
                className={`w-full p-5 rounded-xl text-left transition-all duration-150 ${
                  isActive
                    ? 'bg-[#161B26] border border-rose-500'
                    : 'bg-[#11151F] border border-white/[0.08] hover:border-white/[0.2]'
                }`}
              >
                <div className="flex items-baseline justify-between text-xs text-slate-400 mb-1.5">
                  <span className="font-mono tabular-nums text-rose-400 font-semibold">
                    {srv.index}.
                  </span>
                  <span>{srv.kicker}</span>
                </div>
                <h3 className="text-base font-semibold text-white font-display">
                  {srv.title}
                </h3>
              </button>
            );
          })}
        </div>

        {/* Right: Selected Service Specification Sheet (7 cols) */}
        <div className="lg:col-span-7 rounded-2xl bg-[#11151F] border border-white/[0.08] p-8 sm:p-10 flex flex-col justify-between space-y-8">
          <div className="space-y-5">
            <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-400 pb-4 border-b border-white/[0.08]">
              <span>
                Service Protocol {currentService.index} · {currentService.kicker}
              </span>
              <span className="font-mono tabular-nums text-slate-300">
                {currentService.turnaround}
              </span>
            </div>

            <h3 className="text-2xl sm:text-3xl font-bold text-white font-display">
              {currentService.title}
            </h3>

            <p className="text-slate-300 text-sm sm:text-base leading-relaxed max-w-[65ch]">
              {currentService.desc}
            </p>

            <div className="p-4 rounded-xl bg-[#090B10] border border-white/[0.06] space-y-1.5">
              <span className="text-xs text-slate-400 block">Technical Scope</span>
              <p className="text-xs font-mono text-slate-200 leading-relaxed">
                {currentService.metrics}
              </p>
            </div>
          </div>

          <div className="pt-6 border-t border-white/[0.08] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="text-xs text-slate-400">
              <span>Manhattan, Beverly Hills & Miami Service Bays</span>
            </div>

            {bookedService === currentService.id ? (
              <div className="flex items-center gap-2 text-xs text-emerald-400 font-medium">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>Service bay request registered. Concierge will confirm your time slot.</span>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setBookedService(currentService.id)}
                className="px-6 py-3 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-semibold text-xs transition-colors flex items-center justify-center gap-2 whitespace-nowrap shrink-0"
              >
                <span>Reserve Service Bay</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};
