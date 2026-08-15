import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Building2, DollarSign } from 'lucide-react';
import { ProjectService } from '../../services/projectService';
import { FinanceService } from '../../services/financeService';
import type { Project } from '../../types/project';
import type { ProjectBudget } from '../../types/finance';
import { Card } from '../../components/common/Card';
import { Alert } from '../../components/common/Alert';
import { Skeleton } from '../../components/common/Skeleton';
import { Badge } from '../../components/common/Badge';

import { ProjectWorkforceTab } from './ProjectWorkforceTab';

export const ProjectDetailsPage = () => {
  const { id } = useParams<{ id: string }>();
  const [project, setProject] = useState<Project | null>(null);
  const [budget, setBudget] = useState<ProjectBudget | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'workforce'>('overview');

  useEffect(() => {
    const fetchProject = async () => {
      if (!id) return;
      try {
        setIsLoading(true);
        setError(null);
        const data = await ProjectService.getProjectById(parseInt(id));
        setProject(data);
        
        try {
          const budgetData = await FinanceService.getProjectBudget(data.id!);
          setBudget(budgetData);
        } catch (err) {
          console.warn("Could not load budget data");
        }
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to load project details.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchProject();
  }, [id]);

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
          </div>
          <p className="text-sm text-gray-500">Project ID: {project.id}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="flex items-center p-4">
          <div className="p-3 bg-blue-50 text-blue-600 rounded-lg mr-4">
            <Building2 className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm text-gray-500 font-medium">Client</p>
            <p className="font-semibold text-gray-900">{project.clientName}</p>
          </div>
        </Card>

        <Card className="flex items-center p-4">
          <div className="p-3 bg-green-50 text-green-600 rounded-lg mr-4">
            <DollarSign className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm text-gray-500 font-medium">Estimated Budget</p>
            <p className="font-semibold text-gray-900">${project.estimatedBudget?.toLocaleString()}</p>
          </div>
        </Card>

        <Card className="flex items-center p-4">
          <div className="p-3 bg-red-50 text-red-600 rounded-lg mr-4">
            <DollarSign className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm text-gray-500 font-medium">Actual Cost (Invested)</p>
            <p className="font-semibold text-gray-900">${budget?.actualExpenses?.toLocaleString() || '0'}</p>
          </div>
        </Card>
        
        <Card className="flex items-center p-4">
          <div className="p-3 bg-blue-50 text-blue-600 rounded-lg mr-4">
            <DollarSign className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm text-gray-500 font-medium">Amount Paid</p>
            <p className="font-semibold text-gray-900">${budget?.amountPaid?.toLocaleString() || '0'}</p>
          </div>
        </Card>
        
        <Card className="flex items-center p-4">
          <div className="p-3 bg-orange-50 text-orange-600 rounded-lg mr-4">
            <DollarSign className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm text-gray-500 font-medium">Outstanding</p>
            <p className="font-semibold text-gray-900">${budget?.outstandingAmount?.toLocaleString() || '0'}</p>
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
            className={`${
              activeTab === 'overview'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab('workforce')}
            className={`${
              activeTab === 'workforce'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
          >
            Workforce
          </button>
        </nav>
      </div>

      {activeTab === 'overview' && (
        <Card title="Project Overview">
          <div className="space-y-4">
            <p className="text-gray-700">
              This project is currently <strong className="lowercase">{project.status}</strong>. 
              More details regarding equipment assignments, labour workforce, and financial profit/loss can be integrated here.
            </p>
          </div>
        </Card>
      )}

      {activeTab === 'workforce' && project.id && (
        <ProjectWorkforceTab projectId={project.id} />
      )}
    </div>
  );
};
