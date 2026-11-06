import React, { useState } from 'react';
import { ArrowRight, CheckCircle2 } from 'lucide-react';

interface FastTrackSectionProps {
  onBookInspection?: () => void;
}

export const FastTrackSection: React.FC<FastTrackSectionProps> = () => {
  const [carMake, setCarMake] = useState('Porsche');
  const [carModel, setCarModel] = useState('911 Carrera S');
  const [carYear, setCarYear] = useState('2022');
  const [carMileage, setCarMileage] = useState('14500');
  const [carCondition, setCarCondition] = useState('Excellent');
  const [contactPhone, setContactPhone] = useState('');
  const [estimatedValue, setEstimatedValue] = useState<number | null>(null);
  const [isCalculated, setIsCalculated] = useState(false);
  const [appointmentBooked, setAppointmentBooked] = useState(false);

  const handleEstimate = (e: React.FormEvent) => {
    e.preventDefault();
    let base = 115000;
    const yearDiff = Math.max(0, 2025 - parseInt(carYear, 10));
    base = base - yearDiff * 6500;
    const mileageNum = parseInt(carMileage, 10) || 15000;
    if (mileageNum > 30000) base -= 7500;
    if (carCondition === 'Excellent') base += 6000;
    if (carCondition === 'Fair') base -= 8500;
    if (base < 28000) base = 32000;

    setEstimatedValue(base);
    setIsCalculated(true);
    setAppointmentBooked(false);
  };

  return (
    <section id="fast-track" className="w-full max-w-[1440px] mx-auto px-6 lg:px-12">
      <div className="rounded-2xl bg-[#11151F] border border-white/[0.08] p-8 sm:p-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          {/* Left Column: Fast Track Proposition (7 cols) */}
          <div className="lg:col-span-7 space-y-8">
            <div className="space-y-3">
              <div className="text-xs text-slate-400">
                <span>Aura Fast Track Program</span>
                <span aria-hidden="true" className="mx-2">·</span>
                <span>Direct Liquidity & Trade-In Equity</span>
              </div>

              <h2 className="text-2xl sm:text-4xl font-bold text-white font-display tracking-tight">
                Sell or Trade In Your Vehicle in 30 Minutes
              </h2>

              <p className="text-slate-300 text-sm sm:text-base leading-relaxed max-w-[62ch]">
                Bypass private-listing delays. Our acquisition engineers conduct a 15-minute OBD-II and paint-depth evaluation, issuing a binding purchase offer or instant trade-in credit toward any vehicle in our showroom.
              </p>
            </div>

            {/* 3 Editorial Steps */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-2">
              <div className="p-5 rounded-xl bg-[#090B10] border border-white/[0.06] space-y-2">
                <span className="text-xs font-mono tabular-nums text-rose-400 font-semibold">
                  01. Valuation Band
                </span>
                <h3 className="text-sm font-semibold text-white font-display">
                  Algorithmic Estimate
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Enter your vehicle specifications for an immediate market price band based on recent auction settlements.
                </p>
              </div>

              <div className="p-5 rounded-xl bg-[#090B10] border border-white/[0.06] space-y-2">
                <span className="text-xs font-mono tabular-nums text-rose-400 font-semibold">
                  02. 15-Min Diagnostic
                </span>
                <h3 className="text-sm font-semibold text-white font-display">
                  Physical Verification
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Visit any flagship gallery for a non-invasive mechanical and chassis verification by our master technicians.
                </p>
              </div>

              <div className="p-5 rounded-xl bg-[#090B10] border border-white/[0.06] space-y-2">
                <span className="text-xs font-mono tabular-nums text-rose-400 font-semibold">
                  03. Instant Settlement
                </span>
                <h3 className="text-sm font-semibold text-white font-display">
                  Wire or Trade-In Swap
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Receive an immediate RTGS bank wire transfer or apply 100% of the equity toward your next vehicle.
                </p>
              </div>
            </div>

            <div className="pt-2 flex flex-wrap items-center gap-3 text-xs text-slate-400">
              <span>Zero Consignment Commissions</span>
              <span aria-hidden="true">·</span>
              <span>Full Title & Lien Settlement Handled</span>
              <span aria-hidden="true">·</span>
              <span>All European & Japanese Marques</span>
            </div>
          </div>

          {/* Right Column: Instant Valuation Calculator (5 cols) */}
          <div className="lg:col-span-5">
            <div className="rounded-xl bg-[#090B10] border border-white/[0.08] p-6 sm:p-8 space-y-6">
              <div className="pb-4 border-b border-white/[0.08] flex items-baseline justify-between">
                <div>
                  <h3 className="text-base font-semibold text-white font-display">
                    Fast Track Valuation Calculator
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Instant market appraisal band
                  </p>
                </div>
                <span className="text-xs font-mono tabular-nums text-slate-400">
                  2026 Market Index
                </span>
              </div>

              <form onSubmit={handleEstimate} className="space-y-4 text-xs">
                <div className="grid grid-cols-2 gap-3.5">
                  <div className="space-y-1.5">
                    <label className="text-slate-400 font-medium block">
                      Manufacturer
                    </label>
                    <select
                      value={carMake}
                      onChange={(e) => setCarMake(e.target.value)}
                      className="w-full px-3 py-2.5 rounded-lg bg-[#11151F] border border-white/[0.1] text-white font-medium focus:outline-none focus:border-rose-500"
                    >
                      <option value="Porsche">Porsche</option>
                      <option value="Mercedes-Benz">Mercedes-Benz</option>
                      <option value="BMW">BMW</option>
                      <option value="Audi">Audi</option>
                      <option value="Lamborghini">Lamborghini</option>
                      <option value="Toyota">Toyota</option>
                      <option value="Land Rover">Land Rover</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-slate-400 font-medium block">
                      Model & Trim
                    </label>
                    <input
                      type="text"
                      required
                      value={carModel}
                      onChange={(e) => setCarModel(e.target.value)}
                      placeholder="e.g. 911 Carrera S"
                      className="w-full px-3 py-2.5 rounded-lg bg-[#11151F] border border-white/[0.1] text-white font-medium focus:outline-none focus:border-rose-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3.5">
                  <div className="space-y-1.5">
                    <label className="text-slate-400 font-medium block">
                      Model Year
                    </label>
                    <select
                      value={carYear}
                      onChange={(e) => setCarYear(e.target.value)}
                      className="w-full px-3 py-2.5 rounded-lg bg-[#11151F] border border-white/[0.1] text-white font-mono tabular-nums focus:outline-none focus:border-rose-500"
                    >
                      {[2025, 2024, 2023, 2022, 2021, 2020, 2019, 2018].map((yr) => (
                        <option key={yr} value={yr}>
                          {yr}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-slate-400 font-medium block">
                      Odometer (mi)
                    </label>
                    <input
                      type="number"
                      required
                      min={0}
                      value={carMileage}
                      onChange={(e) => setCarMileage(e.target.value)}
                      placeholder="14500"
                      className="w-full px-3 py-2.5 rounded-lg bg-[#11151F] border border-white/[0.1] text-white font-mono tabular-nums focus:outline-none focus:border-rose-500"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-slate-400 font-medium block">
                    Condition Grade
                  </label>
                  <div className="grid grid-cols-3 gap-2 p-1 bg-[#11151F] rounded-lg border border-white/[0.06]">
                    {['Excellent', 'Good', 'Fair'].map((cond) => (
                      <button
                        type="button"
                        key={cond}
                        onClick={() => setCarCondition(cond)}
                        className={`py-2 rounded-md text-xs font-medium transition-colors whitespace-nowrap shrink-0 ${
                          carCondition === cond
                            ? 'bg-rose-600 text-white'
                            : 'text-slate-400 hover:text-white'
                        }`}
                      >
                        {cond}
                      </button>
                    ))}
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-3 px-4 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-semibold text-xs transition-colors flex items-center justify-center gap-2 whitespace-nowrap shrink-0"
                >
                  <span>Calculate Trade-In Valuation</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </form>

              {isCalculated && estimatedValue && (
                <div className="p-5 rounded-xl bg-[#11151F] border border-white/[0.1] space-y-4 animate-fade-in-up">
                  <div className="flex items-baseline justify-between text-xs text-slate-400">
                    <span>Estimated Buyback Range</span>
                    <span className="font-mono tabular-nums text-slate-300">
                      {carYear} {carMake} {carModel}
                    </span>
                  </div>

                  <div className="text-2xl font-bold text-white font-mono tabular-nums">
                    ${(estimatedValue - 2500).toLocaleString()} – ${(estimatedValue + 2500).toLocaleString()}
                  </div>

                  {!appointmentBooked ? (
                    <div className="space-y-2.5 pt-2 border-t border-white/[0.08]">
                      <input
                        type="tel"
                        value={contactPhone}
                        onChange={(e) => setContactPhone(e.target.value)}
                        placeholder="Enter phone number to lock 15-min bay slot..."
                        className="w-full px-3 py-2 rounded-lg bg-[#090B10] border border-white/[0.1] text-xs text-white placeholder-slate-500 focus:outline-none focus:border-rose-500"
                      />
                      <button
                        type="button"
                        onClick={() => setAppointmentBooked(true)}
                        className="w-full py-2.5 rounded-lg bg-white text-slate-950 hover:bg-slate-200 font-semibold text-xs transition-colors whitespace-nowrap shrink-0"
                      >
                        Schedule 15-Minute Appraisal
                      </button>
                    </div>
                  ) : (
                    <div className="pt-2 border-t border-white/[0.08] flex items-center gap-2 text-xs text-emerald-400">
                      <CheckCircle2 className="w-4 h-4 shrink-0" />
                      <span>
                        Appraisal slot reserved. Our acquisition specialist will confirm your bay time shortly.
                      </span>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
