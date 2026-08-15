import { axiosClient } from '../api/axiosClient';
import type { Labourer, AttendanceRecord, LogAttendanceRequest } from '../types/workforce';

export const WorkforceService = {
  getAllLabourers: async (): Promise<Labourer[]> => {
    // Note: The API contract mentions /api/v1/workforce/labour exists
    const response = await axiosClient.get<Labourer[]>('/workforce/labour');
    return response.data;
  },

  logAttendance: async (data: LogAttendanceRequest): Promise<AttendanceRecord> => {
    const response = await axiosClient.post<AttendanceRecord>('/workforce/attendance', data);
    return response.data;
  }
};
