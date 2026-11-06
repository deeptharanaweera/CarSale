import React, { useState, useEffect } from 'react';
import { User, Car } from '../../types';
import { api } from '../../services/api';
import { X, User as UserIcon, Lock, Mail, Phone, LogOut, Sparkles, ShieldCheck, CheckCircle2 } from 'lucide-react';

interface UserAccountModalProps {
  onClose: () => void;
  onSelectCar: (car: Car) => void;
}

export const UserAccountModal: React.FC<UserAccountModalProps> = ({ onClose, onSelectCar }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('customer@example.com');
  const [password, setPassword] = useState('password');
  const [name, setName] = useState('David Miller');
  const [phone, setPhone] = useState('+1 (555) 010-0004');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (api.getAuthToken()) {
      api.getProfile()
        .then((res) => {
          setUser(res.data);
        })
        .catch(() => {});
    }
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (isRegister) {
        const res = await api.register({
          name,
          email,
          phone,
          password,
          password_confirmation: password,
        });
        setUser(res.data.user);
      } else {
        const res = await api.login(email, password);
        setUser(res.data.user);
      }
    } catch (err: any) {
      alert(err.message || 'Login failed. Please check credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    api.setAuthToken(null);
    setUser(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-950/85 backdrop-blur-md animate-fade-in-up">
      <div className="relative w-full max-w-lg rounded-3xl glass-panel-elevated border border-white/20 shadow-2xl p-6 sm:p-8 flex flex-col max-h-[90vh] overflow-y-auto no-scrollbar">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-6 right-6 p-2 rounded-full hover:bg-slate-800 text-slate-400 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {!user ? (
          /* Login / Register Form */
          <div className="space-y-6">
            <div className="space-y-1">
              <span className="text-xs font-bold uppercase tracking-widest text-emerald-400 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Aura Motors VIP Concierge</span>
              </span>
              <h3 className="text-3xl font-black text-white font-display">
                {isRegister ? 'Join Luxury Concierge' : 'Welcome Back'}
              </h3>
              <p className="text-xs text-slate-400">
                Sign in to manage test drive schedules, deposit reservations, and saved vehicle builds.
              </p>
            </div>

            <form onSubmit={handleLogin} className="space-y-4">
              {isRegister && (
                <div>
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">
                    Full Name
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-4 py-3 rounded-2xl bg-slate-950 border border-white/10 text-white text-sm focus:outline-none focus:border-emerald-500"
                  />
                </div>
              )}

              <div>
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 rounded-2xl bg-slate-950 border border-white/10 text-white text-sm focus:outline-none focus:border-emerald-500"
                />
              </div>

              {isRegister && (
                <div>
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-4 py-3 rounded-2xl bg-slate-950 border border-white/10 text-white text-sm focus:outline-none focus:border-emerald-500"
                  />
                </div>
              )}

              <div>
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">
                  Password
                </label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 rounded-2xl bg-slate-950 border border-white/10 text-white text-sm focus:outline-none focus:border-emerald-500"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black text-sm uppercase tracking-wider transition-all shadow-xl shadow-emerald-500/30"
              >
                {loading ? 'Authenticating...' : isRegister ? 'Create Concierge Profile' : 'Sign In'}
              </button>
            </form>

            <div className="text-center pt-2">
              <button
                type="button"
                onClick={() => setIsRegister(!isRegister)}
                className="text-xs font-semibold text-slate-400 hover:text-emerald-400 transition-colors"
              >
                {isRegister
                  ? 'Already have an account? Sign In'
                  : "Don't have an account yet? Create One"}
              </button>
            </div>
          </div>
        ) : (
          /* Profile View */
          <div className="space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-white/10">
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 text-slate-950 font-black text-lg flex items-center justify-center">
                  {user.name.charAt(0)}
                </div>
                <div>
                  <span className="text-xs font-bold uppercase tracking-widest text-emerald-400">
                    VIP Client Profile
                  </span>
                  <h3 className="text-2xl font-black text-white font-display">{user.name}</h3>
                  <p className="text-xs text-slate-400">{user.email}</p>
                </div>
              </div>

              <button
                onClick={handleLogout}
                className="p-2.5 rounded-2xl bg-slate-900 hover:bg-red-950/50 hover:text-red-400 text-slate-400 border border-white/10 transition-colors"
                title="Log Out"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="p-4 rounded-2xl bg-slate-950 border border-white/10 text-xs space-y-1">
                <span className="text-slate-500 uppercase font-semibold">Concierge Tier</span>
                <p className="font-bold text-emerald-400 capitalize">{user.role.replace('_', ' ')}</p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-950 border border-white/10 text-xs space-y-1">
                <span className="text-slate-500 uppercase font-semibold">Assigned Showroom</span>
                <p className="font-bold text-white">{user.showroom?.name || 'All Dealerships'}</p>
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-emerald-950/40 border border-emerald-500/30 text-xs text-emerald-200 space-y-2">
              <p className="font-bold text-white text-sm flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>VIP Priority Status: Active</span>
              </p>
              <p className="text-slate-300">
                You have active VIP privileges. Any scheduled private test drive or vehicle inquiry will automatically be routed directly to the Showroom General Director.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
