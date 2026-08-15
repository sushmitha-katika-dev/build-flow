export type ProjectStatus = 'PLANNED' | 'ACTIVE' | 'COMPLETED' | 'ON_HOLD';

export interface Project {
  id: number;
  name: string;
  client_name: string;
  manager_id: number;
  supervisor_id: number;
  start_date: string;
  estimated_budget: number;
  status: ProjectStatus;
  message?: string;
}

export interface CreateProjectRequest {
  name: string;
  client_name: string;
  manager_id: number;
  supervisor_id: number;
  start_date: string;
  estimated_budget: number;
}
