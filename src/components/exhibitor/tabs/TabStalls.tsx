'use client';

import { useStore } from '@/store';
import type { ExhibitorStall } from '@/store';
import { useState, useEffect } from 'react';
import { Plus, Trash2, X, Loader2 } from 'lucide-react';
import { getApi } from '@/services/api';

export default function TabStalls() {
  const { selectedExhibitor, stallsByExhibitor, setStalls, addStall, deleteStall } = useStore();
  const id = selectedExhibitor!.id;
  const companyName = selectedExhibitor!.companyName;
  const stalls = stallsByExhibitor[id] || [];
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const raw = await getApi.stallsByCompany(companyName);
        const mapped: ExhibitorStall[] = raw.map((r) => ({
          id: r.id,
          exhibitorId: id,
          stallNo: r.stall_no,
          stallArea: r.stall_area || '',
          hallNo: r.hall_no || '',
          type: (r.category ?? 'S') as 'B' | 'S',
          status: 'booked',
        }));
        setStalls(id, mapped);
      } catch {
        // keep existing data on error
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [id, companyName, setStalls]);
  const [form, setForm] = useState({ stallNo: '', stallArea: '', hallNo: '', type: 'S' });

  const handleAdd = () => {
    if (!form.stallNo) return;
    addStall({ id: Date.now().toString(), exhibitorId: id, ...form, type: form.type as 'B' | 'S', status: 'booked' });
    setForm({ stallNo: '', stallArea: '', hallNo: '', type: 'S' });
    setShowForm(false);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-gray-900">Stall Allocations</h3>
        <button onClick={() => setShowForm(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors">
          <Plus size={13} /> Add Stall
        </button>
      </div>

      {/* Add form */}
      {showForm && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input label="Stall No *" value={form.stallNo} onChange={(v) => setForm(f => ({ ...f, stallNo: v }))} placeholder="e.g. A-101(S)" />
            <Input label="Stall Area" value={form.stallArea} onChange={(v) => setForm(f => ({ ...f, stallArea: v }))} placeholder="e.g. 18 sq mtr" />
            <Input label="Hall No" value={form.hallNo} onChange={(v) => setForm(f => ({ ...f, hallNo: v }))} placeholder="e.g. Hall A" />
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Type</label>
              <select value={form.type} onChange={(e) => setForm(f => ({ ...f, type: e.target.value }))}
                className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none">
                <option value="S">S - Seller</option>
                <option value="B">B - Buyer</option>
              </select>
            </div>
          </div>
          <div className="flex gap-2">
            <button onClick={() => setShowForm(false)}
              className="px-3 py-1.5 text-xs font-medium text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-1">
              <X size={12} /> Cancel
            </button>
            <button onClick={handleAdd}
              className="px-3 py-1.5 text-xs font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-1">
              <Plus size={12} /> Add
            </button>
          </div>
        </div>
      )}

      {/* Table */}
      {stalls.length > 0 ? (
        <div className="overflow-x-auto rounded-xl border border-gray-200">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                {['#', 'Stall No', 'Stall Area', 'Hall No', 'Type', 'Action'].map((h) => (
                  <th key={h} className="px-4 py-2.5 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {stalls.map((s, i) => (
                <tr key={s.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3 text-xs text-gray-500">{i + 1}</td>
                  <td className="px-4 py-3 text-sm font-semibold text-gray-800">{s.stallNo}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">{s.stallArea}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">{s.hallNo}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-bold
                      ${s.type === 'B' ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'}`}>
                      {s.type}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <button onClick={() => deleteStall(id, s.id)}
                      className="w-7 h-7 flex items-center justify-center rounded bg-red-500 hover:bg-red-600 text-white transition-colors">
                      <Trash2 size={13} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <EmptyState message="No stalls allocated yet." />
      )}
    </div>
  );
}

function Input({ label, value, onChange, placeholder }: { label: string; value: string; onChange: (v: string) => void; placeholder?: string }) {
  return (
    <div>
      <label className="block text-xs font-medium text-gray-600 mb-1">{label}</label>
      <input value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder}
        className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-400 transition-colors" />
    </div>
  );
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="text-center py-10 text-sm text-gray-400">{message}</div>
  );
}
