export type MaterialType = 'CEMENT' | 'STEEL' | 'PAINT' | 'GENERAL';
export type MaterialUnit = 'KG' | 'LTR' | 'TON' | 'PCS' | 'METER' | 'BAG';
export type TransactionType = 'INWARD' | 'OUTWARD';
export type PurchaseStatus = 'PENDING' | 'ORDERED' | 'DELIVERED' | 'CANCELLED';

export interface Material {
  id: number;
  name: string;
  type: MaterialType;
  unit: MaterialUnit;
  specifications?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface MaterialCreateRequest {
  name: string;
  description?: string;
  type: MaterialType;
  unit: MaterialUnit;
  unitPrice: number;
  reorderLevel?: number;
}

export interface Stock {
  id: number;
  materialId: number;
  projectId: number;
  currentStock: number;
  reorderLevel: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface StockCreateRequest {
  materialId: number;
  projectId: number;
  quantity: number;
}

export interface InventoryTransaction {
  id: number;
  materialId: number;
  projectId: number;
  transactionType: TransactionType;
  quantity: number;
  transactionDate: string;
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface InventoryTransactionRequest {
  materialId: number;
  projectId: number;
  transactionType: TransactionType;
  quantity: number;
  transactionDate: string;
  notes?: string;
}
