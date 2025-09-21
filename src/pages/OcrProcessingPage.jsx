import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { CheckCircleIcon } from '@heroicons/react/24/solid';

const ocrSteps = [
  { name: 'Phân tích cấu trúc tài liệu', duration: 1000 },
  { name: 'Xử lý hình ảnh và tối ưu hóa', duration: 1500 },
  { name: 'Nhận diện ký tự quang học (OCR)', duration: 2000 },
  { name: 'Chuyển đổi sang văn bản có cấu trúc', duration: 1000 },
  { name: 'Kiểm tra và hiệu chỉnh kết quả', duration: 800 },
  { name: 'Lưu trữ kết quả OCR', duration: 500 },
];

const OcrProcessingPage = () => {
  const location = useLocation();
  const [currentStep, setCurrentStep] = useState(0);
  const [documentId, setDocumentId] = useState(null);

  // Lấy documentId từ URL query parameters
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const docId = params.get('docId');
    setDocumentId(docId);
  }, [location]);

  // Xử lý các bước OCR
  useEffect(() => {
    const process = async () => {
      for (let i = 0; i < ocrSteps.length; i++) {
        await new Promise(resolve => setTimeout(resolve, ocrSteps[i].duration));
        setCurrentStep(i + 1);
      }
    };
    
    if (documentId) {
      process();
    }
  }, [documentId]);

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
      <header className="text-center mb-8">
        <h1 className="text-4xl font-bold text-blue-700">UC-87: Xử Lý OCR</h1>
        <p className="text-gray-600">Trích xuất văn bản từ tài liệu hình ảnh hoặc file PDF dạng ảnh.</p>
      </header>

      <div className="bg-white p-8 rounded-lg shadow-lg max-w-3xl mx-auto">
        <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">
          Tiến trình xử lý OCR
        </h2>
        
        {documentId ? (
          <div className="mb-6 p-4 bg-blue-50 rounded-lg">
            <p className="text-center text-blue-800 font-medium">
              Đang xử lý tài liệu: <span className="font-mono">{documentId}</span>
            </p>
          </div>
        ) : (
          <div className="mb-6 p-4 bg-yellow-50 rounded-lg">
            <p className="text-center text-yellow-800 font-medium">
              Không tìm thấy ID tài liệu. Vui lòng truy cập trang này từ quy trình upload.
            </p>
          </div>
        )}

        <ol className="space-y-4">
          {ocrSteps.map((step, index) => (
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

        {currentStep === ocrSteps.length && (
          <div className="mt-8 p-4 bg-green-50 rounded-lg text-center">
            <h3 className="text-xl font-bold text-green-800">Xử lý OCR hoàn tất!</h3>
            <p className="text-green-700 mt-2">
              Văn bản đã được trích xuất và lưu trữ thành công.
            </p>
            <div className="mt-4">
              <button 
                onClick={() => window.history.back()} 
                className="bg-blue-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors mr-4"
              >
                Quay lại
              </button>
              <button 
                onClick={() => alert('Chức năng xem kết quả OCR sẽ được triển khai ở phiên bản tiếp theo.')}
                className="bg-green-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-green-700 transition-colors"
              >
                Xem kết quả
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default OcrProcessingPage;