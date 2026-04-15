'use client';

import { useStore } from '@/store';
import type { AppointedContractor } from '@/store';
import { useState, useEffect } from 'react';
import { Plus, Trash2, X, CheckCircle, HardHat } from 'lucide-react';
import { getApi } from '@/services/api';

export default function TabAppointedContractor() {
  const { selectedExhibitor, contractorsByExhibitor, setContractors, addContractor, approveContractor, deleteContractor } = useStore();
  const id = selectedExhibitor!.id;
  const companyName = selectedExhibitor!.companyName;
  const items = contractorsByExhibitor[id] || [];
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const raw = await getApi.contractorsByCompany(companyName);
        const mapped: AppointedContractor[] = raw.map((r) => ({
          id: r.id,
          exhibitorId: id,
          contractorName: r.contractor_name || '',
          company: r.company || '',
          phone: r.phone || '',
          type: r.type || '',
          status: (r.status === 'approved' || r.status === 'rejected' ? r.status : 'pending') as 'approved' | 'pending' | 'rejected',
        }));
        setContractors(id, mapped);
      } catch { /* keep existing */ }
    }
    load();
  }, [id, companyName, setContractors]);
  const [form, setForm] = useState({ contractorName: '', company: '', phone: '', type: '' });

  const handleAdd = () => {
    if (!form.contractorName) return;
    addContractor({ id: Date.now().toString(), exhibitorId: id, ...form, status: 'pending' });
    setForm({ contractorName: '', company: '', phone: '', type: '' });
    setShowForm(false);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-gray-900">Appointed Contractors</h3>
        <button onClick={() => setShowForm(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors">
          <Plus size={13} /> Add Contractor
        </button>
      </div>

      {showForm && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {[['contractorName', 'Contractor Name *', 'Full name'], ['company', 'Company', 'Company name'], ['phone', 'Phone', 'Mobile number'], ['type', 'Type', 'e.g. Construction']].map(([key, label, ph]) => (
              <div key={key}>
                <label className="block text-xs font-medium text-gray-600 mb-1">{label}</label>
                <input value={(form as Record<string, string>)[key]} onChange={(e) => setForm(f => ({ ...f, [key]: e.target.value }))}
                  placeholder={ph}
                  className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-yellow-400" />
              </div>
            ))}
          </div>
          <div className="flex gap-2">
            <button onClick={() => setShowForm(false)}
              className="px-3 py-1.5 text-xs font-medium text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-1">
              <X size={12} /> Cancel
            </button>
            <button onClick={handleAdd}
              className="px-3 py-1.5 text-xs font-medium text-white bg-yellow-600 rounded-lg hover:bg-yellow-700 transition-colors flex items-center gap-1">
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
                {['#', 'Name', 'Company', 'Phone', 'Type', 'Status', 'Action'].map(h => (
                  <th key={h} className="px-4 py-2.5 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {items.map((c, i) => (
                <tr key={c.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3 text-xs text-gray-500">{i + 1}</td>
                  <td className="px-4 py-3 text-sm font-medium text-gray-800">{c.contractorName}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">{c.company}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">{c.phone}</td>
                  <td className="px-4 py-3">
                    <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs bg-orange-100 text-orange-700 font-medium">{c.type}</span>
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
                        <button onClick={() => approveContractor(id, c.id)}
                          title="Approve"
                          className="w-7 h-7 flex items-center justify-center rounded bg-green-500 hover:bg-green-600 text-white transition-colors">
                          <CheckCircle size={13} />
                        </button>
                      )}
                      <button onClick={() => deleteContractor(id, c.id)}
                        className="w-7 h-7 flex items-center justify-center rounded bg-red-500 hover:bg-red-600 text-white transition-colors">
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="text-center py-10 text-sm text-gray-400 flex flex-col items-center gap-2">
          <HardHat size={28} className="text-gray-300" />
          No contractors appointed yet.
        </div>
      )}
    </div>
  );
}
