import { axiosClient } from '../api/axiosClient';
import type { 
  Material, 
  MaterialCreateRequest, 
  Stock, 
  StockCreateRequest,
  InventoryTransaction,
  InventoryTransactionRequest
} from '../types/inventory';

export const InventoryService = {
  // Materials
  getAllMaterials: async (): Promise<Material[]> => {
    const response = await axiosClient.get<Material[]>('/inventory/materials');
    return response.data;
  },

  getMaterialById: async (id: number): Promise<Material> => {
    const response = await axiosClient.get<Material>(`/inventory/materials/${id}`);
    return response.data;
  },

  createMaterial: async (data: MaterialCreateRequest): Promise<Material> => {
    const response = await axiosClient.post<Material>('/inventory/materials', data);
    return response.data;
  },

  // Stocks
  getProjectStock: async (projectId: number): Promise<Stock[]> => {
    const response = await axiosClient.get<Stock[]>(`/inventory/stocks/project/${projectId}`);
    return response.data;
  },

  getStockByMaterialAndProject: async (materialId: number, projectId: number): Promise<Stock> => {
    const response = await axiosClient.get<Stock>(`/inventory/stocks/material/${materialId}/project/${projectId}`);
    return response.data;
  },

  addStock: async (data: StockCreateRequest): Promise<Stock> => {
    const response = await axiosClient.post<Stock>('/inventory/stocks', data);
    return response.data;
  },

  // Transactions
  getProjectTransactions: async (projectId: number): Promise<InventoryTransaction[]> => {
    const response = await axiosClient.get<InventoryTransaction[]>(`/inventory/transactions/project/${projectId}`);
    return response.data;
  },

  logTransaction: async (data: InventoryTransactionRequest): Promise<InventoryTransaction> => {
    const response = await axiosClient.post<InventoryTransaction>('/inventory/transactions', data);
    return response.data;
  }
};
