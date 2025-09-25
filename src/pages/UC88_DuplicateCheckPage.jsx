import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Toaster, toast } from 'react-hot-toast';

// --- Icon Imports ---
import { 
    CloudArrowUpIcon, 
    DocumentMagnifyingGlassIcon,
    ExclamationTriangleIcon,
    CheckCircleIcon,
    DocumentDuplicateIcon,
    ArrowPathIcon,
    EyeIcon
} from '@heroicons/react/24/solid';

// --- Mock API Import ---
import { mockDeepDuplicateCheck } from '../api/mockUploadApi';

// --- Helper Functions & Components ---
import SimilarityBadge from '../components/dms/upload/SimilarityBadge';
import DuplicateItem from '../components/dms/upload/DuplicateItem';


// --- Main Page Component ---
const UC88_DuplicateCheckPage = () => {
    const [file, setFile] = useState(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [result, setResult] = useState(null);
    const [error, setError] = useState(null);

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
        setIsProcessing(true);

        toast.promise(
            mockDeepDuplicateCheck(selectedFile),
            {
                loading: 'Đang phân tích và đối chiếu tài liệu...',
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
    }, []);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        maxFiles: 1,
        disabled: isProcessing,
    });
    
    const renderResult = () => {
        if (!result) return null;

        if (!result.hasDuplicates) {
            return (
                <div className="text-center p-8 bg-green-50 rounded-lg border border-green-200">
                    <CheckCircleIcon className="h-16 w-16 text-green-500 mx-auto" />
                    <h3 className="mt-4 text-2xl font-bold text-green-800">Tuyệt vời!</h3>
                    <p className="mt-2 text-gray-600">{result.message}</p>
                </div>
            );
        }

        return (
            <div>
                <div className="p-4 mb-6 bg-orange-50 border-l-4 border-orange-400">
                    <div className="flex">
                        <div className="flex-shrink-0">
                            <ExclamationTriangleIcon className="h-6 w-6 text-orange-400" />
                        </div>
                        <div className="ml-3">
                            <h3 className="text-lg font-semibold text-orange-800">Cảnh báo trùng lặp</h3>
                            <p className="text-sm text-orange-700 mt-1">{result.message}</p>
                        </div>
                    </div>
                </div>

                <div className="space-y-4">
                    {result.duplicates.map((item, index) => (
                        <DuplicateItem key={item.id} item={item} index={index} />
                    ))}
                </div>

                <div className="mt-8 flex justify-center items-center gap-4 border-t pt-6">
                    <button className="px-6 py-2 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700">
                        Hủy bỏ Upload
                    </button>
                    <button className="px-6 py-2 bg-gray-600 text-white font-semibold rounded-lg hover:bg-gray-700">
                        Upload dưới dạng phiên bản mới
                    </button>
                    <button className="px-6 py-2 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700">
                        Vẫn tiếp tục Upload
                    </button>
                </div>
            </div>
        );
    };

    return (
        <>
            <Toaster position="top-right" />
            <div className="max-w-6xl mx-auto">
                <header className="text-center mb-8">
                    <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-blue-600">
                        UC-88: Kiểm Tra Trùng Lặp Tài Liệu
                    </h1>
                    <p className="text-gray-600 mt-2">Phân tích sâu để đảm bảo tính duy nhất của tài liệu trong hệ thống.</p>
                </header>
                
                <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-xl">
                    {!file && (
                        <div {...getRootProps()} className={`p-10 text-center border-3 border-dashed rounded-xl cursor-pointer transition-all duration-300 ${isDragActive ? 'border-purple-500 bg-purple-50' : 'border-slate-300 hover:border-purple-400'}`}>
                            <input {...getInputProps()} />
                            <DocumentMagnifyingGlassIcon className="h-16 w-16 mx-auto text-slate-400" />
                            <p className="mt-4 text-xl font-semibold text-slate-700">Chọn 1 file để bắt đầu kiểm tra</p>
                            <p className="mt-2 text-sm text-slate-500">Hệ thống sẽ tự động phân tích ngay sau khi bạn chọn file.</p>
                            <p className="mt-2 text-xs text-slate-400">Lưu ý: Chỉ file có tên "Dupli-Document" mới được phát hiện là trùng lặp</p>
                        </div>
                    )}
                    
                    {(file || isProcessing) && (
                        <div className="mb-6">
                            <div className="flex items-center p-3 bg-slate-50 border rounded-lg">
                                <DocumentDuplicateIcon className="h-8 w-8 text-blue-600" />
                                <div className="ml-3 flex-grow">
                                    <p className="font-semibold text-slate-800">{file?.name}</p>
                                    <p className="text-sm text-slate-500">Kích thước: {(file?.size / 1024).toFixed(2)} KB</p>
                                </div>
                                <button onClick={handleReset} disabled={isProcessing} className="text-slate-500 hover:text-red-600 disabled:opacity-50">
                                    <ArrowPathIcon className={`h-6 w-6 ${isProcessing ? 'animate-spin' : ''}`} />
                                </button>
                            </div>
                        </div>
                    )}
                    
                    {isProcessing && (
                        <div className="text-center p-8">
                            <p className="text-lg font-semibold text-gray-700">Đang xử lý, vui lòng chờ...</p>
                        </div>
                    )}

                    {!isProcessing && result && (
                        <div className="animate-fade-in">
                            {renderResult()}
                        </div>
                    )}
                    
                     {!isProcessing && error && (
                        <div className="text-center p-8 text-red-600">
                            <p>Lỗi: {error}</p>
                        </div>
                    )}

                </div>
            </div>
             <style>{`
                @keyframes fadeInUp {
                    from { opacity: 0; transform: translateY(20px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .animate-fade-in {
                    animation: fadeIn 0.5s ease-in-out;
                }
                @keyframes fadeIn {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }
            `}</style>
        </>
    );
};

export default UC88_DuplicateCheckPage;