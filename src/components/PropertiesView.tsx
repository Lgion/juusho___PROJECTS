import React, { useState } from 'react';
import { Property, ListingStatus, UserRole } from '../types';
import { 
  Building2, 
  MapPin, 
  Bed, 
  Bath, 
  Maximize2, 
  Cpu, 
  Box, 
  Search, 
  Filter, 
  Sparkles,
  ShieldCheck
} from 'lucide-react';
import { AddPropertyModal } from './Modals';

interface PropertiesViewProps {
  properties: Property[];
  currentRole: UserRole;
  onSelectProperty?: (property: Property) => void;
}

export const PropertiesView: React.FC<PropertiesViewProps> = ({ properties, currentRole, onSelectProperty }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [selectedType, setSelectedType] = useState<string>('ALL');
  const [isModalOpen, setIsModalOpen] = useState(false);

  const filteredProperties = properties.filter((p) => {
    const matchesSearch = p.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          p.address.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          p.address.district.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = selectedStatus === 'ALL' || p.listingStatus === selectedStatus;
    const matchesType = selectedType === 'ALL' || p.propertyType === selectedType;
    return matchesSearch && matchesStatus && matchesType;
  });

  const getStatusBadge = (status: ListingStatus) => {
    switch (status) {
      case 'LIBRE_LOCATION':
        return <span className="badge-status bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">Libre à la location</span>;
      case 'LOUE_OCCUPE':
        return <span className="badge-status bg-sky-500/20 text-sky-300 border border-sky-500/30">Loué / Occupé</span>;
      case 'EN_VENTE':
        return <span className="badge-status bg-amber-500/20 text-amber-300 border border-amber-500/30">En Vente</span>;
      case 'AIRBNB_EXTERNE':
        return <span className="badge-status bg-rose-500/20 text-rose-300 border border-rose-500/30">Synchro Airbnb iCal</span>;
      default:
        return <span className="badge-status bg-slate-500/20 text-slate-300 border border-slate-500/30">{status}</span>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header title & search controls */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-white flex items-center gap-2">
            <Building2 className="w-6 h-6 text-amber-400" />
            Parc Immobilier Intelligent
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Biens géolocalisés, état des lieux modularisés, scènes 3D générées par IA & capteurs IoT.
          </p>
        </div>

        <button 
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-lg shadow-amber-500/20 transition-all cursor-pointer"
        >
          <Sparkles className="w-4 h-4" />
          + Ajouter un Bien
        </button>
      </div>

      {/* Role Notice Banner */}
      <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 text-xs flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-amber-400" />
          <span className="text-slate-300 font-medium">Vue active pour le profil : <strong className="text-amber-300">{currentRole}</strong></span>
        </div>
        <span className="text-[10px] text-slate-500 hidden sm:inline">{filteredProperties.length} bien(s) répertorié(s)</span>
      </div>

      {/* Filter bar */}
      <div className="glass-panel p-4 rounded-2xl flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1-2 -translate-y-1-2" />
          <input
            type="text"
            placeholder="Rechercher par titre, ville, quartier..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
          />
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto flex-wrap">
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <Filter className="w-3-5 h-3-5 text-amber-400" />
            <span>Statut:</span>
          </div>
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="bg-slate-950 text-xs text-white px-3 py-2 rounded-xl border border-slate-800 focus:outline-none focus:border-amber-500"
          >
            <option value="ALL">Tous les statuts</option>
            <option value="LIBRE_LOCATION">Libre à la location</option>
            <option value="LOUE_OCCUPE">Loué / Occupé</option>
            <option value="EN_VENTE">En Vente</option>
            <option value="AIRBNB_EXTERNE">Airbnb / iCal</option>
          </select>

          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="bg-slate-950 text-xs text-white px-3 py-2 rounded-xl border border-slate-800 focus:outline-none focus:border-amber-500"
          >
            <option value="ALL">Tous les types</option>
            <option value="MAISON_VILLA">Maison / Villa</option>
            <option value="APPARTEMENT">Appartement</option>
            <option value="TERRAIN">Terrain</option>
          </select>
        </div>
      </div>

      {/* Property Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProperties.map((p) => {
          const mainPhoto = p.scene3D?.capturedPhotoUrls?.[0] || 
                            p.scene3D?.floorPlanUrls?.[0] || 
                            "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=800&q=80";

          return (
            <div 
              key={p._id}
              onClick={() => onSelectProperty?.(p)}
              className="glass-card rounded-2xl overflow-hidden flex flex-col justify-between group cursor-pointer"
            >
              {/* Photo & Badges */}
              <div className="relative h-48 overflow-hidden bg-slate-900">
                <img 
                  src={mainPhoto} 
                  alt={p.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute top-3 left-3 flex flex-wrap gap-2">
                  {getStatusBadge(p.listingStatus)}
                </div>

                {p.scene3D?.status === 'PRÊT' && (
                  <div className="absolute bottom-3 right-3 px-2-5 py-1 rounded-lg glass-panel bg-slate-950/80 text-10px font-bold text-amber-300 flex items-center gap-1-5 border border-amber-500/40">
                    <Box className="w-3-5 h-3-5 text-amber-400" />
                    <span>Visite 3D IA Disponible</span>
                  </div>
                )}
              </div>

              {/* Card Body */}
              <div className="p-5 space-y-4 flex-1 flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-1 text-xs text-amber-400 font-semibold mb-1">
                    <MapPin className="w-3-5 h-3-5" />
                    <span>{p.address.district}, {p.address.city} ({p.address.country})</span>
                  </div>
                  <h3 className="font-bold text-base text-white group-hover:text-amber-300 transition-colors line-clamp-1">
                    {p.title}
                  </h3>
                  <p className="text-xs text-slate-400 line-clamp-2 mt-1 leading-relaxed">
                    {p.description}
                  </p>
                </div>

                {/* Property Specs */}
                <div className="grid grid-cols-3 gap-2 py-2 border-y border-slate-800/80 text-xs text-slate-300">
                  <div className="flex items-center gap-1-5">
                    <Bed className="w-3-5 h-3-5 text-slate-500" />
                    <span>{p.bedroomsCount} ch.</span>
                  </div>
                  <div className="flex items-center gap-1-5">
                    <Bath className="w-3-5 h-3-5 text-slate-500" />
                    <span>{p.bathroomsCount} sdb.</span>
                  </div>
                  <div className="flex items-center gap-1-5">
                    <Maximize2 className="w-3-5 h-3-5 text-slate-500" />
                    <span>{p.totalSurfaceSqm} m²</span>
                  </div>
                </div>

                {/* Domotics & Financial footer */}
                <div className="flex items-center justify-between pt-1">
                  <div>
                    {p.financials.monthlyRentPrice && (
                      <div>
                        <span className="text-xs text-slate-400">Loyer: </span>
                        <span className="text-sm font-extrabold text-amber-400">
                          {p.financials.monthlyRentPrice.toLocaleString('fr-FR')} FCFA
                        </span>
                        <span className="text-10px text-slate-500"> /mois</span>
                      </div>
                    )}
                    {p.financials.sellingPrice && (
                      <div>
                        <span className="text-xs text-slate-400">Prix de vente: </span>
                        <span className="text-sm font-extrabold text-amber-400">
                          {p.financials.sellingPrice.toLocaleString('fr-FR')} FCFA
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    {p.connectedDevices?.length > 0 && (
                      <span className="p-1-5 rounded-lg bg-slate-900 border border-slate-800 text-emerald-400 text-xs flex items-center gap-1">
                        <Cpu className="w-3-5 h-3-5" />
                        <span className="text-10px font-bold">{p.connectedDevices.length}</span>
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <AddPropertyModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </div>
  );
};
