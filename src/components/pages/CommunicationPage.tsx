'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { getApi, communicationApi } from '@/services/api';
import type { RawEmailMaster, RawSmsMessage } from '@/services/api';
import dynamic from 'next/dynamic';
import {
  FaEdit, FaTrash, FaPlus, FaSearch, FaSpinner, FaPaperPlane, FaTimes, FaChevronDown,
} from 'react-icons/fa';
import { MdEmail, MdPower, MdChair, MdSms } from 'react-icons/md';
import { HiOutlineTemplate } from 'react-icons/hi';

// Load rich editor only on client (uses document/window APIs)
const CustomEditor = dynamic(() => import('@/components/ui/CustomEditor'), { ssr: false });

// ─── Applied-place checkboxes ─────────────────────────────────────────────────
const APPLIED_PLACES = [
  'Exhibitor Password', 'Payment Receive', 'Stall Details', 'Stall Performa',
  'Power Requirement', 'Exhibition Badges', 'Appointed Contractors',
  'Extra Furniture Requirement', 'Exhibitor Unlock Request',
  'Succesfully Unlocked Request', 'Exhibitor Power Unlock Request',
  'Succesfully Power Unlocked Request', 'Exhibitor Power Requirement',
  'Exhibitor Badges Unlock Request', 'Successfully Badges Unlocked Request',
  'Exhibitor Badges Requirement', 'Exhibitor Contractor Unlock Request',
  'Electrical Vendor Power Requirement', 'Stall Balance Payment',
  'Remark Mail', 'Contractor Badges Unlock Request', 'Contractor Badges Submit',
  'UnderTaking and Declaration Accept', 'Contractor Selection',
  'Fascia Email', 'Booth Design Approve',
];

// ─── Tabs ─────────────────────────────────────────────────────────────────────
const TABS = [
  { id: 'emails',    label: 'Emails Master',    icon: <HiOutlineTemplate size={14} /> },
  { id: 'bulk',      label: 'Send Bulk Emails', icon: <MdEmail size={14} /> },
  { id: 'sms',       label: 'SMS',              icon: <MdSms size={14} /> },
  { id: 'power',     label: 'Power Vendor',     icon: <MdPower size={14} /> },
  { id: 'furniture', label: 'Furniture Vendor', icon: <MdChair size={14} /> },
];

// ─── Types ────────────────────────────────────────────────────────────────────
interface EmailRow extends RawEmailMaster {
  applied_place: string[];
}

// ─── Email form state ─────────────────────────────────────────────────────────
const emptyForm = () => ({
  id: '',
  email_name: '',
  content: '',
  applied_place: [] as string[],
  set_from_email: '',
  attach_pdf: 'No',
  admin_copy_email: '',
});

// ─── Email Form Modal ─────────────────────────────────────────────────────────
function EmailFormModal({
  mode,
  form,
  onFormChange,
  onSave,
  onClose,
  saving,
}: {
  mode: 'add' | 'edit';
  form: ReturnType<typeof emptyForm>;
  onFormChange: (f: ReturnType<typeof emptyForm>) => void;
  onSave: () => void;
  onClose: () => void;
  saving: boolean;
}) {
  const togglePlace = (place: string) =>
    onFormChange({
      ...form,
      applied_place: form.applied_place.includes(place)
        ? form.applied_place.filter((p) => p !== place)
        : [...form.applied_place, place],
    });

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto py-8 px-4">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-5xl my-auto">
        {/* Modal header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-gray-50 rounded-t-2xl">
          <h3 className="text-sm font-semibold text-gray-900">
            {mode === 'add' ? 'Add Email Template' : 'Edit Email Template'}
          </h3>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg bg-gray-200 hover:bg-gray-300 text-gray-600 transition-colors"
          >
            <FaTimes size={13} />
          </button>
        </div>

        {/* Modal body */}
        <div className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left column */}
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Email Name *</label>
                <input
                  type="text"
                  value={form.email_name}
                  onChange={(e) => onFormChange({ ...form, email_name: e.target.value })}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-400"
                  placeholder="Template name..."
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-600 mb-2">Applied Place</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 max-h-56 overflow-y-auto border border-gray-100 rounded-lg p-3 bg-gray-50">
                  {APPLIED_PLACES.map((place) => (
                    <label key={place} className="flex items-center gap-2 cursor-pointer group">
                      <input
                        type="checkbox"
                        checked={form.applied_place.includes(place)}
                        onChange={() => togglePlace(place)}
                        className="w-3.5 h-3.5 rounded accent-blue-600"
                      />
                      <span className="text-xs text-gray-600 group-hover:text-gray-900 leading-tight">{place}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Set From Email</label>
                <input
                  type="email"
                  value={form.set_from_email}
                  onChange={(e) => onFormChange({ ...form, set_from_email: e.target.value })}
                  placeholder="sender@example.com"
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-400"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Attach PDF?</label>
                <div className="flex gap-4">
                  {['Yes', 'No'].map((v) => (
                    <label key={v} className="flex items-center gap-1.5 cursor-pointer text-sm text-gray-700">
                      <input
                        type="radio"
                        value={v}
                        checked={form.attach_pdf === v}
                        onChange={() => onFormChange({ ...form, attach_pdf: v })}
                        className="accent-blue-600"
                      />
                      {v}
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Admin Copy Email</label>
                <input
                  type="email"
                  value={form.admin_copy_email}
                  onChange={(e) => onFormChange({ ...form, admin_copy_email: e.target.value })}
                  placeholder="admin@example.com"
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-400"
                />
              </div>
            </div>

            {/* Right column — editor */}
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Email Content</label>
                <CustomEditor
                  value={form.content}
                  onChange={(html) => onFormChange({ ...form, content: html })}
                  placeholder="Write email content here..."
                />
              </div>
            </div>
          </div>
        </div>

        {/* Modal footer */}
        <div className="flex justify-end gap-2 px-6 py-4 border-t border-gray-200 bg-gray-50 rounded-b-2xl">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-100 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onSave}
            disabled={saving}
            className="px-5 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 disabled:opacity-60"
          >
            {saving && <FaSpinner size={12} className="animate-spin" />}
            {mode === 'add' ? 'Add Template' : 'Update Template'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Emails Master Tab ────────────────────────────────────────────────────────
function EmailsMasterTab() {
  const [rows, setRows]         = useState<EmailRow[]>([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState('');
  const [search, setSearch]     = useState('');
  const [form, setForm]         = useState(emptyForm());
  const [mode, setMode]         = useState<'none' | 'add' | 'edit'>('none');
  const [saving, setSaving]     = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const raw = await getApi.emailMasters();
      const mapped: EmailRow[] = (Array.isArray(raw) ? raw : []).map((r) => ({
        ...r,
        applied_place: Array.isArray(r.applied_place)
          ? r.applied_place
          : (r.applied_place || '').split(',').map((s: string) => s.trim()).filter(Boolean),
      }));
      setRows(mapped);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load email templates');
    }
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleSave = async () => {
    if (!form.email_name.trim()) return;
    setSaving(true);
    try {
      const payload = { ...form, applied_place: form.applied_place.join(',') };
      if (mode === 'add') {
        await communicationApi.addEmail(payload as Record<string, unknown>);
      } else {
        await communicationApi.updateEmail(payload as Record<string, unknown>);
      }
      setMode('none');
      setForm(emptyForm());
      await load();
    } catch { /* show nothing */ }
    setSaving(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this email template?')) return;
    try { await communicationApi.deleteEmail(id); await load(); } catch { /* ignore */ }
  };

  const handleEdit = (row: EmailRow) => {
    setForm({
      id: row.id,
      email_name: row.email_name || '',
      content: row.content || '',
      applied_place: row.applied_place,
      set_from_email: row.set_from_email || '',
      attach_pdf: row.attach_pdf || 'No',
      admin_copy_email: row.admin_copy_email || '',
    });
    setMode('edit');
  };

  const filtered = rows.filter((r) => {
    const q = search.toLowerCase();
    return (r.email_name || '').toLowerCase().includes(q) ||
      r.applied_place.join(', ').toLowerCase().includes(q);
  });

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-lg px-3 py-2 shadow-sm flex-1 max-w-sm">
          <FaSearch size={12} className="text-gray-400 shrink-0" />
          <input
            type="text"
            placeholder="Search templates..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="bg-transparent text-sm outline-none w-full placeholder-gray-400 text-gray-700"
          />
        </div>
        <button
          onClick={() => { setForm(emptyForm()); setMode('add'); }}
          className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
        >
          <FaPlus size={11} /> Add Template
        </button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-100 border-b border-gray-200">
                {['#', 'Template Name', 'Content Preview', 'Applied', 'From Email', 'PDF', 'Admin Copy', 'Action'].map(h => (
                  <th key={h} className="px-3 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr><td colSpan={8} className="px-4 py-10 text-center">
                  <div className="flex items-center justify-center gap-2 text-blue-500">
                    <FaSpinner className="animate-spin" size={16} />
                    <span className="text-sm">Loading...</span>
                  </div>
                </td></tr>
              ) : error ? (
                <tr><td colSpan={8} className="px-4 py-10 text-center">
                  <div className="inline-flex flex-col items-center gap-2">
                    <span className="text-sm text-red-500">{error}</span>
                    <button onClick={load} className="text-xs text-blue-600 underline">Retry</button>
                  </div>
                </td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={8} className="px-4 py-10 text-center text-sm text-gray-400">No email templates found.</td></tr>
              ) : filtered.map((row, i) => (
                <tr key={row.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-3 py-3 text-xs text-gray-400">{i + 1}</td>
                  <td className="px-3 py-3 text-sm font-medium text-gray-800 max-w-35">
                    <span className="block truncate">{row.email_name}</span>
                  </td>
                  <td className="px-3 py-3 max-w-45">
                    <div
                      className="text-xs text-gray-500 line-clamp-2 max-h-10 overflow-hidden"
                      dangerouslySetInnerHTML={{ __html: row.content || '' }}
                    />
                  </td>
                  <td className="px-3 py-3 max-w-40">
                    <span className="text-xs text-gray-600 line-clamp-2">{row.applied_place.join(', ')}</span>
                  </td>
                  <td className="px-3 py-3 text-xs text-gray-600">{row.set_from_email || '—'}</td>
                  <td className="px-3 py-3">
                    <span className={`inline-flex px-1.5 py-0.5 rounded text-xs font-medium ${row.attach_pdf === 'Yes' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                      {row.attach_pdf || 'No'}
                    </span>
                  </td>
                  <td className="px-3 py-3 text-xs text-gray-600 max-w-30">
                    <span className="block truncate">{row.admin_copy_email || '—'}</span>
                  </td>
                  <td className="px-3 py-3">
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleEdit(row)}
                        className="w-7 h-7 flex items-center justify-center rounded bg-green-500 hover:bg-green-600 text-white transition-colors"
                        title="Edit"
                      >
                        <FaEdit size={11} />
                      </button>
                      <button
                        onClick={() => handleDelete(row.id)}
                        className="w-7 h-7 flex items-center justify-center rounded bg-red-500 hover:bg-red-600 text-white transition-colors"
                        title="Delete"
                      >
                        <FaTrash size={11} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Modal */}
      {mode !== 'none' && (
        <EmailFormModal
          mode={mode}
          form={form}
          onFormChange={setForm}
          onSave={handleSave}
          onClose={() => { setMode('none'); setForm(emptyForm()); }}
          saving={saving}
        />
      )}
    </div>
  );
}

// ─── Send Bulk Emails Tab ─────────────────────────────────────────────────────
function BulkEmailTab() {
  const [subject, setSubject]       = useState('');
  const [body, setBody]             = useState('');
  const [recipients, setRecipients] = useState('all');
  const [sending, setSending]       = useState(false);
  const [sent, setSent]             = useState(false);

  const handleSend = async () => {
    if (!subject.trim() || !body.trim()) return;
    setSending(true);
    try {
      await communicationApi.sendBulkEmail({ subject, body, recipients } as Record<string, unknown>);
      setSent(true);
      setSubject(''); setBody('');
      setTimeout(() => setSent(false), 3000);
    } catch { /* ignore */ }
    setSending(false);
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 max-w-3xl space-y-4">
      <h3 className="text-sm font-semibold text-gray-900">Send Bulk Email</h3>

      {sent && (
        <div className="bg-green-50 border border-green-200 rounded-lg px-4 py-2.5 text-sm text-green-700 font-medium">
          Emails sent successfully!
        </div>
      )}

      <div>
        <label className="block text-xs font-medium text-gray-600 mb-1">Recipients</label>
        <select
          value={recipients}
          onChange={(e) => setRecipients(e.target.value)}
          className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-400"
        >
          <option value="all">All Exhibitors</option>
          <option value="active">Active Exhibitors</option>
          <option value="pending">Pending Exhibitors</option>
          <option value="contractors">All Contractors</option>
        </select>
      </div>

      <div>
        <label className="block text-xs font-medium text-gray-600 mb-1">Subject *</label>
        <input
          type="text"
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          placeholder="Email subject..."
          className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-400"
        />
      </div>

      <div>
        <label className="block text-xs font-medium text-gray-600 mb-1">Email Body *</label>
        <CustomEditor value={body} onChange={setBody} placeholder="Write your email content here..." />
      </div>

      <button
        onClick={handleSend}
        disabled={sending || !subject.trim() || !body.trim()}
        className="flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-60"
      >
        {sending ? <FaSpinner size={13} className="animate-spin" /> : <FaPaperPlane size={13} />}
        {sending ? 'Sending...' : 'Send Bulk Email'}
      </button>
    </div>
  );
}

// ─── SMS Tab ──────────────────────────────────────────────────────────────────
const emptySmsForm = () => ({ sms_name: '', sms_text: '', applied_place: '' });

function SmsTab() {
  const [rows, setRows]       = useState<RawSmsMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch]   = useState('');
  const [showModal, setShowModal] = useState(false);
  const [form, setForm]       = useState(emptySmsForm());
  const [saving, setSaving]   = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getApi.smsMessages();
      setRows(data);
    } catch { /* keep empty */ }
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleSave = async () => {
    if (!form.sms_name.trim() || !form.sms_text.trim()) return;
    setSaving(true);
    try {
      await communicationApi.addSms(form as Record<string, unknown>);
      setShowModal(false);
      setForm(emptySmsForm());
      await load();
    } catch { /* ignore */ }
    setSaving(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this SMS template?')) return;
    try { await communicationApi.deleteSms(id); await load(); } catch { /* ignore */ }
  };

  const filtered = rows.filter((r) => {
    const q = search.toLowerCase();
    return (r.sms_name || '').toLowerCase().includes(q) || (r.sms_text || '').toLowerCase().includes(q);
  });

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-lg px-3 py-2 shadow-sm flex-1 max-w-sm">
          <FaSearch size={12} className="text-gray-400 shrink-0" />
          <input
            type="text"
            placeholder="Search SMS templates..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="bg-transparent text-sm outline-none w-full placeholder-gray-400 text-gray-700"
          />
        </div>
        <button
          onClick={() => { setForm(emptySmsForm()); setShowModal(true); }}
          className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
        >
          <FaPlus size={11} /> Add SMS
        </button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-100 border-b border-gray-200">
                {['#', 'SMS Name', 'SMS Text', 'Applied Place', 'Action'].map(h => (
                  <th key={h} className="px-3 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr><td colSpan={5} className="px-4 py-10 text-center">
                  <div className="flex items-center justify-center gap-2 text-blue-500">
                    <FaSpinner className="animate-spin" size={16} />
                    <span className="text-sm">Loading...</span>
                  </div>
                </td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={5} className="px-4 py-10 text-center text-sm text-gray-400">No SMS templates found.</td></tr>
              ) : filtered.map((row, i) => (
                <tr key={row.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-3 py-3 text-xs text-gray-400">{i + 1}</td>
                  <td className="px-3 py-3 font-medium text-gray-800 max-w-35">
                    <span className="block truncate">{row.sms_name || '—'}</span>
                  </td>
                  <td className="px-3 py-3 text-sm text-gray-600 max-w-64">
                    <span className="block truncate">{row.sms_text || '—'}</span>
                  </td>
                  <td className="px-3 py-3 text-xs text-gray-500 max-w-40">
                    <span className="block truncate">{row.applied_place || '—'}</span>
                  </td>
                  <td className="px-3 py-3">
                    <button
                      onClick={() => handleDelete(row.id)}
                      className="w-7 h-7 flex items-center justify-center rounded bg-red-500 hover:bg-red-600 text-white transition-colors"
                      title="Delete"
                    >
                      <FaTrash size={11} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add SMS Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowModal(false)} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md">
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200">
              <h3 className="text-sm font-semibold text-gray-900">Add SMS Template</h3>
              <button onClick={() => setShowModal(false)} className="w-7 h-7 flex items-center justify-center rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-500">
                <FaTimes size={12} />
              </button>
            </div>
            <div className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">SMS Name *</label>
                <input
                  type="text"
                  value={form.sms_name}
                  onChange={(e) => setForm(f => ({ ...f, sms_name: e.target.value }))}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-400"
                  placeholder="Template name..."
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">SMS Text *</label>
                <textarea
                  value={form.sms_text}
                  onChange={(e) => setForm(f => ({ ...f, sms_text: e.target.value }))}
                  rows={4}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-400 resize-none"
                  placeholder="Write SMS content..."
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Applied Place</label>
                <input
                  type="text"
                  value={form.applied_place}
                  onChange={(e) => setForm(f => ({ ...f, applied_place: e.target.value }))}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-400"
                  placeholder="e.g. Payment Receive"
                />
              </div>
            </div>
            <div className="flex justify-end gap-2 px-5 py-4 border-t border-gray-100">
              <button onClick={() => setShowModal(false)} className="px-4 py-2 text-sm font-medium text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors">
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving || !form.sms_name.trim() || !form.sms_text.trim()}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 disabled:opacity-60"
              >
                {saving && <FaSpinner size={12} className="animate-spin" />}
                Add SMS
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Vendor table (Power & Furniture) ─────────────────────────────────────────
function VendorTab({ type }: { type: 'power' | 'furniture' }) {
  const [vendors, setVendors] = useState<Record<string, string>[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const data = type === 'power' ? await getApi.powerVendors() : await getApi.furnitureVendors();
        setVendors(data);
      } catch { /* keep empty */ }
      setLoading(false);
    }
    load();
  }, [type]);

  const keys = vendors.length > 0 ? Object.keys(vendors[0]) : [];

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
      <div className="px-4 py-3 border-b border-gray-100 bg-gray-50">
        <h3 className="text-sm font-semibold text-gray-800">
          {type === 'power' ? 'Power Vendors' : 'Furniture Vendors'}
        </h3>
      </div>
      {loading ? (
        <div className="flex items-center justify-center gap-2 text-blue-500 py-10">
          <FaSpinner className="animate-spin" size={16} />
          <span className="text-sm">Loading...</span>
        </div>
      ) : vendors.length === 0 ? (
        <div className="py-10 text-center text-sm text-gray-400">No vendors found.</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-100 border-b border-gray-200">
                <th className="px-3 py-2.5 text-left text-xs font-semibold text-gray-600 uppercase">#</th>
                {keys.map(k => (
                  <th key={k} className="px-3 py-2.5 text-left text-xs font-semibold text-gray-600 uppercase whitespace-nowrap">
                    {k.replace(/_/g, ' ')}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {vendors.map((v, i) => (
                <tr key={i} className="hover:bg-gray-50">
                  <td className="px-3 py-2.5 text-xs text-gray-400">{i + 1}</td>
                  {keys.map(k => (
                    <td key={k} className="px-3 py-2.5 text-sm text-gray-700">{v[k] || '—'}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function CommunicationPage() {
  const [activeTab, setActiveTab]     = useState('emails');
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef                   = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const activeTabInfo = TABS.find((t) => t.id === activeTab)!;

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-lg font-semibold text-gray-900">Communication</h2>
        <p className="text-sm text-gray-500">Manage email templates, bulk sending, SMS and vendor info</p>
      </div>

      {/* Tab dropdown */}
      <div className="relative w-fit" ref={dropdownRef}>
        <button
          onClick={() => setDropdownOpen((o) => !o)}
          className="flex items-center gap-3 px-4 py-2.5 bg-white border border-gray-200 rounded-xl shadow-sm text-sm font-semibold text-gray-800 hover:bg-gray-50 transition-colors min-w-52"
        >
          <span className="flex items-center gap-2 flex-1 text-blue-700">
            {activeTabInfo.icon}
            {activeTabInfo.label}
          </span>
          <FaChevronDown
            size={12}
            className={`text-gray-400 transition-transform duration-200 ${dropdownOpen ? 'rotate-180' : ''}`}
          />
        </button>

        {dropdownOpen && (
          <div className="absolute left-0 top-full mt-1.5 bg-white border border-gray-200 rounded-xl shadow-lg z-20 min-w-52 overflow-hidden">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => { setActiveTab(tab.id); setDropdownOpen(false); }}
                className={`flex items-center gap-2.5 w-full px-4 py-2.5 text-sm text-left transition-colors
                  ${activeTab === tab.id
                    ? 'bg-blue-50 text-blue-700 font-semibold'
                    : 'text-gray-700 hover:bg-gray-50 font-medium'}`}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Content */}
      {activeTab === 'emails'    && <EmailsMasterTab />}
      {activeTab === 'bulk'      && <BulkEmailTab />}
      {activeTab === 'sms'       && <SmsTab />}
      {activeTab === 'power'     && <VendorTab type="power" />}
      {activeTab === 'furniture' && <VendorTab type="furniture" />}
    </div>
  );
}
