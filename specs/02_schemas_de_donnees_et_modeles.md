# 02 - Schémas de Données et Modèles

Ce document détaille les modèles de données TypeScript / JSON utilisés aussi bien pour la base serveur **MongoDB Atlas** que pour le stockage local réactif **Dexie.js (IndexedDB)**.

---

## 1. Schéma du Bien Immobilier (`Property`)

Le modèle `Property` est la pièce maîtresse du système. Il intègre le mode d'exploitation (Vente, Location Libre, Airbnb), la visite 3D générée par IA, l'inventaire meublé par pièce, et les ancres pour objets connectés (IoT).

```typescript
export type PropertyType = 'APPARTEMENT' | 'MAISON_VILLA' | 'IMMEUBLE' | 'TERRAIN' | 'LOCAL_COMMERCIAL' | 'PARKING_GARAGE';

export type ListingStatus = 
  | 'LIBRE_LOCATION'       // Loué en direct via l'application
  | 'AIRBNB_EXTERNE'       // Loué via Airbnb/Booking avec synchro iCal/API
  | 'EN_VENTE'             // Mis en vente
  | 'LOUE_OCCUPE'          // Déjà occupé par un locataire
  | 'EN_TRAVAUX'           // En cours de rénovation/réparation
  | 'INACTIF';

export interface RoomItem {
  id: string;
  name: string;             // ex: "Réfrigérateur Américain Samsung", "Canapé Cuir 3 Places"
  category: 'ELECTROMENAGER' | 'MOBILIER' | 'LITERIE' | 'MULTIMEDIA' | 'OUTILLAGE' | 'DECORATION';
  condition: 'NEUF' | 'EXCELLENT' | 'BON_ETAT' | 'USE' | 'A_REPLACER';
  serialNumber?: string;
  estimatedValue: number;   // Valeur en FCFA / EUR
  photoUrls: string[];
  notes?: string;
}

export interface PropertyRoom {
  id: string;
  name: string;             // ex: "Cuisine Équipée", "Chambre Principale", "Garage Nord"
  type: 'CUISINE' | 'CHAMBRE' | 'SALON_SEJOUR' | 'SALLE_DE_BAIN' | 'GARAGE' | 'BALCON_TERRASSE' | 'DEBARRAS';
  surfaceSqm: number;       // Surface en m²
  items: RoomItem[];        // Inventaire meublé propre à cette pièce
}

export interface Scene3DData {
  status: 'NON_INITIALISE' | 'PHOTOS_EN_COURS' | 'TRAITEMENT_IA' | 'PRÊT';
  floorPlanUrls: string[];         // Plans de masse / architectures fournis
  capturedPhotoUrls: string[];     // Photos prises selon les consignes IA
  aiInstructions: {                // Guidance IA pour la prise de vue
    recommendedAnglesCount: number;
    lightingQualityScore: number;  // 0-100%
    missingZones: string[];        // ex: "Angle Sud-Ouest de la cuisine manquant"
  };
  model3DUrl?: string;             // URL du fichier 3D (Gaussian Splat / GLTF / NeRF)
  viewerConfig?: {
    initialFov: number;
    hotspots: Array<{ id: string; roomName: string; position: [number, number, number] }>;
  };
}

export interface ConnectedDeviceAnchor {
  id: string;
  name: string;                    // ex: "Serrure Entrée Principale", "Caméra Parking A"
  type: 'SERRURE_CONNECTEE' | 'CAMERA_SURVEILLANCE' | 'AMPOULE_ECLAIRAGE' | 'CAPTEUR_INCENDIE' | 'CAPTEUR_FUITE_EAU' | 'COMPTEUR_ENERGIE';
  brand: 'NUKI' | 'TUYA' | 'YALE' | 'RTSP_GENERIC' | 'ZIGBEE_MATTER';
  ipAddressOrMac?: string;
  status: 'EN_LIGNE' | 'HORS_LIGNE' | 'ALERTE_BATTERIE' | 'EN_ALARME';
  lastTelemetry: {
    batteryLevel?: number;         // Pourcentage batterie (0-100)
    isOpen?: boolean;              // Pour serrures / capteurs d'ouverture
    energyKwhTotal?: number;       // Pour compteurs
    lastStreamUrl?: string;        // Pour caméras RTSP/HLS
    updatedAt: string;
  };
  activePinCodes?: Array<{         // Codes d'accès temporaires pour serrures
    code: string;
    label: string;                 // ex: "Code Artisan Plombier", "Code Locataire Airbnb"
    validFrom: string;
    validUntil: string;
  }>;
}

export interface Property {
  _id: string;                      // MongoDB ObjectId / Dexie Primary Key
  clerkOwnerId: string;             // Référence au propriétaire (Clerk User ID)
  title: string;                    // ex: "Villa Duplex 5 Pièces avec Piscine"
  description: string;
  propertyType: PropertyType;
  listingStatus: ListingStatus;
  
  // Adresse & Localisation
  address: {
    street: string;
    city: string;
    district: string;               // ex: "Cocody Riviera 3"
    postalCode?: string;
    country: string;
    coordinates: { lat: number; lng: number };
  };

  // Caractéristiques Générales
  totalSurfaceSqm: number;
  totalRoomsCount: number;
  bedroomsCount: number;
  bathroomsCount: number;
  isFurnished: boolean;            // Vrai si meublé (déclenche la gestion avancée d'inventaire)

  // Données Financières (Vente / Location)
  financials: {
    monthlyRentPrice?: number;     // Loyer mensuel HC
    rentalCharges?: number;        // Charges locatives
    securityDeposit?: number;      // Dépôt de garantie
    sellingPrice?: number;         // Prix de vente
    estimatedPropertyTax?: number; // Taxe foncière annuelle
    agencyCommission?: number;
  };

  // Synchro Airbnb Externe
  airbnbSync?: {
    iCalImportUrl?: string;        // Flux iCal entrant
    iCalExportUrl?: string;        // Flux iCal sortant
    airbnbListingId?: string;
    lastSyncTimestamp?: string;
  };

  // Modules Avancés
  rooms: PropertyRoom[];           // Liste des pièces et inventaires
  scene3D: Scene3DData;            // Modèle 3D et guidance IA
  connectedDevices: ConnectedDeviceAnchor[]; // Ancres IoT & Domotique

  createdAt: string;
  updatedAt: string;
}
```

---

## 2. Schéma des Utilisateurs & Rôles (`User`)

```typescript
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
  clerkUserId: string;             // Lien direct avec Clerk Auth
  email: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  roles: UserRole[];               // Cumul de rôles possible (ex: ['PROPRIETAIRE', 'ADMIN_SUPER'])
  primaryRole: UserRole;          // Rôle affiché par défaut dans la navigation
  isAdminSuper: boolean;           // Détecté si l'email figure dans EMAIL_ADMIN

  // Spécifique Prestataire BTP
  btpDetails?: {
    companyName: string;
    siretOrRegisterId: string;
    specialties: BtpSpecialty[];
    ratingAverage: number;         // Note moyenne (0-5)
    hourlyRate: number;            // Tarif horaire indicatif
    isVerified: boolean;           // Vérification des certificats/assurances
  };

  // Spécifique Employé / Gestionnaire
  employeeDetails?: {
    assignedPropertiesIds: string[];
    monthlySalary: number;
  };

  bankDetails?: {                  // Relevé d'Identité Bancaire / Coordonnées de paiement
    iban?: string;
    bic?: string;
    mobileMoneyNumber?: string;
  };

  createdAt: string;
}
```

---

## 3. Modèle d'Intervention BTP (`WorkOrder`)

```typescript
export type WorkOrderStatus = 'DEMANDE_SOUMISE' | 'DEVIS_RECU' | 'ACCEPTE_ESCROW' | 'EN_COURS' | 'VALIDE_PAYE' | 'ANNULE';

export interface WorkOrder {
  _id: string;
  propertyId: string;
  createdByClerkId: string;       // Propriétaire ou Gestionnaire
  assignedBtpProviderId?: string; // Artisan sélectionné
  title: string;                  // ex: "Réparation fuite d'eau Cuisine"
  description: string;
  specialtyRequired: BtpSpecialty;
  urgency: 'BASSE' | 'MOYENNE' | 'URGENTE' | 'CRITIQUE';
  
  status: WorkOrderStatus;
  quoteAmount?: number;           // Montant du devis retenu
  escrowPaymentId?: string;       // Identifiant du blocage de fonds en séquestre
  photosBefore: string[];
  photosAfter: string[];

  createdAt: string;
  completedAt?: string;
}
```

---

## 4. Modèle des Transactions & Paiements (`Transaction`)

```typescript
export type TransactionType = 'LOYER' | 'PAIEMENT_PRESTATAIRE_BTP' | 'SALAIRE_EMPLOYE' | 'DEPOT_GARANTIE' | 'COMMISSION_VENTE';
export type PaymentMethod = 'STRIPE_CARD' | 'VIREMENT_SEPA' | 'PRALEVEMENT_AUTO' | 'MOBILE_MONEY_DIRECT';

export interface Transaction {
  _id: string;
  propertyId?: string;
  workOrderId?: string;
  leaseId?: string;               // Lien direct avec le bail si type LOYER
  senderClerkId: string;
  receiverClerkId: string;
  amount: number;                 // Montant total prélevé
  rentAmount?: number;            // Part loyer pur (pour bilan comptable / NOI)
  chargesAmount?: number;         // Part charges locatives
  currency: 'FCFA' | 'EUR' | 'USD';
  transactionType: TransactionType;
  paymentMethod: PaymentMethod;
  status: 'EN_ATTENTE' | 'SECUESTRE_BLOQUE' | 'EFFECTUE' | 'ECHOUE' | 'REMBOURSE';
  externalReference?: string;    // ID Stripe ou référence bancaire
  createdAt: string;
}
```

---

## 5. Modèle du Bail & Contrat Locatif (`Lease`)

```typescript
export type LeaseStatus = 'ACTIF' | 'PREAVIS' | 'EXPIRE' | 'RESILIE' | 'EN_ATTENTE_SIGNATURE';

export interface Lease {
  _id: string;
  propertyId: string;
  tenantClerkId: string;
  ownerClerkId: string;
  startDate: string;              // ISO 8601
  endDate: string;                // ISO 8601
  monthlyRent: number;            // Loyer mensuel Hors Charges
  charges: number;                // Charges locatives mensuelles
  securityDeposit: number;        // Dépôt de garantie
  leaseStatus: LeaseStatus;
  renewalType: 'TACITE_RECONDUCTION' | 'RENOUVELLEMENT_EXPLICITE' | 'FERME';
  noticePeriodMonths: number;     // Préavis de résiliation en mois
  signedDocumentUrl?: string;     // URL du PDF du bail signé
  createdAt: string;
  updatedAt: string;
}
```

---

## 6. Modèles Complémentaires (`AuditLog`, `Review`, `PurchaseOffer`, `DocumentEntity`)

### A. Journal d'Audit (`AuditLog`)
```typescript
export interface AuditLog {
  _id: string;
  actorClerkId: string;
  action: 'SERRURE_DEVERROUILLEE' | 'CREATION_CODE_PIN' | 'ACCES_FLUX_CAMERA' 
    | 'VIREMENT_SEQUESTRE' | 'MODIFICATION_PRIX' | 'SUPPRESSION_BIEN' | 'CHANGEMENT_ROLE';
  targetEntityType: 'Property' | 'User' | 'WorkOrder' | 'Transaction' | 'ConnectedDevice' | 'Lease';
  targetEntityId: string;
  metadata?: Record<string, unknown>;
  ipAddress?: string;
  geolocation?: { lat: number; lng: number };
  timestamp: string;
}
```

### B. Evaluation & Avis Artisan (`Review`)
```typescript
export interface Review {
  _id: string;
  workOrderId: string;
  authorClerkId: string;          // Propriétaire / Gestionnaire ayant noté
  targetBtpClerkId: string;       // Artisan BTP noté
  rating: number;                 // Note de 1 à 5
  comment: string;
  createdAt: string;
}
```

### C. Offre d'Achat Immobilier (`PurchaseOffer`)
```typescript
export type OfferStatus = 'EN_ATTENTE' | 'ACCEPTEE' | 'REFUSEE' | 'CONTRE_PROPOSITION' | 'EXPIREE';

export interface PurchaseOffer {
  _id: string;
  propertyId: string;
  buyerClerkId: string;
  sellerClerkId: string;
  offeredPrice: number;           // Montant proposé en FCFA / EUR
  validUntil: string;             // Date d'expiration de l'offre
  suspensiveConditions?: string[];// ex: "Obtention prêt bancaire", "Diagnostic technique"
  status: OfferStatus;
  createdAt: string;
}
```

### D. Gestion Documentaire & GED (`DocumentEntity`)
```typescript
export type DocumentCategory = 'BAIL_CONTRAT' | 'QUITTANCE_LOYER' | 'DEVIS_BTP' | 'DIAGNOSTIC' | 'PHOTO_ETAT_DES_LIEUX' | 'PIECE_IDENTITE';

export interface DocumentEntity {
  _id: string;
  title: string;
  category: DocumentCategory;
  fileUrl: string;
  fileSizeBytes: number;
  mimeType: string;
  associatedEntityType?: 'Property' | 'Lease' | 'WorkOrder' | 'User';
  associatedEntityId?: string;
  uploadedByClerkId: string;
  createdAt: string;
}
```

---

## 7. Modèle des Notifications Ciblées (`Notification`)

```typescript
export interface Notification {
  _id: string;
  targetUserClerkId: string;
  targetRole: UserRole;
  title: string;
  message: string;
  type: 'PAIEMENT_RECU' | 'RAPPEL_LOYER' | 'DEVIS_BTP' | 'ALERTE_DOMOTIQUE' | 'OFFRE_ACHAT';
  linkUrl?: string;
  isRead: boolean;
  createdAt: string;
}
```

---

## 8. Règles de Modification en Cascade & Intégrité

1. **Suppression d'un Bien (`Property`)** :
   - Déclenche l'archivage ou l'annulation en cascade de toutes les demandes de travail `WorkOrder` et baux `Lease` associés.
   - Désactive les codes PIN d'accès temporaires sur les serrures `connectedDevices`.
   - Ne supprime **pas** les `Transactions` financières (conservation comptable obligatoire pour les rapports quinquennaux).
2. **Changement d'État de Bien (`EN_VENTE` -> `LOUE_OCCUPE`)** :
   - Met à jour automatiquement les droits d'accès domotiques pour accorder au nouveau locataire du bail `Lease` l'accès aux commandes d'éclairage et serrures.

