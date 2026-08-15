import { axiosClient } from '../api/axiosClient';
import type { 
  Equipment, 
  EquipmentCreateRequest,
  EquipmentAssignment,
  EquipmentAssignmentRequest
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
  }
};
