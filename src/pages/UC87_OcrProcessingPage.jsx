import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Toaster, toast } from 'react-hot-toast';

// --- Icon Imports ---
import { 
    DocumentTextIcon,
    ExclamationTriangleIcon,
    ArrowDownTrayIcon
} from '@heroicons/react/24/solid';

// --- Mock API Import ---
import { mockOcrProcess } from '../api/mockUploadApi';

// --- Child Components for better structure ---
import OcrResultTabs from '../components/dms/upload/OcrResultTabs';

// --- Main Page Component ---
const UC87_OcrProcessingPage = () => {
    const [file, setFile] = useState(null);
    const [filePreview, setFilePreview] = useState(null); // For image preview
    const [isProcessing, setIsProcessing] = useState(false);
    const [ocrResult, setOcrResult] = useState(null);

    const onDrop = useCallback((acceptedFiles) => {
        const selectedFile = acceptedFiles[0];
        if (!selectedFile) return;

        setOcrResult(null);
        setFile(selectedFile);
        
        // Create a preview URL for the image
        const reader = new FileReader();
        reader.onload = (e) => setFilePreview(e.target.result);
        reader.readAsDataURL(selectedFile);
        
        setIsProcessing(true);
        toast.promise(
            mockOcrProcess(selectedFile),
            {
                loading: 'Đang nhận dạng ký tự quang học (OCR)...',
                success: (result) => {
                    setOcrResult(result);
                    setIsProcessing(false);
                    return 'Trích xuất dữ liệu thành công!';
                },
                error: (err) => {
                    setIsProcessing(false);
                    return 'Xử lý OCR thất bại.';
                }
            }
        );
    }, []);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: { 'image/jpeg': [], 'image/png': [], 'application/pdf': [] },
        maxFiles: 1,
        disabled: isProcessing,
    });
    
    const exportJson = () => {
        const dataStr = JSON.stringify(ocrResult, null, 2);
        const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
        
        const exportFileDefaultName = `${file.name.split('.')[0]}_ocr_result.json`;
    
        const linkElement = document.createElement('a');
        linkElement.setAttribute('href', dataUri);
        linkElement.setAttribute('download', exportFileDefaultName);
        linkElement.click();
        toast.success("Đã xuất file JSON.");
    }

    return (
        <>
            <Toaster position="top-right" />
            <div className="max-w-7xl mx-auto">
                 <header className="text-center mb-8">
                    <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-blue-600">
                        UC-87: Trích xuất Dữ liệu OCR
                    </h1>
                    <p className="text-gray-600 mt-2">Nhận dạng và bóc tách thông tin từ tài liệu hình ảnh và PDF.</p>
                </header>
                
                <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-xl">
                    {!ocrResult && (
                         <div {...getRootProps()} className={`p-10 text-center border-3 border-dashed rounded-xl cursor-pointer transition-all duration-300 ${isDragActive ? 'border-purple-500 bg-purple-50' : 'border-slate-300 hover:border-purple-400'}`}>
                            <input {...getInputProps()} />
                            <DocumentTextIcon className="h-16 w-16 mx-auto text-slate-400" />
                            <p className="mt-4 text-xl font-semibold text-slate-700">Chọn file ảnh hoặc PDF để bắt đầu OCR</p>
                            <p className="mt-2 text-sm text-slate-500">Hệ thống sẽ tự động xử lý và hiển thị kết quả.</p>
                        </div>
                    )}
                    
                    {isProcessing && !ocrResult && (
                        <div className="text-center py-20">
                            <h3 className="text-xl font-semibold text-gray-700">Đang phân tích tài liệu...</h3>
                            <p className="text-gray-500 mt-2">{file?.name}</p>
                        </div>
                    )}

                    {ocrResult && (
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-fade-in">
                            {/* Left Column: Image Preview */}
                            <div>
                                <h3 className="text-lg font-bold text-gray-800 mb-3">Tài liệu gốc</h3>
                                <div className="bg-gray-200 rounded-lg p-2 border shadow-inner">
                                    {filePreview ? (
                                        <img src={filePreview} alt="Document Preview" className="w-full h-auto rounded-md object-contain max-h-[600px]"/>
                                    ) : (
                                        <div className="h-[600px] flex items-center justify-center text-gray-500">Không có bản xem trước</div>
                                    )}
                                </div>
                            </div>
                            
                            {/* Right Column: OCR Results */}
                            <div>
                               <div className="flex justify-between items-center mb-3">
                                    <h3 className="text-lg font-bold text-gray-800">Kết quả trích xuất</h3>
                                    <button onClick={exportJson} className="flex items-center text-sm px-3 py-1.5 bg-green-600 text-white rounded-lg hover:bg-green-700">
                                       <ArrowDownTrayIcon className="h-4 w-4 mr-1.5" /> Xuất JSON
                                    </button>
                               </div>
                               
                               <div className="bg-white border rounded-lg p-4 mb-4 text-sm grid grid-cols-3 gap-4 text-center">
                                   <div><span className="block font-semibold text-gray-700">Confidence</span> <span className="text-blue-600 font-bold">{ocrResult.confidence}%</span></div>
                                   <div><span className="block font-semibold text-gray-700">Ngôn ngữ</span> <span className="text-blue-600 font-bold">{ocrResult.language}</span></div>
                                   <div><span className="block font-semibold text-gray-700">Thời gian</span> <span className="text-blue-600 font-bold">{ocrResult.processingTime}s</span></div>
                               </div>

                                {ocrResult.warnings.length > 0 && (
                                    <div className="p-4 mb-4 bg-yellow-50 border-l-4 border-yellow-400">
                                        <div className="flex">
                                            <ExclamationTriangleIcon className="h-5 w-5 text-yellow-400" />
                                            <div className="ml-3">
                                                <h4 className="text-sm font-semibold text-yellow-800">Cảnh báo</h4>
                                                <ul className="list-disc list-inside text-sm text-yellow-700 mt-1">
                                                    {ocrResult.warnings.map((w, i) => <li key={i}>{w}</li>)}
                                                </ul>
                                            </div>
                                        </div>
                                    </div>
                                )}
                               <OcrResultTabs result={ocrResult} />
                            </div>
                        </div>
                    )}
                </div>
            </div>
            <style>{`.animate-fade-in { animation: fadeIn 0.5s ease-in-out; } @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }`}</style>
        </>
    );
};

export default UC87_OcrProcessingPage;