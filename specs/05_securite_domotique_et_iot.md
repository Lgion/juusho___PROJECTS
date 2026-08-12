# 05 - Sécurité, Domotique et Objets Connectés (IoT)

La sécurité et la gestion domotique constituent un volet transversal majeur qui s'étend à l'ensemble du patrimoine immobilier.

---

## 1. Architecture des Ancres Domotiques (IoT Extension Anchors)

L'application intègre une couche d'abstraction IoT basée sur le standard **Matter / MQTT / REST API / RTSP**. Cette architecture permet de connecter des appareils domotiques de marques variées (Tuya, Nuki, Philips Hue, Hikvision, Sonoff).

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                           COUCHE D'ABSTRACTION IOT                              │
├─────────────────┬─────────────────┬──────────────────┬──────────────────────────┤
│    SERRURES     │    CAMÉRAS      │    ÉCLAIRAGE     │   CAPTEURS TELEMESURE    │
│  (Nuki / Tuya)  │  (RTSP / HLS)   │  (Zigbee/Matter) │  (Fuite / Fumée / kWh)   │
└────────┬────────┴────────┬────────┴────────┬─────────┴────────────┬─────────────┘
         │                 │                 │                      │
┌────────┴─────────────────┴─────────────────┴──────────────────────┴─────────────┐
│                 MOTEUR DE SÉCURITÉ & AUDIT LOGS (DEXIE + CLERK)                 │
└─────────────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Intégration des Appareils Connectés de Base

### A. Serrures Connectées (Smart Locks)
- **Fonctionnalités** :
  - Déverrouillage à distance depuis l'application mobile.
  - **Génération de Codes PIN Temporaires** :
    - *Pour les Locataires Airbnb* : Code valide strictement pendant les dates de séjour.
    - *Pour les Artisans BTP* : Code à usage unique ou restreint à la plage horaire du chantier (ex: de 08h00 à 17h00).
    - *Pour le Personnel de Nettoyage* : Code récurrent sur des plages horaires fixes.
  - Révocation instantanée du code PIN en cas d'annulation ou de fin d'intervention.

### B. Caméras de Surveillance
- **Fonctionnalités** :
  - Intégration du flux vidéo en direct (HLS / WebRTC / RTSP) directement dans la fiche du bien.
  - **Gestion de la Confidentialité (Privacy Mode)** :
    - *Bien Occupé par un Locataire* : Le flux vidéo est automatiquement **désactivé** pour préserver la vie privée.
    - *Bien Vacant, en Vente ou en Travaux BTP* : Le flux vidéo est actif pour surveiller les chantiers et prévenir les intrusions.

### C. Ampoules & Éclairage Connecté
- **Fonctionnalités** :
  - Contrôle à distance de l'allumage/extinction et de l'intensité lumineuse.
  - **Scénarios Automatisés** :
    - *Mode Présence Dissuasive* : Simulation de présence (allumage aléatoire le soir) lorsque le bien est vacant ou en vente.
    - *Économie d'Énergie* : Extinction automatique de toutes les ampoules lors du verrouillage de la serrure par le locataire sur le départ.

### D. Capteurs de Télémesure & Alerte
- **Capteur de Fuite d'Eau** : Envoi d'une alerte critique push + SMS + Email (`Nodemailer`) au propriétaire et fermeture automatique de l'électrovanne connectée d'arrivée d'eau.
- **Détecteur de Fumée & CO2** : Notification d'urgence et déverrouillage automatique des serrures pour faciliter l'évacuation.
- **Compteurs d'Énergie Intelligents (kWh)** : Suivi en temps réel de la consommation électrique et calcul des charges locatives.

---

## 3. Sécurité Transversale de l'Application

### A. Chiffrement Local Dexie.js (IndexedDB)
Pour garantir la confidentialité des données stockées localement sur le navigateur du téléphone ou de l'ordinateur :
- Les données sensibles (clés d'accès aux serrures, numéros de téléphone des locataires, RIB/Mobile Money, identifiants iCal) sont chiffrées en **AES-GCM 256 bits** via l'API Web Crypto du navigateur avant d'être écrites dans IndexedDB via Dexie.js.

### B. Contrôle d'Accès basé sur les Rôles (RBAC) & Détection Admin
- **Contrôle Fin des Permissions** :
  - Un locataire n'a accès qu'aux commandes IoT de son propre logement et uniquement pendant la durée de son bail.
  - Un artisan BTP n'a accès qu'à la serrure du logement sur lequel il a une intervention validée.
- **Super-Administrateurs** :
  - Détection automatique via l'adresse email figurant dans la variable `EMAIL_ADMIN` (ex: `hi.cyril@gmail.com`, `puissancedamour@yahoo.fr`).

### C. Journal d'Audit & Traçabilité (Audit Log)
Chaque action sensible génère une entrée immuable enregistrée localement puis synchronisée sur MongoDB Atlas :
- Horodatage précis (ISO 8601).
- Identifiant Clerk de l'utilisateur ayant exécuté l'action.
- Type d'action : `SERRURE_DEVERROUILLEE`, `CREATION_CODE_PIN`, `ACCES_FLUX_CAMERA`, `VIREMENT_SEQUESTRE`, `MODIFICATION_PRIX`.
- Adresse IP et géolocalisation de la requête.
