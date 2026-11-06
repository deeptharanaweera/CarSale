import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { Enquiry, TestDrive, Reservation } from '../../types';
import {
  Calendar,
  MessageSquare,
  DollarSign,
  User,
  Phone,
  Mail,
  CheckCircle2,
  Clock,
  Car,
} from 'lucide-react';

export const AdminSalesManager: React.FC = () => {
  const [tab, setTab] = useState<'enquiries' | 'test_drives' | 'reservations'>('test_drives');
  const [enquiries, setEnquiries] = useState<Enquiry[]>([]);
  const [testDrives, setTestDrives] = useState<TestDrive[]>([]);
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    try {
      const [enqRes, tdRes, resRes] = await Promise.all([
        api.getEnquiries(),
        api.getTestDrives(),
        api.getReservations(),
      ]);
      setEnquiries(enqRes.data);
      setTestDrives(tdRes.data);
      setReservations(resRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleUpdateTestDrive = async (id: number, status: string) => {
    try {
      await api.updateTestDriveStatus(id, status);
      setTestDrives((prev) =>
        prev.map((td) => (td.id === id ? { ...td, status: status as any } : td))
      );
    } catch (err: any) {
      alert(err.message || 'Error updating status.');
    }
  };

  const handleUpdateEnquiry = async (id: number, status: string) => {
    try {
      await api.updateEnquiryStatus(id, status);
      setEnquiries((prev) =>
        prev.map((enq) => (enq.id === id ? { ...enq, status: status as any } : enq))
      );
    } catch (err: any) {
      alert(err.message || 'Error updating status.');
    }
  };

  return (
    <div className="p-8 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-black text-white font-display">Sales Operations & Bookings</h2>
          <p className="text-sm text-slate-400">Process test drives, customer purchase reservations, and sales inquiries</p>
        </div>

        {/* Tab switchers */}
        <div className="flex items-center rounded-2xl bg-slate-900 border border-slate-800 p-1">
          <button
            onClick={() => setTab('test_drives')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition-all ${
              tab === 'test_drives'
                ? 'bg-emerald-500 text-slate-950 shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Calendar className="w-4 h-4" />
            <span>Test Drives ({testDrives.length})</span>
          </button>

          <button
            onClick={() => setTab('reservations')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition-all ${
              tab === 'reservations'
                ? 'bg-emerald-500 text-slate-950 shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <DollarSign className="w-4 h-4" />
            <span>Reservations ({reservations.length})</span>
          </button>

          <button
            onClick={() => setTab('enquiries')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition-all ${
              tab === 'enquiries'
                ? 'bg-emerald-500 text-slate-950 shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <MessageSquare className="w-4 h-4" />
            <span>Enquiries ({enquiries.length})</span>
          </button>
        </div>
      </div>

      {/* Table / List */}
      <div className="rounded-3xl bg-slate-900 border border-slate-800 overflow-hidden shadow-xl">
        {tab === 'test_drives' && (
          <table className="w-full text-left text-sm text-slate-300">
            <thead className="bg-slate-950 text-xs uppercase tracking-wider text-slate-400 border-b border-slate-800">
              <tr>
                <th className="px-6 py-4">Customer</th>
                <th className="px-6 py-4">Vehicle</th>
                <th className="px-6 py-4">Scheduled Date & Time</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Workflow Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 font-medium">
              {testDrives.map((td) => (
                <tr key={td.id} className="hover:bg-slate-850/50">
                  <td className="px-6 py-4">
                    <p className="font-bold text-white">{td.name}</p>
                    <p className="text-xs text-slate-400 font-mono">{td.phone}</p>
                  </td>
                  <td className="px-6 py-4">
                    <p className="font-semibold text-slate-200">{td.car?.title || 'Vehicle Inspection'}</p>
                  </td>
                  <td className="px-6 py-4 text-xs font-mono text-slate-300">
                    {new Date(td.date_time).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${
                        td.status === 'confirmed'
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                          : td.status === 'completed'
                          ? 'bg-sky-500/20 text-sky-400 border border-sky-500/40'
                          : 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
                      }`}
                    >
                      {td.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right space-x-2">
                    {td.status === 'pending' && (
                      <button
                        onClick={() => handleUpdateTestDrive(td.id, 'confirmed')}
                        className="px-3 py-1.5 rounded-xl bg-emerald-500 text-slate-950 font-bold text-xs"
                      >
                        Confirm Slot
                      </button>
                    )}
                    {td.status === 'confirmed' && (
                      <button
                        onClick={() => handleUpdateTestDrive(td.id, 'completed')}
                        className="px-3 py-1.5 rounded-xl bg-sky-500 text-slate-950 font-bold text-xs"
                      >
                        Mark Completed
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {tab === 'reservations' && (
          <table className="w-full text-left text-sm text-slate-300">
            <thead className="bg-slate-950 text-xs uppercase tracking-wider text-slate-400 border-b border-slate-800">
              <tr>
                <th className="px-6 py-4">Customer</th>
                <th className="px-6 py-4">Reserved Vehicle</th>
                <th className="px-6 py-4">Deposit Amount</th>
                <th className="px-6 py-4">Payment Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 font-medium">
              {reservations.map((res) => (
                <tr key={res.id} className="hover:bg-slate-850/50">
                  <td className="px-6 py-4">
                    <p className="font-bold text-white">{res.name}</p>
                    <p className="text-xs text-slate-400 font-mono">{res.phone}</p>
                  </td>
                  <td className="px-6 py-4 font-semibold text-slate-200">
                    {res.car?.title || 'Selected Vehicle'}
                  </td>
                  <td className="px-6 py-4 font-mono font-bold text-emerald-400">
                    ${res.amount.toLocaleString()} Deposit Secured
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-3 py-1 rounded-full text-xs font-bold uppercase bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">
                      {res.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {tab === 'enquiries' && (
          <table className="w-full text-left text-sm text-slate-300">
            <thead className="bg-slate-950 text-xs uppercase tracking-wider text-slate-400 border-b border-slate-800">
              <tr>
                <th className="px-6 py-4">Inquirer</th>
                <th className="px-6 py-4">Vehicle</th>
                <th className="px-6 py-4">Message / Request</th>
                <th className="px-6 py-4 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 font-medium">
              {enquiries.map((enq) => (
                <tr key={enq.id} className="hover:bg-slate-850/50">
                  <td className="px-6 py-4">
                    <p className="font-bold text-white">{enq.name}</p>
                    <p className="text-xs text-slate-400 font-mono">{enq.phone}</p>
                  </td>
                  <td className="px-6 py-4 font-semibold text-slate-200">
                    {enq.car?.title || 'General'}
                  </td>
                  <td className="px-6 py-4 text-xs text-slate-300 max-w-xs truncate">
                    {enq.message || 'Inquiry received'}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button
                      onClick={() =>
                        handleUpdateEnquiry(enq.id, enq.status === 'new' ? 'contacted' : 'closed')
                      }
                      className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold capitalize"
                    >
                      {enq.status} (Click to Advance)
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

