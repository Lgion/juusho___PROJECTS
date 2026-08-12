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

### C. Base de Données Cloud : MongoDB Atlas
- **Connexion** : Définie par `MONGODB_URI` (`mongodb+srv://.../juusho`).
- **Modèle NoSQL Document** : Offre une flexibilité maximale pour imbriquer la liste variable des pièces d'un bien meublé, les scènes 3D générées par IA et les télémétries d'objets connectés (IoT).

### D. Authentification & Sécurité : Clerk Auth
- **Configuration** : Clés `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` et `CLERK_SECRET_KEY`.
- **Rôles & Métadonnées** : Les rôles (`PROPRIETAIRE`, `LOCATAIRE`, `PROSPECT_ACHETEUR`, `PRESTATAIRE_BTP`, `EMPLOYE`, `ADMIN`) sont stockés dans les `publicMetadata` des utilisateurs Clerk.
- **Détection des Admins Super-Privilégiés** : Si l'adresse email de l'utilisateur correspond à l'une des adresses listées dans la variable d'environnement `EMAIL_ADMIN` (ex: `hi.cyril@gmail.com`, `puissancedamour@yahoo.fr`), le rôle `ADMIN_SUPER` est automatiquement attribué par le serveur.

---

## 3. Synchronisation & API Externe

### A. Intégration Airbnb & Plates-formes Locatives Externes
Pour chaque bien disponible en location, le propriétaire peut indiquer si le bien est en **Libre Location** (géré 100% dans l'application) ou en **Location Multi-Plateforme (Airbnb, Booking.com)**.

1. **Synchronisation Calendrier iCal (.ics)** :
   - Importation périodique des flux iCal d'Airbnb et Booking pour bloquer automatiquement les plannings et éviter le surbooking.
   - Exportation du flux iCal de l'application vers Airbnb.
2. **API Airbnb Partner / Channel Manager** :
   - Connexion via des passerelles comme Channex ou API officielle pour récupérer :
     - Le Taux d'Occupation mensuel / annuel.
     - Le Revenu Brut Brute et le RevPAR (Revenue Per Available Room).
     - Les avis voyageurs et historiques d'évaluation.

### B. Système de Paiement Intégré (Escrow & Direct Payouts)
L'application intègre **Stripe Connect** ainsi que les passerelles **Mobile Money (Wave, Orange Money, MTN)** :
- **Encaissement des Loyer** : Prélèvement SEPA automatisé ou paiement Mobile Money par le locataire.
- **Paiement des Prestataires BTP** : Système de séquestre (*Escrow*) :
  1. Le propriétaire valide le devis BTP et bloque les fonds sur le compte de l'application.
  2. L'artisan réalise la prestation (réparation, rénovation, maçonnerie).
  3. L'état des lieux ou la validation de fin de travaux libère le paiement directement vers le compte de l'artisan.
- **Paiement des Employés / Gestionnaires** : Versement automatique des salaires et commissions.

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
