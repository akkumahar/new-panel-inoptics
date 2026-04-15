'use client';

import { useStore } from '@/store';
import Badge from '@/components/ui/Badge';
import StatCard from '@/components/ui/StatCard';
import { Search, Grid3X3, CheckCircle, Clock, Activity } from 'lucide-react';
import { useState } from 'react';

export default function StallsManagementPage() {
  const { stallsByExhibitor, exhibitors } = useStore();
  const [search, setSearch]           = useState('');
  const [hallFilter, setHallFilter]   = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [viewMode, setViewMode]       = useState<'table' | 'grid'>('table');

  // Flatten and enrich stalls
  const allStalls = Object.entries(stallsByExhibitor).flatMap(([exhibitorId, items]) =>
    items.map((s) => ({
      ...s,
      companyName: exhibitors.find((e) => e.id === exhibitorId)?.companyName ?? exhibitorId,
    }))
  );

  const halls   = [...new Set(allStalls.map((s) => s.hallNo).filter(Boolean))];
  const booked  = allStalls.filter(s => s.status === 'booked').length;
  const avail   = allStalls.filter(s => s.status !== 'booked').length;

  const filtered = allStalls.filter((s) => {
    const q = search.toLowerCase();
    const matchSearch = s.stallNo.toLowerCase().includes(q) || s.companyName.toLowerCase().includes(q);
    const matchHall   = hallFilter === 'all' || s.hallNo === hallFilter;
    const matchStatus = statusFilter === 'all' || s.status === statusFilter;
    return matchSearch && matchHall && matchStatus;
  });

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Stalls Management</h2>
          <p className="text-sm text-gray-500">{allStalls.length} total stalls</p>
        </div>
        <div className="flex items-center gap-1.5">
          <button onClick={() => setViewMode('table')}
            className={`p-2 rounded-lg transition-colors ${viewMode === 'table' ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-500'}`}>
            <Activity size={15} />
          </button>
          <button onClick={() => setViewMode('grid')}
            className={`p-2 rounded-lg transition-colors ${viewMode === 'grid' ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-500'}`}>
            <Grid3X3 size={15} />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard title="Booked Stalls"    value={booked} icon={<CheckCircle size={20} />} color="green" />
        <StatCard title="Available Stalls" value={avail}  icon={<Activity size={20} />}    color="blue" />
        <StatCard title="Total Stalls"     value={allStalls.length} icon={<Grid3X3 size={20} />} color="purple" />
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex items-center gap-2 bg-gray-100 rounded-lg px-3 py-2 flex-1">
            <Search size={15} className="text-gray-400" />
            <input type="text" placeholder="Search by stall no or exhibitor..."
              value={search} onChange={(e) => setSearch(e.target.value)}
              className="bg-transparent text-sm text-gray-700 outline-none w-full placeholder-gray-400" />
          </div>
          <select value={hallFilter} onChange={(e) => setHallFilter(e.target.value)}
            className="bg-gray-100 text-sm text-gray-700 rounded-lg px-3 py-2 outline-none border-0">
            <option value="all">All Halls</option>
            {halls.map(h => <option key={h} value={h}>{h}</option>)}
          </select>
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-gray-100 text-sm text-gray-700 rounded-lg px-3 py-2 outline-none border-0">
            <option value="all">All Status</option>
            <option value="booked">Booked</option>
            <option value="available">Available</option>
          </select>
        </div>
      </div>

      {viewMode === 'grid' ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
          {filtered.map((s) => (
            <div key={s.id} className={`rounded-xl p-3 border-2 cursor-pointer transition-all hover:shadow-md
              ${s.status === 'booked' ? 'bg-blue-50 border-blue-300' : 'bg-green-50 border-green-300'}`}>
              <p className="text-sm font-bold text-gray-900">{s.stallNo}</p>
              <p className="text-xs text-gray-500 mt-0.5">{s.stallArea}</p>
              <p className={`text-xs font-medium mt-1 capitalize ${s.status === 'booked' ? 'text-blue-600' : 'text-green-600'}`}>{s.status}</p>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  {['#', 'Stall No', 'Hall', 'Area', 'Type', 'Exhibitor', 'Status'].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filtered.map((s, i) => (
                  <tr key={s.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 text-xs text-gray-500">{i + 1}</td>
                    <td className="px-4 py-3 text-sm font-semibold text-gray-800">{s.stallNo}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{s.hallNo}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{s.stallArea}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-bold
                        ${s.type === 'B' ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'}`}>{s.type}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-xs text-gray-600 truncate max-w-40 block">{s.companyName}</span>
                    </td>
                    <td className="px-4 py-3">
                      <Badge label={s.status} variant={s.status === 'booked' ? 'info' : 'success'} />
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr><td colSpan={7} className="px-4 py-10 text-center text-sm text-gray-400">No stalls found</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
