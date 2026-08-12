# 06 - Données Factices et Jeu d'Essai (Mock Dataset)

Ce document fournit un jeu de données JSON complet et réaliste prêt à être importé dans **Dexie.js** (IndexedDB local) et **MongoDB Atlas** pour le développement et la démonstration.

---

## 1. Jeu d'Essai des Utilisateurs (`users.json`)

```json
[
  {
    "_id": "user_admin_01",
    "clerkUserId": "user_2P9x8wQ1A2b3C4d5E6f7G8h9I0j",
    "email": "hi.cyril@gmail.com",
    "firstName": "Cyril",
    "lastName": "Raymond",
    "phoneNumber": "+2250701020304",
    "role": "ADMIN_SUPER",
    "isAdminSuper": true,
    "createdAt": "2026-01-10T08:00:00.000Z"
  },
  {
    "_id": "user_proprio_01",
    "clerkUserId": "user_proprio_88776655",
    "email": "puissancedamour@yahoo.fr",
    "firstName": "Jean-Marc",
    "lastName": "Kouassi",
    "phoneNumber": "+2250505060708",
    "role": "PROPRIETAIRE",
    "isAdminSuper": true,
    "createdAt": "2026-01-12T09:30:00.000Z"
  },
  {
    "_id": "user_locataire_01",
    "clerkUserId": "user_locataire_11223344",
    "email": "amine.diallo@example.com",
    "firstName": "Amine",
    "lastName": "Diallo",
    "phoneNumber": "+2250102030405",
    "role": "LOCATAIRE",
    "isAdminSuper": false,
    "createdAt": "2026-02-01T10:15:00.000Z"
  },
  {
    "_id": "user_btp_plombier",
    "clerkUserId": "user_btp_998877",
    "email": "contact@plomberie-pro.ci",
    "firstName": "Koffi",
    "lastName": "Brou",
    "phoneNumber": "+2250708091011",
    "role": "PRESTATAIRE_BTP",
    "isAdminSuper": false,
    "btpDetails": {
      "companyName": "Brou & Fils Plomberie Sarl",
      "siretOrRegisterId": "CI-ABJ-2024-B-1234",
      "specialties": ["PLOMBERIE"],
      "ratingAverage": 4.9,
      "hourlyRate": 15000,
      "isVerified": true
    },
    "bankDetails": {
      "mobileMoneyNumber": "+2250708091011"
    },
    "createdAt": "2026-01-15T11:00:00.000Z"
  }
]
```

---

## 2. Jeu d'Essai des Biens Immobiliers (`properties.json`)

```json
[
  {
    "_id": "prop_villa_cocody",
    "clerkOwnerId": "user_proprio_88776655",
    "title": "Villa Duplex 6 Pièces avec Piscine & Smart Locks",
    "description": "Superbe villa contemporaine meublée située à Cocody Riviera 3. Équipée d'ancres domotiques complètes et d'une scène 3D générée par IA.",
    "propertyType": "MAISON_VILLA",
    "listingStatus": "LIBRE_LOCATION",
    "address": {
      "street": "Rue de la Riviera 3",
      "city": "Abidjan",
      "district": "Cocody",
      "country": "Côte d'Ivoire",
      "coordinates": { "lat": 5.359951, "lng": -3.974452 }
    },
    "totalSurfaceSqm": 380,
    "totalRoomsCount": 6,
    "bedroomsCount": 4,
    "bathroomsCount": 4,
    "isFurnished": true,
    "financials": {
      "monthlyRentPrice": 2500000,
      "rentalCharges": 200000,
      "securityDeposit": 5000000,
      "estimatedPropertyTax": 450000
    },
    "rooms": [
      {
        "id": "room_cuisine",
        "name": "Cuisine Américaine Équipée",
        "type": "CUISINE",
        "surfaceSqm": 32,
        "items": [
          {
            "id": "item_frigo",
            "name": "Réfrigérateur Américain Samsung Inox",
            "category": "ELECTROMENAGER",
            "condition": "EXCELLENT",
            "serialNumber": "SN-SAMS-998877",
            "estimatedValue": 1200000,
            "photoUrls": ["https://images.unsplash.com/photo-1584622650111-993a426fbf0a"]
          },
          {
            "id": "item_four",
            "name": "Four Encastrable Bosch",
            "category": "ELECTROMENAGER",
            "condition": "NEUF",
            "estimatedValue": 450000,
            "photoUrls": []
          }
        ]
      },
      {
        "id": "room_master_bedroom",
        "name": "Chambre Suite Parentale",
        "type": "CHAMBRE",
        "surfaceSqm": 45,
        "items": [
          {
            "id": "item_lit",
            "name": "Lit King Size 200x200 avec Matelas Orthopédique",
            "category": "LITERIE",
            "condition": "EXCELLENT",
            "estimatedValue": 850000,
            "photoUrls": []
          }
        ]
      }
    ],
    "scene3D": {
      "status": "PRÊT",
      "floorPlanUrls": ["https://images.unsplash.com/photo-1600585154340-be6161a56a0c"],
      "capturedPhotoUrls": ["https://images.unsplash.com/photo-1600596542815-ffad4c1539a9"],
      "aiInstructions": {
        "recommendedAnglesCount": 12,
        "lightingQualityScore": 95,
        "missingZones": []
      },
      "model3DUrl": "https://assets.juusho.app/models/villa_cocody.gltf"
    },
    "connectedDevices": [
      {
        "id": "dev_lock_main",
        "name": "Serrure Entrée Principale",
        "type": "SERRURE_CONNECTEE",
        "brand": "NUKI",
        "status": "EN_LIGNE",
        "lastTelemetry": {
          "batteryLevel": 88,
          "isOpen": false,
          "updatedAt": "2026-08-12T16:00:00.000Z"
        },
        "activePinCodes": [
          {
            "code": "482910",
            "label": "Code Accès Locataire Diallo",
            "validFrom": "2026-02-01T00:00:00.000Z",
            "validUntil": "2027-01-31T23:59:59.000Z"
          }
        ]
      },
      {
        "id": "dev_leak_kitchen",
        "name": "Détecteur Fuite d'Eau Cuisine",
        "type": "CAPTEUR_FUITE_EAU",
        "brand": "TUYA",
        "status": "EN_LIGNE",
        "lastTelemetry": {
          "batteryLevel": 100,
          "isOpen": false,
          "updatedAt": "2026-08-12T16:00:00.000Z"
        }
      }
    ],
    "createdAt": "2026-01-20T14:00:00.000Z",
    "updatedAt": "2026-08-12T16:00:00.000Z"
  },
  {
    "_id": "prop_apt_assinie",
    "clerkOwnerId": "user_proprio_88776655",
    "title": "Appartement Vue Mer Assinie (Synchro Airbnb)",
    "description": "Superbe appartement bord de mer exploité en location saisonnière via Airbnb.",
    "propertyType": "APPARTEMENT",
    "listingStatus": "AIRBNB_EXTERNE",
    "address": {
      "street": "Boulevard Lagon",
      "city": "Assinie-Mafia",
      "district": "Bord de mer",
      "country": "Côte d'Ivoire",
      "coordinates": { "lat": 5.1500, "lng": -3.3000 }
    },
    "totalSurfaceSqm": 110,
    "totalRoomsCount": 3,
    "bedroomsCount": 2,
    "bathroomsCount": 2,
    "isFurnished": true,
    "financials": {
      "monthlyRentPrice": 1800000
    },
    "airbnbSync": {
      "iCalImportUrl": "https://www.airbnb.com/calendar/ical/12345678.ics?s=abcdef",
      "iCalExportUrl": "https://api.juusho.app/ical/prop_apt_assinie.ics",
      "airbnbListingId": "12345678",
      "lastSyncTimestamp": "2026-08-12T15:30:00.000Z"
    },
    "rooms": [],
    "scene3D": { "status": "NON_INITIALISE", "floorPlanUrls": [], "capturedPhotoUrls": [], "aiInstructions": { "recommendedAnglesCount": 0, "lightingQualityScore": 0, "missingZones": [] } },
    "connectedDevices": [],
    "createdAt": "2026-02-10T11:00:00.000Z",
    "updatedAt": "2026-08-12T15:30:00.000Z"
  }
]
```

---

## 3. Jeu d'Essai des Interventions BTP & Paiements (`workOrders.json` & `transactions.json`)

```json
[
  {
    "_id": "wo_plomberie_01",
    "propertyId": "prop_villa_cocody",
    "createdByClerkId": "user_locataire_11223344",
    "assignedBtpProviderId": "user_btp_plombier",
    "title": "Remplacement du joint de vidange de l'évier de la cuisine",
    "description": "Légère fuite d'eau constatée au niveau du siphon sous le meuble évier.",
    "specialtyRequired": "PLOMBERIE",
    "urgency": "MOYENNE",
    "status": "VALIDE_PAYE",
    "quoteAmount": 35000,
    "escrowPaymentId": "tx_escrow_889900",
    "photosBefore": ["https://images.unsplash.com/photo-1585704032915-c3400ca199e7"],
    "photosAfter": ["https://images.unsplash.com/photo-1584622650111-993a426fbf0a"],
    "createdAt": "2026-08-01T09:00:00.000Z",
    "completedAt": "2026-08-02T14:30:00.000Z"
  }
]
```

```json
[
  {
    "_id": "tx_loyer_aout",
    "propertyId": "prop_villa_cocody",
    "senderClerkId": "user_locataire_11223344",
    "receiverClerkId": "user_proprio_88776655",
    "amount": 2700000,
    "currency": "FCFA",
    "transactionType": "LOYER",
    "paymentMethod": "MOBILE_MONEY_WAVE",
    "status": "EFFECTUE",
    "externalReference": "WAVE_REF_9988776655",
    "createdAt": "2026-08-05T10:00:00.000Z"
  },
  {
    "_id": "tx_escrow_889900",
    "propertyId": "prop_villa_cocody",
    "workOrderId": "wo_plomberie_01",
    "senderClerkId": "user_proprio_88776655",
    "receiverClerkId": "user_btp_plombier",
    "amount": 35000,
    "currency": "FCFA",
    "transactionType": "PAIEMENT_PRESTATAIRE_BTP",
    "paymentMethod": "MOBILE_MONEY_ORANGE",
    "status": "EFFECTUE",
    "externalReference": "OM_REF_11223344",
    "createdAt": "2026-08-02T14:35:00.000Z"
  }
]
```
