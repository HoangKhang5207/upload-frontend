import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Toaster, toast } from 'react-hot-toast';

// --- Icon Imports ---
import { 
    CloudArrowUpIcon, 
    DocumentMagnifyingGlassIcon,
    ExclamationTriangleIcon,
    CheckCircleIcon,
    ArrowPathIcon,
    DocumentTextIcon,
    DocumentChartBarIcon
} from '@heroicons/react/24/solid';

// --- Mock API Import ---
import { mockDeepDuplicateCheck } from '../../api/mockUploadApi';

// Component hiển thị chi tiết các đoạn trùng lặp
import DuplicateDetails from '../../components/dms/upload/DuplicateDetails';

// Component hiển thị bảng thống kê
import StatisticsTable from '../../components/dms/upload/StatisticsTable';


// --- Main Page Component ---
const UC88_DuplicateCheckPage = () => {
    const [file, setFile] = useState(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [result, setResult] = useState(null);
    const [error, setError] = useState(null);
    const [threshold, setThreshold] = useState(30); // Ngưỡng mặc định 30%
    const [method, setMethod] = useState('fast'); // Phương pháp mặc định

    const handleReset = () => {
        setFile(null);
        setIsProcessing(false);
        setResult(null);
        setError(null);
    };
    
    const onDrop = useCallback((acceptedFiles) => {
        handleReset();
        const selectedFile = acceptedFiles[0];
        setFile(selectedFile);
    }, []);

    const handleCheck = () => {
        if (!file) {
            toast.error("Vui lòng chọn một file để kiểm tra.");
            return;
        }
        setIsProcessing(true);
        setResult(null);

        toast.promise(
            mockDeepDuplicateCheck(file),
            {
                loading: 'Đang phân tích sâu và đối chiếu toàn bộ CSDL...',
                success: (apiResult) => {
                    setResult(apiResult);
                    setIsProcessing(false);
                    return 'Phân tích hoàn tất!';
                },
                error: (err) => {
                    setError(err.message || 'Đã có lỗi xảy ra.');
                    setIsProcessing(false);
                    return 'Phân tích thất bại.';
                }
            }
        );
    }

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        maxFiles: 1,
        disabled: isProcessing,
    });
    
    return (
        <>
            <Toaster position="top-right" />
            <div className="max-w-6xl mx-auto">
                <header className="text-center mb-10">
                    <h1 className="text-4xl font-extrabold text-gray-800">
                        UC-88: Kiểm Tra Trùng Lặp Văn Bản
                    </h1>
                    <p className="text-gray-600 mt-2">Phân tích sâu để đảm bảo tính duy nhất của tài liệu trong hệ thống.</p>
                </header>
                
                <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-xl">
                    {/* --- Vùng cấu hình và Upload --- */}
                    {!result && (
                        <>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Tải lên văn bản cần kiểm tra:</label>
                                     <div {...getRootProps()} className={`p-8 text-center border-2 border-dashed rounded-xl cursor-pointer transition-all duration-300 ${isDragActive ? 'border-purple-500 bg-purple-50' : 'border-slate-300 hover:border-purple-400'}`}>
                                        <input {...getInputProps()} />
                                        <CloudArrowUpIcon className="h-12 w-12 mx-auto text-slate-400" />
                                        {file ? (
                                            <p className="mt-2 text-md font-semibold text-blue-700">{file.name}</p>
                                        ) : (
                                            <p className="mt-2 text-md font-semibold text-slate-700">Kéo thả file hoặc click để chọn</p>
                                        )}
                                        <p className="mt-1 text-xs text-slate-500">Hỗ trợ: PDF, DOCX, TXT</p>
                                    </div>
                                </div>
                                <div className="space-y-4">
                                     <div>
                                        <label htmlFor="threshold" className="block text-sm font-medium text-gray-700 mb-1">Ngưỡng phát hiện (%):</label>
                                        <input type="number" id="threshold" value={threshold} onChange={(e) => setThreshold(e.target.value)} className="w-full p-2 border border-gray-300 rounded-md" />
                                    </div>
                                     <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Phương pháp so sánh:</label>
                                        <div className="flex gap-2">
                                            <button onClick={() => setMethod('fast')} className={`flex-1 p-3 rounded-md font-semibold text-sm ${method === 'fast' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-800'}`}>⚡️ Thường (nhanh)</button>
                                            <button onClick={() => setMethod('deep')} className={`flex-1 p-3 rounded-md font-semibold text-sm ${method === 'deep' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-800'}`}>🧠 Deep Learning (chính xác hơn)</button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                             <div className="mt-8 border-t pt-6 text-center">
                                <button onClick={handleCheck} disabled={isProcessing} className="w-full max-w-xs px-8 py-3 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 disabled:bg-gray-400 flex items-center justify-center mx-auto">
                                    {isProcessing ? (
                                         <ArrowPathIcon className="h-5 w-5 mr-2 animate-spin"/>
                                    ) : (
                                        <DocumentMagnifyingGlassIcon className="h-5 w-5 mr-2" />
                                    )}
                                    {isProcessing ? "Đang phân tích..." : "Kiểm tra ngay"}
                                </button>
                                <p className="text-xs text-gray-400 mt-2">Lưu ý: Chỉ file có tên "Dupli-Document" mới được giả lập là có trùng lặp.</p>
                            </div>
                        </>
                    )}
                    
                    {/* --- Vùng hiển thị kết quả --- */}
                    {result && !isProcessing && (
                        <div className="animate-fade-in">
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-2xl font-bold text-gray-800">Kết quả kiểm tra trùng lặp</h2>
                                 <button onClick={handleReset} className="flex items-center text-sm px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700">
                                    <ArrowPathIcon className="h-4 w-4 mr-2"/> Kiểm tra file khác
                                </button>
                            </div>

                            {!result.hasDuplicates ? (
                                <div className="text-center p-8 bg-green-50 rounded-lg border border-green-200">
                                    <CheckCircleIcon className="h-16 w-16 text-green-500 mx-auto" />
                                    <h3 className="mt-4 text-2xl font-bold text-green-800">Không phát hiện trùng lặp</h3>
                                    <p className="mt-2 text-gray-600">{result.message}</p>
                                </div>
                            ) : (
                                <>
                                    <div className="p-4 mb-6 bg-red-50 border-l-4 border-red-500">
                                        <h3 className="text-lg font-semibold text-red-800 flex items-center">
                                            <ExclamationTriangleIcon className="h-6 w-6 mr-2"/>
                                            Cảnh báo: {result.message}
                                        </h3>
                                    </div>
                                    <StatisticsTable duplicates={result.duplicates} />
                                    <DuplicateDetails duplicates={result.duplicates} />
                                    <div className="mt-8 text-center border-t pt-6">
                                         <button className="px-6 py-2 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 flex items-center mx-auto">
                                            <DocumentChartBarIcon className="h-5 w-5 mr-2" />
                                            Tải báo cáo PDF chi tiết
                                        </button>
                                    </div>
                                </>
                            )}
                        </div>
                    )}
                </div>
            </div>
             <style>{`.animate-fade-in { animation: fadeIn 0.5s ease-in-out; } @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }`}</style>
        </>
    );
};

export default UC88_DuplicateCheckPage;