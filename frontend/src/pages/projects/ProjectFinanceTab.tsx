import { useState, useEffect, useMemo } from 'react';
import { FinanceService } from '../../services/financeService';
import { WorkforceService } from '../../services/workforceService';
import type { Expense, ProjectBudget } from '../../types/finance';
import type { LabourWorkforceSummary } from '../../types/workforce';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Skeleton } from '../../components/common/Skeleton';
import { Alert } from '../../components/common/Alert';
import { Modal } from '../../components/common/Modal';
import { Input } from '../../components/common/Input';
import { HardHat, Package, Truck, Receipt, Wallet, Filter, CheckCircle2, RefreshCw } from 'lucide-react';

interface Props {
  projectId: number;
  budget?: ProjectBudget;
}

export type CategoryFilter = 'ALL' | 'WORKFORCE' | 'MATERIAL' | 'EQUIPMENT' | 'OVERHEAD';

export const ProjectFinanceTab = ({ projectId }: Props) => {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [workers, setWorkers] = useState<LabourWorkforceSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Interactive Category Filter State
  const [selectedFilter, setSelectedFilter] = useState<CategoryFilter>('ALL');

  // Worker Payment Modal State inside Finance
  const [isPayWorkerModalOpen, setIsPayWorkerModalOpen] = useState(false);
  const [selectedLabourId, setSelectedLabourId] = useState<string>('');
  const [wageAmount, setWageAmount] = useState<number | ''>('');
  const [paymentNotes, setPaymentNotes] = useState<string>('');
  const [isSubmittingWage, setIsSubmittingWage] = useState(false);
  const [wageError, setWageError] = useState<string | null>(null);

  const fetchExpensesAndWorkers = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const [expData, labourData] = await Promise.all([
        FinanceService.getProjectExpenses(projectId).catch(() => []),
        WorkforceService.getLabourSummaryByProject(projectId).catch(() => [])
      ]);
      setExpenses(expData.sort((a, b) => b.id - a.id));
      setWorkers(labourData);
    } catch (err: any) {
      if (err.response?.status !== 404) {
        setError(err.response?.data?.message || 'Failed to load project expenses.');
      } else {
        setExpenses([]);
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchExpensesAndWorkers();
  }, [projectId]);

  // Calculate Project Cost Breakdown by Module Category
  const costBreakdown = useMemo(() => {
    let workforceTotal = 0;
    let materialTotal = 0;
    let equipmentTotal = 0;
    let otherTotal = 0;

    let workforceCount = 0;
    let materialCount = 0;
    let equipmentCount = 0;
    let otherCount = 0;

    expenses.forEach((e) => {
      const cat = (e.category || '').toUpperCase();
      if (['WORKFORCE', 'LABOUR', 'WORKER', 'WAGE'].includes(cat)) {
        workforceTotal += e.amount || 0;
        workforceCount++;
      } else if (['MATERIAL', 'INVENTORY', 'STOCK'].includes(cat)) {
        materialTotal += e.amount || 0;
        materialCount++;
      } else if (['EQUIPMENT', 'MACHINERY', 'TOOL'].includes(cat)) {
        equipmentTotal += e.amount || 0;
        equipmentCount++;
      } else {
        otherTotal += e.amount || 0;
        otherCount++;
      }
    });

    const totalCost = workforceTotal + materialTotal + equipmentTotal + otherTotal || 1;

    return {
      workforceTotal,
      materialTotal,
      equipmentTotal,
      otherTotal,
      workforceCount,
      materialCount,
      equipmentCount,
      otherCount,
      workforcePct: Math.round((workforceTotal / totalCost) * 100),
      materialPct: Math.round((materialTotal / totalCost) * 100),
      equipmentPct: Math.round((equipmentTotal / totalCost) * 100),
      otherPct: Math.round((otherTotal / totalCost) * 100)
    };
  }, [expenses]);

  // Filtered Expense Records for Detailed Ledger
  const filteredExpenses = useMemo(() => {
    if (selectedFilter === 'ALL') return expenses;
    return expenses.filter(e => {
      const cat = (e.category || '').toUpperCase();
      if (selectedFilter === 'WORKFORCE') return ['WORKFORCE', 'LABOUR', 'WORKER', 'WAGE'].includes(cat);
      if (selectedFilter === 'MATERIAL') return ['MATERIAL', 'INVENTORY', 'STOCK'].includes(cat);
      if (selectedFilter === 'EQUIPMENT') return ['EQUIPMENT', 'MACHINERY', 'TOOL'].includes(cat);
      if (selectedFilter === 'OVERHEAD') return !['WORKFORCE', 'LABOUR', 'WORKER', 'WAGE', 'MATERIAL', 'INVENTORY', 'STOCK', 'EQUIPMENT', 'MACHINERY', 'TOOL'].includes(cat);
      return true;
    });
  }, [expenses, selectedFilter]);

  const handlePayWorkerWage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedLabourId || !wageAmount || Number(wageAmount) <= 0) {
      setWageError("Please select a worker and enter a valid payment amount.");
      return;
    }

    const worker = workers.find(w => w.id === Number(selectedLabourId));
    if (!worker) return;

    try {
      setIsSubmittingWage(true);
      setWageError(null);
      const paidAmt = Number(wageAmount);

      // 1. Log Expense in Finance Service (Updates Project Cost Breakdown!)
      await FinanceService.logExpense({
        projectId,
        amount: paidAmt,
        category: 'WORKFORCE',
        description: `Finance Wage Payment: ${worker.firstName} ${worker.lastName} (${worker.role})`,
        date: new Date().toISOString().split('T')[0]
      });

      // 2. Record Wage in Workforce Service (Updates Worker Balance & Pending Pay)
      await WorkforceService.recordWage({
        labourId: worker.id,
        projectId,
        amountPaid: paidAmt,
        paymentDate: new Date().toISOString().split('T')[0],
        notes: paymentNotes || undefined
      } as any);

      setIsPayWorkerModalOpen(false);
      setSelectedLabourId('');
      setWageAmount('');
      setPaymentNotes('');
      fetchExpensesAndWorkers();
    } catch (err: any) {
      setWageError(err.response?.data?.message || 'Failed to process worker payment.');
    } finally {
      setIsSubmittingWage(false);
    }
  };

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

  return (
    <div className="mt-4 space-y-6">
      {/* Top Action Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-3xl border border-slate-200/80 shadow-md">
        <div>
          <h3 className="text-xl font-black text-slate-900">Project Financial Ledger & Module Breakdown</h3>
          <p className="text-xs text-slate-500 font-medium mt-0.5">Click any module breakdown card below to drill down into specific expense records.</p>
        </div>

        <Button 
          onClick={() => { setWageError(null); setIsPayWorkerModalOpen(true); }}
          className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white shadow-lg shadow-emerald-600/20 flex items-center px-5 py-3 rounded-2xl text-xs font-black uppercase tracking-wider transition-all hover:scale-105"
        >
          <Wallet className="w-4 h-4 mr-2" />
          Disburse Wage Payment
        </Button>
      </div>



      {/* PROJECT COST BREAKDOWN SECTION WITH CLICKABLE CATEGORY CARDS */}
      <Card className="p-6 bg-white border border-slate-200/90 rounded-3xl shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between border-b border-slate-100 pb-4 gap-2">
          <div>
            <h3 className="text-lg font-black text-slate-900 flex items-center">
              <Receipt className="w-5 h-5 mr-2 text-blue-600" />
              Project Cost Breakdown (Module-wise Expenditure)
            </h3>
            <p className="text-xs text-slate-500 font-medium mt-0.5">Click any breakdown box below to filter the detailed ledger.</p>
          </div>

          <div className="flex items-center space-x-2">
            {selectedFilter !== 'ALL' && (
              <button 
                onClick={() => setSelectedFilter('ALL')}
                className="px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-all flex items-center"
              >
                <RefreshCw className="w-3 h-3 mr-1" /> Clear Filter
              </button>
            )}
            <span className="text-xs font-black px-3 py-1 bg-slate-900 text-white rounded-xl shadow-xs">
              {expenses.length} Total Expense Records
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* 1. Workforce / Wages Box */}
          <div 
            onClick={() => setSelectedFilter(selectedFilter === 'WORKFORCE' ? 'ALL' : 'WORKFORCE')} 
            className={`cursor-pointer p-5 rounded-2xl transition-all border ${
              selectedFilter === 'WORKFORCE' 
                ? 'bg-purple-100 border-purple-500 ring-2 ring-purple-400 shadow-lg scale-102' 
                : 'bg-purple-50/70 border-purple-200 hover:bg-purple-100/70 hover:shadow-md'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="p-2.5 bg-purple-200 text-purple-800 rounded-xl">
                  <HardHat className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-xs font-black text-purple-950 block">Workforce / Wages</span>
                  <span className="text-[10px] font-bold text-purple-700">{costBreakdown.workforceCount} records</span>
                </div>
              </div>
              <span className="text-xs font-black px-2 py-0.5 bg-purple-200 text-purple-900 rounded-lg">{costBreakdown.workforcePct}%</span>
            </div>
            <p className="text-2xl font-black text-purple-950 mt-3">₹{costBreakdown.workforceTotal.toLocaleString('en-IN')}</p>
            <div className="w-full bg-purple-200 h-2 rounded-full mt-2.5 overflow-hidden">
              <div className="bg-purple-600 h-full rounded-full transition-all" style={{ width: `${costBreakdown.workforcePct}%` }} />
            </div>
            {selectedFilter === 'WORKFORCE' && (
              <div className="mt-2 text-[11px] font-black text-purple-800 flex items-center">
                <CheckCircle2 className="w-3.5 h-3.5 mr-1 text-purple-700" /> Filter Active
              </div>
            )}
          </div>

          {/* 2. Materials Consumed Box */}
          <div 
            onClick={() => setSelectedFilter(selectedFilter === 'MATERIAL' ? 'ALL' : 'MATERIAL')} 
            className={`cursor-pointer p-5 rounded-2xl transition-all border ${
              selectedFilter === 'MATERIAL' 
                ? 'bg-amber-100 border-amber-500 ring-2 ring-amber-400 shadow-lg scale-102' 
                : 'bg-amber-50/70 border-amber-200 hover:bg-amber-100/70 hover:shadow-md'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="p-2.5 bg-amber-200 text-amber-800 rounded-xl">
                  <Package className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-xs font-black text-amber-950 block">Materials Consumed</span>
                  <span className="text-[10px] font-bold text-amber-700">{costBreakdown.materialCount} records</span>
                </div>
              </div>
              <span className="text-xs font-black px-2 py-0.5 bg-amber-200 text-amber-900 rounded-lg">{costBreakdown.materialPct}%</span>
            </div>
            <p className="text-2xl font-black text-amber-950 mt-3">₹{costBreakdown.materialTotal.toLocaleString('en-IN')}</p>
            <div className="w-full bg-amber-200 h-2 rounded-full mt-2.5 overflow-hidden">
              <div className="bg-amber-600 h-full rounded-full transition-all" style={{ width: `${costBreakdown.materialPct}%` }} />
            </div>
            {selectedFilter === 'MATERIAL' && (
              <div className="mt-2 text-[11px] font-black text-amber-800 flex items-center">
                <CheckCircle2 className="w-3.5 h-3.5 mr-1 text-amber-700" /> Filter Active
              </div>
            )}
          </div>

          {/* 3. Equipment Usage Box */}
          <div 
            onClick={() => setSelectedFilter(selectedFilter === 'EQUIPMENT' ? 'ALL' : 'EQUIPMENT')} 
            className={`cursor-pointer p-5 rounded-2xl transition-all border ${
              selectedFilter === 'EQUIPMENT' 
                ? 'bg-blue-100 border-blue-500 ring-2 ring-blue-400 shadow-lg scale-102' 
                : 'bg-blue-50/70 border-blue-200 hover:bg-blue-100/70 hover:shadow-md'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="p-2.5 bg-blue-200 text-blue-800 rounded-xl">
                  <Truck className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-xs font-black text-blue-950 block">Equipment Usage</span>
                  <span className="text-[10px] font-bold text-blue-700">{costBreakdown.equipmentCount} records</span>
                </div>
              </div>
              <span className="text-xs font-black px-2 py-0.5 bg-blue-200 text-blue-900 rounded-lg">{costBreakdown.equipmentPct}%</span>
            </div>
            <p className="text-2xl font-black text-blue-950 mt-3">₹{costBreakdown.equipmentTotal.toLocaleString('en-IN')}</p>
            <div className="w-full bg-blue-200 h-2 rounded-full mt-2.5 overflow-hidden">
              <div className="bg-blue-600 h-full rounded-full transition-all" style={{ width: `${costBreakdown.equipmentPct}%` }} />
            </div>
            {selectedFilter === 'EQUIPMENT' && (
              <div className="mt-2 text-[11px] font-black text-blue-800 flex items-center">
                <CheckCircle2 className="w-3.5 h-3.5 mr-1 text-blue-700" /> Filter Active
              </div>
            )}
          </div>

          {/* 4. General Overhead Box */}
          <div 
            onClick={() => setSelectedFilter(selectedFilter === 'OVERHEAD' ? 'ALL' : 'OVERHEAD')} 
            className={`cursor-pointer p-5 rounded-2xl transition-all border ${
              selectedFilter === 'OVERHEAD' 
                ? 'bg-slate-200 border-slate-500 ring-2 ring-slate-400 shadow-lg scale-102' 
                : 'bg-slate-100/80 border-slate-200 hover:bg-slate-200/80 hover:shadow-md'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="p-2.5 bg-slate-300 text-slate-800 rounded-xl">
                  <Receipt className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-xs font-black text-slate-950 block">General Overhead</span>
                  <span className="text-[10px] font-bold text-slate-600">{costBreakdown.otherCount} records</span>
                </div>
              </div>
              <span className="text-xs font-black px-2 py-0.5 bg-slate-300 text-slate-900 rounded-lg">{costBreakdown.otherPct}%</span>
            </div>
            <p className="text-2xl font-black text-slate-950 mt-3">₹{costBreakdown.otherTotal.toLocaleString('en-IN')}</p>
            <div className="w-full bg-slate-300 h-2 rounded-full mt-2.5 overflow-hidden">
              <div className="bg-slate-700 h-full rounded-full transition-all" style={{ width: `${costBreakdown.otherPct}%` }} />
            </div>
            {selectedFilter === 'OVERHEAD' && (
              <div className="mt-2 text-[11px] font-black text-slate-800 flex items-center">
                <CheckCircle2 className="w-3.5 h-3.5 mr-1 text-slate-700" /> Filter Active
              </div>
            )}
          </div>
        </div>
      </Card>

      {/* EXPENSE LEDGER TABLE */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center space-x-2">
            <Filter className="w-4 h-4 text-slate-500" />
            <h3 className="text-base font-black text-slate-900">
              Detailed Expense Ledger
              {selectedFilter !== 'ALL' && <span className="text-blue-600 ml-2">({selectedFilter} Filtered)</span>}
            </h3>
          </div>

          <div className="flex flex-wrap items-center gap-1.5">
            <button 
              onClick={() => setSelectedFilter('ALL')}
              className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all ${
                selectedFilter === 'ALL' ? 'bg-slate-900 text-white shadow-sm' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              All ({expenses.length})
            </button>
            <button 
              onClick={() => setSelectedFilter('WORKFORCE')}
              className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all ${
                selectedFilter === 'WORKFORCE' ? 'bg-purple-600 text-white shadow-sm' : 'bg-purple-50 text-purple-700 hover:bg-purple-100'
              }`}
            >
              Workforce ({costBreakdown.workforceCount})
            </button>
            <button 
              onClick={() => setSelectedFilter('MATERIAL')}
              className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all ${
                selectedFilter === 'MATERIAL' ? 'bg-amber-600 text-white shadow-sm' : 'bg-amber-50 text-amber-700 hover:bg-amber-100'
              }`}
            >
              Materials ({costBreakdown.materialCount})
            </button>
            <button 
              onClick={() => setSelectedFilter('EQUIPMENT')}
              className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all ${
                selectedFilter === 'EQUIPMENT' ? 'bg-blue-600 text-white shadow-sm' : 'bg-blue-50 text-blue-700 hover:bg-blue-100'
              }`}
            >
              Equipment ({costBreakdown.equipmentCount})
            </button>
            <button 
              onClick={() => setSelectedFilter('OVERHEAD')}
              className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all ${
                selectedFilter === 'OVERHEAD' ? 'bg-slate-700 text-white shadow-sm' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              Overhead ({costBreakdown.otherCount})
            </button>
          </div>
        </div>

        {filteredExpenses.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-3xl border border-slate-200 border-dashed shadow-sm">
            <p className="text-slate-700 font-bold text-sm">No expenses found for filter "{selectedFilter}".</p>
            <p className="text-xs text-slate-400 mt-1">Expenses automatically accumulate when workforce wages are disbursed or materials/equipment are recorded.</p>
            {selectedFilter !== 'ALL' && (
              <button 
                onClick={() => setSelectedFilter('ALL')} 
                className="mt-3 text-xs font-bold text-blue-600 hover:underline"
              >
                Reset Filter
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto bg-white shadow-xl rounded-3xl border border-slate-200/90">
            <table className="min-w-full divide-y divide-slate-100">
              <thead className="bg-slate-900 text-white">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-black uppercase tracking-wider">Date</th>
                  <th className="px-6 py-4 text-left text-xs font-black uppercase tracking-wider">Category</th>
                  <th className="px-6 py-4 text-left text-xs font-black uppercase tracking-wider">Amount</th>
                  <th className="px-6 py-4 text-left text-xs font-black uppercase tracking-wider">Description</th>
                  <th className="px-6 py-4 text-left text-xs font-black uppercase tracking-wider">Reference ID</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-slate-100">
                {filteredExpenses.map((expense) => {
                  const cat = (expense.category || '').toUpperCase();
                  const isWorkforce = ['LABOUR', 'WORKFORCE', 'WORKER', 'WAGE'].includes(cat);
                  const isMaterial = ['MATERIAL', 'INVENTORY', 'STOCK'].includes(cat);
                  const isEquipment = ['EQUIPMENT', 'MACHINERY', 'TOOL'].includes(cat);

                  return (
                    <tr key={expense.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap text-xs font-bold text-slate-900">
                        {new Date(expense.date).toLocaleDateString('en-IN')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-3 py-1 inline-flex text-xs font-black rounded-xl border ${
                          isWorkforce ? 'bg-purple-50 text-purple-800 border-purple-200' :
                          isMaterial ? 'bg-amber-50 text-amber-800 border-amber-200' :
                          isEquipment ? 'bg-blue-50 text-blue-800 border-blue-200' :
                          'bg-slate-100 text-slate-800 border-slate-200'
                        }`}>
                          {isWorkforce ? 'WORKFORCE' : cat}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-black text-slate-900">
                        ₹{expense.amount?.toLocaleString('en-IN')}
                      </td>
                      <td className="px-6 py-4 text-xs font-medium text-slate-700 max-w-sm">
                        {expense.description || '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-xs font-mono font-bold text-slate-400">
                        {expense.referenceId || `#EXP-${expense.id}`}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pay Worker Wage Modal inside Finance */}
      <Modal
        isOpen={isPayWorkerModalOpen}
        onClose={() => setIsPayWorkerModalOpen(false)}
        title="Disburse Worker Wage (Finance Module)"
      >
        {wageError && <Alert type="error" message={wageError} className="mb-4" />}
        <form onSubmit={handlePayWorkerWage} className="space-y-4">
          <div>
            <label className="block text-xs font-black uppercase text-slate-600 tracking-wider mb-1">Select Worker *</label>
            <select
              required
              className="w-full rounded-2xl border border-slate-300 p-3 text-sm font-semibold focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              value={selectedLabourId}
              onChange={(e) => {
                setSelectedLabourId(e.target.value);
                const w = workers.find(item => item.id === Number(e.target.value));
                if (w && w.remainingAmount && w.remainingAmount > 0) {
                  setWageAmount(w.remainingAmount);
                }
              }}
            >
              <option value="">-- Select Assigned Worker --</option>
              {workers.map(w => (
                <option key={w.id} value={w.id}>
                  {w.firstName} {w.lastName} ({w.role}) — Pending: ₹{(w.remainingAmount || 0).toLocaleString('en-IN')}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-black uppercase text-slate-600 tracking-wider mb-1">Payment Amount (₹) *</label>
            <Input
              type="number"
              step="0.01"
              min="0.01"
              required
              placeholder="e.g. 1500"
              value={wageAmount}
              onChange={(e) => setWageAmount(e.target.value ? parseFloat(e.target.value) : '')}
            />
          </div>

          <div>
            <label className="block text-xs font-black uppercase text-slate-600 tracking-wider mb-1">Notes / Receipt Reference</label>
            <Input
              type="text"
              placeholder="Optional payment notes"
              value={paymentNotes}
              onChange={(e) => setPaymentNotes(e.target.value)}
            />
          </div>

          <div className="flex justify-end space-x-3 pt-4 border-t border-gray-100">
            <Button variant="secondary" type="button" onClick={() => setIsPayWorkerModalOpen(false)} disabled={isSubmittingWage}>
              Cancel
            </Button>
            <Button variant="primary" type="submit" disabled={isSubmittingWage} className="bg-emerald-600 hover:bg-emerald-700 font-bold">
              {isSubmittingWage ? 'Processing Payment...' : 'Disburse Payment & Log Expense'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
