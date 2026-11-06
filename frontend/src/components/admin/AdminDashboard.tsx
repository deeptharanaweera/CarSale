import React, { useEffect, useState } from 'react';
import { DashboardStats } from '../../types';
import { api } from '../../services/api';
import {
  TrendingUp,
  DollarSign,
  Car,
  Key,
  Calendar,
  Radio,
  Clock,
  ArrowUpRight,
  ShieldCheck,
  Activity,
  Layers,
} from 'lucide-react';

export const AdminDashboard: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getDashboardStats()
      .then((res) => setStats(res.data))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  if (loading || !stats) {
    return (
      <div className="p-8 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const { overview, charts, recent_activities } = stats;

  return (
    <div className="p-8 space-y-8 max-w-7xl mx-auto">
      {/* Top Banner */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-black text-white font-display">Executive Analytics</h2>
          <p className="text-sm text-slate-400">Live operational intelligence across dealerships, inventory, and showroom kiosks</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            Live Sync Active
          </div>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-4 gap-5">
        {/* Total Inventory Value */}
        <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Portfolio Value</span>
            <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          <div>
            <h3 className="text-3xl font-black text-white font-mono">
              ${overview.inventory_value.toLocaleString()}
            </h3>
            <p className="text-xs text-emerald-400 font-semibold mt-1 flex items-center gap-1">
              <ArrowUpRight className="w-3.5 h-3.5" /> Avg unit price: ${Math.round(overview.average_price).toLocaleString()}
            </p>
          </div>
        </div>

        {/* Vehicles Status */}
        <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Vehicles in Fleet</span>
            <div className="p-2 rounded-xl bg-sky-500/20 text-sky-400">
              <Car className="w-5 h-5" />
            </div>
          </div>
          <div>
            <h3 className="text-3xl font-black text-white font-mono">
              {overview.total_cars} Units
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              <strong className="text-emerald-400">{overview.available_cars}</strong> Available •{' '}
              <strong className="text-amber-400">{overview.reserved_cars}</strong> Reserved •{' '}
              <strong className="text-sky-400">{overview.sold_cars}</strong> Sold
            </p>
          </div>
        </div>

        {/* Test Drives & Enquiries */}
        <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Inbound Leads</span>
            <div className="p-2 rounded-xl bg-purple-500/20 text-purple-400">
              <Calendar className="w-5 h-5" />
            </div>
          </div>
          <div>
            <h3 className="text-3xl font-black text-white font-mono">
              {overview.total_enquiries + overview.total_test_drives} Leads
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              {overview.total_test_drives} Test Drives • {overview.total_enquiries} Inquiries
            </p>
          </div>
        </div>

        {/* Kiosks Online */}
        <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Showroom Kiosks</span>
            <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400">
              <Radio className="w-5 h-5" />
            </div>
          </div>
          <div>
            <h3 className="text-3xl font-black text-white font-mono">
              {overview.online_kiosks} / {overview.total_kiosks} Online
            </h3>
            <p className="text-xs text-emerald-400 font-semibold mt-1">
              {overview.kiosk_sessions} Customer Sessions • {overview.kiosk_leads} Kiosk Leads
            </p>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-3 gap-6">
        {/* Monthly Revenue Trend Bar Chart */}
        <div className="col-span-2 p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-lg font-bold text-white flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-emerald-400" />
              <span>Sales Volume & Revenue Trend</span>
            </h4>
            <span className="text-xs text-slate-400">Last 6 Months (USD)</span>
          </div>

          <div className="h-64 flex items-end gap-6 pt-8 pb-4 px-4 border-b border-slate-800">
            {charts.monthly_sales.slice(-6).map((item) => {
              const maxRev = 1800000;
              const heightPct = Math.round((item.revenue / maxRev) * 100);
              return (
                <div key={item.month} className="flex-1 flex flex-col items-center gap-2 h-full justify-end group">
                  <span className="text-[11px] font-mono text-emerald-400 font-bold opacity-0 group-hover:opacity-100 transition-opacity">
                    ${(item.revenue / 1000).toFixed(0)}k
                  </span>
                  <div
                    className="w-full rounded-t-xl bg-gradient-to-t from-emerald-600 to-teal-400 group-hover:brightness-125 transition-all relative"
                    style={{ height: `${heightPct}%` }}
                  >
                    <span className="absolute -top-6 left-1/2 -translate-x-1/2 text-[10px] text-slate-400 font-semibold whitespace-nowrap">
                      {item.units} units
                    </span>
                  </div>
                  <span className="text-xs font-semibold text-slate-400 mt-2">{item.month}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Brand Inventory Distribution */}
        <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl space-y-4">
          <h4 className="text-lg font-bold text-white flex items-center gap-2">
            <Layers className="w-5 h-5 text-sky-400" />
            <span>Brand Distribution</span>
          </h4>

          <div className="space-y-3 pt-2">
            {charts.brand_distribution.map((brand) => (
              <div key={brand.name} className="space-y-1">
                <div className="flex justify-between text-xs font-semibold">
                  <span className="text-slate-300">{brand.name}</span>
                  <span className="text-emerald-400 font-mono">{brand.count} cars</span>
                </div>
                <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                  <div
                    className="h-full bg-emerald-500 rounded-full"
                    style={{ width: `${Math.min(100, brand.count * 25)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Activity Log */}
      <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl space-y-4">
        <h4 className="text-lg font-bold text-white flex items-center gap-2">
          <Activity className="w-5 h-5 text-purple-400" />
          <span>Real-time Operational Audit Trail</span>
        </h4>

        <div className="divide-y divide-slate-800">
          {recent_activities.map((act) => (
            <div key={act.id} className="py-3 flex items-center justify-between text-sm">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-emerald-400" />
                <span className="font-semibold text-slate-200">{act.subject || act.action}</span>
              </div>
              <span className="text-xs text-slate-500 font-mono">
                {new Date(act.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

