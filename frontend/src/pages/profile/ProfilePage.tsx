import { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { CompanyService } from '../../services/companyService';
import type { CompanyProfile } from '../../types/company';
import { Button } from '../../components/common/Button';
import { Alert } from '../../components/common/Alert';
import { Skeleton } from '../../components/common/Skeleton';
import { Badge } from '../../components/common/Badge';
import { Link } from 'react-router-dom';
import { User, Shield, Building, MapPin, Mail } from 'lucide-react';

export const ProfilePage = () => {
  const { user } = useAuth();
  const [company, setCompany] = useState<CompanyProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchProfileData();
  }, []);

  const fetchProfileData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const companyData = await CompanyService.getCompanyProfile();
      setCompany(companyData);
    } catch (err: any) {
      setError('Unable to load full company profile details.');
    } finally {
      setIsLoading(false);
    }
  };

  const getInitials = (name?: string) => {
    if (!name) return 'AD';
    const parts = name.trim().split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <Skeleton className="h-8 w-1/4" />
        <Skeleton className="h-48 w-full rounded-2xl" />
        <Skeleton className="h-64 w-full rounded-2xl" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">User Profile</h1>
          <p className="text-xs text-gray-500 mt-0.5">Manage your personal account identity and associated company context.</p>
        </div>
        <Link to="/company">
          <Button variant="secondary" size="sm">
            <Building className="w-4 h-4 mr-2" />
            Company Settings
          </Button>
        </Link>
      </div>

      {error && <Alert type="error" message={error} />}

      {/* User Identity Card */}
      <div className="bg-white rounded-2xl border border-gray-200/80 p-6 shadow-sm flex flex-col sm:flex-row items-start sm:items-center space-y-4 sm:space-y-0 sm:space-x-6">
        <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 text-white font-black text-2xl flex items-center justify-center shadow-lg shadow-blue-500/20 shrink-0 border border-blue-400/30">
          {getInitials(user?.username)}
        </div>
        
        <div className="flex-1 space-y-1">
          <div className="flex items-center space-x-3">
            <h2 className="text-xl font-bold text-gray-900">{user?.username || 'Admin'}</h2>
            <Badge variant="info">{user?.role || 'ADMIN'}</Badge>
          </div>
          <p className="text-xs text-gray-500 flex items-center">
            <Shield className="w-3.5 h-3.5 mr-1 text-blue-600" />
            System Role: <span className="font-semibold text-gray-700 ml-1">{user?.role || 'ADMIN'}</span>
          </p>
          {company && (
            <p className="text-xs text-gray-500 flex items-center mt-1">
              <Building className="w-3.5 h-3.5 mr-1 text-blue-600" />
              Company: <span className="font-semibold text-gray-900 ml-1">{company.companyName}</span>
            </p>
          )}
        </div>
      </div>

      {/* Profile Information Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Account Details */}
        <div className="bg-white rounded-2xl border border-gray-200/80 p-6 shadow-sm space-y-4">
          <div className="flex items-center space-x-2 border-b border-gray-100 pb-3">
            <User className="w-5 h-5 text-blue-600" />
            <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider">Account Information</h3>
          </div>

          <div className="space-y-3 text-xs">
            <div className="flex justify-between py-2 border-b border-gray-100">
              <span className="text-gray-500 font-medium">Username</span>
              <span className="font-bold text-gray-900">{user?.username}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-gray-100">
              <span className="text-gray-500 font-medium">Role Privilege</span>
              <span className="font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                {user?.role}
              </span>
            </div>
            <div className="flex justify-between py-2 border-b border-gray-100">
              <span className="text-gray-500 font-medium">Authentication Token</span>
              <span className="font-mono text-gray-600 bg-gray-100 px-2 py-0.5 rounded">JWT Protected</span>
            </div>
            <div className="flex justify-between py-2">
              <span className="text-gray-500 font-medium">Account Status</span>
              <span className="font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                Active Session
              </span>
            </div>
          </div>
        </div>

        {/* Company Profile Context */}
        <div className="bg-white rounded-2xl border border-gray-200/80 p-6 shadow-sm space-y-4">
          <div className="flex items-center space-x-2 border-b border-gray-100 pb-3">
            <Building className="w-5 h-5 text-blue-600" />
            <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider">Company Context</h3>
          </div>

          <div className="space-y-3 text-xs">
            <div className="flex justify-between py-2 border-b border-gray-100">
              <span className="text-gray-500 font-medium">Company Name</span>
              <span className="font-bold text-gray-900">{company?.companyName || 'ABC Constructions'}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-gray-100">
              <span className="text-gray-500 font-medium">Location</span>
              <span className="font-semibold text-gray-800 flex items-center">
                <MapPin className="w-3 h-3 mr-1 text-gray-400" />
                {company?.location || 'Bhongir, Telangana'}
              </span>
            </div>
            <div className="flex justify-between py-2 border-b border-gray-100">
              <span className="text-gray-500 font-medium">Contact Email</span>
              <span className="font-medium text-gray-800 flex items-center">
                <Mail className="w-3 h-3 mr-1 text-gray-400" />
                {company?.email || 'admin@buildflow.com'}
              </span>
            </div>
            <div className="flex justify-between py-2">
              <span className="text-gray-500 font-medium">Business Focus</span>
              <span className="font-medium text-gray-800">
                {company?.description || 'Civil Construction & Contracting'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
