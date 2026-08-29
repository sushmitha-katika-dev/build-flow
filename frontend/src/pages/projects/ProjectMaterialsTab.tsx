import { useState, useEffect, useMemo } from 'react';
import { InventoryService } from '../../services/inventoryService';
import type { Material, InventoryTransaction } from '../../types/inventory';
import { Card } from '../../components/common/Card';
import { Alert } from '../../components/common/Alert';
import { Skeleton } from '../../components/common/Skeleton';
import { PackageCheck, Calendar, ArrowDownLeft, ArrowUpRight, Receipt, Layers, Package } from 'lucide-react';

interface Props {
  projectId: number;
}

export const ProjectMaterialsTab = ({ projectId }: Props) => {
  const [transactions, setTransactions] = useState<InventoryTransaction[]>([]);
  const [materials, setMaterials] = useState<Record<number, Material>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        const [transactionsData, materialsData] = await Promise.all([
          InventoryService.getProjectTransactions(projectId).catch(() => []),
          InventoryService.getAllMaterials().catch(() => [])
        ]);
        
        // Sort transactions by date descending
        const sortedTx = [...transactionsData].sort((a, b) => 
          new Date(b.transactionDate).getTime() - new Date(a.transactionDate).getTime()
        );
        setTransactions(sortedTx);
        
        const materialMap: Record<number, Material> = {};
        materialsData.forEach(m => {
          materialMap[m.id] = m;
        });
        setMaterials(materialMap);
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to load materials transaction data.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [projectId]);

  // Compute Dispatch Statistics
  const stats = useMemo(() => {
    let totalDispatchedValue = 0;
    let totalDispatchesCount = 0;
    const uniqueMaterials = new Set<number>();

    transactions.forEach((tx) => {
      totalDispatchedValue += tx.totalCost || 0;
      totalDispatchesCount++;
      if (tx.materialId) uniqueMaterials.add(tx.materialId);
    });

    return {
      totalValue: totalDispatchedValue,
      count: totalDispatchesCount,
      uniqueMaterialsCount: uniqueMaterials.size
    };
  }, [transactions]);

  if (isLoading) {
    return (
      <div className="space-y-4 mt-4">
        <Skeleton className="h-8 w-full rounded-2xl" />
        <Skeleton className="h-20 w-full rounded-2xl" />
        <Skeleton className="h-20 w-full rounded-2xl" />
      </div>
    );
  }

  if (error) {
    return <Alert type="error" message={error} className="mt-4" />;
  }

  return (
    <div className="mt-4 space-y-6">
      {/* Top Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-5 bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white rounded-2xl shadow-lg border border-slate-800 flex items-center justify-between">
          <div>
            <p className="text-[10px] text-slate-300 font-black uppercase tracking-wider">Total Material Dispatches</p>
            <p className="text-2xl font-black text-white mt-1">{stats.count} Records</p>
            <p className="text-xs text-slate-400 mt-1 font-medium">Dispatched from Godown</p>
          </div>
          <div className="p-3 bg-blue-500/20 border border-blue-400/30 text-blue-300 rounded-2xl">
            <PackageCheck className="w-6 h-6" />
          </div>
        </Card>

        <Card className="p-5 bg-amber-50/80 border border-amber-200 rounded-2xl shadow-sm flex items-center justify-between">
          <div>
            <p className="text-[10px] text-amber-800 font-black uppercase tracking-wider">Total Material Value Dispatched</p>
            <p className="text-2xl font-black text-amber-950 mt-1">₹{stats.totalValue.toLocaleString('en-IN')}</p>
            <p className="text-xs text-amber-700 mt-1 font-medium">Valuation of received stock</p>
          </div>
          <div className="p-3 bg-amber-200/80 text-amber-800 rounded-2xl">
            <Receipt className="w-6 h-6" />
          </div>
        </Card>

        <Card className="p-5 bg-blue-50/80 border border-blue-200 rounded-2xl shadow-sm flex items-center justify-between">
          <div>
            <p className="text-[10px] text-blue-800 font-black uppercase tracking-wider">Material Types Delivered</p>
            <p className="text-2xl font-black text-blue-950 mt-1">{stats.uniqueMaterialsCount} Types</p>
            <p className="text-xs text-blue-700 mt-1 font-medium">Unique materials delivered</p>
          </div>
          <div className="p-3 bg-blue-200/80 text-blue-800 rounded-2xl">
            <Layers className="w-6 h-6" />
          </div>
        </Card>
      </div>

      {/* DISPATCH LOG TABLE */}
      <div className="space-y-4">
        <div className="flex items-center justify-between bg-white p-5 rounded-2xl border border-slate-200/90 shadow-sm">
          <div>
            <h3 className="text-lg font-black text-slate-900 flex items-center">
              <Calendar className="w-5 h-5 mr-2 text-blue-600" />
              Project Material Dispatch & Consumption Log
            </h3>
            <p className="text-xs text-slate-500 font-medium mt-0.5">Chronological record of stock dispatches from Central Godown to this project site.</p>
          </div>
          <span className="text-xs font-black px-3.5 py-1.5 bg-slate-900 text-white rounded-xl shadow-xs">
            {transactions.length} Total Logs
          </span>
        </div>

        {transactions.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-3xl border border-slate-200 border-dashed shadow-sm">
            <PackageCheck className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-700 font-extrabold text-sm">No material dispatches recorded for this project yet.</p>
            <p className="text-xs text-slate-400 mt-1">Dispatches from the Central Godown to this project site will automatically appear here by date.</p>
          </div>
        ) : (
          <div className="overflow-x-auto bg-white shadow-2xl rounded-3xl border border-slate-200/90">
            <table className="min-w-full divide-y divide-slate-100">
              <thead className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white">
                <tr>
                  <th className="px-8 py-5 text-left text-xs font-black uppercase tracking-wider text-slate-200 min-w-[140px]">Date</th>
                  <th className="px-8 py-5 text-left text-xs font-black uppercase tracking-wider text-slate-200 min-w-[240px]">Material Name</th>
                  <th className="px-8 py-5 text-center text-xs font-black uppercase tracking-wider text-slate-200 min-w-[150px]">Type</th>
                  <th className="px-8 py-5 text-left text-xs font-black uppercase tracking-wider text-slate-200 min-w-[140px]">Quantity</th>
                  <th className="px-8 py-5 text-left text-xs font-black uppercase tracking-wider text-slate-200 min-w-[150px]">Unit Cost</th>
                  <th className="px-8 py-5 text-left text-xs font-black uppercase tracking-wider text-slate-200 min-w-[160px]">Total Amount</th>
                  <th className="px-8 py-5 text-left text-xs font-black uppercase tracking-wider text-slate-200 min-w-[220px]">Notes / Reference</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-slate-100">
                {transactions.map((tx) => {
                  const material = materials[tx.materialId];
                  const formattedDate = tx.transactionDate 
                    ? new Date(tx.transactionDate).toLocaleDateString('en-GB') 
                    : '-';
                  const isDispatch = tx.transactionType === 'TRANSFER' || tx.transactionType === 'STOCK_IN';

                  return (
                    <tr key={tx.id} className="hover:bg-blue-50/20 transition-all group">
                      <td className="px-8 py-5 whitespace-nowrap min-w-[140px]">
                        <span className="px-3.5 py-1.5 bg-slate-100 text-slate-800 rounded-xl text-xs font-black font-mono border border-slate-200/80 shadow-xs">
                          {formattedDate}
                        </span>
                      </td>

                      <td className="px-8 py-5 whitespace-nowrap min-w-[240px]">
                        <div className="flex items-center space-x-3">
                          <div className="p-3 bg-amber-50 text-amber-700 rounded-2xl border border-amber-200/80 group-hover:scale-105 transition-transform flex-shrink-0">
                            <Package className="w-4.5 h-4.5" />
                          </div>
                          <div>
                            <span className="text-sm font-black text-slate-900 group-hover:text-blue-600 transition-colors block">
                              {material?.name || `Material #${tx.materialId}`}
                            </span>
                            {material?.type && (
                              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mt-0.5 block">
                                {material.type}
                              </span>
                            )}
                          </div>
                          {tx.variant && tx.variant !== 'DEFAULT' && (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-[11px] font-extrabold bg-blue-100 text-blue-800 border border-blue-200">
                              {tx.variant}
                            </span>
                          )}
                        </div>
                      </td>

                      <td className="px-8 py-5 whitespace-nowrap text-center min-w-[150px]">
                        <span className={`inline-flex items-center px-4 py-1.5 rounded-full text-xs font-black border shadow-xs ${
                          isDispatch 
                            ? 'bg-emerald-500/10 text-emerald-700 border-emerald-500/30' 
                            : 'bg-amber-500/10 text-amber-700 border-amber-500/30'
                        }`}>
                          {isDispatch ? (
                            <>
                              <ArrowDownLeft className="w-3.5 h-3.5 mr-1.5 text-emerald-600" />
                              Dispatched
                            </>
                          ) : (
                            <>
                              <ArrowUpRight className="w-3.5 h-3.5 mr-1.5 text-amber-600" />
                              {tx.transactionType}
                            </>
                          )}
                        </span>
                      </td>

                      <td className="px-8 py-5 whitespace-nowrap min-w-[140px]">
                        <span className="text-sm font-black text-slate-900">
                          {tx.quantity?.toLocaleString('en-IN')}{' '}
                          <span className="text-xs font-bold uppercase tracking-wider text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md border border-slate-200">
                            {material?.unit || 'UNIT'}
                          </span>
                        </span>
                      </td>

                      <td className="px-8 py-5 whitespace-nowrap text-xs font-mono font-black text-slate-600 min-w-[150px]">
                        ₹{tx.unitCost?.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '0.00'}
                      </td>

                      <td className="px-8 py-5 whitespace-nowrap min-w-[160px]">
                        <span className="text-sm font-black text-slate-900">
                          ₹{tx.totalCost?.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '0.00'}
                        </span>
                      </td>

                      <td className="px-8 py-5 text-xs font-medium text-slate-600 min-w-[220px] max-w-xs truncate">
                        {tx.notes || '-'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
