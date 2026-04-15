'use client';

import { useStore } from '@/store';
import type { ExhibitorPayment } from '@/store';
import { useState, useEffect } from 'react';
import { Plus, Trash2, X, CreditCard, CheckCircle, AlertCircle, XCircle } from 'lucide-react';
import { getApi } from '@/services/api';

export default function TabPaymentDetails() {
  const { selectedExhibitor, paymentsByExhibitor, setPayments, addPayment, deletePayment } = useStore();
  const id = selectedExhibitor!.id;
  const companyName = selectedExhibitor!.companyName;
  const items = paymentsByExhibitor[id] || [];
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const raw = await getApi.paymentsByCompany(companyName);
        const mapped: ExhibitorPayment[] = raw.map((r) => {
          const amount = Number(r.amount) || 0;
          const tax    = Number(r.tax) || 0;
          return {
            id: r.id,
            exhibitorId: id,
            description: r.description || '',
            amount,
            tax,
            total: Number(r.total) || amount + tax,
            method: r.payment_method || '',
            status: (r.status === 'paid' || r.status === 'failed' ? r.status : 'pending') as 'paid' | 'pending' | 'failed',
            date: r.payment_date || '',
          };
        });
        setPayments(id, mapped);
      } catch { /* keep existing */ }
    }
    load();
  }, [id, companyName, setPayments]);
  const [form, setForm] = useState({ description: '', amount: '', tax: '', method: 'NEFT', status: 'pending' });

  const totalPaid = items.filter(p => p.status === 'paid').reduce((s, p) => s + p.total, 0);
  const totalPending = items.filter(p => p.status === 'pending').reduce((s, p) => s + p.total, 0);

  const handleAdd = () => {
    if (!form.description) return;
    const amount = Number(form.amount) || 0;
    const tax = Number(form.tax) || 0;
    addPayment({
      id: Date.now().toString(),
      exhibitorId: id,
      description: form.description,
      amount,
      tax,
      total: amount + tax,
      method: form.method,
      status: form.status as 'paid' | 'pending' | 'failed',
      date: new Date().toISOString().split('T')[0],
    });
    setForm({ description: '', amount: '', tax: '', method: 'NEFT', status: 'pending' });
    setShowForm(false);
  };

  return (
    <div className="space-y-4">
      {/* Summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="bg-green-50 border border-green-200 rounded-xl p-4">
          <p className="text-xs font-medium text-green-600">Total Paid</p>
          <p className="text-xl font-bold text-green-700 mt-1">₹{totalPaid.toLocaleString()}</p>
        </div>
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
          <p className="text-xs font-medium text-yellow-600">Total Pending</p>
          <p className="text-xl font-bold text-yellow-700 mt-1">₹{totalPending.toLocaleString()}</p>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-gray-900">Payment Transactions</h3>
        <button onClick={() => setShowForm(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors">
          <Plus size={13} /> Add Payment
        </button>
      </div>

      {showForm && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            <div className="sm:col-span-2 lg:col-span-3">
              <label className="block text-xs font-medium text-gray-600 mb-1">Description *</label>
              <input value={form.description} onChange={(e) => setForm(f => ({ ...f, description: e.target.value }))}
                placeholder="e.g. Stall Booking Fee"
                className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-400" />
            </div>
            {[['amount', 'Amount (₹)', '0'], ['tax', 'Tax (₹)', '0']].map(([key, label, ph]) => (
              <div key={key}>
                <label className="block text-xs font-medium text-gray-600 mb-1">{label}</label>
                <input type="number" min="0" value={(form as Record<string, string>)[key]}
                  onChange={(e) => setForm(f => ({ ...f, [key]: e.target.value }))}
                  placeholder={ph}
                  className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-400" />
              </div>
            ))}
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Payment Method</label>
              <select value={form.method} onChange={(e) => setForm(f => ({ ...f, method: e.target.value }))}
                className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none">
                {['NEFT', 'RTGS', 'Cheque', 'DD', 'Cash', 'UPI', 'Online'].map(m => <option key={m}>{m}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Status</label>
              <select value={form.status} onChange={(e) => setForm(f => ({ ...f, status: e.target.value }))}
                className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none">
                <option value="paid">Paid</option>
                <option value="pending">Pending</option>
                <option value="failed">Failed</option>
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

      {items.length > 0 ? (
        <div className="overflow-x-auto rounded-xl border border-gray-200">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                {['#', 'Description', 'Amount', 'Tax', 'Total', 'Method', 'Date', 'Status', 'Action'].map(h => (
                  <th key={h} className="px-3 py-2.5 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {items.map((p, i) => (
                <tr key={p.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-3 py-3 text-xs text-gray-500">{i + 1}</td>
                  <td className="px-3 py-3 text-sm font-medium text-gray-800 max-w-40 truncate">{p.description}</td>
                  <td className="px-3 py-3 text-sm text-gray-600 whitespace-nowrap">₹{p.amount.toLocaleString()}</td>
                  <td className="px-3 py-3 text-sm text-gray-600 whitespace-nowrap">₹{p.tax.toLocaleString()}</td>
                  <td className="px-3 py-3 whitespace-nowrap"><span className="text-sm font-semibold text-gray-900">₹{p.total.toLocaleString()}</span></td>
                  <td className="px-3 py-3 text-sm text-gray-600 whitespace-nowrap">{p.method}</td>
                  <td className="px-3 py-3 text-xs text-gray-500 whitespace-nowrap">{p.date}</td>
                  <td className="px-3 py-3">
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold
                      ${p.status === 'paid' ? 'bg-green-100 text-green-700' :
                        p.status === 'pending' ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'}`}>
                      {p.status === 'paid' ? <CheckCircle size={10} /> : p.status === 'pending' ? <AlertCircle size={10} /> : <XCircle size={10} />}
                      {p.status}
                    </span>
                  </td>
                  <td className="px-3 py-3">
                    <button onClick={() => deletePayment(id, p.id)}
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
        <div className="text-center py-10 text-sm text-gray-400 flex flex-col items-center gap-2">
          <CreditCard size={28} className="text-gray-300" />
          No payment records found.
        </div>
      )}
    </div>
  );
}
