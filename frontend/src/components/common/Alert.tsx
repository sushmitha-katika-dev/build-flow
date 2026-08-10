import React from 'react';
import { AlertCircle, CheckCircle, Info, XCircle } from 'lucide-react';

interface AlertProps {
  type: 'error' | 'success' | 'info' | 'warning';
  message: string;
  className?: string;
}

export const Alert: React.FC<AlertProps> = ({ type, message, className = '' }) => {
  const styles = {
    error: 'bg-red-50 text-red-800 border-red-200',
    success: 'bg-green-50 text-green-800 border-green-200',
    info: 'bg-blue-50 text-blue-800 border-blue-200',
    warning: 'bg-yellow-50 text-yellow-800 border-yellow-200',
  };

  const icons = {
    error: <XCircle className="w-5 h-5 text-red-500 mr-2" />,
    success: <CheckCircle className="w-5 h-5 text-green-500 mr-2" />,
    info: <Info className="w-5 h-5 text-blue-500 mr-2" />,
    warning: <AlertCircle className="w-5 h-5 text-yellow-500 mr-2" />,
  };

  return (
    <div className={`flex items-center p-4 border rounded-md ${styles[type]} ${className}`}>
      {icons[type]}
      <span className="text-sm">{message}</span>
    </div>
  );
};
