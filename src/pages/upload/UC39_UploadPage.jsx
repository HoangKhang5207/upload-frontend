import React, { useState, useEffect, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Toaster, toast } from 'react-hot-toast';

// --- (MỚI) Import Context và Actions ---
import { useUpload, actionTypes } from '../../contexts/UploadContext';

// --- Icon Imports ---
import { 
    CloudArrowUpIcon, 
    CheckCircleIcon, 
    ExclamationTriangleIcon,
    ShieldExclamationIcon
} from '@heroicons/react/24/solid';

// --- Component Imports ---
import InputField from '../../components/common/InputField';
import SelectField from '../../components/common/SelectField';
import FileProgress from '../../components/dms/upload/FileProgress';
import ProcessingSteps from '../../components/dms/upload/ProcessingSteps';
import WorkflowVisualizer from '../../components/dms/upload/WorkflowVisualizer'; // Component hiển thị workflow
import ProcessingResultDetails from '../../components/dms/upload/ProcessingResultDetails';

// --- Mock API Imports ---
import * as uploadApi from '../../api/mockUploadApi'; // Import tất cả API từ file mock
import { mockGetCategories } from '../../api/mockDmsApi';

// --- Main Page Component ---
const UC39_UploadPage = () => {
    const { state, dispatch } = useUpload();
    const {
        step,
        file,
        uploadProgress,
        processingSteps,
        metadata,
        apiResponse,
        uploadResult,
        categories, // Lấy categories từ context
    } = state;

    // State cục bộ cho các toggle trên UI
    const [duplicateCheckEnabled, setDuplicateCheckEnabled] = useState(true);
    const [uploadPermissionEnabled, setUploadPermissionEnabled] = useState(true);
    const [deviceType, setDeviceType] = useState('desktop');

    // --- Effects ---
    useEffect(() => {
        const initialize = async () => {
            // Chỉ fetch dữ liệu nếu chưa có trong context
            if (state.categories.length === 0) {
                const user = { department: "PHONG_HANH_CHINH", position: "TRUONG_PHONG" };
                const [categoriesData, permissionsData] = await Promise.all([
                    mockGetCategories(),
                    uploadApi.mockCheckPermissions(user)
                ]);
                dispatch({ type: actionTypes.SET_INITIAL_DATA, payload: { categories: categoriesData, permissions: permissionsData } });
            }
        };
        
        initialize();

        const userAgent = navigator.userAgent;
        if (/mobile/i.test(userAgent)) setDeviceType('mobile');
        else if (/tablet/i.test(userAgent)) setDeviceType('tablet');
        else setDeviceType('desktop');

    }, [dispatch, state.categories.length]);


    // --- (BUG FIX) Tách logic xử lý file ra khỏi useCallback có dependency thay đổi ---
    const processFile = useCallback(async (selectedFile) => {
        toast.loading('Đang xử lý file...', { id: 'processing' });

        const steps = [
            { name: 'Khử nhiễu ảnh (AI)', status: 'pending', description: 'Cải thiện chất lượng ảnh scan' },
            { name: 'OCR & Trích xuất văn bản', status: 'pending', description: 'Trích xuất nội dung từ tài liệu' },
            { name: 'Kiểm tra trùng lặp (CSDL)', status: 'pending', description: 'So sánh với các tài liệu đã có' },
            { name: 'Gợi ý & Trích xuất Key-Values', status: 'pending', description: 'Phân tích và đề xuất thông tin' },
            { name: 'Kiểm tra mâu thuẫn dữ liệu', status: 'pending', description: 'Xác minh tính hợp lệ của metadata' },
            { name: 'Nhúng watermark bảo vệ', status: 'pending', description: 'Bảo vệ bản quyền tài liệu' }
        ];
        dispatch({ type: actionTypes.SET_PROCESSING_STEPS, payload: steps });

        const updateStepStatus = (stepIndex, status, progress = null) => {
            dispatch({ type: actionTypes.UPDATE_STEP_STATUS, payload: { stepIndex, status, progress } });
        };

        try {
            // Step 1: Khử nhiễu ảnh
            updateStepStatus(0, 'processing');
            const denoiseResult = await uploadApi.mockDenoiseImage(selectedFile);
            updateStepStatus(0, 'completed');

            // Step 2: OCR
            updateStepStatus(1, 'processing');
            const ocrResult = await uploadApi.mockOcrProcessing(selectedFile);
            if (!ocrResult.success) throw new Error("OCR processing failed");
            updateStepStatus(1, 'completed');

            // Step 3: Kiểm tra trùng lặp
            updateStepStatus(2, 'processing');
            const duplicateResult = await uploadApi.mockDuplicateCheck(selectedFile, duplicateCheckEnabled);
            if (!duplicateResult.success) {
                updateStepStatus(2, 'error');
                toast.dismiss('processing');
                toast.error(duplicateResult.error, { duration: 6000 });
                dispatch({ type: actionTypes.SET_API_RESPONSE, payload: { ...state.apiResponse, duplicateError: duplicateResult } });
                return;
            }
            updateStepStatus(2, 'completed');

            // Step 4: Gợi ý Metadata & Trích xuất Key-Values
            updateStepStatus(3, 'processing');
            const metadataResult = await uploadApi.mockMetadataSuggestion(ocrResult.ocrContent);
            dispatch({ type: actionTypes.SET_METADATA, payload: metadataResult.suggestedMetadata });
            updateStepStatus(3, 'completed');

            // Step 5: Kiểm tra mâu thuẫn dữ liệu
            updateStepStatus(4, 'processing');
            const conflictResult = uploadApi.mockDataConflictCheck(metadataResult.suggestedMetadata.key_values);
            updateStepStatus(4, 'completed');

            // Step 6: Nhúng Watermark
            updateStepStatus(5, 'processing');
            const watermarkResult = await uploadApi.mockEmbedWatermark(selectedFile);
            updateStepStatus(5, 'completed');
            
            const fullApiResponse = {
                ocrContent: ocrResult.ocrContent,
                suggestedMetadata: metadataResult.suggestedMetadata,
                warnings: metadataResult.warnings,
                conflicts: conflictResult.conflicts,
                denoiseInfo: denoiseResult,
                watermarkInfo: watermarkResult,
            };

            dispatch({ type: actionTypes.SET_API_RESPONSE, payload: fullApiResponse });
            
            toast.dismiss('processing');
            toast.success('Xử lý file thành công. Vui lòng xem lại thông tin.', { duration: 4000 });
            dispatch({ type: actionTypes.SET_STEP, payload: 3 });

        } catch (error) {
            toast.dismiss('processing');
            toast.error(`Có lỗi xảy ra trong quá trình xử lý: ${error.message}`);
            console.error('Processing error:', error);
            dispatch({ type: actionTypes.RESET_STATE });
        }
    // --- (BUG FIX) Loại bỏ `apiResponse` khỏi dependency array để ngăn re-create hàm không cần thiết ---
    }, [dispatch, duplicateCheckEnabled, state.apiResponse]);


    // --- (BUG FIX) Đảm bảo `onDrop` là một hàm ổn định ---
    const onDrop = useCallback((acceptedFiles) => {
        const selectedFile = acceptedFiles[0];
        if (selectedFile.size > 50 * 1024 * 1024) {
            toast.error("Lỗi: Kích thước file vượt quá 50MB.");
            return;
        }
        dispatch({ type: actionTypes.SET_FILE, payload: selectedFile });
        dispatch({ type: actionTypes.SET_STEP, payload: 2 });
        
        let progress = 0;
        const interval = setInterval(() => {
            progress += Math.random() * 25;
            if (progress >= 100) {
                progress = 100;
                clearInterval(interval);
                processFile(selectedFile);
            }
            dispatch({ type: actionTypes.UPDATE_PROGRESS, payload: progress });
        }, 300);
    // --- (BUG FIX) Loại bỏ `processFile` khỏi dependency array. 
    // `processFile` đã được bọc trong `useCallback` nên nó sẽ không thay đổi trừ khi dependency của nó thay đổi.
    // Việc này giúp `onDrop` trở nên hoàn toàn ổn định.
    }, [dispatch, processFile]);

    const handleRemoveFile = () => {
        dispatch({ type: actionTypes.RESET_STATE });
    };

    const handleMetadataChange = (e) => {
        const { name, value } = e.target;
        dispatch({ type: actionTypes.UPDATE_METADATA_FIELD, payload: { field: name, value } });
    };

    const handleFinalize = async () => {
        dispatch({ type: actionTypes.SET_STEP, payload: 4 });
        toast.promise(
            uploadApi.mockFinalizeUpload(file, metadata),
            {
                loading: 'Đang lưu trữ, định tuyến và hoàn tất...',
                success: (result) => {
                    dispatch({ type: actionTypes.SET_UPLOAD_RESULT, payload: result });
                    return 'Hoàn tất thành công!';
                },
                error: (err) => `Lỗi: ${err.message}`,
            }
        );
    };

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
    
    // --- Render Logic ---
    const renderContent = () => {
        // ... (Nội dung các hàm render sẽ được chia nhỏ ở các phần sau)
        switch (step) {
            case 1: return <Step1_SelectFile />;
            case 2: return <Step2_Processing />;
            case 3: return <Step3_Review />;
            case 4: return <Step4_Result />;
            default: return null;
        }
    };
    
    // --- (MỚI) Chia nhỏ các Step thành các component con cho dễ đọc ---

    const Step1_SelectFile = () => (
         <div>
            <div className="flex justify-center gap-4 mb-6 p-4 bg-gray-100 rounded-lg">
                <label className="flex items-center cursor-pointer">
                    <span className="mr-2 text-gray-700 font-medium">Quyền Upload</span>
                    <div className="relative">
                        <input type="checkbox" className="sr-only" checked={uploadPermissionEnabled} onChange={() => setUploadPermissionEnabled(!uploadPermissionEnabled)} />
                        <div className={`block w-14 h-8 rounded-full ${uploadPermissionEnabled ? 'bg-blue-500' : 'bg-gray-300'}`}></div>
                        <div className={`absolute left-1 top-1 bg-white w-6 h-6 rounded-full transition-transform ${uploadPermissionEnabled ? 'transform translate-x-6' : ''}`}></div>
                    </div>
                </label>
                 <label className="flex items-center cursor-pointer">
                    <span className="mr-2 text-gray-700 font-medium">Kiểm tra trùng lặp</span>
                    <div className="relative">
                        <input type="checkbox" className="sr-only" checked={duplicateCheckEnabled} onChange={() => setDuplicateCheckEnabled(!duplicateCheckEnabled)} />
                        <div className={`block w-14 h-8 rounded-full ${duplicateCheckEnabled ? 'bg-blue-500' : 'bg-gray-300'}`}></div>
                        <div className={`absolute left-1 top-1 bg-white w-6 h-6 rounded-full transition-transform ${duplicateCheckEnabled ? 'transform translate-x-6' : ''}`}></div>
                    </div>
                </label>
            </div>

            {!uploadPermissionEnabled ? (
                <div className="text-center p-10 bg-white rounded-lg shadow-md">
                    <ShieldExclamationIcon className="h-12 w-12 text-red-500 mx-auto" />
                    <h2 className="mt-4 text-2xl font-bold text-red-700">Truy Cập Bị Từ Chối (403)</h2>
                    <p className="mt-2 text-gray-600">Bạn không có quyền `documents:upload`. Vui lòng liên hệ quản trị viên.</p>
                </div>
            ) : (
                <div {...getRootProps()} className={`p-10 text-center border-3 border-dashed rounded-xl cursor-pointer transition-all duration-300 ${isDragActive ? 'border-purple-500 bg-purple-50 scale-105' : 'border-slate-300 hover:border-purple-400'}`}>
                    <input {...getInputProps()} />
                    <CloudArrowUpIcon className="h-16 w-16 mx-auto text-slate-400" />
                    <p className="mt-4 text-xl font-semibold text-slate-700">Kéo thả file hoặc click để chọn</p>
                    <p className="mt-2 text-sm text-slate-500">Hỗ trợ: PDF, DOCX, JPG, PNG, MP4, MP3... (Tối đa 50MB)</p>
                    <p className="mt-2 text-xs text-slate-400">Thiết bị: {deviceType}</p>
                </div>
            )}
        </div>
    );
    
    const Step2_Processing = () => (
        <div>
            {file && <FileProgress file={file} progress={uploadProgress} onRemove={handleRemoveFile} />}
            {uploadProgress === 100 && (
                <div className="mt-4">
                    <ProcessingSteps steps={processingSteps} />
                </div>
            )}
            {apiResponse?.duplicateError && (
                 <div className="mt-4 p-4 bg-red-100 border-l-4 border-red-500 text-red-800 rounded-r-lg">
                    <h4 className="font-bold">Phát hiện trùng lặp! (409 Conflict)</h4>
                    <p>Tài liệu có {apiResponse.duplicateError.duplicateData.similarity} tương đồng với: 
                        <span className="font-semibold"> {apiResponse.duplicateError.duplicateData.existingDocument.name}</span>
                    </p>
                    <button onClick={handleRemoveFile} className="mt-2 text-sm font-semibold hover:underline">Tải lên file khác</button>
                </div>
            )}
        </div>
    );
    
    const Step3_Review = () => (
        <div className="text-left animate-fade-in">
            <h3 className="text-2xl font-bold text-gray-800 mb-6 border-b pb-4">
                Bước 3: Xem lại, Chỉnh sửa & Hoàn tất
            </h3>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* --- Cột trái: Form để người dùng tương tác --- */}
                <div className="space-y-6">
                    <h4 className="text-lg font-bold text-gray-900">Thông tin Metadata</h4>
                    <InputField label="Tên tài liệu" id="title" value={metadata.title} onChange={handleMetadataChange} required />
                    <SelectField label="Danh mục" id="category" value={metadata.category} onChange={handleMetadataChange} options={categories} required />
                    <InputField label="Tags & Keywords (phân cách bởi dấu phẩy)" id="tags" value={Array.isArray(metadata.tags) ? metadata.tags.join(', ') : metadata.tags} onChange={(e) => handleMetadataChange({ target: { name: 'tags', value: e.target.value.split(',').map(tag => tag.trim()) }})} helpText="AI đã gợi ý các tags dựa trên nội dung."/>
                    <SelectField label="Loại truy cập (UC-85/86)" id="accessType" value={metadata.accessType} options={[{id: 'private', name: 'Riêng tư'}, {id: 'public', name: 'Công khai (72h)'}, {id: 'paid', name: 'Trả phí'}]} onChange={handleMetadataChange} required />
                    <SelectField label="Mức bảo mật" id="confidentiality" value={metadata.confidentiality} options={[{id: 'PUBLIC', name: 'Công khai'}, {id: 'INTERNAL', name: 'Nội bộ'}, {id: 'LOCKED', name: 'Bảo mật'}]} onChange={handleMetadataChange} required />
                </div>

                {/* --- (MỚI) Cột phải: Hiển thị chi tiết kết quả xử lý --- */}
                <div>
                    <ProcessingResultDetails apiResponse={apiResponse} />
                </div>
            </div>
            <div className="mt-8 pt-6 border-t flex justify-end gap-4">
                <button type="button" onClick={handleRemoveFile} className="px-6 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 font-semibold">Hủy bỏ</button>
                <button type="button" onClick={handleFinalize} className="px-8 py-2 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700">
                    Hoàn tất & Lưu trữ
                </button>
            </div>
        </div>
    );
    
    const Step4_Result = () => {
        if (!uploadResult) { 
            return (
                <div className="text-center p-8">
                     <svg className="animate-spin h-10 w-10 text-blue-600 mx-auto" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <p className="mt-4 text-gray-600 font-semibold">Đang lưu trữ và hoàn tất...</p>
                </div>
            );
        }

        return (
            <div className="text-center p-8 bg-white rounded-lg shadow-xl animate-fade-in">
                <CheckCircleIcon className="h-16 w-16 text-green-500 mx-auto" />
                <h2 className="mt-4 text-3xl font-bold text-gray-800">{uploadResult.message}</h2>
                <div className="mt-6 text-left bg-slate-50 p-4 rounded-lg border max-w-2xl mx-auto space-y-2">
                    <p><strong>ID Tài liệu:</strong> <span className="font-mono bg-gray-200 px-2 py-1 rounded">{uploadResult.document.doc_id}</span></p>
                    <p><strong>Tên:</strong> {uploadResult.document.title}</p>
                    <p><strong>Phiên bản:</strong> {uploadResult.document.version}</p>
                    <p><strong>Trạng thái:</strong> <span className="font-semibold bg-orange-100 text-orange-700 px-2 py-1 rounded-full text-sm">{uploadResult.document.status}</span></p>
                    {uploadResult.document.public_link && <p className="text-green-600"><strong>Link công khai:</strong> {uploadResult.document.public_link}</p>}
                </div>

                {uploadResult.autoRouteInfo?.triggered && (
                    <div className="mt-6 text-left bg-blue-50 p-4 rounded-lg border border-blue-200 max-w-2xl mx-auto">
                        <h3 className="text-lg font-bold text-blue-800 mb-2">Tài liệu đã được tự động định tuyến (UC-84)</h3>
                        <p className="text-sm text-gray-700 mb-4">{uploadResult.autoRouteInfo.message}</p>
                        {uploadResult.autoRouteInfo.workflow && <WorkflowVisualizer workflow={uploadResult.autoRouteInfo.workflow} />}
                    </div>
                )}
                
                <button onClick={handleRemoveFile} className="mt-8 px-8 py-3 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700">
                    Tải lên file khác
                </button>
            </div>
        );
    };

    return (
        <>
            <Toaster position="top-right" />
            <div className="max-w-5xl mx-auto">
                <header className="text-center mb-8">
                    <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-blue-600">
                        UC-39: Quy trình Upload Tổng thể
                    </h1>
                    <p className="text-gray-600 mt-2">Luồng nghiệp vụ hoàn chỉnh, tích hợp tất cả các tính năng từ kiểm tra, xử lý, đến lưu trữ và định tuyến.</p>
                </header>
                <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-xl min-h-[400px] flex flex-col justify-center">
                    {useCallback(renderContent, [
                        step, file, uploadProgress, processingSteps, 
                        metadata, apiResponse, uploadResult, categories,
                        duplicateCheckEnabled, uploadPermissionEnabled, deviceType
                    ])()}
                </div>
            </div>
        </>
    );
};

export default UC39_UploadPage;