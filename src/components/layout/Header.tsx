'use client';

'use client';

import { useStore } from '@/store';
import { usePathname } from 'next/navigation';
import { Menu, Bell, Search, ChevronLeft, ChevronRight, X, Settings, User, LogOut } from 'lucide-react';
import { useState } from 'react';

const routeTitles: Record<string, string> = {
  '/': 'Dashboard',
  '/exhibitor-dashboard': 'Exhibitor Dashboard',
  '/exhibitors': 'Exhibitors',
  '/exhibitors/promotes-brands': 'Promotes Your Brands',
  '/exhibitors/fascia-name': 'Fascia Name',
  '/exhibitors/exhibitor-power': 'Exhibitor Power',
  '/exhibitors/exhibitor-history': 'Exhibitor History',
  '/exhibitors/exhibitor-badges': 'Exhibitor Badges',
  '/exhibitors/extra-furniture': 'Extra Furniture',
  '/exhibitors/contractor-badges': 'Contractor Badges',
  '/exhibitors/mandatory-forms': 'Exhibitor Mandatory Forms',
  '/exhibitors/unlock-contractor': 'Unlock Contractor',
  '/payments': 'Payments',
  '/communication': 'Communication',
  '/stalls-management': 'Stalls Management',
  '/forms': 'Forms',
  '/masters': 'Masters',
  '/website-management': 'Website Management',
  '/contractor': 'Contractor',
  '/contractor/new-exhibitor-request': 'New Exhibitor Request',
  '/contractor/export-contractor': 'Export Contractor',
  '/contact-support': 'Contact Support',
  '/media': 'Media',
  '/export': 'Export',
};

export default function Header() {
  const { toggleSidebar, toggleSidebarCollapse, sidebarCollapsed, notifications, unreadCount, markAllAsRead } = useStore();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const pathname = usePathname();
  const pageTitle = routeTitles[pathname] ?? 'Dashboard';

  return (
    <header className="h-14 bg-white border-b border-gray-200 flex items-center justify-between px-4 lg:px-5 sticky top-0 z-10 shadow-sm">
      {/* Left */}
      <div className="flex items-center gap-2">
        <button onClick={toggleSidebar}
          className="p-1.5 rounded-lg text-gray-500 hover:bg-gray-100 transition-colors lg:hidden">
          <Menu size={19} />
        </button>
        <button onClick={toggleSidebarCollapse}
          className="p-1.5 rounded-lg text-gray-500 hover:bg-gray-100 transition-colors hidden lg:flex">
          {sidebarCollapsed ? <ChevronRight size={17} /> : <ChevronLeft size={17} />}
        </button>
        <h2 className="text-sm font-semibold text-gray-900">{pageTitle}</h2>
      </div>

      {/* Right */}
      <div className="flex items-center gap-1.5">
        {/* Search — desktop */}
        <div className="hidden md:flex items-center gap-2 bg-gray-100 rounded-lg px-3 py-1.5">
          <Search size={14} className="text-gray-400" />
          <input type="text" placeholder="Search..." className="bg-transparent text-xs text-gray-700 outline-none w-40 placeholder-gray-400" />
        </div>
        {/* Search — mobile */}
        <button onClick={() => setSearchOpen(!searchOpen)}
          className="p-1.5 rounded-lg text-gray-500 hover:bg-gray-100 transition-colors md:hidden">
          <Search size={18} />
        </button>

        {/* Notifications */}
        <div className="relative">
          <button onClick={() => { setShowNotifications(!showNotifications); setShowProfile(false); }}
            className="relative p-1.5 rounded-lg text-gray-500 hover:bg-gray-100 transition-colors">
            <Bell size={18} />
            {unreadCount > 0 && (
              <span className="absolute top-0.5 right-0.5 w-3.5 h-3.5 bg-red-500 text-white text-[9px] rounded-full flex items-center justify-center font-bold">
                {unreadCount}
              </span>
            )}
          </button>
          {showNotifications && (
            <div className="absolute right-0 top-11 w-72 bg-white rounded-xl shadow-xl border border-gray-200 z-50">
              <div className="flex items-center justify-between px-4 py-2.5 border-b border-gray-100">
                <span className="text-xs font-semibold text-gray-800">Notifications</span>
                <button onClick={markAllAsRead} className="text-[11px] text-blue-600 hover:text-blue-700 font-medium">Mark all read</button>
              </div>
              <div className="max-h-64 overflow-y-auto">
                {notifications.map((n) => (
                  <div key={n.id} className={`px-4 py-2.5 border-b border-gray-50 hover:bg-gray-50 transition-colors ${!n.read ? 'bg-blue-50/40' : ''}`}>
                    <div className="flex items-start gap-2.5">
                      <div className={`w-1.5 h-1.5 mt-1.5 rounded-full shrink-0 ${n.type === 'info' ? 'bg-blue-500' : n.type === 'warning' ? 'bg-yellow-500' : n.type === 'success' ? 'bg-green-500' : 'bg-red-500'}`} />
                      <div>
                        <p className="text-xs text-gray-700">{n.message}</p>
                        <p className="text-[11px] text-gray-400 mt-0.5">{n.createdAt}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Profile */}
        <div className="relative">
          <button onClick={() => { setShowProfile(!showProfile); setShowNotifications(false); }}
            className="flex items-center gap-2 p-1 rounded-lg hover:bg-gray-100 transition-colors">
            <div className="w-7 h-7 bg-blue-600 rounded-full flex items-center justify-center">
              <span className="text-white text-xs font-bold">A</span>
            </div>
            <span className="hidden sm:block text-xs font-semibold text-gray-800">Admin</span>
          </button>
          {showProfile && (
            <div className="absolute right-0 top-11 w-44 bg-white rounded-xl shadow-xl border border-gray-200 z-50 py-1">
              <button className="w-full flex items-center gap-2.5 px-4 py-2 text-xs text-gray-700 hover:bg-gray-50 transition-colors"><User size={14} className="text-gray-400" />Profile</button>
              <button className="w-full flex items-center gap-2.5 px-4 py-2 text-xs text-gray-700 hover:bg-gray-50 transition-colors"><Settings size={14} className="text-gray-400" />Settings</button>
              <div className="border-t border-gray-100 my-1" />
              <button className="w-full flex items-center gap-2.5 px-4 py-2 text-xs text-red-500 hover:bg-red-50 transition-colors"><LogOut size={14} />Logout</button>
            </div>
          )}
        </div>
      </div>

      {/* Mobile search bar */}
      {searchOpen && (
        <div className="absolute top-14 left-0 right-0 bg-white border-b border-gray-200 px-4 py-2 flex items-center gap-2 z-20 md:hidden">
          <Search size={14} className="text-gray-400" />
          <input autoFocus type="text" placeholder="Search..." className="bg-transparent text-sm text-gray-700 outline-none flex-1 placeholder-gray-400" />
          <button onClick={() => setSearchOpen(false)}><X size={16} className="text-gray-400" /></button>
        </div>
      )}
    </header>
  );
}
