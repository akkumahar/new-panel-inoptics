'use client';

import { useState, useEffect, useRef } from 'react';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import { FaSpinner, FaCheckSquare, FaSquare, FaPrint, FaFileExcel, FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import { MdFileDownload } from 'react-icons/md';

const BASE = process.env.NEXT_PUBLIC_API_BASE ?? '';

// ─── Export type definitions ──────────────────────────────────────────────────
type ExportType = 'basic' | 'stall' | 'all' | 'stallPayment' | 'powerPayment';

interface ExportConfig {
  id: ExportType;
  label: string;
  endpoint: string;
  filename: string;
  sheetName: string;
  fields: string[];
}

const EXPORT_CONFIGS: ExportConfig[] = [
  {
    id: 'basic',
    label: 'Export Basic Details',
    endpoint: 'fetch_excel_basic_details.php',
    filename: 'Exhibitors_Basic_Details.xlsx',
    sheetName: 'Exhibitors',
    fields: [
      'Company Name', 'Name', 'Address', 'City', 'State', 'Pincode',
      'Mobile No', 'Telephone', 'Email', 'Secondary Email', 'GST', 'Password',
    ],
  },
  {
    id: 'stall',
    label: 'Export Stall Details',
    endpoint: 'fetch_excel_stall_details.php',
    filename: 'Exhibitors_Stall_Details.xlsx',
    sheetName: 'Stalls',
    fields: [
      'Company Name', 'Stall Number', 'Stall Category', 'Stall Price', 'Stall Area',
      'Total', 'Discount(%)', 'Discount Amount', 'Total After Discount',
      'SGST(9%)', 'CGST(9%)', 'IGST(18%)', 'Grand Total',
    ],
  },
  {
    id: 'all',
    label: 'Export All Details',
    endpoint: 'fetch_excel_all_details.php',
    filename: 'Exhibitors_All_Details.xlsx',
    sheetName: 'AllDetails',
    fields: [
      'Company Name', 'Name', 'Address', 'City', 'State', 'Pincode',
      'Mobile No', 'Telephone', 'Email', 'Secondary Email', 'GST',
      'Stall Number', 'Stall Category', 'Stall Price', 'Stall Area',
      'Total', 'Discount(%)', 'Discount Amount', 'Total After Discount',
      'SGST(9%)', 'CGST(9%)', 'IGST(18%)', 'Grand Total',
    ],
  },
  {
    id: 'stallPayment',
    label: 'Export Stall Payment',
    endpoint: 'fetch_excel_stall_payment.php',
    filename: 'Exhibitors_Stall_Payment.xlsx',
    sheetName: 'StallPayment',
    fields: [
      'Company Name', 'State', 'City', 'Stall Number', 'Bare/Shell',
      'Stall Category', 'Stall Price', 'Stall Area', 'Total', 'TDS',
      'Discount(%)', 'Discount Amount', 'Total After Discount',
      'SGST(9%)', 'CGST(9%)', 'IGST(18%)', 'Grand Total',
      'Received Payment', 'Pending Payment',
    ],
  },
  {
    id: 'powerPayment',
    label: 'Export Power Payment',
    endpoint: 'fetch_excel_power_payment.php',
    filename: 'Exhibitors_Power_Payment.xlsx',
    sheetName: 'PowerPayment',
    fields: [
      'Company Name', 'State', 'City', 'Stall Number', 'Stall Category', 'Stall Area',
      'Exhibition Days', 'Setup Days', 'Price per KW', 'Total Power', 'Total Price',
      'SGST(9%)', 'CGST(9%)', 'IGST(18%)', 'Grand Total',
      'Received Payment', 'Pending Payment', 'TDS',
    ],
  },
];

// ─── Label types ──────────────────────────────────────────────────────────────
interface LabelItem {
  name: string;
  company_name: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  mobile_no: string;
}

// ─── Label Preview ────────────────────────────────────────────────────────────
function LabelPreview({ labels, currentIndex, onPrev, onNext }: {
  labels: LabelItem[];
  currentIndex: number;
  onPrev: () => void;
  onNext: () => void;
}) {
  if (labels.length === 0) {
    return (
      <div className="mt-4 p-4 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-400 text-center">
        Loading label data...
      </div>
    );
  }

  const item = labels[currentIndex];

  return (
    <div className="mt-4">
      <h4 className="text-xs font-semibold text-gray-700 mb-2 uppercase tracking-wider">Label Preview</h4>
      {/* Label box — simulates 9.91cm × 3.39cm */}
      <div className="bg-white border-2 border-gray-300 rounded-lg p-3 font-mono text-[11px] leading-snug max-w-[340px] shadow-sm">
        <div className="font-bold text-gray-800 text-[11px]">
          ({String(currentIndex + 1).padStart(3, '0')}) &nbsp;
          <span className="uppercase">ATTN: {item.name}</span>
        </div>
        <div className="font-semibold text-gray-900 text-[11px] mt-0.5 uppercase">
          M/S {item.company_name}
        </div>
        <div className="text-gray-700 mt-0.5">{item.address}</div>
        <div className="flex gap-2 text-gray-700 mt-0.5">
          <span>{item.city}</span>
          <span className="font-medium">{item.pincode}</span>
        </div>
        <div className="text-gray-700">{item.state}</div>
        <div className="text-gray-700 mt-0.5">MOBILE: {item.mobile_no}</div>
      </div>
      {/* Nav */}
      <div className="flex items-center gap-2 mt-2">
        <button
          onClick={onPrev}
          disabled={currentIndex === 0}
          className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium bg-gray-100 rounded-lg hover:bg-gray-200 disabled:opacity-40 transition-colors"
        >
          <FaChevronLeft size={10} /> Prev
        </button>
        <span className="text-xs text-gray-500">{currentIndex + 1} / {labels.length}</span>
        <button
          onClick={onNext}
          disabled={currentIndex === labels.length - 1}
          className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium bg-gray-100 rounded-lg hover:bg-gray-200 disabled:opacity-40 transition-colors"
        >
          Next <FaChevronRight size={10} />
        </button>
      </div>
    </div>
  );
}

// ─── Main Export Page ─────────────────────────────────────────────────────────
export default function ExportPage() {
  const [activeType, setActiveType]       = useState<ExportType | null>(null);
  const [selectedFields, setSelectedFields] = useState<string[]>([]);
  const [exporting, setExporting]         = useState(false);
  const [labelData, setLabelData]         = useState<LabelItem[]>([]);
  const [labelIndex, setLabelIndex]       = useState(0);
  const [printingLabel, setPrintingLabel] = useState(false);

  const activeConfig = EXPORT_CONFIGS.find((c) => c.id === activeType);

  // Fetch label data when Basic Export is selected
  useEffect(() => {
    if (activeType !== 'basic') return;
    let cancelled = false;

    (async () => {
      try {
        const res = await fetch(`${BASE}/fetch_label_data.php`, {
          headers: { Accept: 'application/json' },
        });
        const text = await res.text();
        if (!text || cancelled) return;
        let data: unknown;
        try { data = JSON.parse(text); } catch { return; }
        // Handle { success, data: [...] } or plain array
        const arr: LabelItem[] = Array.isArray(data)
          ? data
          : Array.isArray((data as { data?: unknown }).data)
            ? (data as { data: LabelItem[] }).data
            : [];
        if (cancelled) return;
        const normalized: LabelItem[] = arr.map((item) => ({
          name:        (item as Record<string,string>).name ?? '',
          company_name:(item as Record<string,string>).company_name ?? '',
          address:     (item as Record<string,string>).address ?? '',
          city:        (item as Record<string,string>).city ?? '',
          state:       (item as Record<string,string>).state ?? '',
          pincode:     (item as Record<string,string>).pincode ?? (item as Record<string,string>).pin ?? '',
          mobile_no:   (item as Record<string,string>).mobile_no ?? (item as Record<string,string>).mobile ?? '',
        }));
        const sorted = [...normalized].sort((a, b) =>
          a.company_name.toLowerCase().localeCompare(b.company_name.toLowerCase())
        );
        setLabelData(sorted);
        setLabelIndex(0);
      } catch { /* ignore */ }
    })();

    return () => { cancelled = true; };
  }, [activeType]);

  const handleSelectType = (id: ExportType) => {
    setActiveType(id);
    setSelectedFields([]);
  };

  const toggleField = (field: string) => {
    setSelectedFields((prev) =>
      prev.includes(field) ? prev.filter((f) => f !== field) : [...prev, field]
    );
  };

  const toggleAll = () => {
    if (!activeConfig) return;
    if (selectedFields.length === activeConfig.fields.length) {
      setSelectedFields([]);
    } else {
      setSelectedFields([...activeConfig.fields]);
    }
  };

  // ─── Export to xlsx ─────────────────────────────────────────────────────────
  const handleExport = async () => {
    if (!activeConfig || !selectedFields.length) {
      alert('Select at least one field to export.');
      return;
    }
    setExporting(true);
    try {
      const res = await fetch(`${BASE}/${activeConfig.endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fields: selectedFields }),
      });
      const text = await res.text();
      if (!text) { alert('Server returned empty response.'); return; }
      const result = JSON.parse(text);

      // Some endpoints return { success, data } others return array directly
      const rows: Record<string, unknown>[] = Array.isArray(result)
        ? result
        : Array.isArray(result.data)
          ? result.data
          : [];

      if (!rows.length) { alert('No data returned from server.'); return; }

      const ws = XLSX.utils.json_to_sheet(rows);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, activeConfig.sheetName);
      const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
      saveAs(
        new Blob([wbout], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' }),
        activeConfig.filename,
      );
    } catch (err) {
      console.error('Export failed:', err);
      alert('Export failed. Check console for details.');
    } finally {
      setExporting(false);
    }
  };

  // ─── Label Print ────────────────────────────────────────────────────────────
  const handleLabelPrint = async () => {
    setPrintingLabel(true);
    try {
      const res = await fetch(`${BASE}/fetch_label_data.php`, {
        headers: { Accept: 'application/json' },
      });
      const text = await res.text();
      if (!text) { alert('Empty response from server.'); return; }
      let data: unknown;
      try { data = JSON.parse(text); } catch { alert('Invalid response from server.'); return; }

      let arr: LabelItem[] = Array.isArray(data)
        ? data
        : Array.isArray((data as { data?: unknown }).data)
          ? (data as { data: LabelItem[] }).data
          : [];

      if (!arr.length) { alert('No label data found.'); return; }

      const normalized: LabelItem[] = arr.map((item) => ({
        name:        (item as Record<string,string>).name ?? '',
        company_name:(item as Record<string,string>).company_name ?? '',
        address:     (item as Record<string,string>).address ?? '',
        city:        (item as Record<string,string>).city ?? '',
        state:       (item as Record<string,string>).state ?? '',
        pincode:     (item as Record<string,string>).pincode ?? (item as Record<string,string>).pin ?? '',
        mobile_no:   (item as Record<string,string>).mobile_no ?? (item as Record<string,string>).mobile ?? '',
      }));

      const sorted = [...normalized].sort((a, b) =>
        a.company_name.toLowerCase().localeCompare(b.company_name.toLowerCase())
      );

      // Build print HTML — 2 labels per row, 8 per A4 page (2×4 grid at 3.39cm height)
      const LABELS_PER_PAGE = 8;
      const pages: LabelItem[][] = [];
      for (let i = 0; i < sorted.length; i += LABELS_PER_PAGE) {
        pages.push(sorted.slice(i, i + LABELS_PER_PAGE));
      }

      const labelsHtml = pages.map((page) => `
        <div class="page-container">
          ${page.map((item, idx) => `
            <div class="label">
              <div class="label-id">(${String(idx + 1).padStart(3, '0')}) <span class="kind-attention">ATTN: ${item.name}</span></div>
              <div class="company-name">M/S ${item.company_name}</div>
              <div class="address">${item.address}</div>
              <div class="city-pincode">${item.city} <span class="pincode">${item.pincode}</span></div>
              <div class="state">${item.state}</div>
              <div class="phone">MOBILE: ${item.mobile_no}</div>
            </div>
          `).join('')}
        </div>
      `).join('');

      const printWindow = window.open('', '_blank');
      if (!printWindow) { alert('Popup blocked. Please allow popups for this site.'); return; }

      printWindow.document.write(`<!DOCTYPE html>
<html>
<head>
  <title>Label Print</title>
  <style>
    @page { size: A4; margin: 0; }
    body { margin: 0; padding: 0; font-family: "Segoe UI", Arial, sans-serif; background: white; }
    .page-container {
      width: 20.0cm;
      height: 27.12cm;
      margin: 1.29cm auto;
      display: grid;
      grid-template-columns: repeat(2, 9.91cm);
      grid-auto-rows: 3.39cm;
      column-gap: 0.3cm;
      row-gap: 0;
      box-sizing: border-box;
      justify-content: center;
    }
    .page-container:not(:first-child) { page-break-before: always; padding-top: 1.3cm; }
    .label {
      width: 9.91cm;
      height: 3.39cm;
      box-sizing: border-box;
      display: flex;
      flex-direction: column;
      justify-content: flex-start;
      font-size: 9pt;
      line-height: 1.15;
      padding: 0.4cm 0.3cm 0 0.3cm;
      overflow: hidden;
      page-break-inside: avoid;
    }
    .label-id { font-weight: bold; font-size: 9.4pt; margin-bottom: 2px; text-transform: uppercase; letter-spacing: 0.3px; }
    .kind-attention { font-weight: bold; font-size: 9.4pt; text-transform: uppercase; margin-left: 5px; }
    .company-name { font-weight: bold; font-size: 9pt; text-transform: uppercase; margin-bottom: 1px; }
    .address, .city-pincode, .state, .phone { font-size: 8.5pt; color: #222; }
    .pincode { font-weight: bold; margin-left: 4px; }
  </style>
</head>
<body>
${labelsHtml}
</body>
</html>`);
      printWindow.document.close();
      printWindow.onload = () => {
        printWindow.focus();
        printWindow.print();
      };
    } catch (err) {
      console.error('Label print failed:', err);
      alert('Label print failed. Check console.');
    } finally {
      setPrintingLabel(false);
    }
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900">Export</h2>
        <p className="text-sm text-gray-500">Export exhibitor data to Excel sheets</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-5">
        {/* ── LEFT: Export type buttons ─────────────────────────────────────── */}
        <div className="w-full lg:w-60 shrink-0 space-y-2">
          {EXPORT_CONFIGS.map((config) => (
            <button
              key={config.id}
              onClick={() => handleSelectType(config.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-left transition-all border
                ${activeType === config.id
                  ? 'bg-blue-600 text-white border-blue-600 shadow-md'
                  : 'bg-white text-gray-700 border-gray-200 hover:border-blue-400 hover:text-blue-600 shadow-sm'}`}
            >
              <MdFileDownload size={18} />
              {config.label}
            </button>
          ))}

          {/* Label Preview — only for Basic Export */}
          {activeType === 'basic' && (
            <LabelPreview
              labels={labelData}
              currentIndex={labelIndex}
              onPrev={() => setLabelIndex((i) => Math.max(0, i - 1))}
              onNext={() => setLabelIndex((i) => Math.min(labelData.length - 1, i + 1))}
            />
          )}
        </div>

        {/* ── RIGHT: Field selector + actions ──────────────────────────────── */}
        {activeConfig && (
          <div className="flex-1 bg-white border border-gray-200 rounded-2xl shadow-sm p-5 space-y-5">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-gray-900">
                Select Fields to Export
                <span className="ml-2 text-xs font-normal text-gray-400">
                  ({selectedFields.length} / {activeConfig.fields.length} selected)
                </span>
              </h3>
              <button
                onClick={toggleAll}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
              >
                {selectedFields.length === activeConfig.fields.length
                  ? <><FaSquare size={11} /> Deselect All</>
                  : <><FaCheckSquare size={11} /> Select All</>
                }
              </button>
            </div>

            {/* Checkbox grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
              {activeConfig.fields.map((field) => {
                const checked = selectedFields.includes(field);
                return (
                  <label
                    key={field}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg border cursor-pointer transition-all text-sm
                      ${checked
                        ? 'bg-blue-50 border-blue-300 text-blue-800'
                        : 'bg-gray-50 border-gray-200 text-gray-600 hover:border-gray-300 hover:bg-gray-100'}`}
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => toggleField(field)}
                      className="w-3.5 h-3.5 accent-blue-600 shrink-0"
                    />
                    <span className="truncate">{field}</span>
                  </label>
                );
              })}
            </div>

            {/* Action buttons */}
            <div className="flex flex-wrap items-center gap-3 pt-1 border-t border-gray-100">
              {activeType === 'basic' && (
                <button
                  onClick={handleLabelPrint}
                  disabled={printingLabel}
                  className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-white bg-indigo-600 rounded-xl hover:bg-indigo-700 transition-colors disabled:opacity-60"
                >
                  {printingLabel ? <FaSpinner size={13} className="animate-spin" /> : <FaPrint size={13} />}
                  Label Print
                </button>
              )}
              <button
                onClick={handleExport}
                disabled={exporting || !selectedFields.length}
                className="flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-white bg-green-600 rounded-xl hover:bg-green-700 transition-colors disabled:opacity-60"
              >
                {exporting
                  ? <FaSpinner size={13} className="animate-spin" />
                  : <FaFileExcel size={13} />
                }
                {exporting ? 'Exporting...' : 'Export to Excel'}
              </button>
            </div>

            {/* Column order preview */}
            {selectedFields.length > 0 && (
              <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
                <h4 className="text-xs font-semibold text-gray-600 uppercase tracking-wider mb-3">
                  Column Order Preview
                </h4>
                <div className="flex flex-wrap gap-1.5">
                  {selectedFields.map((field, idx) => (
                    <span
                      key={field}
                      className="inline-flex items-center gap-1 px-2 py-0.5 bg-blue-100 text-blue-800 text-xs rounded-full font-medium"
                    >
                      <span className="text-blue-400 font-bold">{idx + 1}.</span>
                      {field}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Empty state when nothing selected */}
        {!activeConfig && (
          <div className="flex-1 bg-white border border-gray-200 rounded-2xl shadow-sm flex items-center justify-center p-12">
            <div className="text-center text-gray-400 space-y-2">
              <MdFileDownload size={40} className="mx-auto opacity-30" />
              <p className="text-sm font-medium">Select an export type from the left</p>
              <p className="text-xs">Choose what data you want to export to Excel</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
