// Base URL — set in .env.local as NEXT_PUBLIC_API_BASE=https://inoptics.in/api
const BASE = process.env.NEXT_PUBLIC_API_BASE ?? '';

// ─── Raw API Response Types ────────────────────────────────────────────────
export interface RawExhibitor {
  id: string;
  company_name: string;
  contact_name?: string;
  stall_no?: string;
  stall_area?: string;
  category?: string; // 'S' | 'B'
  email?: string;
  mobile_no?: string;
  address?: string;
  city?: string;
  state?: string;
  pin_code?: string;
  website?: string;
  gst_number?: string;
}

export interface RawStall {
  id: string;
  company_name?: string;
  stall_no: string;
  stall_area?: string;
  hall_no?: string;
  category?: string; // type: S | B
}

export interface RawPower {
  id: string;
  company_name?: string;
  component_name?: string;
  quantity?: string | number;
  wattage?: string | number;
  total_load?: string | number;
}

export interface RawBadge {
  id: string;
  company_name?: string;
  badge_no?: string;
  name?: string;
  designation?: string;
  consumed?: string | number; // 0 or 1
}

export interface RawContractor {
  id: string;
  company_name?: string;
  contractor_name?: string;
  company?: string;
  phone?: string;
  type?: string;
  status?: string;
}

export interface RawFurniture {
  id: string;
  company_name?: string;
  item_name?: string;
  quantity?: string | number;
  rate?: string | number;
  total?: string | number;
}

export interface RawPayment {
  id: string;
  company_name?: string;
  description?: string;
  amount?: string | number;
  tax?: string | number;
  total?: string | number;
  payment_method?: string;
  status?: string;
  payment_date?: string;
}

export interface RawBrand {
  id: string;
  company_name?: string;
  brand_name?: string;
  category?: string;
  description?: string;
}

async function request<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}/${endpoint}`, {
    headers: { 'Content-Type': 'application/json', ...options?.headers },
    ...options,
  });
  if (!res.ok) throw new Error(`API error ${res.status}: ${res.statusText}`);
  return res.json();
}

function formRequest<T>(endpoint: string, data: Record<string, unknown>): Promise<T> {
  const body = new FormData();
  Object.entries(data).forEach(([k, v]) => {
    if (v !== undefined && v !== null) body.append(k, String(v));
  });
  return fetch(`${BASE}/${endpoint}`, { method: 'POST', body }).then((r) => {
    if (!r.ok) throw new Error(`API error ${r.status}`);
    return r.json();
  });
}

// ─── Exhibitors ────────────────────────────────────────────────────────────
export const exhibitorApi = {
  getAll: () => request('get_exhibitors.php'),
  getById: (id: string) => request(`get_exhibitor.php?id=${id}`),
  add: (data: Record<string, unknown>) => formRequest('add_exhibitor.php', data),
  addMain: (data: Record<string, unknown>) => formRequest('add_exhibitors_main.php', data),
  delete: (id: string) => formRequest('delete_exhibitor.php', { id }),
  deleteCompany: (id: string) => formRequest('delete_company_details_everywhere.php', { id }),
  addLogin: (data: Record<string, unknown>) => formRequest('add_exhibitor_login.php', data),
  deleteLogin: (id: string) => formRequest('delete_exhibitor_login.php', { id }),
  addRemark: (data: Record<string, unknown>) => formRequest('add_exhibitor_remark.php', data),
  deleteRemark: (id: string) => formRequest('delete_exhibitor_remark.php', { id }),
  addRule: (data: Record<string, unknown>) => formRequest('add_exhibitor_rule.php', data),
  deleteRule: (id: string) => formRequest('delete_exhibitor_rule.php', { id }),
};

// ─── Stalls ────────────────────────────────────────────────────────────────
export const stallApi = {
  add: (data: Record<string, unknown>) => formRequest('add_stall.php', data),
  delete: (id: string) => formRequest('delete_stall.php', { id }),
  deleteExhibitorStall: (id: string) => formRequest('delete_exhibitor_stall.php', { id }),
  addArea: (data: Record<string, unknown>) => formRequest('add_stall_area.php', data),
  deleteArea: (id: string) => formRequest('delete_stall_area.php', { id }),
  addCategory: (data: Record<string, unknown>) => formRequest('add_stall_category.php', data),
  deleteCategory: (id: string) => formRequest('delete_stall_category.php', { id }),
  addHall: (data: Record<string, unknown>) => formRequest('add_hall_number.php', data),
  deleteHall: (id: string) => formRequest('delete_hall_number.php', { id }),
};

// ─── Power ─────────────────────────────────────────────────────────────────
export const powerApi = {
  addRequirement: (data: Record<string, unknown>) => formRequest('add_power_requirement.php', data),
  deleteRequirement: (id: string) => formRequest('delete_power_requirement.php', { id }),
  deleteById: (id: string) => formRequest('delete_power_by_id.php', { id }),
  addExhibitorRequirement: (data: Record<string, unknown>) => formRequest('add_Exhibitor_power_requirement.php', data),
  addExhibitorRequirementExtra: (data: Record<string, unknown>) => formRequest('add_Exhibitor_power_requirement_Extra_Component.php', data),
  deleteExhibitorRequirement: (id: string) => formRequest('delete_Exhibitor_power_requirement.php', { id }),
  addVendor: (data: Record<string, unknown>) => formRequest('add_power_vendor.php', data),
  deleteVendor: (id: string) => formRequest('delete_power_vendor.php', { id }),
  addPayment: (data: Record<string, unknown>) => formRequest('add_exhibitor_power_payment.php', data),
  deletePayment: (id: string) => formRequest('delete_exhibitor_power_payment.php', { id }),
  createReceive: (data: Record<string, unknown>) => formRequest('create_receive_power_payments.php', data),
  deleteReceive: (id: string) => formRequest('delete_receive_power_payments.php', { id }),
};

// ─── Badges ────────────────────────────────────────────────────────────────
export const badgeApi = {
  addLimit: (data: Record<string, unknown>) => formRequest('add_badge_limit.php', data),
  deleteLimit: (id: string) => formRequest('delete_badge_limit.php', { id }),
  addContractor: (data: Record<string, unknown>) => formRequest('add_contractor_badge.php', data),
  deleteContractor: (id: string) => formRequest('delete_contractor_badge.php', { id }),
  deleteExhibitorBadge: (id: string) => formRequest('delete_exhibitor_badge.php', { id }),
  deleteExhibitorBadgeSeries: (id: string) => formRequest('delete_exhibitor_badge_series.php', { id }),
  addPayment: (data: Record<string, unknown>) => formRequest('add_exhibitor_badge_payment.php', data),
  deletePayment: (id: string) => formRequest('delete_exhibitor_badge_payment.php', { id }),
  adminAdd: (data: Record<string, unknown>) => formRequest('admin_add_badges.php', data),
  consume: (data: Record<string, unknown>) => formRequest('consume_badge.php', data),
  acceptUnlock: (data: Record<string, unknown>) => formRequest('accept_badge_unlock.php', data),
  adminUnlock: (data: Record<string, unknown>) => formRequest('admin_unlock.php', data),
  adminUnlockRequests: () => request('admin_unlock_requests.php'),
};

// ─── Contractor ────────────────────────────────────────────────────────────
export const contractorApi = {
  addBooth: (data: Record<string, unknown>) => formRequest('add_contractor_booth.php', data),
  deleteBooth: (id: string) => formRequest('delete_contractor_booth.php', { id }),
  addRequirement: (data: Record<string, unknown>) => formRequest('add_contractor_requirement.php', data),
  deleteRequirement: (id: string) => formRequest('delete_contractor_requirement.php', { id }),
  addUndertaking: (data: Record<string, unknown>) => formRequest('add_contractor_undertaking.php', data),
  deleteUndertaking: (id: string) => formRequest('delete_contractor_undertaking.php', { id }),
  checkCompany: (data: Record<string, unknown>) => formRequest('check_contractor_company.php', data),
  checkFiles: (data: Record<string, unknown>) => formRequest('check_contractor_files.php', data),
  approveBooth: (data: Record<string, unknown>) => formRequest('approve_booth_design.php', data),
  rejectBooth: (data: Record<string, unknown>) => formRequest('reject_booth_design.php', data),
  uploadBoothFile: (data: FormData) => fetch(`${BASE}/upload_booth_design_file.php`, { method: 'POST', body: data }).then(r => r.json()),
  deleteFormHistory: (id: string) => formRequest('delete_contractor_form_history.php', { id }),
  adminStepUnlock: (data: Record<string, unknown>) => formRequest('admin_contractor_step_unlock.php', data),
  adminUnlockContractor: (data: Record<string, unknown>) => formRequest('admin_unlock_contractor.php', data),
  adminUnlockFurniture: (data: Record<string, unknown>) => formRequest('admin_unlock_furniture.php', data),
  createUnlockRequest: (data: Record<string, unknown>) => formRequest('create_unlock_request.php', data),
  deleteContractorPayments: (id: string) => formRequest('delete_exhibitor_contractor_payments.php', { id }),
};

// ─── Furniture ─────────────────────────────────────────────────────────────
export const furnitureApi = {
  addRequirement: (data: Record<string, unknown>) => formRequest('add_furniture_requirement.php', data),
  deleteRequirement: (id: string) => formRequest('delete_furniture_requirement.php', { id }),
  addVendor: (data: Record<string, unknown>) => formRequest('add_furniture_vendor.php', data),
  deleteVendor: (id: string) => formRequest('delete_furniture_vendor.php', { id }),
  addSelected: (data: Record<string, unknown>) => formRequest('add_selected_furniture.php', data),
};

// ─── Brands ────────────────────────────────────────────────────────────────
export const brandApi = {
  add: (data: Record<string, unknown>) => formRequest('add_exhibitor_brands.php', data),
  addBranding: (data: Record<string, unknown>) => formRequest('add_branding_requirement.php', data),
  deleteBranding: (id: string) => formRequest('delete_branding_requirement.php', { id }),
  addSelected: (data: Record<string, unknown>) => formRequest('add_selected_branding.php', data),
  addBusinessReq: (data: Record<string, unknown>) => formRequest('add_business_requirement.php', data),
  deleteBusinessReq: (id: string) => formRequest('delete_business_requirement.php', { id }),
};

// ─── Payments ──────────────────────────────────────────────────────────────
export const paymentApi = {
  addExhibitor: (data: Record<string, unknown>) => formRequest('add_exhibitor_payment.php', data),
  deleteExhibitor: (id: string) => formRequest('delete_exhibitor_payment.php', { id }),
  addRegistrationFees: (data: Record<string, unknown>) => formRequest('add_registration_fees.php', data),
  deleteRegistrationFees: (id: string) => formRequest('delete_registration_fees.php', { id }),
  addTaxes: (data: Record<string, unknown>) => formRequest('add_taxes.php', data),
  deleteTaxes: (id: string) => formRequest('delete_taxes.php', { id }),
  addCurrency: (data: Record<string, unknown>) => formRequest('add_currency.php', data),
  deleteCurrency: (id: string) => formRequest('delete_currency.php', { id }),
  addInvoiceAddress: () => request('add_invoice_address.php'),
  deleteInvoiceAddress: (id: string) => formRequest('delete_invoice_address.php', { id }),
};

// ─── Forms / Declarations ──────────────────────────────────────────────────
export const formApi = {
  addCoreForm: (data: Record<string, unknown>) => formRequest('add_core_form.php', data),
  deleteCoreForm: (id: string) => formRequest('delete_core_form.php', { id }),
  addDeclaration: (data: Record<string, unknown>) => formRequest('add_exhibitor_declaration.php', data),
  deleteDeclaration: (id: string) => formRequest('delete_exhibitor_declaration.php', { id }),
  addDeclarationUndertaking: (data: Record<string, unknown>) => formRequest('add_exhibitor_declaration_undertaking.php', data),
  deleteDeclarationUndertaking: (id: string) => formRequest('delete_exhibitor_declaration_undertaking.php', { id }),
  acceptUndertaking: (data: Record<string, unknown>) => formRequest('accept_undertaking.php', data),
  uploadExhibitorForm: (data: FormData) => fetch(`${BASE}/upload_exhibitor_form.php`, { method: 'POST', body: data }).then(r => r.json()),
  uploadSignedForm: (data: FormData) => fetch(`${BASE}/upload_signed_form.php`, { method: 'POST', body: data }).then(r => r.json()),
  downloadExhibitorForm: (id: string) => `${BASE}/download_exhibitor_form.php?id=${id}`,
};

// ─── Fascia ────────────────────────────────────────────────────────────────
export const fasciaApi = {
  add: (data: Record<string, unknown>) => formRequest('add_exhibitor_facia.php', data),
  delete: (id: string) => formRequest('delete_fascia.php', { id }),
};

// ─── Communication ─────────────────────────────────────────────────────────
export const communicationApi = {
  addEmail: (data: Record<string, unknown>) => formRequest('add_email_message.php', data),
  deleteEmail: (id: string) => formRequest('delete_email_message.php', { id }),
  addSms: (data: Record<string, unknown>) => formRequest('add_sms_table.php', data),
  deleteSms: (id: string) => formRequest('delete_sms_table.php', { id }),
  addSmsInstruction: (data: Record<string, unknown>) => formRequest('add_sms_instruction.php', data),
  deleteSmsInstruction: (id: string) => formRequest('delete_sms_instruction.php', { id }),
  addWhatsapp: (data: Record<string, unknown>) => formRequest('add_whatsapp_table.php', data),
  deleteWhatsapp: (id: string) => formRequest('delete_whatsapp_table.php', { id }),
  addWhatsappInstruction: (data: Record<string, unknown>) => formRequest('add_whatsapp_instruction.php', data),
  deleteWhatsappInstruction: (id: string) => formRequest('delete_whatsapp_instruction.php', { id }),
  createMessageRule: (data: Record<string, unknown>) => formRequest('create_message_rule.php', data),
  deleteMessageRule: (id: string) => formRequest('delete_message_rule.php', { id }),
};

// ─── Schedule / Instructions ───────────────────────────────────────────────
export const scheduleApi = {
  addSchedule: (data: Record<string, unknown>) => formRequest('add_exhibitor_schedule.php', data),
  deleteSchedule: (id: string) => formRequest('delete_exhibitor_schedule.php', { id }),
  addEventSchedule: (data: Record<string, unknown>) => formRequest('add_exhibitor_event_schedule.php', data),
  deleteEventSchedule: (id: string) => formRequest('delete_exhibitor_event_schedule.php', { id }),
  addDashboardSchedule: (data: Record<string, unknown>) => formRequest('add_exhibitor_dashboard_schedule.php', data),
  deleteDashboardSchedule: (id: string) => formRequest('delete_exhibitor_dashboard_schedule.php', { id }),
  addInstruction: (data: Record<string, unknown>) => formRequest('add_exhibitor_instruction.php', data),
  deleteInstruction: (id: string) => formRequest('delete_exhibitor_instruction.php', { id }),
  addDashboardInstruction: (data: Record<string, unknown>) => formRequest('add_exhibitor_dashboard_instructions.php', data),
  deleteDashboardInstruction: (id: string) => formRequest('delete_exhibitor_dashboard_instructions.php', { id }),
  addGuideline: (data: Record<string, unknown>) => formRequest('add_exhibitor_guideline.php', data),
  deleteGuideline: (id: string) => formRequest('delete_exhibitor_guideline.php', { id }),
};

// ─── Website / Media ───────────────────────────────────────────────────────
export const websiteApi = {
  addMediaGallery: (data: FormData) => fetch(`${BASE}/add_mediagallery_details.php`, { method: 'POST', body: data }).then(r => r.json()),
  deleteMediaGallery: (id: string) => formRequest('delete_mediagallery_details.php', { id }),
  deleteEmailMediaImage: (id: string) => formRequest('delete_email_media_image.php', { id }),
  uploadEmailMedia: (data: FormData) => fetch(`${BASE}/upload_email_media_image.php`, { method: 'POST', body: data }).then(r => r.json()),
  addLatestNews: (data: Record<string, unknown>) => formRequest('add_latest_news.php', data),
  deleteLatestNews: (id: string) => formRequest('delete_latest_news.php', { id }),
  uploadHomeVideo: (data: FormData) => fetch(`${BASE}/upload_home_video.php`, { method: 'POST', body: data }).then(r => r.json()),
  deleteHomeVideo: (id: string) => formRequest('delete_home_video.php', { id }),
  uploadSponsor: (data: FormData) => fetch(`${BASE}/upload_sponsor_image.php`, { method: 'POST', body: data }).then(r => r.json()),
  deleteSponsor: (id: string) => formRequest('delete_sponsor_image.php', { id }),
  addExhibitionMap: (data: Record<string, unknown>) => formRequest('add_exhibition_map.php', data),
  deleteExhibitionMap: (id: string) => formRequest('delete_exhibition_map.php', { id }),
  addPressRelease: (data: Record<string, unknown>) => formRequest('add_pressrelease_details.php', data),
  deletePressRelease: (id: string) => formRequest('delete_pressrelease_details.php', { id }),
  addProduct: (data: Record<string, unknown>) => formRequest('add_product.php', data),
  deleteProduct: (id: string) => formRequest('delete_product.php', { id }),
  addService: (data: Record<string, unknown>) => formRequest('add_service.php', data),
  deleteService: (id: string) => formRequest('delete_service.php', { id }),
};

// ─── GET / Fetch endpoints ─────────────────────────────────────────────────
export const getApi = {
  exhibitors: () => request<RawExhibitor[]>('get_exhibitors.php'),
  stallsByCompany: (name: string) =>
    request<RawStall[]>(`get_stalls.php?company_name=${encodeURIComponent(name)}`),
  powerByCompany: (name: string) =>
    request<RawPower[]>(`get_exhibitor_power_data.php?company_name=${encodeURIComponent(name)}`),
  badgesByCompany: (name: string) =>
    request<RawBadge[]>(`get_exhibitor_badge_data.php?company_name=${encodeURIComponent(name)}`),
  contractorsByCompany: (name: string) =>
    request<RawContractor[]>(`get_appointed_contractor.php?company_name=${encodeURIComponent(name)}`),
  furnitureByCompany: (name: string) =>
    request<RawFurniture[]>(`get_selected_furniture.php?company_name=${encodeURIComponent(name)}`),
  paymentsByCompany: (name: string) =>
    request<RawPayment[]>(`get_exhibitor_payment.php?company_name=${encodeURIComponent(name)}`),
  brandsByCompany: (name: string) =>
    request<RawBrand[]>(`get_exhibitor_brands.php?company_name=${encodeURIComponent(name)}`),
};
