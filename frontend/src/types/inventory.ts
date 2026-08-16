export type MaterialType = 'CEMENT' | 'STEEL' | 'PAINT' | 'GENERAL';
export type MaterialUnit = 'KG' | 'LTR' | 'TON' | 'PCS' | 'METER' | 'BAG';
export type TransactionType = 'STOCK_IN' | 'CONSUMPTION' | 'TRANSFER' | 'ADJUSTMENT';
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
  reorderLevel?: number;
}

export interface Stock {
  id: number;
  materialId: number;
  projectId: number;
  variant?: string;
  currentStock: number;
  reorderLevel: number;
  averageUnitCost?: number;
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
  projectId?: number;
  variant?: string;
  transactionType: TransactionType;
  quantity: number;
  unitCost?: number;
  totalCost?: number;
  transactionDate: string;
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface InventoryTransactionRequest {
  materialId: number;
  projectId?: number;
  variant?: string;
  transactionType: TransactionType;
  quantity: number;
  unitCost?: number;
  transactionDate: string;
  notes?: string;
}
