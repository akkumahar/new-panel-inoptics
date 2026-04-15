'use client';

import { useStore } from '@/store';
import type { Exhibitor } from '@/store';
import { useState } from 'react';
import { Edit2, Save, X } from 'lucide-react';

export default function TabBasicDetails() {
  const { selectedExhibitor, updateExhibitor } = useStore();
  const e = selectedExhibitor!;
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ ...e });

  const handleSave = () => {
    updateExhibitor(e.id, form as Partial<Exhibitor>);
    setEditing(false);
  };

  const F = (label: string, key: keyof typeof form, type = 'text') => (
    <div>
      <label className="block text-xs font-medium text-gray-500 mb-1 uppercase tracking-wide">{label}</label>
      {editing ? (
        <input
          type={type}
          value={String(form[key] ?? '')}
          onChange={(ev) => setForm((f) => ({ ...f, [key]: ev.target.value }))}
          className="w-full bg-blue-50 border border-blue-200 rounded-lg px-3 py-2 text-sm text-gray-800 outline-none focus:border-blue-400 transition-colors"
        />
      ) : (
        <p className="text-sm font-medium text-gray-800">{String(form[key] || '—')}</p>
      )}
    </div>
  );

  return (
    <div className="space-y-5">
      {/* Edit / Save buttons */}
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-gray-900">Exhibitor Basic Details</h3>
        {editing ? (
          <div className="flex gap-2">
            <button onClick={() => { setEditing(false); setForm({ ...e }); }}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors">
              <X size={13} /> Cancel
            </button>
            <button onClick={handleSave}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors">
              <Save size={13} /> Save
            </button>
          </div>
        ) : (
          <button onClick={() => setEditing(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors">
            <Edit2 size={13} /> Edit
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 p-5 bg-gray-50 rounded-xl">
        {F('Company Name', 'companyName')}
        {F('Contact Person', 'contactName')}
        {F('Email', 'email', 'email')}
        {F('Mobile', 'mobile', 'tel')}
        {F('Stall No', 'stallNo')}
        {F('Stall Area', 'stallArea')}
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1 uppercase tracking-wide">Type (B/S)</label>
          {editing ? (
            <select value={form.type}
              onChange={(ev) => setForm((f) => ({ ...f, type: ev.target.value as 'B' | 'S' }))}
              className="w-full bg-blue-50 border border-blue-200 rounded-lg px-3 py-2 text-sm text-gray-800 outline-none focus:border-blue-400">
              <option value="S">S - Seller</option>
              <option value="B">B - Buyer</option>
            </select>
          ) : (
            <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-bold
              ${form.type === 'B' ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'}`}>
              {form.type === 'B' ? 'Buyer (B)' : 'Seller (S)'}
            </span>
          )}
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1 uppercase tracking-wide">Status</label>
          {editing ? (
            <select value={form.status}
              onChange={(ev) => setForm((f) => ({ ...f, status: ev.target.value as Exhibitor['status'] }))}
              className="w-full bg-blue-50 border border-blue-200 rounded-lg px-3 py-2 text-sm text-gray-800 outline-none focus:border-blue-400">
              <option value="active">Active</option>
              <option value="pending">Pending</option>
              <option value="inactive">Inactive</option>
            </select>
          ) : (
            <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-bold
              ${form.status === 'active' ? 'bg-emerald-100 text-emerald-700' :
                form.status === 'pending' ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'}`}>
              {form.status}
            </span>
          )}
        </div>
        {F('City', 'city')}
        {F('State', 'state')}
        {F('Pincode', 'pincode')}
        {F('GST No', 'gst')}
        {F('Website', 'website')}
        {F('Address', 'address')}
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1 uppercase tracking-wide">Registered On</label>
          <p className="text-sm font-medium text-gray-800">{e.createdAt}</p>
        </div>
      </div>
    </div>
  );
}
