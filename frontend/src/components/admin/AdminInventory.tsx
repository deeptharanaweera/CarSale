import React, { useState, useEffect, useRef } from 'react';
import { Car, Showroom, ShowroomSlot } from '../../types';
import { api } from '../../services/api';
import {
  CarViewer3D,
  SAMPLE_3D_MODEL_LINKS,
  isCustomExternal3DUrl,
  isSketchfabUrl,
} from '../3d/CarViewer3D';
import {
  Plus,
  Search,
  MapPin,
  Trash2,
  CheckCircle2,
  X,
  Palette,
  Box,
  Link2,
  Eye,
  Upload,
} from 'lucide-react';

export const AdminInventory: React.FC = () => {
  const [cars, setCars] = useState<Car[]>([]);
  const [showrooms, setShowrooms] = useState<Showroom[]>([]);
  const [search, setSearch] = useState('');
  const [selectedShowroomId, setSelectedShowroomId] = useState<string>('all');
  const [loading, setLoading] = useState(true);
  const [statusToast, setStatusToast] = useState<string | null>(null);

  // Modals state
  const [slotModalCar, setSlotModalCar] = useState<Car | null>(null);
  const [model3dModalCar, setModel3dModalCar] = useState<Car | null>(null);
  const [preview3dCar, setPreview3dCar] = useState<Car | null>(null);
  const [newCarModalOpen, setNewCarModalOpen] = useState(false);

  const showToast = (msg: string) => {
    setStatusToast(msg);
    setTimeout(() => {
      setStatusToast((prev) => (prev === msg ? null : prev));
    }, 4500);
  };

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
    const handleUpdated = () => loadData();
    window.addEventListener('aura-cars-updated', handleUpdated);
    return () => window.removeEventListener('aura-cars-updated', handleUpdated);
  }, []);

  const filteredCars = cars.filter((c) => {
    if (selectedShowroomId !== 'all' && c.showroom_id !== Number(selectedShowroomId)) return false;
    if (
      search &&
      !c.title.toLowerCase().includes(search.toLowerCase()) &&
      !(c.vin || '').toLowerCase().includes(search.toLowerCase())
    )
      return false;
    return true;
  });

  const handleDelete = async (id: number) => {
    try {
      await api.deleteCar(id);
      setCars((prev) => prev.filter((c) => c.id !== id));
      showToast('Vehicle removed from showroom inventory.');
    } catch (err: any) {
      showToast(err.message || 'Error deleting car.');
    }
  };

  return (
    <div className="p-8 space-y-6 max-w-7xl mx-auto">
      {/* Inline Toast Feedback */}
      {statusToast && (
        <div className="fixed top-24 right-6 z-50 px-4 py-3 rounded-xl bg-slate-900 border border-emerald-500/40 text-emerald-300 text-xs font-semibold flex items-center gap-2.5 shadow-2xl animate-fadeIn">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{statusToast}</span>
          <button
            type="button"
            onClick={() => setStatusToast(null)}
            className="text-slate-400 hover:text-white ml-2"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-black text-white font-display">Inventory Management</h2>
          <p className="text-sm text-slate-400">
            Manage showroom stock, slot allocations, 3D model links (Sketchfab / GLB), and pricing
          </p>
        </div>

        <button
          type="button"
          onClick={() => setNewCarModalOpen(true)}
          className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-sm uppercase tracking-wide transition-all shadow-lg shadow-emerald-500/20"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          <span>Add New Vehicle</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-2xl bg-slate-900 border border-slate-800">
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
              <th className="px-6 py-4">3D Asset & Model Link</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800 font-medium">
            {loading ? (
              <tr>
                <td colSpan={6} className="px-6 py-10 text-center text-slate-500">
                  Loading showroom inventory...
                </td>
              </tr>
            ) : (
              filteredCars.map((car) => {
                const coverImg =
                  car.images?.[0]?.url ||
                  '/src/assets/images/car_bmw_m4_emerald_1793964978767.jpg';
                const glbUrl = car.model3d?.glb_url || '';
                const hasCustomLink = isCustomExternal3DUrl(glbUrl);

                return (
                  <tr key={car.id} className="hover:bg-slate-800/40 transition-colors">
                    {/* Vehicle details */}
                    <td className="px-6 py-4 flex items-center gap-3">
                      <img
                        src={coverImg}
                        alt={car.title}
                        className="w-16 h-12 rounded-xl object-cover bg-slate-950 border border-slate-800"
                      />
                      <div>
                        <p className="font-bold text-white text-base leading-snug">{car.title}</p>
                        <p className="text-xs text-slate-400 font-mono">
                          VIN: {car.vin || 'Pending'}
                        </p>
                      </div>
                    </td>

                    {/* Showroom & Slot */}
                    <td className="px-6 py-4">
                      <p className="font-semibold text-slate-200">
                        {car.showroom?.name || 'Unassigned'}
                      </p>
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
                      <div className="flex flex-col items-start gap-1">
                        {hasCustomLink ? (
                          <button
                            type="button"
                            onClick={() => setPreview3dCar(car)}
                            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-purple-500/25 hover:bg-purple-500/35 text-purple-200 border border-purple-400/50 text-xs font-semibold transition-colors"
                            title={`Click to preview linked 3D model: ${glbUrl}`}
                          >
                            <Link2 className="w-3.5 h-3.5 text-purple-300" />
                            <span>
                              {isSketchfabUrl(glbUrl) ? 'Sketchfab 3D Linked' : 'Custom GLB Linked'}
                            </span>
                          </button>
                        ) : car.model3d ? (
                          <button
                            type="button"
                            onClick={() => setPreview3dCar(car)}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 border border-purple-500/30 text-xs font-semibold transition-colors"
                          >
                            <Box className="w-3.5 h-3.5" />
                            <span>Interactive 3D Ready</span>
                          </button>
                        ) : (
                          <span className="text-xs text-slate-500">360° Photo Fallback</span>
                        )}
                        {glbUrl && (
                          <span className="text-[11px] font-mono text-slate-400 truncate max-w-[200px]">
                            {glbUrl}
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Actions */}
                    <td className="px-6 py-4 text-right space-x-2 whitespace-nowrap">
                      <button
                        type="button"
                        onClick={() => setPreview3dCar(car)}
                        className="px-3 py-1.5 rounded-xl bg-cyan-500/15 hover:bg-cyan-500/25 text-cyan-300 border border-cyan-500/30 text-xs font-semibold transition-colors inline-flex items-center gap-1"
                        title="Open Live 3D Viewer"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>View 3D</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setModel3dModalCar(car)}
                        className="px-3 py-1.5 rounded-xl bg-purple-600/25 hover:bg-purple-600/40 text-purple-200 border border-purple-500/40 text-xs font-semibold transition-colors inline-flex items-center gap-1"
                        title="Add / Edit 3D Model Link (Sketchfab or GLB)"
                      >
                        <Palette className="w-3.5 h-3.5" />
                        <span>Link 3D</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setSlotModalCar(car)}
                        className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition-colors"
                        title="Fast Move / Assign Slot"
                      >
                        Move Slot
                      </button>

                      <button
                        type="button"
                        onClick={() => handleDelete(car.id)}
                        className="p-2 rounded-xl bg-slate-800 hover:bg-red-900/50 hover:text-red-300 text-slate-400 transition-colors"
                        title="Delete Car"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
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
            showToast(`Station updated for ${updatedCar.title}.`);
          }}
        />
      )}

      {/* 3D Model Config Modal */}
      {model3dModalCar && (
        <Model3DConfigModal
          car={model3dModalCar}
          onClose={() => setModel3dModalCar(null)}
          onSuccess={(updatedUrl, openPreview) => {
            const targetCar = model3dModalCar;
            loadData().then(() => {
              if (openPreview && targetCar) {
                setPreview3dCar({
                  ...targetCar,
                  model3d: {
                    id: targetCar.model3d?.id || targetCar.id,
                    car_id: targetCar.id,
                    glb_url: updatedUrl,
                    variants: targetCar.model3d?.variants,
                  },
                });
              }
            });
            setModel3dModalCar(null);
            showToast(`3D Model Link saved: ${updatedUrl}`);
          }}
        />
      )}

      {/* Live 3D Preview Modal right inside Admin Inventory */}
      {preview3dCar && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-950/85 backdrop-blur-md animate-fadeIn">
          <div className="relative w-full max-w-6xl rounded-3xl bg-slate-900 border border-slate-700 shadow-2xl p-5 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <span className="text-xs font-mono uppercase tracking-wider text-purple-400 block">
                  Live 3D Asset Verification · Kiosk & Showroom Twin
                </span>
                <h3 className="text-xl font-bold text-white font-display">
                  {preview3dCar.title}
                </h3>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    const c = preview3dCar;
                    setPreview3dCar(null);
                    setModel3dModalCar(c);
                  }}
                  className="px-3.5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold flex items-center gap-1.5"
                >
                  <Link2 className="w-3.5 h-3.5" />
                  <span>Edit 3D Model Link</span>
                </button>
                <button
                  type="button"
                  onClick={() => setPreview3dCar(null)}
                  className="p-2 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="h-[560px] w-full rounded-2xl overflow-hidden">
              <CarViewer3D
                car={preview3dCar}
                className="w-full h-full"
                allowCustomize={true}
                showSideDetails={true}
              />
            </div>
          </div>
        </div>
      )}

      {/* Add New Car Modal */}
      {newCarModalOpen && (
        <AddNewCarModal
          showrooms={showrooms}
          onClose={() => setNewCarModalOpen(false)}
          onSuccess={(newCar) => {
            setCars((prev) => [newCar, ...prev]);
            setNewCarModalOpen(false);
            showToast(`${newCar.title} registered in showroom inventory.`);
          }}
        />
      )}
    </div>
  );
};

// Subcomponent: Assign Slot Modal
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
      onSuccess(res.data);
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
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-full hover:bg-slate-800 text-slate-400"
          >
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
                    {isOccupied
                      ? `Occupied by: ${slot.car?.title.slice(0, 18)}...`
                      : 'Available for parking'}
                  </p>
                </button>
              );
            })}
          </div>
        </div>

        <button
          type="button"
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
function Model3DConfigModal({
  car,
  onClose,
  onSuccess,
}: {
  car: Car;
  onClose: () => void;
  onSuccess: (updatedUrl: string, openPreview: boolean) => void;
}) {
  const [glbUrl, setGlbUrl] = useState(
    car.model3d?.glb_url || `/models/${car.model?.brand?.slug || 'generic'}.glb`
  );
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSave = async (openPreview: boolean) => {
    const cleaned = glbUrl.trim();
    if (!cleaned) return;
    setLoading(true);
    try {
      await api.saveCar3DModel(car.id, {
        glb_url: cleaned,
        variants: car.model3d?.variants || {
          colors: [
            { name: 'Factory Spec', hex: '#1DB954' },
            { name: 'Stealth Black', hex: '#111215' },
            { name: 'Monza Red', hex: '#D91E18' },
          ],
        },
      });
      onSuccess(cleaned, openPreview);
    } finally {
      setLoading(false);
    }
  };

  const handleLocalGlbFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const blobUrl = URL.createObjectURL(file);
    setGlbUrl(blobUrl);
  };

  const isSketchfab = isSketchfabUrl(glbUrl);
  const isExternal = isCustomExternal3DUrl(glbUrl);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-lg rounded-3xl bg-slate-900 border border-slate-700 shadow-2xl p-6 space-y-4">
        <input
          ref={fileInputRef}
          type="file"
          accept=".glb,.gltf"
          onChange={handleLocalGlbFile}
          className="hidden"
        />

        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xl font-bold text-white">3D Asset Configuration</h3>
            <p className="text-xs text-slate-400 mt-0.5">{car.title}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-full hover:bg-slate-800 text-slate-400"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-3 text-sm">
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-slate-400">
                GLB Model Asset URL or Sketchfab Link
              </label>
              {isExternal && (
                <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 border border-purple-500/30">
                  {isSketchfab ? 'Sketchfab 3D Link Detected' : 'Direct 3D Mesh URL'}
                </span>
              )}
            </div>
            <input
              type="text"
              value={glbUrl}
              onChange={(e) => setGlbUrl(e.target.value)}
              placeholder="https://skfb.ly/pNSGJ or https://.../model.glb"
              className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white font-mono text-xs focus:outline-none focus:border-purple-500"
            />
          </div>

          {/* Quick-Select Sample Links (including https://skfb.ly/pNSGJ) */}
          <div className="space-y-1.5">
            <span className="text-[11px] font-semibold text-slate-400 block">
              Quick-Select 3D Model Link or Upload .GLB:
            </span>
            <div className="flex flex-wrap gap-1.5">
              {SAMPLE_3D_MODEL_LINKS.map((sample) => (
                <button
                  key={sample.url}
                  type="button"
                  onClick={() => setGlbUrl(sample.url)}
                  className={`px-2.5 py-1.5 rounded-lg text-[11px] font-medium border transition-colors flex items-center gap-1.5 ${
                    glbUrl.trim() === sample.url
                      ? 'bg-purple-600/30 border-purple-400 text-white'
                      : 'bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700'
                  }`}
                >
                  <Link2 className="w-3 h-3 text-purple-400" />
                  <span>{sample.label}</span>
                </button>
              ))}

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="px-2.5 py-1.5 rounded-lg text-[11px] font-medium bg-cyan-500/15 hover:bg-cyan-500/25 border border-cyan-500/30 text-cyan-300 flex items-center gap-1"
              >
                <Upload className="w-3 h-3" />
                <span>Upload .GLB</span>
              </button>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-400 space-y-2">
            <p className="font-bold text-white">3D Features Enabled for Kiosk & Web:</p>
            <ul className="list-disc pl-4 space-y-1">
              <li>Full 360 Orbit Controls with zoom boundaries</li>
              <li>Supports Sketchfab shortlinks (<code className="text-purple-300">https://skfb.ly/pNSGJ</code>) & direct <code className="text-cyan-300">.glb</code> URLs</li>
              <li>Live material swapping for exterior colors and rim styles</li>
              <li>Left & right architectural spec callouts in Kiosk & Showroom views</li>
            </ul>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
          <button
            type="button"
            onClick={() => handleSave(false)}
            disabled={loading}
            className="w-full py-3.5 rounded-2xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs uppercase tracking-wider transition-all shadow-lg"
          >
            {loading ? 'Saving...' : 'Save 3D Configuration'}
          </button>

          <button
            type="button"
            onClick={() => handleSave(true)}
            disabled={loading}
            className="w-full py-3.5 rounded-2xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black text-xs uppercase tracking-wider transition-all shadow-lg flex items-center justify-center gap-1.5"
          >
            <Eye className="w-4 h-4" />
            <span>Save & Open 3D Now</span>
          </button>
        </div>
      </div>
    </div>
  );
}

// Subcomponent: Add New Car Modal
function AddNewCarModal({
  showrooms,
  onClose,
  onSuccess,
}: {
  showrooms: Showroom[];
  onClose: () => void;
  onSuccess: (car: Car) => void;
}) {
  const [title, setTitle] = useState('');
  const [price, setPrice] = useState('125000');
  const [year, setYear] = useState('2024');
  const [fuel, setFuel] = useState('Petrol');
  const [transmission, setTransmission] = useState('Automatic');
  const [condition, setCondition] = useState('New');
  const [showroomId, setShowroomId] = useState(showrooms[0]?.id || 1);
  const [glbUrl, setGlbUrl] = useState('https://skfb.ly/pNSGJ');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.createCar({
        model_id: 1,
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
        glb_url: glbUrl.trim() || undefined,
      });
      onSuccess(res.data);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <form
        onSubmit={handleSubmit}
        className="relative w-full max-w-lg rounded-3xl bg-slate-900 border border-slate-700 shadow-2xl p-6 space-y-4"
      >
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-bold text-white">Add Vehicle to Inventory</h3>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-full hover:bg-slate-800 text-slate-400"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-3 text-sm">
          <div>
            <label className="text-xs font-semibold text-slate-400 block mb-1">Vehicle Title</label>
            <input
              type="text"
              required
              placeholder="e.g. 2024 Ford F-150 Raptor R"
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
              <label className="text-xs font-semibold text-slate-400 block mb-1">
                Showroom Branch
              </label>
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

          <div>
            <label className="text-xs font-semibold text-slate-400 block mb-1">
              3D Model Asset URL (Sketchfab Link or .GLB URL)
            </label>
            <input
              type="text"
              placeholder="https://skfb.ly/pNSGJ"
              value={glbUrl}
              onChange={(e) => setGlbUrl(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white font-mono text-xs focus:outline-none focus:border-purple-500"
            />
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
