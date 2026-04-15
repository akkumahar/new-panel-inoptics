'use client';

import { useStore } from '@/store';
import StatCard from '@/components/ui/StatCard';
import Badge from '@/components/ui/Badge';
import { Users, Grid3X3, CreditCard, Clock, TrendingUp, Building2, CheckCircle, AlertCircle, XCircle, Activity } from 'lucide-react';

export default function DashboardPage() {
  const { exhibitors, paymentsByExhibitor, stallsByExhibitor, contractorsByExhibitor } = useStore();

  // Flatten payments and stalls from per-exhibitor maps
  const allPayments = Object.values(paymentsByExhibitor).flat();
  const allStalls   = Object.values(stallsByExhibitor).flat();

  const totalRevenue    = allPayments.filter(p => p.status === 'paid').reduce((s, p) => s + p.total, 0);
  const pendingPayments = allPayments.filter(p => p.status === 'pending').length;
  const bookedStalls    = allStalls.filter(s => s.status === 'booked').length;
  const allContractors  = Object.values(contractorsByExhibitor).flat();
  const pendingRequests = allContractors.filter(c => c.status === 'pending').length;

  const occupancy = allStalls.length > 0 ? Math.round((bookedStalls / allStalls.length) * 100) : 0;

  const recentExhibitors = exhibitors.slice(0, 5);
  const recentPayments   = allPayments.slice(0, 4);

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-6 gap-3">
        <StatCard title="Total Exhibitors"  value={exhibitors.length}  icon={<Users size={20} />}      color="blue"   trend={{ value: 12, positive: true }} />
        <StatCard title="Total Stalls"      value={allStalls.length}   icon={<Grid3X3 size={20} />}    color="purple" subtitle={`${occupancy}% occupied`} />
        <StatCard title="Payments Done"     value={allPayments.filter(p => p.status === 'paid').length} icon={<CreditCard size={20} />} color="green" trend={{ value: 8, positive: true }} />
        <StatCard title="Pending Payments"  value={pendingPayments}    icon={<Clock size={20} />}      color="yellow" />
        <StatCard title="Total Revenue"     value={`₹${(totalRevenue / 100000).toFixed(1)}L`} icon={<TrendingUp size={20} />} color="green" trend={{ value: 15, positive: true }} />
        <StatCard title="Pending Requests"  value={pendingRequests}    icon={<Building2 size={20} />}  color="orange" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Recent Exhibitors */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between px-5 py-3.5 border-b border-gray-100">
            <h3 className="text-sm font-semibold text-gray-900">Recent Exhibitors</h3>
            <button className="text-xs text-blue-600 hover:text-blue-700 font-medium">View All</button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-xs text-gray-500 border-b border-gray-100">
                  <th className="text-left px-5 py-2.5 font-medium">Name</th>
                  <th className="text-left px-5 py-2.5 font-medium hidden sm:table-cell">Company</th>
                  <th className="text-left px-5 py-2.5 font-medium hidden md:table-cell">Stall</th>
                  <th className="text-left px-5 py-2.5 font-medium">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {recentExhibitors.map((ex) => (
                  <tr key={ex.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 bg-blue-100 rounded-full flex items-center justify-center shrink-0">
                          <span className="text-blue-600 text-xs font-bold">{ex.companyName.charAt(0)}</span>
                        </div>
                        <span className="text-sm font-medium text-gray-900 truncate max-w-32">{ex.contactName || ex.companyName}</span>
                      </div>
                    </td>
                    <td className="px-5 py-3 hidden sm:table-cell">
                      <span className="text-xs text-gray-600 truncate max-w-40 block">{ex.companyName}</span>
                    </td>
                    <td className="px-5 py-3 hidden md:table-cell">
                      <span className="text-xs text-gray-600">{ex.stallNo}</span>
                    </td>
                    <td className="px-5 py-3">
                      <Badge label={ex.status} variant={ex.status === 'active' ? 'success' : ex.status === 'pending' ? 'warning' : 'danger'} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right column */}
        <div className="space-y-4">
          {/* Stall Overview */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
            <h3 className="text-sm font-semibold text-gray-900 mb-3">Stall Overview</h3>
            <div className="space-y-2.5">
              {[
                { label: 'Booked',    count: allStalls.filter(s => s.status === 'booked').length,    icon: <CheckCircle size={14} className="text-green-500" />,  color: 'text-green-700' },
                { label: 'Available', count: allStalls.filter(s => s.status !== 'booked').length,    icon: <Activity size={14} className="text-blue-500" />,      color: 'text-blue-700' },
              ].map(({ label, count, icon, color }) => (
                <div key={label} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">{icon}<span className="text-sm text-gray-600">{label}</span></div>
                  <span className={`text-sm font-semibold ${color}`}>{count}</span>
                </div>
              ))}
            </div>
            <div className="mt-3">
              <div className="flex justify-between text-xs text-gray-500 mb-1"><span>Occupancy</span><span>{occupancy}%</span></div>
              <div className="w-full bg-gray-100 rounded-full h-1.5">
                <div className="bg-blue-500 h-1.5 rounded-full transition-all" style={{ width: `${occupancy}%` }} />
              </div>
            </div>
          </div>

          {/* Recent Payments */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
            <h3 className="text-sm font-semibold text-gray-900 mb-3">Recent Payments</h3>
            <div className="space-y-2.5">
              {recentPayments.map((p) => (
                <div key={p.id} className="flex items-center justify-between">
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-medium text-gray-800 truncate">{p.description}</p>
                    <p className="text-xs text-gray-400">{p.date}</p>
                  </div>
                  <div className="flex items-center gap-1.5 ml-2 shrink-0">
                    <span className="text-xs font-semibold text-gray-900">₹{p.total.toLocaleString()}</span>
                    {p.status === 'paid'    ? <CheckCircle size={13} className="text-green-500" />
                    : p.status === 'pending' ? <AlertCircle size={13} className="text-yellow-500" />
                    :                          <XCircle size={13} className="text-red-500" />}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
