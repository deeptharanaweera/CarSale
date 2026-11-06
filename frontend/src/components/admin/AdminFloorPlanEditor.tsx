import React, { useState, useEffect } from 'react';
import { Showroom, ShowroomSlot, Car } from '../../types';
import { api } from '../../services/api';
import { ShowroomViewer3D } from '../3d/ShowroomViewer3D';
import {
  Layers,
  MapPin,
  Move,
  Plus,
  Compass,
  CheckCircle2,
  Trash2,
  Edit2,
  Save,
  Car as CarIcon,
} from 'lucide-react';

export const AdminFloorPlanEditor: React.FC = () => {
  const [showrooms, setShowrooms] = useState<Showroom[]>([]);
  const [selectedShowroom, setSelectedShowroom] = useState<Showroom | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<ShowroomSlot | null>(null);
  const [cars, setCars] = useState<Car[]>([]);
  const [loading, setLoading] = useState(true);

  // Edit form state
  const [editLabel, setEditLabel] = useState('');
  const [editX, setEditX] = useState<number>(0);
  const [editZ, setEditZ] = useState<number>(0);
  const [editRotY, setEditRotY] = useState<number>(0);
  const [editType, setEditType] = useState<string>('indoor');

  const loadData = async () => {
    try {
      const [showroomsRes, carsRes] = await Promise.all([
        api.getShowrooms(),
        api.getAdminCars(),
      ]);
      setShowrooms(showroomsRes.data);
      if (showroomsRes.data.length > 0) {
        setSelectedShowroom(showroomsRes.data[0]);
      }
      setCars(carsRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (selectedSlot) {
      setEditLabel(selectedSlot.label);
      setEditX(selectedSlot.pos_x);
      setEditZ(selectedSlot.pos_z);
      setEditRotY(selectedSlot.rotation_y);
      setEditType(selectedSlot.type);
    }
  }, [selectedSlot]);

  const activeFloor = selectedShowroom?.floors?.[0];
  const slots = activeFloor?.slots || [];

  const handleSaveSlot = async () => {
    if (!selectedSlot) return;
    try {
      await api.updateSlotPosition(selectedSlot.id, {
        label: editLabel,
        pos_x: Number(editX),
        pos_y: 0,
        pos_z: Number(editZ),
        rotation_y: Number(editRotY),
      });

      // Update local state
      if (selectedShowroom && activeFloor) {
        const updatedSlots = slots.map((s) =>
          s.id === selectedSlot.id
            ? { ...s, label: editLabel, pos_x: Number(editX), pos_z: Number(editZ), rotation_y: Number(editRotY), type: editType as any }
            : s
        );
        setSelectedShowroom({
          ...selectedShowroom,
          floors: [{ ...activeFloor, slots: updatedSlots }],
        });
      }
      alert('Slot position updated successfully.');
    } catch (err: any) {
      alert(err.message || 'Error updating slot.');
    }
  };

  const handleCreateSlot = async () => {
    if (!activeFloor) return;
    try {
      const newLabel = `Bay ${slots.length + 1}`;
      const res = await api.createSlot({
        floor_id: activeFloor.id,
        label: newLabel,
        pos_x: (Math.random() - 0.5) * 12,
        pos_y: 0,
        pos_z: (Math.random() - 0.5) * 10,
        rotation_y: 0,
        type: 'indoor',
      });

      if (selectedShowroom && activeFloor) {
        const updatedSlots = [...slots, res.data];
        setSelectedShowroom({
          ...selectedShowroom,
          floors: [{ ...activeFloor, slots: updatedSlots }],
        });
        setSelectedSlot(res.data);
      }
    } catch (err: any) {
      alert(err.message || 'Error creating slot.');
    }
  };

  if (loading || !selectedShowroom) {
    return (
      <div className="p-8 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-8 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-black text-white font-display">Showroom Floor & Slot Manager</h2>
          <p className="text-sm text-slate-400">Position 3D display slots, arrange car bays, and design customer walk routes</p>
        </div>

        <div className="flex items-center gap-3">
          <select
            value={selectedShowroom.id}
            onChange={(e) => {
              const sr = showrooms.find((s) => s.id === Number(e.target.value));
              if (sr) setSelectedShowroom(sr);
            }}
            className="px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-sm font-semibold text-white focus:outline-none focus:border-emerald-500"
          >
            {showrooms.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>

          <button
            onClick={handleCreateSlot}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-sm uppercase tracking-wide transition-all shadow-md"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>Add Slot</span>
          </button>
        </div>
      </div>

      {/* Main Layout Grid */}
      <div className="grid grid-cols-3 gap-6">
        {/* Left 2 Cols: 3D Visualizer */}
        <div className="col-span-2 rounded-3xl bg-slate-900 border border-slate-800 p-4 shadow-xl flex flex-col space-y-3">
          <div className="flex items-center justify-between px-2">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
              <Compass className="w-4 h-4" /> Live Floor Plan Coordinates (Click any slot to reposition)
            </span>
            <span className="text-xs text-slate-400 font-mono">
              Floor Scale: 1:1 Ground Level (32m x 28m)
            </span>
          </div>

          <div className="h-[480px] rounded-2xl overflow-hidden border border-slate-800">
            <ShowroomViewer3D
              showroom={selectedShowroom}
              targetSlotId={selectedSlot?.id}
              className="w-full h-full"
              onSelectSlot={(slot) => setSelectedSlot(slot)}
            />
          </div>
        </div>

        {/* Right Col: Slot Inspector & Controls */}
        <div className="rounded-3xl bg-slate-900 border border-slate-800 p-6 shadow-xl space-y-6">
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <Layers className="w-5 h-5 text-emerald-400" />
            <span>Slot Coordinates Inspector</span>
          </h3>

          {selectedSlot ? (
            <div className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-400 block mb-1">Slot Label</label>
                <input
                  type="text"
                  value={editLabel}
                  onChange={(e) => setEditLabel(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white font-bold text-sm focus:outline-none focus:border-emerald-500"
                />
              </div>

              {/* Coordinates Sliders / Inputs */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-400 block mb-1">Position X (m)</label>
                  <input
                    type="number"
                    step="0.5"
                    value={editX}
                    onChange={(e) => setEditX(Number(e.target.value))}
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white font-mono text-sm focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-400 block mb-1">Position Z (m)</label>
                  <input
                    type="number"
                    step="0.5"
                    value={editZ}
                    onChange={(e) => setEditZ(Number(e.target.value))}
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white font-mono text-sm focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-400 block mb-1">
                  Rotation Y: {editRotY.toFixed(2)} rad ({Math.round((editRotY * 180) / Math.PI)}°)
                </label>
                <input
                  type="range"
                  min="-3.14"
                  max="3.14"
                  step="0.05"
                  value={editRotY}
                  onChange={(e) => setEditRotY(Number(e.target.value))}
                  className="w-full accent-emerald-500"
                />
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                <span className="text-xs font-bold text-slate-400 uppercase">Stationed Vehicle:</span>
                {selectedSlot.car ? (
                  <p className="text-sm font-bold text-white flex items-center gap-1.5">
                    <CarIcon className="w-4 h-4 text-emerald-400" />
                    {selectedSlot.car.title}
                  </p>
                ) : (
                  <p className="text-sm text-slate-500 italic">No vehicle assigned yet</p>
                )}
              </div>

              <button
                onClick={handleSaveSlot}
                className="w-full py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-sm uppercase tracking-wider transition-all shadow-md flex items-center justify-center gap-2"
              >
                <Save className="w-4 h-4" />
                <span>Save Slot Position</span>
              </button>
            </div>
          ) : (
            <div className="text-center py-16 text-slate-500 space-y-2">
              <Move className="w-8 h-8 mx-auto text-slate-600" />
              <p className="text-sm">Click any slot in the 3D floor map or list below to edit coordinates.</p>
            </div>
          )}

          {/* Quick Slot List */}
          <div className="space-y-2 pt-4 border-t border-slate-800">
            <span className="text-xs font-bold text-slate-400 uppercase">Configured Bays ({slots.length})</span>
            <div className="max-h-48 overflow-y-auto no-scrollbar space-y-1.5">
              {slots.map((s) => (
                <button
                  key={s.id}
                  onClick={() => setSelectedSlot(s)}
                  className={`w-full p-2.5 rounded-xl border text-left flex items-center justify-between text-xs transition-all ${
                    selectedSlot?.id === s.id
                      ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300 font-bold'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  <span>{s.label}</span>
                  <span className="font-mono text-[11px] text-slate-500">
                    ({s.pos_x.toFixed(1)}, {s.pos_z.toFixed(1)})
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

