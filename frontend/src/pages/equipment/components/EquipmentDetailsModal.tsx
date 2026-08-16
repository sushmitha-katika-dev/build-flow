import { useEffect, useState } from 'react';
import { EquipmentService } from '../../../services/equipmentService';
import { ProjectService } from '../../../services/projectService';
import type { Equipment, EquipmentUsageRecord } from '../../../types/equipment';
import type { Project } from '../../../types/project';
import { Button } from '../../../components/common/Button';
import { Alert } from '../../../components/common/Alert';
import { Skeleton } from '../../../components/common/Skeleton';
import { Badge } from '../../../components/common/Badge';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  equipment: Equipment | null;
}

export const EquipmentDetailsModal = ({ isOpen, onClose, equipment }: Props) => {
  const [usageRecords, setUsageRecords] = useState<EquipmentUsageRecord[]>([]);
  const [fuelRecords, setFuelRecords] = useState<any[]>([]);
  const [maintenanceRecords, setMaintenanceRecords] = useState<any[]>([]);
  const [projectMap, setProjectMap] = useState<Record<number, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'USAGE' | 'MAINTENANCE' | 'FUEL'>('USAGE');

  useEffect(() => {
    if (isOpen && equipment) {
      fetchDetails();
    }
  }, [isOpen, equipment]);

  const fetchDetails = async () => {
    if (!equipment) return;
    setIsLoading(true);
    setError(null);

    try {
      const [usageData, fuelData, maintenanceData, projectsData] = await Promise.all([
        EquipmentService.getUsageByEquipmentId(equipment.id).catch(() => []),
        EquipmentService.getFuelByEquipmentId(equipment.id).catch(() => []),
        EquipmentService.getMaintenanceByEquipmentId(equipment.id).catch(() => []),
        ProjectService.getAllProjects().catch(() => [])
      ]);

      setUsageRecords(usageData);
      setFuelRecords(fuelData);
      setMaintenanceRecords(maintenanceData);

      const map: Record<number, string> = {};
      projectsData.forEach((p: Project) => {
        map[p.id] = p.projectName;
      });
      setProjectMap(map);
    } catch (err: any) {
      setError('Failed to load equipment details.');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen || !equipment) return null;

  const totalUsageCost = usageRecords.reduce((sum, r) => sum + (r.totalCost || 0), 0);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'AVAILABLE': return <Badge variant="success">Available</Badge>;
      case 'IN_USE': return <Badge variant="info">In Use</Badge>;
      case 'UNDER_MAINTENANCE': return <Badge variant="warning">Maintenance</Badge>;
      case 'OUT_OF_SERVICE': return <Badge variant="error">Out of Service</Badge>;
      default: return <Badge>{status}</Badge>;
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:p-0">
        <div className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75" onClick={onClose} />

        <div className="relative inline-block w-full max-w-2xl p-6 overflow-hidden text-left align-middle transition-all transform bg-white shadow-xl rounded-xl">
          {/* Header */}
          <div className="flex items-center justify-between border-b pb-4 mb-4">
            <div>
              <div className="flex items-center space-x-3">
                <h3 className="text-xl font-bold text-gray-900">{equipment.name}</h3>
                {getStatusBadge(equipment.status)}
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Reg No: {equipment.registrationNumber || 'N/A'} • Type: {equipment.type}
              </p>
            </div>
            <div className="text-right">
              <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200">
                {equipment.ownershipType}
              </span>
              <p className="text-sm font-extrabold text-gray-900 mt-1">
                ₹{equipment.unitRate?.toLocaleString()}/{equipment.usageUnit === 'HOURLY' ? 'hr' : 'day'}
              </p>
            </div>
          </div>

          {error && <Alert type="error" message={error} className="mb-4" />}

          {isLoading ? (
            <div className="space-y-3 py-6">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-24 w-full" />
              <Skeleton className="h-24 w-full" />
            </div>
          ) : (
            <div className="space-y-5">
              {/* Summary Cards */}
              <div className="grid grid-cols-3 gap-3">
                <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                  <p className="text-xs text-gray-500 font-medium">Total Usage Recorded</p>
                  <p className="text-lg font-bold text-gray-900 mt-0.5">{usageRecords.length} Session(s)</p>
                </div>
                <div className="p-3 bg-blue-50/70 rounded-lg border border-blue-200">
                  <p className="text-xs text-blue-700 font-medium">Total Usage Revenue/Cost</p>
                  <p className="text-lg font-bold text-blue-800 mt-0.5">₹{totalUsageCost.toLocaleString()}</p>
                </div>
                <div className="p-3 bg-purple-50/70 rounded-lg border border-purple-200">
                  <p className="text-xs text-purple-700 font-medium">Available Quantity</p>
                  <p className="text-lg font-bold text-purple-800 mt-0.5">
                    {equipment.isBulk ? `${equipment.availableQuantity} / ${equipment.totalQuantity}` : (equipment.status === 'AVAILABLE' ? '1 Available' : 'In Use')}
                  </p>
                </div>
              </div>

              {/* Navigation Tabs */}
              <div className="border-b border-gray-200 flex space-x-4">
                <button
                  onClick={() => setActiveTab('USAGE')}
                  className={`py-2 px-1 border-b-2 text-xs font-bold transition-colors ${
                    activeTab === 'USAGE'
                      ? 'border-blue-600 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  Usage History ({usageRecords.length})
                </button>
                <button
                  onClick={() => setActiveTab('MAINTENANCE')}
                  className={`py-2 px-1 border-b-2 text-xs font-bold transition-colors ${
                    activeTab === 'MAINTENANCE'
                      ? 'border-blue-600 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  Maintenance ({maintenanceRecords.length})
                </button>
                <button
                  onClick={() => setActiveTab('FUEL')}
                  className={`py-2 px-1 border-b-2 text-xs font-bold transition-colors ${
                    activeTab === 'FUEL'
                      ? 'border-blue-600 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  Fuel Logs ({fuelRecords.length})
                </button>
              </div>

              {/* Tab Contents */}
              {activeTab === 'USAGE' && (
                <div>
                  {usageRecords.length === 0 ? (
                    <div className="text-center py-6 bg-gray-50 rounded-lg border border-dashed border-gray-200 text-xs text-gray-500">
                      No usage history recorded for this equipment.
                    </div>
                  ) : (
                    <div className="border border-gray-200 rounded-lg overflow-hidden max-h-60 overflow-y-auto">
                      <table className="min-w-full divide-y divide-gray-200 text-xs">
                        <thead className="bg-gray-50 sticky top-0">
                          <tr>
                            <th className="px-3 py-2 text-left font-semibold text-gray-600">Date</th>
                            <th className="px-3 py-2 text-left font-semibold text-gray-600">Project</th>
                            <th className="px-3 py-2 text-right font-semibold text-gray-600">Units Used</th>
                            <th className="px-3 py-2 text-right font-semibold text-gray-600">Applied Rate</th>
                            <th className="px-3 py-2 text-right font-semibold text-gray-600">Total Cost</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 bg-white">
                          {usageRecords.map((r) => (
                            <tr key={r.id} className="hover:bg-gray-50">
                              <td className="px-3 py-2.5 font-medium text-gray-900">
                                {new Date(r.usageDate).toLocaleDateString()}
                              </td>
                              <td className="px-3 py-2.5 font-semibold text-gray-800">
                                {projectMap[r.projectId] || `Project #${r.projectId}`}
                              </td>
                              <td className="px-3 py-2.5 text-right font-medium text-gray-700">
                                {r.unitsUsed} {equipment.usageUnit === 'HOURLY' ? 'hrs' : 'days'}
                              </td>
                              <td className="px-3 py-2.5 text-right text-gray-600">
                                ₹{r.appliedUnitRate?.toLocaleString()}
                              </td>
                              <td className="px-3 py-2.5 text-right font-bold text-blue-600">
                                ₹{r.totalCost?.toLocaleString()}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'MAINTENANCE' && (
                <div>
                  {maintenanceRecords.length === 0 ? (
                    <div className="text-center py-6 bg-gray-50 rounded-lg border border-dashed border-gray-200 text-xs text-gray-500">
                      No maintenance records found.
                    </div>
                  ) : (
                    <div className="border border-gray-200 rounded-lg overflow-hidden max-h-60 overflow-y-auto">
                      <table className="min-w-full divide-y divide-gray-200 text-xs">
                        <thead className="bg-gray-50 sticky top-0">
                          <tr>
                            <th className="px-3 py-2 text-left font-semibold text-gray-600">Date</th>
                            <th className="px-3 py-2 text-left font-semibold text-gray-600">Description</th>
                            <th className="px-3 py-2 text-right font-semibold text-gray-600">Cost (₹)</th>
                            <th className="px-3 py-2 text-right font-semibold text-gray-600">Status</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 bg-white">
                          {maintenanceRecords.map((m) => (
                            <tr key={m.id} className="hover:bg-gray-50">
                              <td className="px-3 py-2.5 font-medium text-gray-900">{m.startDate || m.maintenanceDate || '-'}</td>
                              <td className="px-3 py-2.5 text-gray-800">{m.description || m.type || '-'}</td>
                              <td className="px-3 py-2.5 text-right font-semibold text-gray-900">₹{m.cost?.toLocaleString() || '0'}</td>
                              <td className="px-3 py-2.5 text-right font-bold">{m.status}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'FUEL' && (
                <div>
                  {fuelRecords.length === 0 ? (
                    <div className="text-center py-6 bg-gray-50 rounded-lg border border-dashed border-gray-200 text-xs text-gray-500">
                      No fuel logs recorded.
                    </div>
                  ) : (
                    <div className="border border-gray-200 rounded-lg overflow-hidden max-h-60 overflow-y-auto">
                      <table className="min-w-full divide-y divide-gray-200 text-xs">
                        <thead className="bg-gray-50 sticky top-0">
                          <tr>
                            <th className="px-3 py-2 text-left font-semibold text-gray-600">Date</th>
                            <th className="px-3 py-2 text-right font-semibold text-gray-600">Quantity (L)</th>
                            <th className="px-3 py-2 text-right font-semibold text-gray-600">Total Cost (₹)</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 bg-white">
                          {fuelRecords.map((f) => (
                            <tr key={f.id} className="hover:bg-gray-50">
                              <td className="px-3 py-2.5 font-medium text-gray-900">{f.fuelDate || '-'}</td>
                              <td className="px-3 py-2.5 text-right text-gray-800">{f.quantityLiters || f.quantity} L</td>
                              <td className="px-3 py-2.5 text-right font-bold text-gray-900">₹{f.totalCost?.toLocaleString() || '0'}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          <div className="mt-6 sm:flex sm:flex-row-reverse">
            <Button type="button" variant="secondary" className="w-full sm:w-auto" onClick={onClose}>
              Close
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
