'use client';

import { useStore } from '@/store';
import { useState, useEffect } from 'react';
import { Search, Plus, Download, Edit2, Trash2, FileText, Eye, X, Loader2 } from 'lucide-react';
import ExhibitorDetail from '@/components/exhibitor/ExhibitorDetail';
import ExhibitorFormModal from '@/components/exhibitor/ExhibitorFormModal';
import type { Exhibitor } from '@/store';
import { getApi } from '@/services/api';
import type { RawExhibitor } from '@/services/api';

type GroupedExhibitor = Omit<RawExhibitor, 'stall_no' | 'category' | 'stall_area'> & {
  stall_no: string[];
  category: string[];
  stall_area: string[];
};

export default function ExhibitorsPage() {
  const { exhibitors, selectedExhibitor, setSelectedExhibitor, deleteExhibitor, setExhibitors } = useStore();
  const [apiLoading, setApiLoading] = useState(false);

  useEffect(() => {
    async function load() {
      setApiLoading(true);
      try {
        const raw = await getApi.exhibitors();
        // Group rows by company_name — one company may have multiple stalls
        const grouped = Object.values(
          raw.reduce((acc: Record<string, GroupedExhibitor>, item) => {
            const key = item.company_name;
            if (!acc[key]) {
              acc[key] = { ...item, stall_no: [], category: [], stall_area: [] };
            }
            if (item.stall_no) acc[key].stall_no.push(item.stall_no);
            if (item.category) acc[key].category.push(item.category);
            if (item.stall_area) acc[key].stall_area.push(item.stall_area);
            return acc;
          }, {})
        ) as GroupedExhibitor[];

        const mapped: Exhibitor[] = grouped.map((g) => ({
          id: g.id,
          companyName: g.company_name,
          contactName: g.contact_name || '',
          stallNo: g.stall_no.join(', '),
          stallArea: g.stall_area.join(', '),
          type: ((g.category[0] ?? 'S') as 'B' | 'S'),
          email: g.email || '',
          mobile: g.mobile_no || '',
          address: g.address,
          city: g.city,
          state: g.state,
          pincode: g.pin_code,
          website: g.website,
          gst: g.gst_number,
          status: 'active',
          createdAt: new Date().toISOString().split('T')[0],
        }));

        setExhibitors(mapped);
      } catch (err) {
        console.error('Failed to load exhibitors from API:', err);
        // keep mock data on error
      } finally {
        setApiLoading(false);
      }
    }
    load();
  }, [setExhibitors]);
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editTarget, setEditTarget] = useState<Exhibitor | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const filtered = exhibitors.filter((e) => {
    const q = search.toLowerCase();
    return (
      e.companyName.toLowerCase().includes(q) ||
      e.email.toLowerCase().includes(q) ||
      e.stallNo.toLowerCase().includes(q) ||
      e.mobile.includes(q)
    );
  });

  const handleEdit = (e: Exhibitor) => { setEditTarget(e); setShowForm(true); };
  const handleDelete = (id: string) => { deleteExhibitor(id); setDeleteConfirm(null); };

  // If an exhibitor is selected, render the detail view
  if (selectedExhibitor) {
    return <ExhibitorDetail onBack={() => setSelectedExhibitor(null)} />;
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-semibold text-gray-900">Exhibitors</h2>
            {apiLoading && <Loader2 size={16} className="text-blue-500 animate-spin" />}
          </div>
          <p className="text-sm text-gray-500">{exhibitors.length} total exhibitors registered</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => { setExhibitorDownload(); }}
            className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors shadow-sm"
          >
            <Download size={15} />
            Export
          </button>
          <button
            onClick={() => { setEditTarget(null); setShowForm(true); }}
            className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
          >
            <Plus size={15} />
            Add Exhibitor
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-lg px-3 py-2 shadow-sm">
        <Search size={15} className="text-gray-400 shrink-0" />
        <input
          type="text"
          placeholder="Search by company, email, stall no, mobile..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="bg-transparent text-sm text-gray-700 outline-none w-full placeholder-gray-400"
        />
        {search && (
          <button onClick={() => setSearch('')} className="text-gray-400 hover:text-gray-600">
            <X size={14} />
          </button>
        )}
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-100 border-b border-gray-200">
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider w-10">ID</th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">COMPANY NAME</th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">STALL NO</th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider hidden md:table-cell">STALL AREA</th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider hidden sm:table-cell w-16">(B/S)</th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider hidden lg:table-cell">EMAIL</th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider hidden xl:table-cell">MOBILE</th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">ACTION</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.map((exhibitor, idx) => (
                <tr key={exhibitor.id} className="hover:bg-blue-50/30 transition-colors">
                  <td className="px-4 py-3 text-gray-500 text-xs">{idx + 1}</td>
                  <td className="px-4 py-3 text-center">
                    <span className="font-medium text-gray-800 text-xs">{exhibitor.companyName}</span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className="text-xs text-gray-700 whitespace-nowrap">{exhibitor.stallNo}</span>
                  </td>
                  <td className="px-4 py-3 text-center hidden md:table-cell">
                    <span className="text-xs text-gray-600 whitespace-nowrap">{exhibitor.stallArea}</span>
                  </td>
                  <td className="px-4 py-3 text-center hidden sm:table-cell">
                    <span className={`inline-flex items-center justify-center w-6 h-6 rounded text-xs font-bold
                      ${exhibitor.type === 'B' ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'}
                    `}>
                      {exhibitor.type}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center hidden lg:table-cell">
                    <span className="text-xs text-gray-600">{exhibitor.email}</span>
                  </td>
                  <td className="px-4 py-3 text-center hidden xl:table-cell">
                    <span className="text-xs text-gray-600 whitespace-pre-line">{exhibitor.mobile}</span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-center gap-1">
                      {/* Edit */}
                      <button
                        onClick={() => handleEdit(exhibitor)}
                        title="Edit"
                        className="w-7 h-7 flex items-center justify-center rounded bg-green-500 hover:bg-green-600 text-white transition-colors"
                      >
                        <Edit2 size={13} />
                      </button>
                      {/* Delete */}
                      <button
                        onClick={() => setDeleteConfirm(exhibitor.id)}
                        title="Delete"
                        className="w-7 h-7 flex items-center justify-center rounded bg-red-500 hover:bg-red-600 text-white transition-colors"
                      >
                        <Trash2 size={13} />
                      </button>
                      {/* Forms */}
                      <button
                        title="Forms"
                        className="w-7 h-7 flex items-center justify-center rounded bg-blue-500 hover:bg-blue-600 text-white transition-colors"
                      >
                        <FileText size={13} />
                      </button>
                      {/* View Detail */}
                      <button
                        onClick={() => setSelectedExhibitor(exhibitor)}
                        title="View Details"
                        className="w-7 h-7 flex items-center justify-center rounded bg-cyan-500 hover:bg-cyan-600 text-white transition-colors"
                      >
                        <Eye size={13} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-4 py-12 text-center text-sm text-gray-400">
                    No exhibitors found{search ? ` for "${search}"` : ''}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination hint */}
        <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100 bg-gray-50">
          <p className="text-xs text-gray-500">
            Showing {filtered.length} of {exhibitors.length} exhibitors
          </p>
        </div>
      </div>

      {/* Delete Confirm Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/50" onClick={() => setDeleteConfirm(null)} />
          <div className="relative bg-white rounded-xl shadow-xl p-6 w-full max-w-sm mx-4">
            <h3 className="text-base font-semibold text-gray-900">Delete Exhibitor</h3>
            <p className="text-sm text-gray-500 mt-2">
              Are you sure you want to delete this exhibitor? This action cannot be undone.
            </p>
            <div className="flex gap-3 mt-5">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deleteConfirm)}
                className="flex-1 px-4 py-2 text-sm font-medium text-white bg-red-500 rounded-lg hover:bg-red-600 transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add / Edit Modal */}
      {showForm && (
        <ExhibitorFormModal
          exhibitor={editTarget}
          onClose={() => { setShowForm(false); setEditTarget(null); }}
        />
      )}
    </div>
  );
}

// no-op export download placeholder
function setExhibitorDownload() {
  const rows = [['ID', 'Company', 'Stall No', 'Stall Area', 'Type', 'Email', 'Mobile']];
  const csv = rows.map((r) => r.join(',')).join('\n');
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'exhibitors.csv';
  a.click();
}
