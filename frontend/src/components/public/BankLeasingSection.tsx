import React, { useState } from 'react';
import {
  Landmark,
  Calculator,
  Percent,
  Calendar,
  CheckCircle2,
  DollarSign,
  ArrowRight,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';

export const BankLeasingSection: React.FC = () => {
  const [vehiclePrice, setVehiclePrice] = useState(85000);
  const [downPaymentPct, setDownPaymentPct] = useState(25);
  const [tenureYears, setTenureYears] = useState(5);
  const [interestRate, setInterestRate] = useState(11.5);

  const downPaymentAmount = Math.round((vehiclePrice * downPaymentPct) / 100);
  const loanPrincipal = vehiclePrice - downPaymentAmount;
  const totalMonths = tenureYears * 12;
  const monthlyRate = interestRate / 100 / 12;

  const monthlyPayment =
    monthlyRate > 0
      ? Math.round(
          (loanPrincipal * (monthlyRate * Math.pow(1 + monthlyRate, totalMonths))) /
            (Math.pow(1 + monthlyRate, totalMonths) - 1)
        )
      : Math.round(loanPrincipal / totalMonths);

  const banks = [
    { name: 'Commercial Bank', badge: 'Special Rate from 10.25%', logo: 'COMBANK' },
    { name: 'Hatton National Bank', badge: 'Special Leasing Partner', logo: 'HNB' },
    { name: 'Sampath Bank', badge: 'Speed Lease in 24 Hrs', logo: 'SAMPATH' },
    { name: 'Seylan Bank', badge: 'Flexible Down-Payments', logo: 'SEYLAN' },
    { name: 'Nations Trust Bank', badge: 'Exclusive VIP Rates', logo: 'NTB' },
  ];

  return (
    <section id="leasing" className="w-full max-w-[1720px] mx-auto px-4 sm:px-8 xl:px-12 space-y-12">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 pb-6 border-b border-white/10">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-600/10 border border-red-500/20 text-red-400 text-xs font-mono uppercase tracking-widest font-bold">
            <Landmark className="w-3.5 h-3.5 text-red-500" />
            Financial Solutions & Bank Partnerships
          </div>
          <h2 className="text-3xl sm:text-5xl font-black text-white font-display uppercase tracking-tight">
            Easy Leasing & Financial Services
          </h2>
          <p className="text-slate-400 text-sm max-w-xl font-light">
            We partner directly with leading premier financial institutions to offer tailored leasing packages with competitive interest rates and swift 24-hour approvals.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <span className="px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-mono font-bold flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            Up to 80% Financing Approved
          </span>
        </div>
      </div>

      {/* Partner Banks Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
        {banks.map((b) => (
          <div
            key={b.name}
            className="p-5 rounded-2xl bg-slate-900/60 border border-white/[0.08] flex flex-col justify-between hover:border-red-500/40 transition-all text-center group"
          >
            <span className="text-base font-black text-white font-display tracking-wider group-hover:text-red-400 transition-colors">
              {b.logo}
            </span>
            <span className="text-[11px] font-bold text-slate-300 mt-1 block">
              {b.name}
            </span>
            <span className="text-[10px] font-mono text-emerald-400 mt-2 block bg-slate-950 py-1.5 px-2 rounded-lg border border-white/[0.04]">
              {b.badge}
            </span>
          </div>
        ))}
      </div>

      {/* Interactive EMI Calculator */}
      <div className="rounded-3xl bg-slate-900/80 border border-white/10 p-6 sm:p-10 relative overflow-hidden backdrop-blur-xl shadow-2xl">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          {/* Sliders Form */}
          <div className="lg:col-span-7 space-y-6">
            <div className="flex items-center gap-2">
              <Calculator className="w-5 h-5 text-red-500" />
              <h3 className="text-xl font-bold text-white font-display">
                Automated Monthly Lease Calculator
              </h3>
            </div>

            {/* Slider 1: Vehicle Price */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-slate-400 font-semibold uppercase tracking-wider">
                  Vehicle Valuation
                </span>
                <span className="font-mono text-white font-bold text-sm">
                  ${vehiclePrice.toLocaleString()}
                </span>
              </div>
              <input
                type="range"
                min={20000}
                max={250000}
                step={5000}
                value={vehiclePrice}
                onChange={(e) => setVehiclePrice(Number(e.target.value))}
                className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-red-600"
              />
              <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                <span>$20,000</span>
                <span>$250,000+</span>
              </div>
            </div>

            {/* Slider 2: Down Payment */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-slate-400 font-semibold uppercase tracking-wider">
                  Down Payment ({downPaymentPct}%)
                </span>
                <span className="font-mono text-emerald-400 font-bold text-sm">
                  ${downPaymentAmount.toLocaleString()}
                </span>
              </div>
              <input
                type="range"
                min={20}
                max={60}
                step={5}
                value={downPaymentPct}
                onChange={(e) => setDownPaymentPct(Number(e.target.value))}
                className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-red-600"
              />
              <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                <span>20% (Minimum)</span>
                <span>60% (Maximum)</span>
              </div>
            </div>

            {/* Slider 3: Tenure Years */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-slate-400 font-semibold uppercase tracking-wider">
                  Lease Period / Tenure
                </span>
                <span className="font-mono text-white font-bold text-sm">
                  {tenureYears} Years ({totalMonths} Months)
                </span>
              </div>
              <div className="grid grid-cols-5 gap-2">
                {[1, 2, 3, 4, 5, 7].slice(0, 5).map((yr) => (
                  <button
                    key={yr}
                    type="button"
                    onClick={() => setTenureYears(yr)}
                    className={`py-2 rounded-xl text-xs font-bold font-mono transition-all ${
                      tenureYears === yr
                        ? 'bg-red-600 text-white shadow-md shadow-red-600/30'
                        : 'bg-slate-950 text-slate-400 border border-white/10 hover:text-white'
                    }`}
                  >
                    {yr} Yrs
                  </button>
                ))}
              </div>
            </div>

            {/* Slider 4: Interest Rate */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-slate-400 font-semibold uppercase tracking-wider">
                  Annual Interest Rate
                </span>
                <span className="font-mono text-white font-bold text-sm">
                  {interestRate}% p.a.
                </span>
              </div>
              <input
                type="range"
                min={9.5}
                max={16.5}
                step={0.5}
                value={interestRate}
                onChange={(e) => setInterestRate(Number(e.target.value))}
                className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-red-600"
              />
            </div>
          </div>

          {/* Right Calculated Result Box */}
          <div className="lg:col-span-5">
            <div className="rounded-3xl bg-slate-950 border border-white/15 p-8 text-center space-y-6 shadow-2xl relative overflow-hidden">
              <div className="space-y-1">
                <span className="text-[11px] font-mono uppercase tracking-widest text-slate-400 block">
                  Estimated Monthly Installment
                </span>
                <div className="text-4xl sm:text-5xl font-black text-white font-mono tracking-tight text-red-500">
                  ${monthlyPayment.toLocaleString()}
                  <span className="text-xs text-slate-400 font-normal"> / mo</span>
                </div>
              </div>

              <div className="divide-y divide-white/[0.08] text-xs text-slate-300 font-mono text-left pt-2">
                <div className="py-2.5 flex justify-between">
                  <span className="text-slate-400">Total Vehicle Cost:</span>
                  <span className="text-white font-bold">${vehiclePrice.toLocaleString()}</span>
                </div>
                <div className="py-2.5 flex justify-between">
                  <span className="text-slate-400">Required Down Payment ({downPaymentPct}%):</span>
                  <span className="text-emerald-400 font-bold">${downPaymentAmount.toLocaleString()}</span>
                </div>
                <div className="py-2.5 flex justify-between">
                  <span className="text-slate-400">Financed Loan Principal:</span>
                  <span className="text-white font-bold">${loanPrincipal.toLocaleString()}</span>
                </div>
                <div className="py-2.5 flex justify-between">
                  <span className="text-slate-400">Repayment Period:</span>
                  <span className="text-white font-bold">{totalMonths} Monthly Installments</span>
                </div>
              </div>

              <button
                onClick={() => {
                  const text = encodeURIComponent(
                    `Hello Leasing Team, I used the online leasing calculator for a $${vehiclePrice.toLocaleString()} vehicle ($${downPaymentAmount.toLocaleString()} down payment, ${tenureYears} yrs tenure). Please help me apply for pre-approved leasing.`
                  );
                  window.open(`https://wa.me/94777874422?text=${text}`, '_blank');
                }}
                className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white font-black text-xs uppercase tracking-wider transition-all shadow-xl shadow-red-600/30 flex items-center justify-center gap-2 active:scale-95"
              >
                <span>Apply for Pre-Approved Lease</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
