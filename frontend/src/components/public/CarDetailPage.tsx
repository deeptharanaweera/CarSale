import React, { useState } from 'react';
import { Car } from '../../types';
import { api } from '../../services/api';
import { CarViewer3D } from '../3d/CarViewer3D';
import { ShowroomViewer3D } from '../3d/ShowroomViewer3D';
import {
  Calendar,
  CheckCircle2,
  Share2,
  Heart,
  Scale,
  ArrowLeft,
  X,
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface CarDetailPageProps {
  car: Car;
  similarCars?: Car[];
  onBack: () => void;
  onSelectSimilar: (car: Car) => void;
  isFavorited?: boolean;
  onToggleFavorite?: () => void;
  isCompared?: boolean;
  onToggleCompare?: () => void;
}

const FALLBACK_DETAIL_IMG = '/src/assets/images/hero_hypercar_pavilion_1793964975599.jpg';

export const CarDetailPage: React.FC<CarDetailPageProps> = ({
  car,
  similarCars = [],
  onBack,
  onSelectSimilar,
  isFavorited = false,
  onToggleFavorite,
  isCompared = false,
  onToggleCompare,
}) => {
  const [activeMediaTab, setActiveMediaTab] = useState<'3d' | 'showroom' | 'gallery'>('3d');
  const [selectedGalleryImg, setSelectedGalleryImg] = useState<string>(
    car.images?.[0]?.url || FALLBACK_DETAIL_IMG
  );

  // Modals & notifications
  const [bookingModal, setBookingModal] = useState<'test_drive' | 'enquiry' | 'reserve' | null>(null);
  const [clientName, setClientName] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const [clientEmail, setClientEmail] = useState('');
  const [clientMessage, setClientMessage] = useState('');
  const [testDriveDate, setTestDriveDate] = useState('2026-11-10T14:00');
  const [bookingLoading, setBookingLoading] = useState(false);
  const [successBanner, setSuccessBanner] = useState<string | null>(null);

  // EMI Calculator state
  const [downPaymentPct, setDownPaymentPct] = useState(20);
  const [loanTermMonths, setLoanTermMonths] = useState(60);
  const [interestRate] = useState(6.25);

  const downPaymentAmount = (car.price * downPaymentPct) / 100;
  const loanPrincipal = car.price - downPaymentAmount;
  const monthlyRate = interestRate / 100 / 12;
  const monthlyPayment =
    monthlyRate > 0
      ? (loanPrincipal * (monthlyRate * Math.pow(1 + monthlyRate, loanTermMonths))) /
        (Math.pow(1 + monthlyRate, loanTermMonths) - 1)
      : loanPrincipal / loanTermMonths;

  const handleBookingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBookingLoading(true);

    try {
      if (bookingModal === 'reserve') {
        await api.submitReservation({
          car_id: car.id,
          name: clientName,
          phone: clientPhone,
          email: clientEmail,
          amount: 500,
        });
        confetti({ particleCount: 90, spread: 70, origin: { y: 0.6 } });
        setSuccessBanner('Vehicle reserved with $500 refundable deposit. Concierge allocation dossier sent.');
      } else if (bookingModal === 'test_drive') {
        await api.submitTestDrive({
          car_id: car.id,
          name: clientName,
          phone: clientPhone,
          email: clientEmail,
          date_time: testDriveDate,
        });
        confetti({ particleCount: 60, spread: 60, origin: { y: 0.6 } });
        setSuccessBanner('Private showroom test drive confirmed. Our gallery director will greet you.');
      } else {
        await api.submitEnquiry({
          car_id: car.id,
          name: clientName,
          phone: clientPhone,
          email: clientEmail,
          message: clientMessage,
        });
        setSuccessBanner('Concierge inquiry registered. A dedicated advisor has been assigned to you.');
      }
      setBookingModal(null);
    } catch (err: any) {
      setSuccessBanner(err.message || 'Request recorded by dealership concierge.');
      setBookingModal(null);
    } finally {
      setBookingLoading(false);
    }
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator
        .share({
          title: car.title,
          text: `Inspect ${car.title} on Aura Motors`,
          url: window.location.href,
        })
        .catch(() => {});
    } else if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      setSuccessBanner('Direct vehicle specification link copied to clipboard.');
    }
  };

  return (
    <div className="w-full max-w-[1440px] mx-auto px-6 lg:px-12 py-8 space-y-10 animate-fade-in-up">
      {/* Top Breadcrumb Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-white/[0.08]">
        <button
          type="button"
          onClick={onBack}
          className="flex items-center gap-2 text-xs font-semibold text-slate-300 hover:text-white transition-colors group"
        >
          <ArrowLeft className="w-4 h-4 text-rose-500 group-hover:-translate-x-0.5 transition-transform" />
          <span>Back to Showroom Inventory</span>
        </button>

        <div className="flex items-center gap-2">
          {onToggleCompare && (
            <button
              type="button"
              onClick={onToggleCompare}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg border text-xs font-medium transition-colors whitespace-nowrap shrink-0 ${
                isCompared
                  ? 'bg-rose-600 text-white border-rose-500'
                  : 'bg-[#11151F] border-white/[0.1] text-slate-300 hover:text-white'
              }`}
            >
              <Scale className="w-3.5 h-3.5" />
              <span>{isCompared ? 'In Comparison' : 'Compare'}</span>
            </button>
          )}

          {onToggleFavorite && (
            <button
              type="button"
              onClick={onToggleFavorite}
              aria-label="Save Vehicle"
              className={`p-2 rounded-lg border transition-colors ${
                isFavorited
                  ? 'bg-rose-600 text-white border-rose-500'
                  : 'bg-[#11151F] border-white/[0.1] text-slate-300 hover:text-white'
              }`}
            >
              <Heart className={`w-4 h-4 ${isFavorited ? 'fill-current' : ''}`} />
            </button>
          )}

          <button
            type="button"
            onClick={handleShare}
            aria-label="Share Vehicle"
            className="p-2 rounded-lg bg-[#11151F] border border-white/[0.1] text-slate-300 hover:text-white transition-colors"
            title="Copy Link"
          >
            <Share2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Inline Feedback Banner */}
      {successBanner && (
        <div className="p-4 rounded-xl bg-[#11151F] border border-emerald-500/40 text-emerald-300 text-xs font-medium flex items-center justify-between animate-fade-in-down">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{successBanner}</span>
          </div>
          <button type="button" onClick={() => setSuccessBanner(null)} className="p-1 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Contiguous PDP Architecture: Left Media & Technical Dossier (8 cols) + Right Sticky Purchase Module (4 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: 3D Configurator / Gallery + Specs */}
        <div className="lg:col-span-8 space-y-8">
          {/* Segmented Viewport Switcher */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-1 p-1 rounded-lg bg-[#11151F] border border-white/[0.08]">
              <button
                type="button"
                onClick={() => setActiveMediaTab('3d')}
                className={`px-4 py-2 rounded-md font-medium text-xs transition-colors whitespace-nowrap shrink-0 ${
                  activeMediaTab === '3d'
                    ? 'bg-rose-600 text-white'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                3D Studio Customizer
              </button>

              {car.showroom && (
                <button
                  type="button"
                  onClick={() => setActiveMediaTab('showroom')}
                  className={`px-4 py-2 rounded-md font-medium text-xs transition-colors whitespace-nowrap shrink-0 ${
                    activeMediaTab === 'showroom'
                      ? 'bg-rose-600 text-white'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Showroom Floor Bay
                </button>
              )}

              <button
                type="button"
                onClick={() => setActiveMediaTab('gallery')}
                className={`px-4 py-2 rounded-md font-medium text-xs transition-colors whitespace-nowrap shrink-0 ${
                  activeMediaTab === 'gallery'
                    ? 'bg-rose-600 text-white'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Still Photography
              </button>
            </div>

            {car.slot && (
              <div className="text-xs text-slate-400 font-mono tabular-nums">
                <span>{car.showroom?.name}</span>
                <span aria-hidden="true" className="mx-2">·</span>
                <span className="text-slate-200">Bay {car.slot.label}</span>
              </div>
            )}
          </div>

          {/* Interactive 3D / Gallery Viewport */}
          <div className="h-[480px] sm:h-[540px] rounded-2xl overflow-hidden border border-white/[0.08] bg-[#090B10] relative">
            {activeMediaTab === '3d' ? (
              <CarViewer3D car={car} className="w-full h-full" allowCustomize={true} />
            ) : activeMediaTab === 'showroom' && car.showroom ? (
              <ShowroomViewer3D showroom={car.showroom} targetCar={car} className="w-full h-full" />
            ) : (
              <div className="w-full h-full flex flex-col p-4 bg-[#090B10]">
                <div className="flex-1 rounded-xl overflow-hidden bg-[#11151F] relative mb-3">
                  <img
                    src={selectedGalleryImg}
                    alt={car.title}
                    referrerPolicy="no-referrer"
                    onError={(e) => {
                      const target = e.currentTarget;
                      if (target.src !== window.location.origin + FALLBACK_DETAIL_IMG) {
                        target.src = FALLBACK_DETAIL_IMG;
                      }
                    }}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
                  {car.images?.map((img) => (
                    <button
                      key={img.id}
                      type="button"
                      onClick={() => setSelectedGalleryImg(img.url)}
                      className={`w-24 h-16 rounded-lg overflow-hidden border shrink-0 transition-all ${
                        selectedGalleryImg === img.url
                          ? 'border-rose-500 opacity-100'
                          : 'border-white/10 opacity-50 hover:opacity-100'
                      }`}
                    >
                      <img
                        src={img.url}
                        alt={car.title}
                        referrerPolicy="no-referrer"
                        onError={(e) => {
                          const target = e.currentTarget;
                          if (target.src !== window.location.origin + FALLBACK_DETAIL_IMG) {
                            target.src = FALLBACK_DETAIL_IMG;
                          }
                        }}
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Technical Overview & Key Specifications */}
          <div className="rounded-2xl bg-[#11151F] border border-white/[0.08] p-6 sm:p-8 space-y-6">
            <div className="space-y-2">
              <h2 className="text-xl font-semibold text-white font-display">
                Engineering & Provenance Dossier
              </h2>
              <p className="text-slate-300 text-sm leading-relaxed max-w-[70ch]">
                {car.description}
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 border-t border-white/[0.08]">
              <div className="space-y-1">
                <span className="text-xs text-slate-400 block">Odometer</span>
                <span className="text-lg font-bold text-white font-mono tabular-nums block">
                  {car.mileage.toLocaleString()} mi
                </span>
              </div>
              <div className="space-y-1">
                <span className="text-xs text-slate-400 block">Powertrain</span>
                <span className="text-lg font-bold text-white font-display block">
                  {car.fuel}
                </span>
              </div>
              <div className="space-y-1">
                <span className="text-xs text-slate-400 block">Transmission</span>
                <span className="text-lg font-bold text-white font-display block truncate">
                  {car.transmission}
                </span>
              </div>
              <div className="space-y-1">
                <span className="text-xs text-slate-400 block">Exterior Finish</span>
                <span className="text-lg font-bold text-white font-display block truncate">
                  {car.color}
                </span>
              </div>
            </div>
          </div>

          {/* Factory Equipment */}
          {car.features && car.features.length > 0 && (
            <div className="rounded-2xl bg-[#11151F] border border-white/[0.08] p-6 sm:p-8 space-y-4">
              <h3 className="text-base font-semibold text-white font-display">
                Factory Specification & Option Codes
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {car.features.map((feat) => (
                  <div
                    key={feat.id}
                    className="flex items-center gap-2.5 text-xs text-slate-200 p-3.5 rounded-xl bg-[#090B10] border border-white/[0.06]"
                  >
                    <CheckCircle2 className="w-4 h-4 text-rose-500 shrink-0" />
                    <span>{feat.name}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Financing & Amortization Estimator */}
          <div className="rounded-2xl bg-[#11151F] border border-white/[0.08] p-6 sm:p-8 space-y-6">
            <div className="flex items-baseline justify-between">
              <h3 className="text-base font-semibold text-white font-display">
                Lease & Financing Structure
              </h3>
              <span className="text-xs font-mono tabular-nums text-slate-400">
                {interestRate}% Tier-1 APR
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 items-center">
              <div className="sm:col-span-2 space-y-4">
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-400">Down Payment ({downPaymentPct}%)</span>
                    <span className="text-white font-mono tabular-nums font-semibold">
                      ${Math.round(downPaymentAmount).toLocaleString()}
                    </span>
                  </div>
                  <input
                    type="range"
                    min="10"
                    max="60"
                    step="5"
                    value={downPaymentPct}
                    onChange={(e) => setDownPaymentPct(Number(e.target.value))}
                    className="w-full cursor-pointer"
                  />
                </div>

                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-400">Amortization Term</span>
                    <span className="text-white font-mono tabular-nums font-semibold">
                      {loanTermMonths} Months
                    </span>
                  </div>
                  <input
                    type="range"
                    min="24"
                    max="84"
                    step="12"
                    value={loanTermMonths}
                    onChange={(e) => setLoanTermMonths(Number(e.target.value))}
                    className="w-full cursor-pointer"
                  />
                </div>
              </div>

              <div className="p-5 rounded-xl bg-[#090B10] border border-white/[0.08] text-center space-y-1">
                <span className="text-xs text-slate-400 block">Estimated Monthly</span>
                <span className="text-3xl font-bold text-white font-mono tabular-nums block">
                  ${Math.round(monthlyPayment).toLocaleString()}
                </span>
                <span className="text-[11px] text-slate-500 block">/ month</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Sticky Contiguous Purchase Module (4 cols) */}
        <div className="lg:col-span-4 lg:sticky lg:top-28">
          <div className="p-6 sm:p-8 rounded-2xl bg-[#11151F] border border-white/[0.1] space-y-6">
            {/* Unboxed Metadata & Title */}
            <div className="space-y-2 pb-5 border-b border-white/[0.08]">
              <div className="flex items-center gap-1.5 text-xs text-slate-400">
                <span className="uppercase tracking-wider text-slate-300 font-medium">
                  {car.model?.brand?.name}
                </span>
                <span aria-hidden="true">·</span>
                <span className="font-mono tabular-nums">{car.year}</span>
                <span aria-hidden="true">·</span>
                <span>{car.condition}</span>
              </div>

              <h1 className="text-2xl font-bold text-white font-display tracking-tight">
                {car.title}
              </h1>

              <p className="text-xs font-mono tabular-nums text-slate-400">
                VIN: {car.vin} · Status: <span className="text-emerald-400 capitalize">{car.status}</span>
              </p>
            </div>

            {/* Pricing */}
            <div className="space-y-1">
              <span className="text-xs text-slate-400 block"> Showroom Acquisition Price</span>
              <div className="text-4xl font-bold text-white font-mono tabular-nums">
                ${car.price.toLocaleString()}
              </div>
              <p className="text-xs text-slate-400 font-mono tabular-nums pt-0.5">
                Est. ${Math.round(monthlyPayment).toLocaleString()}/mo with {downPaymentPct}% down
              </p>
            </div>

            {/* Selected Location & Bay */}
            {car.showroom && (
              <div className="p-4 rounded-xl bg-[#090B10] border border-white/[0.06] space-y-1 text-xs">
                <div className="flex justify-between text-slate-400">
                  <span>Showroom Location</span>
                  <span className="font-mono tabular-nums text-slate-300">{car.showroom.code}</span>
                </div>
                <p className="font-medium text-white">{car.showroom.name}</p>
                {car.slot && (
                  <p className="text-slate-400 font-mono tabular-nums">
                    Allocated Position: Bay {car.slot.label}
                  </p>
                )}
              </div>
            )}

            {/* Primary & Secondary Actions */}
            <div className="space-y-3 pt-2">
              <button
                type="button"
                onClick={() => setBookingModal('reserve')}
                disabled={car.status === 'sold'}
                className="w-full py-3.5 px-4 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-semibold text-xs transition-colors flex items-center justify-center gap-2 whitespace-nowrap shrink-0"
              >
                <span>Reserve Vehicle ($500 Deposit)</span>
              </button>

              <button
                type="button"
                onClick={() => setBookingModal('test_drive')}
                className="w-full py-3 px-4 rounded-xl bg-[#161B26] hover:bg-white/[0.08] text-white font-semibold text-xs transition-colors border border-white/[0.1] flex items-center justify-center gap-2 whitespace-nowrap shrink-0"
              >
                <Calendar className="w-3.5 h-3.5 text-rose-400" />
                <span>Schedule Private Viewing</span>
              </button>

              <button
                type="button"
                onClick={() => setBookingModal('enquiry')}
                className="w-full py-3 px-4 rounded-xl bg-[#090B10] hover:bg-white/[0.04] text-slate-300 hover:text-white font-medium text-xs transition-colors border border-white/[0.08] whitespace-nowrap shrink-0"
              >
                Request Dossier & Inspection Sheet
              </button>
            </div>

            <div className="pt-4 border-t border-white/[0.08] text-xs text-slate-400 space-y-2">
              <p>· 150-Point Factory Telemetry Certification</p>
              <p>· JEVIC Verified Odometer & Original Auction Sheet</p>
              <p>· Enclosed Climate-Controlled Delivery Available</p>
            </div>
          </div>
        </div>
      </div>

      {/* Similar Vehicles */}
      {similarCars.length > 0 && (
        <div className="space-y-6 pt-10 border-t border-white/[0.08]">
          <div className="flex items-baseline justify-between">
            <h3 className="text-xl font-bold text-white font-display">
              Comparable Showroom Allocations
            </h3>
            <span className="text-xs text-slate-400">Available for immediate inspection</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {similarCars.slice(0, 3).map((simCar) => (
              <div
                key={simCar.id}
                onClick={() => onSelectSimilar(simCar)}
                className="group rounded-2xl bg-[#11151F] border border-white/[0.08] hover:border-white/[0.22] overflow-hidden transition-all cursor-pointer card-hover-lift"
              >
                <div className="aspect-[4/3] bg-[#090B10] overflow-hidden">
                  <img
                    src={simCar.images?.[0]?.url || FALLBACK_DETAIL_IMG}
                    alt={simCar.title}
                    referrerPolicy="no-referrer"
                    onError={(e) => {
                      const target = e.currentTarget;
                      if (target.src !== window.location.origin + FALLBACK_DETAIL_IMG) {
                        target.src = FALLBACK_DETAIL_IMG;
                      }
                    }}
                    className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-200"
                  />
                </div>
                <div className="p-5 space-y-1.5">
                  <div className="text-xs text-slate-400">
                    <span>{simCar.model?.brand?.name}</span>
                    <span aria-hidden="true" className="mx-1.5">·</span>
                    <span className="font-mono tabular-nums">{simCar.year}</span>
                  </div>
                  <h4 className="text-base font-semibold text-white line-clamp-1 font-display">
                    {simCar.title}
                  </h4>
                  <p className="text-white font-mono tabular-nums font-bold text-sm pt-1">
                    ${simCar.price.toLocaleString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Booking Modal */}
      {bookingModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/80 backdrop-blur-md animate-fade-in-up">
          <form
            onSubmit={handleBookingSubmit}
            className="relative w-full max-w-lg rounded-2xl bg-[#11151F] border border-white/[0.15] p-6 sm:p-8 space-y-5"
          >
            <div className="flex items-center justify-between pb-4 border-b border-white/[0.08]">
              <div>
                <h3 className="text-xl font-bold text-white font-display">
                  {bookingModal === 'reserve'
                    ? 'Reserve Vehicle Allocation'
                    : bookingModal === 'test_drive'
                    ? 'Schedule Private Viewing'
                    : 'Request Vehicle Dossier'}
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">{car.title}</p>
              </div>
              <button
                type="button"
                onClick={() => setBookingModal(null)}
                className="p-2 rounded-lg hover:bg-white/[0.06] text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div>
                <label className="font-medium text-slate-300 block mb-1.5">Full Name</label>
                <input
                  type="text"
                  required
                  placeholder="Jonathan Vance"
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-lg bg-[#090B10] border border-white/[0.1] text-white text-xs focus:outline-none focus:border-rose-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="font-medium text-slate-300 block mb-1.5">Phone Number</label>
                  <input
                    type="tel"
                    required
                    placeholder="+1 (212) 555-0199"
                    value={clientPhone}
                    onChange={(e) => setClientPhone(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-lg bg-[#090B10] border border-white/[0.1] text-white text-xs focus:outline-none focus:border-rose-500"
                  />
                </div>
                <div>
                  <label className="font-medium text-slate-300 block mb-1.5">Email Address</label>
                  <input
                    type="email"
                    required
                    placeholder="client@domain.com"
                    value={clientEmail}
                    onChange={(e) => setClientEmail(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-lg bg-[#090B10] border border-white/[0.1] text-white text-xs focus:outline-none focus:border-rose-500"
                  />
                </div>
              </div>

              {bookingModal === 'test_drive' && (
                <div>
                  <label className="font-medium text-slate-300 block mb-1.5">Preferred Date & Time</label>
                  <input
                    type="datetime-local"
                    required
                    value={testDriveDate}
                    onChange={(e) => setTestDriveDate(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-lg bg-[#090B10] border border-white/[0.1] text-white text-xs font-mono focus:outline-none focus:border-rose-500"
                  />
                </div>
              )}

              {bookingModal === 'enquiry' && (
                <div>
                  <label className="font-medium text-slate-300 block mb-1.5">Notes or Questions</label>
                  <textarea
                    rows={3}
                    placeholder="Inquire about JEVIC auction dossier, leasing terms, or trade-in..."
                    value={clientMessage}
                    onChange={(e) => setClientMessage(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-lg bg-[#090B10] border border-white/[0.1] text-white text-xs focus:outline-none focus:border-rose-500"
                  />
                </div>
              )}

              {bookingModal === 'reserve' && (
                <div className="p-4 rounded-xl bg-[#090B10] border border-white/[0.08] text-xs text-slate-300 space-y-1">
                  <p className="font-semibold text-white font-mono tabular-nums">
                    Refundable Hold Deposit: $500.00 USD
                  </p>
                  <p className="text-slate-400">
                    Locks exclusive right of first refusal on VIN {car.vin} for 72 hours.
                  </p>
                </div>
              )}
            </div>

            <button
              type="submit"
              disabled={bookingLoading}
              className="w-full py-3.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-semibold text-xs transition-colors"
            >
              {bookingLoading ? 'Processing...' : 'Confirm Request'}
            </button>
          </form>
        </div>
      )}
    </div>
  );
};
