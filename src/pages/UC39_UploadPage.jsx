import React, { useState, useEffect, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Toaster, toast } from 'react-hot-toast';

// --- Icon Imports ---
import { 
    CloudArrowUpIcon, 
    DocumentTextIcon, 
    XCircleIcon, 
    CheckCircleIcon, 
    ExclamationTriangleIcon,
    InformationCircleIcon
} from '@heroicons/react/24/solid';

// --- Form Components ---
import InputField from '../components/common/InputField';
import SelectField from '../components/common/SelectField';

// --- Mock API Imports ---
import { mockCheckPermissions, mockProcessFile, mockFinalizeUpload } from '../api/mockUploadApi';
import { mockGetCategories } from '../api/mockDmsApi';

// --- Component Imports ---
// (Chúng ta sẽ tạo các component này ở bước tiếp theo)

// Component hiển thị thông tin file và tiến trình
import FileProgress from '../components/dms/upload/FileProgress';

// --- Main Page Component ---
const UC39_UploadPage = () => {
    // State Management
    const [step, setStep] = useState(1); // 1: Select file, 2: Processing, 3: Review, 4: Result
    const [file, setFile] = useState(null);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [isLoading, setIsLoading] = useState(false);
    const [permissions, setPermissions] = useState(null);
    const [categories, setCategories] = useState([]);
    const [metadata, setMetadata] = useState({
        title: '',
        category: '',
        tags: '',
        accessType: 'private',
        confidentiality: 'INTERNAL',
        key_values: {},
    });
    const [uploadResult, setUploadResult] = useState(null);
    const [apiResponse, setApiResponse] = useState(null); // Lưu kết quả từ mockProcessFile

    // --- Effects ---
    useEffect(() => {
        // Giả lập user đã đăng nhập
        const user = { department: "PHONG_HANH_CHINH", position: "TRUONG_PHONG" };
        mockCheckPermissions(user).then(setPermissions);
        mockGetCategories().then(setCategories);
    }, []);

    // --- Handlers ---
    const onDrop = useCallback((acceptedFiles) => {
        const selectedFile = acceptedFiles[0];
        // BƯỚC 2: Kiểm tra định dạng và kích thước
        if (selectedFile.size > 50 * 1024 * 1024) {
            toast.error("Lỗi: Kích thước file vượt quá 50MB.");
            return;
        }
        setFile(selectedFile);
        setMetadata(prev => ({ ...prev, title: selectedFile.name }));
        setStep(2);
        simulateUpload(selectedFile);
    }, []);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: {
          'application/pdf': ['.pdf'], 'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
          'image/jpeg': ['.jpg', '.jpeg'], 'image/png': ['.png'], 'image/tiff': ['.tiff'],
          'video/mp4': ['.mp4'], 'audio/mpeg': ['.mp3'], 'video/x-msvideo': ['.avi'], 'audio/wav': ['.wav'],
        },
        maxFiles: 1,
        disabled: !permissions?.granted || step > 1,
    });

    const handleRemoveFile = () => {
        setFile(null);
        setUploadProgress(0);
        setApiResponse(null);
        setStep(1);
    };
    
    const handleMetadataChange = (e) => {
        const { name, value } = e.target;
        setMetadata(prev => ({...prev, [name]: value}));
    }

    const handleFinalize = async () => {
        setIsLoading(true);
        toast.promise(
            mockFinalizeUpload(file, metadata),
            {
                loading: 'Đang lưu trữ và hoàn tất...',
                success: (result) => {
                    setUploadResult(result);
                    setStep(4);
                    setIsLoading(false);
                    return 'Hoàn tất thành công!';
                },
                error: (err) => {
                    setIsLoading(false);
                    return `Lỗi: ${err.message}`;
                }
            }
        );
    }
    
    // --- Simulations ---
    const simulateUpload = (selectedFile) => {
        // Giả lập tiến trình upload
        let progress = 0;
        const interval = setInterval(() => {
            progress += Math.random() * 25;
            if (progress >= 100) {
                progress = 100;
                clearInterval(interval);
                // BƯỚC 3 & 3.1: Sau khi upload xong, gọi xử lý file
                processFile(selectedFile);
            }
            setUploadProgress(progress);
        }, 300);
    };

    const processFile = async (selectedFile) => {
        toast.loading('Đang xử lý file (OCR, Check Duplicates,...)', { id: 'processing' });
        const result = await mockProcessFile(selectedFile);
        toast.dismiss('processing');

        if (!result.success) {
            toast.error(result.error);
            setApiResponse(result); // Lưu lại để hiển thị lỗi
        } else {
            toast.success('Xử lý file thành công, vui lòng xem lại thông tin gợi ý.');
            // BƯỚC 4: Cập nhật state với dữ liệu gợi ý
            setApiResponse(result);
            setMetadata(prev => ({
                ...prev,
                ...result.suggestedMetadata
            }));
            setStep(3); // Chuyển sang bước review
        }
    }
    
    // --- Render Logic ---
    if (!permissions) {
        return <div>Đang tải...</div>;
    }

    if (!permissions.granted) {
        return (
            <div className="text-center p-10 bg-white rounded-lg shadow-md">
                <ExclamationTriangleIcon className="h-12 w-12 text-red-500 mx-auto" />
                <h2 className="mt-4 text-2xl font-bold text-red-700">Truy Cập Bị Từ Chối</h2>
                <p className="mt-2 text-gray-600">{permissions.message}</p>
            </div>
        );
    }
    
    const renderContent = () => {
        switch(step) {
            case 1: // Chọn File
                return (
                    <div {...getRootProps()} className={`p-10 text-center border-3 border-dashed rounded-xl cursor-pointer transition-all duration-300 ${isDragActive ? 'border-purple-500 bg-purple-50 scale-105' : 'border-slate-300 hover:border-purple-400'}`}>
                        <input {...getInputProps()} />
                        <CloudArrowUpIcon className="h-16 w-16 mx-auto text-slate-400" />
                        <p className="mt-4 text-xl font-semibold text-slate-700">Kéo thả file hoặc click để chọn</p>
                        <p className="mt-2 text-sm text-slate-500">Hỗ trợ: PDF, DOCX, JPG, PNG, MP4, MP3... (Tối đa 50MB)</p>
                    </div>
                );
            case 2: // Đang Upload & Xử lý
                return (
                    <div>
                        {file && <FileProgress file={file} progress={uploadProgress} onRemove={handleRemoveFile}/>}
                        {apiResponse?.error && (
                             <div className="mt-4 p-4 bg-red-100 border-l-4 border-red-500 text-red-800 rounded-r-lg">
                                <h4 className="font-bold">Phát hiện trùng lặp!</h4>
                                <p>Tài liệu có {apiResponse.duplicateData.similarity} tương đồng với: <span className="font-semibold">{apiResponse.duplicateData.existingDocument.name}</span></p>
                                <button onClick={handleRemoveFile} className="mt-2 text-sm font-semibold hover:underline">Tải lên file khác</button>
                            </div>
                        )}
                    </div>
                );
            case 3: // Review Metadata
                 return (
                    <div className="text-left animate-fade-in">
                        <h3 className="text-2xl font-bold text-gray-800 mb-6">📝 Xem lại và Hoàn tất (UC-73, UC-87)</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Form Metadata */}
                            <div className="space-y-4">
                               <InputField label="Tên tài liệu" id="title" value={metadata.title} onChange={handleMetadataChange} required />
                               <SelectField label="Danh mục" id="category" value={metadata.category} onChange={handleMetadataChange} options={categories} required />
                               <InputField label="Tags & Keywords" id="tags" value={metadata.tags} onChange={handleMetadataChange} helpText="AI gợi ý, phân cách bởi dấu phẩy."/>
                               <SelectField label="Loại truy cập" id="accessType" value={metadata.accessType} options={[{id: 'private', name: 'Riêng tư'}, {id: 'public', name: 'Công khai (72h)'}, {id: 'paid', name: 'Trả phí'}]} onChange={handleMetadataChange} required />
                               <SelectField label="Mức bảo mật" id="confidentiality" value={metadata.confidentiality} options={[{id: 'PUBLIC', name: 'Công khai'}, {id: 'INTERNAL', name: 'Nội bộ'}, {id: 'LOCKED', name: 'Bảo mật'}]} onChange={handleMetadataChange} required />
                            </div>
                            {/* Key-Values & Warnings */}
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Key-Value Pairs (từ OCR)</label>
                                    <pre className="bg-gray-800 text-white p-3 rounded-md text-sm whitespace-pre-wrap">
                                        {JSON.stringify(metadata.key_values, null, 2)}
                                    </pre>
                                </div>
                                 {apiResponse?.warnings?.length > 0 && (
                                     <div className="p-4 bg-yellow-100 border-l-4 border-yellow-500 text-yellow-800">
                                         <h4 className="font-bold">Cảnh báo</h4>
                                         <ul className="list-disc list-inside text-sm">
                                             {apiResponse.warnings.map((w, i) => <li key={i}><strong>{w.field}:</strong> {w.message}</li>)}
                                         </ul>
                                     </div>
                                 )}
                            </div>
                        </div>
                        <div className="mt-8 flex justify-end gap-4">
                            <button type="button" onClick={handleRemoveFile} className="px-6 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300">Hủy</button>
                            <button type="button" onClick={handleFinalize} disabled={isLoading} className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400">
                                {isLoading ? 'Đang xử lý...' : 'Hoàn tất Upload'}
                            </button>
                        </div>
                    </div>
                );
             case 4: // Kết quả
                return (
                    <div className="text-center p-8 bg-white rounded-lg shadow-xl animate-fade-in">
                        <CheckCircleIcon className="h-16 w-16 text-green-500 mx-auto" />
                        <h2 className="mt-4 text-3xl font-bold text-gray-800">{uploadResult.message}</h2>
                        <div className="mt-4 text-left bg-slate-50 p-4 rounded-lg border max-w-md mx-auto space-y-2">
                             <p><strong>ID:</strong> <span className="font-mono">{uploadResult.document.doc_id}</span></p>
                             <p><strong>Tên:</strong> {uploadResult.document.title}</p>
                             <p><strong>Phiên bản:</strong> {uploadResult.document.version}</p>
                             <p><strong>Trạng thái:</strong> <span className="font-semibold bg-orange-100 text-orange-700 px-2 py-1 rounded-full text-sm">{uploadResult.document.status}</span></p>
                             {uploadResult.autoRouteInfo && <p className="text-blue-600"><strong>Auto-Route:</strong> {uploadResult.autoRouteInfo.message}</p>}
                             {uploadResult.document.public_link && <p className="text-green-600"><strong>Link công khai:</strong> {uploadResult.document.public_link}</p>}
                        </div>
                        <button onClick={() => window.location.reload()} className="mt-8 px-8 py-3 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700">
                            Tải lên file khác
                        </button>
                    </div>
                );
        }
    }

    return (
        <>
            <Toaster position="top-right" />
            <div className="max-w-5xl mx-auto">
                <header className="text-center mb-8">
                    <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-blue-600">
                        UC-39: Upload File
                    </h1>
                    <p className="text-gray-600 mt-2">Quy trình upload, xử lý và lưu trữ tài liệu an toàn.</p>
                </header>
                <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-xl min-h-[300px] flex flex-col justify-center">
                    {renderContent()}
                </div>
            </div>
        </>
    );
};

export default UC39_UploadPage;