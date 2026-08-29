import { axiosClient } from '../api/axiosClient';
import type { 
  Equipment, 
  EquipmentCreateRequest,
  EquipmentAssignment,
  EquipmentAssignmentRequest,
  EquipmentUsageRecord,
  EquipmentUsageCreateRequest
} from '../types/equipment';

export const EquipmentService = {
  getAllEquipment: async (): Promise<Equipment[]> => {
    const response = await axiosClient.get<Equipment[]>('/equipment');
    return response.data;
  },

  getEquipmentById: async (id: number): Promise<Equipment> => {
    const response = await axiosClient.get<Equipment>(`/equipment/${id}`);
    return response.data;
  },

  createEquipment: async (data: EquipmentCreateRequest): Promise<Equipment> => {
    const response = await axiosClient.post<Equipment>('/equipment', data);
    return response.data;
  },

  getProjectAssignments: async (projectId: number): Promise<EquipmentAssignment[]> => {
    const response = await axiosClient.get<EquipmentAssignment[]>(`/equipment/projects/${projectId}/assignments`);
    return response.data;
  },

  assignEquipment: async (equipmentId: number, data: EquipmentAssignmentRequest): Promise<EquipmentAssignment> => {
    const response = await axiosClient.post<EquipmentAssignment>(`/equipment/${equipmentId}/assignments`, data);
    return response.data;
  },

  returnEquipment: async (assignmentId: number): Promise<EquipmentAssignment> => {
    const response = await axiosClient.put<EquipmentAssignment>(`/equipment/assignments/${assignmentId}/return`);
    return response.data;
  },

  recordUsage: async (data: EquipmentUsageCreateRequest): Promise<EquipmentUsageRecord> => {
    const response = await axiosClient.post<EquipmentUsageRecord>('/equipment/usage', data);
    return response.data;
  },

  getUsageByProjectId: async (projectId: number): Promise<EquipmentUsageRecord[]> => {
    const response = await axiosClient.get<EquipmentUsageRecord[]>(`/equipment/usage/projects/${projectId}`);
    return response.data;
  },

  getUsageByEquipmentId: async (equipmentId: number): Promise<EquipmentUsageRecord[]> => {
    const response = await axiosClient.get<EquipmentUsageRecord[]>(`/equipment/usage/equipment/${equipmentId}`);
    return response.data;
  },

  getFuelByEquipmentId: async (equipmentId: number): Promise<any[]> => {
    const response = await axiosClient.get<any[]>(`/fuel/equipment/${equipmentId}`);
    return response.data;
  },

  getMaintenanceByEquipmentId: async (equipmentId: number): Promise<any[]> => {
    const response = await axiosClient.get<any[]>(`/maintenance/equipment/${equipmentId}`);
    return response.data;
  }
};
