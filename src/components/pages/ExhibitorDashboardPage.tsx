'use client';

import { useStore } from '@/store';
import StatCard from '@/components/ui/StatCard';
import Badge from '@/components/ui/Badge';
import { Users, Award, CreditCard, Clock } from 'lucide-react';

export default function ExhibitorDashboardPage() {
  const { exhibitors, badgesByExhibitor, paymentsByExhibitor } = useStore();

  const active      = exhibitors.filter(e => e.status === 'active').length;
  const pending     = exhibitors.filter(e => e.status === 'pending').length;
  const totalBadges = Object.values(badgesByExhibitor).flat().length;
  const totalPaid   = Object.values(paymentsByExhibitor).flat()
    .filter(p => p.status === 'paid').reduce((s, p) => s + p.total, 0);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Active Exhibitors"  value={active}      icon={<Users size={20} />}     color="blue"   trend={{ value: 8, positive: true }} />
        <StatCard title="Pending Approval"   value={pending}     icon={<Clock size={20} />}     color="yellow" />
        <StatCard title="Total Badges"       value={totalBadges} icon={<Award size={20} />}     color="purple" />
        <StatCard title="Revenue Collected"  value={`₹${(totalPaid / 1000).toFixed(0)}K`} icon={<CreditCard size={20} />} color="green" trend={{ value: 12, positive: true }} />
      </div>

      <div>
        <h3 className="text-sm font-semibold text-gray-900 mb-4">All Exhibitors</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {exhibitors.map((e) => (
            <div key={e.id} className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 hover:shadow-md transition-shadow">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center shrink-0">
                  <span className="text-blue-700 text-sm font-bold">{e.companyName.charAt(0)}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-900 truncate">{e.contactName || e.companyName}</p>
                  <p className="text-xs text-gray-500 truncate">{e.companyName}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs mb-3">
                <div><span className="text-gray-400">Stall</span><p className="font-semibold text-gray-700">{e.stallNo}</p></div>
                <div><span className="text-gray-400">Area</span><p className="font-semibold text-gray-700">{e.stallArea}</p></div>
              </div>
              <div className="flex items-center justify-between">
                <Badge label={e.status} variant={e.status === 'active' ? 'success' : e.status === 'pending' ? 'warning' : 'danger'} />
                <span className={`text-xs font-bold px-2 py-0.5 rounded ${e.type === 'B' ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'}`}>{e.type}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
