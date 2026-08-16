import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, DollarSign } from 'lucide-react';
import { ProjectService } from '../../services/projectService';
import { FinanceService } from '../../services/financeService';
import type { Project } from '../../types/project';
import type { ProjectBudget, Expense } from '../../types/finance';
import { Card } from '../../components/common/Card';
import { Alert } from '../../components/common/Alert';
import { Skeleton } from '../../components/common/Skeleton';
import { Badge } from '../../components/common/Badge';

import { ProjectWorkforceTab } from './ProjectWorkforceTab';
import { ProjectMaterialsTab } from './ProjectMaterialsTab';
import { ProjectEquipmentTab } from './ProjectEquipmentTab';
import { ProjectFinanceTab } from './ProjectFinanceTab';

type Tab = 'overview' | 'workforce' | 'materials' | 'equipment' | 'finance';

export const ProjectDetailsPage = () => {
  const { id } = useParams<{ id: string }>();
  const [project, setProject] = useState<Project | null>(null);
  const [budget, setBudget] = useState<ProjectBudget | null>(null);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<Tab>('overview');

  useEffect(() => {
    const fetchProject = async () => {
      if (!id) return;
      try {
        setIsLoading(true);
        setError(null);
        const data = await ProjectService.getProjectById(parseInt(id));
        setProject(data);

        try {
          const [budgetData, expensesData] = await Promise.all([
            FinanceService.getProjectBudget(data.id!),
            FinanceService.getProjectExpenses(data.id!)
          ]);
          setBudget(budgetData);
          setExpenses(expensesData);
        } catch (err) {
          console.warn("Could not load financial data");
        }
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to load project details.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchProject();
  }, [id]);

  const handleStatusUpdate = async (status: string) => {
    if (!project?.id) return;
    try {
      setIsLoading(true);
      const updatedProject = await ProjectService.updateProjectStatus(project.id, status);
      setProject(updatedProject);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to update project status.');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <Card>
          <div className="space-y-4">
            <Skeleton className="h-6 w-1/3" />
            <Skeleton className="h-4 w-1/4" />
            <Skeleton className="h-4 w-1/2" />
          </div>
        </Card>
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="space-y-6">
        <Link to="/projects" className="inline-flex items-center text-blue-600 hover:text-blue-800 text-sm font-medium">
          <ArrowLeft className="w-4 h-4 mr-1" />
          Back to Projects
        </Link>
        <Alert type="error" message={error || 'Project not found.'} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <Link to="/projects" className="p-2 bg-white border rounded-full text-gray-500 hover:text-gray-700 hover:bg-gray-50 transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <div className="flex items-center space-x-3">
            <h1 className="text-2xl font-bold text-gray-900">{project.projectName}</h1>
            <Badge variant={project.status === 'ACTIVE' ? 'success' : 'default'}>{project.status}</Badge>
            {project.status !== 'COMPLETED' && project.status !== 'CANCELLED' && (
              <div className="flex space-x-2 ml-4">
                <button
                  onClick={() => handleStatusUpdate('COMPLETED')}
                  className="px-3 py-1 text-xs font-medium text-white bg-green-600 rounded hover:bg-green-700"
                >
                  Mark Completed
                </button>
                <button
                  onClick={() => handleStatusUpdate('CANCELLED')}
                  className="px-3 py-1 text-xs font-medium text-gray-700 bg-gray-200 rounded hover:bg-gray-300"
                >
                  Close Project
                </button>
              </div>
            )}
          </div>
          <p className="text-sm text-gray-500">Project ID: {project.id}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="flex items-center p-4">
          <div className="p-3 bg-green-50 text-green-600 rounded-lg mr-4">
            <DollarSign className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm text-gray-500 font-medium">Budget</p>
            <p className="font-semibold text-gray-900">₹{project.estimatedBudget?.toLocaleString()}</p>
          </div>
        </Card>

        <Card className="flex items-center p-4">
          <div className="p-3 bg-red-50 text-red-600 rounded-lg mr-4">
            <DollarSign className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm text-gray-500 font-medium">Invested / Actual Cost</p>
            <p className="font-semibold text-gray-900">₹{budget?.actualExpenses?.toLocaleString() || '0'}</p>
          </div>
        </Card>

        <Card className="flex items-center p-4">
          <div className="p-3 bg-blue-50 text-blue-600 rounded-lg mr-4">
            <DollarSign className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm text-gray-500 font-medium">Remaining Budget</p>
            <p className="font-semibold text-gray-900">₹{((project.estimatedBudget || 0) - (budget?.actualExpenses || 0)).toLocaleString()}</p>
          </div>
        </Card>

        <Card className="flex items-center p-4">
          <div className="p-3 bg-orange-50 text-orange-600 rounded-lg mr-4">
            <DollarSign className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm text-gray-500 font-medium">Budget Used</p>
            <p className="font-semibold text-gray-900">
              {Math.min(((budget?.actualExpenses || 0) / (project.estimatedBudget || 1)) * 100, 100).toFixed(2)}%
            </p>
          </div>
        </Card>

        <Card className="flex items-center p-4">
          <div className="p-3 bg-purple-50 text-purple-600 rounded-lg mr-4">
            <p className="font-semibold text-gray-900">{project.location}</p>
          </div>
        </Card>
      </div>

      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('overview')}
            className={`${activeTab === 'overview'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab('workforce')}
            className={`${activeTab === 'workforce'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
          >
            Workforce
          </button>
          <button
            onClick={() => setActiveTab('materials')}
            className={`${activeTab === 'materials'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
          >
            Materials
          </button>
          <button
            onClick={() => setActiveTab('equipment')}
            className={`${activeTab === 'equipment'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
          >
            Equipment
          </button>
          <button
            onClick={() => setActiveTab('finance')}
            className={`${activeTab === 'finance'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
          >
            Finance
          </button>
        </nav>
      </div>

      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card title="PROJECT BUDGET">
            <div className="space-y-4">
              <div className="flex justify-between items-center py-2 border-b border-gray-100">
                <span className="text-gray-500 font-medium">Budget</span>
                <span className="font-bold text-gray-900">₹{project.estimatedBudget?.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-gray-100">
                <span className="text-gray-500 font-medium">Actual Cost</span>
                <span className="font-bold text-red-600">₹{budget?.actualExpenses?.toLocaleString() || '0'}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-gray-100">
                <span className="text-gray-500 font-medium">Remaining</span>
                <span className="font-bold text-blue-600">₹{((project.estimatedBudget || 0) - (budget?.actualExpenses || 0)).toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center py-2">
                <span className="text-gray-500 font-medium">Budget Used</span>
                <span className="font-bold text-orange-600">
                  {Math.min(((budget?.actualExpenses || 0) / (project.estimatedBudget || 1)) * 100, 100).toFixed(2)}%
                </span>
              </div>
            </div>
          </Card>

          <Card title="COST BREAKDOWN">
            <div className="space-y-4">
              {(() => {
                const workforceCost = expenses.filter(e => e.category === 'LABOUR').reduce((sum, e) => sum + e.amount, 0);
                const materialsCost = expenses.filter(e => e.category === 'MATERIAL').reduce((sum, e) => sum + e.amount, 0);
                const equipmentCost = expenses.filter(e => e.category === 'EQUIPMENT').reduce((sum, e) => sum + e.amount, 0);
                const otherCost = expenses.filter(e => !['LABOUR', 'MATERIAL', 'EQUIPMENT'].includes(e.category)).reduce((sum, e) => sum + e.amount, 0);
                const totalCost = workforceCost + materialsCost + equipmentCost + otherCost;

                return (
                  <>
                    <div className="flex justify-between items-center py-2 border-b border-gray-100">
                      <span className="text-gray-500 font-medium">Workforce</span>
                      <span className="font-medium text-gray-900">₹{workforceCost.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-gray-100">
                      <span className="text-gray-500 font-medium">Materials</span>
                      <span className="font-medium text-gray-900">₹{materialsCost.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-gray-100">
                      <span className="text-gray-500 font-medium">Equipment</span>
                      <span className="font-medium text-gray-900">₹{equipmentCost.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-gray-100">
                      <span className="text-gray-500 font-medium">Other Expenses</span>
                      <span className="font-medium text-gray-900">₹{otherCost.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between items-center py-2 pt-4 border-t-2 border-gray-800">
                      <span className="text-gray-900 font-bold">Actual Cost</span>
                      <span className="font-bold text-gray-900">₹{totalCost.toLocaleString()}</span>
                    </div>
                  </>
                );
              })()}
            </div>
          </Card>
        </div>
      )}

      {activeTab === 'workforce' && project.id && (
        <ProjectWorkforceTab projectId={project.id} />
      )}

      {activeTab === 'materials' && project.id && (
        <ProjectMaterialsTab projectId={project.id} />
      )}

      {activeTab === 'equipment' && project.id && (
        <ProjectEquipmentTab projectId={project.id} />
      )}

      {activeTab === 'finance' && project.id && budget && (
        <ProjectFinanceTab projectId={project.id} budget={budget} />
      )}
    </div>
  );
};
