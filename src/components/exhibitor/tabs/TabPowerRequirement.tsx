'use client';

import { useStore } from '@/store';
import { useState } from 'react';
import { Plus, Trash2, X, Zap } from 'lucide-react';

export default function TabPowerRequirement() {
  const { selectedExhibitor, powerByExhibitor, addPower, deletePower } = useStore();
  const id = selectedExhibitor!.id;
  const items = powerByExhibitor[id] || [];
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ component: '', quantity: '', wattage: '' });

  const totalLoad = items.reduce((s, i) => s + i.totalLoad, 0);

  const handleAdd = () => {
    if (!form.component) return;
    const qty = Number(form.quantity) || 1;
    const watt = Number(form.wattage) || 0;
    addPower({ id: Date.now().toString(), exhibitorId: id, component: form.component, quantity: qty, wattage: watt, totalLoad: qty * watt });
    setForm({ component: '', quantity: '', wattage: '' });
    setShowForm(false);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold text-gray-900">Power Requirements</h3>
          {items.length > 0 && (
            <p className="text-xs text-gray-500 mt-0.5">Total Load: <span className="font-semibold text-orange-600">{totalLoad} W</span></p>
          )}
        </div>
        <button onClick={() => setShowForm(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors">
          <Plus size={13} /> Add Item
        </button>
      </div>

      {showForm && (
        <div className="bg-orange-50 border border-orange-200 rounded-xl p-4 space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-1">
              <label className="block text-xs font-medium text-gray-600 mb-1">Component Name *</label>
              <input value={form.component} onChange={(e) => setForm(f => ({ ...f, component: e.target.value }))}
                placeholder="e.g. LED Spotlight 50W"
                className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-orange-400" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Quantity</label>
              <input type="number" min="1" value={form.quantity} onChange={(e) => setForm(f => ({ ...f, quantity: e.target.value }))}
                placeholder="1"
                className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-orange-400" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Wattage (W)</label>
              <input type="number" min="0" value={form.wattage} onChange={(e) => setForm(f => ({ ...f, wattage: e.target.value }))}
                placeholder="50"
                className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-orange-400" />
            </div>
          </div>
          <div className="flex gap-2">
            <button onClick={() => setShowForm(false)}
              className="px-3 py-1.5 text-xs font-medium text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-1">
              <X size={12} /> Cancel
            </button>
            <button onClick={handleAdd}
              className="px-3 py-1.5 text-xs font-medium text-white bg-orange-500 rounded-lg hover:bg-orange-600 transition-colors flex items-center gap-1">
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
                {['#', 'Component', 'Qty', 'Wattage (W)', 'Total Load (W)', 'Action'].map(h => (
                  <th key={h} className="px-4 py-2.5 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {items.map((item, i) => (
                <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3 text-xs text-gray-500">{i + 1}</td>
                  <td className="px-4 py-3 text-sm font-medium text-gray-800">{item.component}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">{item.quantity}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">{item.wattage}</td>
                  <td className="px-4 py-3">
                    <span className="text-sm font-semibold text-orange-600">{item.totalLoad} W</span>
                  </td>
                  <td className="px-4 py-3">
                    <button onClick={() => deletePower(id, item.id)}
                      className="w-7 h-7 flex items-center justify-center rounded bg-red-500 hover:bg-red-600 text-white transition-colors">
                      <Trash2 size={13} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="bg-orange-50 border-t-2 border-orange-200">
                <td colSpan={4} className="px-4 py-2.5 text-xs font-semibold text-gray-700 text-right">TOTAL LOAD</td>
                <td className="px-4 py-2.5 text-sm font-bold text-orange-700">{totalLoad} W</td>
                <td />
              </tr>
            </tfoot>
          </table>
        </div>
      ) : (
        <div className="text-center py-10 text-sm text-gray-400 flex flex-col items-center gap-2">
          <Zap size={28} className="text-gray-300" />
          No power requirements added yet.
        </div>
      )}
    </div>
  );
}
