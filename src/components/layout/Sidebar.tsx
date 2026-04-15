'use client';

import { useStore } from '@/store';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import {
  LayoutDashboard,
  Monitor,
  Users,
  Megaphone,
  AlignLeft,
  Power,
  History,
  Medal,
  Armchair,
  HardHat,
  FileText,
  Unlock,
  CreditCard,
  MessageCircle,
  LayoutGrid,
  ClipboardList,
  Database,
  Globe,
  Wrench,
  UserPlus,
  Download,
  Phone,
  Image,
  LogOut,
  ChevronDown,
  ChevronRight,
  Menu,
  X,
} from 'lucide-react';
import LogoutModal from '@/components/ui/LogoutModal';

interface NavItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  href?: string;
  children?: NavItem[];
  color?: string;
}

const navItems: NavItem[] = [
  { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard size={16} />, href: '/' },
  { id: 'exhibitor-dashboard', label: 'Exhibitor Dashboard', icon: <Monitor size={16} />, href: '/exhibitor-dashboard' },
  { id: 'exhibitors', label: 'Exhibitors', icon: <Users size={16} />, href: '/exhibitors' },
  { id: 'promotes-brands', label: 'Promotes Your Brands', icon: <Megaphone size={16} />, href: '/exhibitors/promotes-brands' },
  { id: 'fascia-name', label: 'Fascia Name', icon: <AlignLeft size={16} />, href: '/exhibitors/fascia-name' },
  { id: 'exhibitor-power', label: 'Exhibitor Power', icon: <Power size={16} />, href: '/exhibitors/exhibitor-power' },
  { id: 'exhibitor-history', label: 'Exhibitor History', icon: <History size={16} />, href: '/exhibitors/exhibitor-history' },
  { id: 'exhibitor-badges', label: 'Exhibitor Badges', icon: <Medal size={16} />, href: '/exhibitors/exhibitor-badges' },
  { id: 'extra-furniture', label: 'Extra Furniture', icon: <Armchair size={16} />, href: '/exhibitors/extra-furniture' },
  { id: 'contractor-badges', label: 'Contractor Badges', icon: <HardHat size={16} />, href: '/exhibitors/contractor-badges' },
  { id: 'mandatory-forms', label: 'Exhibitor Mandotary Forms', icon: <FileText size={16} />, href: '/exhibitors/mandatory-forms' },
  { id: 'unlock-contractor', label: 'Unlock Contractor', icon: <Unlock size={16} />, href: '/exhibitors/unlock-contractor' },
  { id: 'payments', label: 'Payments', icon: <CreditCard size={16} />, href: '/payments' },
  { id: 'communication', label: 'Communication', icon: <MessageCircle size={16} />, href: '/communication' },
  { id: 'stalls-management', label: 'Stalls-Management', icon: <LayoutGrid size={16} />, href: '/stalls-management' },
  { id: 'forms', label: 'Forms', icon: <ClipboardList size={16} />, href: '/forms' },
  { id: 'masters', label: 'Masters', icon: <Database size={16} />, href: '/masters' },
  { id: 'website-management', label: 'Website Management', icon: <Globe size={16} />, href: '/website-management' },
  {
    id: 'contractor',
    label: 'Contractor',
    icon: <Wrench size={16} />,
    children: [
      { id: 'new-exhibitor-request', label: 'New Exhibitor Request', icon: <UserPlus size={16} />, href: '/contractor/new-exhibitor-request', color: 'text-emerald-400' },
      { id: 'export-contractor', label: 'Export Contractor', icon: <Download size={16} />, href: '/contractor/export-contractor' },
    ],
  },
  { id: 'contact-support', label: 'Contact Support', icon: <Phone size={16} />, href: '/contact-support' },
  { id: 'media', label: 'Media', icon: <Image size={16} />, href: '/media' },
  { id: 'export', label: 'Export', icon: <Download size={16} />, href: '/export' },
];

export default function Sidebar() {
  const { sidebarOpen, sidebarCollapsed, expandedMenus, toggleSidebar, toggleExpandedMenu, setActiveMenu } = useStore();
  const [showLogout, setShowLogout] = useState(false);
  const pathname = usePathname();

  const isActive = (href?: string) => {
    if (!href) return false;
    if (href === '/') return pathname === '/';
    return pathname === href;
  };

  const renderItem = (item: NavItem) => {
    const hasChildren = item.children && item.children.length > 0;
    const isExpanded = expandedMenus.includes(item.id);
    const active = isActive(item.href);
    const childActive = item.children?.some((c) => isActive(c.href));

    if (hasChildren) {
      return (
        <div key={item.id}>
          <button
            onClick={() => toggleExpandedMenu(item.id)}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors group
              ${childActive ? 'text-white' : 'text-slate-400 hover:text-white hover:bg-white/5'}
              ${sidebarCollapsed ? 'justify-center' : ''}
            `}
          >
            <span className={`flex-shrink-0 ${childActive ? 'text-white' : 'text-slate-400 group-hover:text-white'}`}>{item.icon}</span>
            {!sidebarCollapsed && (
              <>
                <span className="flex-1 text-left">{item.label}</span>
                <span className="text-slate-500">{isExpanded ? <ChevronDown size={13} /> : <ChevronRight size={13} />}</span>
              </>
            )}
          </button>
          {isExpanded && !sidebarCollapsed && (
            <div className="mt-0.5 ml-6 border-l border-slate-700 pl-3 space-y-0.5">
              {item.children!.map((child) => {
                const childActive = isActive(child.href);
                return (
                  <Link
                    key={child.id}
                    href={child.href!}
                    onClick={() => setActiveMenu(child.id)}
                    className={`flex items-center gap-2.5 px-2 py-1.5 rounded-md text-[13px] transition-colors
                      ${childActive ? 'bg-blue-600 text-white' : `${child.color || 'text-slate-400'} hover:text-white hover:bg-white/5`}
                    `}
                  >
                    {child.icon}
                    <span>{child.label}</span>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      );
    }

    return (
      <Link
        key={item.id}
        href={item.href!}
        onClick={() => setActiveMenu(item.id)}
        className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors group
          ${active ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white hover:bg-white/5'}
          ${sidebarCollapsed ? 'justify-center' : ''}
        `}
      >
        <span className={`flex-shrink-0 ${active ? 'text-white' : 'text-slate-400 group-hover:text-white'}`}>{item.icon}</span>
        {!sidebarCollapsed && <span className="truncate">{item.label}</span>}
      </Link>
    );
  };

  return (
    <>
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/60 z-20 lg:hidden" onClick={toggleSidebar} />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 h-full z-30 flex flex-col transition-all duration-300 ease-in-out
          bg-[#0f1117] border-r border-slate-800
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
          ${sidebarCollapsed ? 'w-14' : 'w-56'}
        `}
      >
        {/* Logo */}
        <div className={`flex items-center gap-2.5 px-3 py-4 border-b border-slate-800 ${sidebarCollapsed ? 'justify-center' : ''}`}>
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
            <span className="text-white text-xs font-bold">IO</span>
          </div>
          {!sidebarCollapsed && (
            <div className="min-w-0">
              <h1 className="text-sm font-bold text-white leading-none">InOptics</h1>
              <p className="text-[10px] text-slate-500 mt-0.5">Admin Panel</p>
            </div>
          )}
          <button onClick={toggleSidebar} className="ml-auto lg:hidden text-slate-400 hover:text-white">
            <X size={16} />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-0.5 scrollbar-thin scrollbar-thumb-slate-700">
          {navItems.map((item) => renderItem(item))}
        </nav>

        {/* Logout */}
        <div className="px-2 py-3 border-t border-slate-800">
          <button
            onClick={() => setShowLogout(true)}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-colors
              ${sidebarCollapsed ? 'justify-center' : ''}
            `}
          >
            <LogOut size={16} />
            {!sidebarCollapsed && <span>Logout</span>}
          </button>
        </div>
      </aside>

      <LogoutModal open={showLogout} onClose={() => setShowLogout(false)} />
    </>
  );
}
