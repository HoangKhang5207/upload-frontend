import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Toaster, toast } from 'react-hot-toast';

// --- Icon Imports ---
import { 
    DocumentTextIcon,
    ExclamationTriangleIcon,
    ArrowDownTrayIcon,
    SparklesIcon,
    ArrowPathIcon,
} from '@heroicons/react/24/solid';

// --- Mock API Import ---
import { mockOcrProcess } from '../../api/mockUploadApi';

// --- Component Imports ---
import OcrResultTabs from '../../components/dms/upload/OcrResultTabs'; // Tái sử dụng component đã có

// --- Main Page Component ---
const UC87_OcrProcessingPage = () => {
    const [file, setFile] = useState(null);
    const [filePreview, setFilePreview] = useState(null); // Dùng để hiển thị ảnh preview
    const [isProcessing, setIsProcessing] = useState(false);
    const [ocrResult, setOcrResult] = useState(null);

    const handleReset = () => {
        setFile(null);
        setFilePreview(null);
        setOcrResult(null);
        setIsProcessing(false);
    };

    const onDrop = useCallback((acceptedFiles) => {
        const selectedFile = acceptedFiles[0];
        if (!selectedFile) return;

        handleReset(); // Reset lại state mỗi khi chọn file mới
        setFile(selectedFile);
        
        // Tạo URL preview cho file ảnh
        if (selectedFile.type.startsWith('image/')) {
            const reader = new FileReader();
            reader.onload = (e) => setFilePreview(e.target.result);
            reader.readAsDataURL(selectedFile);
        } else {
            // Nếu là PDF, có thể hiển thị một icon hoặc preview mặc định
            setFilePreview(null); 
        }
        
        setIsProcessing(true);
        toast.promise(
            mockOcrProcess(selectedFile),
            {
                loading: 'AI đang phân tích và trích xuất dữ liệu...',
                success: (result) => {
                    setOcrResult(result);
                    setIsProcessing(false);
                    return 'Trích xuất dữ liệu thành công!';
                },
                error: (err) => {
                    setIsProcessing(false);
                    toast.error(`Lỗi xử lý OCR: ${err.message}`);
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
        if (!ocrResult) return;
        const dataStr = JSON.stringify(ocrResult, null, 2);
        const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
        const exportFileDefaultName = `${file.name.split('.')[0]}_ocr_result.json`;
    
        const linkElement = document.createElement('a');
        linkElement.setAttribute('href', dataUri);
        linkElement.setAttribute('download', exportFileDefaultName);
        linkElement.click();
        toast.success("Đã xuất file JSON.");
    };

    return (
        <>
            <Toaster position="top-right" />
            <div className="max-w-7xl mx-auto">
                 <header className="text-center mb-10">
                    <h1 className="text-4xl font-extrabold text-gray-800">
                        UC-87: Trích xuất Dữ liệu từ PDF/Ảnh (OCR)
                    </h1>
                    <p className="text-gray-600 mt-2">Sử dụng AI để phân tích văn bản hành chính và trích xuất thông tin dưới dạng cấu trúc JSON.</p>
                </header>
                
                <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-xl min-h-[600px]">
                    {/* Giao diện Upload ban đầu */}
                    {!file && !isProcessing && (
                         <div {...getRootProps()} className={`p-12 text-center border-2 border-dashed rounded-xl cursor-pointer transition-all duration-300 ${isDragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-blue-400'}`}>
                            <input {...getInputProps()} />
                            <SparklesIcon className="h-16 w-16 mx-auto text-gray-400" />
                            <p className="mt-4 text-xl font-semibold text-gray-700">Kéo thả file PDF hoặc ảnh vào đây</p>
                            <p className="mt-2 text-sm text-gray-500">Hệ thống sẽ tự động xử lý và hiển thị kết quả chi tiết.</p>
                        </div>
                    )}
                    
                    {/* Giao diện đang xử lý */}
                    {isProcessing && (
                        <div className="flex flex-col items-center justify-center h-full min-h-[500px] text-center">
                            <ArrowPathIcon className="h-12 w-12 text-blue-600 animate-spin"/>
                            <h3 className="text-2xl font-bold text-gray-800 mt-6">Đang phân tích dữ liệu...</h3>
                            <p className="text-gray-500 mt-2">AI đang xử lý và trích xuất thông tin từ văn bản của bạn.</p>
                            <p className="font-semibold mt-2">{file?.name}</p>
                        </div>
                    )}

                    {/* Giao diện hiển thị kết quả */}
                    {ocrResult && !isProcessing && (
                        <div className="animate-fade-in">
                             <div className="flex justify-between items-center mb-6 pb-4 border-b">
                                <h2 className="text-2xl font-bold text-gray-800">Phân tích hoàn tất!</h2>
                                 <button onClick={handleReset} className="flex items-center text-sm px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700">
                                    <ArrowPathIcon className="h-4 w-4 mr-2"/> Phân tích file khác
                                </button>
                            </div>
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                {/* Cột trái: Preview tài liệu gốc */}
                                <div>
                                    <h3 className="text-lg font-bold text-gray-800 mb-3">Xem trước văn bản</h3>
                                    <div className="bg-gray-100 rounded-lg p-2 border shadow-inner min-h-[500px] flex items-center justify-center">
                                        {filePreview ? (
                                            <img src={filePreview} alt="Document Preview" className="w-full h-auto rounded-md object-contain max-h-[70vh]"/>
                                        ) : (
                                            <div className="text-center text-gray-500">
                                                <DocumentTextIcon className="h-16 w-16 mx-auto"/>
                                                <p className="font-semibold mt-2">{file?.name}</p>
                                                <p className="text-sm">Không có bản xem trước cho file PDF.</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                                
                                {/* Cột phải: Kết quả trích xuất chi tiết */}
                                <div>
                                   <div className="flex justify-between items-center mb-3">
                                        <h3 className="text-lg font-bold text-gray-800">Thông tin trích xuất</h3>
                                        <button onClick={exportJson} className="flex items-center text-sm px-3 py-1.5 bg-green-600 text-white rounded-lg hover:bg-green-700">
                                           <ArrowDownTrayIcon className="h-4 w-4 mr-1.5" /> Tải file JSON
                                        </button>
                                   </div>
                                   
                                   {/* Bảng thông số kỹ thuật */}
                                   <div className="bg-gray-50 border rounded-lg p-4 mb-4 text-sm grid grid-cols-3 gap-4 text-center">
                                       <div><span className="block font-semibold text-gray-700">Độ chính xác</span> <span className="text-blue-600 font-bold">{ocrResult.confidence}%</span></div>
                                       <div><span className="block font-semibold text-gray-700">Ngôn ngữ</span> <span className="text-blue-600 font-bold uppercase">{ocrResult.language}</span></div>
                                       <div><span className="block font-semibold text-gray-700">Thời gian xử lý</span> <span className="text-blue-600 font-bold">{ocrResult.processingTime}s</span></div>
                                   </div>

                                    {/* Cảnh báo (nếu có) */}
                                    {ocrResult.warnings.length > 0 && (
                                        <div className="p-3 mb-4 bg-yellow-50 border-l-4 border-yellow-400 text-yellow-800">
                                            <div className="flex">
                                                <ExclamationTriangleIcon className="h-5 w-5 mr-3" />
                                                <div>
                                                    <h4 className="font-bold">Cảnh báo từ hệ thống</h4>
                                                    <ul className="list-disc list-inside text-sm mt-1">
                                                        {ocrResult.warnings.map((w, i) => <li key={i}>{w}</li>)}
                                                    </ul>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                    {/* Tabs hiển thị kết quả chi tiết */}
                                   <OcrResultTabs result={ocrResult} />
                                </div>
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