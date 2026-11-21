import Dexie, { Table } from 'dexie';
import { 
  Property, 
  UserProfile, 
  Lease, 
  WorkOrder, 
  Transaction, 
  PurchaseOffer, 
  Review, 
  AuditLog, 
  SyncQueueItem 
} from '../types';

export class JuushoDatabase extends Dexie {
  properties!: Table<Property, string>;
  users!: Table<UserProfile, string>;
  leases!: Table<Lease, string>;
  workOrders!: Table<WorkOrder, string>;
  transactions!: Table<Transaction, string>;
  purchaseOffers!: Table<PurchaseOffer, string>;
  reviews!: Table<Review, string>;
  auditLogs!: Table<AuditLog, string>;
  syncQueue!: Table<SyncQueueItem, number>;

  constructor() {
    super('juusho_db');

    // Indexation composite et clé unique conformément aux spécifications 01_architecture
    this.version(1).stores({
      properties: '_id, clerkOwnerId, listingStatus, propertyType, [address.city+listingStatus]',
      users: '_id, clerkUserId, primaryRole, email',
      leases: '_id, propertyId, tenantClerkId, ownerClerkId, leaseStatus',
      workOrders: '_id, propertyId, status, specialtyRequired',
      transactions: '_id, propertyId, leaseId, transactionType, status, createdAt',
      purchaseOffers: '_id, propertyId, buyerClerkId, sellerClerkId, status',
      reviews: '_id, workOrderId, targetBtpClerkId, authorClerkId',
      auditLogs: '_id, actorClerkId, action, timestamp',
      syncQueue: '++id, tableName, operation, createdAt'
    });
  }
}

export const db = new JuushoDatabase();
