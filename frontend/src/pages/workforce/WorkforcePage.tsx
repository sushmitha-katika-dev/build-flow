import { useEffect, useState, useMemo } from 'react';
import { Users, IndianRupee, UserPlus, HardHat, Info } from 'lucide-react';
import { WorkforceService } from '../../services/workforceService';
import type { LabourWorkforceSummary } from '../../types/workforce';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Alert } from '../../components/common/Alert';
import { Skeleton } from '../../components/common/Skeleton';
import { Input } from '../../components/common/Input';
import { AddWorkforceMemberModal } from './AddWorkforceMemberModal';
import { WorkerDetailsModal } from './WorkerDetailsModal';

export const WorkforcePage = () => {
  const [summaries, setSummaries] = useState<LabourWorkforceSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedWorker, setSelectedWorker] = useState<LabourWorkforceSummary | null>(null);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await WorkforceService.getLabourSummary();
      setSummaries(data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load workforce summary.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const { totalWorkers, maleWorkers, femaleWorkers, pendingPay } = useMemo(() => {
    let maleWorkers = 0;
    let femaleWorkers = 0;
    let pendingPay = 0;

    summaries.forEach((s) => {
      if (s.gender === 'MALE') maleWorkers++;
      else if (s.gender === 'FEMALE') femaleWorkers++;
      pendingPay += s.remainingAmount || 0;
    });

    return {
      totalWorkers: summaries.length,
      maleWorkers,
      femaleWorkers,
      pendingPay
    };
  }, [summaries]);

  const filteredSummaries = useMemo(() => {
    if (!search) return summaries;
    const lowerSearch = search.toLowerCase();
    return summaries.filter((s) => 
      s.firstName.toLowerCase().includes(lowerSearch) || 
      s.lastName.toLowerCase().includes(lowerSearch) ||
      s.role.toLowerCase().includes(lowerSearch)
    );
  }, [summaries, search]);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-10 w-32" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card><Skeleton className="h-20 w-full" /></Card>
          <Card><Skeleton className="h-20 w-full" /></Card>
          <Card><Skeleton className="h-20 w-full" /></Card>
          <Card><Skeleton className="h-20 w-full" /></Card>
        </div>
        <Card><Skeleton className="h-64 w-full" /></Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">Workforce Dashboard</h1>
        </div>
        <Alert type="error" message={error} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Workforce Dashboard</h1>
          <p className="text-sm text-gray-500">Manage your entire construction workforce across all projects.</p>
        </div>
        <Button 
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center"
        >
          <UserPlus className="w-4 h-4 mr-2" />
          Add Worker
        </Button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="flex items-center space-x-4">
          <div className="p-3 bg-blue-100 text-blue-600 rounded-lg">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Total Workers</p>
            <p className="text-2xl font-bold text-gray-900">{totalWorkers}</p>
          </div>
        </Card>
        <Card className="flex items-center space-x-4">
          <div className="p-3 bg-indigo-100 text-indigo-600 rounded-lg">
            <HardHat className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Male</p>
            <p className="text-2xl font-bold text-gray-900">{maleWorkers}</p>
          </div>
        </Card>
        <Card className="flex items-center space-x-4">
          <div className="p-3 bg-pink-100 text-pink-600 rounded-lg">
            <HardHat className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Female</p>
            <p className="text-2xl font-bold text-gray-900">{femaleWorkers}</p>
          </div>
        </Card>
        <Card className="flex items-center space-x-4">
          <div className="p-3 bg-amber-100 text-amber-600 rounded-lg">
            <IndianRupee className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Pending Pay</p>
            <p className="text-2xl font-bold text-gray-900">₹{pendingPay.toLocaleString('en-IN')}</p>
          </div>
        </Card>
      </div>

      <Card>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
          <h2 className="text-lg font-bold text-gray-900">Worker Registry</h2>
          <div className="w-full sm:w-64">
            <Input 
              type="text" 
              placeholder="Search workers..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full"
            />
          </div>
        </div>

        {filteredSummaries.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <Info className="mx-auto h-12 w-12 text-gray-400 mb-3" />
            <p>No workers found matching your criteria.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Attendance</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Earnings</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Pending Pay</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredSummaries.map((worker) => (
                  <tr key={worker.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold">
                          {worker.firstName.charAt(0)}{worker.lastName.charAt(0)}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{worker.firstName} {worker.lastName}</div>
                          <div className="text-sm text-gray-500">{worker.gender}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{worker.role}</div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">
                        {worker.compensationType.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{worker.daysWorked} days</div>
                      {worker.compensationType === 'DAILY' && (
                        <div className="text-xs text-gray-500">@ ₹{worker.dailyRate?.toLocaleString('en-IN')}/day</div>
                      )}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">Total: ₹{(worker.totalEarned || 0).toLocaleString('en-IN')}</div>
                      <div className="text-xs text-gray-500">Paid: ₹{(worker.amountPaid || 0).toLocaleString('en-IN')}</div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        worker.paymentStatus === 'COMPLETED' ? 'bg-green-100 text-green-800' :
                        worker.paymentStatus === 'PARTIAL' ? 'bg-amber-100 text-amber-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {worker.paymentStatus}
                      </span>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">₹{worker.remainingAmount?.toLocaleString('en-IN') || 0}</div>
                      <div className="text-xs text-gray-500">pending</div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm font-medium">
                      <Button variant="outline" onClick={() => setSelectedWorker(worker)}>
                        View Details
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      <AddWorkforceMemberModal 
        isOpen={isAddModalOpen} 
        onClose={() => setIsAddModalOpen(false)} 
        onSuccess={() => fetchData()} 
      />

      <WorkerDetailsModal
        isOpen={!!selectedWorker}
        onClose={() => setSelectedWorker(null)}
        worker={selectedWorker}
        onUpdate={() => fetchData()}
      />
    </div>
  );
};
