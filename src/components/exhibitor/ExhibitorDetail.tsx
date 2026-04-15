'use client';

import { useStore } from '@/store';
import { ArrowLeft, Building2, Grid3X3, Zap, Medal, HardHat, Armchair, CreditCard, Tag } from 'lucide-react';
import TabBasicDetails from './tabs/TabBasicDetails';
import TabStalls from './tabs/TabStalls';
import TabPowerRequirement from './tabs/TabPowerRequirement';
import TabExhibitorBadges from './tabs/TabExhibitorBadges';
import TabAppointedContractor from './tabs/TabAppointedContractor';
import TabExtraFurniture from './tabs/TabExtraFurniture';
import TabPaymentDetails from './tabs/TabPaymentDetails';
import TabBrands from './tabs/TabBrands';

const TABS = [
  { id: 'basic',       label: 'BASIC DETAILS',               icon: <Building2 size={14} /> },
  { id: 'stalls',      label: 'STALLS',                       icon: <Grid3X3 size={14} /> },
  { id: 'power',       label: 'POWER REQUIREMENT',            icon: <Zap size={14} /> },
  { id: 'badges',      label: 'EXHIBITOR BADGES',             icon: <Medal size={14} /> },
  { id: 'contractor',  label: 'APPOINTED CONTRACTOR',         icon: <HardHat size={14} /> },
  { id: 'furniture',   label: 'EXTRA FURNITURE REQUIREMENT',  icon: <Armchair size={14} /> },
  { id: 'payment',     label: 'PAYMENT DETAILS',              icon: <CreditCard size={14} /> },
  { id: 'brands',      label: 'BRANDS',                       icon: <Tag size={14} /> },
];

export default function ExhibitorDetail({ onBack }: { onBack: () => void }) {
  const { selectedExhibitor, activeDetailTab, setActiveDetailTab } = useStore();
  if (!selectedExhibitor) return null;

  const renderTab = () => {
    switch (activeDetailTab) {
      case 'basic':       return <TabBasicDetails />;
      case 'stalls':      return <TabStalls />;
      case 'power':       return <TabPowerRequirement />;
      case 'badges':      return <TabExhibitorBadges />;
      case 'contractor':  return <TabAppointedContractor />;
      case 'furniture':   return <TabExtraFurniture />;
      case 'payment':     return <TabPaymentDetails />;
      case 'brands':      return <TabBrands />;
      default:            return <TabBasicDetails />;
    }
  };

  return (
    <div className="space-y-4">
      {/* Back + Company header */}
      <div className="flex items-center gap-3">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-800 transition-colors"
        >
          <ArrowLeft size={16} />
          Back to Exhibitors
        </button>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm px-5 py-4">
        <div className="flex flex-col sm:flex-row sm:items-center gap-3">
          <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center shrink-0">
            <span className="text-blue-700 text-lg font-bold">
              {selectedExhibitor.companyName.charAt(0)}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="text-base font-bold text-gray-900 truncate">{selectedExhibitor.companyName}</h2>
            <div className="flex flex-wrap items-center gap-3 mt-1 text-xs text-gray-500">
              <span>Stall: <span className="font-semibold text-gray-700">{selectedExhibitor.stallNo}</span></span>
              <span>Area: <span className="font-semibold text-gray-700">{selectedExhibitor.stallArea}</span></span>
              <span className={`px-2 py-0.5 rounded-full text-xs font-semibold
                ${selectedExhibitor.type === 'B' ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'}
              `}>{selectedExhibitor.type === 'B' ? 'Buyer' : 'Seller'}</span>
              <span className={`px-2 py-0.5 rounded-full text-xs font-semibold
                ${selectedExhibitor.status === 'active' ? 'bg-emerald-100 text-emerald-700' :
                  selectedExhibitor.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                  'bg-red-100 text-red-700'}
              `}>{selectedExhibitor.status}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        {/* Tab nav — horizontal scroll on mobile */}
        <div className="overflow-x-auto border-b border-gray-200">
          <div className="flex min-w-max">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveDetailTab(tab.id)}
                className={`flex items-center gap-1.5 px-4 py-3 text-xs font-semibold whitespace-nowrap border-b-2 transition-colors
                  ${activeDetailTab === tab.id
                    ? 'border-blue-600 text-blue-600 bg-blue-50/50'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'}
                `}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Tab content */}
        <div className="p-5">
          {renderTab()}
        </div>
      </div>
    </div>
  );
}
