import React, { useState, useCallback, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import { DocumentArrowUpIcon, XCircleIcon } from '@heroicons/react/24/solid';
import toast from 'react-hot-toast';

import { mockGetCategories, mockOcrAndSuggestMetadata, mockCheckDuplicates, mockUploadFile } from '../../../api/mockDmsApi';
import MetadataForm from './MetadataForm';
import DuplicateCheckResult from './DuplicateCheckResult';

const FileUpload = ({ onUploadSuccess, setProcessingStep }) => {
  const [files, setFiles] = useState([]);
  const [categories, setCategories] = useState([]);
  const [metadata, setMetadata] = useState({
    title: '',
    category: '',
    accessType: 'private',
    // ... các trường khác
  });
  const [ocrData, setOcrData] = useState(null);
  const [duplicateData, setDuplicateData] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    // Tải danh sách categories khi component được mount
    mockGetCategories().then(setCategories);
  }, []);

  const onDrop = useCallback(async (acceptedFiles) => {
    const file = acceptedFiles[0];
    if (file.size > 50 * 1024 * 1024) { // 50MB
      toast.error("Lỗi: Kích thước file vượt quá 50MB.");
      return;
    }
    setFiles([Object.assign(file, { preview: URL.createObjectURL(file) })]);
    
    // Bắt đầu quá trình xử lý tự động
    setIsProcessing(true);
    toast.loading('Đang xử lý file...', { id: 'processing' });
    
    // Bước 3: Nhận diện & OCR (UC-87) và Gợi ý metadata (UC-73)
    try {
        const ocrResult = await mockOcrAndSuggestMetadata(file);
        setOcrData(ocrResult.ocrText);
        setMetadata(prev => ({ ...prev, ...ocrResult.suggestedMetadata }));
        toast.success('Phân tích và gợi ý metadata thành công!', { id: 'processing' });
    } catch (error) {
        toast.error('Lỗi khi xử lý OCR và gợi ý metadata.', { id: 'processing' });
        setIsProcessing(false);
        return;
    }

    // Bước 3.1: Kiểm tra trùng lặp (UC-88)
    try {
        toast.loading('Đang kiểm tra trùng lặp...', { id: 'duplicate' });
        const duplicateResult = await mockCheckDuplicates(file);
        setDuplicateData(duplicateResult);
        if(duplicateResult.isDuplicate){
            toast.error('Phát hiện tài liệu trùng lặp!', { id: 'duplicate' });
        } else {
            toast.success('Không phát hiện trùng lặp.', { id: 'duplicate' });
        }

    } catch (error) {
        toast.error('Lỗi khi kiểm tra trùng lặp.', { id: 'duplicate' });
    } finally {
        setIsProcessing(false);
    }

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

  const handleRemoveFile = () => {
    setFiles([]);
    setOcrData(null);
    setDuplicateData(null);
    setMetadata({ title: '', category: '', accessType: 'private' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (files.length === 0) {
        toast.error("Vui lòng chọn một file để tải lên.");
        return;
    }
    
    setProcessingStep(3); // Chuyển sang màn hình processing steps
    try {
        const result = await mockUploadFile(files[0], metadata);
        toast.success("Tải lên tài liệu thành công!");
        onUploadSuccess(result);
    } catch(err) {
        toast.error("Tải lên thất bại, vui lòng thử lại.");
        setProcessingStep(2); // Quay lại trang upload nếu lỗi
    }
  };

  return (
    <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Cột trái: Thông tin và upload */}
            <div className="lg:col-span-2 space-y-8">
                <div className="bg-white p-6 rounded-lg shadow-md">
                    <h3 className="text-xl font-bold text-gray-800 mb-4">Thông Tin Tài Liệu</h3>
                    <div {...getRootProps()} className={`border-2 border-dashed rounded-lg p-10 text-center cursor-pointer transition-colors ${isDragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-blue-400'}`}>
                        <input {...getInputProps()} />
                        <DocumentArrowUpIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        {files.length === 0 ? (
                            <p>Kéo thả file hoặc click để chọn</p>
                        ) : (
                            <div className="flex items-center justify-center">
                                <p>{files[0].name}</p>
                                <button type="button" onClick={handleRemoveFile} className="ml-4 text-red-500 hover:text-red-700">
                                    <XCircleIcon className="h-6 w-6"/>
                                </button>
                            </div>
                        )}
                        <p className="text-xs text-gray-500 mt-2">Hỗ trợ: PDF, DOCX, JPG, PNG, TIFF, MP4, MP3... (Tối đa 50MB)</p>
                    </div>
                </div>

                {/* Hiển thị form metadata sau khi có gợi ý */}
                {ocrData && <MetadataForm metadata={metadata} setMetadata={setMetadata} categories={categories} ocrData={ocrData} warnings={metadata.warnings} />}

            </div>

            {/* Cột phải: Quyền và Gợi ý */}
            <div className="space-y-8">
                {/* Component hiển thị thông tin người dùng và quyền truy cập */}
                <div className="bg-white p-6 rounded-lg shadow-md">
                    {/* ... Giao diện Quyền Truy Cập tương tự màn hình minh hoạ ... */}
                </div>
                
                {/* Component hiển thị kết quả kiểm tra trùng lặp */}
                {duplicateData && <DuplicateCheckResult data={duplicateData}/>}

                 <button type="submit" disabled={isProcessing || !files.length} className="w-full bg-blue-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 transition-colors">
                    {isProcessing ? 'Đang xử lý...' : 'Tải Lên Và Lưu Nháp'}
                </button>
            </div>
        </div>
    </form>
  );
};

export default FileUpload;