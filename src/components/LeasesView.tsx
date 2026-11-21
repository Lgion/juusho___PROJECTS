import React, { useState } from 'react';
import { Lease, Property, UserProfile } from '../types';
import { FileText, Calendar, DollarSign, Download, CheckCircle2, Clock, AlertTriangle, Building2, User, Plus } from 'lucide-react';
import { AddLeaseModal } from './Modals';

interface LeasesViewProps {
  leases: Lease[];
  properties: Property[];
  users: UserProfile[];
}

export const LeasesView: React.FC<LeasesViewProps> = ({ leases, properties, users }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const getPropertyTitle = (propId: string) => {
    return properties.find(p => p._id === propId)?.title || 'Bien non trouvé';
  };

  const getUserName = (clerkId: string) => {
    const u = users.find(user => user.clerkUserId === clerkId || user._id === clerkId);
    return u ? `${u.firstName} ${u.lastName}` : clerkId;
  };

  const getStatusBadge = (status: Lease['leaseStatus']) => {
    switch (status) {
      case 'ACTIF':
        return <span className="badge-status bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"><CheckCircle2 className="w-3 h-3" /> Bail Actif</span>;
      case 'PREAVIS':
        return <span className="badge-status bg-amber-500/20 text-amber-300 border border-amber-500/30"><Clock className="w-3 h-3" /> En Préavis</span>;
      case 'EN_ATTENTE_SIGNATURE':
        return <span className="badge-status bg-sky-500/20 text-sky-300 border border-sky-500/30"><Clock className="w-3 h-3" /> Attente Signature</span>;
      case 'EXPIRE':
        return <span className="badge-status bg-rose-500/20 text-rose-300 border border-rose-500/30"><AlertTriangle className="w-3 h-3" /> Expiré</span>;
      default:
        return <span className="badge-status bg-slate-500/20 text-slate-300 border border-slate-500/30">{status}</span>;
    }
  };

  const handleGenerateQuittance = (lease: Lease) => {
    const tenantName = getUserName(lease.tenantClerkId);
    const propTitle = getPropertyTitle(lease.propertyId);
    alert(`📄 QUITTANCE DE LOYER (GED - GESTION ÉLECTRONIQUE DE DOCUMENTS)\n\nLa GED désigne le système de gestion documentaire centralisé de Juusho.\n\nFichier: Quittance_Loyer_${lease._id}.pdf\nLocataire: ${tenantName}\nBien: ${propTitle}\nLoyer pur: ${lease.monthlyRent.toLocaleString()} FCFA\nCharges locatives: ${lease.charges.toLocaleString()} FCFA\nTotal Encaissé: ${(lease.monthlyRent + lease.charges).toLocaleString()} FCFA\n\nLe document PDF de la quittance a été généré et archivé dans la GED.`);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-white flex items-center gap-2">
            <FileText className="w-6 h-6 text-amber-400" />
            Gestion des Baux Locatifs & Quittances
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Contrats locatifs juridiquement valides, renouvellements tacites, dépôts de garantie & GED (Gestion Électronique de Documents).
          </p>
        </div>

        <button 
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-lg shadow-amber-500/20 transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" /> Établir un Nouveau Bail
        </button>
      </div>

      {/* Leases Table / List */}
      <div className="space-y-4">
        {leases.map((lease) => (
          <div key={lease._id} className="glass-panel p-5 rounded-2xl border border-slate-800/80 hover:border-slate-700 transition-all space-y-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800/80 pb-4">
              <div>
                <div className="flex items-center gap-2">
                  {getStatusBadge(lease.leaseStatus)}
                  <span className="text-xs font-mono text-slate-500">ID: {lease._id}</span>
                </div>
                <h3 className="text-lg font-bold text-white mt-1 flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-amber-400" />
                  {getPropertyTitle(lease.propertyId)}
                </h3>
              </div>

              <button
                onClick={() => handleGenerateQuittance(lease)}
                className="flex items-center gap-2 px-3-5 py-2 rounded-xl bg-slate-900 border border-slate-700 hover:border-amber-500 text-amber-300 text-xs font-semibold transition-all cursor-pointer"
              >
                <Download className="w-4 h-4" />
                Générer Quittance PDF (GED)
              </button>
            </div>

            {/* Grid stats */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
              <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/60 space-y-1">
                <span className="text-slate-500 flex items-center gap-1-5 font-medium">
                  <User className="w-3-5 h-3-5 text-amber-400" /> Locataire Titulaire
                </span>
                <p className="font-bold text-white text-sm">{getUserName(lease.tenantClerkId)}</p>
              </div>

              <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/60 space-y-1">
                <span className="text-slate-500 flex items-center gap-1-5 font-medium">
                  <Calendar className="w-3-5 h-3-5 text-amber-400" /> Période de Validité
                </span>
                <p className="font-bold text-slate-200">
                  {new Date(lease.startDate).toLocaleDateString('fr-FR')} → {new Date(lease.endDate).toLocaleDateString('fr-FR')}
                </p>
              </div>

              <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/60 space-y-1">
                <span className="text-slate-500 flex items-center gap-1-5 font-medium">
                  <DollarSign className="w-3-5 h-3-5 text-amber-400" /> Loyer Mensuel + Charges
                </span>
                <p className="font-extrabold text-amber-400 text-sm">
                  {lease.monthlyRent.toLocaleString()} FCFA <span className="text-slate-400 font-normal text-xs">(+{lease.charges.toLocaleString()} ch.)</span>
                </p>
              </div>

              <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/60 space-y-1">
                <span className="text-slate-500 flex items-center gap-1-5 font-medium">
                  <Clock className="w-3-5 h-3-5 text-amber-400" /> Type & Préavis
                </span>
                <p className="font-bold text-slate-200">
                  {lease.renewalType.replace('_', ' ')} ({lease.noticePeriodMonths} mois)
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <AddLeaseModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </div>
  );
};
