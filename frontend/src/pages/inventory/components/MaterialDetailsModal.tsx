import { useState, useEffect } from 'react';
import { InventoryService } from '../../../services/inventoryService';
import type { Material, Stock } from '../../../types/inventory';
import { Button } from '../../../components/common/Button';
import { Alert } from '../../../components/common/Alert';
import { Skeleton } from '../../../components/common/Skeleton';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  material: Material | null;
}

export const MaterialDetailsModal = ({ isOpen, onClose, material }: Props) => {
  const [stocks, setStocks] = useState<Stock[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && material) {
      fetchStockDetails();
    }
  }, [isOpen, material]);

  const fetchStockDetails = async () => {
    if (!material) return;
    
    setIsLoading(true);
    setError(null);
    try {
      // Fetch all warehouse stock entries (project 0)
      const allStocks = await InventoryService.getProjectStock(0);
      const materialVariants = allStocks.filter(s => s.materialId === material.id);
      setStocks(materialVariants);
    } catch (err: any) {
      setError('Failed to fetch stock details.');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen || !material) return null;

  const totalStock = stocks.reduce((sum, s) => sum + (s.currentStock || 0), 0);
  const totalValuation = stocks.reduce((sum, s) => sum + ((s.currentStock || 0) * (s.averageUnitCost || 0)), 0);
  const weightedAvgUnitCost = totalStock > 0 ? (totalValuation / totalStock) : 0;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:p-0">
        <div className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75" onClick={onClose} />

        <div className="relative inline-block w-full max-w-lg p-6 overflow-hidden text-left align-middle transition-all transform bg-white shadow-xl rounded-xl">
          <div className="flex items-center justify-between border-b pb-3 mb-4">
            <h3 className="text-lg font-bold text-gray-900">
              Material Details: {material.name}
            </h3>
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-800">
              ID: #{material.id}
            </span>
          </div>

          {error && <Alert type="error" message={error} className="mb-4" />}

          {isLoading ? (
            <div className="space-y-3 py-4">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-20 w-full" />
              <Skeleton className="h-16 w-full" />
            </div>
          ) : (
            <div className="space-y-5">
              {/* Category & Unit */}
              <div className="grid grid-cols-2 gap-4 bg-gray-50 p-3 rounded-lg border border-gray-200">
                <div>
                  <p className="text-xs text-gray-500 font-semibold uppercase tracking-wider">Type / Category</p>
                  <p className="text-sm font-bold text-gray-900 mt-0.5">{material.type}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 font-semibold uppercase tracking-wider">Measurement Unit</p>
                  <p className="text-sm font-bold text-gray-900 mt-0.5">{material.unit}</p>
                </div>
              </div>

              {/* Variants & Specifications Breakdown Table */}
              <div>
                <h4 className="text-sm font-bold text-gray-900 mb-2">Company Stock by Specification / Variant</h4>
                {stocks.length === 0 ? (
                  <p className="text-xs text-gray-500 bg-gray-50 p-3 rounded border">No stock entries found for this material.</p>
                ) : (
                  <div className="border border-gray-200 rounded-lg overflow-hidden">
                    <table className="min-w-full divide-y divide-gray-200 text-xs">
                      <thead className="bg-gray-100">
                        <tr>
                          <th className="px-3 py-2 text-left font-semibold text-gray-600">Variant / Spec</th>
                          <th className="px-3 py-2 text-right font-semibold text-gray-600">Current Stock</th>
                          <th className="px-3 py-2 text-right font-semibold text-gray-600">Unit Cost (₹)</th>
                          <th className="px-3 py-2 text-right font-semibold text-gray-600">Total Value (₹)</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200 bg-white">
                        {stocks.map((s) => {
                          const specVal = (s.currentStock || 0) * (s.averageUnitCost || 0);
                          return (
                            <tr key={s.id} className="hover:bg-gray-50">
                              <td className="px-3 py-2.5 font-bold text-gray-900">
                                <span className="px-2 py-0.5 rounded bg-blue-50 text-blue-700 uppercase font-mono text-xs border border-blue-200">
                                  {s.variant || 'DEFAULT'}
                                </span>
                              </td>
                              <td className="px-3 py-2.5 text-right font-semibold text-gray-900">
                                {s.currentStock?.toLocaleString()} {material.unit}
                              </td>
                              <td className="px-3 py-2.5 text-right font-medium text-gray-700">
                                ₹{s.averageUnitCost?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                              </td>
                              <td className="px-3 py-2.5 text-right font-bold text-blue-600">
                                ₹{specVal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              {/* Overall Stock Valuation Summary */}
              <div className="bg-blue-50/60 p-4 rounded-xl border border-blue-200">
                <h4 className="text-xs font-bold text-blue-900 uppercase tracking-wider mb-3">Total Material Valuation (Global)</h4>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-gray-500 font-medium">Total Current Stock</p>
                    <p className="text-base font-bold text-gray-900">
                      {totalStock.toLocaleString()} <span className="text-xs font-normal text-gray-500">{material.unit}</span>
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 font-medium">Weighted Avg Unit Cost</p>
                    <p className="text-base font-bold text-gray-900">
                      ₹{weightedAvgUnitCost.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </p>
                  </div>
                  <div className="col-span-2 pt-2 border-t border-blue-200/60">
                    <p className="text-xs text-gray-500 font-medium">Total Inventory Value</p>
                    <p className="text-xl font-extrabold text-blue-700">
                      ₹{totalValuation.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </p>
                  </div>
                </div>
              </div>
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
