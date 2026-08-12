# 04 - Tableau de Bord Admin et Reporting Financial

Ce document détaille les spécifications du panneau d'administration centralisé, de la gestion CRUD des modèles et de la génération des rapports statistiques financiers.

---

## 1. Détection des Administrateurs Super-Privilégiés

La sécurité de la console d'administration repose sur deux niveaux :
1. **Contrôle d'accès basé sur les Rôles (RBAC Clerk)** : Le rôle `ADMIN_SUPER` doit être présent dans les métadonnées de la session Clerk.
2. **Vérification d'adresse d'Administration via `.env`** :
   Au démarrage ou lors de la connexion, le serveur valide la présence de l'adresse email de l'utilisateur dans la liste d'environnement `EMAIL_ADMIN` :
   ```env
   EMAIL_ADMIN=hi.cyril@gmail.com puissancedamour@yahoo.fr
   ```
   Si l'email correspond, l'utilisateur a accès complet à toutes les opérations CRUD, au déblocage manuel des séquestres de paiement et aux métriques financières globales.

---

## 2. Opérations CRUD d'Administration Globales

Le panneau d'administration (`/admin`) offre une vue consolidée avec filtre rapide et édition en masse pour tous les modèles de l'application :

| Modèle | Action CRUD d'Administration |
|---|---|
| **Biens Immobilier** (`Property`) | Création, modification du statut (Location Libre, Airbnb, Vente), réaffectation de propriétaire, désactivation d'annonces. |
| **Membres & Rôles** (`User`) | Attribution des rôles (Propriétaire, Locataire, BTP, Employé), validation des diplômes/assurances des artisans BTP. |
| **Interventions BTP** (`WorkOrder`) | Validation de devis, médiation en cas de litige entre propriétaire et artisan, déblocage de secours des fonds en séquestre. |
| **Paiements & Flux** (`Transaction`) | Suivi de l'ensemble des flux d'argent, gestion des litiges de loyers, édition des bulletins de salaire des employés. |
| **Domotique & IoT** (`ConnectedDevice`) | Supervision du parc d'objets connectés, révocation globale de serrures ou caméras compromise. |

---

## 3. Visualisations Graphiques & Indicateurs Financiers (KPIs)

Dès la connexion à la page d'accueil d'administration, un tableau de bord analytique interactif présente la santé économique du patrimoine immobilier :

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│ VALEUR DU PARC      REVENUS BRUTS (MOIS)   NOI (REVENU NET OPER.)   TAUX OCCUPATION│
│ 1 450 000 000 FCFA     18 500 000 FCFA          14 200 000 FCFA            94.2 %  │
└─────────────────────────────────────────────────────────────────────────────────┘
```

### A. Graphiques & Camemberts
1. **Camembert de Répartition des Biens** :
   - Biens en Libre Location (%) vs Biens Airbnb Externe (%) vs Biens en Vente (%) vs Biens en Travaux (%).
2. **Histogramme Comparatif Revenus vs Dépenses** :
   - Évolution mois par mois des loyers encaissés par rapport aux frais de gestion, charges BTP et taxes foncières.
3. **Graphique Donut de Ventilation des Dépenses BTP** :
   - Répartition du budget rénovation par corps de métier (Plomberie, Électricité, Maçonnerie, Peinture).
4. **Performance Comparative Airbnb vs Location Longue Durée** :
   - Courbe comparant le revenu net généré par la location saisonnière Airbnb vs le bail de location classique.

---

## 4. Rapports Périodiques Automatisés

L'application intègre un moteur de calcul statistique capable d'exporter et d'afficher des rapports détaillés selon 5 temporalités :

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│ [ Hebdomadaire ]  [ Mensuel ]  [ Trimestriel ]  [ Annuel ]  [ Quinquennal 5 ans]│
└─────────────────────────────────────────────────────────────────────────────────┘
```

### 1. Rapport Hebdomadaire
- Synthèse des encaissements de loyer de la semaine.
- Liste des travaux BTP programmés et clôturés.
- Alertes domotiques (pannes de serrures, batteries faibles, intrusions).

### 2. Rapport Mensuel
- Bilan financier du mois : Loyer brut encaissé, impayés, frais de gestion prélevés.
- Synthèse des taux d'occupation Airbnb (synchro iCal / API).
- Génération et envoi automatique par e-mail (`Nodemailer` + `EMAIL_PASS`) des quittances de loyer aux locataires.

### 3. Rapport Trimestriel
- Déclarations fiscales prévisionnelles.
- Indice de vétusté et coûts de maintenance du trimestre.
- Analyse du turnover des locataires.

### 4. Rapport Annuel
- Bilan comptable et fiscal complet de l'exercice (Bénéfices Industriels et Commerciaux / Revenus Fonciers).
- Taux de rendement brut et net par bien immobilier.
- Évaluation de l'appréciation de la valeur vénale du parc.

### 5. Rapport Quinquennal (Projection & Analyse sur 5 Ans)
- **Analyse Longitudinale sur 5 ans** : Analyse des tendances d'appréciation immobilière et de l'inflation des loyers sur 60 mois.
- **Plan de Gros Entretien Quinquennal** : Planification prévisionnelle des gros travaux de structure (ravalement de façade, toiture, mise aux normes électriques).
- **Calcul du ROI Cumulé (Return on Investment)** et stratégie d'arbitrage (vendre les biens moins rentables pour réinvestir dans de nouvelles acquisitions).
