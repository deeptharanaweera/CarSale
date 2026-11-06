import React, { useState } from 'react';
import { ArrowRight, CheckCircle2 } from 'lucide-react';

export const BankLeasingSection: React.FC = () => {
  const [vehiclePrice, setVehiclePrice] = useState(165000);
  const [downPaymentPct, setDownPaymentPct] = useState(25);
  const [tenureYears, setTenureYears] = useState(5);
  const [interestRate, setInterestRate] = useState(6.25);
  const [preApprovalSent, setPreApprovalSent] = useState(false);

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
    { name: 'J.P. Morgan Private Client', rate: 'From 5.85% APR', term: 'Up to 84 Months' },
    { name: 'Morgan Stanley Private Bank', rate: 'From 6.10% APR', term: 'Balloon & Residual Options' },
    { name: 'Bank of America Premier', rate: 'From 6.25% APR', term: '24-Hour Credit Decision' },
    { name: 'UBS Wealth Management', rate: 'Portfolio Line Credit', term: 'Custom Exotic Structuring' },
  ];

  return (
    <section id="leasing" className="w-full max-w-[1440px] mx-auto px-6 lg:px-12 space-y-10">
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 pb-6 border-b border-white/[0.08]">
        <div className="space-y-1.5">
          <div className="text-xs text-slate-400">
            <span>Bespoke Automotive Finance</span>
            <span aria-hidden="true" className="mx-2">·</span>
            <span>Tier-1 Institutional Partners</span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-bold text-white font-display tracking-tight">
            Tailored Leasing & Capital Structuring
          </h2>
        </div>

        <p className="text-xs sm:text-sm text-slate-400 max-w-md">
          Up to 80% financing with closed-end lease structures, portfolio credit lines, and same-day underwriting approvals.
        </p>
      </div>

      {/* Institutional Partners Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {banks.map((b) => (
          <div
            key={b.name}
            className="p-5 rounded-xl bg-[#11151F] border border-white/[0.08] space-y-1.5"
          >
            <h3 className="text-sm font-semibold text-white font-display">
              {b.name}
            </h3>
            <div className="flex items-center gap-1.5 text-xs text-slate-400 font-mono tabular-nums">
              <span className="text-slate-200">{b.rate}</span>
              <span aria-hidden="true">·</span>
              <span>{b.term}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Interactive Lease & Amortization Calculator */}
      <div className="rounded-2xl bg-[#11151F] border border-white/[0.08] p-8 sm:p-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          {/* Left Sliders (7 cols) */}
          <div className="lg:col-span-7 space-y-6">
            <h3 className="text-lg font-semibold text-white font-display">
              Interactive Lease Amortization Calculator
            </h3>

            {/* Vehicle Price */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-slate-400">Vehicle Purchase Valuation</span>
                <span className="font-mono tabular-nums text-white font-semibold">
                  ${vehiclePrice.toLocaleString()}
                </span>
              </div>
              <input
                type="range"
                min={60000}
                max={500000}
                step={5000}
                value={vehiclePrice}
                onChange={(e) => {
                  setVehiclePrice(Number(e.target.value));
                  setPreApprovalSent(false);
                }}
                className="w-full h-1.5 bg-[#090B10] rounded-lg appearance-none cursor-pointer"
              />
              <div className="flex justify-between text-[11px] text-slate-500 font-mono tabular-nums">
                <span>$60,000</span>
                <span>$500,000</span>
              </div>
            </div>

            {/* Down Payment */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-slate-400">Initial Capital Reduction ({downPaymentPct}%)</span>
                <span className="font-mono tabular-nums text-white font-semibold">
                  ${downPaymentAmount.toLocaleString()}
                </span>
              </div>
              <input
                type="range"
                min={10}
                max={60}
                step={5}
                value={downPaymentPct}
                onChange={(e) => {
                  setDownPaymentPct(Number(e.target.value));
                  setPreApprovalSent(false);
                }}
                className="w-full h-1.5 bg-[#090B10] rounded-lg appearance-none cursor-pointer"
              />
              <div className="flex justify-between text-[11px] text-slate-500 font-mono tabular-nums">
                <span>10% Minimum</span>
                <span>60% Maximum</span>
              </div>
            </div>

            {/* Tenure */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-slate-400">Amortization Term</span>
                <span className="font-mono tabular-nums text-white font-semibold">
                  {tenureYears} Years ({totalMonths} Months)
                </span>
              </div>
              <div className="grid grid-cols-5 gap-2 p-1 bg-[#090B10] rounded-lg border border-white/[0.06]">
                {[2, 3, 4, 5, 7].map((yr) => (
                  <button
                    key={yr}
                    type="button"
                    onClick={() => {
                      setTenureYears(yr);
                      setPreApprovalSent(false);
                    }}
                    className={`py-2 rounded-md text-xs font-mono tabular-nums font-medium transition-colors whitespace-nowrap shrink-0 ${
                      tenureYears === yr
                        ? 'bg-rose-600 text-white'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    {yr * 12} mo
                  </button>
                ))}
              </div>
            </div>

            {/* Interest Rate */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-slate-400">Estimated Tier-1 APR</span>
                <span className="font-mono tabular-nums text-white font-semibold">
                  {interestRate.toFixed(2)}% p.a.
                </span>
              </div>
              <input
                type="range"
                min={4.5}
                max={11.5}
                step={0.25}
                value={interestRate}
                onChange={(e) => {
                  setInterestRate(Number(e.target.value));
                  setPreApprovalSent(false);
                }}
                className="w-full h-1.5 bg-[#090B10] rounded-lg appearance-none cursor-pointer"
              />
            </div>
          </div>

          {/* Right Summary Card (5 cols) */}
          <div className="lg:col-span-5">
            <div className="rounded-xl bg-[#090B10] border border-white/[0.08] p-6 sm:p-8 space-y-6">
              <div className="space-y-1">
                <span className="text-xs text-slate-400 block">
                  Estimated Monthly Payment
                </span>
                <div className="text-4xl font-bold text-white font-mono tabular-nums">
                  ${monthlyPayment.toLocaleString()}
                  <span className="text-xs text-slate-400 font-normal ml-1">/ month</span>
                </div>
              </div>

              <div className="divide-y divide-white/[0.06] text-xs font-mono tabular-nums">
                <div className="py-2.5 flex justify-between">
                  <span className="font-sans text-slate-400">Vehicle Valuation</span>
                  <span className="text-white">${vehiclePrice.toLocaleString()}</span>
                </div>
                <div className="py-2.5 flex justify-between">
                  <span className="font-sans text-slate-400">Down Payment ({downPaymentPct}%)</span>
                  <span className="text-slate-200">${downPaymentAmount.toLocaleString()}</span>
                </div>
                <div className="py-2.5 flex justify-between">
                  <span className="font-sans text-slate-400">Financed Principal</span>
                  <span className="text-white font-semibold">${loanPrincipal.toLocaleString()}</span>
                </div>
                <div className="py-2.5 flex justify-between">
                  <span className="font-sans text-slate-400">Term & Rate</span>
                  <span className="text-slate-200">{totalMonths} mos @ {interestRate.toFixed(2)}%</span>
                </div>
              </div>

              {preApprovalSent ? (
                <div className="p-3.5 rounded-lg bg-[#11151F] border border-white/[0.1] flex items-center gap-2 text-xs text-emerald-400">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>
                    Pre-approval schedule prepared. A private client finance officer will contact you.
                  </span>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setPreApprovalSent(true)}
                  className="w-full py-3.5 px-6 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-semibold text-xs transition-colors flex items-center justify-center gap-2 whitespace-nowrap shrink-0"
                >
                  <span>Request Private Finance Term Sheet</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
