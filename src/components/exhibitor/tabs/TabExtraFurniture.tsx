'use client';

import { useStore } from '@/store';
import type { FurnitureRequirement } from '@/store';
import { useState, useEffect } from 'react';
import { Plus, Trash2, X, Armchair } from 'lucide-react';
import { getApi } from '@/services/api';

export default function TabExtraFurniture() {
  const { selectedExhibitor, furnitureByExhibitor, setFurniture, addFurniture, deleteFurniture } = useStore();
  const id = selectedExhibitor!.id;
  const companyName = selectedExhibitor!.companyName;
  const items = furnitureByExhibitor[id] || [];
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const raw = await getApi.furnitureByCompany(companyName);
        const mapped: FurnitureRequirement[] = raw.map((r) => {
          const qty  = Number(r.quantity) || 0;
          const rate = Number(r.rate) || 0;
          return {
            id: r.id,
            exhibitorId: id,
            item: r.item_name || '',
            quantity: qty,
            rate,
            total: Number(r.total) || qty * rate,
          };
        });
        setFurniture(id, mapped);
      } catch { /* keep existing */ }
    }
    load();
  }, [id, companyName, setFurniture]);
  const [form, setForm] = useState({ item: '', quantity: '', rate: '' });

  const grandTotal = items.reduce((s, i) => s + i.total, 0);

  const handleAdd = () => {
    if (!form.item) return;
    const qty = Number(form.quantity) || 1;
    const rate = Number(form.rate) || 0;
    addFurniture({ id: Date.now().toString(), exhibitorId: id, item: form.item, quantity: qty, rate, total: qty * rate });
    setForm({ item: '', quantity: '', rate: '' });
    setShowForm(false);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold text-gray-900">Extra Furniture Requirements</h3>
          {items.length > 0 && (
            <p className="text-xs text-gray-500 mt-0.5">Total Amount: <span className="font-semibold text-blue-600">₹{grandTotal.toLocaleString()}</span></p>
          )}
        </div>
        <button onClick={() => setShowForm(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors">
          <Plus size={13} /> Add Item
        </button>
      </div>

      {showForm && (
        <div className="bg-teal-50 border border-teal-200 rounded-xl p-4 space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Item Name *</label>
              <input value={form.item} onChange={(e) => setForm(f => ({ ...f, item: e.target.value }))}
                placeholder="e.g. Reception Counter"
                className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-teal-400" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Quantity</label>
              <input type="number" min="1" value={form.quantity} onChange={(e) => setForm(f => ({ ...f, quantity: e.target.value }))}
                placeholder="1"
                className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-teal-400" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Rate (₹)</label>
              <input type="number" min="0" value={form.rate} onChange={(e) => setForm(f => ({ ...f, rate: e.target.value }))}
                placeholder="0"
                className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-teal-400" />
            </div>
          </div>
          <div className="flex gap-2">
            <button onClick={() => setShowForm(false)}
              className="px-3 py-1.5 text-xs font-medium text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-1">
              <X size={12} /> Cancel
            </button>
            <button onClick={handleAdd}
              className="px-3 py-1.5 text-xs font-medium text-white bg-teal-600 rounded-lg hover:bg-teal-700 transition-colors flex items-center gap-1">
              <Plus size={12} /> Add
            </button>
          </div>
        </div>
      )}

      {items.length > 0 ? (
        <div className="overflow-x-auto rounded-xl border border-gray-200">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                {['#', 'Item', 'Qty', 'Rate (₹)', 'Total (₹)', 'Action'].map(h => (
                  <th key={h} className="px-4 py-2.5 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {items.map((item, i) => (
                <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3 text-xs text-gray-500">{i + 1}</td>
                  <td className="px-4 py-3 text-sm font-medium text-gray-800">{item.item}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">{item.quantity}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">₹{item.rate.toLocaleString()}</td>
                  <td className="px-4 py-3"><span className="text-sm font-semibold text-teal-700">₹{item.total.toLocaleString()}</span></td>
                  <td className="px-4 py-3">
                    <button onClick={() => deleteFurniture(id, item.id)}
                      className="w-7 h-7 flex items-center justify-center rounded bg-red-500 hover:bg-red-600 text-white transition-colors">
                      <Trash2 size={13} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="bg-teal-50 border-t-2 border-teal-200">
                <td colSpan={4} className="px-4 py-2.5 text-xs font-semibold text-gray-700 text-right">GRAND TOTAL</td>
                <td className="px-4 py-2.5 text-sm font-bold text-teal-700">₹{grandTotal.toLocaleString()}</td>
                <td />
              </tr>
            </tfoot>
          </table>
        </div>
      ) : (
        <div className="text-center py-10 text-sm text-gray-400 flex flex-col items-center gap-2">
          <Armchair size={28} className="text-gray-300" />
          No furniture requirements added yet.
        </div>
      )}
    </div>
  );
}
