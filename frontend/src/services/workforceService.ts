import { axiosClient } from '../api/axiosClient';
import type { 
  Labourer, 
  AttendanceRecord, 
  LogAttendanceRequest,
  LabourWorkforceSummary,
  LabourCreateRequest,
  FixedWorkAgreement,
  UpdateAttendanceRequest,
  WageRecord,
  FixedWorkAgreementUpdateRequest
} from '../types/workforce';

export const WorkforceService = {
  getAllLabourers: async (): Promise<Labourer[]> => {
    const response = await axiosClient.get<Labourer[]>('/workforce/labour');
    return response.data;
  },

  getLabourersByProject: async (projectId: number): Promise<Labourer[]> => {
    const response = await axiosClient.get<Labourer[]>(`/workforce/labour/project/${projectId}`);
    return response.data;
  },

  createLabourer: async (data: LabourCreateRequest): Promise<Labourer> => {
    const response = await axiosClient.post<Labourer>('/workforce/labour', data);
    return response.data;
  },

  updateLabourer: async (id: number, data: any): Promise<Labourer> => {
    const response = await axiosClient.put<Labourer>(`/workforce/labour/${id}`, data);
    return response.data;
  },

  getLabourSummary: async (): Promise<LabourWorkforceSummary[]> => {
    const response = await axiosClient.get<LabourWorkforceSummary[]>('/workforce/labour/summary');
    return response.data;
  },

  getLabourSummaryByProject: async (projectId: number): Promise<LabourWorkforceSummary[]> => {
    const response = await axiosClient.get<LabourWorkforceSummary[]>(`/workforce/labour/summary/project/${projectId}`);
    return response.data;
  },

  getAgreementsByLabour: async (labourId: number): Promise<FixedWorkAgreement[]> => {
    const response = await axiosClient.get<FixedWorkAgreement[]>(`/workforce/agreements/labour/${labourId}`);
    return response.data;
  },

  getAgreementsByProject: async (projectId: number): Promise<FixedWorkAgreement[]> => {
    const response = await axiosClient.get<FixedWorkAgreement[]>(`/workforce/agreements/project/${projectId}`);
    return response.data;
  },

  createAgreement: async (data: any): Promise<FixedWorkAgreement> => {
    const response = await axiosClient.post<FixedWorkAgreement>('/workforce/agreements', data);
    return response.data;
  },

  logAttendance: async (data: LogAttendanceRequest): Promise<AttendanceRecord> => {
    const response = await axiosClient.post<AttendanceRecord>('/workforce/attendance', data);
    return response.data;
  },

  updateAttendance: async (id: number, data: UpdateAttendanceRequest): Promise<AttendanceRecord> => {
    const response = await axiosClient.put<AttendanceRecord>(`/workforce/attendance/${id}`, data);
    return response.data;
  },

  deleteAttendance: async (id: number): Promise<void> => {
    await axiosClient.delete(`/workforce/attendance/${id}`);
  },

  bulkDeleteAttendance: async (ids: number[]): Promise<void> => {
    await axiosClient.delete('/workforce/attendance/bulk', { data: ids });
  },

  getAttendanceByLabourId: async (labourId: number): Promise<AttendanceRecord[]> => {
    const response = await axiosClient.get<AttendanceRecord[]>(`/workforce/attendance/labour/${labourId}`);
    return response.data;
  },

  recordWage: async (data: { labourId: number; projectId: number; amountPaid: number; paymentDate: string }): Promise<void> => {
    await axiosClient.post('/workforce/wages', data);
  },

  getWagesByLabourId: async (labourId: number): Promise<WageRecord[]> => {
    const response = await axiosClient.get<WageRecord[]>(`/workforce/wages/labour/${labourId}`);
    return response.data;
  },

  cancelWage: async (id: number): Promise<void> => {
    await axiosClient.put(`/workforce/wages/${id}/cancel`);
  },

  bulkCancelWages: async (ids: number[]): Promise<void> => {
    await axiosClient.put('/workforce/wages/bulk-cancel', ids);
  },

  getFixedWorkAgreementsByLabour: async (labourId: number): Promise<FixedWorkAgreement[]> => {
    const response = await axiosClient.get<FixedWorkAgreement[]>(`/workforce/agreements/labour/${labourId}`);
    return response.data;
  },

  createFixedWorkAgreement: async (request: any): Promise<FixedWorkAgreement> => {
    const response = await axiosClient.post<FixedWorkAgreement>('/workforce/agreements', request);
    return response.data;
  },

  updateFixedWorkAgreement: async (id: number, request: FixedWorkAgreementUpdateRequest): Promise<FixedWorkAgreement> => {
    const response = await axiosClient.put<FixedWorkAgreement>(`/workforce/agreements/${id}`, request);
    return response.data;
  },

  updateFixedWorkAgreementStatus: async (id: number, status: string): Promise<FixedWorkAgreement> => {
    const response = await axiosClient.patch<FixedWorkAgreement>(`/workforce/agreements/${id}/status?status=${status}`);
    return response.data;
  }
};
