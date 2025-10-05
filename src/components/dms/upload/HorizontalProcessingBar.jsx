import React, { useState, useEffect } from 'react';
import { CheckCircleIcon, ClockIcon, XCircleIcon } from '@heroicons/react/24/solid';

const HorizontalProcessingBar = ({ steps, onProcessComplete, totalPages = 3 }) => {
  const [currentSteps, setCurrentSteps] = useState(steps);
  const [ocrProgress, setOcrProgress] = useState({ current: 0, total: totalPages }); // Sử dụng totalPages thay vì cố định 3
  const [allStepsCompleted, setAllStepsCompleted] = useState(false);

  // Cập nhật steps khi prop steps thay đổi
  useEffect(() => {
    setCurrentSteps(steps);
    
    // Kiểm tra nếu tất cả các bước đã hoàn thành
    const completedSteps = steps.filter(step => step.status === 'completed').length;
    const totalSteps = steps.length;
    const isCompleted = completedSteps === totalSteps && totalSteps > 0;
    
    if (isCompleted && !allStepsCompleted) {
      setAllStepsCompleted(true);
      // Gọi callback khi tất cả các bước hoàn thành
      if (onProcessComplete) {
        onProcessComplete();
      }
    }
  }, [steps, onProcessComplete, allStepsCompleted]);

  // Cập nhật tổng số trang khi totalPages thay đổi
  useEffect(() => {
    setOcrProgress(prev => ({
      ...prev,
      total: totalPages
    }));
  }, [totalPages]);

  // Xử lý tiến trình OCR chi tiết khi đang xử lý bước OCR
  useEffect(() => {
    const ocrStepIndex = currentSteps.findIndex(step => step.name.includes("Đang xử lý OCR"));
    const ocrStep = currentSteps[ocrStepIndex];
    
    if (ocrStep && ocrStep.status === 'in-progress') {
      const interval = setInterval(() => {
        setOcrProgress(prev => {
          if (prev.current < prev.total) {
            return { ...prev, current: prev.current + 1 };
          }
          return prev;
        });
      }, 100); // 0.1s cho mỗi bước
      
      return () => clearInterval(interval);
    } else {
      // Reset tiến trình OCR khi không còn ở bước OCR
      setOcrProgress({ current: 0, total: totalPages });
    }
  }, [currentSteps, totalPages]);

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed':
        return <CheckCircleIcon className="h-5 w-5 text-green-500" />;
      case 'in-progress':
        return <ClockIcon className="h-5 w-5 text-blue-500 animate-pulse" />;
      case 'error':
        return <XCircleIcon className="h-5 w-5 text-red-500" />;
      default:
        return <div className="h-5 w-5 rounded-full bg-gray-300"></div>;
    }
  };

  const getStepStatus = (step) => {
    // Kiểm tra nếu đây là bước OCR đang xử lý
    if (step.name.includes("Đang xử lý OCR") && step.status === 'in-progress' && ocrProgress.current > 0) {
      return `${step.name} (${ocrProgress.current}/${ocrProgress.total})`;
    }
    // Hiển thị chi tiết cho bước "Nhận diện định dạng" chỉ khi đã hoàn thành
    if (step.name.includes("Nhận diện định dạng") && step.status === 'completed' && step.details) {
      return `${step.name}: ${step.details}`;
    }
    return step.name;
  };

  // Lọc các bước đã hoàn thành và đang xử lý
  const completedSteps = currentSteps.filter(step => step.status === 'completed').length;
  const totalSteps = currentSteps.length;
  const progressPercentage = totalSteps > 0 ? (completedSteps / totalSteps) * 100 : 0;

  return (
    <div className="bg-white rounded-xl shadow-md p-6">
      <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center">
        <ClockIcon className="h-5 w-5 mr-2 text-blue-500" />
        Tiến trình xử lý
      </h3>
      
      {/* Thanh tiến trình chính */}
      <div className="mb-8">
        <div className="flex justify-between text-sm text-gray-600 mb-2">
          <span>Tiến trình</span>
          <span>{Math.round(progressPercentage)}%</span>
        </div>
        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
          <div 
            className="h-full bg-blue-500 rounded-full transition-all duration-300 ease-out"
            style={{ width: `${progressPercentage}%` }}
          ></div>
        </div>
      </div>
      
      {/* Danh sách các bước theo chiều ngang */}
      <div className="flex flex-wrap gap-4 justify-between">
        {currentSteps.map((step, index) => (
          <div key={step.id} className="flex-1 min-w-[150px]">
            <div className="flex flex-col items-center">
              <div className={`flex items-center justify-center w-10 h-10 rounded-full mb-2 ${
                step.status === 'completed' ? 'bg-green-100 text-green-600' :
                step.status === 'in-progress' ? 'bg-blue-100 text-blue-600' :
                step.status === 'error' ? 'bg-red-100 text-red-600' :
                'bg-gray-100 text-gray-400'
              }`}>
                {getStatusIcon(step.status)}
              </div>
              <div className="text-center">
                <p className={`text-xs font-medium ${
                  step.status === 'completed' ? 'text-green-600' :
                  step.status === 'in-progress' ? 'text-blue-600' :
                  step.status === 'error' ? 'text-red-600' :
                  'text-gray-500'
                }`}>
                  {getStepStatus(step)}
                </p>
                {step.details && step.status === 'completed' && !step.name.includes("Nhận diện định dạng") && (
                  <p className="text-xs text-gray-500 mt-1">{step.details}</p>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default HorizontalProcessingBar;