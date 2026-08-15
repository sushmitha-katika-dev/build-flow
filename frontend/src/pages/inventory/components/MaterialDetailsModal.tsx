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
  const [stock, setStock] = useState<Stock | null>(null);
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
      // 0 for global warehouse stock
      const stockData = await InventoryService.getStockByMaterialAndProject(material.id, 0);
      setStock(stockData);
    } catch (err: any) {
      if (err.response?.status === 404) {
        setStock(null);
      } else {
        setError('Failed to fetch stock details.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen || !material) return null;

  const currentValuation = (stock?.currentStock || 0) * (stock?.averageUnitCost || 0);

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:p-0">
        <div className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75" onClick={onClose} />

        <div className="relative inline-block w-full max-w-md p-6 overflow-hidden text-left align-middle transition-all transform bg-white shadow-xl rounded-lg">
          <h3 className="text-lg font-medium leading-6 text-gray-900 mb-4 border-b pb-2">
            Material Details: {material.name}
          </h3>

          {error && <Alert type="error" message={error} className="mb-4" />}

          {isLoading ? (
            <div className="space-y-3">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
              <Skeleton className="h-4 w-5/6" />
            </div>
          ) : (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500 font-medium">Type / Category</p>
                  <p className="text-sm text-gray-900">{material.type}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 font-medium">Unit</p>
                  <p className="text-sm text-gray-900">{material.unit}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-sm text-gray-500 font-medium">Specifications</p>
                  <p className="text-sm text-gray-900">{material.specifications || 'None'}</p>
                </div>
              </div>

              <div className="bg-gray-50 p-4 rounded-md border border-gray-200 mt-4">
                <h4 className="text-md font-medium text-gray-900 mb-3">Stock Valuation (Global)</h4>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500 font-medium">Current Stock</p>
                    <p className="text-lg font-semibold text-gray-900">
                      {stock?.currentStock || 0} <span className="text-sm font-normal text-gray-500">{material.unit}</span>
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 font-medium">Avg Unit Cost</p>
                    <p className="text-lg font-semibold text-gray-900">
                      ₹{stock?.averageUnitCost?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '0.00'}
                    </p>
                  </div>
                  <div className="col-span-2 pt-2 border-t border-gray-200 mt-2">
                    <p className="text-sm text-gray-500 font-medium">Total Inventory Value</p>
                    <p className="text-xl font-bold text-blue-600">
                      ₹{currentValuation.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
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
