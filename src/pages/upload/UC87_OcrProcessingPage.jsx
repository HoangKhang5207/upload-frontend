import React, { useState, useCallback, useEffect } from 'react';
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
import OcrResultTabs from '../../components/dms/upload/OcrResultTabs';
import PdfViewer from '../../components/dms/upload/PdfViewer';
import HorizontalProcessingBar from '../../components/dms/upload/HorizontalProcessingBar';
import EditableMetadataForm from '../../components/dms/upload/EditableMetadataForm';

// --- Sample Data ---
import sampleData from '../../data/ocrSampleData.json';
import sampleData10Pages from '../../data/sampleData10Pages.json';
import processingStepsData from '../../data/processingStepsData.json';

// --- Main Page Component ---
const UC87_OcrProcessingPage = () => {
    const [file, setFile] = useState(null);
    const [filePreview, setFilePreview] = useState(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [ocrResult, setOcrResult] = useState(null);
    const [useSampleData, setUseSampleData] = useState(false);
    const [useSampleData10Pages, setUseSampleData10Pages] = useState(false);
    const [processCompleted, setProcessCompleted] = useState(false);
    const [processingSteps, setProcessingSteps] = useState(processingStepsData);
    const [metadata, setMetadata] = useState(sampleData.metadataSuggestion);

    // Reset trạng thái khi upload file mới
    const resetProcessingState = () => {
        setProcessingSteps(processingStepsData);
        setProcessCompleted(false);
    };

    const handleReset = () => {
        setFile(null);
        setFilePreview(null);
        setOcrResult(null);
        setIsProcessing(false);
        setUseSampleData(false);
        setUseSampleData10Pages(false);
        setProcessCompleted(false);
        setProcessingSteps(processingStepsData);
        setMetadata(sampleData.metadataSuggestion);
    };

    // Cập nhật tiến trình xử lý
    const updateProcessingStep = (stepId, status, details = "") => {
        setProcessingSteps(prevSteps => 
            prevSteps.map(step => 
                step.id === stepId 
                    ? { ...step, status, details } 
                    : step
            )
        );
    };

    // Mô phỏng tiến trình xử lý theo thời gian thực
    useEffect(() => {
        if (!isProcessing || (useSampleData || useSampleData10Pages)) return;

        const totalPages = sampleData.documentInfo.pages; // Trong thực tế, đây sẽ là số trang thực tế của file

        const timer1 = setTimeout(() => {
            // Hoàn thành bước 1: Nhận diện định dạng
            updateProcessingStep(1, "completed", file.type.startsWith('image/') ? "Ảnh đơn" : `PDF ảnh (${totalPages} trang)`);
        }, 500);

        const timer2 = setTimeout(() => {
            // Bắt đầu bước 2: Khử nhiễu và tiền xử lý
            updateProcessingStep(2, "in-progress");
        }, 1000);

        const timer3 = setTimeout(() => {
            // Hoàn thành bước 2: Khử nhiễu và tiền xử lý
            updateProcessingStep(2, "completed", "Đã áp dụng bộ lọc khử nhiễu AI");
        }, 2000);

        const timer4 = setTimeout(() => {
            // Bắt đầu bước 3: Đang xử lý OCR
            updateProcessingStep(3, "in-progress");
        }, 2500);

        const timer5 = setTimeout(() => {
            // Hoàn thành bước 3: Đang xử lý OCR
            updateProcessingStep(3, "completed", "Trích xuất văn bản với độ chính xác 96.8%");
        }, 6000);

        const timer6 = setTimeout(() => {
            // Bắt đầu bước 4: Phân tích và gợi ý metadata
            updateProcessingStep(4, "in-progress");
        }, 6500);

        const timer7 = setTimeout(() => {
            // Hoàn thành bước 4: Phân tích và gợi ý metadata
            updateProcessingStep(4, "completed", "Đã phân tích nội dung để gợi ý siêu dữ liệu");
        }, 8000);

        const timer8 = setTimeout(() => {
            // Bắt đầu bước 5: Hoàn tất xử lý
            updateProcessingStep(5, "in-progress");
        }, 8500);

        const timer9 = setTimeout(() => {
            // Hoàn thành bước 5: Hoàn tất xử lý
            updateProcessingStep(5, "completed", "Chuẩn bị kết quả cuối cùng");
        }, 9000);

        return () => {
            clearTimeout(timer1);
            clearTimeout(timer2);
            clearTimeout(timer3);
            clearTimeout(timer4);
            clearTimeout(timer5);
            clearTimeout(timer6);
            clearTimeout(timer7);
            clearTimeout(timer8);
            clearTimeout(timer9);
        };
    }, [isProcessing, useSampleData, useSampleData10Pages, file]);

    const onDrop = useCallback((acceptedFiles) => {
        const selectedFile = acceptedFiles[0];
        if (!selectedFile) return;

        handleReset();
        setFile(selectedFile);
        
        if (selectedFile.type.startsWith('image/')) {
            const reader = new FileReader();
            reader.onload = (e) => setFilePreview(e.target.result);
            reader.readAsDataURL(selectedFile);
        } else {
            setFilePreview(null);
        }
        
        setIsProcessing(true);
        resetProcessingState();
        
        toast.promise(
            mockOcrProcess(selectedFile),
            {
                loading: 'AI đang phân tích và trích xuất dữ liệu...',
                success: (result) => {
                    setOcrResult(result);
                    // Không đặt isProcessing thành false ở đây nữa
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
    
    const loadSampleData = () => {
        setUseSampleData(true);
        setUseSampleData10Pages(false);
        setOcrResult(sampleData.ocrResult);
        setFile({ name: sampleData.documentInfo.name, type: sampleData.documentInfo.type });
        setMetadata(sampleData.metadataSuggestion);
    };

    const loadSampleData10Pages = () => {
        setUseSampleData(false);
        setUseSampleData10Pages(true);
        setOcrResult(sampleData10Pages.ocrResult);
        setFile({ name: sampleData10Pages.documentInfo.name, type: sampleData10Pages.documentInfo.type });
        setMetadata(sampleData10Pages.metadataSuggestion);
    };

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

    // Callback khi tất cả các bước tiến trình hoàn thành
    const handleProcessComplete = () => {
        setProcessCompleted(true);
        setIsProcessing(false);
    };

    // Xử lý lưu siêu dữ liệu
    const handleSaveMetadata = (updatedMetadata) => {
        setMetadata(updatedMetadata);
        toast.success("Đã cập nhật siêu dữ liệu!");
    };

    // Xử lý hủy chỉnh sửa siêu dữ liệu
    const handleCancelMetadata = () => {
        // Không cần làm gì đặc biệt ở đây
    };

    // Lấy số trang từ dữ liệu mẫu hoặc file được upload
    const getTotalPages = () => {
        if (useSampleData) {
            return sampleData.documentInfo.pages;
        }
        if (useSampleData10Pages) {
            return sampleData10Pages.documentInfo.pages;
        }
        if (file) {
            return sampleData.documentInfo.pages; // Trong thực tế, đây sẽ là số trang thực tế của file
        }
        return 3; // Mặc định
    };

    // Lấy dữ liệu hiện tại để hiển thị
    const getCurrentData = () => {
        if (useSampleData) {
            return sampleData;
        }
        if (useSampleData10Pages) {
            return sampleData10Pages;
        }
        return sampleData; // Mặc định
    };

    const currentData = getCurrentData();

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
                         <div className="space-y-6">
                            <div {...getRootProps()} className={`p-12 text-center border-2 border-dashed rounded-xl cursor-pointer transition-all duration-300 ${isDragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-blue-400'}`}>
                                <input {...getInputProps()} />
                                <SparklesIcon className="h-16 w-16 mx-auto text-gray-400" />
                                <p className="mt-4 text-xl font-semibold text-gray-700">Kéo thả file PDF hoặc ảnh vào đây</p>
                                <p className="mt-2 text-sm text-gray-500">Hệ thống sẽ tự động xử lý và hiển thị kết quả chi tiết.</p>
                            </div>
                            
                            <div className="text-center space-y-2">
                                <p className="text-sm text-gray-600">Hoặc sử dụng dữ liệu mẫu để xem trước giao diện:</p>
                                <div className="flex justify-center space-x-4">
                                    <button 
                                        onClick={loadSampleData}
                                        className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                                    >
                                        5 trang
                                    </button>
                                    <span className="text-gray-400">|</span>
                                    <button 
                                        onClick={loadSampleData10Pages}
                                        className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                                    >
                                        10 trang
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                    
                    {/* Giao diện đang xử lý */}
                    {isProcessing && (
                        <div className="flex flex-col items-center justify-center h-full min-h-[500px] text-center">
                            <ArrowPathIcon className="h-12 w-12 text-blue-600 animate-spin"/>
                            <h3 className="text-2xl font-bold text-gray-800 mt-6">Đang phân tích dữ liệu...</h3>
                            <p className="text-gray-500 mt-2">AI đang xử lý và trích xuất thông tin từ văn bản của bạn.</p>
                            <p className="font-semibold mt-2">{file?.name}</p>
                            
                            <div className="mt-8 w-full max-w-2xl">
                                <HorizontalProcessingBar 
                                    steps={processingSteps} 
                                    onProcessComplete={handleProcessComplete}
                                    totalPages={getTotalPages()}
                                />
                            </div>
                        </div>
                    )}

                    {/* Giao diện hiển thị kết quả */}
                    {((ocrResult && !isProcessing && processCompleted) || useSampleData || useSampleData10Pages) && (
                        <div className="animate-fade-in">
                             <div className="flex justify-between items-center mb-6 pb-4 border-b">
                                <h2 className="text-2xl font-bold text-gray-800">Phân tích hoàn tất!</h2>
                                 <button onClick={handleReset} className="flex items-center text-sm px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors">
                                    <ArrowPathIcon className="h-4 w-4 mr-2"/> Phân tích file khác
                                </button>
                            </div>
                            
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                                {/* Cột trái: Preview tài liệu gốc */}
                                <div className="lg:col-span-1">
                                    <div className="bg-white rounded-xl shadow-md p-6 sticky top-6">
                                        <PdfViewer 
                                            totalPages={currentData.documentInfo.pages} 
                                            fileName={currentData.documentInfo.name} 
                                        />
                                    </div>
                                </div>
                                
                                {/* Cột phải: Kết quả OCR và tiến trình */}
                                <div className="lg:col-span-2 space-y-8">
                                    {/* Thanh tiến trình xử lý */}
                                    <HorizontalProcessingBar 
                                        steps={(useSampleData || useSampleData10Pages) ? currentData.processingSteps : processingSteps} 
                                        onProcessComplete={handleProcessComplete}
                                        totalPages={getTotalPages()}
                                    />
                                    
                                    {/* Siêu dữ liệu có thể chỉnh sửa */}
                                    <div className="bg-white rounded-xl shadow-md p-6">
                                        <EditableMetadataForm 
                                            metadata={metadata}
                                            onSave={handleSaveMetadata}
                                            onCancel={handleCancelMetadata}
                                        />
                                    </div>
                                    
                                    {/* Kết quả trích xuất chi tiết */}
                                    <div className="bg-white rounded-xl shadow-md p-6">
                                        <div className="flex justify-between items-center mb-6">
                                            <h3 className="text-xl font-bold text-gray-800">Thông tin trích xuất chi tiết</h3>
                                            <button onClick={exportJson} className="flex items-center text-sm px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
                                               <ArrowDownTrayIcon className="h-4 w-4 mr-2" /> Tải file JSON
                                            </button>
                                       </div>
                                       
                                       {/* Bảng thông số kỹ thuật */}
                                       <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100 rounded-lg p-4 mb-6 text-sm grid grid-cols-3 gap-4 text-center">
                                           <div className="bg-white rounded-lg p-3 shadow-sm">
                                               <span className="block font-semibold text-gray-700">Độ chính xác</span> 
                                               <span className="text-blue-600 font-bold text-lg">{currentData.ocrResult.confidence}%</span>
                                           </div>
                                           <div className="bg-white rounded-lg p-3 shadow-sm">
                                               <span className="block font-semibold text-gray-700">Ngôn ngữ</span> 
                                               <span className="text-blue-600 font-bold uppercase text-lg">{currentData.ocrResult.language}</span>
                                           </div>
                                           <div className="bg-white rounded-lg p-3 shadow-sm">
                                               <span className="block font-semibold text-gray-700">Thời gian xử lý</span> 
                                               <span className="text-blue-600 font-bold text-lg">{currentData.ocrResult.processingTime}s</span>
                                           </div>
                                       </div>

                                        {/* Cảnh báo (nếu có) */}
                                        {currentData.ocrResult.warnings.length > 0 && (
                                            <div className="p-4 mb-6 bg-yellow-50 border-l-4 border-yellow-400 rounded-lg text-yellow-800">
                                                <div className="flex">
                                                    <ExclamationTriangleIcon className="h-5 w-5 mr-3 mt-0.5 flex-shrink-0" />
                                                    <div>
                                                        <h4 className="font-bold">Cảnh báo từ hệ thống</h4>
                                                        <ul className="list-disc list-inside text-sm mt-1 space-y-1">
                                                            {currentData.ocrResult.warnings.map((w, i) => <li key={i}>{w}</li>)}
                                                        </ul>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                        
                                        {/* Tabs hiển thị kết quả chi tiết */}
                                       <OcrResultTabs result={currentData.ocrResult} />
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
            <style>{`
                .animate-fade-in { 
                    animation: fadeIn 0.5s ease-in-out; 
                } 
                @keyframes fadeIn { 
                    from { opacity: 0; transform: translateY(10px); } 
                    to { opacity: 1; transform: translateY(0); } 
                }
                .transition-colors {
                    transition: background-color 0.2s ease;
                }
            `}</style>
        </>
    );
};

export default UC87_OcrProcessingPage;