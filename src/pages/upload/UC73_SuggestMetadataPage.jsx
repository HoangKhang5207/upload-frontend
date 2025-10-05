import React, { useState, useCallback, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import { Toaster, toast } from 'react-hot-toast';

// --- Icon Imports ---
import { 
    CloudArrowUpIcon, 
    LightBulbIcon, 
    CheckIcon, 
    ArrowPathIcon,
    SparklesIcon,
    ExclamationTriangleIcon,
    InformationCircleIcon,
    DocumentTextIcon,
    TagIcon,
    FolderIcon,
    DocumentDuplicateIcon
} from '@heroicons/react/24/solid';

// --- Mock API Imports ---
import { mockDetailedSuggestMetadata } from '../../api/mockUploadApi';
import { mockGetCategories } from '../../api/mockDmsApi';

import KeyValuePairsDisplay from '../../components/dms/upload/KeyValuePairsDisplay';
import EditableMetadataForm from '../../components/dms/upload/EditableMetadataForm';

// --- Document Categories and Types ---
import { documentCategories, documentTypes } from '../../data/documentCategories';

// --- Main Page Component ---
const UC73_SuggestMetadataPage = () => {
    const [file, setFile] = useState(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [analysisResult, setAnalysisResult] = useState(null);
    const [categories, setCategories] = useState([]);
    const [metadata, setMetadata] = useState({
        title: '',
        description: '',
        keywords: [],
        category: '',
        documentType: ''
    });

    useEffect(() => {
        mockGetCategories().then(setCategories);
    }, []);

    const resetState = () => {
        setFile(null);
        setIsProcessing(false);
        setAnalysisResult(null);
        setMetadata({
            title: '',
            description: '',
            keywords: [],
            category: '',
            documentType: ''
        });
    };

    const onDrop = useCallback((acceptedFiles) => {
        const selectedFile = acceptedFiles[0];
        resetState();
        setFile(selectedFile);
        setIsProcessing(true);

        toast.promise(
            mockDetailedSuggestMetadata(selectedFile),
            {
                loading: 'AI đang phân tích và đề xuất metadata...',
                success: (res) => {
                    if (res.success) {
                        setAnalysisResult(res);
                        // Transform the data structure to match EditableMetadataForm expectations
                        setMetadata({
                            title: res.suggestions.title?.value || '',
                            description: res.suggestions.summary?.value || '',
                            keywords: res.suggestions.tags?.map(tag => tag.value) || [],
                            category: res.suggestions.category?.value || '',
                            documentType: res.suggestions.documentType?.value || ''
                        });
                        setIsProcessing(false);
                        return 'Phân tích thành công!';
                    }
                    throw new Error("Phân tích thất bại");
                },
                error: (err) => {
                    setIsProcessing(false);
                    return `Lỗi: ${err.message}`;
                }
            }
        );
    }, []);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop, maxFiles: 1, disabled: isProcessing });
    
    // Handle saving metadata from EditableMetadataForm
    const handleSaveMetadata = (updatedMetadata) => {
        setMetadata(updatedMetadata);
        toast.success("Đã cập nhật siêu dữ liệu!");
    };

    // Handle canceling metadata editing
    const handleCancelMetadata = () => {
        // Reset to original values if needed
    };

    // Xử lý chỉnh sửa key-value pair
    const handleEditKeyValue = (key, value) => {
        // Trong thực tế, bạn có thể mở một modal để chỉnh sửa
        // Ở đây chúng ta chỉ hiển thị toast để minh họa
        toast.success(`Chỉnh sửa key-value: ${key} = ${value}`);
    };

    return (
        <>
            <Toaster position="top-right" />
            <div className="max-w-6xl mx-auto">
                <header className="text-center mb-10">
                    <h1 className="text-4xl font-extrabold text-gray-800">
                        UC-73: Gợi Ý Metadata Thông Minh
                    </h1>
                    <p className="text-gray-600 mt-2">Sử dụng AI để tự động điền thông tin, tiết kiệm thời gian và đảm bảo nhất quán.</p>
                </header>
                
                <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-xl">
                    {!file && (
                        <div {...getRootProps()} className={`p-12 text-center border-2 border-dashed rounded-xl cursor-pointer transition-all ${isDragActive ? 'border-purple-500 bg-purple-50' : 'border-slate-300 hover:border-purple-400'}`}>
                            <input {...getInputProps()} />
                            <SparklesIcon className="h-16 w-16 mx-auto text-gray-400" />
                            <p className="mt-4 text-xl font-semibold text-gray-700">Chọn file để AI phân tích</p>
                            <p className="mt-2 text-sm text-gray-500">Hệ thống sẽ tự động trích xuất và gợi ý các thông tin quan trọng.</p>
                        </div>
                    )}
                    
                    {isProcessing && (
                         <div className="text-center py-20">
                            <ArrowPathIcon className="h-12 w-12 mx-auto text-blue-600 animate-spin" />
                            <h3 className="text-2xl font-bold text-gray-800 mt-6">AI đang phân tích file...</h3>
                            <p className="text-gray-500 mt-2">{file?.name}</p>
                        </div>
                    )}

                    {analysisResult && (
                        <div className="animate-fade-in">
                            <div className="flex justify-between items-center mb-6 pb-4 border-b">
                                <h2 className="text-2xl font-bold text-gray-800 flex items-center">
                                    <DocumentTextIcon className="h-8 w-8 mr-3 text-blue-600"/>
                                    {metadata.title || file.name}
                                </h2>
                                 <button onClick={resetState} className="flex items-center text-sm px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700">
                                    <ArrowPathIcon className="h-4 w-4 mr-2"/> Phân tích file khác
                                </button>
                            </div>
                            
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                {/* Cột trái: Key-Value Pairs */}
                                <div className="space-y-6">
                                     <KeyValuePairsDisplay 
                                        keyValuePairs={analysisResult.suggestions.key_values}
                                        onEdit={handleEditKeyValue}
                                     />
                                     
                                     {analysisResult.analysis.conflicts.length > 0 && (
                                         <div className="p-4 bg-red-50 border-l-4 border-red-400 rounded-md">
                                             <h4 className="font-bold flex items-center text-red-800">
                                                 <ExclamationTriangleIcon className="h-5 w-5 mr-2"/> Phát hiện mâu thuẫn
                                             </h4>
                                             <ul className="list-disc list-inside text-sm mt-2 text-red-700 space-y-1">
                                                 {analysisResult.analysis.conflicts.map((c, i) => (
                                                     <li key={i}>
                                                         <strong>{c.field}:</strong> {c.message}
                                                     </li>
                                                 ))}
                                             </ul>
                                         </div>
                                     )}
                                     
                                     {analysisResult.analysis.warnings.length > 0 && (
                                         <div className="p-4 bg-yellow-50 border-l-4 border-yellow-400 rounded-md">
                                             <h4 className="font-bold flex items-center text-yellow-800">
                                                 <InformationCircleIcon className="h-5 w-5 mr-2"/> Cảnh báo thiếu thông tin
                                             </h4>
                                             <ul className="list-disc list-inside text-sm mt-2 text-yellow-700 space-y-1">
                                                 {analysisResult.analysis.warnings.map((w, i) => (
                                                     <li key={i}>
                                                         <strong>{w.field}:</strong> {w.message}
                                                     </li>
                                                 ))}
                                             </ul>
                                         </div>
                                     )}
                                </div>
                                
                                {/* Cột phải: Metadata có thể chỉnh sửa */}
                                <div className="space-y-6">
                                    <EditableMetadataForm 
                                        metadata={metadata}
                                        onSave={handleSaveMetadata}
                                        onCancel={handleCancelMetadata}
                                    />
                                </div>
                            </div>
                            
                            <div className="mt-8 pt-6 border-t flex justify-end gap-4">
                                <button 
                                    type="button" 
                                    onClick={resetState} 
                                    className="px-6 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 font-semibold"
                                >
                                    Hủy
                                </button>
                                <button 
                                    type="button" 
                                    onClick={() => toast.success("Đã lưu metadata thành công!")} 
                                    className="px-8 py-2 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700"
                                >
                                    Lưu Metadata
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
            <style>{`.animate-fade-in { animation: fadeIn 0.5s ease-in-out; } @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }`}</style>
        </>
    );
};

export default UC73_SuggestMetadataPage;