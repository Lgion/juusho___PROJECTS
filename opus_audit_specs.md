🔍 Audit de Complétude & Cohérence des Spécifications Juusho
Audit réalisé le 12 Août 2026 — Analyse ligne par ligne des 6 fichiers specs/01 à specs/06.

Table des Matières
Risques Critiques Bloquants (🔴)
Incohérences entre Fichiers (🟠)
Lacunes Majeures — Modèles Manquants (🟡)
Axes d'Amélioration (🟢)
Matrice de Couverture Croisée
Recommandations de Prioritisation
1. Risques Critiques Bloquants (🔴)
CAUTION

Ces 6 points, s'ils ne sont pas corrigés avant le développement, peuvent rendre certaines fonctionnalités irréalisables ou provoquer des erreurs fondamentales d'architecture.

🔴 R1. L'API Airbnb officielle n'est PAS accessible publiquement
Fichiers impactés : 01 (§3.A), 02 (airbnbSync), 04 (§3.A.4)

Le spec 01 affirme 3 méthodes d'intégration Airbnb dont « Airbnb Official API (Partner Program) ». Or, l'API Airbnb est fermée : elle est exclusivement réservée à des partenaires logiciels certifiés (PMS de type Guesty, Hostaway, Lodgify). Il n'existe pas de programme self-serve. Juusho, en tant que nouvelle application, ne peut pas y accéder directement.

Impact : Le graphique « Performance Comparative Airbnb vs Location Longue Durée » (spec 04, §3.A.4) ne pourra pas se remplir automatiquement à partir de données Airbnb directes.

Correction recommandée :

Phase 1 (Immédiate) : Se limiter à l'import/export iCal (fonctionne sans aucune autorisation, standard universel). Permet le blocage de dates et le calcul du taux d'occupation.
Phase 2 (À terme) : Intégrer via un Channel Manager certifié (Channex, Hospitable, Guesty) qui dispose déjà de l'accès API. L'app consommerait l'API du Channel Manager, pas celle d'Airbnb.
Phase 3 (Optionnel) : Permettre la saisie manuelle des revenus Airbnb par le propriétaire comme fallback.
Retirer la mention « API Airbnb Officielle » des specs et la remplacer par cette approche en 3 phases.
🔴 R2. Stripe Connect ne supporte PAS Mobile Money en Côte d'Ivoire
Fichier impacté : 01 (§3.B)

Le spec 01 affirme l'intégration de « Stripe Connect + Mobile Money (Wave, Orange Money, MTN) ». Or, Stripe ne propose pas de rails Mobile Money en Côte d'Ivoire. Stripe y est disponible uniquement pour les paiements par carte bancaire (pénétration très faible en CIV).

Impact : En Côte d'Ivoire, >85% des paiements digitaux passent par Mobile Money. Si l'app ne supporte que Stripe/cartes, elle sera inutilisable pour la grande majorité des utilisateurs.

Correction recommandée :

Remplacer « Stripe Connect pour Mobile Money » par CinetPay (standard en Afrique de l'Ouest francophone), qui supporte nativement Orange Money, Wave, MTN MoMo, Moov et les cartes bancaires via une API unique.
Conserver Stripe uniquement pour les paiements carte/SEPA des utilisateurs européens.
L'architecture doit prévoir un Payment Gateway Adapter Pattern (interface abstraite) permettant de brancher CinetPay OU Stripe selon la devise/localité du paiement.
🔴 R3. Aucune stratégie de résolution de conflits Dexie ↔ MongoDB
Fichier impacté : 01 (§2.B)

Le spec 01 décrit le flux sync Dexie.js → MongoDB via une « Mutation Sync Queue », mais ne définit aucune politique de résolution de conflit. C'est le point le plus critique d'une architecture offline-first.

Scénario de conflit concret : Le propriétaire modifie le loyer d'un bien sur son téléphone (hors-ligne), pendant que son gestionnaire (Employé) modifie la description du même bien sur son ordinateur. Quand les deux synchronisent, qui gagne ?

Correction recommandée — Ajouter un §2.B.bis « Politique de Résolution de Conflits » :

Données financières (Transaction, loyer, prix) : Stratégie Server-Authoritative. Le serveur est la source de vérité absolue. Les mutations locales sont soumises et validées par le serveur qui peut les rejeter.
Données descriptives (titre, description, photos) : Stratégie Last-Write-Wins (LWW) basée sur updatedAt. La modification la plus récente prévaut.
Données IoT (télémétrie) : Flux descendant uniquement (serveur → client). Le client ne « modifie » jamais l'état d'un capteur, il reçoit les mises à jour.
Considérer Dexie Cloud (service géré) comme alternative à un sync engine custom, pour réduire drastiquement la complexité.
🔴 R4. Le modèle User est mono-rôle — Impossibilité de cumul
Fichier impacté : 02 (§2)

Le champ role: UserRole est un scalaire unique. Or, un même individu peut être :

Propriétaire ET Admin (cas de Cyril Raymond dans le mock 06).
Propriétaire ET Locataire (il possède un bien et en loue un autre).
Prestataire BTP ET Propriétaire (un plombier qui investit dans l'immobilier).
Impact : Avec un rôle unique, le système force l'utilisateur à créer plusieurs comptes Clerk, ce qui est contraire à l'UX et génère des incohérences de données.

Correction recommandée :

typescript
// AVANT (mono-rôle) :
role: UserRole;
// APRÈS (multi-rôle) :
roles: UserRole[];  // ex: ['PROPRIETAIRE', 'ADMIN_SUPER']
primaryRole: UserRole; // Rôle affiché par défaut dans la navigation
🔴 R5. Incohérence d'enum dans les règles de cascade
Fichier impacté : 02 (§6, ligne 261)

La règle de cascade mentionne FOR_SALE comme valeur d'enum :

« Changement d'État de Bien (FOR_SALE -> LOUE_OCCUPE) »

Or, l'enum ListingStatus définie dans le même fichier utilise EN_VENTE, pas FOR_SALE. Cette incohérence provoquera une erreur logique si un développeur copie-colle la règle en code.

Correction : Remplacer FOR_SALE par EN_VENTE.

🔴 R6. Absence totale du modèle Contrat / Bail (Lease)
Fichier impacté : 02 — Modèle manquant

Le spec 03 (§3, Onglet Locataires) mentionne « contrat associé ». Le spec 04 parle de « quittances de loyer ». Mais aucun modèle Lease / Contract n'existe dans le spec 02.

Sans ce modèle, il est impossible de :

Connaître les dates de début/fin de bail d'un locataire.
Calculer les renouvellements et préavis.
Générer automatiquement les quittances mensuelles.
Appliquer les droits IoT temporels (accès serrure = durée du bail).
Correction recommandée — Ajouter le modèle :

typescript
export type LeaseStatus = 'ACTIF' | 'PREAVIS' | 'EXPIRE' | 'RESILIE';
export interface Lease {
  _id: string;
  propertyId: string;
  tenantClerkId: string;
  ownerClerkId: string;
  startDate: string;        // ISO 8601
  endDate: string;
  monthlyRent: number;
  charges: number;
  securityDeposit: number;
  leaseStatus: LeaseStatus;
  renewalType: 'TACITE_RECONDUCTION' | 'RENOUVELLEMENT_EXPLICITE' | 'FERME';
  noticePeriodMonths: number; // Préavis en mois
  signedDocumentUrl?: string; // PDF du bail signé
  createdAt: string;
  updatedAt: string;
}
2. Incohérences entre Fichiers (🟠)
🟠 I1. Rôle ADMIN vs ADMIN_SUPER — Divergence entre spec 01 et spec 02
Spec 01 (ligne 63) liste les rôles : PROPRIETAIRE, LOCATAIRE, PROSPECT_ACHETEUR, PRESTATAIRE_BTP, EMPLOYE, **ADMIN**.
Spec 02 (ligne 143) définit l'enum UserRole avec : ADMIN_**SUPER**.
Les deux fichiers ne parlent pas du même rôle. Harmoniser sur ADMIN_SUPER partout (ou créer les deux niveaux ADMIN + ADMIN_SUPER).

🟠 I2. NEXT_PUBLIC_CLERK_* — Variables Next.js dans un projet TanStack
Spec 01 (lignes 62, 96-99) : Les variables d'environnement portent le préfixe NEXT_PUBLIC_ qui est spécifique à Next.js. Dans TanStack Start, le mécanisme d'exposition des variables client est différent (via vinxi / import.meta.env).
Correction : Documenter que les variables devront être renommées selon les conventions TanStack Start (ex: VITE_CLERK_PUBLISHABLE_KEY ou import.meta.env).
🟠 I3. Le prix du loyer dans le mock data ne correspond pas au schéma
Spec 06 : Le bien prop_villa_cocody a monthlyRentPrice: 2500000 + rentalCharges: 200000 = 2 700 000 FCFA au total.
La Transaction tx_loyer_aout a un amount: 2700000 (loyer + charges incluses).
Problème : Le modèle Transaction (spec 02) ne distingue pas la part « loyer pur » de la part « charges ». Or, fiscalement et comptablement, ce sont deux lignes distinctes. Le rapport annuel (spec 04) qui calcule le « Revenu Net Opérationnel (NOI) » a besoin de cette distinction.
Correction : Ajouter rentAmount et chargesAmount au modèle Transaction pour les transactions de type LOYER.
🟠 I4. Onglet Employés absent de la page Members
Spec 03 (§3) : L'annuaire des membres liste 4 onglets : Propriétaires, Locataires, Prospecteurs, Prestataires BTP.
Mais le rôle EMPLOYE existe dans le modèle User (spec 02, ligne 142) et le spec 01 mentionne le « Paiement des Employés / Gestionnaires ».
L'onglet Employés / Gestionnaires est manquant dans la page Members.
3. Lacunes Majeures — Modèles Manquants (🟡)
🟡 L1. Modèle AuditLog non défini
Le spec 05 (§3.C) décrit en détail le journal d'audit mais aucun schéma TypeScript correspondant n'existe dans le spec 02.

typescript
export interface AuditLog {
  _id: string;
  actorClerkId: string;
  action: 'SERRURE_DEVERROUILLEE' | 'CREATION_CODE_PIN' | 'ACCES_FLUX_CAMERA' 
    | 'VIREMENT_SEQUESTRE' | 'MODIFICATION_PRIX' | 'SUPPRESSION_BIEN' | 'CHANGEMENT_ROLE';
  targetEntityType: 'Property' | 'User' | 'WorkOrder' | 'Transaction' | 'ConnectedDevice';
  targetEntityId: string;
  metadata: Record<string, unknown>;
  ipAddress: string;
  geolocation?: { lat: number; lng: number };
  timestamp: string; // ISO 8601
}
🟡 L2. Modèle Review / Rating non défini
Le spec 03 (§3, Onglet BTP) mentionne « note moyenne, avis » pour les prestataires, et le UserProfile a ratingAverage. Mais il n'y a aucun modèle Review pour stocker les avis individuels.

🟡 L3. Modèle OffreAchat / PurchaseOffer non défini
Le spec 03 (§3, Onglet Prospecteurs) mentionne « offre d'achat ou réservation ». Le type de notification OFFRE_ACHAT existe. Mais aucun modèle n'existe pour stocker les offres avec montant proposé, conditions suspensives, statut (en attente, acceptée, refusée, contre-offre).

🟡 L4. Absence de modèle Document / Fichier
L'app génère et manipule de nombreux documents : quittances de loyer PDF, devis BTP, contrats de bail signés, bulletins de salaire, photos d'état des lieux. Aucune entité Document centralisée n'existe pour la gestion documentaire (GED).

🟡 L5. Absence de configuration Dexie.js (schéma IndexedDB & index)
Le spec 01 décrit Dexie.js en théorie mais ne fournit pas le schéma de la base locale :

typescript
// Manquant : la déclaration Dexie.js avec les index optimisés pour les filtres
const db = new Dexie('juusho');
db.version(1).stores({
  properties: '_id, clerkOwnerId, listingStatus, propertyType, [address.city+listingStatus]',
  users: '_id, clerkUserId, role, email',
  leases: '_id, propertyId, tenantClerkId, leaseStatus',
  workOrders: '_id, propertyId, status, specialtyRequired',
  transactions: '_id, propertyId, transactionType, status, createdAt',
  notifications: '_id, targetUserClerkId, isRead, createdAt',
  auditLogs: '_id, actorClerkId, action, timestamp',
  syncQueue: '++id, tableName, operation, createdAt'
});
Les index composés sont essentiels pour que les filtres croisés (spec 03, §1) soient performants sur IndexedDB.

🟡 L6. Absence de stratégie de stockage des fichiers (photos, plans, modèles 3D)
Les modèles contiennent des photoUrls, floorPlanUrls, model3DUrl mais aucune spec ne définit :

Où sont stockés les fichiers ? (AWS S3 ? Cloudinary ? MongoDB GridFS ? Cloudflare R2 ?)
Quelle est la stratégie de nommage et d'organisation ?
Quelle est la limite de taille pour les modèles 3D (potentiellement > 100 Mo) ?
🟡 L7. Absence de gestion de la localisation / internationalisation (i18n)
L'application est clairement destinée à un public francophone ouest-africain (FCFA, Côte d'Ivoire), mais les specs ne prévoient pas :

La gestion multilingue (français est implicite mais pas formalisé).
Le format des devises (FCFA n'a pas de décimales, EUR en a 2).
Le format des numéros de téléphone (indicatif +225 pour CIV).
🟡 L8. Absence de mentions PWA / Service Worker
Le spec 01 mentionne « Offline-First » et l'architecture est conçue pour fonctionner hors-ligne, mais aucune mention n'est faite de :

L'enregistrement du Service Worker.
Le manifest PWA (manifest.json).
La stratégie de cache des assets statiques.
Les notifications Push natives (via Web Push API / Firebase Cloud Messaging).
4. Axes d'Amélioration (🟢)
#	Amélioration	Fichier(s)	Détail
A1	Ajouter un modèle Lease	02, 03, 06	Indispensable pour tout le cycle locatif (cf. R6 ci-dessus).
A2	Passer role en roles: UserRole[]	02, 06	Permettre le cumul de rôles (cf. R4).
A3	Ajouter CinetPay comme passerelle Mobile Money	01, 02	Remplacer Stripe pour les flux Mobile Money en CIV (cf. R2).
A4	Ajouter la politique de résolution de conflits sync	01	LWW, Server-Authoritative, flux descendant IoT (cf. R3).
A5	Ajouter le schéma Dexie.js avec index	01 ou nouveau 07	Les filtres croisés seront lents sans index composés.
A6	Corriger FOR_SALE → EN_VENTE	02	Cohérence d'enums (cf. R5).
A7	Ajouter modèles AuditLog, Review, PurchaseOffer	02	Modèles référencés mais jamais définis.
A8	Clarifier le stockage fichiers (S3/R2/Cloudinary)	01 ou nouveau fichier	Les modèles 3D peuvent peser >100 Mo.
A9	Ajouter un onglet Employés dans /members	03	Rôle existant mais absent de la page annuaire.
A10	Documenter la stratégie PWA & Service Worker	01	Essentiel pour l'offline-first promis.
A11	Renommer les var d'env NEXT_PUBLIC_* pour TanStack	01	Préfixe spécifique Next.js, pas TanStack.
A12	Étoffer le jeu de données factices (spec 06)	06	Ajouter : un bien EN_VENTE, un prospecteur/acheteur, un employé, un Lease, une notification, un AuditLog, un Review. Le mock actuel ne couvre que 2 biens et 4 users, insuffisant pour tester les rapports et graphiques admin.
5. Matrice de Couverture Croisée
Cette matrice vérifie que chaque exigence du brief utilisateur est couvert par au moins un spec :

Exigence Utilisateur	01	02	03	04	05	06	Verdict
Gestion Vente & Location	✅	✅	✅	✅	—	✅	✅ Complet
Corps de métier BTP	—	✅	✅	✅	—	✅	✅ Complet
Système de Paiement intégré	✅	✅	✅	✅	—	✅	⚠️ CinetPay manquant
Notifications par rôle	—	✅	✅	—	—	—	⚠️ Pas de mock data notif
Page des Membres scindés	—	—	✅	—	—	—	⚠️ Onglet Employés absent
Admin + CRUD + Graphiques	—	—	—	✅	—	—	✅ Complet
Rapports périodiques (5 niveaux)	—	—	—	✅	—	—	✅ Complet
Schémas Biens Immobiliers	—	✅	—	—	—	✅	⚠️ Modèle Lease manquant
Location Libre vs Airbnb	✅	✅	✅	✅	—	✅	⚠️ API directe impossible
Filtres puissants UX/UI	—	—	✅	—	—	—	⚠️ Index Dexie non définis
Objets Connectés / IoT / Domotique	✅	✅	✅	✅	✅	✅	✅ Complet
Sécurité transversale	✅	—	—	✅	✅	—	⚠️ AuditLog sans schéma
Formulaire de création de bien	—	✅	✅	—	—	—	✅ Complet
Visites 3D + Guidage IA	—	✅	✅	—	—	✅	✅ Complet
Inventaire meublé par pièce	—	✅	✅	—	—	✅	✅ Complet
Données factices complètes	—	—	—	—	—	✅	⚠️ Trop maigre (cf. A12)
Contrats / Baux	—	❌	⚠️	—	—	—	❌ Manquant
6. Recommandations de Prioritisation
Corrections à faire AVANT tout développement (Bloquants)
🔴 R6 : Créer le modèle Lease dans spec 02
🔴 R4 : Passer role → roles: UserRole[] dans spec 02
🔴 R2 : Remplacer Stripe Mobile Money par CinetPay dans spec 01
🔴 R3 : Documenter la stratégie de résolution de conflits Dexie dans spec 01
🔴 R5 : Corriger FOR_SALE → EN_VENTE dans spec 02
🔴 R1 : Reformuler l'intégration Airbnb en 3 phases (iCal → Channel Manager → Manuel)
Corrections à faire pendant le Sprint 0 (Importants)
🟡 L1-L4 : Ajouter les modèles AuditLog, Review, PurchaseOffer, Document
🟡 L5 : Définir le schéma Dexie.js avec index
🟡 L6 : Choisir et documenter le service de stockage fichiers
🟡 L8 : Spécifier la stratégie PWA / Service Worker
Corrections cosmétiques (Sprint 1+)
🟠 I1 : Harmoniser ADMIN vs ADMIN_SUPER
🟠 I2 : Renommer les variables NEXT_PUBLIC_*
🟠 I4 : Ajouter l'onglet Employés dans /members
🟢 A12 : Enrichir le jeu de données factices