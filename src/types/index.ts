export interface MenuItem {
  id: string;
  label: string;
  icon: string;
  path?: string;
  children?: MenuItem[];
}

export interface Exhibitor {
  id: string;
  name: string;
  company: string;
  email: string;
  phone: string;
  stall: string;
  status: 'active' | 'pending' | 'inactive';
  badges: number;
  createdAt: string;
}

export interface Payment {
  id: string;
  exhibitorName: string;
  amount: number;
  status: 'paid' | 'pending' | 'failed';
  date: string;
  method: string;
}

export interface Stall {
  id: string;
  number: string;
  size: string;
  exhibitor?: string;
  status: 'available' | 'booked' | 'reserved';
  hall: string;
}

export interface Contractor {
  id: string;
  name: string;
  company: string;
  email: string;
  phone: string;
  type: string;
  status: 'approved' | 'pending' | 'rejected';
  requestDate: string;
}

export interface Notification {
  id: string;
  message: string;
  type: 'info' | 'warning' | 'success' | 'error';
  read: boolean;
  createdAt: string;
}

export interface DashboardStats {
  totalExhibitors: number;
  totalStalls: number;
  totalPayments: number;
  pendingRequests: number;
  totalRevenue: number;
  occupancyRate: number;
}
