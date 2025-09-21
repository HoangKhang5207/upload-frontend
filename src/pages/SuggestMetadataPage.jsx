import React, { useState, useEffect, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useDropzone } from 'react-dropzone';
import { Toaster, toast } from 'react-hot-toast';
import { InformationCircleIcon, ExclamationTriangleIcon, CheckCircleIcon, DocumentArrowUpIcon, XCircleIcon } from '@heroicons/react/24/solid';

import InputField from '../components/common/InputField';

const processingSteps = [
  { name: 'Phát hiện loại tài liệu', duration: 800 },
  { name: 'Trích xuất văn bản', duration: 1500 },
  { name: 'Phân tích AI', duration: 2000 },
  { name: 'Trích xuất key-value', duration: 1200 },
  { name: 'Xác thực dữ liệu', duration: 1000 },
  { name: 'Gợi ý siêu dữ liệu', duration: 800 },
];

const SuggestMetadataPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [documentId, setDocumentId] = useState(null);
  const [metadata, setMetadata] = useState({
    title: '',
    author: '',
    keywords: '',
    summary: '',
    duration: '',
    mainContent: '',
    keyValues: '{}'
  });
  const [warnings, setWarnings] = useState([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [file, setFile] = useState(null);
  const [showProcessButton, setShowProcessButton] = useState(false);

  // Lấy documentId từ URL query parameters
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const docId = params.get('docId');
    setDocumentId(docId);
    
    // Nếu có documentId, bắt đầu xử lý
    if (docId) {
      setIsProcessing(true);
      processDocument();
    }
  }, [location]);

  const onDrop = useCallback((acceptedFiles) => {
    const selectedFile = acceptedFiles[0];
    if (selectedFile.size > 50 * 1024 * 1024) { // 50MB
      toast.error("Lỗi: Kích thước file vượt quá 50MB.");
      return;
    }
    setFile(Object.assign(selectedFile, {
      preview: URL.createObjectURL(selectedFile)
    }));
    
    // Hiển thị nút xử lý thay vì xử lý ngay
    setShowProcessButton(true);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'image/jpeg': ['.jpg', '.jpeg'],
      'image/png': ['.png'],
      'image/tiff': ['.tiff'],
      'video/mp4': ['.mp4'],
      'audio/mpeg': ['.mp3'],
      'video/x-msvideo': ['.avi'],
      'audio/wav': ['.wav'],
    },
    maxFiles: 1,
  });

  const handleRemoveFile = (e) => {
    e.stopPropagation(); // Ngăn sự kiện click mở lại cửa sổ chọn file
    setFile(null);
    setDocumentId(null);
    setIsProcessing(false);
    setCurrentStep(0);
    setShowProcessButton(false);
  };

  const handleProcess = () => {
    // Bắt đầu xử lý khi người dùng click vào nút
    const fakeDocId = Math.random().toString(36).substring(2, 10);
    setDocumentId(fakeDocId);
    setIsProcessing(true);
    setShowProcessButton(false);
    setCurrentStep(0);
    processDocument();
  };

  // Xử lý các bước phân tích tài liệu
  const processDocument = async () => {
    for (let i = 0; i < processingSteps.length; i++) {
      await new Promise(resolve => setTimeout(resolve, processingSteps[i].duration));
      setCurrentStep(i + 1);
    }
    
    // Sau khi xử lý xong, mô phỏng dữ liệu gợi ý được lấy từ AI
    const suggestedMetadata = {
      title: file ? file.name : `Tài liệu mẫu ${documentId}`,
      author: 'Tác giả mẫu',
      keywords: 'từ khóa 1, từ khóa 2, từ khóa 3',
      summary: 'Đây là tóm tắt nội dung của tài liệu mẫu. Nội dung này được tạo tự động bởi hệ thống AI dựa trên phân tích nội dung tài liệu.',
      duration: '5 phút 30 giây',
      mainContent: 'Nội dung chính của tài liệu sẽ xuất hiện ở đây sau khi được xử lý bởi hệ thống AI.',
      keyValues: JSON.stringify({
        so_hieu: "123/QĐ-SGDĐT",
        ngay_ban_hanh: "21/08/2025" // Ngày mâu thuẫn (> 20/08/2025)
      }, null, 2)
    };
    
    setMetadata(suggestedMetadata);
    checkWarnings(suggestedMetadata);
    setIsProcessing(false);
  };

  const checkWarnings = (metadata) => {
    const newWarnings = [];
    
    try {
      const keyValueObj = JSON.parse(metadata.keyValues);
      if (keyValueObj.ngay_ban_hanh) {
        const dateParts = keyValueObj.ngay_ban_hanh.split("/");
        const day = parseInt(dateParts[0]);
        const month = parseInt(dateParts[1]);
        const year = parseInt(dateParts[2]);
        
        // Kiểm tra nếu ngày > 20/08/2025
        if (year > 2025 || (year === 2025 && month > 8) || (year === 2025 && month === 8 && day > 20)) {
          newWarnings.push(`Ngày ban hành ${keyValueObj.ngay_ban_hanh} lớn hơn ngày hiện tại (20/08/2025)`);
        }
      }
    } catch (e) {
      newWarnings.push("Dữ liệu key-value không hợp lệ");
    }
    
    setWarnings(newWarnings);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    const updatedMetadata = { ...metadata, [name]: value };
    setMetadata(updatedMetadata);
    
    // Kiểm tra cảnh báo khi có thay đổi
    if (name === 'keyValues') {
      checkWarnings(updatedMetadata);
    }
  };

  const handleSave = (e) => {
    e.preventDefault();
    // Trong thực tế, đây sẽ là một cuộc gọi API để lưu dữ liệu
    console.log('Metadata saved:', metadata);
    
    // Kiểm tra nếu có cảnh báo
    if (warnings.length > 0) {
      toast.success('Gợi ý siêu dữ liệu thành công với một số cảnh báo!');
    } else {
      toast.success('Gợi ý siêu dữ liệu thành công!');
    }
    
    // Chuyển hướng đến trang kiểm tra trùng lặp
    navigate(`/check-duplicates?docId=${documentId}`);
  };

  const handleCancel = () => {
    if (window.confirm('Bạn có chắc chắn muốn hủy? Các thay đổi sẽ không được lưu.')) {
      navigate(-1); // Quay lại trang trước
    }
  };

  const handleJsonChange = (e) => {
    setMetadata(prev => ({ ...prev, keyValues: e.target.value }));
    
    // Kiểm tra cảnh báo khi có thay đổi
    const updatedMetadata = { ...metadata, keyValues: e.target.value };
    checkWarnings(updatedMetadata);
  };

  return (
    <>
      <Toaster position="top-right" />
      <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
        <header className="text-center mb-8">
          <h1 className="text-4xl font-bold text-blue-700">UC-73: Gợi Ý Siêu Dữ Liệu</h1>
          <p className="text-gray-600">Phân tích tài liệu đã tải lên để AI tự động gợi ý các siêu dữ liệu quan trọng.</p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cột chính: Form chọn file hoặc tiến trình xử lý hoặc thông tin siêu dữ liệu */}
          <div className="lg:col-span-2 bg-white p-8 rounded-lg shadow-lg">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">
              {isProcessing ? "Đang xử lý tài liệu" : (documentId && !isProcessing ? "Thông Tin Siêu Dữ Liệu" : "Chọn Tài Liệu")}
            </h2>
            
            {!documentId && !isProcessing && (
              <div {...getRootProps()} className={`border-2 border-dashed rounded-lg p-10 text-center cursor-pointer transition-colors ${isDragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-blue-400'}`}>
                <input {...getInputProps()} />
                <DocumentArrowUpIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                {file ? (
                  <div className="flex items-center justify-center bg-gray-100 p-2 rounded-md">
                    <p className="font-semibold text-gray-700">{file.name}</p>
                    <button type="button" onClick={handleRemoveFile} className="ml-4 text-red-500 hover:text-red-700">
                      <XCircleIcon className="h-6 w-6"/>
                    </button>
                  </div>
                ) : (
                  <p className="text-gray-500">Kéo thả file hoặc click để chọn</p>
                )}
                <p className="text-xs text-gray-500 mt-2">Hỗ trợ: PDF, DOCX, JPG, PNG, TIFF, MP4, MP3... (Tối đa 50MB)</p>
              </div>
            )}
            
            {showProcessButton && !isProcessing && (
              <div className="mt-6">
                <button
                  onClick={handleProcess}
                  className="w-full bg-blue-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Bắt đầu xử lý
                </button>
              </div>
            )}
            
            {isProcessing && (
              <>
                {documentId ? (
                  <div className="mb-6 p-4 bg-blue-50 rounded-lg">
                    <p className="text-center text-blue-800 font-medium">
                      Đang xử lý tài liệu: <span className="font-mono">{documentId}</span>
                    </p>
                  </div>
                ) : (
                  <div className="mb-6 p-4 bg-yellow-50 rounded-lg">
                    <p className="text-center text-yellow-800 font-medium">
                      Không tìm thấy ID tài liệu. Vui lòng chọn một tài liệu để xử lý.
                    </p>
                  </div>
                )}

                <div className="mb-8">
                  <div className="flex justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">
                      Tiến trình xử lý
                    </span>
                    <span className="text-sm font-medium text-gray-700">
                      {currentStep}/{processingSteps.length}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-4">
                    <div 
                      className="bg-blue-600 h-4 rounded-full transition-all duration-500 ease-in-out" 
                      style={{ width: `${(currentStep / processingSteps.length) * 100}%` }}
                    ></div>
                  </div>
                </div>

                <ol className="space-y-4">
                  {processingSteps.map((step, index) => (
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
              </>
            )}
            
            {documentId && !isProcessing && (
              <>
                <div className="mb-6 p-4 bg-blue-50 rounded-lg">
                  <p className="text-center text-blue-800 font-medium">
                    Đang xử lý tài liệu: <span className="font-mono">{documentId}</span>
                  </p>
                </div>

                {/* Hiển thị cảnh báo nếu có */}
                {warnings.length > 0 && (
                  <div className="mb-6 p-4 bg-yellow-50 border-l-4 border-yellow-500 text-yellow-800 rounded-r-lg">
                    <div className="flex">
                      <div className="py-1">
                        <ExclamationTriangleIcon className="h-6 w-6 mr-3"/>
                      </div>
                      <div>
                        <p className="font-bold">Cảnh báo</p>
                        <ul className="list-disc pl-5 mt-2">
                          {warnings.map((warning, index) => (
                            <li key={index}>{warning}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                )}

                <form onSubmit={handleSave}>
                  <div className="space-y-6">
                    <InputField 
                      label="Tên tài liệu"
                      id="title"
                      name="title"
                      value={metadata.title}
                      onChange={handleChange}
                      required={true}
                      helpText="Tiêu đề gợi ý dựa trên nội dung đầu tiên hoặc metadata"
                    />

                    <InputField 
                      label="Tác giả"
                      id="author"
                      name="author"
                      value={metadata.author}
                      onChange={handleChange}
                      helpText="Tác giả gợi ý từ metadata hoặc nội dung văn bản/OCR"
                    />

                    <InputField 
                      label="Từ khóa"
                      id="keywords"
                      name="keywords"
                      value={metadata.keywords}
                      onChange={handleChange}
                      helpText="Danh sách từ khóa gợi ý (tối đa 10 từ) dựa trên phân tích nội dung"
                    />

                    <div>
                      <label htmlFor="summary" className="block text-sm font-medium text-gray-700 mb-1">
                        Tóm tắt
                      </label>
                      <textarea
                        id="summary"
                        name="summary"
                        value={metadata.summary}
                        onChange={handleChange}
                        rows={4}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                      />
                      <p className="mt-1 text-xs text-gray-500">
                        Tóm tắt nội dung gợi ý (tối đa 500 ký tự) từ văn bản hoặc kết quả OCR/speech
                      </p>
                    </div>

                    <InputField 
                      label="Độ dài"
                      id="duration"
                      name="duration"
                      value={metadata.duration}
                      onChange={handleChange}
                      helpText="Độ dài của clip (MP4, AVI) gợi ý (ví dụ: 5 phút 30 giây)"
                    />

                    <div>
                      <label htmlFor="mainContent" className="block text-sm font-medium text-gray-700 mb-1">
                        Nội dung chính
                      </label>
                      <textarea
                        id="mainContent"
                        name="mainContent"
                        value={metadata.mainContent}
                        onChange={handleChange}
                        rows={4}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                      />
                      <p className="mt-1 text-xs text-gray-500">
                        Nội dung chính gợi ý từ văn bản chuyển đổi của speech (MP3, WAV)
                      </p>
                    </div>

                    <div>
                      <label htmlFor="keyValues" className="block text-sm font-medium text-gray-700 mb-1">
                        Key-Values
                      </label>
                      <textarea
                        id="keyValues"
                        name="keyValues"
                        value={metadata.keyValues}
                        onChange={handleJsonChange}
                        rows={6}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm font-mono text-sm focus:ring-blue-500 focus:border-blue-500"
                      />
                      <p className="mt-1 text-xs text-gray-500">
                        JSON object gợi ý key-value pairs từ nội dung
                      </p>
                    </div>
                  </div>
                </form>
              </>
            )}
          </div>

          {/* Cột phụ: Hướng dẫn và hành động */}
          <div className="space-y-8">
            <div className="bg-blue-50 border-l-4 border-blue-500 text-blue-800 p-4 rounded-r-lg">
              <div className="flex">
                <div className="py-1">
                  <InformationCircleIcon className="h-6 w-6 mr-3"/>
                </div>
                <div>
                  <p className="font-bold">Hướng dẫn</p>
                  <p className="text-sm">
                    {isProcessing 
                      ? "Hệ thống đang tự động phân tích tài liệu và gợi ý các siêu dữ liệu. Vui lòng đợi trong khi hệ thống xử lý."
                      : (showProcessButton
                        ? "Tài liệu đã được tải lên. Nhấn vào nút 'Bắt đầu xử lý' để bắt đầu phân tích tài liệu."
                        : (documentId && !isProcessing
                          ? "Hệ thống đã tự động phân tích tài liệu và gợi ý các siêu dữ liệu. Vui lòng kiểm tra và chỉnh sửa các trường thông tin nếu cần thiết trước khi lưu."
                          : "Vui lòng chọn một tài liệu để bắt đầu quá trình phân tích và gợi ý siêu dữ liệu.")
                      )
                    }
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-lg">
              <h3 className="text-lg font-bold text-gray-800 mb-4">Hành động</h3>
              <div className="space-y-4">
                {showProcessButton && !isProcessing && (
                  <button
                    onClick={handleProcess}
                    className="w-full bg-blue-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Bắt đầu xử lý
                  </button>
                )}
                
                {documentId && !isProcessing && (
                  <>
                    <button
                      type="button"
                      onClick={handleSave}
                      className="w-full bg-blue-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Lưu
                    </button>
                    <button
                      type="button"
                      onClick={handleCancel}
                      className="w-full bg-gray-300 text-gray-700 font-bold py-3 px-4 rounded-lg hover:bg-gray-400 transition-colors"
                    >
                      Hủy
                    </button>
                  </>
                )}
                
                {!isProcessing && (
                  <div>
                    <button
                      type="button"
                      onClick={handleRemoveFile}
                      className="w-full bg-red-500 text-white font-bold py-2 px-4 rounded-lg hover:bg-red-600 transition-colors"
                    >
                      Xóa file
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default SuggestMetadataPage;