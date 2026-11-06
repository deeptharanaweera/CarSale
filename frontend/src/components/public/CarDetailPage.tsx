import React, { useState } from 'react';
import { Car } from '../../types';
import { api } from '../../services/api';
import { CarViewer3D } from '../3d/CarViewer3D';
import { ShowroomViewer3D } from '../3d/ShowroomViewer3D';
import {
  Sparkles,
  MapPin,
  Calendar,
  DollarSign,
  Phone,
  MessageSquare,
  ShieldCheck,
  CheckCircle2,
  Clock,
  Compass,
  Calculator,
  Share2,
  Heart,
  Scale,
  ArrowLeft,
  ChevronRight,
  Gauge,
  Fuel,
  X,
  Lock,
  Layers,
  ChevronDown,
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
    car.images?.[0]?.url || 'https://images.unsplash.com/photo-1614162692292-7ac56d7f7f1e?auto=format&fit=crop&w=1200&q=80'
  );

  // Modals
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
  const [interestRate, setInterestRate] = useState(6.5);

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
        confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
        setSuccessBanner('Vehicle successfully reserved with $500 deposit! Concierge contracts dispatched.');
      } else if (bookingModal === 'test_drive') {
        await api.submitTestDrive({
          car_id: car.id,
          name: clientName,
          phone: clientPhone,
          email: clientEmail,
          date_time: testDriveDate,
        });
        confetti({ particleCount: 60, spread: 60, origin: { y: 0.6 } });
        setSuccessBanner('Private test drive appointment booked! Showroom concierge will welcome you.');
      } else {
        await api.submitEnquiry({
          car_id: car.id,
          name: clientName,
          phone: clientPhone,
          email: clientEmail,
          message: clientMessage,
        });
        setSuccessBanner('Inquiry submitted. A personal luxury concierge has been assigned to your profile.');
      }
      setBookingModal(null);
    } catch (err: any) {
      alert(err.message || 'Error processing request.');
    } finally {
      setBookingLoading(false);
    }
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: car.title,
        text: `Explore this ${car.title} on Aura Motors 3D Showroom Platform`,
        url: window.location.href,
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert('Vehicle URL copied to clipboard!');
    }
  };

  return (
    <div className="w-full max-w-[1720px] mx-auto px-4 sm:px-8 xl:px-12 py-8 space-y-10 animate-fade-in-up">
      {/* Top Breadcrumb Navigation & Action Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-white/[0.08]">
        <button
          onClick={onBack}
          className="flex items-center gap-2 px-4 py-2.5 rounded-2xl glass-panel border border-white/10 text-slate-300 hover:text-white hover:border-emerald-500/50 transition-all text-xs font-bold uppercase tracking-wider group"
        >
          <ArrowLeft className="w-4 h-4 text-emerald-400 group-hover:-translate-x-1 transition-transform" />
          <span>Back to Inventory Fleet</span>
        </button>

        <div className="flex items-center gap-3">
          {onToggleCompare && (
            <button
              onClick={onToggleCompare}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl border text-xs font-bold transition-all ${
                isCompared
                  ? 'bg-emerald-500 text-slate-950 border-emerald-400 shadow-md shadow-emerald-500/20'
                  : 'glass-panel border-white/10 text-slate-300 hover:text-white'
              }`}
            >
              <Scale className="w-4 h-4" />
              <span>{isCompared ? 'In Compare Tray' : 'Compare'}</span>
            </button>
          )}

          {onToggleFavorite && (
            <button
              onClick={onToggleFavorite}
              className={`p-2.5 rounded-2xl border transition-all ${
                isFavorited
                  ? 'bg-red-500/20 text-red-400 border-red-500/40 shadow-md'
                  : 'glass-panel border-white/10 text-slate-400 hover:text-red-400'
              }`}
            >
              <Heart className={`w-4 h-4 ${isFavorited ? 'fill-current' : ''}`} />
            </button>
          )}

          <button
            onClick={handleShare}
            className="p-2.5 rounded-2xl glass-panel border border-white/10 text-slate-400 hover:text-white transition-all"
            title="Share Vehicle"
          >
            <Share2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Success Banner */}
      {successBanner && (
        <div className="p-4 rounded-3xl bg-emerald-950/80 border border-emerald-500 text-emerald-200 text-sm font-semibold flex items-center justify-between shadow-2xl animate-fade-in-down">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
            <span>{successBanner}</span>
          </div>
          <button onClick={() => setSuccessBanner(null)} className="p-1 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Hero Visual Showcase: 3D Configurator / Floor Twin / Gallery */}
      <div className="space-y-4">
        {/* View Mode Switcher Header */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 p-1 rounded-2xl bg-slate-900 border border-white/10">
            <button
              onClick={() => setActiveMediaTab('3d')}
              className={`px-4 sm:px-6 py-2 rounded-xl font-bold text-xs uppercase tracking-wider flex items-center gap-2 transition-all ${
                activeMediaTab === '3d'
                  ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 shadow-md shadow-emerald-500/20'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Sparkles className="w-4 h-4" />
              <span>3D Virtual Customizer</span>
            </button>

            {car.showroom && (
              <button
                onClick={() => setActiveMediaTab('showroom')}
                className={`px-4 sm:px-6 py-2 rounded-xl font-bold text-xs uppercase tracking-wider flex items-center gap-2 transition-all ${
                  activeMediaTab === 'showroom'
                    ? 'bg-gradient-to-r from-sky-500 to-blue-500 text-white shadow-md shadow-sky-500/20'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Compass className="w-4 h-4" />
                <span>Showroom Floor Map</span>
              </button>
            )}

            <button
              onClick={() => setActiveMediaTab('gallery')}
              className={`px-4 sm:px-6 py-2 rounded-xl font-bold text-xs uppercase tracking-wider flex items-center gap-2 transition-all ${
                activeMediaTab === 'gallery'
                  ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-md shadow-purple-500/20'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <span>Photo Gallery</span>
            </button>
          </div>

          {car.slot && (
            <div className="flex items-center gap-2 px-4 py-2 rounded-2xl glass-panel border border-white/10 text-xs text-slate-300">
              <MapPin className="w-3.5 h-3.5 text-emerald-400" />
              <span>Slot Station: <strong className="text-white">{car.slot.label}</strong></span>
            </div>
          )}
        </div>

        {/* Cinematic Viewport Container */}
        <div className="h-[540px] sm:h-[600px] rounded-3xl overflow-hidden border border-white/10 shadow-2xl bg-slate-950 relative">
          {activeMediaTab === '3d' ? (
            <CarViewer3D car={car} className="w-full h-full" allowCustomize={true} />
          ) : activeMediaTab === 'showroom' && car.showroom ? (
            <ShowroomViewer3D showroom={car.showroom} targetCar={car} className="w-full h-full" />
          ) : (
            <div className="w-full h-full flex flex-col p-4 bg-slate-950">
              <div className="flex-1 rounded-2xl overflow-hidden bg-slate-900 relative mb-3">
                <img
                  src={selectedGalleryImg}
                  alt={car.title}
                  className="w-full h-full object-contain"
                />
              </div>
              <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
                {car.images?.map((img) => (
                  <button
                    key={img.id}
                    onClick={() => setSelectedGalleryImg(img.url)}
                    className={`w-24 h-16 rounded-xl overflow-hidden border-2 shrink-0 transition-all ${
                      selectedGalleryImg === img.url
                        ? 'border-emerald-500 scale-105 shadow-md shadow-emerald-500/30'
                        : 'border-white/10 opacity-60 hover:opacity-100'
                    }`}
                  >
                    <img src={img.url} alt="thumbnail" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Main Specs & Financing Details Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Left 2 Cols: Details, Specifications, Features */}
        <div className="lg:col-span-2 space-y-8">
          {/* Header Info */}
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <span className="px-3.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                {car.condition}
              </span>
              <span className="text-xs font-mono text-slate-400">VIN: {car.vin}</span>
            </div>

            <h1 className="text-3xl sm:text-5xl font-black text-white font-display uppercase tracking-tight">
              {car.title}
            </h1>

            <p className="text-slate-300 leading-relaxed text-base font-light">
              {car.description}
            </p>
          </div>

          {/* Key Metric Highlights Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-6 rounded-3xl glass-panel border border-white/10 shadow-lg">
            <div>
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Mileage</span>
              <span className="text-2xl font-black text-white font-mono mt-1 block">
                {car.mileage.toLocaleString()} mi
              </span>
            </div>
            <div>
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Powertrain</span>
              <span className="text-2xl font-black text-white font-mono mt-1 block">
                {car.fuel}
              </span>
            </div>
            <div>
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Transmission</span>
              <span className="text-2xl font-black text-white font-mono mt-1 block truncate">
                {car.transmission.split(' ')[0]}
              </span>
            </div>
            <div>
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Exterior Finish</span>
              <span className="text-2xl font-black text-emerald-400 font-mono mt-1 block truncate">
                {car.color}
              </span>
            </div>
          </div>

          {/* Factory Packages & Installed Equipment */}
          {car.features && car.features.length > 0 && (
            <div className="p-6 rounded-3xl glass-panel border border-white/10 space-y-4 shadow-lg">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-400" />
                <span>Installed Factory Packages & Equipment</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {car.features.map((feat) => (
                  <div key={feat.id} className="flex items-center gap-2.5 text-sm text-slate-200 font-medium p-3 rounded-2xl bg-slate-950/60 border border-white/[0.06]">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>{feat.name}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Physical Showroom Location Details */}
          {car.showroom && (
            <div className="p-6 rounded-3xl glass-panel border border-white/10 space-y-4 shadow-lg">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-emerald-400" />
                  <span>Physical Vehicle Location</span>
                </h3>
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                  Ready for Immediate Inspection
                </span>
              </div>

              <div className="p-5 rounded-2xl bg-slate-950/80 border border-white/10 space-y-3">
                <div className="flex justify-between items-baseline">
                  <h4 className="text-lg font-bold text-white">{car.showroom.name}</h4>
                  <span className="text-xs text-emerald-400 font-mono font-bold">Branch {car.showroom.code}</span>
                </div>
                <p className="text-sm text-slate-300">{car.showroom.address}, {car.showroom.city}</p>
                <div className="pt-2 flex flex-wrap gap-6 text-xs text-slate-400 border-t border-white/[0.06]">
                  <span className="flex items-center gap-1.5">
                    <Clock className="w-4 h-4 text-emerald-400" />
                    {car.showroom.opening_hours}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Phone className="w-4 h-4 text-emerald-400" />
                    {car.showroom.phone}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Interactive EMI Payment Calculator */}
          <div className="p-6 rounded-3xl glass-panel border border-white/10 space-y-6 shadow-lg">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Calculator className="w-5 h-5 text-emerald-400" />
                <span>Financing & EMI Estimator</span>
              </h3>
              <span className="text-xs text-slate-400">Competitive Tier 1 APR</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 items-center">
              {/* Sliders */}
              <div className="sm:col-span-2 space-y-5">
                <div>
                  <div className="flex justify-between text-xs font-bold mb-1.5">
                    <span className="text-slate-400 uppercase tracking-wider">Down Payment ({downPaymentPct}%):</span>
                    <span className="text-emerald-400 font-mono text-sm">${Math.round(downPaymentAmount).toLocaleString()}</span>
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

                <div>
                  <div className="flex justify-between text-xs font-bold mb-1.5">
                    <span className="text-slate-400 uppercase tracking-wider">Loan Term:</span>
                    <span className="text-emerald-400 font-mono text-sm">{loanTermMonths} Months</span>
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

              {/* Monthly Amount Display */}
              <div className="p-6 rounded-2xl bg-slate-950 border border-emerald-500/30 flex flex-col justify-center text-center shadow-inner">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                  Est. Monthly Payment
                </span>
                <span className="text-3xl sm:text-4xl font-black text-emerald-400 font-mono mt-2">
                  ${Math.round(monthlyPayment).toLocaleString()}
                </span>
                <span className="text-[11px] text-slate-500 mt-1">
                  Based on {interestRate}% APR
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Col: Price Box & Booking CTAs */}
        <div className="space-y-6">
          <div className="p-8 rounded-3xl glass-panel-elevated border border-white/10 shadow-2xl space-y-6 lg:sticky lg:top-28">
            <div>
              <span className="text-xs font-bold uppercase tracking-widest text-slate-400 block mb-1">
                Purchase Price
              </span>
              <div className="text-4xl sm:text-5xl font-black text-white font-mono">
                ${car.price.toLocaleString()}
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Includes 150-point technical certification & White-Glove delivery
              </p>
            </div>

            {/* CTAs */}
            <div className="space-y-3 pt-4 border-t border-white/10">
              {/* Reserve with deposit button */}
              <button
                onClick={() => setBookingModal('reserve')}
                disabled={car.status === 'sold'}
                className="w-full py-4 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black text-sm uppercase tracking-wider transition-all shadow-xl shadow-emerald-500/30 flex items-center justify-center gap-2 group active:scale-95"
              >
                <DollarSign className="w-5 h-5 stroke-[2.5]" />
                <span>Reserve with $500 Deposit</span>
              </button>

              {/* Book Test Drive */}
              <button
                onClick={() => setBookingModal('test_drive')}
                className="w-full py-3.5 rounded-2xl bg-slate-800 hover:bg-slate-750 text-white font-bold text-xs uppercase tracking-wider transition-all border border-white/10 flex items-center justify-center gap-2 hover:border-emerald-500/40"
              >
                <Calendar className="w-4 h-4 text-emerald-400" />
                <span>Book Private Test Drive</span>
              </button>

              {/* Concierge Enquiry */}
              <button
                onClick={() => setBookingModal('enquiry')}
                className="w-full py-3.5 rounded-2xl bg-slate-950 hover:bg-slate-900 text-slate-300 hover:text-white font-bold text-xs uppercase tracking-wider transition-all border border-white/10 flex items-center justify-center gap-2"
              >
                <MessageSquare className="w-4 h-4 text-emerald-400" />
                <span>Direct Concierge Enquiry</span>
              </button>

              {/* WhatsApp Concierge direct button */}
              <a
                href={`https://wa.me/12125550199?text=Hello%20Aura%20Motors,%20I%20am%20interested%20in%20the%20${encodeURIComponent(
                  car.title
                )}%20(VIN:%20${car.vin})`}
                target="_blank"
                rel="noreferrer"
                className="w-full py-3 rounded-2xl bg-[#25D366]/15 hover:bg-[#25D366]/25 text-[#25D366] font-bold text-xs uppercase tracking-wider transition-all border border-[#25D366]/30 flex items-center justify-center gap-2"
              >
                <Phone className="w-4 h-4" />
                <span>WhatsApp Live Concierge</span>
              </a>
            </div>

            <div className="pt-4 border-t border-white/10 text-xs text-slate-400 space-y-2">
              <p className="flex items-center gap-2 font-medium">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                14-Day Money Back Guarantee
              </p>
              <p className="flex items-center gap-2 font-medium">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                150-Point Technical Inspection Passed
              </p>
              <p className="flex items-center gap-2 font-medium">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                White-Glove Enclosed Delivery Available
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Similar Vehicles Carousel */}
      {similarCars.length > 0 && (
        <div className="space-y-6 pt-12 border-t border-white/[0.08]">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs font-bold uppercase tracking-widest text-emerald-400">Curated Fleet</span>
              <h3 className="text-2xl sm:text-3xl font-black text-white font-display">Similar Performance Vehicles</h3>
            </div>
            <span className="text-xs text-slate-400">Alternative specifications</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {similarCars.slice(0, 3).map((simCar) => (
              <div
                key={simCar.id}
                onClick={() => onSelectSimilar(simCar)}
                className="group rounded-3xl glass-panel border border-white/10 hover:border-emerald-500/50 p-4 transition-all cursor-pointer shadow-lg card-hover-lift"
              >
                <div className="h-44 rounded-2xl overflow-hidden bg-slate-950 mb-3">
                  <img
                    src={simCar.images?.[0]?.url || 'https://images.unsplash.com/photo-1614162692292-7ac56d7f7f1e?auto=format&fit=crop&w=600&q=80'}
                    alt={simCar.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </div>
                <h4 className="text-base font-bold text-white line-clamp-1">{simCar.title}</h4>
                <p className="text-emerald-400 font-mono font-bold text-lg mt-1">${simCar.price.toLocaleString()}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Booking Modal */}
      {bookingModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-950/85 backdrop-blur-md animate-fade-in-up">
          <form
            onSubmit={handleBookingSubmit}
            className="relative w-full max-w-lg rounded-3xl glass-panel-elevated border border-white/20 shadow-2xl p-6 sm:p-8 space-y-5"
          >
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div>
                <h3 className="text-2xl font-black text-white font-display">
                  {bookingModal === 'reserve'
                    ? 'Reserve Vehicle with Deposit'
                    : bookingModal === 'test_drive'
                    ? 'Book Private Test Drive'
                    : 'Luxury Concierge Inquiry'}
                </h3>
                <p className="text-xs text-emerald-400 font-semibold">{car.title}</p>
              </div>
              <button
                type="button"
                onClick={() => setBookingModal(null)}
                className="p-2 rounded-full hover:bg-slate-800 text-slate-400"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3.5 text-sm">
              <div>
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Jonathan Vance"
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                  className="w-full px-4 py-3 rounded-2xl bg-slate-950 border border-white/10 text-white text-sm focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="+1 (555) 000-0000"
                    value={clientPhone}
                    onChange={(e) => setClientPhone(e.target.value)}
                    className="w-full px-4 py-3 rounded-2xl bg-slate-950 border border-white/10 text-white text-sm focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="jonathan@example.com"
                    value={clientEmail}
                    onChange={(e) => setClientEmail(e.target.value)}
                    className="w-full px-4 py-3 rounded-2xl bg-slate-950 border border-white/10 text-white text-sm focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              {bookingModal === 'test_drive' && (
                <div>
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">
                    Preferred Date & Time
                  </label>
                  <input
                    type="datetime-local"
                    required
                    value={testDriveDate}
                    onChange={(e) => setTestDriveDate(e.target.value)}
                    className="w-full px-4 py-3 rounded-2xl bg-slate-950 border border-white/10 text-white text-sm focus:outline-none focus:border-emerald-500 font-mono"
                  />
                </div>
              )}

              {bookingModal === 'enquiry' && (
                <div>
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">
                    Message / Special Inquiries
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Ask about warranty, trade-in, bespoke specifications..."
                    value={clientMessage}
                    onChange={(e) => setClientMessage(e.target.value)}
                    className="w-full px-4 py-3 rounded-2xl bg-slate-950 border border-white/10 text-white text-sm focus:outline-none focus:border-emerald-500"
                  />
                </div>
              )}

              {bookingModal === 'reserve' && (
                <div className="p-4 rounded-2xl bg-emerald-950/60 border border-emerald-500/40 text-xs text-emerald-300 space-y-1">
                  <p className="font-bold text-white text-sm">Deposit Summary: $500.00 USD</p>
                  <p>Secures exclusive right of first refusal for 72 hours. 100% refundable if purchase is not completed.</p>
                </div>
              )}
            </div>

            <button
              type="submit"
              disabled={bookingLoading}
              className="w-full py-4 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black text-sm uppercase tracking-wider transition-all shadow-xl shadow-emerald-500/30"
            >
              {bookingLoading ? 'Processing Request...' : 'Confirm & Submit'}
            </button>
          </form>
        </div>
      )}
    </div>
  );
};
