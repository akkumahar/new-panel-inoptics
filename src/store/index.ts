import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// ─── Types ──────────────────────────────────────────────────────────────────
export interface Exhibitor {
  id: string;
  companyName: string;
  contactName: string;
  stallNo: string;
  stallArea: string;
  type: 'B' | 'S'; // Buyer / Seller
  email: string;
  mobile: string;
  address?: string;
  city?: string;
  state?: string;
  pincode?: string;
  website?: string;
  gst?: string;
  status: 'active' | 'pending' | 'inactive';
  createdAt: string;
}

export interface ExhibitorStall {
  id: string;
  exhibitorId: string;
  stallNo: string;
  stallArea: string;
  hallNo: string;
  type: 'B' | 'S';
  status: 'booked' | 'available' | 'reserved';
}

export interface PowerRequirement {
  id: string;
  exhibitorId: string;
  component: string;
  quantity: number;
  wattage: number;
  totalLoad: number;
}

export interface ExhibitorBadge {
  id: string;
  exhibitorId: string;
  badgeNo: string;
  name: string;
  designation: string;
  consumed: boolean;
}

export interface AppointedContractor {
  id: string;
  exhibitorId: string;
  contractorName: string;
  company: string;
  phone: string;
  type: string;
  status: 'approved' | 'pending' | 'rejected';
}

export interface FurnitureRequirement {
  id: string;
  exhibitorId: string;
  item: string;
  quantity: number;
  rate: number;
  total: number;
}

export interface ExhibitorPayment {
  id: string;
  exhibitorId: string;
  description: string;
  amount: number;
  tax: number;
  total: number;
  method: string;
  status: 'paid' | 'pending' | 'failed';
  date: string;
}

export interface Brand {
  id: string;
  exhibitorId: string;
  brandName: string;
  category: string;
  description?: string;
}

// ─── Mock Data ───────────────────────────────────────────────────────────────
const mockExhibitors: Exhibitor[] = [
  { id: '1', companyName: 'AADITI OPTICAL RESEARCHERS AND SURVEYORS PVT. LTD.', contactName: 'Yogesh Sharma', stallNo: 'A-153(S)', stallArea: '18 sq mtr', type: 'S', email: 'YOGESH@OPTIKAM.COM', mobile: '9604240841', city: 'Mumbai', state: 'Maharashtra', status: 'active', createdAt: '2024-01-10' },
  { id: '2', companyName: 'AHUJA PLASTIC', contactName: 'Rahul Ahuja', stallNo: 'F-115(B)', stallArea: '18 sq mtr', type: 'B', email: 'AHUJAPLASTIC1987@GMAIL.COM', mobile: '9891044999', city: 'Delhi', state: 'Delhi', status: 'active', createdAt: '2024-01-12' },
  { id: '3', companyName: 'AJAYA EXPORTS PVT. LTD.', contactName: 'Ajay Verma', stallNo: 'A-168(S)', stallArea: '12 sq mtr', type: 'S', email: 'AJAYAEXPORTS@YAHOO.CO.IN', mobile: '9811220501', city: 'Agra', state: 'UP', status: 'active', createdAt: '2024-01-15' },
  { id: '4', companyName: 'AL-FALAH OPTICAL CO', contactName: 'Mohammad Yusuf', stallNo: 'A-125(S)', stallArea: '12 sq mtr', type: 'S', email: 'RABBANIYUSUF0786@GMAIL.COM', mobile: '9266558832', city: 'Lucknow', state: 'UP', status: 'pending', createdAt: '2024-01-18' },
  { id: '5', companyName: 'ALLIED MEDICAL TECHNOLOGIES', contactName: 'Kamal Rajput', stallNo: 'K-103(B)', stallArea: '27 sq mtr', type: 'B', email: 'ALKARAJPUT2002@GMAIL.COM', mobile: '8586924008', city: 'Bangalore', state: 'Karnataka', status: 'active', createdAt: '2024-01-20' },
  { id: '6', companyName: 'AMVI EYEWEAR', contactName: 'Amit Distributors', stallNo: 'B-101 A(B)', stallArea: '42 sq mtr', type: 'B', email: 'AMVIDISTRIBUTORS@GMAIL.COM', mobile: '9836099833', city: 'Kolkata', state: 'WB', status: 'active', createdAt: '2024-01-22' },
  { id: '7', companyName: 'ANAS OPTICAL CO.', contactName: 'Anas Khan', stallNo: 'A-120(S)', stallArea: '15 sq mtr', type: 'S', email: 'ANASOPTICAL@GMAIL.COM', mobile: '9810893860', city: 'Delhi', state: 'Delhi', status: 'active', createdAt: '2024-01-25' },
  { id: '8', companyName: 'ATC ASSOCIATES', contactName: 'Arnav Tray', stallNo: 'A-145(S)', stallArea: '12 sq mtr', type: 'S', email: 'ARNAVTRAY@GMAIL.COM', mobile: '9413290678', city: 'Jaipur', state: 'Rajasthan', status: 'active', createdAt: '2024-01-28' },
  { id: '9', companyName: 'AVR RETAIL SOLUTIONS PVT. LTD.', contactName: 'Ramesh Jangir', stallNo: 'A-101(B)', stallArea: '92 sq mtr', type: 'B', email: 'RAMESH.JANGIR@AVRRETAIL.COM', mobile: '9560960838', city: 'Jodhpur', state: 'Rajasthan', status: 'active', createdAt: '2024-02-01' },
  { id: '10', companyName: 'AXIOM VISCOM', contactName: 'Dhaval Shah', stallNo: 'B-114(B)', stallArea: '30 sq mtr', type: 'B', email: 'DHAVAL@AXIOMVISCOM.IN', mobile: '9820788803', city: 'Ahmedabad', state: 'Gujarat', status: 'active', createdAt: '2024-02-03' },
  { id: '11', companyName: 'B & B OPTICS EST', contactName: 'BNB Optics', stallNo: 'C-102(B)', stallArea: '42 sq mtr', type: 'B', email: 'BNBOPTICS@GMAIL.COM', mobile: '9610130300,\n9649366789', city: 'Hyderabad', state: 'Telangana', status: 'active', createdAt: '2024-02-05' },
  { id: '12', companyName: 'BALAJI TRADERS', contactName: 'Balaji Optical', stallNo: 'A-158(S)', stallArea: '12 sq mtr', type: 'S', email: 'BALAJIOPTICALCOAGRA@GMAIL.COM', mobile: '9412167865', city: 'Agra', state: 'UP', status: 'pending', createdAt: '2024-02-08' },
  { id: '13', companyName: 'BAUSCH & LOMB INDIA PVT. LTD.', contactName: 'Disha Bharadwaj', stallNo: 'F-102(B), F-101(B)', stallArea: '32 sq mtr, 40 sq mtr', type: 'B', email: 'DISHA.BHARADWAJ@BAUSCH.COM', mobile: '7697034979', city: 'Mumbai', state: 'Maharashtra', status: 'active', createdAt: '2024-02-10' },
];

const mockStalls: ExhibitorStall[] = [
  { id: '1', exhibitorId: '1',  stallNo: 'A-153(S)', stallArea: '18 sq mtr', hallNo: 'Hall A', type: 'S', status: 'booked' },
  { id: '2', exhibitorId: '2',  stallNo: 'F-115(B)', stallArea: '18 sq mtr', hallNo: 'Hall F', type: 'B', status: 'booked' },
  { id: '3', exhibitorId: '13', stallNo: 'F-102(B)', stallArea: '32 sq mtr', hallNo: 'Hall F', type: 'B', status: 'booked' },
  { id: '4', exhibitorId: '13', stallNo: 'F-101(B)', stallArea: '40 sq mtr', hallNo: 'Hall F', type: 'B', status: 'booked' },
];

const mockPowerRequirements: PowerRequirement[] = [
  { id: '1', exhibitorId: '1', component: 'LED Spotlight 50W', quantity: 10, wattage: 50, totalLoad: 500 },
  { id: '2', exhibitorId: '1', component: 'AC Unit 1.5 Ton', quantity: 1, wattage: 1500, totalLoad: 1500 },
  { id: '3', exhibitorId: '2', component: 'LED Panel 30W', quantity: 8, wattage: 30, totalLoad: 240 },
];

const mockBadges: ExhibitorBadge[] = [
  { id: '1', exhibitorId: '1', badgeNo: 'B-001', name: 'Yogesh Sharma', designation: 'Director', consumed: true },
  { id: '2', exhibitorId: '1', badgeNo: 'B-002', name: 'Priya Sharma', designation: 'Manager', consumed: false },
  { id: '3', exhibitorId: '2', badgeNo: 'B-003', name: 'Rahul Ahuja', designation: 'CEO', consumed: true },
];

const mockContractors: AppointedContractor[] = [
  { id: '1', exhibitorId: '1', contractorName: 'Rajesh Kumar', company: 'BuildFast Constructions', phone: '9876543220', type: 'Construction', status: 'approved' },
  { id: '2', exhibitorId: '2', contractorName: 'Meena Joshi', company: 'ElectroFix', phone: '9876543221', type: 'Electrical', status: 'pending' },
];

const mockFurniture: FurnitureRequirement[] = [
  { id: '1', exhibitorId: '1', item: 'Reception Counter', quantity: 1, rate: 5000, total: 5000 },
  { id: '2', exhibitorId: '1', item: 'Chairs', quantity: 4, rate: 800, total: 3200 },
  { id: '3', exhibitorId: '2', item: 'Display Shelves', quantity: 3, rate: 2500, total: 7500 },
];

const mockPayments: ExhibitorPayment[] = [
  { id: '1', exhibitorId: '1', description: 'Stall Booking Fee', amount: 50000, tax: 9000, total: 59000, method: 'NEFT', status: 'paid', date: '2024-01-15' },
  { id: '2', exhibitorId: '1', description: 'Power Connection Charges', amount: 8000, tax: 1440, total: 9440, method: 'Cheque', status: 'paid', date: '2024-02-01' },
  { id: '3', exhibitorId: '2', description: 'Stall Booking Fee', amount: 75000, tax: 13500, total: 88500, method: 'DD', status: 'paid', date: '2024-01-20' },
  { id: '4', exhibitorId: '3', description: 'Stall Booking Fee', amount: 45000, tax: 8100, total: 53100, method: 'NEFT', status: 'pending', date: '2024-02-05' },
];

const mockBrands: Brand[] = [
  { id: '1', exhibitorId: '1', brandName: 'OptiKam', category: 'Optical Instruments', description: 'Premium optical research equipment' },
  { id: '2', exhibitorId: '2', brandName: 'Ahuja Vision', category: 'Plastic Frames', description: 'Lightweight plastic eyewear' },
  { id: '3', exhibitorId: '1', brandName: 'SurveyPro', category: 'Survey Equipment', description: 'Professional surveying tools' },
];

// ─── Store Interface ─────────────────────────────────────────────────────────
interface UIState {
  sidebarOpen: boolean;
  sidebarCollapsed: boolean;
  activeMenu: string;
  expandedMenus: string[];
  toggleSidebar: () => void;
  toggleSidebarCollapse: () => void;
  setActiveMenu: (menu: string) => void;
  toggleExpandedMenu: (menuId: string) => void;
}

interface ExhibitorDetailState {
  selectedExhibitor: Exhibitor | null;
  activeDetailTab: string;
  setSelectedExhibitor: (e: Exhibitor | null) => void;
  setActiveDetailTab: (tab: string) => void;
}

interface ExhibitorState {
  exhibitors: Exhibitor[];
  loading: boolean;
  setExhibitors: (e: Exhibitor[]) => void;
  addExhibitor: (e: Exhibitor) => void;
  updateExhibitor: (id: string, data: Partial<Exhibitor>) => void;
  deleteExhibitor: (id: string) => void;
}

interface StallDetailState {
  stallsByExhibitor: Record<string, ExhibitorStall[]>;
  setStalls: (exhibitorId: string, stalls: ExhibitorStall[]) => void;
  addStall: (stall: ExhibitorStall) => void;
  deleteStall: (exhibitorId: string, stallId: string) => void;
}

interface PowerState {
  powerByExhibitor: Record<string, PowerRequirement[]>;
  setPower: (exhibitorId: string, items: PowerRequirement[]) => void;
  addPower: (item: PowerRequirement) => void;
  deletePower: (exhibitorId: string, id: string) => void;
}

interface BadgeState {
  badgesByExhibitor: Record<string, ExhibitorBadge[]>;
  setBadges: (exhibitorId: string, badges: ExhibitorBadge[]) => void;
  addBadge: (badge: ExhibitorBadge) => void;
  deleteBadge: (exhibitorId: string, id: string) => void;
}

interface ContractorDetailState {
  contractorsByExhibitor: Record<string, AppointedContractor[]>;
  setContractors: (exhibitorId: string, items: AppointedContractor[]) => void;
  addContractor: (item: AppointedContractor) => void;
  approveContractor: (exhibitorId: string, id: string) => void;
  deleteContractor: (exhibitorId: string, id: string) => void;
}

interface FurnitureState {
  furnitureByExhibitor: Record<string, FurnitureRequirement[]>;
  setFurniture: (exhibitorId: string, items: FurnitureRequirement[]) => void;
  addFurniture: (item: FurnitureRequirement) => void;
  deleteFurniture: (exhibitorId: string, id: string) => void;
}

interface PaymentDetailState {
  paymentsByExhibitor: Record<string, ExhibitorPayment[]>;
  setPayments: (exhibitorId: string, items: ExhibitorPayment[]) => void;
  addPayment: (item: ExhibitorPayment) => void;
  deletePayment: (exhibitorId: string, id: string) => void;
}

interface BrandState {
  brandsByExhibitor: Record<string, Brand[]>;
  setBrands: (exhibitorId: string, brands: Brand[]) => void;
  addBrand: (brand: Brand) => void;
  deleteBrand: (exhibitorId: string, id: string) => void;
}

export interface AppNotification {
  id: string;
  message: string;
  type: 'info' | 'warning' | 'success' | 'error';
  read: boolean;
  createdAt: string;
}

interface NotificationState {
  notifications: AppNotification[];
  unreadCount: number;
  addNotification: (n: AppNotification) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
}

type AppStore = UIState &
  ExhibitorDetailState &
  ExhibitorState &
  StallDetailState &
  PowerState &
  BadgeState &
  ContractorDetailState &
  FurnitureState &
  PaymentDetailState &
  BrandState &
  NotificationState;

// ─── Group mock data by exhibitorId ──────────────────────────────────────────
function groupById<T extends { exhibitorId: string }>(items: T[]): Record<string, T[]> {
  return items.reduce((acc, item) => {
    if (!acc[item.exhibitorId]) acc[item.exhibitorId] = [];
    acc[item.exhibitorId].push(item);
    return acc;
  }, {} as Record<string, T[]>);
}

// ─── Store ───────────────────────────────────────────────────────────────────
export const useStore = create<AppStore>()(
  persist(
    (set) => ({
      // UI
      sidebarOpen: true,
      sidebarCollapsed: false,
      activeMenu: 'dashboard',
      expandedMenus: ['contractor'],
      toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
      toggleSidebarCollapse: () => set((s) => ({ sidebarCollapsed: !s.sidebarCollapsed })),
      setActiveMenu: (menu) => set({ activeMenu: menu }),
      toggleExpandedMenu: (menuId) =>
        set((s) => ({
          expandedMenus: s.expandedMenus.includes(menuId)
            ? s.expandedMenus.filter((id) => id !== menuId)
            : [...s.expandedMenus, menuId],
        })),

      // Exhibitor detail navigation
      selectedExhibitor: null,
      activeDetailTab: 'basic',
      setSelectedExhibitor: (e) => set({ selectedExhibitor: e, activeDetailTab: 'basic' }),
      setActiveDetailTab: (tab) => set({ activeDetailTab: tab }),

      // Exhibitors list
      exhibitors: mockExhibitors,
      loading: false,
      setExhibitors: (exhibitors) => set({ exhibitors }),
      addExhibitor: (e) => set((s) => ({ exhibitors: [...s.exhibitors, e] })),
      updateExhibitor: (id, data) =>
        set((s) => ({ exhibitors: s.exhibitors.map((ex) => (ex.id === id ? { ...ex, ...data } : ex)) })),
      deleteExhibitor: (id) =>
        set((s) => ({ exhibitors: s.exhibitors.filter((ex) => ex.id !== id) })),

      // Stalls
      stallsByExhibitor: groupById(mockStalls),
      setStalls: (exhibitorId, stalls) =>
        set((s) => ({ stallsByExhibitor: { ...s.stallsByExhibitor, [exhibitorId]: stalls } })),
      addStall: (stall) =>
        set((s) => ({
          stallsByExhibitor: {
            ...s.stallsByExhibitor,
            [stall.exhibitorId]: [...(s.stallsByExhibitor[stall.exhibitorId] || []), stall],
          },
        })),
      deleteStall: (exhibitorId, stallId) =>
        set((s) => ({
          stallsByExhibitor: {
            ...s.stallsByExhibitor,
            [exhibitorId]: (s.stallsByExhibitor[exhibitorId] || []).filter((st) => st.id !== stallId),
          },
        })),

      // Power
      powerByExhibitor: groupById(mockPowerRequirements),
      setPower: (exhibitorId, items) =>
        set((s) => ({ powerByExhibitor: { ...s.powerByExhibitor, [exhibitorId]: items } })),
      addPower: (item) =>
        set((s) => ({
          powerByExhibitor: {
            ...s.powerByExhibitor,
            [item.exhibitorId]: [...(s.powerByExhibitor[item.exhibitorId] || []), item],
          },
        })),
      deletePower: (exhibitorId, id) =>
        set((s) => ({
          powerByExhibitor: {
            ...s.powerByExhibitor,
            [exhibitorId]: (s.powerByExhibitor[exhibitorId] || []).filter((p) => p.id !== id),
          },
        })),

      // Badges
      badgesByExhibitor: groupById(mockBadges),
      setBadges: (exhibitorId, badges) =>
        set((s) => ({ badgesByExhibitor: { ...s.badgesByExhibitor, [exhibitorId]: badges } })),
      addBadge: (badge) =>
        set((s) => ({
          badgesByExhibitor: {
            ...s.badgesByExhibitor,
            [badge.exhibitorId]: [...(s.badgesByExhibitor[badge.exhibitorId] || []), badge],
          },
        })),
      deleteBadge: (exhibitorId, id) =>
        set((s) => ({
          badgesByExhibitor: {
            ...s.badgesByExhibitor,
            [exhibitorId]: (s.badgesByExhibitor[exhibitorId] || []).filter((b) => b.id !== id),
          },
        })),

      // Contractors (per exhibitor)
      contractorsByExhibitor: groupById(mockContractors),
      setContractors: (exhibitorId, items) =>
        set((s) => ({ contractorsByExhibitor: { ...s.contractorsByExhibitor, [exhibitorId]: items } })),
      addContractor: (item) =>
        set((s) => ({
          contractorsByExhibitor: {
            ...s.contractorsByExhibitor,
            [item.exhibitorId]: [...(s.contractorsByExhibitor[item.exhibitorId] || []), item],
          },
        })),
      approveContractor: (exhibitorId, id) =>
        set((s) => ({
          contractorsByExhibitor: {
            ...s.contractorsByExhibitor,
            [exhibitorId]: (s.contractorsByExhibitor[exhibitorId] || []).map((c) =>
              c.id === id ? { ...c, status: 'approved' as const } : c
            ),
          },
        })),
      deleteContractor: (exhibitorId, id) =>
        set((s) => ({
          contractorsByExhibitor: {
            ...s.contractorsByExhibitor,
            [exhibitorId]: (s.contractorsByExhibitor[exhibitorId] || []).filter((c) => c.id !== id),
          },
        })),

      // Furniture
      furnitureByExhibitor: groupById(mockFurniture),
      setFurniture: (exhibitorId, items) =>
        set((s) => ({ furnitureByExhibitor: { ...s.furnitureByExhibitor, [exhibitorId]: items } })),
      addFurniture: (item) =>
        set((s) => ({
          furnitureByExhibitor: {
            ...s.furnitureByExhibitor,
            [item.exhibitorId]: [...(s.furnitureByExhibitor[item.exhibitorId] || []), item],
          },
        })),
      deleteFurniture: (exhibitorId, id) =>
        set((s) => ({
          furnitureByExhibitor: {
            ...s.furnitureByExhibitor,
            [exhibitorId]: (s.furnitureByExhibitor[exhibitorId] || []).filter((f) => f.id !== id),
          },
        })),

      // Payments (per exhibitor)
      paymentsByExhibitor: groupById(mockPayments),
      setPayments: (exhibitorId, items) =>
        set((s) => ({ paymentsByExhibitor: { ...s.paymentsByExhibitor, [exhibitorId]: items } })),
      addPayment: (item) =>
        set((s) => ({
          paymentsByExhibitor: {
            ...s.paymentsByExhibitor,
            [item.exhibitorId]: [...(s.paymentsByExhibitor[item.exhibitorId] || []), item],
          },
        })),
      deletePayment: (exhibitorId, id) =>
        set((s) => ({
          paymentsByExhibitor: {
            ...s.paymentsByExhibitor,
            [exhibitorId]: (s.paymentsByExhibitor[exhibitorId] || []).filter((p) => p.id !== id),
          },
        })),

      // Brands
      brandsByExhibitor: groupById(mockBrands),
      setBrands: (exhibitorId, brands) =>
        set((s) => ({ brandsByExhibitor: { ...s.brandsByExhibitor, [exhibitorId]: brands } })),
      addBrand: (brand) =>
        set((s) => ({
          brandsByExhibitor: {
            ...s.brandsByExhibitor,
            [brand.exhibitorId]: [...(s.brandsByExhibitor[brand.exhibitorId] || []), brand],
          },
        })),
      deleteBrand: (exhibitorId, id) =>
        set((s) => ({
          brandsByExhibitor: {
            ...s.brandsByExhibitor,
            [exhibitorId]: (s.brandsByExhibitor[exhibitorId] || []).filter((b) => b.id !== id),
          },
        })),

      // Notifications
      notifications: [
        { id: '1', message: 'New exhibitor registration received', type: 'info' as const, read: false, createdAt: '2024-03-10' },
        { id: '2', message: 'Payment pending from Amit Patel', type: 'warning' as const, read: false, createdAt: '2024-03-11' },
        { id: '3', message: 'Stall allocation completed for Hall A', type: 'success' as const, read: true, createdAt: '2024-03-12' },
      ],
      unreadCount: 2,
      addNotification: (n) =>
        set((s) => ({ notifications: [n, ...s.notifications], unreadCount: s.unreadCount + 1 })),
      markAsRead: (id) =>
        set((s) => ({
          notifications: s.notifications.map((n) => (n.id === id ? { ...n, read: true } : n)),
          unreadCount: Math.max(0, s.unreadCount - 1),
        })),
      markAllAsRead: () =>
        set((s) => ({
          notifications: s.notifications.map((n) => ({ ...n, read: true })),
          unreadCount: 0,
        })),
    }),
    {
      name: 'inoptics-store',
      partialize: (s) => ({
        activeMenu: s.activeMenu,
        expandedMenus: s.expandedMenus,
        sidebarCollapsed: s.sidebarCollapsed,
      }),
    }
  )
);
