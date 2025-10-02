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
import { mockCheckPermissions, mockOcrProcessing, mockDuplicateCheck, mockMetadataSuggestion, mockDataValidation, mockEmbedWatermark, mockFinalizeUpload } from '../api/mockUploadApi';
import { mockGetCategories } from '../api/mockDmsApi';

// --- Component Imports ---
import FileProgress from '../components/dms/upload/FileProgress';
import ProcessingSteps from '../components/dms/upload/ProcessingSteps';

// --- Main Page Component ---
const UC39_UploadPage = () => {
    // State Management
    const [step, setStep] = useState(1); // 1: Select file, 2: Processing, 3: Review, 4: Result
    const [file, setFile] = useState(null);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [processingSteps, setProcessingSteps] = useState([
        { name: 'OCR/Xử lý văn bản', status: 'pending', description: 'Trích xuất nội dung từ tài liệu' },
        { name: 'Kiểm tra trùng lặp', status: 'pending', description: 'So sánh với tài liệu đã có' },
        { name: 'Gợi ý metadata', status: 'pending', description: 'Phân tích và đề xuất thông tin' },
        { name: 'Kiểm tra dữ liệu', status: 'pending', description: 'Xác minh tính hợp lệ' },
        { name: 'Nhúng watermark', status: 'pending', description: 'Bảo vệ bản quyền tài liệu' }
    ]);
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
    const [deviceType, setDeviceType] = useState('desktop'); // Thiết bị mặc định
    const [duplicateCheckEnabled, setDuplicateCheckEnabled] = useState(true); // Mặc định TẮT kiểm tra trùng lặp (có thể chỉnh sửa trực tiếp trong code)
    const [uploadPermissionEnabled, setUploadPermissionEnabled] = useState(true); // Mặc định bật quyền upload
    const [watermarkResult, setWatermarkResult] = useState(null); // Kết quả nhúng watermark

    // Theo dõi sự thay đổi của duplicateCheckEnabled
    useEffect(() => {
        console.log('duplicateCheckEnabled changed to:', duplicateCheckEnabled);
    }, [duplicateCheckEnabled]);

    // --- Device Detection ---
    const detectDeviceType = () => {
        const userAgent = navigator.userAgent;
        if (/mobile/i.test(userAgent)) {
            setDeviceType('mobile');
        } else if (/tablet/i.test(userAgent)) {
            setDeviceType('tablet');
        } else {
            setDeviceType('desktop');
        }
    };

    // --- Effects ---
    useEffect(() => {
        // Giả lập user đã đăng nhập và có quyền upload
        const user = { department: "PHONG_HANH_CHINH", position: "TRUONG_PHONG" };
        mockGetCategories().then(setCategories);
        
        // Đặt permissions mặc định để tránh treo ở trạng thái "Đang tải..."
        setPermissions({
            granted: true,
            message: "Quyền truy cập hợp lệ.",
            checks: []
        });
        
        // Phát hiện loại thiết bị
        detectDeviceType();
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
        disabled: !uploadPermissionEnabled || step > 1,
    });

    const handleRemoveFile = () => {
        setFile(null);
        setUploadProgress(0);
        setApiResponse(null);
        setStep(1);
        // Reset processing steps
        setProcessingSteps([
            { name: 'OCR/Xử lý văn bản', status: 'pending', description: 'Trích xuất nội dung từ tài liệu' },
            { name: 'Kiểm tra trùng lặp', status: 'pending', description: 'So sánh với tài liệu đã có' },
            { name: 'Gợi ý metadata', status: 'pending', description: 'Phân tích và đề xuất thông tin' },
            { name: 'Kiểm tra dữ liệu', status: 'pending', description: 'Xác minh tính hợp lệ' },
            { name: 'Nhúng watermark', status: 'pending', description: 'Bảo vệ bản quyền tài liệu' }
        ]);
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
                    setWatermarkResult(result.watermarkInfo); // Lưu kết quả watermark
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

    // --- Processing Functions ---
    const updateStepStatus = (stepIndex, status, progress = null) => {
        setProcessingSteps(prev => {
            const updated = [...prev];
            updated[stepIndex] = progress !== null 
                ? { ...updated[stepIndex], status, progress }
                : { ...updated[stepIndex], status };
            return updated;
        });
    };

    const simulateStepProgress = (stepIndex, duration = 1500) => {
        return new Promise((resolve) => {
            updateStepStatus(stepIndex, 'processing', 0);
            
            let progress = 0;
            const interval = setInterval(() => {
                progress += 10;
                updateStepStatus(stepIndex, 'processing', progress);
                
                if (progress >= 100) {
                    clearInterval(interval);
                    setTimeout(() => {
                        updateStepStatus(stepIndex, 'completed', 100);
                        resolve();
                    }, 300);
                }
            }, duration / 10);
        });
    };

    const processFile = async (selectedFile) => {
        toast.loading('Đang xử lý file (OCR, Check Duplicates,...)', { id: 'processing' });
        
        // Reset processing steps
        setProcessingSteps([
            { name: 'OCR/Xử lý văn bản', status: 'pending', description: 'Trích xuất nội dung từ tài liệu' },
            { name: 'Kiểm tra trùng lặp', status: 'pending', description: 'So sánh với tài liệu đã có' },
            { name: 'Gợi ý metadata', status: 'pending', description: 'Phân tích và đề xuất thông tin' },
            { name: 'Kiểm tra dữ liệu', status: 'pending', description: 'Xác minh tính hợp lệ' },
            { name: 'Nhúng watermark', status: 'pending', description: 'Bảo vệ bản quyền tài liệu' }
        ]);

        try {
            // Step 1: OCR Processing
            await simulateStepProgress(0, 1500);
            const ocrResult = await mockOcrProcessing(selectedFile);
            
            if (!ocrResult.success) {
                throw new Error("OCR processing failed");
            }
            updateStepStatus(0, 'completed');

            // Step 2: Duplicate Check
            updateStepStatus(1, 'processing', 0);
            
            // Simulate progress for duplicate check
            let dupProgress = 0;
            const dupInterval = setInterval(() => {
                dupProgress += 10;
                updateStepStatus(1, 'processing', dupProgress);
                
                if (dupProgress >= 100) {
                    clearInterval(dupInterval);
                }
            }, 100);
            
            // Wait for the mock duplicate check
            const duplicateResult = await mockDuplicateCheck(selectedFile, duplicateCheckEnabled);
            
            // Clear interval and update status based on result
            clearInterval(dupInterval);
            
            if (!duplicateResult.success) {
                // Show error immediately without completing
                updateStepStatus(1, 'error', 100);
                toast.dismiss('processing');
                toast.error(duplicateResult.error);
                setApiResponse(duplicateResult);
                setStep(2); // Show error in step 2
                return;
            }
            
            // If successful, show as completed
            updateStepStatus(1, 'completed', 100);

            // Step 3: Metadata Suggestion
            await simulateStepProgress(2, 1200);
            const metadataResult = await mockMetadataSuggestion(selectedFile, ocrResult.ocrContent);
            updateStepStatus(2, 'completed');

            // Step 4: Data Validation
            await simulateStepProgress(3, 800);
            const validationResult = await mockDataValidation(metadataResult.suggestedMetadata.key_values);
            updateStepStatus(3, 'completed');

            // Step 5: Embed Watermark
            await simulateStepProgress(4, 1000);
            const watermarkResult = await mockEmbedWatermark(selectedFile);
            updateStepStatus(4, 'completed');

            // Combine all results
            const finalResult = {
                success: true,
                ocrContent: ocrResult.ocrContent,
                suggestedMetadata: metadataResult.suggestedMetadata,
                warnings: validationResult.warnings,
                watermarkInfo: watermarkResult
            };

            toast.dismiss('processing');

            // Small delay before moving to review step
            setTimeout(() => {
                toast.success('Xử lý file thành công, vui lòng xem lại thông tin gợi ý.');
                setApiResponse(finalResult);
                setMetadata(prev => ({
                    ...prev,
                    ...finalResult.suggestedMetadata
                }));
                setStep(3); // Move to review step
            }, 1000);
        } catch (error) {
            toast.dismiss('processing');
            toast.error('Có lỗi xảy ra trong quá trình xử lý file');
            console.error('Processing error:', error);
        }
    };
    
    // Hàm kiểm tra mâu thuẫn dữ liệu (sao chép từ mockUploadApi.js)
    const checkDataConflicts = (keyValues) => {
        const conflicts = [];
        
        // Kiểm tra số lượng âm
        if (keyValues["Số lượng"] !== undefined && keyValues["Số lượng"] < 0) {
            conflicts.push({
                field: "Số lượng",
                value: keyValues["Số lượng"],
                message: "Số lượng không thể là số âm"
            });
        }
        
        // Kiểm tra giá trị âm
        if (keyValues["Giá trị"] !== undefined && keyValues["Giá trị"] < 0) {
            conflicts.push({
                field: "Giá trị",
                value: keyValues["Giá trị"],
                message: "Giá trị không thể là số âm"
            });
        }
        
        // Kiểm tra ngày vượt quá 20/08/2025
        if (keyValues["Ngày ban hành"]) {
            const datePattern = /(\d{2})\/(\d{2})\/(\d{4})/;
            const match = keyValues["Ngày ban hành"].match(datePattern);
            if (match) {
                const day = parseInt(match[1], 10);
                const month = parseInt(match[2], 10) - 1; // JavaScript months are 0-indexed
                const year = parseInt(match[3], 10);
                const documentDate = new Date(year, month, day);
                const cutoffDate = new Date(2025, 7, 20); // 20/08/2025
                
                if (documentDate > cutoffDate) {
                    conflicts.push({
                        field: "Ngày ban hành",
                        value: keyValues["Ngày ban hành"],
                        message: "Ngày ban hành không thể vượt quá 20/08/2025"
                    });
                }
            }
        }
        
        return conflicts;
    };

    // --- Render Logic ---
    const renderContent = () => {
        switch(step) {
            case 1: // Chọn File
                return (
                    <div>
                        {/* Các nút bật/tắt quyền upload */}
                        <div className="flex flex-wrap gap-4 mb-6 p-4 bg-gray-100 rounded-lg">
                            <div className="flex items-center">
                                <label className="flex items-center cursor-pointer">
                                    <div className="relative">
                                        <input 
                                            type="checkbox" 
                                            className="sr-only" 
                                            checked={uploadPermissionEnabled}
                                            onChange={() => setUploadPermissionEnabled(!uploadPermissionEnabled)}
                                        />
                                        <div className={`block w-14 h-8 rounded-full ${uploadPermissionEnabled ? 'bg-blue-500' : 'bg-gray-300'}`}></div>
                                        <div className={`absolute left-1 top-1 bg-white w-6 h-6 rounded-full transition-transform ${uploadPermissionEnabled ? 'transform translate-x-6' : ''}`}></div>
                                    </div>
                                    <div className="ml-3 text-gray-700 font-medium">
                                        Quyền upload: {uploadPermissionEnabled ? 'Bật' : 'Tắt'}
                                    </div>
                                </label>
                            </div>
                        </div>
                        
                        {/* Hiển thị thông báo truy cập bị từ chối nếu quyền upload bị tắt */}
                        {!uploadPermissionEnabled ? (
                            <div className="text-center p-10 bg-white rounded-lg shadow-md">
                                <ExclamationTriangleIcon className="h-12 w-12 text-red-500 mx-auto" />
                                <h2 className="mt-4 text-2xl font-bold text-red-700">Truy Cập Bị Từ Chối</h2>
                                <p className="mt-2 text-gray-600">Bạn không có quyền upload tài liệu. Vui lòng liên hệ quản trị viên để được cấp quyền.</p>
                            </div>
                        ) : (
                            /* Dropzone */
                            <div {...getRootProps()} className={`p-10 text-center border-3 border-dashed rounded-xl cursor-pointer transition-all duration-300 ${isDragActive ? 'border-purple-500 bg-purple-50 scale-105' : 'border-slate-300 hover:border-purple-400'}`}>
                                <input {...getInputProps()} />
                                <CloudArrowUpIcon className="h-16 w-16 mx-auto text-slate-400" />
                                <p className="mt-4 text-xl font-semibold text-slate-700">Kéo thả file hoặc click để chọn</p>
                                <p className="mt-2 text-sm text-slate-500">Hỗ trợ: PDF, DOCX, JPG, PNG, MP4, MP3... (Tối đa 50MB)</p>
                                {/* Hiển thị loại thiết bị detected */}
                                <p className="mt-2 text-xs text-slate-400">Thiết bị: {deviceType}</p>
                                {/* Hiển thị trạng thái kiểm tra trùng lặp để debug */}
                                <p className="mt-2 text-xs text-slate-400">Kiểm tra trùng lặp: {duplicateCheckEnabled ? 'Bật' : 'Tắt'}</p>
                            </div>
                        )}
                    </div>
                );
            case 2: // Đang Upload & Xử lý
                return (
                    <div>
                        {file && <FileProgress file={file} progress={uploadProgress} onRemove={handleRemoveFile}/>}
                        {uploadProgress === 100 && (
                            <ProcessingSteps steps={processingSteps} />
                        )}
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
                            {/* Key-Values & Warnings & OCR Content */}
                            <div className="space-y-4">
                                {/* OCR Content Section */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Nội dung trích xuất (OCR)</label>
                                    <div className="bg-gray-800 text-white p-3 rounded-md text-sm whitespace-pre-wrap max-h-40 overflow-y-auto">
                                        {apiResponse?.ocrContent || "Không có nội dung trích xuất"}
                                    </div>
                                </div>
                                
                                {/* Key-Value Pairs */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Key-Value Pairs</label>
                                    <pre className="bg-gray-800 text-white p-3 rounded-md text-sm whitespace-pre-wrap">
                                        {JSON.stringify(metadata.key_values, null, 2)}
                                    </pre>
                                </div>
                                
                                {/* Warnings */}
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
                             {watermarkResult && (
                                <div className={`mt-2 p-2 rounded ${watermarkResult.success ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                    <p className="font-semibold">Watermark: {watermarkResult.message}</p>
                                    {watermarkResult.watermarkedFile && (
                                        <p className="text-sm">File đã watermark: {watermarkResult.watermarkedFile.name}</p>
                                    )}
                                </div>
                             )}
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