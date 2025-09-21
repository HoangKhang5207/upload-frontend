import React, { useState, useCallback, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import { Toaster, toast } from 'react-hot-toast';

// --- Icon Imports ---
import { 
    CloudArrowUpIcon, 
    DocumentIcon,
    ArrowRightCircleIcon,
    CheckBadgeIcon,
    ExclamationCircleIcon,
    ArrowPathIcon
} from '@heroicons/react/24/solid';

// --- Mock API Imports ---
import { mockTriggerAutoRoute } from '../api/mockUploadApi';
import { mockGetCategories } from '../api/mockDmsApi';

// --- Child Components ---
import WorkflowVisualizer from '../components/dms/upload/WorkflowVisualizer';

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
        setFile(selectedFile);
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
            toast.error("Vui lòng chọn một danh mục cho tài liệu.");
            return;
        }
        setIsProcessing(true);
        const apiResult = await mockTriggerAutoRoute(file, metadata);
        setResult(apiResult);
        setIsProcessing(false);
        setStep(3);
    };

    const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop, maxFiles: 1, disabled: step > 1 });

    const renderContent = () => {
        switch(step) {
            case 1:
                 return (
                    <div {...getRootProps()} className={`p-10 text-center border-3 border-dashed rounded-xl cursor-pointer transition-all ${isDragActive ? 'border-purple-500 bg-purple-50' : 'border-slate-300 hover:border-purple-400'}`}>
                        <input {...getInputProps()} />
                        <ArrowRightCircleIcon className="h-16 w-16 mx-auto text-slate-400" />
                        <p className="mt-4 text-xl font-semibold">Chọn file để bắt đầu quy trình định tuyến</p>
                    </div>
                );
            case 2:
                return (
                    <div className="animate-fade-in text-left">
                        <h3 className="text-xl font-bold mb-4">Bước 2: Cung cấp thông tin cơ bản</h3>
                        <div className="mb-4 p-3 bg-gray-50 border rounded-lg flex items-center">
                            <DocumentIcon className="h-6 w-6 text-gray-500 mr-3" />
                            <span className="font-semibold">{file?.name}</span>
                        </div>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium">Tiêu đề</label>
                                <input type="text" value={metadata.title} onChange={e => setMetadata(p => ({...p, title: e.target.value}))} className="w-full mt-1 p-2 border rounded-md"/>
                            </div>
                            <div>
                                <label className="block text-sm font-medium">Danh mục (quan trọng cho định tuyến)</label>
                                <select value={metadata.category} onChange={e => setMetadata(p => ({...p, category: e.target.value}))} className="w-full mt-1 p-2 border rounded-md bg-yellow-50">
                                    <option value="">-- Chọn danh mục --</option>
                                    {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                </select>
                            </div>
                        </div>
                        <div className="mt-6 flex justify-between items-center">
                            <button onClick={handleReset} className="text-sm text-gray-600 hover:underline">Chọn file khác</button>
                            <button onClick={handleTriggerRoute} disabled={isProcessing} className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400">
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
                        {isTriggered ? <CheckBadgeIcon className="h-16 w-16 mx-auto text-green-500" /> : <ExclamationCircleIcon className="h-16 w-16 mx-auto text-yellow-500" />}
                        <h2 className={`mt-4 text-2xl font-bold ${isTriggered ? 'text-green-800' : 'text-yellow-800'}`}>
                            {isTriggered ? "Kích hoạt quy trình thành công!" : "Không có quy trình tự động"}
                        </h2>
                        <p className="mt-2 text-gray-600 max-w-2xl mx-auto">{result.message}</p>
                        
                        {isTriggered && result.workflow && <WorkflowVisualizer workflow={result.workflow} />}
                        
                        <button onClick={handleReset} className="mt-8 px-6 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-800 flex items-center mx-auto">
                            <ArrowPathIcon className="h-5 w-5 mr-2"/> Thử với file khác
                        </button>
                    </div>
                );
            }
        }
    }

    return (
        <>
            <Toaster position="top-right" />
            <div className="max-w-4xl mx-auto">
                <header className="text-center mb-8">
                    <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-blue-600">
                        UC-84: Tự Động Định Tuyến Tài Liệu
                    </h1>
                    <p className="text-gray-600 mt-2">Dựa trên metadata để tự động gửi tài liệu vào các quy trình nghiệp vụ.</p>
                </header>
                <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-xl min-h-[350px] flex items-center justify-center">
                    {renderContent()}
                </div>
            </div>
             <style>{`.animate-fade-in { animation: fadeIn 0.5s ease-in-out; } @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }`}</style>
        </>
    );
};

export default UC84_AutoRoutePage;