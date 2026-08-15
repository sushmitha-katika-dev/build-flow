export type AttendanceStatus = 'PRESENT' | 'ABSENT' | 'HALF_DAY';

export interface Labourer {
  id: number;
  firstName?: string;
  lastName?: string;
  trade?: string;
  dailyRate?: number;
}

export interface AttendanceRecord {
  id: number;
  calculated_wage: number;
  message: string;
}

export interface LogAttendanceRequest {
  labourer_id: number;
  project_id: number;
  record_date: string;
  status: AttendanceStatus;
}
