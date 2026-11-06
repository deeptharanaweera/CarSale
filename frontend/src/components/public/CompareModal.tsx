import React from 'react';
import { Car } from '../../types';
import { X, Scale, Check, Trash2, ArrowRight, Sparkles } from 'lucide-react';

interface CompareModalProps {
  cars: Car[];
  onRemove: (carId: number) => void;
  onClear: () => void;
  onClose: () => void;
  onSelectCar: (car: Car) => void;
}

export const CompareModal: React.FC<CompareModalProps> = ({
  cars,
  onRemove,
  onClear,
  onClose,
  onSelectCar,
}) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-950/85 backdrop-blur-md animate-fade-in-up">
      <div className="relative w-full max-w-5xl rounded-3xl glass-panel-elevated border border-white/20 shadow-2xl p-6 sm:p-8 flex flex-col max-h-[90vh] overflow-y-auto no-scrollbar">
        {/* Header */}
        <div className="flex items-center justify-between pb-6 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
              <Scale className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-2xl sm:text-3xl font-black text-white font-display">Side-by-Side Comparison</h3>
              <p className="text-xs text-slate-400">Comparing technical specs and pricing across {cars.length} vehicle{cars.length !== 1 ? 's' : ''}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {cars.length > 0 && (
              <button
                onClick={onClear}
                className="text-xs text-slate-400 hover:text-red-400 transition-colors font-semibold"
              >
                Clear All
              </button>
            )}
            <button onClick={onClose} className="p-2 rounded-full hover:bg-slate-800 text-slate-400">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {cars.length === 0 ? (
          <div className="py-20 text-center text-slate-400 space-y-3">
            <Scale className="w-12 h-12 mx-auto text-slate-600" />
            <p className="text-lg font-bold text-white">No Vehicles in Comparison Tray</p>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Click the scale icon on any car card in the inventory to add up to 3 vehicles for side-by-side analysis.
            </p>
          </div>
        ) : (
          <div className="pt-6 overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="py-4 px-4 w-44 text-xs font-bold uppercase tracking-wider text-slate-400">
                    Specification
                  </th>
                  {cars.map((car) => (
                    <th key={car.id} className="py-4 px-4 w-64 align-top">
                      <div className="relative space-y-3">
                        <button
                          onClick={() => onRemove(car.id)}
                          className="absolute -top-2 -right-2 p-1.5 rounded-full bg-slate-900 border border-white/10 hover:bg-red-900/50 hover:text-red-300 text-slate-400 transition-all shadow-md z-10"
                          title="Remove from comparison"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                        <div className="h-36 rounded-2xl overflow-hidden bg-slate-950 border border-white/10">
                          <img
                            src={car.images?.[0]?.url || 'https://images.unsplash.com/photo-1614162692292-7ac56d7f7f1e?auto=format&fit=crop&w=400&q=80'}
                            alt={car.title}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <h4 className="font-bold text-white text-base line-clamp-1">{car.title}</h4>
                        <p className="text-emerald-400 font-mono font-black text-xl">
                          ${car.price.toLocaleString()}
                        </p>
                        <button
                          onClick={() => {
                            onClose();
                            onSelectCar(car);
                          }}
                          className="w-full py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all shadow-md shadow-emerald-500/20"
                        >
                          <span>Explore 3D</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.08] text-xs">
                <tr>
                  <td className="py-3 px-4 font-bold text-slate-400">Year</td>
                  {cars.map((c) => (
                    <td key={c.id} className="py-3 px-4 font-mono font-bold text-white">{c.year}</td>
                  ))}
                </tr>
                <tr>
                  <td className="py-3 px-4 font-bold text-slate-400">Condition</td>
                  {cars.map((c) => (
                    <td key={c.id} className="py-3 px-4 text-slate-200">{c.condition}</td>
                  ))}
                </tr>
                <tr>
                  <td className="py-3 px-4 font-bold text-slate-400">Mileage</td>
                  {cars.map((c) => (
                    <td key={c.id} className="py-3 px-4 font-mono text-slate-300">{c.mileage.toLocaleString()} mi</td>
                  ))}
                </tr>
                <tr>
                  <td className="py-3 px-4 font-bold text-slate-400">Powertrain</td>
                  {cars.map((c) => (
                    <td key={c.id} className="py-3 px-4 text-slate-200">{c.fuel}</td>
                  ))}
                </tr>
                <tr>
                  <td className="py-3 px-4 font-bold text-slate-400">Transmission</td>
                  {cars.map((c) => (
                    <td key={c.id} className="py-3 px-4 text-slate-200">{c.transmission}</td>
                  ))}
                </tr>
                <tr>
                  <td className="py-3 px-4 font-bold text-slate-400">Showroom Branch</td>
                  {cars.map((c) => (
                    <td key={c.id} className="py-3 px-4 text-emerald-400 font-semibold">{c.showroom?.name}</td>
                  ))}
                </tr>
                <tr>
                  <td className="py-3 px-4 font-bold text-slate-400">3D Virtual Model</td>
                  {cars.map((c) => (
                    <td key={c.id} className="py-3 px-4">
                      {c.model3d ? (
                        <span className="text-emerald-400 font-bold flex items-center gap-1">
                          <Check className="w-3.5 h-3.5" /> Interactive 3D
                        </span>
                      ) : (
                        <span className="text-slate-500">Photo Only</span>
                      )}
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
