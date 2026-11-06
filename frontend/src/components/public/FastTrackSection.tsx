import React, { useState } from 'react';
import {
  Zap,
  ArrowRight,
  CheckCircle2,
  Calculator,
  Calendar,
  Clock,
  ShieldCheck,
  DollarSign,
  Car,
  ChevronRight,
  Sparkles,
} from 'lucide-react';

interface FastTrackSectionProps {
  onBookInspection?: () => void;
}

export const FastTrackSection: React.FC<FastTrackSectionProps> = ({
  onBookInspection,
}) => {
  const [carMake, setCarMake] = useState('Toyota');
  const [carModel, setCarModel] = useState('Premio');
  const [carYear, setCarYear] = useState('2019');
  const [carMileage, setCarMileage] = useState('45000');
  const [carCondition, setCarCondition] = useState('Excellent');
  const [estimatedValue, setEstimatedValue] = useState<number | null>(null);
  const [isCalculated, setIsCalculated] = useState(false);

  const handleEstimate = (e: React.FormEvent) => {
    e.preventDefault();
    let base = 65000;
    const yearDiff = 2024 - parseInt(carYear);
    base = base - yearDiff * 3500;
    const mileageNum = parseInt(carMileage) || 50000;
    if (mileageNum > 60000) base -= 4000;
    if (carCondition === 'Excellent') base += 3500;
    if (carCondition === 'Fair') base -= 5000;
    if (base < 15000) base = 18500;

    setEstimatedValue(base);
    setIsCalculated(true);
  };

  return (
    <section id="fast-track" className="w-full max-w-[1720px] mx-auto px-4 sm:px-8 xl:px-12">
      <div className="rounded-[2.5rem] bg-gradient-to-br from-red-950/60 via-slate-900 to-slate-950 border border-red-500/30 p-8 sm:p-14 relative overflow-hidden shadow-2xl">
        {/* Ambient Decorative Lighting */}
        <div className="absolute -top-32 -right-32 w-96 h-96 bg-red-600/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-32 -left-32 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center relative z-10">
          {/* Left Column: Fast Track Proposition */}
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-red-600 text-white text-xs font-mono uppercase tracking-widest font-bold shadow-lg shadow-red-600/30">
              <Zap className="w-3.5 h-3.5 fill-current" />
              Fast Track Trade-In Service
            </div>

            <div className="space-y-3">
              <h2 className="text-3xl sm:text-5xl font-black text-white font-display tracking-tight leading-tight">
                Sell or Trade In Your Vehicle in <span className="text-red-500">30 Minutes</span>
              </h2>
              <p className="text-slate-300 text-sm sm:text-base leading-relaxed font-light">
                The most hassle-free vehicle upgrade channel. We evaluate your pre-owned car at verified market valuation, handle all transfer documentation, and let you drive away in your upgraded car on the same day.
              </p>
            </div>

            {/* 3 Step Flow */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4">
              <div className="p-4 rounded-2xl bg-slate-950/70 border border-white/10 space-y-2">
                <span className="w-7 h-7 rounded-full bg-red-600/20 text-red-400 font-mono font-bold text-xs flex items-center justify-center">
                  01
                </span>
                <h4 className="text-white font-bold text-sm">Instant Online Value</h4>
                <p className="text-xs text-slate-400">
                  Input vehicle details and receive an immediate computer-generated price band.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-950/70 border border-white/10 space-y-2">
                <span className="w-7 h-7 rounded-full bg-red-600/20 text-red-400 font-mono font-bold text-xs flex items-center justify-center">
                  02
                </span>
                <h4 className="text-white font-bold text-sm">15-Min Inspection</h4>
                <p className="text-xs text-slate-400">
                  Drop by any branch for a fast diagnostic and mechanical health verification.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-950/70 border border-white/10 space-y-2">
                <span className="w-7 h-7 rounded-full bg-red-600/20 text-red-400 font-mono font-bold text-xs flex items-center justify-center">
                  03
                </span>
                <h4 className="text-white font-bold text-sm">Instant Payout or Swap</h4>
                <p className="text-xs text-slate-400">
                  Collect instant funds or apply your valuation as down-payment toward any new car.
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-6 text-xs text-slate-300 font-mono pt-2">
              <span className="flex items-center gap-1.5 text-emerald-400">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                No Hidden Agent Fees
              </span>
              <span className="flex items-center gap-1.5 text-emerald-400">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                Title Transfer Handled
              </span>
              <span className="flex items-center gap-1.5 text-emerald-400">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                All Japanese & European Brands
              </span>
            </div>
          </div>

          {/* Right Column: Instant Valuation Calculator Card */}
          <div className="lg:col-span-5">
            <div className="rounded-3xl bg-slate-950/90 border border-white/15 p-6 sm:p-8 backdrop-blur-2xl shadow-2xl space-y-5">
              <div className="flex items-center justify-between pb-3 border-b border-white/10">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-red-600/20 text-red-400 flex items-center justify-center">
                    <Calculator className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-white font-display">
                      Instant Vehicle Valuation
                    </h3>
                    <p className="text-[11px] text-slate-400 font-mono">Free Algorithm Estimate</p>
                  </div>
                </div>
                <span className="px-2.5 py-1 rounded-full text-[10px] font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  Live Market Sync
                </span>
              </div>

              <form onSubmit={handleEstimate} className="space-y-4 text-xs">
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-slate-400 font-semibold uppercase text-[10px] tracking-wider">
                      Make
                    </label>
                    <select
                      value={carMake}
                      onChange={(e) => setCarMake(e.target.value)}
                      className="w-full px-3 py-2.5 rounded-xl bg-slate-900 border border-white/15 text-white font-medium focus:outline-none focus:border-red-500"
                    >
                      <option value="Toyota">Toyota</option>
                      <option value="Honda">Honda</option>
                      <option value="Nissan">Nissan</option>
                      <option value="Suzuki">Suzuki</option>
                      <option value="Mercedes-Benz">Mercedes-Benz</option>
                      <option value="BMW">BMW</option>
                      <option value="Mitsubishi">Mitsubishi</option>
                      <option value="Land Rover">Land Rover</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-slate-400 font-semibold uppercase text-[10px] tracking-wider">
                      Model
                    </label>
                    <input
                      type="text"
                      value={carModel}
                      onChange={(e) => setCarModel(e.target.value)}
                      placeholder="e.g. Premio, Prado, Vezel"
                      className="w-full px-3 py-2.5 rounded-xl bg-slate-900 border border-white/15 text-white font-medium focus:outline-none focus:border-red-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-slate-400 font-semibold uppercase text-[10px] tracking-wider">
                      Manufacture Year
                    </label>
                    <select
                      value={carYear}
                      onChange={(e) => setCarYear(e.target.value)}
                      className="w-full px-3 py-2.5 rounded-xl bg-slate-900 border border-white/15 text-white font-medium focus:outline-none focus:border-red-500"
                    >
                      {[2024, 2023, 2022, 2021, 2020, 2019, 2018, 2017, 2016, 2015].map((yr) => (
                        <option key={yr} value={yr}>
                          {yr}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-slate-400 font-semibold uppercase text-[10px] tracking-wider">
                      Mileage (km)
                    </label>
                    <input
                      type="number"
                      value={carMileage}
                      onChange={(e) => setCarMileage(e.target.value)}
                      placeholder="e.g. 45000"
                      className="w-full px-3 py-2.5 rounded-xl bg-slate-900 border border-white/15 text-white font-medium focus:outline-none focus:border-red-500"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-slate-400 font-semibold uppercase text-[10px] tracking-wider">
                    Overall Condition
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {['Excellent', 'Good', 'Fair'].map((cond) => (
                      <button
                        type="button"
                        key={cond}
                        onClick={() => setCarCondition(cond)}
                        className={`py-2 rounded-xl text-xs font-bold uppercase transition-all ${
                          carCondition === cond
                            ? 'bg-red-600 text-white shadow-md shadow-red-600/30'
                            : 'bg-slate-900 text-slate-400 border border-white/10 hover:text-white'
                        }`}
                      >
                        {cond}
                      </button>
                    ))}
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white font-black uppercase tracking-wider text-xs shadow-lg shadow-red-600/30 transition-all flex items-center justify-center gap-2 active:scale-95"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Calculate Valuation</span>
                </button>
              </form>

              {/* Valuation Result Box */}
              {isCalculated && estimatedValue && (
                <div className="p-4 rounded-2xl bg-red-950/40 border border-red-500/30 space-y-3 animate-fade-in-up">
                  <div className="flex items-center justify-between text-xs text-slate-300">
                    <span>Estimated Trade-in Value:</span>
                    <span className="font-mono text-emerald-400 font-bold">Guaranteed Price Band</span>
                  </div>

                  <div className="text-2xl sm:text-3xl font-black text-white font-mono flex items-baseline gap-2">
                    <span>${(estimatedValue - 2000).toLocaleString()}</span>
                    <span className="text-slate-500 text-sm font-normal">—</span>
                    <span className="text-red-400">${(estimatedValue + 2000).toLocaleString()}</span>
                  </div>

                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    Based on live demand for {carYear} {carMake} {carModel}. Payout finalized upon 15-minute physical inspection at any showroom branch.
                  </p>

                  <button
                    onClick={() => {
                      const text = encodeURIComponent(
                        `Hello Fast Track team, I received an online estimate of $${(estimatedValue - 2000).toLocaleString()} - $${(estimatedValue + 2000).toLocaleString()} for my ${carYear} ${carMake} ${carModel} (${carMileage} km). I would like to schedule a 15-minute inspection.`
                      );
                      window.open(`https://wa.me/94777874422?text=${text}`, '_blank');
                    }}
                    className="w-full py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-1.5"
                  >
                    <span>Book 15-Min Free Inspection via WhatsApp</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

