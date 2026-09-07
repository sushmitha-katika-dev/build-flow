import { axiosClient } from '../api/axiosClient';
import type { Project, CreateProjectRequest } from '../types/project';

export const ProjectService = {
  getAllProjects: async (): Promise<Project[]> => {
    const response = await axiosClient.get<Project[]>('/projects');
    return response.data;
  },

  getActiveProjects: async (): Promise<Project[]> => {
    const response = await axiosClient.get<Project[]>('/projects/active');
    return response.data;
  },

  getProjectById: async (id: number): Promise<Project> => {
    const response = await axiosClient.get<Project>(`/projects/${id}`);
    return response.data;
  },

  createProject: async (data: CreateProjectRequest): Promise<Project> => {
    const response = await axiosClient.post<Project>('/projects', data);
    return response.data;
  },

  updateProjectStatus: async (id: number, status: string): Promise<Project> => {
    const response = await axiosClient.patch<Project>(`/projects/${id}/status`, null, {
      params: { status }
    });
    return response.data;
  },

  deleteProject: async (id: number): Promise<void> => {
    await axiosClient.delete(`/projects/${id}`);
  }
};
