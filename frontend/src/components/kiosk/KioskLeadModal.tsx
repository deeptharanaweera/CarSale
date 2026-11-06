import React, { useState } from 'react';
import { Car, KioskConfig } from '../../types';
import { api } from '../../services/api';
import { KioskVirtualKeyboard } from './KioskVirtualKeyboard';
import { X, PhoneCall, Calendar, QrCode, CheckCircle2, User, Phone, Sparkles } from 'lucide-react';
import confetti from 'canvas-confetti';

interface KioskLeadModalProps {
  car?: Car;
  kioskConfig: KioskConfig;
  initialTab?: 'staff' | 'test_drive' | 'qr';
  onClose: () => void;
}

export const KioskLeadModal: React.FC<KioskLeadModalProps> = ({
  car,
  kioskConfig,
  initialTab = 'staff',
  onClose,
}) => {
  const [tab, setTab] = useState<'staff' | 'test_drive' | 'qr'>(initialTab);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [activeField, setActiveField] = useState<'name' | 'phone'>('name');
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleVirtualKey = (ch: string) => {
    if (activeField === 'name') {
      setName((prev) => prev + ch);
    } else {
      setPhone((prev) => prev + ch);
    }
  };

  const handleVirtualBackspace = () => {
    if (activeField === 'name') {
      setName((prev) => prev.slice(0, -1));
    } else {
      setPhone((prev) => prev.slice(0, -1));
    }
  };

  const handleSubmit = async (action: 'call_staff' | 'test_drive') => {
    if (!name.trim() || !phone.trim()) {
      alert('Please enter your Name and Phone Number using the touch keyboard.');
      return;
    }

    setLoading(true);
    try {
      const res = await api.submitKioskLead({
        car_id: car?.id,
        name,
        phone,
        action,
      });

      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.6 },
      });

      setSuccessMessage(
        res.message ||
          (action === 'call_staff'
            ? 'A Showroom Specialist has been dispatched to this kiosk terminal!'
            : 'Test drive booked! Our concierge is preparing the keys.')
      );

      // Auto close after 4 seconds
      setTimeout(() => {
        onClose();
      }, 4000);
    } catch (err: any) {
      alert(err.message || 'Error submitting request.');
    } finally {
      setLoading(false);
    }
  };

  // Generate mobile handoff URL for QR code
  const phoneHandoffUrl = window.location.origin + (car ? `/cars/${car.slug}` : '/');
  const qrCodeApiUrl = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(
    phoneHandoffUrl
  )}&bgcolor=0f172a&color=10b981&qzone=2`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-slate-950/85 backdrop-blur-xl animate-fadeIn">
      <div className="relative w-full max-w-2xl rounded-3xl bg-slate-900 border border-slate-700 shadow-2xl p-8 flex flex-col max-h-[90vh] overflow-y-auto no-scrollbar">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-6 right-6 p-3 rounded-full bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 transition-colors touch-target"
        >
          <X className="w-6 h-6" />
        </button>

        {/* Modal Header */}
        <div className="mb-6">
          <span className="text-xs font-bold uppercase tracking-widest text-emerald-400">
            Showroom Concierge Assistance
          </span>
          <h3 className="text-2xl font-black text-white font-display mt-1">
            {car ? car.title : kioskConfig.showroom.name}
          </h3>
        </div>

        {/* Action Tabs */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          <button
            onClick={() => {
              setTab('staff');
              setSuccessMessage(null);
            }}
            className={`py-3.5 px-4 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 transition-all touch-target ${
              tab === 'staff'
                ? 'bg-emerald-500 text-slate-950 shadow-lg shadow-emerald-500/25'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-750'
            }`}
          >
            <PhoneCall className="w-4 h-4" />
            <span>Call Specialist</span>
          </button>

          <button
            onClick={() => {
              setTab('test_drive');
              setSuccessMessage(null);
            }}
            className={`py-3.5 px-4 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 transition-all touch-target ${
              tab === 'test_drive'
                ? 'bg-emerald-500 text-slate-950 shadow-lg shadow-emerald-500/25'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-750'
            }`}
          >
            <Calendar className="w-4 h-4" />
            <span>Test Drive</span>
          </button>

          <button
            onClick={() => {
              setTab('qr');
              setSuccessMessage(null);
            }}
            className={`py-3.5 px-4 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 transition-all touch-target ${
              tab === 'qr'
                ? 'bg-emerald-500 text-slate-950 shadow-lg shadow-emerald-500/25'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-750'
            }`}
          >
            <QrCode className="w-4 h-4" />
            <span>Open on Phone</span>
          </button>
        </div>

        {/* Content State */}
        {successMessage ? (
          <div className="py-12 flex flex-col items-center text-center space-y-4 animate-fadeIn">
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <h4 className="text-2xl font-bold text-white">Request Dispatched!</h4>
            <p className="text-slate-300 max-w-md">{successMessage}</p>
            <p className="text-xs text-slate-500">Screen will reset automatically shortly...</p>
          </div>
        ) : tab === 'qr' ? (
          <div className="py-6 flex flex-col items-center text-center space-y-4">
            <div className="p-4 rounded-3xl bg-slate-950 border border-slate-700 shadow-xl">
              <img
                src={qrCodeApiUrl}
                alt="QR Code Phone Handoff"
                className="w-48 h-48 rounded-xl object-contain"
              />
            </div>
            <div className="space-y-1">
              <h4 className="text-lg font-bold text-white">Scan to Take This Vehicle with You</h4>
              <p className="text-sm text-slate-400 max-w-sm">
                Point your smartphone camera to access 360° views, complete specifications, and share with family or friends.
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Input fields */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-slate-400 mb-1 flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-emerald-400" />
                  Your Full Name
                </label>
                <div
                  onClick={() => setActiveField('name')}
                  className={`w-full h-14 px-4 rounded-2xl flex items-center text-lg font-medium cursor-pointer transition-all border ${
                    activeField === 'name'
                      ? 'bg-slate-800 border-emerald-500 text-white ring-2 ring-emerald-500/30'
                      : 'bg-slate-800/60 border-slate-700 text-slate-300'
                  }`}
                >
                  {name || <span className="text-slate-500">Tap to enter name</span>}
                  {activeField === 'name' && <span className="w-2 h-6 ml-1 bg-emerald-400 animate-pulse" />}
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-400 mb-1 flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-emerald-400" />
                  Mobile Phone Number
                </label>
                <div
                  onClick={() => setActiveField('phone')}
                  className={`w-full h-14 px-4 rounded-2xl flex items-center text-lg font-medium cursor-pointer transition-all border ${
                    activeField === 'phone'
                      ? 'bg-slate-800 border-emerald-500 text-white ring-2 ring-emerald-500/30'
                      : 'bg-slate-800/60 border-slate-700 text-slate-300'
                  }`}
                >
                  {phone || <span className="text-slate-500">Tap to enter phone</span>}
                  {activeField === 'phone' && <span className="w-2 h-6 ml-1 bg-emerald-400 animate-pulse" />}
                </div>
              </div>
            </div>

            {/* Virtual Touch Keyboard */}
            <KioskVirtualKeyboard
              onKeyPress={handleVirtualKey}
              onBackspace={handleVirtualBackspace}
              onEnter={() => {
                if (activeField === 'name') {
                  setActiveField('phone');
                } else {
                  handleSubmit(tab === 'staff' ? 'call_staff' : 'test_drive');
                }
              }}
              className="mt-4"
            />

            {/* Action Submit Button */}
            <button
              onClick={() => handleSubmit(tab === 'staff' ? 'call_staff' : 'test_drive')}
              disabled={loading}
              className="w-full h-16 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 font-black text-lg uppercase tracking-wider hover:opacity-90 active:scale-[0.99] transition-all shadow-xl shadow-emerald-500/25 flex items-center justify-center gap-2 mt-4 touch-target"
            >
              <Sparkles className="w-5 h-5" />
              <span>{loading ? 'Transmitting...' : tab === 'staff' ? 'Dispatch Specialist Now' : 'Confirm Test Drive Booking'}</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

