import React from 'react';
import { Transaction, PurchaseOffer, Property, UserProfile } from '../types';
import { CircleDollarSign, ArrowUpRight, ArrowDownLeft, ShieldCheck, Tag, Building2, CreditCard } from 'lucide-react';

interface TransactionsViewProps {
  transactions: Transaction[];
  purchaseOffers: PurchaseOffer[];
  properties: Property[];
  users: UserProfile[];
}

export const TransactionsView: React.FC<TransactionsViewProps> = ({ transactions, purchaseOffers, properties, users }) => {
  const totalRents = transactions
    .filter(t => t.transactionType === 'LOYER' && t.status === 'EFFECTUE')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalEscrow = transactions
    .filter(t => t.transactionType === 'PAIEMENT_PRESTATAIRE_BTP')
    .reduce((sum, t) => sum + t.amount, 0);

  const getUserName = (clerkId: string) => {
    const u = users.find(user => user.clerkUserId === clerkId || user._id === clerkId);
    return u ? `${u.firstName} ${u.lastName}` : clerkId;
  };

  const getPropertyTitle = (propId?: string) => {
    if (!propId) return 'N/A';
    return properties.find(p => p._id === propId)?.title || propId;
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-white flex items-center gap-2">
            <CircleDollarSign className="w-6 h-6 text-amber-400" />
            Finances, Encaissements & Offres d'Achat
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Bilan financier NOI, séparation loyers pur / charges locatives, paiements directes & offres d'achat.
          </p>
        </div>
      </div>

      {/* Financial Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-2">
          <span className="text-xs text-slate-400 font-semibold flex items-center gap-1.5">
            <ArrowDownLeft className="w-4 h-4 text-emerald-400" /> Total Loyers Encaissés (Août 2026)
          </span>
          <p className="text-2xl font-extrabold text-emerald-400">
            {totalRents.toLocaleString()} FCFA
          </p>
          <span className="text-[10px] text-slate-500">Source: Prélèvements Automatisés / Direct</span>
        </div>

        <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-2">
          <span className="text-xs text-slate-400 font-semibold flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-amber-400" /> Fonds en Séquestre BTP
          </span>
          <p className="text-2xl font-extrabold text-amber-400">
            {totalEscrow.toLocaleString()} FCFA
          </p>
          <span className="text-[10px] text-slate-500">Sécurité artisans & propriétaires</span>
        </div>

        <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-2">
          <span className="text-xs text-slate-400 font-semibold flex items-center gap-1.5">
            <Tag className="w-4 h-4 text-purple-400" /> Offres d'Achat Reçues
          </span>
          <p className="text-2xl font-extrabold text-purple-300">
            {purchaseOffers.length} Offre(s)
          </p>
          <span className="text-[10px] text-slate-500">Total valeur: 80 000 000 FCFA</span>
        </div>
      </div>

      {/* Transactions Table */}
      <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-4">
        <h3 className="text-base font-bold text-white flex items-center gap-2">
          <CreditCard className="w-4 h-4 text-amber-400" />
          Historique des Transactions Financières
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400">
                <th className="pb-3 font-semibold">ID & Bien</th>
                <th className="pb-3 font-semibold">Émetteur → Destinataire</th>
                <th className="pb-3 font-semibold">Type & Méthode</th>
                <th className="pb-3 font-semibold">Montant Total (Rent/Charges)</th>
                <th className="pb-3 font-semibold">Statut</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {transactions.map((tx) => (
                <tr key={tx._id} className="hover:bg-slate-900/50 transition-colors">
                  <td className="py-3">
                    <span className="font-mono font-bold text-amber-300">{tx._id}</span>
                    <p className="text-[10px] text-slate-400">{getPropertyTitle(tx.propertyId)}</p>
                  </td>
                  <td className="py-3">
                    <span className="text-slate-200">{getUserName(tx.senderClerkId)}</span>
                    <span className="text-slate-500 mx-1">→</span>
                    <span className="text-slate-200">{getUserName(tx.receiverClerkId)}</span>
                  </td>
                  <td className="py-3">
                    <span className="font-semibold text-slate-300">{tx.transactionType}</span>
                    <p className="text-[10px] text-slate-500">{tx.paymentMethod.replace('_', ' ')}</p>
                  </td>
                  <td className="py-3">
                    <span className="font-extrabold text-amber-400 text-sm">
                      {tx.amount.toLocaleString()} {tx.currency}
                    </span>
                    {tx.rentAmount && (
                      <p className="text-[10px] text-slate-400">
                        ({tx.rentAmount.toLocaleString()} loyer + {tx.chargesAmount?.toLocaleString()} ch.)
                      </p>
                    )}
                  </td>
                  <td className="py-3">
                    <span className="badge-status bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px]">
                      {tx.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Purchase Offers */}
      <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-4">
        <h3 className="text-base font-bold text-white flex items-center gap-2">
          <Tag className="w-4 h-4 text-amber-400" />
          Offres d'Achat Immobilières Soumises
        </h3>
        {purchaseOffers.map((offer) => (
          <div key={offer._id} className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="badge-status bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[10px]">
                  En Attente de Décision
                </span>
                <span className="text-xs text-slate-400 font-mono">ID: {offer._id}</span>
              </div>
              <h4 className="font-bold text-white text-sm mt-1">{getPropertyTitle(offer.propertyId)}</h4>
              <p className="text-xs text-slate-400">Acheteur: <span className="text-slate-200 font-semibold">{getUserName(offer.buyerClerkId)}</span></p>
              {offer.suspensiveConditions && (
                <div className="flex flex-wrap gap-1 mt-2">
                  {offer.suspensiveConditions.map((cond, i) => (
                    <span key={i} className="text-[10px] bg-slate-900 text-slate-400 px-2 py-0.5 rounded border border-slate-800">
                      ✓ {cond}
                    </span>
                  ))}
                </div>
              )}
            </div>

            <div className="text-right">
              <span className="text-xs text-slate-400">Montant proposé:</span>
              <p className="text-xl font-extrabold text-amber-400">{offer.offeredPrice.toLocaleString()} FCFA</p>
              <div className="flex gap-2 mt-2">
                <button 
                  onClick={() => alert(`✅ Offre d'achat de ${offer.offeredPrice.toLocaleString()} FCFA acceptée !`)}
                  className="px-3 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs cursor-pointer"
                >
                  Accepter
                </button>
                <button 
                  onClick={() => alert('❌ Offre refusée.')}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs cursor-pointer"
                >
                  Refuser
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
