import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { Showroom } from '../../types';
import {
  Radio,
  Plus,
  RefreshCw,
  Key,
  MapPin,
  Clock,
  TrendingUp,
  UserCheck,
  ShieldCheck,
  X,
  AlertCircle,
} from 'lucide-react';

export const AdminKioskManager: React.FC = () => {
  const [kiosks, setKiosks] = useState<any[]>([]);
  const [showrooms, setShowrooms] = useState<Showroom[]>([]);
  const [loading, setLoading] = useState(true);
  const [registerModalOpen, setRegisterModalOpen] = useState(false);

  const loadData = async () => {
    try {
      const [kiosksRes, showroomsRes] = await Promise.all([
        api.getKiosks(),
        api.getShowrooms(),
      ]);
      setKiosks(kiosksRes.data);
      setShowrooms(showroomsRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleRefreshKiosk = (kioskName: string) => {
    alert(`Remote refresh command broadcast to '${kioskName}'. The browser viewport will reload in 2 seconds.`);
  };

  return (
    <div className="p-8 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-black text-white font-display">Kiosk Hardware & Terminal Fleet</h2>
          <p className="text-sm text-slate-400">Monitor showroom touch screens, generate device tokens, and configure 'You Are Here' anchor positions</p>
        </div>

        <button
          onClick={() => setRegisterModalOpen(true)}
          className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-sm uppercase tracking-wide transition-all shadow-lg"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          <span>Register New Kiosk</span>
        </button>
      </div>

      {/* Fleet Stats Overview */}
      <div className="grid grid-cols-3 gap-5">
        <div className="p-5 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase">Registered Kiosks</p>
            <h4 className="text-2xl font-black text-white font-mono mt-1">{kiosks.length} Units</h4>
          </div>
          <div className="p-3 rounded-2xl bg-emerald-500/20 text-emerald-400">
            <Radio className="w-6 h-6" />
          </div>
        </div>

        <div className="p-5 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase">Avg Customer Session</p>
            <h4 className="text-2xl font-black text-white font-mono mt-1">2m 25s</h4>
          </div>
          <div className="p-3 rounded-2xl bg-sky-500/20 text-sky-400">
            <Clock className="w-6 h-6" />
          </div>
        </div>

        <div className="p-5 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase">Kiosk Conversion Rate</p>
            <h4 className="text-2xl font-black text-white font-mono mt-1">22.5%</h4>
          </div>
          <div className="p-3 rounded-2xl bg-purple-500/20 text-purple-400">
            <TrendingUp className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Kiosks List Grid */}
      <div className="grid grid-cols-3 gap-6">
        {kiosks.map((kiosk) => {
          const isOnline = kiosk.status === 'online';
          return (
            <div
              key={kiosk.id}
              className="rounded-3xl bg-slate-900 border border-slate-800 p-6 flex flex-col justify-between shadow-xl space-y-4"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
                    {kiosk.showroom?.name || 'Showroom'}
                  </span>
                  <span
                    className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase ${
                      isOnline
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                        : 'bg-red-500/20 text-red-400 border border-red-500/40'
                    }`}
                  >
                    <span className={`w-2 h-2 rounded-full ${isOnline ? 'bg-emerald-400 animate-ping' : 'bg-red-400'}`} />
                    {kiosk.status}
                  </span>
                </div>

                <h3 className="text-xl font-bold text-white font-display">{kiosk.name}</h3>

                {/* 'You Are Here' Coordinates */}
                <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 space-y-1 text-xs">
                  <div className="flex justify-between text-slate-400">
                    <span className="flex items-center gap-1 font-semibold">
                      <MapPin className="w-3.5 h-3.5 text-sky-400" />
                      'You Are Here' Position:
                    </span>
                    <span className="font-mono text-white">
                      X: {kiosk.pos_x.toFixed(1)}m, Z: {kiosk.pos_z.toFixed(1)}m
                    </span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>Floor Level:</span>
                    <span className="text-white font-semibold">{kiosk.floor?.name || 'Level 1'}</span>
                  </div>
                </div>

                {/* Device Authentication Token */}
                <div className="space-y-1">
                  <span className="text-[11px] text-slate-500 font-semibold uppercase tracking-wider flex items-center gap-1">
                    <Key className="w-3 h-3 text-emerald-400" /> Device Token
                  </span>
                  <div className="px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 font-mono text-xs text-slate-300 break-all select-all">
                    {kiosk.token}
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 pt-3 border-t border-slate-800">
                <button
                  onClick={() => handleRefreshKiosk(kiosk.name)}
                  className="flex-1 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-200 text-xs font-bold transition-colors flex items-center justify-center gap-1.5"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Send Refresh</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Register Modal */}
      {registerModalOpen && (
        <RegisterKioskModal
          showrooms={showrooms}
          onClose={() => setRegisterModalOpen(false)}
          onSuccess={(newKiosk) => {
            setKiosks((prev) => [...prev, newKiosk]);
            setRegisterModalOpen(false);
          }}
        />
      )}
    </div>
  );
};

// Subcomponent: Register Kiosk Modal
function RegisterKioskModal({
  showrooms,
  onClose,
  onSuccess,
}: {
  showrooms: Showroom[];
  onClose: () => void;
  onSuccess: (kiosk: any) => void;
}) {
  const [name, setName] = useState('');
  const [showroomId, setShowroomId] = useState(showrooms[0]?.id || 1);
  const [posX, setPosX] = useState('0');
  const [posZ, setPosZ] = useState('8.5');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.createKiosk({
        name,
        showroom_id: showroomId,
        pos_x: Number(posX),
        pos_y: 0,
        pos_z: Number(posZ),
        status: 'online',
      });
      alert('Kiosk device registered successfully. Secure device token generated.');
      onSuccess(res.data);
    } catch (err: any) {
      alert(err.message || 'Error registering kiosk.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <form onSubmit={handleSubmit} className="relative w-full max-w-lg rounded-3xl bg-slate-900 border border-slate-700 shadow-2xl p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-bold text-white">Register Kiosk Device</h3>
          <button type="button" onClick={onClose} className="p-2 rounded-full hover:bg-slate-800 text-slate-400">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-3 text-sm">
          <div>
            <label className="text-xs font-semibold text-slate-400 block mb-1">Terminal Device Name</label>
            <input
              type="text"
              required
              placeholder="e.g. South Gallery Interactive Panel"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-400 block mb-1">Showroom Location</label>
            <select
              value={showroomId}
              onChange={(e) => setShowroomId(Number(e.target.value))}
              className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm focus:outline-none focus:border-emerald-500"
            >
              {showrooms.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-slate-400 block mb-1">Kiosk Anchor X (m)</label>
              <input
                type="number"
                step="0.5"
                required
                value={posX}
                onChange={(e) => setPosX(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm focus:outline-none focus:border-emerald-500"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-400 block mb-1">Kiosk Anchor Z (m)</label>
              <input
                type="number"
                step="0.5"
                required
                value={posZ}
                onChange={(e) => setPosZ(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3.5 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-sm uppercase tracking-wider transition-all shadow-lg"
        >
          {loading ? 'Registering...' : 'Generate Token & Activate Kiosk'}
        </button>
      </form>
    </div>
  );
}

