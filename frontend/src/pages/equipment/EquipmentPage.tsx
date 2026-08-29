import { useEffect, useState } from 'react';
import { Plus, Tractor, ArrowRightLeft, Search, ShieldCheck, Wrench, Truck, Pencil, Trash2, Eye, Zap, Shield, Filter, Sparkles } from 'lucide-react';
import { EquipmentService } from '../../services/equipmentService';
import type { Equipment } from '../../types/equipment';
import { Button } from '../../components/common/Button';
import { Alert } from '../../components/common/Alert';
import { Skeleton } from '../../components/common/Skeleton';
import { Modal } from '../../components/common/Modal';
import { EquipmentFormModal } from './components/EquipmentFormModal';
import { AssignEquipmentModal } from './components/AssignEquipmentModal';
import { EquipmentDetailsModal } from './components/EquipmentDetailsModal';
import { EditEquipmentModal } from './components/EditEquipmentModal';

export const EquipmentPage = () => {
  const [equipmentList, setEquipmentList] = useState<Equipment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [ownershipFilter, setOwnershipFilter] = useState<string>('ALL');

  const [isEquipmentModalOpen, setIsEquipmentModalOpen] = useState(false);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [selectedEquipment, setSelectedEquipment] = useState<Equipment | null>(null);
  const [editingEquipment, setEditingEquipment] = useState<Equipment | null>(null);
  const [deletingEquipment, setDeletingEquipment] = useState<Equipment | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchEquipment = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await EquipmentService.getAllEquipment();
      setEquipmentList(data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load equipment list.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchEquipment();
  }, []);

  const handleDelete = async () => {
    if (!deletingEquipment) return;
    try {
      setIsDeleting(true);
      await EquipmentService.deleteEquipment(deletingEquipment.id);
      setDeletingEquipment(null);
      fetchEquipment();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to delete equipment.');
    } finally {
      setIsDeleting(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'AVAILABLE':
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200/80 shadow-sm">
            <span className="relative flex h-2 w-2 mr-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            Available
          </span>
        );
      case 'IN_USE':
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200/80 shadow-sm">
            <span className="relative flex h-2 w-2 mr-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
            </span>
            In Use
          </span>
        );
      case 'UNDER_MAINTENANCE':
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-800 border border-amber-200/80 shadow-sm">
            <Wrench className="w-3.5 h-3.5 mr-1.5 text-amber-600 animate-spin-slow" />
            Maintenance
          </span>
        );
      case 'OUT_OF_SERVICE':
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200/80 shadow-sm">
            <span className="h-2 w-2 rounded-full bg-rose-500 mr-2"></span>
            Out of Service
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-gray-100 text-gray-800 border border-gray-200">
            {status}
          </span>
        );
    }
  };

  const getCategoryIcon = (type?: string) => {
    switch (type) {
      case 'HEAVY_MACHINERY':
        return <Tractor className="w-5 h-5 text-indigo-600" />;
      case 'VEHICLE':
        return <Truck className="w-5 h-5 text-blue-600" />;
      case 'POWER_TOOL':
        return <Zap className="w-5 h-5 text-amber-500" />;
      case 'SAFETY_GEAR':
        return <Shield className="w-5 h-5 text-emerald-600" />;
      default:
        return <Wrench className="w-5 h-5 text-slate-600" />;
    }
  };

  // Filtered List Logic
  const filteredEquipment = equipmentList.filter((eq) => {
    const matchesSearch =
      eq.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (eq.registrationNumber && eq.registrationNumber.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (eq.type && eq.type.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesStatus = statusFilter === 'ALL' || eq.status === statusFilter;
    const matchesOwnership = ownershipFilter === 'ALL' || eq.ownershipType === ownershipFilter;

    return matchesSearch && matchesStatus && matchesOwnership;
  });

  // Calculate Metrics
  const totalCount = equipmentList.length;
  const inUseCount = equipmentList.filter((e) => e.status === 'IN_USE').length;
  const availableCount = equipmentList.filter((e) => e.status === 'AVAILABLE').length;
  const maintenanceCount = equipmentList.filter((e) => e.status === 'UNDER_MAINTENANCE' || e.status === 'OUT_OF_SERVICE').length;
  const ownedCount = equipmentList.filter((e) => e.ownershipType === 'OWNED').length;
  const rentedCount = equipmentList.filter((e) => e.ownershipType === 'RENTED').length;

  return (
    <div className="space-y-6 pb-12">
      {/* Dark Gradient Executive Header */}
      <div className="relative overflow-hidden flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-gradient-to-br from-slate-900 via-slate-850 to-indigo-950 p-7 rounded-3xl text-white shadow-2xl border border-slate-800/80">
        <div className="absolute -right-12 -bottom-12 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute right-40 -top-12 w-48 h-48 bg-blue-500/10 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10">
          <div className="flex items-center space-x-3.5">
            <div className="p-3 bg-gradient-to-br from-blue-500/20 to-indigo-500/30 rounded-2xl border border-blue-400/30 shadow-inner">
              <Tractor className="w-7 h-7 text-blue-400" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">Equipment & Fleet Hub</h1>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-500/20 text-blue-300 border border-blue-400/30 uppercase tracking-widest">
                  Live Fleet
                </span>
              </div>
              <p className="text-sm text-slate-300 mt-1 font-medium max-w-xl">
                Track deployed heavy machinery, rental/owned equipment, site usage costs, and maintenance logs in real-time.
              </p>
            </div>
          </div>
        </div>

        <div className="relative z-10 flex flex-wrap items-center gap-3">
          <Button
            onClick={() => setIsAssignModalOpen(true)}
            className="bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold shadow-lg shadow-emerald-900/30 flex items-center px-4 py-2.5 transition-all transform hover:-translate-y-0.5"
          >
            <ArrowRightLeft className="w-4 h-4 mr-2" />
            Assign Equipment
          </Button>

          <Button
            onClick={() => setIsEquipmentModalOpen(true)}
            className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-xl font-bold shadow-lg shadow-blue-900/30 flex items-center px-4 py-2.5 transition-all transform hover:-translate-y-0.5"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add New Machinery
          </Button>
        </div>
      </div>

      {/* Executive KPI Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm hover:shadow-md transition-all transform hover:-translate-y-0.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-extrabold text-slate-500 uppercase tracking-wider">Total Fleet Inventory</span>
            <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-xl border border-indigo-100">
              <Tractor className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <dd className="text-2xl font-black text-slate-900">{totalCount} Units</dd>
            <span className="inline-flex items-center text-xs font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md">
              <Sparkles className="w-3 h-3 mr-1" /> Active Fleet
            </span>
          </div>
          <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-slate-500">
            <span><strong className="text-slate-900">{ownedCount}</strong> Owned</span>
            <span className="text-slate-300">•</span>
            <span><strong className="text-blue-600">{rentedCount}</strong> Rented Vendor</span>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm hover:shadow-md transition-all transform hover:-translate-y-0.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-extrabold text-slate-500 uppercase tracking-wider">Active Deployed Fleet</span>
            <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl border border-blue-100">
              <Truck className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <dd className="text-2xl font-black text-blue-600">{inUseCount} Units</dd>
            <span className="inline-flex items-center text-xs font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md">
              On Site
            </span>
          </div>
          <p className="mt-2 pt-2 border-t border-slate-100 text-xs font-medium text-slate-500">
            Operating across project sites
          </p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm hover:shadow-md transition-all transform hover:-translate-y-0.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-extrabold text-slate-500 uppercase tracking-wider">Ready for Dispatch</span>
            <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-xl border border-emerald-100">
              <ShieldCheck className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <dd className="text-2xl font-black text-emerald-600">{availableCount} Units</dd>
            <span className="inline-flex items-center text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md">
              In Yard
            </span>
          </div>
          <p className="mt-2 pt-2 border-t border-slate-100 text-xs font-medium text-slate-500">
            Available for instant assignment
          </p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm hover:shadow-md transition-all transform hover:-translate-y-0.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-extrabold text-slate-500 uppercase tracking-wider">Service & Maintenance</span>
            <div className="p-2.5 bg-amber-50 text-amber-600 rounded-xl border border-amber-100">
              <Wrench className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <dd className="text-2xl font-black text-amber-600">{maintenanceCount} Units</dd>
            <span className="inline-flex items-center text-xs font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded-md">
              Servicing
            </span>
          </div>
          <p className="mt-2 pt-2 border-t border-slate-100 text-xs font-medium text-slate-500">
            Under repair or decommissioned
          </p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search by name, reg #, category..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full rounded-xl border border-slate-300 pl-10 pr-4 py-2 text-sm font-medium focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <div className="flex items-center space-x-2 bg-slate-50 p-1.5 rounded-xl border border-slate-200">
            <Filter className="w-3.5 h-3.5 text-slate-400 ml-1" />
            <label className="text-xs font-extrabold text-slate-600 uppercase">Status:</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="rounded-lg border-none py-1 pl-2 pr-6 text-xs font-bold text-slate-800 focus:outline-none bg-transparent cursor-pointer"
            >
              <option value="ALL">All Statuses</option>
              <option value="AVAILABLE">Available</option>
              <option value="IN_USE">In Use</option>
              <option value="UNDER_MAINTENANCE">Under Maintenance</option>
              <option value="OUT_OF_SERVICE">Out of Service</option>
            </select>
          </div>

          <div className="flex items-center space-x-2 bg-slate-50 p-1.5 rounded-xl border border-slate-200">
            <label className="text-xs font-extrabold text-slate-600 uppercase ml-2">Ownership:</label>
            <select
              value={ownershipFilter}
              onChange={(e) => setOwnershipFilter(e.target.value)}
              className="rounded-lg border-none py-1 pl-2 pr-6 text-xs font-bold text-slate-800 focus:outline-none bg-transparent cursor-pointer"
            >
              <option value="ALL">All Ownership</option>
              <option value="OWNED">Owned</option>
              <option value="RENTED">Rented</option>
            </select>
          </div>

          <span className="text-xs font-bold text-slate-500 bg-slate-100 px-3 py-2 rounded-xl border border-slate-200">
            Showing {filteredEquipment.length} of {equipmentList.length} Units
          </span>
        </div>
      </div>

      {error && <Alert type="error" message={error} />}

      {/* Main Roster List */}
      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
              <Skeleton className="h-6 w-1/3 mb-2" />
              <Skeleton className="h-4 w-1/4" />
            </div>
          ))}
        </div>
      ) : filteredEquipment.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-200 border-dashed p-12 text-center shadow-sm">
          <div className="mx-auto w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mb-4">
            <Tractor className="h-8 w-8 text-slate-400" />
          </div>
          <h3 className="text-base font-bold text-slate-900">No equipment found matching filters</h3>
          <p className="mt-1 text-sm text-slate-500 max-w-sm mx-auto">
            Try adjusting your search query or add a new equipment unit to your central inventory.
          </p>
          <div className="mt-6">
            <Button onClick={() => setIsEquipmentModalOpen(true)} className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-md">
              <Plus className="w-4 h-4 mr-2" />
              Add Equipment
            </Button>
          </div>
        </div>
      ) : (
        <div className="bg-white shadow-sm rounded-3xl overflow-hidden border border-slate-200/80">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200">
              <thead className="bg-slate-50/80 backdrop-blur-sm">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-black text-slate-600 uppercase tracking-wider">Equipment Name & Reg #</th>
                  <th className="px-6 py-4 text-left text-xs font-black text-slate-600 uppercase tracking-wider">Category / Type</th>
                  <th className="px-6 py-4 text-left text-xs font-black text-slate-600 uppercase tracking-wider">Ownership</th>
                  <th className="px-6 py-4 text-left text-xs font-black text-slate-600 uppercase tracking-wider">Operational Status</th>
                  <th className="px-6 py-4 text-center text-xs font-black text-slate-600 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-slate-100">
                {filteredEquipment.map((eq) => (
                  <tr key={eq.id} className="hover:bg-slate-50/80 transition-colors group">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-3.5">
                        <div className="p-3 bg-slate-100 rounded-2xl border border-slate-200/80 text-slate-700 group-hover:scale-105 transition-transform">
                          {getCategoryIcon(eq.type)}
                        </div>
                        <div>
                          <div className="text-sm font-extrabold text-slate-900 group-hover:text-blue-600 transition-colors">
                            {eq.name}
                          </div>
                          <div className="text-xs font-mono text-slate-500 mt-0.5">
                            Reg: {eq.registrationNumber || 'N/A'}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-xs font-bold px-3 py-1 rounded-xl bg-slate-100 text-slate-700 border border-slate-200">
                        {eq.type || 'Machinery'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`text-xs font-extrabold px-3 py-1 rounded-xl border ${eq.ownershipType === 'RENTED'
                          ? 'bg-indigo-50 text-indigo-700 border-indigo-200'
                          : 'bg-slate-100 text-slate-800 border-slate-200'
                        }`}>
                        {eq.ownershipType}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(eq.status)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center text-xs font-medium">
                      <div className="flex items-center justify-center space-x-3">
                        {/* Eye Symbol - View Details */}
                        <button
                          className="inline-flex items-center justify-center px-3 py-1.5 rounded-xl text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 shadow-sm transition-all hover:scale-105 font-bold"
                          onClick={() => setSelectedEquipment(eq)}
                          title="View Details & Logs"
                        >
                          <Eye className="w-4 h-4 mr-1.5 text-blue-600" />
                          <span>View</span>
                        </button>

                        {/* Pen Symbol - Edit */}
                        <button
                          className="inline-flex items-center justify-center px-3 py-1.5 rounded-xl text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-300 shadow-sm transition-all hover:scale-105 font-bold"
                          onClick={() => setEditingEquipment(eq)}
                          title="Edit Details & Status"
                        >
                          <Pencil className="w-4 h-4 mr-1.5 text-slate-600" />
                          <span>Edit</span>
                        </button>

                        {/* Trash Symbol - Delete */}
                        <button
                          className="inline-flex items-center justify-center px-3 py-1.5 rounded-xl text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 shadow-sm transition-all hover:scale-105 font-bold"
                          onClick={() => setDeletingEquipment(eq)}
                          title="Delete Equipment"
                        >
                          <Trash2 className="w-4 h-4 mr-1.5 text-rose-600" />
                          <span>Delete</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add Modal */}
      <EquipmentFormModal
        isOpen={isEquipmentModalOpen}
        onClose={() => setIsEquipmentModalOpen(false)}
        onSuccess={fetchEquipment}
      />

      {/* Assign Modal */}
      <AssignEquipmentModal
        isOpen={isAssignModalOpen}
        onClose={() => setIsAssignModalOpen(false)}
        equipmentList={equipmentList}
      />

      {/* Details & Logs Modal */}
      <EquipmentDetailsModal
        isOpen={selectedEquipment !== null}
        onClose={() => setSelectedEquipment(null)}
        equipment={selectedEquipment}
      />

      {/* Edit & Status Reporting Modal */}
      <EditEquipmentModal
        isOpen={editingEquipment !== null}
        onClose={() => setEditingEquipment(null)}
        onSuccess={fetchEquipment}
        equipment={editingEquipment}
      />

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={deletingEquipment !== null}
        onClose={() => setDeletingEquipment(null)}
        title="Delete Equipment Unit"
      >
        <div className="space-y-4">
          <p className="text-sm text-slate-700">
            Are you sure you want to delete equipment <strong className="text-slate-900">{deletingEquipment?.name}</strong>?
            This will remove the machinery unit from master inventory.
          </p>
          <div className="flex justify-end space-x-3 pt-4 border-t border-slate-100">
            <Button variant="secondary" onClick={() => setDeletingEquipment(null)} disabled={isDeleting} className="rounded-xl">
              Cancel
            </Button>
            <Button onClick={handleDelete} disabled={isDeleting} className="bg-rose-600 hover:bg-rose-700 text-white rounded-xl shadow-md">
              {isDeleting ? 'Deleting...' : 'Delete Equipment'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
