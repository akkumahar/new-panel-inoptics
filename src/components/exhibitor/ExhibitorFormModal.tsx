'use client';

import { useStore } from '@/store';
import type { Exhibitor } from '@/store';
import { X } from 'lucide-react';
import { useState } from 'react';

interface Props {
  exhibitor: Exhibitor | null;
  onClose: () => void;
}

export default function ExhibitorFormModal({ exhibitor, onClose }: Props) {
  const { addExhibitor, updateExhibitor } = useStore();
  const isEdit = !!exhibitor;

  const [form, setForm] = useState({
    companyName: exhibitor?.companyName ?? '',
    contactName: exhibitor?.contactName ?? '',
    stallNo: exhibitor?.stallNo ?? '',
    stallArea: exhibitor?.stallArea ?? '',
    type: exhibitor?.type ?? 'S',
    email: exhibitor?.email ?? '',
    mobile: exhibitor?.mobile ?? '',
    address: exhibitor?.address ?? '',
    city: exhibitor?.city ?? '',
    state: exhibitor?.state ?? '',
    pincode: exhibitor?.pincode ?? '',
    website: exhibitor?.website ?? '',
    gst: exhibitor?.gst ?? '',
    status: exhibitor?.status ?? 'active',
  });

  const set = (key: string, value: string) => setForm((f) => ({ ...f, [key]: value }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isEdit) {
      updateExhibitor(exhibitor!.id, form as Partial<Exhibitor>);
    } else {
      addExhibitor({
        ...form,
        id: Date.now().toString(),
        type: form.type as 'B' | 'S',
        status: form.status as 'active' | 'pending' | 'inactive',
        createdAt: new Date().toISOString().split('T')[0],
      });
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto py-8 px-4">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <h3 className="text-base font-semibold text-gray-900">
            {isEdit ? 'Edit Exhibitor' : 'Add New Exhibitor'}
          </h3>
          <button onClick={onClose} className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Company Name *" required>
              <input required value={form.companyName} onChange={(e) => set('companyName', e.target.value)}
                className="input-field" placeholder="Company name" />
            </Field>
            <Field label="Contact Person">
              <input value={form.contactName} onChange={(e) => set('contactName', e.target.value)}
                className="input-field" placeholder="Contact person name" />
            </Field>
            <Field label="Email *" required>
              <input required type="email" value={form.email} onChange={(e) => set('email', e.target.value)}
                className="input-field" placeholder="email@company.com" />
            </Field>
            <Field label="Mobile *" required>
              <input required value={form.mobile} onChange={(e) => set('mobile', e.target.value)}
                className="input-field" placeholder="Mobile number" />
            </Field>
            <Field label="Stall No">
              <input value={form.stallNo} onChange={(e) => set('stallNo', e.target.value)}
                className="input-field" placeholder="e.g. A-101(S)" />
            </Field>
            <Field label="Stall Area">
              <input value={form.stallArea} onChange={(e) => set('stallArea', e.target.value)}
                className="input-field" placeholder="e.g. 18 sq mtr" />
            </Field>
            <Field label="Type (B/S)">
              <select value={form.type} onChange={(e) => set('type', e.target.value)} className="input-field">
                <option value="S">S - Seller</option>
                <option value="B">B - Buyer</option>
              </select>
            </Field>
            <Field label="Status">
              <select value={form.status} onChange={(e) => set('status', e.target.value)} className="input-field">
                <option value="active">Active</option>
                <option value="pending">Pending</option>
                <option value="inactive">Inactive</option>
              </select>
            </Field>
            <Field label="City">
              <input value={form.city} onChange={(e) => set('city', e.target.value)}
                className="input-field" placeholder="City" />
            </Field>
            <Field label="State">
              <input value={form.state} onChange={(e) => set('state', e.target.value)}
                className="input-field" placeholder="State" />
            </Field>
            <Field label="Pincode">
              <input value={form.pincode} onChange={(e) => set('pincode', e.target.value)}
                className="input-field" placeholder="Pincode" />
            </Field>
            <Field label="GST No">
              <input value={form.gst} onChange={(e) => set('gst', e.target.value)}
                className="input-field" placeholder="GST number" />
            </Field>
            <div className="sm:col-span-2">
              <Field label="Address">
                <textarea value={form.address} onChange={(e) => set('address', e.target.value)}
                  className="input-field resize-none" rows={2} placeholder="Full address" />
              </Field>
            </div>
            <Field label="Website">
              <input value={form.website} onChange={(e) => set('website', e.target.value)}
                className="input-field" placeholder="https://example.com" />
            </Field>
          </div>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose}
              className="flex-1 px-4 py-2.5 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors">
              Cancel
            </button>
            <button type="submit"
              className="flex-1 px-4 py-2.5 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors">
              {isEdit ? 'Update Exhibitor' : 'Add Exhibitor'}
            </button>
          </div>
        </form>
      </div>

      <style jsx>{`
        .input-field {
          width: 100%;
          background: #f9fafb;
          border: 1px solid #e5e7eb;
          border-radius: 8px;
          padding: 8px 12px;
          font-size: 13px;
          color: #374151;
          outline: none;
          transition: border-color 0.15s, background 0.15s;
        }
        .input-field:focus {
          border-color: #3b82f6;
          background: white;
        }
      `}</style>
    </div>
  );
}

function Field({ label, children, required }: { label: string; children: React.ReactNode; required?: boolean }) {
  return (
    <div>
      <label className="block text-xs font-medium text-gray-700 mb-1">
        {label} {required && <span className="text-red-400">*</span>}
      </label>
      {children}
    </div>
  );
}
