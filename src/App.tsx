import React, { useState, useEffect } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from './lib/db';
import { seedDatabase } from './lib/seed';
import { UserRole } from './types';
import { Header } from './components/Header';
import { Sidebar, TabType } from './components/Sidebar';
import { PropertiesView } from './components/PropertiesView';
import { LeasesView } from './components/LeasesView';
import { MembersView } from './components/MembersView';
import { BtpMarketplaceView } from './components/BtpMarketplaceView';
import { DomoticsView } from './components/DomoticsView';
import { TransactionsView } from './components/TransactionsView';
import { AuditLogsView } from './components/AuditLogsView';

const PATH_TO_TAB: Record<string, TabType> = {
  '/': 'properties',
  '/properties': 'properties',
  '/leases': 'leases',
  '/members': 'members',
  '/btp': 'btp',
  '/domotics': 'domotics',
  '/transactions': 'transactions',
  '/audit': 'audit'
};

const TAB_TO_PATH: Record<TabType, string> = {
  properties: '/properties',
  leases: '/leases',
  members: '/members',
  btp: '/btp',
  domotics: '/domotics',
  transactions: '/transactions',
  audit: '/audit'
};

// Rôles et onglets autorisés
const ROLE_ALLOWED_TABS: Record<UserRole, TabType[]> = {
  ADMIN_SUPER: ['properties', 'leases', 'members', 'btp', 'domotics', 'transactions', 'audit'],
  PROPRIETAIRE: ['properties', 'leases', 'members', 'btp', 'domotics', 'transactions'],
  LOCATAIRE: ['leases', 'btp', 'domotics', 'transactions'],
  PRESTATAIRE_BTP: ['btp', 'transactions'],
  EMPLOYE: ['properties', 'leases', 'members', 'btp', 'domotics'],
  PROSPECT_ACHETEUR: ['properties', 'transactions']
};

export function App() {
  const [activeTab, setActiveTab] = useState<TabType>(() => {
    const path = window.location.pathname;
    return PATH_TO_TAB[path] || 'properties';
  });
  const [currentRole, setCurrentRole] = useState<UserRole>('ADMIN_SUPER');
  const [isSeeded, setIsSeeded] = useState(false);

  // Seed Dexie database on first render
  useEffect(() => {
    seedDatabase().then(() => setIsSeeded(true));
  }, []);

  // Dexie.js Live Queries for real-time reactivity
  const allProperties = useLiveQuery(() => db.properties.toArray(), []) || [];
  const allLeases = useLiveQuery(() => db.leases.toArray(), []) || [];
  const allUsers = useLiveQuery(() => db.users.toArray(), []) || [];
  const allWorkOrders = useLiveQuery(() => db.workOrders.toArray(), []) || [];
  const allTransactions = useLiveQuery(() => db.transactions.toArray(), []) || [];
  const allPurchaseOffers = useLiveQuery(() => db.purchaseOffers.toArray(), []) || [];
  const allReviews = useLiveQuery(() => db.reviews.toArray(), []) || [];
  const allAuditLogs = useLiveQuery(() => db.auditLogs.toArray(), []) || [];

  // Réajuster l'onglet actif si le rôle changé n'y a pas accès
  useEffect(() => {
    const allowed = ROLE_ALLOWED_TABS[currentRole] || ['properties'];
    if (!allowed.includes(activeTab)) {
      handleTabChange(allowed[0]);
    }
  }, [currentRole]);

  const handleTabChange = (tab: TabType) => {
    setActiveTab(tab);
    const targetPath = TAB_TO_PATH[tab];
    if (window.location.pathname !== targetPath) {
      window.history.pushState(null, '', targetPath);
    }
  };

  useEffect(() => {
    const handlePopState = () => {
      const path = window.location.pathname;
      if (PATH_TO_TAB[path]) {
        setActiveTab(PATH_TO_TAB[path]);
      }
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // -------------------------------------------------------------
  // Dynamic Role-Based Data Filtering (RBAC)
  // -------------------------------------------------------------
  const filteredProperties = allProperties.filter((p) => {
    if (currentRole === 'ADMIN_SUPER' || currentRole === 'EMPLOYE') return true;
    if (currentRole === 'PROPRIETAIRE') return p.clerkOwnerId === 'user_proprio_88776655' || p.clerkOwnerId === 'user_admin_01';
    if (currentRole === 'LOCATAIRE') return p._id === 'prop_villa_cocody';
    if (currentRole === 'PROSPECT_ACHETEUR') return p.listingStatus === 'EN_VENTE';
    if (currentRole === 'PRESTATAIRE_BTP') return p._id === 'prop_villa_cocody';
    return true;
  });

  const filteredLeases = allLeases.filter((l) => {
    if (currentRole === 'ADMIN_SUPER' || currentRole === 'EMPLOYE') return true;
    if (currentRole === 'PROPRIETAIRE') return l.ownerClerkId === 'user_proprio_88776655';
    if (currentRole === 'LOCATAIRE') return l.tenantClerkId === 'user_locataire_11223344';
    return false;
  });

  const filteredWorkOrders = allWorkOrders.filter((wo) => {
    if (currentRole === 'ADMIN_SUPER' || currentRole === 'EMPLOYE') return true;
    if (currentRole === 'PRESTATAIRE_BTP') return wo.assignedBtpProviderId === 'user_btp_998877' || wo.specialtyRequired === 'PLOMBERIE' || wo.specialtyRequired === 'CLIMATISATION';
    if (currentRole === 'LOCATAIRE') return wo.createdByClerkId === 'user_locataire_11223344';
    if (currentRole === 'PROPRIETAIRE') return true;
    return false;
  });

  const filteredTransactions = allTransactions.filter((tx) => {
    if (currentRole === 'ADMIN_SUPER') return true;
    if (currentRole === 'PROPRIETAIRE') return tx.receiverClerkId === 'user_proprio_88776655' || tx.senderClerkId === 'user_proprio_88776655';
    if (currentRole === 'LOCATAIRE') return tx.senderClerkId === 'user_locataire_11223344';
    if (currentRole === 'PRESTATAIRE_BTP') return tx.receiverClerkId === 'user_btp_998877';
    return true;
  });

  if (!isSeeded) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-white space-y-4">
        <div className="w-12 h-12 border-4 border-amber-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-sm font-semibold text-slate-400">Initialisation de la base Dexie.js (IndexedDB)...</p>
      </div>
    );
  }

  const allowedTabs = ROLE_ALLOWED_TABS[currentRole] || ['properties'];

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100">
      {/* Header with Clerk Role Switcher */}
      <Header
        currentRole={currentRole}
        onRoleChange={setCurrentRole}
        syncStatus="synced"
        pendingQueueCount={0}
      />

      {/* Main Layout Container */}
      <div className="flex-1 flex flex-col md:flex-row max-w-[1600px] w-full mx-auto p-4 md:p-6 gap-6">
        {/* Navigation Sidebar filtered by Role */}
        <Sidebar
          activeTab={activeTab}
          onTabChange={handleTabChange}
          allowedTabs={allowedTabs}
          propertiesCount={filteredProperties.length}
          leasesCount={filteredLeases.length}
          membersCount={allUsers.length}
          workOrdersCount={filteredWorkOrders.length}
        />

        {/* Content Area */}
        <main className="flex-1 min-w-0">
          {activeTab === 'properties' && allowedTabs.includes('properties') && (
            <PropertiesView 
              properties={filteredProperties} 
              currentRole={currentRole} 
            />
          )}
          {activeTab === 'leases' && allowedTabs.includes('leases') && (
            <LeasesView 
              leases={filteredLeases} 
              properties={filteredProperties} 
              users={allUsers} 
            />
          )}
          {activeTab === 'members' && allowedTabs.includes('members') && (
            <MembersView users={allUsers} />
          )}
          {activeTab === 'btp' && allowedTabs.includes('btp') && (
            <BtpMarketplaceView 
              workOrders={filteredWorkOrders} 
              reviews={allReviews} 
              users={allUsers} 
              properties={filteredProperties} 
            />
          )}
          {activeTab === 'domotics' && allowedTabs.includes('domotics') && (
            <DomoticsView properties={filteredProperties} />
          )}
          {activeTab === 'transactions' && allowedTabs.includes('transactions') && (
            <TransactionsView 
              transactions={filteredTransactions} 
              purchaseOffers={allPurchaseOffers} 
              properties={filteredProperties} 
              users={allUsers} 
            />
          )}
          {activeTab === 'audit' && allowedTabs.includes('audit') && (
            <AuditLogsView auditLogs={allAuditLogs} users={allUsers} />
          )}
        </main>
      </div>
    </div>
  );
}

export default App;
