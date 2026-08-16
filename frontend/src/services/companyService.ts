import { axiosClient } from '../api/axiosClient';
import type { CompanyProfile, CompanyProfileRequest } from '../types/company';

export const CompanyService = {
  getCompanyProfile: async (): Promise<CompanyProfile> => {
    const response = await axiosClient.get<CompanyProfile>('/company/profile');
    return response.data;
  },

  updateCompanyProfile: async (data: CompanyProfileRequest): Promise<CompanyProfile> => {
    const response = await axiosClient.put<CompanyProfile>('/company/profile', data);
    return response.data;
  }
};
