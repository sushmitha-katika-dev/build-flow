export type EquipmentType = 'HEAVY_MACHINERY' | 'VEHICLE' | 'POWER_TOOL' | 'HAND_TOOL' | 'SAFETY_GEAR' | 'OTHER';
export type EquipmentStatus = 'AVAILABLE' | 'IN_USE' | 'UNDER_MAINTENANCE' | 'OUT_OF_SERVICE' | 'RETIRED';
export type MaintenanceStatus = 'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';

export interface Equipment {
  id: number;
  name: string;
  type: EquipmentType;
  status: EquipmentStatus;
  registrationNumber?: string;
  isBulk: boolean;
  totalQuantity: number;
  availableQuantity: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface EquipmentCreateRequest {
  name: string;
  type: EquipmentType;
  status: EquipmentStatus;
  registrationNumber?: string;
  isBulk: boolean;
  totalQuantity: number;
}

export interface EquipmentAssignment {
  id: number;
  equipmentId: number;
  projectId: number;
  assignedQuantity: number;
  assignmentDate: string;
  returnDate?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface EquipmentAssignmentRequest {
  projectId: number;
  assignedQuantity: number;
  assignmentDate: string;
  returnDate?: string;
}
