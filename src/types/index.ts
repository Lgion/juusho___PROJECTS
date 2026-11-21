export type UserRole = 
  | 'PROPRIETAIRE'
  | 'LOCATAIRE'
  | 'PROSPECT_ACHETEUR'
  | 'PRESTATAIRE_BTP'
  | 'EMPLOYE'
  | 'ADMIN_SUPER';

export type BtpSpecialty = 'MACONNERIE' | 'PLOMBERIE' | 'ELECTRICITE' | 'PEINTURE' | 'MENUISERIE' | 'CLIMATISATION' | 'NETTOYAGE';

export interface UserProfile {
  _id: string;
  clerkUserId: string;
  email: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  roles: UserRole[];
  primaryRole: UserRole;
  isAdminSuper: boolean;
  btpDetails?: {
    companyName: string;
    siretOrRegisterId: string;
    specialties: BtpSpecialty[];
    ratingAverage: number;
    hourlyRate: number;
    isVerified: boolean;
  };
  employeeDetails?: {
    assignedPropertiesIds: string[];
    monthlySalary: number;
  };
  bankDetails?: {
    iban?: string;
    bic?: string;
    mobileMoneyNumber?: string;
  };
  createdAt: string;
}

export type PropertyType = 'APPARTEMENT' | 'MAISON_VILLA' | 'STUDIO' | 'IMMEUBLE' | 'TERRAIN' | 'LOCAL_COMMERCIAL';
export type ListingStatus = 'LIBRE_LOCATION' | 'LOUE_OCCUPE' | 'EN_VENTE' | 'VENDU' | 'EN_TRAVAUX' | 'AIRBNB_EXTERNE';

export interface InventoryItem {
  id: string;
  name: string;
  category: 'MOBILIER' | 'ELECTROMENAGER' | 'ECLAIRAGE' | 'DECORATION' | 'DOMOTIQUE';
  condition: 'NEUF' | 'EXCELLENT' | 'BON' | 'USAGE' | 'A_REPARER';
  serialNumber?: string;
  estimatedValue?: number;
  photoUrls?: string[];
}

export interface PropertyRoom {
  id: string;
  name: string;
  type: 'SALON' | 'CHAMBRE' | 'CUISINE' | 'SALLE_DE_BAIN' | 'BALCON' | 'TERRASSE' | 'GARAGE';
  surfaceSqm: number;
  items: InventoryItem[];
}

export interface ConnectedDevice {
  id: string;
  name: string;
  type: 'SERRURE_CONNECTEE' | 'CAMERA_SURVEILLANCE' | 'CAPTEUR_FUITE_EAU' | 'THERMOSTAT_INTELLIGENT' | 'INTERRUPTEUR';
  brand: string;
  status: 'EN_LIGNE' | 'HORS_LIGNE' | 'BATTERIE_FAIBLE' | 'ALERTE_ANOMALIE';
  lastTelemetry?: {
    batteryLevel?: number;
    temperatureCelsius?: number;
    isOpen?: boolean;
    streamUrl?: string;
    updatedAt: string;
  };
  activePinCodes?: {
    code: string;
    label: string;
    validFrom: string;
    validUntil: string;
  }[];
}

export interface Property {
  _id: string;
  clerkOwnerId: string;
  title: string;
  description: string;
  propertyType: PropertyType;
  listingStatus: ListingStatus;
  address: {
    street: string;
    city: string;
    district: string;
    country: string;
    coordinates?: { lat: number; lng: number };
  };
  totalSurfaceSqm: number;
  totalRoomsCount: number;
  bedroomsCount: number;
  bathroomsCount: number;
  isFurnished: boolean;
  financials: {
    monthlyRentPrice?: number;
    rentalCharges?: number;
    sellingPrice?: number;
    securityDeposit?: number;
    estimatedPropertyTax?: number;
  };
  airbnbSync?: {
    iCalImportUrl?: string;
    iCalExportUrl?: string;
    airbnbListingId?: string;
    lastSyncTimestamp?: string;
  };
  rooms: PropertyRoom[];
  scene3D?: {
    status: 'NON_INITIALISE' | 'PHOTOS_CAPTORES' | 'EN_TRAITEMENT_IA' | 'PRÊT';
    floorPlanUrls: string[];
    capturedPhotoUrls: string[];
    aiInstructions?: {
      recommendedAnglesCount: number;
      lightingQualityScore: number;
      missingZones: string[];
    };
    model3DUrl?: string;
  };
  connectedDevices: ConnectedDevice[];
  createdAt: string;
  updatedAt: string;
}

export type LeaseStatus = 'ACTIF' | 'PREAVIS' | 'EXPIRE' | 'RESILIE' | 'EN_ATTENTE_SIGNATURE';

export interface Lease {
  _id: string;
  propertyId: string;
  tenantClerkId: string;
  ownerClerkId: string;
  startDate: string;
  endDate: string;
  monthlyRent: number;
  charges: number;
  securityDeposit: number;
  leaseStatus: LeaseStatus;
  renewalType: 'TACITE_RECONDUCTION' | 'RENOUVELLEMENT_EXPLICITE' | 'FERME';
  noticePeriodMonths: number;
  signedDocumentUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export type WorkOrderStatus = 'DEMANDE_SOUMISE' | 'DEVIS_RECU' | 'ACCEPTE_ESCROW' | 'EN_COURS' | 'VALIDE_PAYE' | 'ANNULE';

export interface WorkOrder {
  _id: string;
  propertyId: string;
  createdByClerkId: string;
  assignedBtpProviderId?: string;
  title: string;
  description: string;
  specialtyRequired: BtpSpecialty;
  urgency: 'BASSE' | 'MOYENNE' | 'URGENTE' | 'CRITIQUE';
  status: WorkOrderStatus;
  quoteAmount?: number;
  escrowPaymentId?: string;
  photosBefore: string[];
  photosAfter: string[];
  createdAt: string;
  completedAt?: string;
}

export type TransactionType = 'LOYER' | 'PAIEMENT_PRESTATAIRE_BTP' | 'SALAIRE_EMPLOYE' | 'DEPOT_GARANTIE' | 'COMMISSION_VENTE';
export type PaymentMethod = 'STRIPE_CARD' | 'VIREMENT_SEPA' | 'PRALEVEMENT_AUTO' | 'MOBILE_MONEY_DIRECT';

export interface Transaction {
  _id: string;
  propertyId?: string;
  workOrderId?: string;
  leaseId?: string;
  senderClerkId: string;
  receiverClerkId: string;
  amount: number;
  rentAmount?: number;
  chargesAmount?: number;
  currency: 'FCFA' | 'EUR' | 'USD';
  transactionType: TransactionType;
  paymentMethod: PaymentMethod;
  status: 'EN_ATTENTE' | 'SECUESTRE_BLOQUE' | 'EFFECTUE' | 'ECHOUE' | 'REMBOURSE';
  externalReference?: string;
  createdAt: string;
}

export type OfferStatus = 'EN_ATTENTE' | 'ACCEPTEE' | 'REFUSEE' | 'CONTRE_PROPOSITION' | 'EXPIREE';

export interface PurchaseOffer {
  _id: string;
  propertyId: string;
  buyerClerkId: string;
  sellerClerkId: string;
  offeredPrice: number;
  validUntil: string;
  suspensiveConditions?: string[];
  status: OfferStatus;
  createdAt: string;
}

export interface Review {
  _id: string;
  workOrderId: string;
  authorClerkId: string;
  targetBtpClerkId: string;
  rating: number;
  comment: string;
  createdAt: string;
}

export interface AuditLog {
  _id: string;
  actorClerkId: string;
  action: 'SERRURE_DEVERROUILLEE' | 'CREATION_CODE_PIN' | 'ACCES_FLUX_CAMERA' | 'VIREMENT_SEQUESTRE' | 'MODIFICATION_PRIX' | 'SUPPRESSION_BIEN' | 'CHANGEMENT_ROLE';
  targetEntityType: 'Property' | 'User' | 'WorkOrder' | 'Transaction' | 'ConnectedDevice' | 'Lease';
  targetEntityId: string;
  metadata?: Record<string, unknown>;
  ipAddress?: string;
  timestamp: string;
}

export interface SyncQueueItem {
  id?: number;
  tableName: string;
  operation: 'CREATE' | 'UPDATE' | 'DELETE';
  payload: any;
  createdAt: string;
}
