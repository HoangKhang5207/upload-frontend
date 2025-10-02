import React, { useState, useCallback, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import { Toaster, toast } from 'react-hot-toast';

// --- Icon Imports ---
import { 
    CloudArrowUpIcon, 
    DocumentIcon,
    ArrowRightCircleIcon,
    CheckBadgeIcon,
    InformationCircleIcon,
    ArrowPathIcon,
    Cog8ToothIcon
} from '@heroicons/react/24/solid';

// --- Mock API Imports ---
import { mockTriggerAutoRoute } from '../../api/mockUploadApi';
import { mockGetCategories } from '../../api/mockDmsApi';

// --- Component Imports ---
import WorkflowVisualizer from '../../components/dms/upload/WorkflowVisualizer';

// --- Main Page Component ---
const UC84_AutoRoutePage = () => {
    const [step, setStep] = useState(1); // 1: Upload, 2: Metadata, 3: Result
    const [file, setFile] = useState(null);
    const [categories, setCategories] = useState([]);
    const [metadata, setMetadata] = useState({ title: '', category: '' });
    const [isProcessing, setIsProcessing] = useState(false);
    const [result, setResult] = useState(null);

    useEffect(() => { mockGetCategories().then(setCategories); }, []);

    const onDrop = useCallback((acceptedFiles) => {
        const selectedFile = acceptedFiles[0];
        setResult(null); // Reset kết quả cũ
        setFile(selectedFile);
        // Tự động điền tiêu đề và bỏ đuôi file
        setMetadata({ title: selectedFile.name.replace(/\.[^/.]+$/, ""), category: '' });
        setStep(2);
    }, []);

    const handleReset = () => {
        setStep(1);
        setFile(null);
        setMetadata({ title: '', category: '' });
        setResult(null);
    };

    const handleTriggerRoute = async () => {
        if (!metadata.category) {
            toast.error("Vui lòng chọn một danh mục để hệ thống định tuyến.");
            return;
        }
        setIsProcessing(true);
        toast.promise(
            mockTriggerAutoRoute(file, metadata),
            {
                loading: 'Đang kiểm tra quy tắc và định tuyến...',
                success: (apiResult) => {
                    setResult(apiResult);
                    setIsProcessing(false);
                    setStep(3);
                    return apiResult.triggered ? "Đã tìm thấy và kích hoạt workflow!" : "Không có workflow phù hợp.";
                },
                error: (err) => {
                    setIsProcessing(false);
                    return `Lỗi: ${err.message}`;
                }
            }
        );
    };

    const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop, maxFiles: 1, disabled: step > 1 });

    const renderContent = () => {
        switch(step) {
            case 1:
                 return (
                    <div {...getRootProps()} className={`p-12 text-center border-2 border-dashed rounded-xl cursor-pointer transition-all ${isDragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-blue-400'}`}>
                        <input {...getInputProps()} />
                        <ArrowRightCircleIcon className="h-16 w-16 mx-auto text-gray-400" />
                        <p className="mt-4 text-xl font-semibold text-gray-700">Chọn file để bắt đầu quy trình định tuyến</p>
                        <p className="mt-2 text-sm text-gray-500">Hệ thống sẽ dựa vào danh mục bạn chọn để tự động luân chuyển.</p>
                    </div>
                );
            case 2:
                return (
                    <div className="animate-fade-in text-left w-full max-w-lg mx-auto">
                        <div className="mb-4 p-4 bg-gray-50 border rounded-lg flex items-center">
                            <DocumentIcon className="h-8 w-8 text-gray-500 mr-4 flex-shrink-0" />
                            <div>
                               <p className="font-bold text-gray-800">{file?.name}</p>
                               <p className="text-xs text-gray-500">Kích thước: {(file?.size / 1024).toFixed(2)} KB</p>
                            </div>
                        </div>
                        <div className="space-y-6 bg-white p-6 border rounded-lg">
                            <div>
                                <label htmlFor="title" className="block text-sm font-medium text-gray-700">Tiêu đề tài liệu</label>
                                <input id="title" type="text" value={metadata.title} onChange={e => setMetadata(p => ({...p, title: e.target.value}))} className="mt-1 w-full p-2 border border-gray-300 rounded-md"/>
                            </div>
                            <div>
                                <label htmlFor="category" className="block text-sm font-medium text-gray-700">
                                    <span className="text-red-500 font-bold">*</span> Danh mục (quan trọng cho định tuyến)
                                </label>
                                <select id="category" value={metadata.category} onChange={e => setMetadata(p => ({...p, category: e.target.value}))} className="mt-1 w-full p-2 border border-gray-300 rounded-md bg-yellow-50 focus:ring-blue-500 focus:border-blue-500">
                                    <option value="">-- Chọn danh mục --</option>
                                    {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                </select>
                            </div>
                        </div>
                        <div className="mt-8 flex justify-between items-center">
                            <button onClick={handleReset} className="text-sm text-gray-600 hover:underline">‹ Quay lại</button>
                            <button onClick={handleTriggerRoute} disabled={isProcessing} className="px-6 py-3 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 disabled:bg-gray-400 flex items-center">
                                {isProcessing ? (
                                    <ArrowPathIcon className="h-5 w-5 mr-2 animate-spin"/>
                                ) : (
                                    <Cog8ToothIcon className="h-5 w-5 mr-2"/>
                                )}
                                {isProcessing ? "Đang xử lý..." : "Tải lên & Định tuyến"}
                            </button>
                        </div>
                    </div>
                );
            case 3: {
                if (!result) return null;
                const isTriggered = result.triggered;
                return (
                    <div className="animate-fade-in text-center">
                        {isTriggered ? <CheckBadgeIcon className="h-16 w-16 mx-auto text-green-500" /> : <InformationCircleIcon className="h-16 w-16 mx-auto text-blue-500" />}
                        <h2 className={`mt-4 text-3xl font-bold ${isTriggered ? 'text-green-800' : 'text-blue-800'}`}>
                            {isTriggered ? "Kích hoạt quy trình thành công!" : "Tải lên hoàn tất"}
                        </h2>
                        <p className="mt-2 text-gray-600 max-w-2xl mx-auto">{result.message}</p>
                        
                        {isTriggered && result.workflow && (
                            <div className="mt-6 max-w-md mx-auto text-left">
                                <WorkflowVisualizer workflow={result.workflow} />
                            </div>
                        )}
                        
                        <button onClick={handleReset} className="mt-8 px-6 py-2 bg-gray-700 text-white font-bold rounded-lg hover:bg-gray-800 flex items-center mx-auto">
                            <ArrowPathIcon className="h-5 w-5 mr-2"/> Thử với file khác
                        </button>
                    </div>
                );
            }
            default: return null;
        }
    }

    return (
        <>
            <Toaster position="top-right" />
            <div className="max-w-4xl mx-auto">
                <header className="text-center mb-10">
                    <h1 className="text-4xl font-extrabold text-gray-800">
                        UC-84: Tự Động Định Tuyến Tài Liệu
                    </h1>
                    <p className="text-gray-600 mt-2">Dựa trên metadata để tự động gửi tài liệu vào các quy trình nghiệp vụ đã định sẵn.</p>
                </header>
                <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-xl min-h-[450px] flex items-center justify-center">
                    {renderContent()}
                </div>
            </div>
             <style>{`.animate-fade-in { animation: fadeIn 0.5s ease-in-out; } @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }`}</style>
        </>
    );
};

export default UC84_AutoRoutePage;