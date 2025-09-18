import React, { useState, useEffect } from 'react';
import { CheckCircleIcon } from '@heroicons/react/24/solid';

const steps = [
  { name: 'Upload file lên server', duration: 1000 },
  { name: 'Gọi Flowable API (Auto-route)', duration: 1500 },
  { name: 'Gán siêu dữ liệu và nhúng watermark', duration: 1000 },
  { name: 'Kiểm tra điều kiện & kích hoạt workflow', duration: 800 },
  { name: 'Lưu trữ và tạo bản ghi cuối cùng', duration: 500 },
];

const ProcessingSteps = () => {
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    const process = async () => {
      for (let i = 0; i < steps.length; i++) {
        await new Promise(resolve => setTimeout(resolve, steps[i].duration));
        setCurrentStep(i + 1);
      }
    };
    process();
  }, []);

  return (
    <div className="bg-white p-8 rounded-lg shadow-lg max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">
        Tiến trình xử lý tự động
      </h2>
      <ol className="space-y-4">
        {steps.map((step, index) => (
          <li key={index} className="flex items-start">
            <div className="flex-shrink-0">
              {index < currentStep ? (
                <CheckCircleIcon className="h-6 w-6 text-green-500" />
              ) : (
                <div className={`h-6 w-6 rounded-full flex items-center justify-center ${index === currentStep ? 'bg-blue-500 animate-pulse' : 'bg-gray-300'}`}>
                   {index === currentStep && <div className="h-3 w-3 bg-white rounded-full"></div>}
                </div>
              )}
            </div>
            <div className="ml-4">
                <h4 className={`font-semibold ${index < currentStep ? 'text-gray-800' : 'text-gray-500'}`}>
                    {step.name}
                </h4>
                <p className={`text-sm ${index < currentStep ? 'text-green-600' : 'text-gray-400'}`}>
                    {index < currentStep ? 'Hoàn thành' : (index === currentStep ? 'Đang xử lý...' : 'Chờ xử lý')}
                </p>
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
};

export default ProcessingSteps;