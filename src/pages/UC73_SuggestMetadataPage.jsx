import React, { useState, useCallback, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import { Toaster, toast } from 'react-hot-toast';

// --- Icon Imports ---
import { 
    CloudArrowUpIcon, 
    LightBulbIcon, 
    CheckIcon, 
    PencilIcon, 
    XMarkIcon,
    SparklesIcon
} from '@heroicons/react/24/solid';

// --- Mock API Imports ---
import { mockSuggestMetadata } from '../api/mockUploadApi';
import { mockGetCategories } from '../api/mockDmsApi';

// --- Reusable Input Component with Suggestion ---
import SuggestionInput from '../components/dms/upload/SuggestionInput';


// --- Main Page Component ---
const UC73_SuggestMetadataPage = () => {
    const [file, setFile] = useState(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [suggestions, setSuggestions] = useState(null);
    const [categories, setCategories] = useState([]);
    const [formData, setFormData] = useState({
        title: '',
        summary: '',
        category: '',
        tags: [],
        confidentiality: '',
        retention_policy: '',
    });

    useEffect(() => {
        mockGetCategories().then(setCategories);
    }, []);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({...prev, [name]: value}));
    };

    const handleAcceptSuggestion = (field) => {
        if (!suggestions || !suggestions[field]) return;
        setFormData(prev => ({...prev, [field]: suggestions[field].value }));
        toast.success(`Đã chấp nhận gợi ý cho '${field}'`);
    };

    const onDrop = useCallback((acceptedFiles) => {
        const selectedFile = acceptedFiles[0];
        setFile(selectedFile);
        setIsProcessing(true);
        setSuggestions(null); // Reset previous suggestions
        setFormData({ title: '', summary: '', category: '', tags: [], confidentiality: '', retention_policy: '' }); // Reset form

        toast.promise(
            mockSuggestMetadata(selectedFile),
            {
                loading: 'AI đang phân tích và đề xuất metadata...',
                success: (res) => {
                    setSuggestions(res.suggestions);
                    setIsProcessing(false);
                    return 'Phân tích thành công!';
                },
                error: (err) => {
                    setIsProcessing(false);
                    return `Lỗi: ${err.message}`;
                }
            }
        );
    }, []);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop, maxFiles: 1, disabled: isProcessing });
    
    // --- Render Logic ---
    return (
        <>
            <Toaster position="top-right" />
            <div className="max-w-4xl mx-auto">
                <header className="text-center mb-8">
                    <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-blue-600">
                        UC-73: Gợi Ý Metadata Thông Minh
                    </h1>
                    <p className="text-gray-600 mt-2">Sử dụng AI để tự động điền thông tin, tiết kiệm thời gian và đảm bảo nhất quán.</p>
                </header>
                
                <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-xl">
                    {!file && (
                        <div {...getRootProps()} className={`p-10 text-center border-3 border-dashed rounded-xl cursor-pointer transition-all ${isDragActive ? 'border-purple-500 bg-purple-50' : 'border-slate-300 hover:border-purple-400'}`}>
                            <input {...getInputProps()} />
                            <CloudArrowUpIcon className="h-16 w-16 mx-auto text-slate-400" />
                            <p className="mt-4 text-xl font-semibold">Chọn file để nhận gợi ý metadata</p>
                        </div>
                    )}
                    
                    {isProcessing && (
                         <div className="text-center py-10">
                            <h3 className="text-xl font-semibold text-gray-700">Đang phân tích: {file?.name}</h3>
                            <p className="text-gray-500 mt-2">Vui lòng chờ trong giây lát...</p>
                        </div>
                    )}

                    {suggestions && (
                        <div className="animate-fade-in">
                            <div className="p-4 mb-6 bg-blue-50 border-l-4 border-blue-400">
                                <h3 className="flex items-center text-lg font-semibold text-blue-800"><SparklesIcon className="h-6 w-6 mr-2"/>AI đã đề xuất metadata cho tài liệu của bạn!</h3>
                                <p className="text-sm text-blue-700 mt-1">Vui lòng xem lại, chỉnh sửa và chấp nhận các gợi ý bên dưới.</p>
                            </div>
                            <div className="space-y-6">
                                <SuggestionInput label="Tiêu đề tài liệu" suggestion={suggestions.title} onAccept={() => handleAcceptSuggestion('title')}>
                                    <input type="text" name="title" value={formData.title} onChange={handleInputChange} className="w-full p-2 border rounded-md"/>
                                </SuggestionInput>

                                <SuggestionInput label="Tóm tắt nội dung" suggestion={suggestions.summary} onAccept={() => handleAcceptSuggestion('summary')}>
                                    <textarea name="summary" value={formData.summary} onChange={handleInputChange} rows="4" className="w-full p-2 border rounded-md"></textarea>
                                </SuggestionInput>
                                
                                <SuggestionInput label="Danh mục" suggestion={{...suggestions.category, value: categories.find(c => c.id === suggestions.category.value)?.name}} onAccept={() => handleAcceptSuggestion('category')}>
                                    <select name="category" value={formData.category} onChange={handleInputChange} className="w-full p-2 border rounded-md">
                                        <option value="">Chọn danh mục</option>
                                        {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                    </select>
                                </SuggestionInput>

                                 <div>
                                    <label className="block text-sm font-medium text-gray-700">Tags / Keywords</label>
                                    <div className="mt-2 p-3 bg-gray-50 border rounded-md">
                                        <p className="text-xs text-gray-500 mb-2">Click vào tag để thêm vào form</p>
                                        <div className="flex flex-wrap gap-2">
                                        {suggestions.tags.map(tag => (
                                            <button key={tag.value} onClick={() => setFormData(p => ({...p, tags: [...p.tags, tag.value]}))} className="px-3 py-1 bg-green-100 text-green-800 text-sm rounded-full hover:bg-green-200">
                                                {tag.value} <span className="text-xs opacity-75">({tag.confidence}%)</span>
                                            </button>
                                        ))}
                                        </div>
                                    </div>
                                    <input type="text" value={formData.tags.join(', ')} readOnly className="mt-2 w-full p-2 border rounded-md bg-gray-100" placeholder="Tags đã chọn..."/>
                                </div>
                                
                                <SuggestionInput label="Mức độ bảo mật" suggestion={{...suggestions.confidentiality, reason: undefined}} onAccept={() => handleAcceptSuggestion('confidentiality')}>
                                     <select name="confidentiality" value={formData.confidentiality} onChange={handleInputChange} className="w-full p-2 border rounded-md">
                                         <option value="">Chọn mức độ</option>
                                         <option value="PUBLIC">Công khai</option>
                                         <option value="INTERNAL">Nội bộ</option>
                                         <option value="LOCKED">Bảo mật</option>
                                     </select>
                                </SuggestionInput>
                                
                                <div className="mt-8 flex justify-end gap-4">
                                    <button type="button" onClick={() => setFile(null)} className="px-6 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300">Hủy</button>
                                    <button type="button" className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">Lưu Metadata</button>
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

export default UC73_SuggestMetadataPage;