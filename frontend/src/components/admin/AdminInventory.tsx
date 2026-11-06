import React, { useState, useEffect } from 'react';
import { Car, Showroom, ShowroomSlot } from '../../types';
import { api } from '../../services/api';
import {
  Car as CarIcon,
  Plus,
  Search,
  MapPin,
  Sparkles,
  Edit,
  Trash2,
  CheckCircle2,
  AlertCircle,
  X,
  Palette,
  Box,
} from 'lucide-react';

export const AdminInventory: React.FC = () => {
  const [cars, setCars] = useState<Car[]>([]);
  const [showrooms, setShowrooms] = useState<Showroom[]>([]);
  const [search, setSearch] = useState('');
  const [selectedShowroomId, setSelectedShowroomId] = useState<string>('all');
  const [loading, setLoading] = useState(true);

  // Modals state
  const [slotModalCar, setSlotModalCar] = useState<Car | null>(null);
  const [model3dModalCar, setModel3dModalCar] = useState<Car | null>(null);
  const [newCarModalOpen, setNewCarModalOpen] = useState(false);

  const loadData = async () => {
    try {
      const [carsRes, showroomsRes] = await Promise.all([
        api.getAdminCars(),
        api.getShowrooms(),
      ]);
      setCars(carsRes.data);
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

  const filteredCars = cars.filter((c) => {
    if (selectedShowroomId !== 'all' && c.showroom_id !== Number(selectedShowroomId)) return false;
    if (search && !c.title.toLowerCase().includes(search.toLowerCase()) && !c.vin.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to remove this vehicle from inventory?')) return;
    try {
      await api.deleteCar(id);
      setCars((prev) => prev.filter((c) => c.id !== id));
    } catch (err: any) {
      alert(err.message || 'Error deleting car.');
    }
  };

  return (
    <div className="p-8 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-black text-white font-display">Inventory Management</h2>
          <p className="text-sm text-slate-400">Manage showroom stock, slot allocations, 3D assets, and pricing</p>
        </div>

        <button
          onClick={() => setNewCarModalOpen(true)}
          className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-sm uppercase tracking-wide transition-all shadow-lg shadow-emerald-500/20"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          <span>Add New Vehicle</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex items-center justify-between gap-4 p-4 rounded-2xl bg-slate-900 border border-slate-800">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by title, brand, or VIN..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
          />
        </div>

        <div className="flex items-center gap-3">
          <span className="text-xs text-slate-400 font-semibold uppercase">Showroom:</span>
          <select
            value={selectedShowroomId}
            onChange={(e) => setSelectedShowroomId(e.target.value)}
            className="px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs font-semibold text-white focus:outline-none focus:border-emerald-500"
          >
            <option value="all">All Showrooms ({cars.length})</option>
            {showrooms.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-3xl bg-slate-900 border border-slate-800 overflow-hidden shadow-xl">
        <table className="w-full text-left text-sm text-slate-300">
          <thead className="bg-slate-950 text-xs uppercase tracking-wider text-slate-400 border-b border-slate-800">
            <tr>
              <th className="px-6 py-4">Vehicle Details</th>
              <th className="px-6 py-4">Showroom & Station</th>
              <th className="px-6 py-4">Price</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4">3D Asset</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800 font-medium">
            {filteredCars.map((car) => {
              const coverImg = car.images?.[0]?.url || '/src/assets/images/car_bmw_m4_emerald_1793964978767.jpg';
              return (
                <tr key={car.id} className="hover:bg-slate-850/50 transition-colors">
                  {/* Vehicle details */}
                  <td className="px-6 py-4 flex items-center gap-3">
                    <img
                      src={coverImg}
                      alt={car.title}
                      className="w-16 h-12 rounded-xl object-cover bg-slate-950 border border-slate-800"
                    />
                    <div>
                      <p className="font-bold text-white text-base leading-snug">{car.title}</p>
                      <p className="text-xs text-slate-400 font-mono">VIN: {car.vin || 'Pending'}</p>
                    </div>
                  </td>

                  {/* Showroom & Slot */}
                  <td className="px-6 py-4">
                    <p className="font-semibold text-slate-200">{car.showroom?.name || 'Unassigned'}</p>
                    {car.slot ? (
                      <span className="inline-flex items-center gap-1 mt-1 px-2.5 py-0.5 rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs font-semibold">
                        <MapPin className="w-3 h-3" />
                        {car.slot.label}
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 mt-1 px-2.5 py-0.5 rounded-lg bg-amber-500/20 text-amber-400 border border-amber-500/30 text-xs font-semibold">
                        Transit / Unassigned
                      </span>
                    )}
                  </td>

                  {/* Price */}
                  <td className="px-6 py-4 font-mono font-bold text-white text-base">
                    ${car.price.toLocaleString()}
                  </td>

                  {/* Status */}
                  <td className="px-6 py-4">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                        car.status === 'available'
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                          : car.status === 'reserved'
                          ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
                          : 'bg-sky-500/20 text-sky-400 border border-sky-500/40'
                      }`}
                    >
                      {car.status}
                    </span>
                  </td>

                  {/* 3D Asset */}
                  <td className="px-6 py-4">
                    {car.model3d ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-purple-500/20 text-purple-300 border border-purple-500/30 text-xs font-semibold">
                        <Box className="w-3.5 h-3.5" />
                        Interactive 3D Ready
                      </span>
                    ) : (
                      <span className="text-xs text-slate-500">360° Photo Fallback</span>
                    )}
                  </td>

                  {/* Actions */}
                  <td className="px-6 py-4 text-right space-x-2">
                    <button
                      onClick={() => setSlotModalCar(car)}
                      className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition-colors"
                      title="Fast Move / Assign Slot"
                    >
                      Move Slot
                    </button>

                    <button
                      onClick={() => setModel3dModalCar(car)}
                      className="p-2 rounded-xl bg-slate-800 hover:bg-purple-900/50 hover:text-purple-300 text-slate-400 transition-colors"
                      title="Manage 3D Configuration"
                    >
                      <Palette className="w-4 h-4" />
                    </button>

                    <button
                      onClick={() => handleDelete(car.id)}
                      className="p-2 rounded-xl bg-slate-800 hover:bg-red-900/50 hover:text-red-300 text-slate-400 transition-colors"
                      title="Delete Car"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Assign Slot Modal */}
      {slotModalCar && (
        <AssignSlotModal
          car={slotModalCar}
          showrooms={showrooms}
          onClose={() => setSlotModalCar(null)}
          onSuccess={(updatedCar) => {
            setCars((prev) => prev.map((c) => (c.id === updatedCar.id ? updatedCar : c)));
            setSlotModalCar(null);
          }}
        />
      )}

      {/* 3D Model Config Modal */}
      {model3dModalCar && (
        <Model3DConfigModal
          car={model3dModalCar}
          onClose={() => setModel3dModalCar(null)}
          onSuccess={() => {
            loadData();
            setModel3dModalCar(null);
          }}
        />
      )}

      {/* Add New Car Modal */}
      {newCarModalOpen && (
        <AddNewCarModal
          showrooms={showrooms}
          onClose={() => setNewCarModalOpen(false)}
          onSuccess={(newCar) => {
            setCars((prev) => [newCar, ...prev]);
            setNewCarModalOpen(false);
          }}
        />
      )}
    </div>
  );
};

// Subcomponent: Assign Slot Modal (Handles tablet-fast car moving)
function AssignSlotModal({
  car,
  showrooms,
  onClose,
  onSuccess,
}: {
  car: Car;
  showrooms: Showroom[];
  onClose: () => void;
  onSuccess: (updated: Car) => void;
}) {
  const showroom = showrooms.find((s) => s.id === car.showroom_id) || showrooms[0];
  const allSlots: ShowroomSlot[] = showroom?.floors?.flatMap((f) => f.slots || []) || [];
  const [selectedSlotId, setSelectedSlotId] = useState<number | null>(car.slot_id);
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    setLoading(true);
    try {
      const res = await api.assignCarSlot(car.id, selectedSlotId);
      alert(res.message || 'Vehicle moved successfully!');
      onSuccess(res.data);
    } catch (err: any) {
      alert(err.message || 'Failed to station vehicle.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-lg rounded-3xl bg-slate-900 border border-slate-700 shadow-2xl p-6 space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xl font-bold text-white">Station Vehicle in Showroom Slot</h3>
            <p className="text-xs text-slate-400">{car.title}</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-slate-800 text-slate-400">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-3">
          <label className="text-xs font-semibold text-slate-300">
            Available Slots in {showroom?.name}:
          </label>
          <div className="grid grid-cols-2 gap-2.5 max-h-60 overflow-y-auto no-scrollbar">
            <button
              type="button"
              onClick={() => setSelectedSlotId(null)}
              className={`p-3 rounded-xl border text-left transition-all ${
                selectedSlotId === null
                  ? 'bg-amber-500/20 border-amber-500 text-amber-300'
                  : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
              }`}
            >
              <p className="font-bold text-sm">Unassigned / In Storage</p>
              <p className="text-[11px] text-slate-500">Not displayed on floor</p>
            </button>

            {allSlots.map((slot) => {
              const isOccupied = slot.car && slot.car.id !== car.id;
              const isSelected = selectedSlotId === slot.id;
              return (
                <button
                  key={slot.id}
                  type="button"
                  disabled={Boolean(isOccupied)}
                  onClick={() => setSelectedSlotId(slot.id)}
                  className={`p-3 rounded-xl border text-left transition-all ${
                    isSelected
                      ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300 ring-2 ring-emerald-500/30'
                      : isOccupied
                      ? 'bg-slate-950/50 border-slate-900 text-slate-600 cursor-not-allowed opacity-60'
                      : 'bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-sm">{slot.label}</span>
                    <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-slate-800">
                      {slot.type}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1">
                    {isOccupied ? `Occupied by: ${slot.car?.title.slice(0, 18)}...` : 'Available for parking'}
                  </p>
                </button>
              );
            })}
          </div>
        </div>

        <button
          onClick={handleSave}
          disabled={loading}
          className="w-full py-3.5 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-sm uppercase tracking-wider transition-all shadow-lg"
        >
          {loading ? 'Moving Car...' : 'Confirm Vehicle Placement'}
        </button>
      </div>
    </div>
  );
}

// Subcomponent: 3D Model Configuration Modal
function Model3DConfigModal({ car, onClose, onSuccess }: { car: Car; onClose: () => void; onSuccess: () => void }) {
  const [glbUrl, setGlbUrl] = useState(car.model3d?.glb_url || `/models/${car.model?.brand?.slug || 'generic'}.glb`);
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    setLoading(true);
    try {
      await api.saveCar3DModel(car.id, {
        glb_url: glbUrl,
        variants: car.model3d?.variants || {
          colors: [
            { name: 'Factory Spec', hex: '#1DB954' },
            { name: 'Stealth Black', hex: '#111215' },
            { name: 'Monza Red', hex: '#D91E18' },
          ],
        },
      });
      alert('3D model preferences updated.');
      onSuccess();
    } catch (err: any) {
      alert(err.message || 'Failed to save 3D model.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-lg rounded-3xl bg-slate-900 border border-slate-700 shadow-2xl p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-bold text-white">3D Asset Configuration</h3>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-slate-800 text-slate-400">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-3 text-sm">
          <div>
            <label className="text-xs font-semibold text-slate-400 block mb-1">GLB Model Asset URL</label>
            <input
              type="text"
              value={glbUrl}
              onChange={(e) => setGlbUrl(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white font-mono text-xs focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-400 space-y-2">
            <p className="font-bold text-white">3D Features Enabled for Kiosk & Web:</p>
            <ul className="list-disc pl-4 space-y-1">
              <li>Full 360 Orbit Controls with zoom boundaries</li>
              <li>Live material swapping for exterior colors and rim styles</li>
              <li>Dihedral door opening & closing animations</li>
              <li>Driver cockpit interior camera switch</li>
            </ul>
          </div>
        </div>

        <button
          onClick={handleSave}
          disabled={loading}
          className="w-full py-3.5 rounded-2xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-sm uppercase tracking-wider transition-all shadow-lg"
        >
          {loading ? 'Saving...' : 'Save 3D Configuration'}
        </button>
      </div>
    </div>
  );
}

// Subcomponent: Add New Car Modal
function AddNewCarModal({ showrooms, onClose, onSuccess }: { showrooms: Showroom[]; onClose: () => void; onSuccess: (car: Car) => void }) {
  const [title, setTitle] = useState('');
  const [price, setPrice] = useState('125000');
  const [year, setYear] = useState('2024');
  const [fuel, setFuel] = useState('Petrol');
  const [transmission, setTransmission] = useState('Automatic');
  const [condition, setCondition] = useState('New');
  const [showroomId, setShowroomId] = useState(showrooms[0]?.id || 1);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.createCar({
        model_id: 1, // Porsche or default
        showroom_id: showroomId,
        title,
        price: Number(price),
        year: Number(year),
        fuel,
        transmission,
        condition,
        status: 'available',
        vin: 'VIN' + Math.random().toString(36).substring(2, 10).toUpperCase(),
        images: ['/src/assets/images/hero_hypercar_pavilion_1793964975599.jpg'],
      });
      alert('Car added successfully.');
      onSuccess(res.data);
    } catch (err: any) {
      alert(err.message || 'Error adding car.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <form onSubmit={handleSubmit} className="relative w-full max-w-lg rounded-3xl bg-slate-900 border border-slate-700 shadow-2xl p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-bold text-white">Add Vehicle to Inventory</h3>
          <button type="button" onClick={onClose} className="p-2 rounded-full hover:bg-slate-800 text-slate-400">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-3 text-sm">
          <div>
            <label className="text-xs font-semibold text-slate-400 block mb-1">Vehicle Title</label>
            <input
              type="text"
              required
              placeholder="e.g. 2024 Porsche 911 Carrera GTS"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-slate-400 block mb-1">Price ($ USD)</label>
              <input
                type="number"
                required
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm focus:outline-none focus:border-emerald-500"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-400 block mb-1">Year</label>
              <input
                type="number"
                required
                value={year}
                onChange={(e) => setYear(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-slate-400 block mb-1">Showroom Branch</label>
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
            <div>
              <label className="text-xs font-semibold text-slate-400 block mb-1">Condition</label>
              <select
                value={condition}
                onChange={(e) => setCondition(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm focus:outline-none focus:border-emerald-500"
              >
                <option value="New">New</option>
                <option value="Certified Pre-Owned">Certified Pre-Owned</option>
                <option value="Used">Used</option>
              </select>
            </div>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3.5 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-sm uppercase tracking-wider transition-all shadow-lg"
        >
          {loading ? 'Creating...' : 'Register Vehicle in Showroom'}
        </button>
      </form>
    </div>
  );
}

