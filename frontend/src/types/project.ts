export type ProjectStatus = 'PLANNED' | 'ACTIVE' | 'COMPLETED' | 'ON_HOLD';

export interface Project {
  id: number;
  projectCode: string;
  projectName: string;
  description?: string;
  clientName: string;
  clientContact?: string;
  location: string;
  startDate: string;
  expectedEndDate: string;
  actualEndDate?: string;
  estimatedBudget: number;
  status: ProjectStatus;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateProjectRequest {
  projectName: string;
  clientName: string;
  location: string;
  startDate: string;
  expectedEndDate: string;
  estimatedBudget: number;
}
