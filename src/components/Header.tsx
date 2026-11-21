import React from 'react';
import { UserRole } from '../types';
import { ShieldCheck, Wifi, RefreshCw, UserCheck, Bell, Sparkles } from 'lucide-react';

interface HeaderProps {
  currentRole: UserRole;
  onRoleChange: (role: UserRole) => void;
  syncStatus: 'synced' | 'syncing' | 'offline';
  pendingQueueCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  currentRole,
  onRoleChange,
  syncStatus,
  pendingQueueCount
}) => {
  const roles: { value: UserRole; label: string; badgeColor: string }[] = [
    { value: 'ADMIN_SUPER', label: 'Admin Super (Cyril Raymond)', badgeColor: 'bg-purple-500/20 text-purple-300 border-purple-500/30' },
    { value: 'PROPRIETAIRE', label: 'Propriétaire (Jean-Marc Kouassi)', badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-500/30' },
    { value: 'LOCATAIRE', label: 'Locataire (Amine Diallo)', badgeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' },
    { value: 'PRESTATAIRE_BTP', label: 'Artisan BTP (Koffi Brou)', badgeColor: 'bg-blue-500/20 text-blue-300 border-blue-500/30' },
    { value: 'EMPLOYE', label: 'Gestionnaire (Yves Konan)', badgeColor: 'bg-sky-500/20 text-sky-300 border-sky-500/30' },
    { value: 'PROSPECT_ACHETEUR', label: 'Prospect (Sarah Traoré)', badgeColor: 'bg-pink-500/20 text-pink-300 border-pink-500/30' }
  ];

  return (
    <header className="sticky top-0 z-50 glass-panel border-b border-slate-800/80 px-6 py-3.5 flex flex-col md:flex-row items-center justify-between gap-4">
      {/* Brand logo & tagline */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 via-amber-500 to-amber-700 flex items-center justify-center shadow-lg shadow-amber-500/20 ring-1 ring-amber-300/40">
          <Sparkles className="w-6 h-6 text-slate-950 stroke-[2.5]" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-extrabold tracking-tight text-white font-serif">
              JUUSHO <span className="text-gold-gradient font-sans font-light text-base uppercase tracking-widest ml-1">Real Estate</span>
            </h1>
            <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-400 border border-amber-500/30">
              Local-First
            </span>
          </div>
          <p className="text-xs text-slate-400 font-medium">Gestion Immobilière & Domotique Intelligente</p>
        </div>
      </div>

      {/* Sync status & Role switcher */}
      <div className="flex items-center flex-wrap gap-4">
        {/* Dexie Sync Indicator */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-900/80 border border-slate-800 text-xs">
          {syncStatus === 'synced' && (
            <>
              <Wifi className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-slate-300 font-medium">Dexie ↔ Cloud Synchro</span>
            </>
          )}
          {syncStatus === 'syncing' && (
            <>
              <RefreshCw className="w-3.5 h-3.5 text-amber-400 animate-spin" />
              <span className="text-amber-300 font-medium">Synchro ({pendingQueueCount} en attente)</span>
            </>
          )}
        </div>

        {/* Notifications badge */}
        <button className="relative p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-white hover:border-slate-700 transition-colors">
          <Bell className="w-4 h-4" />
          <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse" />
        </button>

        {/* Role Selector Simulation */}
        <div className="flex items-center gap-2 bg-slate-900/90 p-1 rounded-xl border border-slate-800">
          <UserCheck className="w-4 h-4 text-amber-400 ml-2 hidden sm:inline" />
          <span className="text-xs text-slate-400 hidden sm:inline font-medium">Profil simulé:</span>
          <select
            value={currentRole}
            onChange={(e) => onRoleChange(e.target.value as UserRole)}
            className="bg-slate-950 text-xs font-semibold text-white px-3 py-1.5 rounded-lg border border-slate-700 focus:outline-none focus:border-amber-500 cursor-pointer"
          >
            {roles.map((r) => (
              <option key={r.value} value={r.value}>
                {r.label}
              </option>
            ))}
          </select>
        </div>
      </div>
    </header>
  );
};
