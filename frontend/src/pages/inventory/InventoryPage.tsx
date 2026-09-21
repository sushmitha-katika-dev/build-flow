import { useEffect, useState } from 'react';
import { Plus, PackageSearch, ArrowRightLeft, Eye, Package, Edit3 } from 'lucide-react';
import { InventoryService } from '../../services/inventoryService';
import type { Material, Stock } from '../../types/inventory';
import { Button } from '../../components/common/Button';
import { Alert } from '../../components/common/Alert';
import { Skeleton } from '../../components/common/Skeleton';
import { MaterialFormModal } from './components/MaterialFormModal';
import { TransactionFormModal } from './components/TransactionFormModal';
import { MaterialDetailsModal } from './components/MaterialDetailsModal';
import { EditMaterialModal } from './components/EditMaterialModal';

export const InventoryPage = () => {
  const [materials, setMaterials] = useState<Material[]>([]);
  const [stocks, setStocks] = useState<Record<number, Stock[]>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [isMaterialModalOpen, setIsMaterialModalOpen] = useState(false);
  const [isTransactionModalOpen, setIsTransactionModalOpen] = useState(false);
  const [transactionMode, setTransactionMode] = useState<'COMPANY_STOCK_IN' | 'PROJECT_DISPATCH' | 'GENERIC'>('GENERIC');
  const [selectedMaterialId, setSelectedMaterialId] = useState<number | null>(null);
  const [editingMaterial, setEditingMaterial] = useState<Material | null>(null);

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
      {/* Executive Hero Banner */}
      <div className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 p-8 rounded-3xl text-white shadow-2xl border border-slate-800/80">
        <div className="absolute top-0 right-0 -mt-12 -mr-12 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 -mb-12 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="space-y-2">
            <div className="flex items-center space-x-3">
              <div className="p-3.5 bg-gradient-to-br from-amber-500 to-orange-600 rounded-2xl text-white shadow-lg shadow-amber-500/20">
                <Package className="w-7 h-7" />
              </div>
              <div>
                <h1 className="text-3xl font-black tracking-tight text-white">Central Inventory & Materials</h1>
                <p className="text-sm text-slate-300 font-medium">Constructor Central Godown management & site dispatch logistics.</p>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Button 
              onClick={() => { setTransactionMode('COMPANY_STOCK_IN'); setIsTransactionModalOpen(true); }}
              className="bg-slate-800 hover:bg-slate-700 text-white rounded-2xl font-bold text-xs uppercase px-4 py-3 border border-slate-700 shadow-md transition-all hover:scale-105"
            >
              <Plus className="w-4 h-4 mr-2 text-emerald-400" />
              Add Warehouse Stock
            </Button>
            <Button 
              onClick={() => { setTransactionMode('PROJECT_DISPATCH'); setIsTransactionModalOpen(true); }}
              className="bg-slate-800 hover:bg-slate-700 text-white rounded-2xl font-bold text-xs uppercase px-4 py-3 border border-slate-700 shadow-md transition-all hover:scale-105"
            >
              <ArrowRightLeft className="w-4 h-4 mr-2 text-blue-400" />
              Dispatch to Site
            </Button>
            <Button 
              onClick={() => setIsMaterialModalOpen(true)}
              className="bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white rounded-2xl font-bold text-xs uppercase px-5 py-3 shadow-xl shadow-amber-600/20 transition-all hover:scale-105"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add New Material
            </Button>
          </div>
        </div>
      </div>

      {error && <Alert type="error" message={error} />}

      {/* Main Table Card */}
      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200">
              <Skeleton className="h-6 w-1/3 mb-2" />
              <Skeleton className="h-4 w-1/4" />
            </div>
          ))}
        </div>
      ) : materials.length === 0 ? (
        <div className="bg-white rounded-3xl border-2 border-dashed border-slate-200 p-16 text-center shadow-sm">
          <div className="h-16 w-16 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <PackageSearch className="w-8 h-8" />
          </div>
          <h3 className="text-base font-bold text-slate-900">No Material Items in Catalog</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">Get started by adding your first material item (e.g., Cement OPC, Steel Rebar, Sand) to the constructor central catalog.</p>
          <div className="mt-6">
            <Button onClick={() => setIsMaterialModalOpen(true)} className="bg-amber-600 hover:bg-amber-700 text-white rounded-xl font-bold text-xs uppercase px-5 py-3">
              <Plus className="w-4 h-4 mr-2" />
              Add New Material
            </Button>
          </div>
        </div>
      ) : (
        <div className="bg-white shadow-2xl rounded-3xl overflow-hidden border border-slate-200/90">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-100">
              <thead className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white">
                <tr>
                  <th className="px-8 py-5 text-left text-xs font-black uppercase tracking-wider text-slate-200 min-w-[160px]">
                    Type
                  </th>
                  <th className="px-8 py-5 text-left text-xs font-black uppercase tracking-wider text-slate-200 min-w-[260px]">
                    Name
                  </th>
                  <th className="px-8 py-5 text-left text-xs font-black uppercase tracking-wider text-slate-200 min-w-[240px]">
                    Current Stock
                  </th>
                  <th className="px-8 py-5 text-right text-xs font-black uppercase tracking-wider text-slate-200 min-w-[140px]">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-slate-100">
                {materials.map((material) => {
                  const matStocks = stocks[material.id] || [];
                  const totalStock = matStocks.reduce((sum, s) => sum + (s.currentStock || 0), 0);
                  const totalValuation = matStocks.reduce((sum, s) => sum + ((s.currentStock || 0) * (s.averageUnitCost || 0)), 0);
                  const weightedAvgCost = totalStock > 0 ? (totalValuation / totalStock) : 0;

                  return (
                    <tr key={material.id} className="hover:bg-blue-50/20 transition-all group">
                      {/* 1. TYPE COLUMN (First Column) */}
                      <td className="px-8 py-5 whitespace-nowrap min-w-[160px]">
                        <span className="px-3.5 py-1.5 inline-flex text-xs font-black rounded-xl bg-slate-900 text-amber-400 border border-slate-700 shadow-xs">
                          {material.type}
                        </span>
                      </td>

                      {/* 2. NAME COLUMN (Second Column) */}
                      <td className="px-8 py-5 whitespace-nowrap min-w-[260px]">
                        <div className="flex items-center space-x-3">
                          <div className="p-3 bg-amber-50 text-amber-700 rounded-2xl border border-amber-200/80 group-hover:scale-105 transition-transform flex-shrink-0">
                            <Package className="w-4.5 h-4.5" />
                          </div>
                          <div>
                            <div className="text-base font-black text-slate-900 group-hover:text-blue-600 transition-colors">
                              {material.name}
                            </div>
                            <div className="text-xs text-slate-500 font-medium flex items-center mt-1 space-x-2">
                              <span className="px-2 py-0.5 bg-slate-100 rounded-md text-slate-700 font-mono text-[11px] font-bold">
                                ID: #{material.id}
                              </span>
                              <span className="text-slate-300">•</span>
                              <span className="text-slate-600 font-semibold uppercase text-[11px]">
                                Unit: {material.unit}
                              </span>
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* 3. CURRENT STOCK COLUMN (Third Column) */}
                      <td className="px-8 py-5 whitespace-nowrap min-w-[240px]">
                        <div>
                          <div className="text-sm font-black text-slate-900">
                            {totalStock.toLocaleString()} <span className="text-xs font-bold text-slate-500 uppercase">{material.unit}</span>
                          </div>
                          <div className="text-xs text-slate-500 font-mono mt-0.5 font-semibold">
                            Avg Cost: ₹{weightedAvgCost.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </div>
                          {matStocks.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-1.5">
                              {matStocks.map((s) => (
                                <span key={s.id} className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-mono font-bold bg-slate-100 text-slate-700 border border-slate-200">
                                  {s.variant || 'DEFAULT'}: {s.currentStock?.toLocaleString()} {material.unit} @ ₹{s.averageUnitCost?.toFixed(2)}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      </td>

                      {/* 4. ACTIONS COLUMN (Fourth Column: View Details & Edit) */}
                      <td className="px-8 py-5 whitespace-nowrap text-right text-xs font-medium min-w-[180px]">
                        <div className="flex items-center justify-end space-x-2">
                          <button 
                            onClick={() => setEditingMaterial(material)}
                            className="inline-flex items-center text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-300 font-bold px-3 py-2 rounded-xl transition-all shadow-xs"
                            title="Edit Material Category Name or Unit of Measurement"
                          >
                            <Edit3 className="w-3.5 h-3.5 mr-1 text-slate-600" /> Edit Unit
                          </button>
                          <button 
                            onClick={() => setSelectedMaterialId(material.id)}
                            className="inline-flex items-center text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 font-black px-4 py-2 rounded-xl shadow-md shadow-blue-500/20 transition-all hover:scale-105 active:scale-95"
                            title="View Material Details & Stock Breakdown"
                          >
                            <Eye className="w-4 h-4 mr-1.5" /> Details
                          </button>
                        </div>
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
        existingMaterials={materials}
      />

      <EditMaterialModal
        isOpen={editingMaterial !== null}
        onClose={() => setEditingMaterial(null)}
        onSuccess={fetchData}
        material={editingMaterial}
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
