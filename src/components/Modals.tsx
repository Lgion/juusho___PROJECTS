import React, { useState } from 'react';
import { db } from '../lib/db';
import { Property, Lease, WorkOrder, BtpSpecialty, PropertyType } from '../types';
import { X, Sparkles, FileText, Wrench, Building2 } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AddPropertyModal: React.FC<ModalProps> = ({ isOpen, onClose }) => {
  const [title, setTitle] = useState('');
  const [district, setDistrict] = useState('Cocody');
  const [city, setCity] = useState('Abidjan');
  const [propertyType, setPropertyType] = useState<PropertyType>('APPARTEMENT');
  const [rentPrice, setRentPrice] = useState('500000');
  const [surface, setSurface] = useState('120');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const newProp: Property = {
      _id: `prop_${Date.now()}`,
      clerkOwnerId: "user_proprio_88776655",
      title: title || "Nouvel Appartement Standing",
      description: "Bien immobilier récemment ajouté à la plateforme Juusho.",
      propertyType: propertyType,
      listingStatus: "LIBRE_LOCATION",
      address: {
        street: "Avenue principale",
        city: city,
        district: district,
        country: "Côte d'Ivoire"
      },
      totalSurfaceSqm: Number(surface),
      totalRoomsCount: 3,
      bedroomsCount: 2,
      bathroomsCount: 2,
      isFurnished: true,
      financials: {
        monthlyRentPrice: Number(rentPrice),
        rentalCharges: 50000
      },
      rooms: [],
      connectedDevices: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    await db.properties.add(newProp);
    await db.auditLogs.add({
      _id: `log_${Date.now()}`,
      actorClerkId: "user_2P9x8wQ1A2b3C4d5E6f7G8h9I0j",
      action: "MODIFICATION_PRIX",
      targetEntityType: "Property",
      targetEntityId: newProp._id,
      metadata: { action: "CREATION_BIEN", title: newProp.title },
      timestamp: new Date().toISOString()
    });

    onClose();
  };

  return (
    <div className="modal-overlay">
      <div className="glass-panel p-6 rounded-2xl max-w-xl w-full space-y-4 relative border border-slate-700">
        <button onClick={onClose} className="absolute top-4 right-4 text-slate-400 hover:text-white">
          <X className="w-5 h-5" />
        </button>

        <h3 className="text-lg font-bold text-white flex items-center gap-2">
          <Building2 className="w-5 h-5 text-amber-400" />
          Ajouter un Nouveau Bien Immobilier
        </h3>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block text-slate-400 mb-1 font-semibold">Titre du bien</label>
            <input
              type="text"
              placeholder="ex: Résidence Triplex Haut Standing Assinie"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-400 mb-1 font-semibold">Type de bien</label>
              <select
                value={propertyType}
                onChange={(e) => setPropertyType(e.target.value as PropertyType)}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white"
              >
                <option value="APPARTEMENT">Appartement</option>
                <option value="MAISON_VILLA">Maison / Villa</option>
                <option value="TERRAIN">Terrain</option>
                <option value="STUDIO">Studio</option>
              </select>
            </div>
            <div>
              <label className="block text-slate-400 mb-1 font-semibold">Quartier & Ville</label>
              <input
                type="text"
                placeholder="Cocody, Abidjan"
                value={district}
                onChange={(e) => setDistrict(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-400 mb-1 font-semibold">Loyer Mensuel (FCFA)</label>
              <input
                type="number"
                value={rentPrice}
                onChange={(e) => setRentPrice(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white"
              />
            </div>
            <div>
              <label className="block text-slate-400 mb-1 font-semibold">Surface Totale (m²)</label>
              <input
                type="number"
                value={surface}
                onChange={(e) => setSurface(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white"
              />
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              className="flex-1 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold shadow-lg shadow-amber-500/20"
            >
              Enregistrer dans Dexie.js
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl bg-slate-900 text-slate-300 hover:bg-slate-800"
            >
              Annuler
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export const AddLeaseModal: React.FC<ModalProps> = ({ isOpen, onClose }) => {
  const [propertyId, setPropertyId] = useState('prop_villa_cocody');
  const [tenantName, setTenantName] = useState('Amine Diallo');
  const [rent, setRent] = useState('2500000');
  const [charges, setCharges] = useState('200000');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const newLease: Lease = {
      _id: `lease_${Date.now()}`,
      propertyId: propertyId,
      tenantClerkId: "user_locataire_11223344",
      ownerClerkId: "user_proprio_88776655",
      startDate: new Date().toISOString(),
      endDate: new Date(Date.now() + 365 * 24 * 3600 * 1000).toISOString(),
      monthlyRent: Number(rent),
      charges: Number(charges),
      securityDeposit: Number(rent) * 2,
      leaseStatus: "EN_ATTENTE_SIGNATURE",
      renewalType: "TACITE_RECONDUCTION",
      noticePeriodMonths: 3,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    await db.leases.add(newLease);
    onClose();
  };

  return (
    <div className="modal-overlay">
      <div className="glass-panel p-6 rounded-2xl max-w-xl w-full space-y-4 relative border border-slate-700">
        <button onClick={onClose} className="absolute top-4 right-4 text-slate-400 hover:text-white">
          <X className="w-5 h-5" />
        </button>

        <h3 className="text-lg font-bold text-white flex items-center gap-2">
          <FileText className="w-5 h-5 text-amber-400" />
          Établir un Nouveau Bail Locatif
        </h3>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block text-slate-400 mb-1 font-semibold">Nom du Locataire Titulaire</label>
            <input
              type="text"
              value={tenantName}
              onChange={(e) => setTenantName(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-400 mb-1 font-semibold">Loyer Mensuel Hors Charges (FCFA)</label>
              <input
                type="number"
                value={rent}
                onChange={(e) => setRent(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white"
              />
            </div>
            <div>
              <label className="block text-slate-400 mb-1 font-semibold">Charges Locatives (FCFA)</label>
              <input
                type="number"
                value={charges}
                onChange={(e) => setCharges(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white"
              />
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              className="flex-1 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold shadow-lg shadow-amber-500/20"
            >
              Créer le Contrat de Bail
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl bg-slate-900 text-slate-300 hover:bg-slate-800"
            >
              Annuler
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export const AddWorkOrderModal: React.FC<ModalProps> = ({ isOpen, onClose }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [specialty, setSpecialty] = useState<BtpSpecialty>('PLOMBERIE');
  const [quoteAmount, setQuoteAmount] = useState('45000');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const newWo: WorkOrder = {
      _id: `wo_${Date.now()}`,
      propertyId: "prop_villa_cocody",
      createdByClerkId: "user_locataire_11223344",
      assignedBtpProviderId: "user_btp_998877",
      title: title || "Réparation Fuite Canalisation",
      description: description || "Intervention urgente demandée par le locataire.",
      specialtyRequired: specialty,
      urgency: "URGENTE",
      status: "ACCEPTE_ESCROW",
      quoteAmount: Number(quoteAmount),
      escrowPaymentId: `tx_escrow_${Date.now()}`,
      photosBefore: ["https://images.unsplash.com/photo-1585704032915-c3400ca199e7"],
      photosAfter: [],
      createdAt: new Date().toISOString()
    };

    await db.workOrders.add(newWo);
    onClose();
  };

  return (
    <div className="modal-overlay">
      <div className="glass-panel p-6 rounded-2xl max-w-xl w-full space-y-4 relative border border-slate-700">
        <button onClick={onClose} className="absolute top-4 right-4 text-slate-400 hover:text-white">
          <X className="w-5 h-5" />
        </button>

        <h3 className="text-lg font-bold text-white flex items-center gap-2">
          <Wrench className="w-5 h-5 text-amber-400" />
          Publier un Besoin d'Intervention BTP
        </h3>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block text-slate-400 mb-1 font-semibold">Objet de l'intervention</label>
            <input
              type="text"
              placeholder="ex: Fuite d'eau robinetterie salle de bain"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-400 mb-1 font-semibold">Spécialité Requise</label>
              <select
                value={specialty}
                onChange={(e) => setSpecialty(e.target.value as BtpSpecialty)}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white"
              >
                <option value="PLOMBERIE">Plomberie</option>
                <option value="ELECTRICITE">Électricité</option>
                <option value="CLIMATISATION">Climatisation</option>
                <option value="PEINTURE">Peinture</option>
                <option value="MACONNERIE">Maçonnerie</option>
              </select>
            </div>
            <div>
              <label className="block text-slate-400 mb-1 font-semibold">Montant Estimé / Devis (FCFA)</label>
              <input
                type="number"
                value={quoteAmount}
                onChange={(e) => setQuoteAmount(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-400 mb-1 font-semibold">Description détaillée</label>
            <textarea
              rows={3}
              placeholder="Précisez le problème ou la panne constatée..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white resize-none"
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              className="flex-1 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold shadow-lg shadow-amber-500/20"
            >
              Publier l'Intervention Sous Séquestre Escrow
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl bg-slate-900 text-slate-300 hover:bg-slate-800"
            >
              Annuler
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
