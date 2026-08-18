# 03 - Fonctionnalités et Parcours Utilisateurs

Ce document décrit en détail les fonctionnalités clés de l'application et l'expérience utilisateur (UX/UI) pour chaque groupe d'utilisateurs.

---

## 1. Ergonomie Général & Filtrage Transcendant des Biens

L'interface de consultation des biens est conçue pour permettre de basculer en 1 clic entre les biens **À la Location** (Libre ou Airbnb) et les biens **À la Vente**.

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│ [ Biens à la Location (34) ]  │  [ Biens à la Vente (12) ]  │  [ Biens Airbnb (8) ]│
├─────────────────────────────────────────────────────────────────────────────────┤
│ Filtres Rapides : [ Modèle 3D Disponible ⚡ ] [ Meublé 🛋️ ] [ IoT Connecté 🔒 ]  │
│ Recherche : [ Tapez une ville, un quartier ou une référence...               ]  │
└─────────────────────────────────────────────────────────────────────────────────┘
```

### Système de Filtres Avancés UX/UI
Les filtres sont intégrés nativement dans le schéma de données pour des requêtes instantanées sur Dexie.js (IndexedDB) :
1. **Type de Transaction** : Location Libre, Airbnb, Vente.
2. **Type de Bien** : Appartement, Villa, Immeuble, Terrain, Local Commercial.
3. **Plage Financière** : Loyer mensuel min/max ou Prix de vente min/max.
4. **Inventaire & Équipements** : Meublé, Présence d'un inventaire certifié par pièce.
5. **Visite Virtuelle** : Présence d'une scène 3D interactive validée.
6. **Équipements Domotiques** : Présence de serrures intelligentes, caméras ou télémesure d'énergie.

---

## 2. Formulaire Multi-Étapes de Création & Édition d'un Bien

La saisie d'un bien immobilier est découpée en **5 étapes fluides** avec sauvegarde automatique dans Dexie.js (brouillon conservé hors-ligne) :

### Étape 1 : Informations Générales & Status Exploitation
- Titre, description, type de bien, surface (m²), nombre de pièces, chambres, salles de bain.
- Choix du mode d'exploitation :
  - `LIBRE_LOCATION` : Saisie des loyers HC, charges locatives, dépôt de garantie.
  - `AIRBNB_EXTERNE` : Saisie du lien d'importation iCal et paramétrage du Channel Manager.
  - `EN_VENTE` : Saisie du prix de vente honoraires inclus, frais de notaire estimés.

### Étape 2 : Photographies, Plans & Guidage IA pour la Scène 3D
- Téleversement des plans de masse et schémas 2D de l'architecte.
- **Module Assistant IA de Prise de Vue** :
  1. L'application guide le propriétaire pièce par pièce avec une overlay en réalité augmentée sur l'appareil photo mobile.
  2. L'IA indique l'angle exact, le niveau de luminosité et la hauteur d'appareil optimale pour capturer les scènes en chevauchement.
  3. Lancement de la génération 3D (NeRF / Gaussian Splatting) en tâche de fond.

### Étape 3 : Inventaire Pièce par Pièce (Biens Meublés)
Si l'option "Meublé" est activée, un configurateur dynamique s'ouvre pour répertorier l'équipement propre à chaque zone :
- **Cuisine** : Réfrigérateur, four, micro-ondes, lave-vaisselle, ustensiles.
- **Chambre à coucher** : Lit (taille/matelas), armoire, tables de chevet, climatiseur.
- **Garage** : Outillage, porte de garage automatique, étagères de rangement.
- **Salon / Séjour** : Canapé, télévision, table basse, luminaires.
Pour chaque objet : photo, état (Neuf / Bon / Usé), numéro de série et valeur estimée en FCFA / EUR.

### Étape 4 : Ancrage des Objets Connectés (IoT & Domotique)
- Scan et appairage des ampoules intelligentes, caméras de surveillance RTSP et serrures connectées Nuki/Tuya.
- Affectation des appareils aux pièces correspondantes.

### Étape 5 : Révision & Publication
- Aperçu en direct de la fiche du bien, génération de la quittance modèle et validation.

---

## 3. Annuaire & Page des Membres Scindés (`/members`)

Une page dédiée répertorie l'ensemble des acteurs inscrits sur la plate-forme, séparés par 5 onglets étanches selon le rôle principal ou secondaire :

```
┌───────────────────────────────────────────────────────────────────────────────────────────┐
│ [ Propriétaires ] │ [ Locataires ] │ [ Prospecteurs ] │ [ Prestataires BTP ] │ [ Employés ] │
└───────────────────────────────────────────────────────────────────────────────────────────┘
```

1. **Onglet Propriétaires** : Liste des investisseurs avec le nombre de biens possédés et le taux d'occupation global.
2. **Onglet Locataires** : Liste des occupants actuels, statut du contrat de bail `Lease` associé, état des paiements de loyers (À jour / En retard) et bouton "Générer Quittance PDF".
3. **Onglet Prospecteurs / Acheteurs** : Liste des acquéreurs potentiels ayant soumis une offre d'achat `PurchaseOffer` ou une réservation.
4. **Onglet Prestataires BTP & Services** :
   - Classés par corps de métier (Maçonnerie, Plomberie, Électricité, Peinture, Menuiserie, Nettoyage).
   - Affichage de la note moyenne `ratingAverage`, des avis `Review`, du tarif horaire et du bouton "Mandater / Demander un Devis".
5. **Onglet Employés & Gestionnaires** :
   - Liste des gestionnaires locatifs et techniciens salariés internes.
   - Biens assignés, salaire fixe et commissions sur encaissements.

---

## 4. Parcours Dédié aux Artisans BTP & Marketplace de Services

1. **Publication d'un Besoin d'Intervention** : Le propriétaire, le gestionnaire ou le locataire signale une panne ou un projet de rénovation (ex: "Remplacement chauffe-eau").
2. **Notification Subordonnée** : Les prestataires de la spécialité `PLOMBERIE` reçoivent une notification instantanée.
3. **Soumission de Devis** : L'artisan envoie un devis chiffré directement dans l'application.
4. **Séquestre et Paiement en App** :
   - Le propriétaire valide le devis. Les fonds sont bloqués en séquestre (`ESCROW`).
   - L'artisan effectue les travaux et prend une photo "Après".
   - Le propriétaire valide l'intervention : le paiement est débloqué immédiatement vers le compte ou le RIB de l'artisan.
5. **Avis & Notation** : Le propriétaire ou gestionnaire dépose une note et un avis (`Review`) sur la prestation de l'artisan.

---

## 5. Système de Notifications Ciblées

Chaque profil dispose d'un flux de notifications distinct :
- **Propriétaire** : Alerte de réception du loyer, proposition d'achat, fuite d'eau détectée par capteur IoT, devis BTP reçu.
- **Locataire** : Rappel d'échéance de loyer, code PIN provisoire de serrure généré, validation de demande d'intervention BTP.
- **Prospecteur / Acheteur** : Confirmation de rendez-vous de visite 3D, statut d'acceptation de l'offre d'achat.
- **Prestataires BTP** : Appel d'offres dans sa zone géographique, déblocage des fonds de paiement de facture.
- **Employé / Gestionnaire** : Tâches d'état des lieux assignées, nouvelles pannes signalées sur son parc de biens.

