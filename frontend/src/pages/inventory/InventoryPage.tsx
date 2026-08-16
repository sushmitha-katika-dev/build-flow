import { useEffect, useState } from 'react';
import { Plus, PackageSearch, ArrowRightLeft } from 'lucide-react';
import { InventoryService } from '../../services/inventoryService';
import type { Material, Stock } from '../../types/inventory';
import { Button } from '../../components/common/Button';
import { Alert } from '../../components/common/Alert';
import { Skeleton } from '../../components/common/Skeleton';
import { Badge } from '../../components/common/Badge';
import { MaterialFormModal } from './components/MaterialFormModal';
import { TransactionFormModal } from './components/TransactionFormModal';
import { MaterialDetailsModal } from './components/MaterialDetailsModal';

export const InventoryPage = () => {
  const [materials, setMaterials] = useState<Material[]>([]);
  const [stocks, setStocks] = useState<Record<number, Stock[]>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [isMaterialModalOpen, setIsMaterialModalOpen] = useState(false);
  const [isTransactionModalOpen, setIsTransactionModalOpen] = useState(false);
  const [transactionMode, setTransactionMode] = useState<'COMPANY_STOCK_IN' | 'PROJECT_DISPATCH' | 'GENERIC'>('GENERIC');
  const [selectedMaterialId, setSelectedMaterialId] = useState<number | null>(null);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const [materialsData, stocksData] = await Promise.all([
        InventoryService.getAllMaterials(),
        InventoryService.getProjectStock(0).catch(() => []) // Project 0 is global warehouse stock
      ]);
      setMaterials(materialsData);
      
      const stockMap: Record<number, Stock[]> = {};
      stocksData.forEach((stock: Stock) => {
        if (!stockMap[stock.materialId]) {
          stockMap[stock.materialId] = [];
        }
        stockMap[stock.materialId].push(stock);
      });
      setStocks(stockMap);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load materials.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Inventory & Materials</h1>
          <p className="text-sm text-gray-500">Manage your materials and track stock movements.</p>
        </div>
        <div className="flex space-x-3">
          <Button variant="secondary" onClick={() => { setTransactionMode('COMPANY_STOCK_IN'); setIsTransactionModalOpen(true); }}>
            <Plus className="w-4 h-4 mr-2" />
            Add Company Stock
          </Button>
          <Button variant="secondary" onClick={() => { setTransactionMode('PROJECT_DISPATCH'); setIsTransactionModalOpen(true); }}>
            <ArrowRightLeft className="w-4 h-4 mr-2" />
            Dispatch to Project
          </Button>
          <Button onClick={() => setIsMaterialModalOpen(true)}>
            <Plus className="w-4 h-4 mr-2" />
            New Material
          </Button>
        </div>
      </div>

      {error && <Alert type="error" message={error} />}

      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
              <Skeleton className="h-6 w-1/3 mb-2" />
              <Skeleton className="h-4 w-1/4" />
            </div>
          ))}
        </div>
      ) : materials.length === 0 ? (
        <div className="bg-white rounded-lg border border-gray-200 border-dashed p-12 text-center">
          <PackageSearch className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-semibold text-gray-900">No materials found</h3>
          <p className="mt-1 text-sm text-gray-500">Get started by adding a new material to the catalog.</p>
          <div className="mt-6">
            <Button onClick={() => setIsMaterialModalOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              New Material
            </Button>
          </div>
        </div>
      ) : (
        <div className="bg-white shadow-sm rounded-lg overflow-hidden border border-gray-100">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Unit</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Current Stock</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Avg Unit Cost</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {materials.map((material) => {
                  const matStocks = stocks[material.id] || [];
                  const totalStock = matStocks.reduce((sum, s) => sum + (s.currentStock || 0), 0);
                  const totalValuation = matStocks.reduce((sum, s) => sum + ((s.currentStock || 0) * (s.averageUnitCost || 0)), 0);
                  const weightedAvgCost = totalStock > 0 ? (totalValuation / totalStock) : 0;

                  return (
                    <tr key={material.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-bold text-gray-900">{material.name}</div>
                        <div className="text-xs text-gray-500 mb-1">ID: #{material.id}</div>
                        {matStocks.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-1">
                            {matStocks.map((s) => (
                              <span key={s.id} className="inline-flex items-center px-2 py-0.5 rounded text-xs font-mono font-semibold bg-gray-100 text-gray-700 border border-gray-200">
                                {s.variant || 'DEFAULT'}: {s.currentStock?.toLocaleString()} {material.unit} @ ₹{s.averageUnitCost?.toFixed(2)}
                              </span>
                            ))}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Badge variant="default">{material.type}</Badge>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {material.unit}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm font-bold text-gray-900">
                          {totalStock.toLocaleString()} {material.unit}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        ₹{weightedAvgCost.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <Button variant="secondary" size="sm" onClick={() => setSelectedMaterialId(material.id)}>
                          Details
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <MaterialFormModal 
        isOpen={isMaterialModalOpen} 
        onClose={() => setIsMaterialModalOpen(false)} 
        onSuccess={fetchData} 
      />

      <TransactionFormModal
        isOpen={isTransactionModalOpen}
        mode={transactionMode}
        onClose={() => {
          setIsTransactionModalOpen(false);
          fetchData(); // Refresh after transaction
        }}
        materials={materials}
      />
      
      <MaterialDetailsModal
        isOpen={selectedMaterialId !== null}
        onClose={() => setSelectedMaterialId(null)}
        material={materials.find(m => m.id === selectedMaterialId) || null}
      />
    </div>
  );
};
