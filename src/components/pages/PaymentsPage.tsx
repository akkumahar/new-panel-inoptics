'use client';

import { useState, useEffect, useCallback } from 'react';
import { getApi, paymentApi, powerApi, badgeApi } from '@/services/api';
import type {
  RawPaymentSummary,
  RawStallCalculation,
  RawPowerPaymentDetails,
  RawBadgePaymentDetails,
  RawPaymentRecord,
  RawStallDetail,
} from '@/services/api';
import { FaEye, FaTimes, FaSpinner, FaSearch, FaPlus, FaTrash, FaEnvelope } from 'react-icons/fa';
import { MdPayment, MdPendingActions } from 'react-icons/md';
import { BsCashCoin, BsLightningChargeFill } from 'react-icons/bs';
import { RiMedalLine } from 'react-icons/ri';
import { HiOutlineOfficeBuilding } from 'react-icons/hi';
import { TbReceiptTax } from 'react-icons/tb';

// ─── helpers ─────────────────────────────────────────────────────────────────
const n = (v: number | string | undefined) => Math.round(Number(v) || 0);

// ─── Types ────────────────────────────────────────────────────────────────────
interface PaymentRow extends RawPaymentSummary {
  total: number;
  received: number;
  pending: number;
}

type PayType = 'stall' | 'power' | 'badge';

interface AddPayForm {
  type: PayType;
  amount_paid: string;
  tds: string;
  payment_date: string;
  exhibitor_bank: string;
  receiver_bank: string;
  payment_type: string;
}

const emptyPayForm = (type: PayType): AddPayForm => ({
  type,
  amount_paid: '',
  tds: '0',
  payment_date: new Date().toISOString().split('T')[0],
  exhibitor_bank: '',
  receiver_bank: '',
  payment_type: 'NEFT',
});

// ─── Sub-components ──────────────────────────────────────────────────────────
function BillingRow({ label, value, bold }: { label: string; value: string | number; bold?: boolean }) {
  return (
    <div className={`flex justify-between items-center py-1 text-sm ${bold ? 'font-semibold text-gray-900 border-t border-gray-200 pt-2 mt-1' : 'text-gray-600'}`}>
      <span>{label}</span>
      <span className={bold ? 'text-blue-700' : ''}>{value}</span>
    </div>
  );
}

function PaymentBlock({
  payments,
  label,
  onDelete,
}: {
  payments: RawPaymentRecord[];
  label: string;
  onDelete?: (id: string) => void;
}) {
  if (!payments || payments.length === 0) return null;
  return (
    <>
      {payments.map((p, i) => (
        <div key={p.id ?? i} className="mt-2 space-y-0.5 bg-gray-50 rounded-lg p-1.5 relative">
          {onDelete && p.id && (
            <button
              onClick={() => onDelete(p.id!)}
              className="absolute top-1 right-1 w-5 h-5 flex items-center justify-center rounded bg-red-100 hover:bg-red-200 text-red-500 transition-colors"
              title="Delete payment"
            >
              <FaTrash size={9} />
            </button>
          )}
          <div className="flex justify-between text-xs text-gray-600 pr-6">
            <span>{label} {i + 1}:</span>
            <span>{Number(p.amount_paid || 0).toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-xs text-gray-500">
            <span>TDS {i + 1}:</span>
            <span>{Number(p.tds || 0).toFixed(2)}</span>
          </div>
          {p.payment_date && (
            <div className="text-xs text-gray-400">{p.payment_date}</div>
          )}
        </div>
      ))}
    </>
  );
}

// ─── Add Payment Modal ───────────────────────────────────────────────────────
function AddPaymentModal({
  form,
  onChange,
  onSubmit,
  onClose,
  submitting,
}: {
  form: AddPayForm;
  onChange: (f: AddPayForm) => void;
  onSubmit: () => void;
  onClose: () => void;
  submitting: boolean;
}) {
  const label = form.type === 'stall' ? 'Stall' : form.type === 'power' ? 'Power' : 'Badge';
  return (
    <div className="fixed inset-0 z-60 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-semibold text-gray-900">Add {label} Payment</h4>
          <button onClick={onClose} className="w-7 h-7 flex items-center justify-center rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-500">
            <FaTimes size={12} />
          </button>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Amount Paid *</label>
            <input
              type="number"
              min="0"
              value={form.amount_paid}
              onChange={(e) => onChange({ ...form, amount_paid: e.target.value })}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-400"
              placeholder="0"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">TDS</label>
            <input
              type="number"
              min="0"
              value={form.tds}
              onChange={(e) => onChange({ ...form, tds: e.target.value })}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-400"
              placeholder="0"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Payment Date</label>
            <input
              type="date"
              value={form.payment_date}
              onChange={(e) => onChange({ ...form, payment_date: e.target.value })}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-400"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Payment Type</label>
            <select
              value={form.payment_type}
              onChange={(e) => onChange({ ...form, payment_type: e.target.value })}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-400"
            >
              {['NEFT', 'RTGS', 'Cheque', 'Cash', 'Online', 'IMPS', 'UPI'].map(t => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Exhibitor Bank</label>
            <input
              type="text"
              value={form.exhibitor_bank}
              onChange={(e) => onChange({ ...form, exhibitor_bank: e.target.value })}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-400"
              placeholder="Bank name..."
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Receiver Bank</label>
            <input
              type="text"
              value={form.receiver_bank}
              onChange={(e) => onChange({ ...form, receiver_bank: e.target.value })}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-400"
              placeholder="Bank name..."
            />
          </div>
        </div>

        <div className="flex gap-2 pt-1">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 text-sm font-medium text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onSubmit}
            disabled={submitting || !form.amount_paid}
            className="flex-1 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-60"
          >
            {submitting && <FaSpinner size={12} className="animate-spin" />}
            Add Payment
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Detail Overlay ──────────────────────────────────────────────────────────
function PaymentDetailOverlay({
  companyName,
  onClose,
  onPaymentChanged,
}: {
  companyName: string;
  onClose: () => void;
  onPaymentChanged?: () => void;
}) {
  const [loading, setLoading]       = useState(true);
  const [stallCalc, setStallCalc]   = useState<RawStallCalculation | null>(null);
  const [stallDetails, setStallDetails] = useState<RawStallDetail[]>([]);
  const [stallPayments, setStallPayments] = useState<RawPaymentRecord[]>([]);
  const [powerDetails, setPowerDetails]   = useState<RawPowerPaymentDetails | null>(null);
  const [badgeDetails, setBadgeDetails]   = useState<RawBadgePaymentDetails | null>(null);
  const [addPayForm, setAddPayForm]   = useState<AddPayForm | null>(null);
  const [submitting, setSubmitting]   = useState(false);
  const [sendingMail, setSendingMail] = useState(false);
  const [mailSent, setMailSent]       = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [sc, sd, sp, pd, bd] = await Promise.allSettled([
        getApi.stallCalculation(companyName),
        getApi.stallDetails(companyName),
        getApi.stallPayments(companyName),
        getApi.powerPaymentDetails(companyName),
        getApi.badgePaymentDetails(companyName),
      ]);
      if (sc.status === 'fulfilled') setStallCalc(sc.value);
      if (sd.status === 'fulfilled') setStallDetails(sd.value);
      if (sp.status === 'fulfilled') setStallPayments(sp.value);
      if (pd.status === 'fulfilled') setPowerDetails(pd.value);
      if (bd.status === 'fulfilled') setBadgeDetails(bd.value);
    } finally {
      setLoading(false);
    }
  }, [companyName]);

  useEffect(() => { load(); }, [load]);

  // ─── Add payment ──────────────────────────────────────────────────────────
  const handleAddPayment = async () => {
    if (!addPayForm || !addPayForm.amount_paid) return;
    setSubmitting(true);
    try {
      const payload = {
        company_name: companyName,
        amount_paid: addPayForm.amount_paid,
        tds: addPayForm.tds,
        payment_date: addPayForm.payment_date,
        exhibitor_bank: addPayForm.exhibitor_bank,
        receiver_bank: addPayForm.receiver_bank,
        payment_type: addPayForm.payment_type,
      };
      if (addPayForm.type === 'stall') await paymentApi.addStallPayment(payload);
      else if (addPayForm.type === 'power') await powerApi.addPayment(payload);
      else await badgeApi.addPayment(payload);
      setAddPayForm(null);
      await load();
      onPaymentChanged?.();
    } catch (err) {
      console.error('Failed to add payment:', err);
    } finally {
      setSubmitting(false);
    }
  };

  // ─── Delete payment ───────────────────────────────────────────────────────
  const handleDeletePayment = async (type: PayType, id: string) => {
    if (!confirm('Delete this payment record?')) return;
    try {
      if (type === 'stall') await paymentApi.deleteStallPayment(id);
      else if (type === 'power') await powerApi.deletePayment(id);
      else await badgeApi.deletePayment(id);
      await load();
      onPaymentChanged?.();
    } catch (err) {
      console.error('Failed to delete payment:', err);
    }
  };

  // ─── Send mail ────────────────────────────────────────────────────────────
  const handleSendMail = async () => {
    setSendingMail(true);
    try {
      await paymentApi.sendPaymentMail({ company_name: companyName });
      setMailSent(true);
      setTimeout(() => setMailSent(false), 3000);
    } catch (err) {
      console.error('Failed to send mail:', err);
    } finally {
      setSendingMail(false);
    }
  };

  const isIGST = n(stallCalc?.sgst_9_percent) === 0 && n(stallCalc?.cgst_9_percent) === 0;
  const stallTotalPaid = stallPayments.reduce((s, p) => s + Number(p.amount_paid || 0), 0);
  const paymentAfterTDS = stallPayments.reduce((s, p) => s + Number(p.amount_paid || 0) + Number(p.tds || 0), 0);
  const calculatedPending = n(stallCalc?.grand_total) - paymentAfterTDS;

  // Power calcs
  const powerSetup     = n(powerDetails?.setup_days);
  const powerExhibition = n(powerDetails?.exhibition_days);
  const powerTotal     = powerSetup + powerExhibition;
  const powerSgst      = isIGST ? 0 : (powerTotal * 9) / 100;
  const powerCgst      = isIGST ? 0 : (powerTotal * 9) / 100;
  const powerIgst      = isIGST ? (powerTotal * 18) / 100 : 0;
  const powerGrandTotal = powerTotal + powerSgst + powerCgst + powerIgst;
  const powerTotalPaid  = (powerDetails?.power_payments || []).reduce((s, p) => s + Number(p.amount_paid || 0), 0);
  const powerPending    = powerGrandTotal - powerTotalPaid;

  // Badge calcs
  const extraBadges   = n(badgeDetails?.extra_badges);
  const badgeTotal    = extraBadges * 100;
  const badgeSgst     = isIGST ? 0 : (badgeTotal * 9) / 100;
  const badgeCgst     = isIGST ? 0 : (badgeTotal * 9) / 100;
  const badgeIgst     = isIGST ? (badgeTotal * 18) / 100 : 0;
  const badgeGrandTotal = badgeTotal + badgeSgst + badgeCgst + badgeIgst;
  const badgeTotalPaid  = (badgeDetails?.badge_payments || []).reduce((s, p) => s + Number(p.amount_paid || 0), 0);
  const badgePending    = badgeGrandTotal - badgeTotalPaid;

  // All payments for summary table
  const allPayments = [
    ...stallPayments.map(p => ({ ...p, _type: 'stall' as PayType })),
    ...(powerDetails?.power_payments || []).map(p => ({ ...p, _type: 'power' as PayType })),
    ...(badgeDetails?.badge_payments || []).map(p => ({ ...p, _type: 'badge' as PayType })),
  ];

  return (
    <>
      <div className="fixed inset-0 z-50 flex">
        {/* Backdrop */}
        <div className="absolute inset-0 bg-black/50" onClick={onClose} />

        {/* Panel */}
        <div className="relative ml-auto w-full max-w-4xl bg-white h-full flex flex-col shadow-2xl overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200 bg-gray-50 shrink-0">
            <div>
              <h3 className="text-sm font-bold text-gray-900">Payment Details</h3>
              <p className="text-xs text-blue-600 font-medium mt-0.5">{companyName}</p>
            </div>
            <div className="flex items-center gap-2">
              {mailSent && (
                <span className="text-xs text-green-600 font-medium bg-green-50 px-2 py-1 rounded-lg">Mail Sent!</span>
              )}
              <button
                onClick={handleSendMail}
                disabled={sendingMail}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-60"
              >
                {sendingMail ? <FaSpinner size={11} className="animate-spin" /> : <FaEnvelope size={11} />}
                Send Mail
              </button>
              <button
                onClick={onClose}
                className="w-8 h-8 flex items-center justify-center rounded-lg bg-gray-200 hover:bg-gray-300 text-gray-600 transition-colors"
              >
                <FaTimes size={14} />
              </button>
            </div>
          </div>

          {loading ? (
            <div className="flex-1 flex items-center justify-center">
              <FaSpinner size={28} className="text-blue-500 animate-spin" />
            </div>
          ) : (
            <div className="flex-1 overflow-y-auto p-5 space-y-5">
              {/* Stall info */}
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-3">
                  <HiOutlineOfficeBuilding size={16} className="text-blue-600" />
                  <h4 className="text-sm font-semibold text-blue-800">Company Details</h4>
                </div>
                {stallDetails.length === 0 ? (
                  <p className="text-xs text-gray-400">No stall details found.</p>
                ) : stallDetails.length === 1 ? (
                  <div className="grid grid-cols-3 gap-3 text-xs">
                    <div><span className="text-gray-500">Stall No</span><p className="font-semibold text-gray-800 mt-0.5">{stallDetails[0].stall_number}</p></div>
                    <div><span className="text-gray-500">Category</span><p className="font-semibold text-gray-800 mt-0.5">{stallDetails[0].stall_category}</p></div>
                    <div><span className="text-gray-500">Area</span><p className="font-semibold text-gray-800 mt-0.5">{n(stallDetails[0].stall_area)} sq mtrs</p></div>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs">
                      <thead>
                        <tr className="border-b border-blue-200">
                          {['Stall No', 'Category', 'Area'].map(h => (
                            <th key={h} className="py-1.5 pr-4 text-left font-semibold text-blue-700">{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {stallDetails.map((s, i) => (
                          <tr key={i} className="border-b border-blue-100">
                            <td className="py-1.5 pr-4 text-gray-800 font-medium">{s.stall_number}</td>
                            <td className="py-1.5 pr-4 text-gray-600">{s.stall_category}</td>
                            <td className="py-1.5 text-gray-600">{n(s.stall_area)} sq mtrs</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              {/* Three billing cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Stall Charges */}
                <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <BsCashCoin size={15} className="text-green-600" />
                      <h4 className="text-sm font-semibold text-gray-800">Stall Charges</h4>
                    </div>
                    <button
                      onClick={() => setAddPayForm(emptyPayForm('stall'))}
                      className="flex items-center gap-1 px-2 py-1 text-xs font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 transition-colors"
                    >
                      <FaPlus size={9} /> Add
                    </button>
                  </div>
                  {!stallCalc ? (
                    <p className="text-xs text-gray-400">No stall data found.</p>
                  ) : (
                    <div className="text-sm space-y-0.5">
                      <BillingRow label="Total:" value={n(stallCalc.total)} />
                      {n(stallCalc.discounted_amount) > 0 && (
                        <>
                          <BillingRow label={`Discount (${n(stallCalc.discount_percent)}%):`} value={n(stallCalc.discounted_amount)} />
                          <BillingRow label="After Discount:" value={n(Number(stallCalc.total) - Number(stallCalc.discounted_amount))} />
                        </>
                      )}
                      {isIGST
                        ? <BillingRow label="IGST (18%):" value={n(stallCalc.igst_18_percent)} />
                        : <>
                            <BillingRow label="SGST (9%):" value={n(stallCalc.sgst_9_percent)} />
                            <BillingRow label="CGST (9%):" value={n(stallCalc.cgst_9_percent)} />
                          </>
                      }
                      <BillingRow bold label="Grand Total:" value={n(stallCalc.grand_total)} />
                      <PaymentBlock
                        payments={stallPayments}
                        label="Payment"
                        onDelete={(id) => handleDeletePayment('stall', id)}
                      />
                      {stallPayments.length > 0 && (
                        <div className="border-t border-gray-200 pt-1 mt-1">
                          <BillingRow bold label="After TDS:" value={paymentAfterTDS.toFixed(2)} />
                          <div className={`flex justify-between text-sm font-semibold pt-1 ${calculatedPending > 0 ? 'text-red-600' : 'text-green-600'}`}>
                            <span>{calculatedPending > 0 ? 'Pending:' : 'Cleared:'}</span>
                            <span>{calculatedPending > 0 ? n(calculatedPending) : 0}</span>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Power Charges */}
                <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <BsLightningChargeFill size={15} className="text-orange-500" />
                      <h4 className="text-sm font-semibold text-gray-800">Power Charges</h4>
                    </div>
                    <button
                      onClick={() => setAddPayForm(emptyPayForm('power'))}
                      className="flex items-center gap-1 px-2 py-1 text-xs font-medium text-white bg-orange-500 rounded-lg hover:bg-orange-600 transition-colors"
                    >
                      <FaPlus size={9} /> Add
                    </button>
                  </div>
                  {!powerDetails || (!powerDetails.setup_days && !powerDetails.exhibition_days) ? (
                    <p className="text-xs text-gray-400">No power data found.</p>
                  ) : (
                    <div className="text-sm space-y-0.5">
                      <BillingRow label="Setup Days:" value={n(powerSetup)} />
                      <BillingRow label="Exhibition Days:" value={n(powerExhibition)} />
                      <BillingRow label="Total:" value={n(powerTotal)} />
                      {isIGST
                        ? <BillingRow label="IGST (18%):" value={n(powerIgst)} />
                        : <>
                            <BillingRow label="SGST (9%):" value={n(powerSgst)} />
                            <BillingRow label="CGST (9%):" value={n(powerCgst)} />
                          </>
                      }
                      <BillingRow bold label="Grand Total:" value={n(powerGrandTotal)} />
                      <PaymentBlock
                        payments={powerDetails.power_payments || []}
                        label="Payment"
                        onDelete={(id) => handleDeletePayment('power', id)}
                      />
                      {(powerDetails.power_payments?.length ?? 0) > 0 && (
                        <div className={`flex justify-between text-sm font-semibold pt-1 border-t border-gray-200 mt-1 ${powerPending > 0 ? 'text-red-600' : 'text-green-600'}`}>
                          <span>{powerPending > 0 ? 'Pending:' : 'Cleared:'}</span>
                          <span>{powerPending > 0 ? n(powerPending) : 0}</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Exhibitor Badges */}
                <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <RiMedalLine size={16} className="text-purple-600" />
                      <h4 className="text-sm font-semibold text-gray-800">Exhibitor Badges</h4>
                    </div>
                    <button
                      onClick={() => setAddPayForm(emptyPayForm('badge'))}
                      className="flex items-center gap-1 px-2 py-1 text-xs font-medium text-white bg-purple-600 rounded-lg hover:bg-purple-700 transition-colors"
                    >
                      <FaPlus size={9} /> Add
                    </button>
                  </div>
                  {!badgeDetails || extraBadges === 0 ? (
                    <p className="text-xs text-gray-400">No badge data found.</p>
                  ) : (
                    <div className="text-sm space-y-0.5">
                      <BillingRow label="Extra Badges:" value={extraBadges} />
                      <BillingRow label="Price / Badge:" value="₹100" />
                      <BillingRow label="Total:" value={n(badgeTotal)} />
                      {isIGST
                        ? <BillingRow label="IGST (18%):" value={n(badgeIgst)} />
                        : <>
                            <BillingRow label="SGST (9%):" value={n(badgeSgst)} />
                            <BillingRow label="CGST (9%):" value={n(badgeCgst)} />
                          </>
                      }
                      <BillingRow bold label="Grand Total:" value={n(badgeGrandTotal)} />
                      <PaymentBlock
                        payments={badgeDetails.badge_payments || []}
                        label="Payment"
                        onDelete={(id) => handleDeletePayment('badge', id)}
                      />
                      {(badgeDetails.badge_payments?.length ?? 0) > 0 && (
                        <div className={`flex justify-between text-sm font-semibold pt-1 border-t border-gray-200 mt-1 ${badgePending > 0 ? 'text-red-600' : 'text-green-600'}`}>
                          <span>{badgePending > 0 ? 'Pending:' : 'Cleared:'}</span>
                          <span>{badgePending > 0 ? n(badgePending) : 0}</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Payment Summary Table */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <TbReceiptTax size={16} className="text-gray-600" />
                  <h4 className="text-sm font-semibold text-gray-900">Payment Summary</h4>
                </div>
                <div className="overflow-x-auto rounded-xl border border-gray-200">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="bg-gray-50 border-b border-gray-200">
                        {['Particulars', 'Received', 'TDS', 'Date', 'Exhibitor Bank', 'Receiver Bank', 'Type', 'Action'].map(h => (
                          <th key={h} className="px-3 py-2.5 text-left font-semibold text-gray-600 uppercase tracking-wider whitespace-nowrap">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {allPayments.length === 0 ? (
                        <tr>
                          <td colSpan={8} className="px-3 py-8 text-center text-gray-400">
                            No payment records found.
                          </td>
                        </tr>
                      ) : (
                        allPayments.map((p, i) => {
                          const colorMap = {
                            stall: 'text-gray-800',
                            power: 'text-orange-700',
                            badge: 'text-purple-700',
                          };
                          const labelMap = {
                            stall: 'Stall',
                            power: 'Power',
                            badge: 'Badge',
                          };
                          const idx = allPayments.slice(0, i).filter(x => x._type === p._type).length + 1;
                          return (
                            <tr key={`${p._type}-${p.id ?? i}`} className="hover:bg-gray-50">
                              <td className={`px-3 py-2.5 font-semibold ${colorMap[p._type]}`}>
                                {labelMap[p._type]} Payment {idx}
                              </td>
                              <td className="px-3 py-2.5">{Number(p.amount_paid || 0).toFixed(2)}</td>
                              <td className="px-3 py-2.5 text-gray-500">{Number(p.tds || 0).toFixed(2)}</td>
                              <td className="px-3 py-2.5 text-gray-500">{p.payment_date || '—'}</td>
                              <td className="px-3 py-2.5 text-gray-500">{p.exhibitor_bank || '—'}</td>
                              <td className="px-3 py-2.5 text-gray-500">{p.receiver_bank || '—'}</td>
                              <td className="px-3 py-2.5 text-gray-500">{p.payment_type || '—'}</td>
                              <td className="px-3 py-2.5">
                                {p.id && (
                                  <button
                                    onClick={() => handleDeletePayment(p._type, p.id!)}
                                    className="w-6 h-6 flex items-center justify-center rounded bg-red-100 hover:bg-red-200 text-red-500 transition-colors"
                                    title="Delete"
                                  >
                                    <FaTrash size={9} />
                                  </button>
                                )}
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Add Payment Modal */}
      {addPayForm && (
        <AddPaymentModal
          form={addPayForm}
          onChange={setAddPayForm}
          onSubmit={handleAddPayment}
          onClose={() => setAddPayForm(null)}
          submitting={submitting}
        />
      )}
    </>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function PaymentsPage() {
  const [rows, setRows]               = useState<PaymentRow[]>([]);
  const [loading, setLoading]         = useState(true);
  const [search, setSearch]           = useState('');
  const [selectedCompany, setSelectedCompany] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const raw = await getApi.paymentsSummary();
      const mapped: PaymentRow[] = raw.map((item) => {
        const total    = n(item.total) || (n(item.stall_total) + n(item.power_total) + n(item.badges_total));
        const stallPaid = n(item.paid_exhibitor);
        const powerPaid = n(item.paid_power);
        const badgePaid = n(item.paid_badge);
        const stallTds  = n(item.stall_tds_total);
        const powerTds  = n(item.power_tds_total);
        const badgeTds  = n(item.badge_tds_total);
        const received  = stallPaid + stallTds + powerPaid + powerTds + badgePaid + badgeTds;
        const pending   = n(item.pending) || Math.max(0, total - received);

        return { ...item, total, received, pending };
      });
      setRows(mapped);
    } catch (err) {
      console.error('Failed to load payment summary:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const filtered = rows.filter((r) =>
    r.company_name.toLowerCase().includes(search.toLowerCase())
  );

  // Grand totals
  const grandTotal    = rows.reduce((s, r) => s + r.total, 0);
  const grandReceived = rows.reduce((s, r) => s + r.received, 0);
  const grandPending  = rows.reduce((s, r) => s + r.pending, 0);

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Payments</h2>
          <p className="text-sm text-gray-500">All exhibitor payment records</p>
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm flex items-center gap-4">
          <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center shrink-0">
            <MdPayment size={20} className="text-blue-600" />
          </div>
          <div>
            <p className="text-xs text-gray-500 font-medium">Grand Total</p>
            <p className="text-xl font-bold text-gray-900">₹{grandTotal.toLocaleString()}</p>
          </div>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm flex items-center gap-4">
          <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center shrink-0">
            <BsCashCoin size={18} className="text-green-600" />
          </div>
          <div>
            <p className="text-xs text-gray-500 font-medium">Total Received</p>
            <p className="text-xl font-bold text-green-700">₹{grandReceived.toLocaleString()}</p>
          </div>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm flex items-center gap-4">
          <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center shrink-0">
            <MdPendingActions size={20} className="text-red-500" />
          </div>
          <div>
            <p className="text-xs text-gray-500 font-medium">Total Pending</p>
            <p className="text-xl font-bold text-red-600">₹{grandPending.toLocaleString()}</p>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm px-4 py-2.5 flex items-center gap-2">
        <FaSearch size={13} className="text-gray-400 shrink-0" />
        <input
          type="text"
          placeholder="Search by company name..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 text-sm text-gray-700 outline-none bg-transparent placeholder-gray-400"
        />
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="bg-gray-100 border-b border-gray-200">
                <th className="px-3 py-3 text-left font-semibold text-gray-600 uppercase tracking-wider">ID</th>
                <th className="px-3 py-3 text-left font-semibold text-gray-600 uppercase tracking-wider whitespace-nowrap">Company Name</th>
                <th className="px-3 py-3 text-right font-semibold text-gray-600 uppercase tracking-wider">Stall</th>
                <th className="px-3 py-3 text-right font-semibold text-gray-600 uppercase tracking-wider">Power</th>
                <th className="px-3 py-3 text-right font-semibold text-gray-600 uppercase tracking-wider whitespace-nowrap">Ex Badge</th>
                <th className="px-3 py-3 text-right font-semibold text-gray-600 uppercase tracking-wider whitespace-nowrap">Stall Received</th>
                <th className="px-3 py-3 text-right font-semibold text-gray-600 uppercase tracking-wider">TDS</th>
                <th className="px-3 py-3 text-right font-semibold text-gray-600 uppercase tracking-wider whitespace-nowrap">Power Received</th>
                <th className="px-3 py-3 text-right font-semibold text-gray-600 uppercase tracking-wider">TDS</th>
                <th className="px-3 py-3 text-right font-semibold text-gray-600 uppercase tracking-wider whitespace-nowrap">Badge Received</th>
                <th className="px-3 py-3 text-right font-semibold text-gray-600 uppercase tracking-wider">TDS</th>
                <th className="px-3 py-3 text-right font-semibold text-gray-600 uppercase tracking-wider">Total</th>
                <th className="px-3 py-3 text-right font-semibold text-gray-600 uppercase tracking-wider whitespace-nowrap">Received</th>
                <th className="px-3 py-3 text-right font-semibold text-gray-600 uppercase tracking-wider">Pending</th>
                <th className="px-3 py-3 text-center font-semibold text-gray-600 uppercase tracking-wider">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan={15} className="px-4 py-10 text-center">
                    <div className="flex items-center justify-center gap-2 text-blue-500">
                      <FaSpinner className="animate-spin" size={18} />
                      <span className="text-sm">Loading payments...</span>
                    </div>
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={15} className="px-4 py-10 text-center text-sm text-gray-400">
                    No data found.
                  </td>
                </tr>
              ) : (
                filtered.map((item, i) => (
                  <tr key={item.company_name} className="hover:bg-blue-50/30 transition-colors">
                    <td className="px-3 py-3 text-gray-400">{i + 1}</td>
                    <td className="px-3 py-3 font-medium text-gray-800 max-w-[160px]">
                      <span className="block truncate">{item.company_name}</span>
                    </td>
                    <td className="px-3 py-3 text-right text-gray-700">{n(item.stall_total)}</td>
                    <td className="px-3 py-3 text-right text-gray-700">{n(item.power_total)}</td>
                    <td className="px-3 py-3 text-right text-gray-700">{n(item.badges_total)}</td>
                    <td className="px-3 py-3 text-right text-green-700">{n(item.paid_exhibitor)}</td>
                    <td className="px-3 py-3 text-right text-gray-500">{n(item.stall_tds_total)}</td>
                    <td className="px-3 py-3 text-right text-green-700">{n(item.paid_power)}</td>
                    <td className="px-3 py-3 text-right text-gray-500">{n(item.power_tds_total)}</td>
                    <td className="px-3 py-3 text-right text-green-700">{n(item.paid_badge)}</td>
                    <td className="px-3 py-3 text-right text-gray-500">{n(item.badge_tds_total)}</td>
                    <td className="px-3 py-3 text-right font-semibold text-gray-900">{item.total.toLocaleString()}</td>
                    <td className="px-3 py-3 text-right font-semibold text-green-700">{item.received.toLocaleString()}</td>
                    <td className="px-3 py-3 text-right font-semibold">
                      <span className={item.pending > 0 ? 'text-red-600' : 'text-green-600'}>
                        {item.pending.toLocaleString()}
                      </span>
                    </td>
                    <td className="px-3 py-3 text-center">
                      <button
                        onClick={() => setSelectedCompany(item.company_name)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        <FaEye size={11} /> View
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
            {/* Grand Totals Row */}
            {!loading && filtered.length > 0 && (
              <tfoot>
                <tr className="bg-gray-100 border-t-2 border-gray-300 font-semibold text-xs">
                  <td colSpan={11} className="px-3 py-3 text-right text-gray-700 uppercase tracking-wider">Grand Total</td>
                  <td className="px-3 py-3 text-right text-gray-900">{grandTotal.toLocaleString()}</td>
                  <td className="px-3 py-3 text-right text-green-700">{grandReceived.toLocaleString()}</td>
                  <td className="px-3 py-3 text-right text-red-600">{grandPending.toLocaleString()}</td>
                  <td />
                </tr>
              </tfoot>
            )}
          </table>
        </div>
      </div>

      {/* Detail overlay */}
      {selectedCompany && (
        <PaymentDetailOverlay
          companyName={selectedCompany}
          onClose={() => setSelectedCompany(null)}
          onPaymentChanged={load}
        />
      )}
    </div>
  );
}
