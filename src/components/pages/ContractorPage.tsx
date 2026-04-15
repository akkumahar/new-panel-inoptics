'use client';

import { useStore } from '@/store';
import { useState } from 'react';
import { Search, CheckCircle, XCircle, Eye, Wrench } from 'lucide-react';

export default function ContractorPage() {
  const { contractorsByExhibitor, exhibitors, approveContractor, deleteContractor } = useStore();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Flatten all contractors across all exhibitors
  const allContractors = Object.entries(contractorsByExhibitor).flatMap(([exhibitorId, items]) =>
    items.map((c) => ({
      ...c,
      exhibitorId,
      companyName: exhibitors.find((e) => e.id === exhibitorId)?.companyName ?? exhibitorId,
    }))
  );

  const filtered = allContractors.filter((c) => {
    const q = search.toLowerCase();
    const matchSearch = c.contractorName.toLowerCase().includes(q) || c.company.toLowerCase().includes(q);
    const matchStatus = statusFilter === 'all' || c.status === statusFilter;
    return matchSearch && matchStatus;
  });

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Contractor</h2>
          <p className="text-sm text-gray-500">{allContractors.length} total contractors</p>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex items-center gap-2 bg-gray-100 rounded-lg px-3 py-2 flex-1">
            <Search size={15} className="text-gray-400" />
            <input
              type="text"
              placeholder="Search contractors..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="bg-transparent text-sm text-gray-700 outline-none w-full placeholder-gray-400"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-gray-100 text-sm text-gray-700 rounded-lg px-3 py-2 outline-none border-0"
          >
            <option value="all">All Status</option>
            <option value="approved">Approved</option>
            <option value="pending">Pending</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                {['#', 'Contractor', 'Exhibitor', 'Phone', 'Type', 'Status', 'Actions'].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.map((c, i) => (
                <tr key={`${c.exhibitorId}-${c.id}`} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3 text-xs text-gray-500">{i + 1}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center shrink-0">
                        <Wrench size={14} className="text-orange-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">{c.contractorName}</p>
                        <p className="text-xs text-gray-500">{c.company}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 hidden sm:table-cell">
                    <p className="text-xs text-gray-600 max-w-45 truncate">{c.companyName}</p>
                  </td>
                  <td className="px-4 py-3 hidden md:table-cell">
                    <span className="text-sm text-gray-600">{c.phone}</span>
                  </td>
                  <td className="px-4 py-3 hidden md:table-cell">
                    <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-orange-100 text-xs font-medium text-orange-700">
                      {c.type}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold
                      ${c.status === 'approved' ? 'bg-green-100 text-green-700' :
                        c.status === 'pending' ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'}`}>
                      {c.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      {c.status === 'pending' && (
                        <button
                          onClick={() => approveContractor(c.exhibitorId, c.id)}
                          title="Approve"
                          className="w-7 h-7 flex items-center justify-center rounded bg-green-500 hover:bg-green-600 text-white transition-colors"
                        >
                          <CheckCircle size={13} />
                        </button>
                      )}
                      <button
                        onClick={() => deleteContractor(c.exhibitorId, c.id)}
                        title="Delete"
                        className="w-7 h-7 flex items-center justify-center rounded bg-red-500 hover:bg-red-600 text-white transition-colors"
                      >
                        <XCircle size={13} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-4 py-10 text-center text-sm text-gray-400">
                    No contractors found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
