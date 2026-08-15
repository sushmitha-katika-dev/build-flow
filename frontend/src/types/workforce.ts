export type AttendanceStatus = 'PRESENT' | 'ABSENT' | 'HALF_DAY';
export type CompensationType = 'DAILY' | 'FIXED_WORK' | 'MONTHLY';
export type FixedWorkStatus = 'ACTIVE' | 'COMPLETED' | 'CANCELLED';
export type PaymentStatus = 'PENDING' | 'PARTIAL' | 'COMPLETED';
export type WageStatus = 'ACTIVE' | 'CANCELLED';
export type LabourStatus = 'AVAILABLE' | 'ASSIGNED' | 'ON_LEAVE' | 'INACTIVE';
export type Gender = 'MALE' | 'FEMALE';
export type LabourRole = 'ENGINEER' | 'FOREMAN' | 'LABORER' | 'SUPERVISOR' | 'TECHNICIAN';

export interface Labourer {
  id: number;
  firstName: string;
  lastName: string;
  phoneNumber?: string;
  gender: Gender;
  role: LabourRole;
  compensationType: CompensationType;
  dailyRate?: number;
  monthlySalary?: number;
  projectId?: number;
  status: LabourStatus;
}

export interface LabourWorkforceSummary {
  id: number;
  firstName: string;
  lastName: string;
  gender: Gender;
  role: LabourRole;
  projectId?: number;
  compensationType: CompensationType;
  dailyRate?: number;
  monthlySalary?: number;
  daysWorked: number;
  totalEarned: number;
  amountPaid: number;
  remainingAmount: number;
  paymentStatus: PaymentStatus;
}

export interface FixedWorkAgreement {
  id: number;
  labourId: number;
  projectId: number;
  description: string;
  agreedAmount: number;
  status: FixedWorkStatus;
  paymentStatus?: PaymentStatus;
  amountPaid?: number;
  outstandingAmount?: number;
}

export interface FixedWorkAgreementUpdateRequest {
  description: string;
  agreedAmount: number;
}

export interface WageResponse {
  id: number;
  labourId: number;
  projectId: number;
  agreementId?: number;
  amountPaid: number;
  paymentDate: string;
}

export interface AttendanceRecord {
  id: number;
  labourId: number;
  projectId: number;
  date: string;
  status: AttendanceStatus;
  checkInTime?: string;
  checkOutTime?: string;
  earned: number;
  notes?: string;
}

export interface WageRecord {
  id: number;
  labourId: number;
  projectId?: number;
  amountPaid: number;
  paymentDate: string;
  status: WageStatus;
  notes?: string;
}

export interface LogAttendanceRequest {
  labourId: number;
  projectId?: number | null;
  date: string;
  status: AttendanceStatus;
  notes?: string;
}

export interface UpdateAttendanceRequest {
  projectId?: number;
  status?: AttendanceStatus;
}

export interface LabourCreateRequest {
  firstName: string;
  lastName: string;
  phoneNumber?: string;
  gender: Gender;
  role: LabourRole;
  compensationType: CompensationType;
  dailyRate?: number;
  monthlySalary?: number;
  projectId?: number;
}
