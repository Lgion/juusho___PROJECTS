import React, { useState } from 'react';
import { WorkOrder, Review, UserProfile, Property } from '../types';
import { db } from '../lib/db';
import { resetAndSeedDatabase } from '../lib/seed';
import { Wrench, ShieldCheck, CheckCircle2, Star, DollarSign, Image, Plus, RefreshCcw } from 'lucide-react';
import { AddWorkOrderModal } from './Modals';

interface BtpMarketplaceViewProps {
  workOrders: WorkOrder[];
  reviews: Review[];
  users: UserProfile[];
  properties: Property[];
}

export const BtpMarketplaceView: React.FC<BtpMarketplaceViewProps> = ({ workOrders, reviews, users, properties }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isResetting, setIsResetting] = useState(false);

  const getBtpArtisanName = (artisanClerkId?: string) => {
    if (!artisanClerkId) return 'Non attribué';
    const u = users.find(user => user.clerkUserId === artisanClerkId || user._id === artisanClerkId);
    return u ? `${u.firstName} ${u.lastName} (${u.btpDetails?.companyName || 'Artisan'})` : artisanClerkId;
  };

  const handleEscrowRelease = async (wo: WorkOrder) => {
    await db.workOrders.update(wo._id, {
      status: 'VALIDE_PAYE',
      completedAt: new Date().toISOString()
    });

    await db.auditLogs.add({
      _id: `log_${Date.now()}`,
      actorClerkId: "user_proprio_88776655",
      action: "VIREMENT_SEQUESTRE",
      targetEntityType: "WorkOrder",
      targetEntityId: wo._id,
      metadata: { amount: wo.quoteAmount, status: "VALIDE_PAYE" },
      timestamp: new Date().toISOString()
    });

    alert(`💰 SÉQUESTRE ESCROW LIBÉRÉ AVEC SUCCÈS !\n\nIntervention: ${wo.title}\nMontant: ${wo.quoteAmount?.toLocaleString()} FCFA\nArtisan: ${getBtpArtisanName(wo.assignedBtpProviderId)}\n\nLe statut est désormais passé en "VALIDE_PAYE" et consigné dans le journal d'audit !`);
  };

  const handleResetData = async () => {
    setIsResetting(true);
    await resetAndSeedDatabase();
    setIsResetting(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-white flex items-center gap-2">
            <Wrench className="w-6 h-6 text-amber-400" />
            Marketplace BTP & Interventions Sous Séquestre
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Demandes de travaux, blocage de fonds sous séquestre Escrow & déblocage sur validation photos "Avant/Après".
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button 
            onClick={handleResetData}
            disabled={isResetting}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 font-semibold text-xs transition-all cursor-pointer"
            title="Réinitialise les données de test dans IndexedDB"
          >
            <RefreshCcw className={`w-3.5 h-3.5 text-amber-400 ${isResetting ? 'animate-spin' : ''}`} />
            <span>Réinitialiser Données Séquestre</span>
          </button>

          <button 
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-lg shadow-amber-500/20 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" /> Publier un Besoin
          </button>
        </div>
      </div>

      {/* Active Work Orders */}
      <div className="space-y-4">
        {workOrders.map((wo) => {
          const isEscrowPending = wo.status === 'ACCEPTE_ESCROW' || wo.status === 'EN_COURS' || wo.status === 'DEMANDE_SOUMISE';

          return (
            <div key={wo._id} className={`glass-panel p-5 rounded-2xl border space-y-4 ${isEscrowPending ? 'border-amber-500/50 bg-amber-500/5' : 'border-slate-800'}`}>
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800/80 pb-4">
                <div>
                  <div className="flex items-center gap-2">
                    {isEscrowPending ? (
                      <span className="badge-status bg-amber-500/20 text-amber-300 border border-amber-500/40 font-bold">
                        <ShieldCheck className="w-4 h-4 text-amber-400" /> 🔐 FONDS BLOQUÉS SOUS SÉQUESTRE ESCROW ({wo.quoteAmount?.toLocaleString()} FCFA)
                      </span>
                    ) : (
                      <span className="badge-status bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                        <CheckCircle2 className="w-3-5 h-3-5 text-emerald-400" /> Travaux Valides & Libérés
                      </span>
                    )}
                    <span className="text-10px font-extrabold uppercase px-2 py-0-5 rounded bg-slate-800 text-slate-400">
                      Spécialité: {wo.specialtyRequired}
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-white mt-2">{wo.title}</h3>
                  <p className="text-xs text-slate-400 mt-0-5">Artisan assigné : <span className="text-slate-200 font-semibold">{getBtpArtisanName(wo.assignedBtpProviderId)}</span></p>
                </div>

                {isEscrowPending ? (
                  <button
                    onClick={() => handleEscrowRelease(wo)}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold text-xs shadow-lg shadow-emerald-500/30 transition-all cursor-pointer animate-pulse"
                  >
                    <DollarSign className="w-4.5 h-4.5" /> Valider Travaux & Libérer Fond Séquestre
                  </button>
                ) : (
                  <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold bg-emerald-500/10 px-3-5 py-2 rounded-xl border border-emerald-500/30">
                    <CheckCircle2 className="w-4 h-4" /> Fonds Libérés sur le Compte Artisan
                  </div>
                )}
              </div>

              {/* Description & Financial details */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                <div className="md:col-span-2 p-3 rounded-xl bg-slate-950/60 border border-slate-800/60 space-y-1">
                  <span className="text-slate-500 font-medium">Description du Problème / Cahier des charges:</span>
                  <p className="text-slate-200 leading-relaxed">{wo.description}</p>
                </div>

                <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/60 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500 font-medium">Montant du Devis:</span>
                    <span className="text-base font-extrabold text-amber-400">
                      {wo.quoteAmount?.toLocaleString()} FCFA
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-slate-400">
                    <span>Urgence:</span>
                    <span className="font-bold text-rose-400 uppercase">{wo.urgency}</span>
                  </div>
                </div>
              </div>

              {/* Photos Before / After comparison */}
              {(wo.photosBefore.length > 0 || wo.photosAfter.length > 0) && (
                <div className="pt-2 border-t border-slate-800/80">
                  <span className="text-xs text-slate-400 font-semibold flex items-center gap-1 mb-2">
                    <Image className="w-3-5 h-3-5 text-amber-400" /> Photos de Contrôle de Chantier (Avant / Après)
                  </span>
                  <div className="flex gap-4">
                    {wo.photosBefore.map((url, i) => (
                      <div key={i} className="relative w-28 h-20 rounded-xl overflow-hidden border border-slate-800">
                        <img src={url} alt="Avant" className="w-full h-full object-cover" />
                        <span className="absolute bottom-1 left-1 bg-slate-950/90 text-9px font-bold text-amber-300 px-1-5 py-0-5 rounded">Avant</span>
                      </div>
                    ))}
                    {wo.photosAfter.map((url, i) => (
                      <div key={i} className="relative w-28 h-20 rounded-xl overflow-hidden border border-slate-800">
                        <img src={url} alt="Après" className="w-full h-full object-cover" />
                        <span className="absolute bottom-1 left-1 bg-emerald-950/90 text-9px font-bold text-emerald-300 px-1-5 py-0-5 rounded">Après</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Reviews & Artisan Ratings */}
      <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-4">
        <h3 className="text-base font-bold text-white flex items-center gap-2">
          <Star className="w-4 h-4 text-amber-400" />
          Derniers Avis & Évaluations des Artisans BTP
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {reviews.map((rev) => (
            <div key={rev._id} className="p-4 rounded-xl bg-slate-950/80 border border-slate-800/80 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1 text-amber-400">
                  ★ {rev.rating} / 5
                </div>
                <span className="text-10px text-slate-500">{new Date(rev.createdAt).toLocaleDateString('fr-FR')}</span>
              </div>
              <p className="text-xs text-slate-300 italic">"{rev.comment}"</p>
            </div>
          ))}
        </div>
      </div>

      <AddWorkOrderModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </div>
  );
};
