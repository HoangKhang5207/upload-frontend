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
    DocumentTextIcon
} from '@heroicons/react/24/solid';

// --- Mock API Imports ---
import { mockDetailedSuggestMetadata } from '../../api/mockUploadApi';
import { mockGetCategories } from '../../api/mockDmsApi';

import SuggestionField from '../../components/dms/upload/SuggestionField';

// --- Main Page Component ---
const UC73_SuggestMetadataPage = () => {
    const [file, setFile] = useState(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [analysisResult, setAnalysisResult] = useState(null);
    const [categories, setCategories] = useState([]);
    const [formData, setFormData] = useState({
        title: '',
        summary: '',
        category: '',
        tags: [],
    });

    useEffect(() => {
        mockGetCategories().then(setCategories);
    }, []);

    const resetState = () => {
        setFile(null);
        setIsProcessing(false);
        setAnalysisResult(null);
        setFormData({ title: '', summary: '', category: '', tags: [] });
    };

    const handleAcceptSuggestion = (field, value) => {
        setFormData(prev => ({...prev, [field]: value }));
        toast.success(`Đã áp dụng gợi ý cho '${labelMappings[field] || field}'`);
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
    
    const labelMappings = { title: 'Tiêu đề', summary: 'Tóm tắt', category: 'Danh mục' };

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
                                    {file.name}
                                </h2>
                                 <button onClick={resetState} className="flex items-center text-sm px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700">
                                    <ArrowPathIcon className="h-4 w-4 mr-2"/> Phân tích file khác
                                </button>
                            </div>
                            
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                {/* Cột trái: Form nhập liệu */}
                                <div className="space-y-6">
                                    <SuggestionField label="Tiêu đề tài liệu" suggestion={analysisResult.suggestions.title} onAccept={() => handleAcceptSuggestion('title', analysisResult.suggestions.title.value)}>
                                        <input type="text" value={formData.title} onChange={e => setFormData(p => ({...p, title: e.target.value}))} className="w-full p-2 border rounded-md"/>
                                    </SuggestionField>

                                    <SuggestionField label="Tóm tắt nội dung" suggestion={analysisResult.suggestions.summary} onAccept={() => handleAcceptSuggestion('summary', analysisResult.suggestions.summary.value)}>
                                        <textarea value={formData.summary} onChange={e => setFormData(p => ({...p, summary: e.target.value}))} rows="5" className="w-full p-2 border rounded-md"></textarea>
                                    </SuggestionField>
                                    
                                    <SuggestionField label="Danh mục" suggestion={{...analysisResult.suggestions.category, value: categories.find(c => c.id === analysisResult.suggestions.category.value)?.name}} onAccept={() => handleAcceptSuggestion('category', analysisResult.suggestions.category.value)}>
                                        <select value={formData.category} onChange={e => setFormData(p => ({...p, category: e.target.value}))} className="w-full p-2 border rounded-md">
                                            <option value="">-- Chọn danh mục --</option>
                                            {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                        </select>
                                    </SuggestionField>
                                    
                                     <div>
                                        <label className="block text-sm font-medium text-gray-700">Tags / Keywords</label>
                                        <div className="mt-2 p-3 bg-gray-50 border rounded-md">
                                            <p className="text-xs text-gray-500 mb-2">Click vào tag gợi ý để thêm:</p>
                                            <div className="flex flex-wrap gap-2">
                                            {analysisResult.suggestions.tags.map(tag => (
                                                <button key={tag.value} onClick={() => setFormData(p => ({...p, tags: [...new Set([...p.tags, tag.value])]}))} className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full hover:bg-blue-200 transition-colors">
                                                    {tag.value} <span className="text-xs opacity-75">({tag.confidence.toFixed(1)}%)</span>
                                                </button>
                                            ))}
                                            </div>
                                        </div>
                                        <input type="text" value={formData.tags.join(', ')} readOnly className="mt-2 w-full p-2 border rounded-md bg-gray-100 cursor-not-allowed" placeholder="Tags đã chọn..."/>
                                    </div>
                                </div>
                                
                                {/* Cột phải: Thông tin AI trích xuất */}
                                <div className="space-y-6">
                                     <div>
                                        <label className="block text-sm font-medium text-gray-700">Key-Values đã trích xuất</label>
                                        <pre className="mt-1 bg-gray-800 text-white p-3 rounded-md text-xs whitespace-pre-wrap max-h-48 overflow-y-auto">
                                            {JSON.stringify(analysisResult.suggestions.key_values, null, 2)}
                                        </pre>
                                     </div>
                                     
                                     {analysisResult.analysis.conflicts.length > 0 && (
                                         <div className="p-4 bg-red-50 border-l-4 border-red-400">
                                             <h4 className="font-bold flex items-center text-red-800"><ExclamationTriangleIcon className="h-5 w-5 mr-2"/> Phát hiện mâu thuẫn</h4>
                                             <ul className="list-disc list-inside text-sm mt-2 text-red-700 space-y-1">
                                                 {analysisResult.analysis.conflicts.map((c, i) => <li key={i}><strong>{c.field}:</strong> {c.message}</li>)}
                                             </ul>
                                         </div>
                                     )}
                                     
                                     {analysisResult.analysis.warnings.length > 0 && (
                                         <div className="p-4 bg-yellow-50 border-l-4 border-yellow-400">
                                             <h4 className="font-bold flex items-center text-yellow-800"><InformationCircleIcon className="h-5 w-5 mr-2"/> Cảnh báo thiếu thông tin</h4>
                                             <ul className="list-disc list-inside text-sm mt-2 text-yellow-700 space-y-1">
                                                 {analysisResult.analysis.warnings.map((w, i) => <li key={i}><strong>{w.field}:</strong> {w.message}</li>)}
                                             </ul>
                                         </div>
                                     )}
                                </div>
                            </div>
                            
                            <div className="mt-8 pt-6 border-t flex justify-end gap-4">
                                <button type="button" onClick={resetState} className="px-6 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 font-semibold">Hủy</button>
                                <button type="button" onClick={() => toast.success("Đã lưu metadata thành công!")} className="px-8 py-2 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700">Lưu Metadata</button>
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