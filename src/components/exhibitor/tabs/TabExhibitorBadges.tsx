'use client';

import { useStore } from '@/store';
import type { ExhibitorBadge } from '@/store';
import { useState, useEffect } from 'react';
import { Plus, Trash2, X, Medal, CheckCircle, Clock } from 'lucide-react';
import { getApi } from '@/services/api';

export default function TabExhibitorBadges() {
  const { selectedExhibitor, badgesByExhibitor, setBadges, addBadge, deleteBadge } = useStore();
  const id = selectedExhibitor!.id;
  const companyName = selectedExhibitor!.companyName;
  const badges = badgesByExhibitor[id] || [];
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const raw = await getApi.badgesByCompany(companyName);
        const mapped: ExhibitorBadge[] = raw.map((r) => ({
          id: r.id,
          exhibitorId: id,
          badgeNo: r.badge_no || '',
          name: r.name || '',
          designation: r.designation || '',
          consumed: Number(r.consumed) === 1,
        }));
        setBadges(id, mapped);
      } catch { /* keep existing */ }
    }
    load();
  }, [id, companyName, setBadges]);
  const [form, setForm] = useState({ badgeNo: '', name: '', designation: '' });

  const consumed = badges.filter((b) => b.consumed).length;

  const handleAdd = () => {
    if (!form.name) return;
    addBadge({ id: Date.now().toString(), exhibitorId: id, ...form, consumed: false });
    setForm({ badgeNo: '', name: '', designation: '' });
    setShowForm(false);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold text-gray-900">Exhibitor Badges</h3>
          <p className="text-xs text-gray-500 mt-0.5">
            Total: <span className="font-semibold">{badges.length}</span> &nbsp;|&nbsp;
            Consumed: <span className="font-semibold text-green-600">{consumed}</span> &nbsp;|&nbsp;
            Remaining: <span className="font-semibold text-blue-600">{badges.length - consumed}</span>
          </p>
        </div>
        <button onClick={() => setShowForm(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors">
          <Plus size={13} /> Add Badge
        </button>
      </div>

      {showForm && (
        <div className="bg-purple-50 border border-purple-200 rounded-xl p-4 space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Badge No</label>
              <input value={form.badgeNo} onChange={(e) => setForm(f => ({ ...f, badgeNo: e.target.value }))}
                placeholder="e.g. B-001"
                className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-purple-400" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Name *</label>
              <input value={form.name} onChange={(e) => setForm(f => ({ ...f, name: e.target.value }))}
                placeholder="Full name"
                className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-purple-400" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Designation</label>
              <input value={form.designation} onChange={(e) => setForm(f => ({ ...f, designation: e.target.value }))}
                placeholder="e.g. Director"
                className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-purple-400" />
            </div>
          </div>
          <div className="flex gap-2">
            <button onClick={() => setShowForm(false)}
              className="px-3 py-1.5 text-xs font-medium text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-1">
              <X size={12} /> Cancel
            </button>
            <button onClick={handleAdd}
              className="px-3 py-1.5 text-xs font-medium text-white bg-purple-600 rounded-lg hover:bg-purple-700 transition-colors flex items-center gap-1">
              <Plus size={12} /> Add
            </button>
          </div>
        </div>
      )}

      {badges.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {badges.map((badge) => (
            <div key={badge.id} className={`relative p-4 rounded-xl border-2 transition-all
              ${badge.consumed ? 'bg-green-50 border-green-200' : 'bg-blue-50 border-blue-200'}`}>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2 mb-2">
                  <Medal size={16} className={badge.consumed ? 'text-green-500' : 'text-blue-500'} />
                  <span className="text-xs font-semibold text-gray-500">{badge.badgeNo || '—'}</span>
                </div>
                <button onClick={() => deleteBadge(id, badge.id)}
                  className="w-6 h-6 flex items-center justify-center rounded bg-red-500 hover:bg-red-600 text-white transition-colors">
                  <Trash2 size={11} />
                </button>
              </div>
              <p className="text-sm font-semibold text-gray-900">{badge.name}</p>
              <p className="text-xs text-gray-500 mt-0.5">{badge.designation || 'N/A'}</p>
              <div className="flex items-center gap-1 mt-2">
                {badge.consumed
                  ? <><CheckCircle size={12} className="text-green-500" /><span className="text-xs text-green-600 font-medium">Consumed</span></>
                  : <><Clock size={12} className="text-blue-500" /><span className="text-xs text-blue-600 font-medium">Available</span></>
                }
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-10 text-sm text-gray-400 flex flex-col items-center gap-2">
          <Medal size={28} className="text-gray-300" />
          No badges issued yet.
        </div>
      )}
    </div>
  );
}
