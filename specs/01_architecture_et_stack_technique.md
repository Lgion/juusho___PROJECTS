# 01 - Architecture et Stack Technique

## 1. Vue d'Ensemble & Choix de la Stack Technique

L'application **Juusho RealEstate Management** est une plate-forme de gestion immobilière moderne, conçue selon le paradigme **Local-First / Offline-First**. Elle permet aux propriétaires, gestionnaires, locataires, acheteurs et artisans du BTP d'interagir avec une latence quasi-nulle, même en cas d'instabilité réseau sur le terrain.

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                           CLIENT (FRONTEND / PWA)                               │
│                                                                                 │
│  ┌───────────────────────┐   ┌───────────────────────┐   ┌───────────────────┐  │
│  │   TanStack Router     │   │   TanStack Query      │   │   TanStack Form   │  │
│  │  (Routage & Typage)   │   │  (Gestion d'état/sync)│   │  & TanStack Table │  │
│  └───────────┬───────────┘   └───────────┬───────────┘   └─────────┬─────────┘  │
│              │                           │                         │            │
│              └───────────────────────────┼─────────────────────────┘            │
│                                          │                                      │
│                               ┌──────────┴──────────┐                           │
│                               │   Dexie.js Engine   │                           │
│                               │    (IndexedDB)      │                           │
│                               └──────────┬──────────┘                           │
└──────────────────────────────────────────┼──────────────────────────────────────┘
                                           │ (Background Sync & WebSockets)
┌──────────────────────────────────────────┴──────────────────────────────────────┐
│                           SERVEUR & CLOUD (BACKEND)                             │
│                                                                                 │
│  ┌───────────────────────┐   ┌───────────────────────┐   ┌───────────────────┐  │
│  │     Clerk Auth        │   │     MongoDB Atlas     │   │ Nodemailer SMTP   │  │
│  │  (Gestion sessions)   │   │    (Database Cloud)   │   │ (EMAIL_PASS/ADMIN)│  │
│  └───────────────────────┘   └───────────────────────┘   └───────────────────┘  │
│                                                                                 │
│  ┌───────────────────────┐   ┌───────────────────────┐   ┌───────────────────┐  │
│  │   Airbnb / iCal API   │   │  Stripe / MobileMoney │   │  IoT Broker / SSE │  │
│  │  (Synchronisation)    │   │ (Système de Paiement) │   │ (Flux Domotiques) │  │
│  └───────────────────────┘   └───────────────────────┘   └───────────────────┘  │
└─────────────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Décomposition de la Stack Outils

### A. Frontend & State Management : TanStack Framework
- **TanStack Router / Start** : Routage côté client avec typage strict des routes, chargement différé (*code splitting*) et Server Functions pour les requêtes sécurisées.
- **TanStack Query (React Query v5)** : Synchronisation asynchrone, mise en cache intelligente, re-validation en arrière-plan et mutations optimistes (*Optimistic UI Updates*).
- **TanStack Table** : Moteur de tableaux de données haute performance pour le filtre croisé, le tri et la pagination du parc immobilier et des transactions.
- **TanStack Form** : Gestion et validation des formulaires complexes multi-étapes (Création de biens, inventaire par pièce, création de contrats).

### B. Moteur Local-First : Dexie.js (IndexedDB)
- **Dexie.js** fournit une abstraction réactive et typée sur IndexedDB.
- **Principe de fonctionnement** :
  1. Toutes les lectures de données (biens, inventaires, serrures IoT, notifications) s'effectuent prioritairement sur la base locale Dexie.js. Le rendu de l'interface est ainsi instantané (< 10 ms).
  2. Les mutations (ajout d'un bien, état des lieux, paiement) sont écrites localement dans Dexie, puis enregistrées dans une file d'attente (*Mutation Sync Queue*).
  3. Dès qu'une connexion réseau est active, la file d'attente est dépilée et envoyée vers le serveur MongoDB Atlas via `TanStack Query`.
  4. Les notifications en temps réel et alertes domotiques sont reçues par Server-Sent Events (SSE) ou WebSockets et mises à jour dans Dexie via `Dexie LiveQuery`.

### B.bis. Politique de Résolution de Conflits Dexie ↔ MongoDB & Schéma IndexedDB
1. **Données Financières & Transactions (Loyer, Prix, Séquestre)** : Stratégie *Server-Authoritative*. Le serveur MongoDB est la source de vérité absolue. Les mutations locales sont soumises à la validation serveur et rejetées en cas d'incohérence.
2. **Données Descriptives & Inventaires (Titre, description, pièces, équipements)** : Stratégie *Last-Write-Wins (LWW)* basée sur l'horodatage `updatedAt`. La modification la plus récente l'emporte.
3. **Données IoT & Télémétrie** : Flux descendant uniquement (Serveur/Broker $\rightarrow$ Dexie Client). Le client ne modifie pas directement la télémétrie mais reçoit les mises à jour d'état.

#### Schéma d'Indexation Dexie.js :
```typescript
const db = new Dexie('juusho_db');
db.version(1).stores({
  properties: '_id, clerkOwnerId, listingStatus, propertyType, [address.city+listingStatus]',
  users: '_id, clerkUserId, primaryRole, email',
  leases: '_id, propertyId, tenantClerkId, ownerClerkId, leaseStatus',
  workOrders: '_id, propertyId, status, specialtyRequired',
  transactions: '_id, propertyId, transactionType, status, createdAt',
  notifications: '_id, targetUserClerkId, isRead, createdAt',
  auditLogs: '_id, actorClerkId, action, timestamp',
  syncQueue: '++id, tableName, operation, createdAt'
});
```

### C. Base de Données Cloud : MongoDB Atlas
- **Connexion** : Définie par `MONGODB_URI` (`mongodb+srv://.../juusho`).
- **Modèle NoSQL Document** : Offre une flexibilité maximale pour imbriquer la liste variable des pièces d'un bien meublé, les scènes 3D générées par IA et les télémétries d'objets connectés (IoT).

### D. Authentification & Sécurité : Clerk Auth
- **Configuration** : Clés `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` et `CLERK_SECRET_KEY` (ou `VITE_CLERK_PUBLISHABLE_KEY` selon l'environnement).
- **Rôles Multiples & Métadonnées** : Les utilisateurs peuvent cumuler plusieurs rôles (ex: `['PROPRIETAIRE', 'ADMIN_SUPER']`). La liste `roles` et le rôle principal `primaryRole` sont stockés dans les `publicMetadata` Clerk.
- **Détection des Admins Super-Privilégiés** : Si l'adresse email de l'utilisateur correspond à l'une des adresses listées dans la variable d'environnement `EMAIL_ADMIN` (ex: `hi.cyril@gmail.com`, `puissancedamour@yahoo.fr`), le rôle `ADMIN_SUPER` est automatiquement attribué.

---

## 3. Synchronisation & API Externe

### A. Intégration Airbnb & Multi-Plateformes (Stratégie en 3 Phases)
Pour éviter la dépendance à une API privée fermée, l'intégration locative externe repose sur 3 niveaux progressifs :
1. **Phase 1 (Immédiate - Standard Universel iCal)** :
   - Importation et exportation des flux `.ics` (Airbnb, Booking.com) pour bloquer les plages de dates et empêcher le surbooking sans aucune autorisation API spécifique.
2. **Phase 2 (Avancée - Passerelle Channel Manager)** :
   - Connexion via un Channel Manager tiers certifié (ex: Channex, Hospitable) pour synchroniser automatiquement les taux d'occupation, les tarifs et les revenus.
3. **Phase 3 (Fallback Manuel / Déclaratif)** :
   - Saisie manuelle directe par le propriétaire des revenus et de l'historique d'évaluation si aucune synchro automatique n'est configurée.

### B. Système de Paiement Intégré (Escrow & Direct Payouts)
L'application intègre **Stripe Connect** ainsi que les prélèvements et versements bancaires directes :
- **Encaissement des Loyers** : Prélèvement automatisé SEPA / Carte ou virement direct du locataire.
- **Paiement des Prestataires BTP** : Système de séquestre (*Escrow*) :
  1. Le propriétaire valide le devis BTP et bloque les fonds sur le compte de l'application.
  2. L'artisan réalise la prestation (réparation, rénovation, maçonnerie).
  3. L'état des lieux ou la validation de fin de travaux libère le paiement directement vers l'artisan.
- **Paiement des Employés / Gestionnaires** : Versement automatique des salaires et commissions.

### C. PWA, Service Worker & Stratégie Offline
- **Service Worker & Manifest** : Enregistrement d'un Service Worker PWA (`sw.js`) gérant le pré-caching des assets statiques (HTML, CSS, JS, icônes) et la mise en cache dynamique des modèles 3D légers.
- **Web Push Notifications** : Notifications d'urgence domotiques et rappels de loyer envoyés via l'API Web Push / FCM en arrière-plan.

---

## 4. Intégration des Variables d'Environnement

```env
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/
MONGODB_URI=mongodb+srv://archistphotos:...@cluster0.ocqa5pg.mongodb.net/juusho?retryWrites=true&w=majority
EMAIL_ADMIN=hi.cyril@gmail.com puissancedamour@yahoo.fr
EMAIL_PASS=tdev imub pooc uess
```
- `EMAIL_PASS` est utilisé via `Nodemailer` ou `Resend` pour envoyer les alertes critiques, quittances de loyer PDF et notifications de travail aux artisans.
- Pour les environnements de build (Vite / TanStack Start), les variables préfixées `NEXT_PUBLIC_*` ou `VITE_*` sont automatiquement exposées au bundler client.

