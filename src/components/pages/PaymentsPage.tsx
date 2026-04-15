'use client';

import { useStore } from '@/store';
import Badge from '@/components/ui/Badge';
import StatCard from '@/components/ui/StatCard';
import { Search, Download, CreditCard, Clock, XCircle } from 'lucide-react';
import { useState } from 'react';

export default function PaymentsPage() {
  const { paymentsByExhibitor, exhibitors } = useStore();
  const [search, setSearch]           = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Flatten and enrich with exhibitor name
  const allPayments = Object.entries(paymentsByExhibitor).flatMap(([exhibitorId, items]) =>
    items.map((p) => ({
      ...p,
      exhibitorName: exhibitors.find((e) => e.id === exhibitorId)?.companyName ?? exhibitorId,
    }))
  );

  const totalRevenue  = allPayments.filter(p => p.status === 'paid').reduce((s, p) => s + p.total, 0);
  const pendingAmount = allPayments.filter(p => p.status === 'pending').reduce((s, p) => s + p.total, 0);
  const failedCount   = allPayments.filter(p => p.status === 'failed').length;

  const filtered = allPayments.filter((p) => {
    const q = search.toLowerCase();
    const matchSearch = p.exhibitorName.toLowerCase().includes(q) || p.description.toLowerCase().includes(q);
    const matchStatus = statusFilter === 'all' || p.status === statusFilter;
    return matchSearch && matchStatus;
  });

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Payments</h2>
          <p className="text-sm text-gray-500">All payment transactions</p>
        </div>
        <button className="flex items-center gap-2 bg-gray-100 text-gray-600 px-4 py-2 rounded-lg text-sm hover:bg-gray-200 transition-colors">
          <Download size={15} /> Export
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard title="Total Revenue"     value={`₹${(totalRevenue / 1000).toFixed(0)}K`} icon={<CreditCard size={20} />} color="green" />
        <StatCard title="Pending Amount"    value={`₹${(pendingAmount / 1000).toFixed(0)}K`} icon={<Clock size={20} />}     color="yellow" />
        <StatCard title="Failed Payments"   value={failedCount}                               icon={<XCircle size={20} />}  color="red" />
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex items-center gap-2 bg-gray-100 rounded-lg px-3 py-2 flex-1">
            <Search size={15} className="text-gray-400" />
            <input type="text" placeholder="Search by exhibitor or description..."
              value={search} onChange={(e) => setSearch(e.target.value)}
              className="bg-transparent text-sm text-gray-700 outline-none w-full placeholder-gray-400" />
          </div>
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-gray-100 text-sm text-gray-700 rounded-lg px-3 py-2 outline-none border-0">
            <option value="all">All Status</option>
            <option value="paid">Paid</option>
            <option value="pending">Pending</option>
            <option value="failed">Failed</option>
          </select>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                {['#', 'Exhibitor', 'Description', 'Amount', 'Tax', 'Total', 'Method', 'Date', 'Status'].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.map((p, i) => (
                <tr key={p.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3 text-xs text-gray-500">{i + 1}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 bg-green-100 rounded-full flex items-center justify-center shrink-0">
                        <span className="text-green-600 text-xs font-bold">{p.exhibitorName.charAt(0)}</span>
                      </div>
                      <span className="text-xs font-medium text-gray-800 truncate max-w-32">{p.exhibitorName}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3"><span className="text-xs text-gray-700 truncate max-w-40 block">{p.description}</span></td>
                  <td className="px-4 py-3 whitespace-nowrap"><span className="text-sm text-gray-700">₹{p.amount.toLocaleString()}</span></td>
                  <td className="px-4 py-3 whitespace-nowrap"><span className="text-sm text-gray-500">₹{p.tax.toLocaleString()}</span></td>
                  <td className="px-4 py-3 whitespace-nowrap"><span className="text-sm font-semibold text-gray-900">₹{p.total.toLocaleString()}</span></td>
                  <td className="px-4 py-3"><span className="text-xs text-gray-600">{p.method}</span></td>
                  <td className="px-4 py-3"><span className="text-xs text-gray-500">{p.date}</span></td>
                  <td className="px-4 py-3">
                    <Badge label={p.status} variant={p.status === 'paid' ? 'success' : p.status === 'pending' ? 'warning' : 'danger'} />
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan={9} className="px-4 py-10 text-center text-sm text-gray-400">No payments found</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
