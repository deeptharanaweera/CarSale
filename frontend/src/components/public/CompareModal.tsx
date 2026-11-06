import React from 'react';
import { Car } from '../../types';
import { X, Trash2, ArrowRight } from 'lucide-react';

interface CompareModalProps {
  cars: Car[];
  onRemove: (carId: number) => void;
  onClear: () => void;
  onClose: () => void;
  onSelectCar: (car: Car) => void;
}

const FALLBACK_COMPARE_IMG = '/src/assets/images/car_bmw_m4_emerald_1793964978767.jpg';

export const CompareModal: React.FC<CompareModalProps> = ({
  cars,
  onRemove,
  onClear,
  onClose,
  onSelectCar,
}) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/80 backdrop-blur-md animate-fade-in-up">
      <div className="relative w-full max-w-5xl rounded-2xl bg-[#11151F] border border-white/[0.15] p-6 sm:p-8 flex flex-col max-h-[90vh] overflow-y-auto no-scrollbar">
        <div className="flex items-center justify-between pb-5 border-b border-white/[0.08]">
          <div>
            <h3 className="text-2xl font-bold text-white font-display">
              Side-by-Side Specification Matrix
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Comparing {cars.length} selected vehicle{cars.length !== 1 ? 's' : ''}
            </p>
          </div>

          <div className="flex items-center gap-4">
            {cars.length > 0 && (
              <button
                type="button"
                onClick={onClear}
                className="text-xs text-slate-400 hover:text-rose-400 transition-colors font-medium"
              >
                Clear All
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-white/[0.06] text-slate-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {cars.length === 0 ? (
          <div className="py-16 text-center text-slate-400 space-y-2">
            <p className="text-base font-semibold text-white font-display">
              No Vehicles Selected for Comparison
            </p>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              Select the comparison icon on up to 3 vehicles in the inventory to evaluate specifications side by side.
            </p>
          </div>
        ) : (
          <div className="pt-6 overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/[0.08]">
                  <th className="py-4 px-4 w-44 text-xs font-medium text-slate-400">
                    Vehicle
                  </th>
                  {cars.map((car) => (
                    <th key={car.id} className="py-4 px-4 w-64 align-top">
                      <div className="relative space-y-3">
                        <button
                          type="button"
                          onClick={() => onRemove(car.id)}
                          aria-label="Remove from comparison"
                          className="absolute top-2 right-2 p-1.5 rounded-lg bg-black/70 hover:bg-rose-600 text-slate-300 hover:text-white transition-colors z-10"
                          title="Remove"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                        <div className="aspect-[4/3] rounded-xl overflow-hidden bg-[#090B10] border border-white/[0.08]">
                          <img
                            src={car.images?.[0]?.url || FALLBACK_COMPARE_IMG}
                            alt={car.title}
                            referrerPolicy="no-referrer"
                            onError={(e) => {
                              const target = e.currentTarget;
                              if (target.src !== window.location.origin + FALLBACK_COMPARE_IMG) {
                                target.src = FALLBACK_COMPARE_IMG;
                              }
                            }}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <h4 className="font-semibold text-white text-sm line-clamp-1 font-display">
                          {car.title}
                        </h4>
                        <p className="text-white font-mono tabular-nums font-bold text-lg">
                          ${car.price.toLocaleString()}
                        </p>
                        <button
                          type="button"
                          onClick={() => {
                            onClose();
                            onSelectCar(car);
                          }}
                          className="w-full py-2 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
                        >
                          <span>Inspect 3D</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.06] text-xs">
                <tr>
                  <td className="py-3.5 px-4 text-slate-400">Model Year</td>
                  {cars.map((c) => (
                    <td key={c.id} className="py-3.5 px-4 font-mono tabular-nums text-white">{c.year}</td>
                  ))}
                </tr>
                <tr>
                  <td className="py-3.5 px-4 text-slate-400">Condition</td>
                  {cars.map((c) => (
                    <td key={c.id} className="py-3.5 px-4 text-slate-200">{c.condition}</td>
                  ))}
                </tr>
                <tr>
                  <td className="py-3.5 px-4 text-slate-400">Odometer</td>
                  {cars.map((c) => (
                    <td key={c.id} className="py-3.5 px-4 font-mono tabular-nums text-slate-200">
                      {c.mileage.toLocaleString()} mi
                    </td>
                  ))}
                </tr>
                <tr>
                  <td className="py-3.5 px-4 text-slate-400">Powertrain</td>
                  {cars.map((c) => (
                    <td key={c.id} className="py-3.5 px-4 text-slate-200">{c.fuel}</td>
                  ))}
                </tr>
                <tr>
                  <td className="py-3.5 px-4 text-slate-400">Transmission</td>
                  {cars.map((c) => (
                    <td key={c.id} className="py-3.5 px-4 text-slate-200">{c.transmission}</td>
                  ))}
                </tr>
                <tr>
                  <td className="py-3.5 px-4 text-slate-400">Gallery Location</td>
                  {cars.map((c) => (
                    <td key={c.id} className="py-3.5 px-4 text-slate-200">{c.showroom?.name}</td>
                  ))}
                </tr>
                <tr>
                  <td className="py-3.5 px-4 text-slate-400">3D Configurator</td>
                  {cars.map((c) => (
                    <td key={c.id} className="py-3.5 px-4 text-slate-200">
                      {c.model3d ? 'Interactive 3D Twin' : 'Studio Photography'}
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
