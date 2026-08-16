import { useEffect, useState } from 'react';
import { Building, MapPin, Phone, Mail, Edit3, X } from 'lucide-react';
import { CompanyService } from '../../services/companyService';
import type { CompanyProfile, CompanyProfileRequest } from '../../types/company';
import { Alert } from '../../components/common/Alert';
import { Skeleton } from '../../components/common/Skeleton';

export const CompanyPage = () => {
  const [profile, setProfile] = useState<CompanyProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Edit Modal State
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [formData, setFormData] = useState<CompanyProfileRequest>({
    companyName: '',
    businessType: '',
    description: '',
    location: '',
    phone: '',
    email: '',
    logoUrl: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [modalError, setModalError] = useState<string | null>(null);

  const fetchCompanyProfile = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await CompanyService.getCompanyProfile();
      setProfile(data);
      setFormData({
        companyName: data.companyName || '',
        businessType: data.businessType || '',
        description: data.description || '',
        location: data.location || '',
        phone: data.phone || '',
        email: data.email || '',
        logoUrl: data.logoUrl || ''
      });
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load company profile.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCompanyProfile();
  }, []);

  const getInitials = (name: string) => {
    if (!name) return 'CO';
    const parts = name.trim().split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  const handleEditOpen = () => {
    if (profile) {
      setFormData({
        companyName: profile.companyName || '',
        businessType: profile.businessType || '',
        description: profile.description || '',
        location: profile.location || '',
        phone: profile.phone || '',
        email: profile.email || '',
        logoUrl: profile.logoUrl || ''
      });
    }
    setModalError(null);
    setIsEditModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.companyName.trim()) {
      setModalError('Company name is required.');
      return;
    }

    try {
      setIsSubmitting(true);
      setModalError(null);
      const updated = await CompanyService.updateCompanyProfile(formData);
      setProfile(updated);
      setIsEditModalOpen(false);
      setSuccessMessage('Company profile updated successfully!');
      setTimeout(() => setSuccessMessage(null), 4000);
    } catch (err: any) {
      setModalError(err.response?.data?.message || 'Failed to update company profile.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6 max-w-4xl mx-auto">
        <Skeleton className="h-10 w-1/3" />
        <Skeleton className="h-64 w-full rounded-2xl" />
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Company Profile</h1>
          <p className="text-sm text-gray-500">View and update your registered contractor business information.</p>
        </div>
        <button
          onClick={handleEditOpen}
          className="inline-flex items-center px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium text-sm rounded-xl shadow-sm transition-colors"
        >
          <Edit3 className="w-4 h-4 mr-2" />
          Edit Company Profile
        </button>
      </div>

      {error && <Alert type="error" message={error} />}
      {successMessage && <Alert type="success" message={successMessage} />}

      {/* Main Profile Card */}
      {profile && (
        <div className="bg-white rounded-2xl border border-gray-200/80 shadow-sm overflow-hidden">
          {/* Cover Header */}
          <div className="h-32 bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 relative">
            <div className="absolute -bottom-10 left-8">
              <div className="w-20 h-20 rounded-2xl bg-white p-1 shadow-md border border-gray-100 flex items-center justify-center">
                {profile.logoUrl ? (
                  <img
                    src={profile.logoUrl}
                    alt={profile.companyName}
                    className="w-full h-full object-cover rounded-xl"
                  />
                ) : (
                  <div className="w-full h-full rounded-xl bg-gradient-to-br from-blue-600 to-indigo-700 text-white font-extrabold text-2xl flex items-center justify-center">
                    {getInitials(profile.companyName)}
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="pt-14 pb-8 px-8 space-y-6">
            <div>
              <h2 className="text-2xl font-extrabold text-gray-900">{profile.companyName}</h2>
              <p className="text-sm font-semibold text-blue-600 mt-0.5">{profile.businessType || 'Construction & Contracting'}</p>
              {profile.description && (
                <p className="text-sm text-gray-600 mt-2 max-w-2xl">{profile.description}</p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-gray-100">
              <div className="flex items-start space-x-3">
                <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl">
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs font-medium text-gray-500">Location / Head Office</p>
                  <p className="text-sm font-semibold text-gray-900 mt-0.5">{profile.location || 'Not Specified'}</p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <div className="p-2.5 bg-green-50 text-green-600 rounded-xl">
                  <Phone className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs font-medium text-gray-500">Phone</p>
                  <p className="text-sm font-semibold text-gray-900 mt-0.5">{profile.phone || 'Not Specified'}</p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <div className="p-2.5 bg-purple-50 text-purple-600 rounded-xl">
                  <Mail className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs font-medium text-gray-500">Official Email</p>
                  <p className="text-sm font-semibold text-gray-900 mt-0.5">{profile.email || 'Not Specified'}</p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <div className="p-2.5 bg-orange-50 text-orange-600 rounded-xl">
                  <Building className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs font-medium text-gray-500">Company Record ID</p>
                  <p className="text-sm font-semibold text-gray-900 mt-0.5">#{profile.id}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl space-y-6 relative max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b pb-4">
              <h3 className="text-lg font-bold text-gray-900">Edit Company Profile</h3>
              <button onClick={() => setIsEditModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            {modalError && <Alert type="error" message={modalError} />}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                  Company Name *
                </label>
                <input
                  type="text"
                  required
                  className="w-full px-3.5 py-2 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  value={formData.companyName}
                  onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                  Business Type / Category
                </label>
                <input
                  type="text"
                  placeholder="e.g. Civil Construction & Contracting"
                  className="w-full px-3.5 py-2 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  value={formData.businessType}
                  onChange={(e) => setFormData({ ...formData, businessType: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                  Description
                </label>
                <textarea
                  rows={3}
                  className="w-full px-3.5 py-2 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                    Location
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Bhongir, Telangana"
                    className="w-full px-3.5 py-2 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                    Phone
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. +91 9876543210"
                    className="w-full px-3.5 py-2 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                  Official Email
                </label>
                <input
                  type="email"
                  placeholder="company@example.com"
                  className="w-full px-3.5 py-2 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                  Logo Image URL (Optional)
                </label>
                <input
                  type="url"
                  placeholder="https://example.com/logo.png"
                  className="w-full px-3.5 py-2 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  value={formData.logoUrl}
                  onChange={(e) => setFormData({ ...formData, logoUrl: e.target.value })}
                />
              </div>

              <div className="flex justify-end space-x-3 pt-4 border-t">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-4 py-2 border border-gray-300 text-gray-700 text-sm font-medium rounded-xl hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-xl hover:bg-blue-700 disabled:opacity-50 inline-flex items-center"
                >
                  {isSubmitting ? 'Saving...' : 'Save Profile'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
