import React from 'react';
import { CheckCircleIcon, ClockIcon, XCircleIcon, MinusCircleIcon } from '@heroicons/react/24/solid';

// Component này được giữ lại để tương thích với các phần khác của ứng dụng
// nhưng không được sử dụng trong UC87_OcrProcessingPage nữa

const ProcessingSteps = ({ steps }) => {
  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed':
        return <CheckCircleIcon className="h-6 w-6 text-green-500" />;
      case 'in-progress':
        return <ClockIcon className="h-6 w-6 text-blue-500 animate-pulse" />;
      case 'error':
        return <XCircleIcon className="h-6 w-6 text-red-500" />;
      default:
        return <MinusCircleIcon className="h-6 w-6 text-gray-400" />;
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'completed':
        return 'Đã hoàn thành';
      case 'in-progress':
        return 'Đang xử lý';
      case 'error':
        return 'Lỗi';
      default:
        return 'Chưa bắt đầu';
    }
  };

  const getStatusClass = (status, isCurrent) => {
    if (isCurrent) {
      return 'ring-2 ring-blue-400 ring-opacity-50';
    }
    
    switch (status) {
      case 'completed':
        return 'bg-green-50 border-green-200';
      case 'in-progress':
        return 'bg-blue-50 border-blue-200';
      case 'error':
        return 'bg-red-50 border-red-200';
      default:
        return 'bg-gray-50 border-gray-200';
    }
  };

  return (
    <div className="space-y-5">
      <h3 className="text-xl font-bold text-gray-800 flex items-center">
        <ClockIcon className="h-5 w-5 mr-2 text-blue-500" />
        Tiến trình xử lý
      </h3>
      <div className="space-y-4">
        {steps.map((step, index) => {
          // Xác định bước hiện tại đang xử lý
          const isCurrent = step.status === 'in-progress';
          
          return (
            <div 
              key={step.id} 
              className={`flex items-start p-5 rounded-xl border transition-all duration-200 ${getStatusClass(step.status, isCurrent)} ${isCurrent ? 'shadow-md' : ''}`}
            >
              <div className="flex-shrink-0 mt-0.5">
                {getStatusIcon(step.status)}
              </div>
              <div className="ml-4 flex-1">
                <div className="flex items-center justify-between">
                  <h4 className="text-base font-semibold text-gray-900">
                    {index + 1}. {step.name}
                  </h4>
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    step.status === 'completed' ? 'bg-green-100 text-green-800' :
                    step.status === 'in-progress' ? 'bg-blue-100 text-blue-800' :
                    step.status === 'error' ? 'bg-red-100 text-red-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {getStatusText(step.status)}
                  </span>
                </div>
                {step.details && (
                  <p className="mt-2 text-sm text-gray-600">
                    {step.details}
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ProcessingSteps;