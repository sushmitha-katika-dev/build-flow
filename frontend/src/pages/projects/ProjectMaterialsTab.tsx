import { useState, useEffect } from 'react';
import { InventoryService } from '../../services/inventoryService';
import type { Stock, Material } from '../../types/inventory';
import { Alert } from '../../components/common/Alert';
import { Skeleton } from '../../components/common/Skeleton';

interface Props {
  projectId: number;
}

export const ProjectMaterialsTab = ({ projectId }: Props) => {
  const [stocks, setStocks] = useState<Stock[]>([]);
  const [materials, setMaterials] = useState<Record<number, Material>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        const [stocksData, materialsData] = await Promise.all([
          InventoryService.getProjectStock(projectId),
          InventoryService.getAllMaterials()
        ]);
        
        setStocks(stocksData);
        
        const materialMap: Record<number, Material> = {};
        materialsData.forEach(m => {
          materialMap[m.id] = m;
        });
        setMaterials(materialMap);
      } catch (err: any) {
        if (err.response?.status !== 404) {
          setError(err.response?.data?.message || 'Failed to load materials data.');
        } else {
          setStocks([]);
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [projectId]);

  if (isLoading) {
    return (
      <div className="space-y-4 mt-4">
        <Skeleton className="h-8 w-full" />
        <Skeleton className="h-20 w-full" />
        <Skeleton className="h-20 w-full" />
      </div>
    );
  }

  if (error) {
    return <Alert type="error" message={error} className="mt-4" />;
  }

  if (stocks.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">No materials are currently available at this project site.</p>
        <p className="text-sm text-gray-400 mt-1">Use the Inventory module to dispatch materials to this project.</p>
      </div>
    );
  }

  return (
    <div className="mt-4">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Material Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Unit</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Used Stock</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Avg Cost (₹)</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estimated Value (₹)</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Updated</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {stocks.map((stock) => {
              const material = materials[stock.materialId];
              const value = (stock.currentStock || 0) * (stock.averageUnitCost || 0);
              return (
                <tr key={stock.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm font-medium text-gray-900">
                      {material?.name || `Unknown (${stock.materialId})`} 
                      {stock.variant && stock.variant !== 'DEFAULT' && (
                        <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                          {stock.variant}
                        </span>
                      )}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {material?.type || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {material?.unit || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm font-semibold text-gray-900">{stock.currentStock || 0}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {stock.averageUnitCost?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '0.00'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {stock.updatedAt ? new Date(stock.updatedAt).toLocaleDateString() : '-'}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
