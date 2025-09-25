import React from 'react';
import { CheckCircleIcon, ClockIcon, ExclamationCircleIcon, ArrowPathIcon } from '@heroicons/react/24/solid';

const ProcessingSteps = ({ steps }) => {
  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed':
        return <CheckCircleIcon className="h-5 w-5 text-green-500" />;
      case 'processing':
        return <ArrowPathIcon className="h-5 w-5 text-blue-500 animate-spin" />;
      case 'pending':
        return <ClockIcon className="h-5 w-5 text-gray-400" />;
      case 'error':
        return <ExclamationCircleIcon className="h-5 w-5 text-red-500" />;
      default:
        return <ClockIcon className="h-5 w-5 text-gray-400" />;
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'completed':
        return 'Hoàn thành';
      case 'processing':
        return 'Đang xử lý';
      case 'pending':
        return 'Đang chờ';
      case 'error':
        return 'Lỗi';
      default:
        return 'Đang chờ';
    }
  };

  const getStatusClass = (status) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'processing':
        return 'bg-blue-100 text-blue-800';
      case 'pending':
        return 'bg-gray-100 text-gray-800';
      case 'error':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="mt-4 space-y-3">
      <h3 className="text-lg font-semibold text-gray-800">Tiến trình xử lý</h3>
      <div className="space-y-2">
        {steps.map((step, index) => (
          <div key={index} className="flex items-center p-3 bg-white rounded-lg border border-gray-200">
            <div className="flex-shrink-0">
              {getStatusIcon(step.status)}
            </div>
            <div className="ml-4 flex-1">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-gray-900">{step.name}</p>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusClass(step.status)}`}>
                  {getStatusText(step.status)}
                </span>
              </div>
              {step.description && (
                <p className="mt-1 text-sm text-gray-500">{step.description}</p>
              )}
              {step.progress !== undefined && step.status === 'processing' && (
                <div className="mt-2 w-full bg-gray-200 rounded-full h-1.5">
                  <div 
                    className="bg-blue-500 h-1.5 rounded-full" 
                    style={{ width: `${step.progress}%` }}
                  ></div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProcessingSteps;