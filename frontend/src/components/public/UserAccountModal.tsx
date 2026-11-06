import React, { useState, useEffect } from 'react';
import { User, Car } from '../../types';
import { api } from '../../services/api';
import { X, LogOut } from 'lucide-react';

interface UserAccountModalProps {
  onClose: () => void;
  onSelectCar: (car: Car) => void;
}

export const UserAccountModal: React.FC<UserAccountModalProps> = ({ onClose }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('client@auramotors.com');
  const [password, setPassword] = useState('password');
  const [name, setName] = useState('Jonathan Vance');
  const [phone, setPhone] = useState('+1 (212) 555-0199');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (api.getAuthToken()) {
      api
        .getProfile()
        .then((res) => {
          if (res.data) setUser(res.data);
        })
        .catch(() => {});
    }
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);
    try {
      if (isRegister) {
        const res = await api.register({
          name,
          email,
          phone,
          password,
          password_confirmation: password,
        });
        setUser(
          res.data?.user || {
            id: 1,
            name,
            email,
            phone,
            role: 'customer',
          }
        );
      } else {
        const res = await api.login(email, password);
        setUser(
          res.data?.user || {
            id: 1,
            name,
            email,
            phone,
            role: 'customer',
          }
        );
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Unable to authenticate. Please verify your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    api.setAuthToken(null);
    setUser(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/80 backdrop-blur-md animate-fade-in-up">
      <div className="relative w-full max-w-md rounded-2xl bg-[#11151F] border border-white/[0.15] p-6 sm:p-8 flex flex-col">
        <button
          type="button"
          onClick={onClose}
          className="absolute top-6 right-6 p-2 rounded-lg hover:bg-white/[0.06] text-slate-400 hover:text-white transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        {!user ? (
          <div className="space-y-6">
            <div className="space-y-1">
              <span className="text-xs text-slate-400 block">Private Client Portal</span>
              <h3 className="text-2xl font-bold text-white font-display">
                {isRegister ? 'Create Client Profile' : 'Client Sign In'}
              </h3>
              <p className="text-xs text-slate-400">
                Manage private showroom viewings, vehicle holds, and saved 3D configurations.
              </p>
            </div>

            {errorMsg && (
              <div className="p-3 rounded-lg bg-rose-950/60 border border-rose-500/40 text-xs text-rose-200">
                {errorMsg}
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-4 text-xs">
              {isRegister && (
                <div>
                  <label className="font-medium text-slate-300 block mb-1.5">Full Name</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-lg bg-[#090B10] border border-white/[0.1] text-white focus:outline-none focus:border-rose-500"
                  />
                </div>
              )}

              <div>
                <label className="font-medium text-slate-300 block mb-1.5">Email Address</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-lg bg-[#090B10] border border-white/[0.1] text-white focus:outline-none focus:border-rose-500"
                />
              </div>

              {isRegister && (
                <div>
                  <label className="font-medium text-slate-300 block mb-1.5">Phone Number</label>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-lg bg-[#090B10] border border-white/[0.1] text-white focus:outline-none focus:border-rose-500"
                  />
                </div>
              )}

              <div>
                <label className="font-medium text-slate-300 block mb-1.5">Password</label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-lg bg-[#090B10] border border-white/[0.1] text-white focus:outline-none focus:border-rose-500"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-semibold text-xs transition-colors"
              >
                {loading ? 'Authenticating...' : isRegister ? 'Register Profile' : 'Sign In'}
              </button>
            </form>

            <div className="text-center pt-2 border-t border-white/[0.08]">
              <button
                type="button"
                onClick={() => setIsRegister(!isRegister)}
                className="text-xs text-slate-400 hover:text-white transition-colors"
              >
                {isRegister ? 'Already registered? Sign In' : 'New client? Create a Private Profile'}
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-white/[0.08]">
              <div>
                <span className="text-xs text-slate-400 block">Private Client Dossier</span>
                <h3 className="text-xl font-bold text-white font-display">{user.name}</h3>
                <p className="text-xs text-slate-400">{user.email}</p>
              </div>

              <button
                type="button"
                onClick={handleLogout}
                className="p-2 rounded-lg bg-[#090B10] hover:bg-rose-950/60 hover:text-rose-400 text-slate-400 border border-white/[0.08] transition-colors"
                title="Sign Out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3.5 rounded-xl bg-[#090B10] border border-white/[0.06] space-y-1">
                <span className="text-slate-400 block">Membership Tier</span>
                <p className="font-semibold text-white capitalize">{user.role.replace('_', ' ')}</p>
              </div>

              <div className="p-3.5 rounded-xl bg-[#090B10] border border-white/[0.06] space-y-1">
                <span className="text-slate-400 block">Home Gallery</span>
                <p className="font-semibold text-white">{user.showroom?.name || 'Manhattan Flagship'}</p>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-[#090B10] border border-white/[0.08] text-xs text-slate-300 space-y-1">
              <p className="font-semibold text-white">Priority Allocation Privileges Active</p>
              <p className="text-slate-400">
                Scheduled viewings and hold deposits are routed directly to our Flagship Gallery Director.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
