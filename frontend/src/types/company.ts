export interface CompanyProfile {
  id: number;
  companyName: string;
  businessType?: string;
  description?: string;
  location?: string;
  phone?: string;
  email?: string;
  logoUrl?: string;
  updatedAt?: string;
}

export interface CompanyProfileRequest {
  companyName: string;
  businessType?: string;
  description?: string;
  location?: string;
  phone?: string;
  email?: string;
  logoUrl?: string;
}
