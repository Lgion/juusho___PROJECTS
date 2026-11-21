import React from 'react';
import { 
  Building2, 
  FileText, 
  Users, 
  Wrench, 
  Cpu, 
  DollarSign, 
  ShieldCheck, 
  Database 
} from 'lucide-react';

export type TabType = 
  | 'properties'
  | 'leases'
  | 'members'
  | 'btp'
  | 'domotics'
  | 'transactions'
  | 'audit';

interface SidebarProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
  allowedTabs?: TabType[];
  propertiesCount?: number;
  leasesCount?: number;
  membersCount?: number;
  workOrdersCount?: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onTabChange,
  allowedTabs,
  propertiesCount = 0,
  leasesCount = 0,
  membersCount = 0,
  workOrdersCount = 0
}) => {
  const allNavItems: { id: TabType; label: string; icon: React.FC<{ className?: string }>; count?: number }[] = [
    { id: 'properties', label: 'Biens Immobiliers', icon: Building2, count: propertiesCount },
    { id: 'leases', label: 'Baux & Contrats', icon: FileText, count: leasesCount },
    { id: 'members', label: 'Annuaire des Membres', icon: Users, count: membersCount },
    { id: 'btp', label: 'Marketplace BTP', icon: Wrench, count: workOrdersCount },
    { id: 'domotics', label: 'Domotique IoT & Serrures', icon: Cpu },
    { id: 'transactions', label: 'Finances & Loyers', icon: DollarSign },
    { id: 'audit', label: "Journal d'Audit Security", icon: ShieldCheck }
  ];

  const navItems = allowedTabs 
    ? allNavItems.filter(item => allowedTabs.includes(item.id))
    : allNavItems;

  return (
    <aside className="w-full md:w-64 shrink-0 space-y-4">
      <div className="glass-panel p-4 rounded-2xl space-y-2">
        <h3 className="text-[11px] font-extrabold uppercase tracking-wider text-amber-400 px-3 py-1">
          Navigation Principale
        </h3>
        
        <nav className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onTabChange(item.id)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl font-bold text-xs transition-all cursor-pointer ${
                  isActive
                    ? 'bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/20'
                    : 'text-slate-300 hover:bg-slate-900 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-slate-950' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                </div>
                {item.count !== undefined && (
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                      isActive ? 'bg-slate-950 text-amber-300' : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    {item.count}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Local-First Badge */}
      <div className="glass-panel p-4 rounded-2xl border border-amber-500/30 text-xs space-y-2">
        <div className="flex items-center gap-2 text-amber-400 font-bold">
          <Database className="w-4 h-4" />
          <span>Local Engine Active</span>
        </div>
        <p className="text-[11px] text-slate-400 leading-relaxed">
          IndexedDB via Dexie.js 4.0. Lectures instantanées et réactivité hors-ligne.
        </p>
      </div>
    </aside>
  );
};
