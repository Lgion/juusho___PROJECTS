import React, { useState } from 'react';
import { UserProfile, UserRole } from '../types';
import { 
  Users, 
  Phone, 
  Mail, 
  Search,
  Wrench,
  ShieldCheck,
  CheckSquare,
  Square
} from 'lucide-react';

interface MembersViewProps {
  users: UserProfile[];
}

type DirectoryTab = 'PROPRIETAIRE' | 'LOCATAIRE' | 'PROSPECT_ACHETEUR' | 'PRESTATAIRE_BTP' | 'EMPLOYE';

export const MembersView: React.FC<MembersViewProps> = ({ users }) => {
  const [activeTab, setActiveTab] = useState<DirectoryTab>('PROPRIETAIRE');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchAllTabs, setSearchAllTabs] = useState(false);

  const filteredUsers = users.filter((u) => {
    const matchesTab = searchAllTabs || u.roles.includes(activeTab as UserRole) || u.primaryRole === activeTab;
    const matchesSearch = `${u.firstName} ${u.lastName}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          u.phoneNumber.includes(searchQuery);
    return matchesTab && matchesSearch;
  });

  const tabs: { id: DirectoryTab; label: string; count: number }[] = [
    { id: 'PROPRIETAIRE', label: 'Propriétaires', count: users.filter(u => u.roles.includes('PROPRIETAIRE')).length },
    { id: 'LOCATAIRE', label: 'Locataires', count: users.filter(u => u.roles.includes('LOCATAIRE')).length },
    { id: 'PROSPECT_ACHETEUR', label: 'Prospects & Acheteurs', count: users.filter(u => u.roles.includes('PROSPECT_ACHETEUR')).length },
    { id: 'PRESTATAIRE_BTP', label: 'Prestataires BTP', count: users.filter(u => u.roles.includes('PRESTATAIRE_BTP')).length },
    { id: 'EMPLOYE', label: 'Employés & Gestionnaires', count: users.filter(u => u.roles.includes('EMPLOYE')).length }
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-white flex items-center gap-2">
            <Users className="w-6 h-6 text-amber-400" />
            Annuaire Unifié des Membres
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Répertoire étanche scindé par rôle principal et secondaire. Support multi-rôles Clerk.
          </p>
        </div>

        <div className="flex flex-col gap-2 w-full sm:w-auto">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1-2 -translate-y-1-2" />
            <input
              type="text"
              placeholder="Chercher par nom, email, tél..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
            />
          </div>

          <label className="flex items-center gap-2 text-xs text-slate-400 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={searchAllTabs}
              onChange={(e) => setSearchAllTabs(e.target.checked)}
              className="accent-amber-500 cursor-pointer"
            />
            <span className={searchAllTabs ? "text-amber-300 font-bold" : ""}>
              Rechercher dans tous les onglets (Propriétaires, Locataires, Artisans, etc.)
            </span>
          </label>
        </div>
      </div>

      {/* 5-Tab Navigation Bar */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-2 overflow-x-auto">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => {
              setActiveTab(tab.id);
            }}
            className={`flex items-center gap-2 px-4 py-2-5 rounded-xl font-bold text-xs whitespace-nowrap transition-all cursor-pointer ${
              activeTab === tab.id && !searchAllTabs
                ? 'bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/20'
                : 'bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <span>{tab.label}</span>
            <span className={`px-2 py-0-5 rounded-full text-10px ${
              activeTab === tab.id && !searchAllTabs ? 'bg-slate-950 text-amber-300' : 'bg-slate-800 text-slate-400'
            }`}>
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* User Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredUsers.map((user) => (
          <div key={user._id} className="glass-card rounded-2xl p-5 space-y-4 flex flex-col justify-between">
            <div className="space-y-3">
              {/* Header card with name & badges */}
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-amber-500 to-amber-300 text-slate-950 font-extrabold flex items-center justify-center text-sm shadow-md">
                    {user.firstName[0]}{user.lastName[0]}
                  </div>
                  <div>
                    <h3 className="font-bold text-white text-base flex items-center gap-1.5">
                      {user.firstName} {user.lastName}
                      {user.isAdminSuper && (
                        <span title="Super Administrateur">
                          <ShieldCheck className="w-4 h-4 text-purple-400" />
                        </span>
                      )}
                    </h3>
                    <div className="flex flex-wrap gap-1 mt-0-5">
                      {user.roles.map(r => (
                        <span key={r} className="text-10px font-semibold px-2 py-0-5 rounded-md bg-slate-900 text-amber-300 border border-slate-800">
                          {r}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Contact info */}
              <div className="space-y-1-5 pt-2 text-xs text-slate-400">
                <div className="flex items-center gap-2">
                  <Mail className="w-3-5 h-3-5 text-slate-500" />
                  <span>{user.email}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="w-3-5 h-3-5 text-slate-500" />
                  <span>{user.phoneNumber}</span>
                </div>
              </div>

              {/* Specific details depending on tab */}
              {user.btpDetails && (
                <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800/80 space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-amber-300 flex items-center gap-1">
                      <Wrench className="w-3-5 h-3-5" />
                      {user.btpDetails.companyName}
                    </span>
                    {user.btpDetails.isVerified && (
                      <span className="text-10px text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0-5 rounded border border-emerald-500/30">
                        Vérifié
                      </span>
                    )}
                  </div>
                  <div className="flex items-center justify-between text-slate-400">
                    <span>Note globale:</span>
                    <span className="font-bold text-amber-400 flex items-center gap-1">
                      ★ {user.btpDetails.ratingAverage} / 5
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-slate-400">
                    <span>Tarif indicatif:</span>
                    <span className="font-bold text-white">
                      {user.btpDetails.hourlyRate.toLocaleString()} FCFA / h
                    </span>
                  </div>
                </div>
              )}

              {user.employeeDetails && (
                <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800/80 space-y-1-5 text-xs">
                  <div className="flex items-center justify-between text-slate-400">
                    <span>Salaire mensuel:</span>
                    <span className="font-bold text-emerald-400">
                      {user.employeeDetails.monthlySalary.toLocaleString()} FCFA
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-slate-400">
                    <span>Biens assignés:</span>
                    <span className="font-bold text-white">
                      {user.employeeDetails.assignedPropertiesIds.length} biens
                    </span>
                  </div>
                </div>
              )}
            </div>

            <button className="w-full mt-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 text-xs font-semibold transition-all cursor-pointer">
              Voir la Fiche Détaillée
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};
