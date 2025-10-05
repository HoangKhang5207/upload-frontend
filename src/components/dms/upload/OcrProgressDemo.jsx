import React, { useState } from 'react';
import HorizontalProcessingBar from './HorizontalProcessingBar';
import processingStepsData from '../../../data/processingStepsData.json';

const OcrProgressDemo = () => {
  const [totalPages, setTotalPages] = useState(5);
  const [steps, setSteps] = useState(processingStepsData);
  const [currentStep, setCurrentStep] = useState(3); // Bước OCR
  const [isProcessing, setIsProcessing] = useState(false);

  // Cập nhật bước xử lý
  const updateStepStatus = (stepId, status) => {
    setSteps(prevSteps => 
      prevSteps.map(step => 
        step.id === stepId 
          ? { ...step, status } 
          : step
      )
    );
  };

  // Bắt đầu xử lý OCR
  const startOcrProcessing = () => {
    // Cập nhật bước "Nhận diện định dạng" thành hoàn thành
    updateStepStatus(1, "completed");
    
    // Cập nhật bước "Khử nhiễu và tiền xử lý" thành hoàn thành
    updateStepStatus(2, "completed");
    
    // Cập nhật bước "Đang xử lý OCR" thành đang xử lý
    updateStepStatus(3, "in-progress");
    
    setIsProcessing(true);
  };

  // Hoàn thành xử lý OCR
  const completeOcrProcessing = () => {
    // Cập nhật bước "Đang xử lý OCR" thành hoàn thành
    updateStepStatus(3, "completed");
    
    // Cập nhật bước "Phân tích và gợi ý metadata" thành đang xử lý
    updateStepStatus(4, "in-progress");
    
    setTimeout(() => {
      // Cập nhật bước "Phân tích và gợi ý metadata" thành hoàn thành
      updateStepStatus(4, "completed");
      
      // Cập nhật bước "Hoàn tất xử lý" thành đang xử lý
      updateStepStatus(5, "in-progress");
      
      setTimeout(() => {
        // Cập nhật bước "Hoàn tất xử lý" thành hoàn thành
        updateStepStatus(5, "completed");
        setIsProcessing(false);
      }, 1000);
    }, 1000);
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Demo Tiến trình OCR với Số trang khác nhau</h1>
      
      <div className="bg-white rounded-xl shadow-md p-6 mb-8">
        <div className="flex items-center space-x-4 mb-6">
          <label className="text-sm font-medium text-gray-700">Số trang:</label>
          <input
            type="number"
            min="1"
            max="100"
            value={totalPages}
            onChange={(e) => setTotalPages(parseInt(e.target.value) || 1)}
            className="w-20 p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
          <button
            onClick={startOcrProcessing}
            disabled={isProcessing}
            className={`px-4 py-2 rounded-md text-white font-medium ${
              isProcessing 
                ? 'bg-gray-400 cursor-not-allowed' 
                : 'bg-blue-600 hover:bg-blue-700'
            }`}
          >
            Bắt đầu OCR
          </button>
          <button
            onClick={completeOcrProcessing}
            disabled={!isProcessing}
            className={`px-4 py-2 rounded-md text-white font-medium ${
              !isProcessing 
                ? 'bg-gray-400 cursor-not-allowed' 
                : 'bg-green-600 hover:bg-green-700'
            }`}
          >
            Hoàn thành OCR
          </button>
          <button
            onClick={() => {
              setSteps(processingStepsData);
              setIsProcessing(false);
            }}
            className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 font-medium"
          >
            Reset
          </button>
        </div>
        
        <div className="mt-8">
          <HorizontalProcessingBar 
            steps={steps} 
            totalPages={totalPages}
          />
        </div>
      </div>
      
      <div className="bg-blue-50 rounded-lg p-6 border border-blue-200">
        <h2 className="text-xl font-bold text-blue-800 mb-4">Hướng dẫn sử dụng</h2>
        <ul className="list-disc list-inside space-y-2 text-blue-700">
          <li>Chọn số trang bạn muốn mô phỏng (từ 1 đến 100)</li>
          <li>Nhấn "Bắt đầu OCR" để bắt đầu tiến trình xử lý</li>
          <li>Quan sát tiến trình OCR sẽ hiển thị theo dạng (1/{totalPages}, 2/{totalPages}, ..., {totalPages}/{totalPages})</li>
          <li>Nhấn "Hoàn thành OCR" để kết thúc tiến trình</li>
          <li>Nhấn "Reset" để quay lại trạng thái ban đầu</li>
        </ul>
      </div>
    </div>
  );
};

export default OcrProgressDemo;