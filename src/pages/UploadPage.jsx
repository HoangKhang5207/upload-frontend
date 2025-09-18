import React, { useState, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDropzone } from 'react-dropzone';
import { DocumentArrowUpIcon, XCircleIcon, InformationCircleIcon } from '@heroicons/react/24/solid';
import { Toaster, toast } from 'react-hot-toast';

import { mockGetCategories, mockUploadFile } from '../api/mockDmsApi';
import { mockLogin } from '../api/mockAuthApi'; // Dùng để giả lập thông tin user
import InputField from '../components/common/InputField';
import SelectField from '../components/common/SelectField';
import AccessInfo from '../components/dms/upload/AccessInfo'; 

const UploadPage = () => {
    const navigate = useNavigate();
    const [file, setFile] = useState(null);
    const [categories, setCategories] = useState([]);
    const [currentUser, setCurrentUser] = useState(null);
    const [metadata, setMetadata] = useState({
        title: '',
        category: '',
        accessType: 'private',
    });
    const [isUploading, setIsUploading] = useState(false);

    // Giả lập lấy thông tin user và categories khi trang được tải
    useEffect(() => {
        mockLogin().then(data => setCurrentUser(data.user));
        mockGetCategories().then(setCategories);
    }, []);

    const onDrop = useCallback((acceptedFiles) => {
        const selectedFile = acceptedFiles[0];
        if (selectedFile.size > 50 * 1024 * 1024) { // 50MB
            toast.error("Lỗi: Kích thước file vượt quá 50MB.");
            return;
        }
        setFile(Object.assign(selectedFile, {
            preview: URL.createObjectURL(selectedFile)
        }));
        // Tự động điền tên file vào Tên tài liệu
        setMetadata(prev => ({ ...prev, title: selectedFile.name }));
    }, []);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: {
            'application/pdf': ['.pdf'],
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
            'image/jpeg': ['.jpg', '.jpeg'],
            'image/png': ['.png'],
            'image/tiff': ['.tiff'],
            'video/mp4': ['.mp4'],
            'audio/mpeg': ['.mp3'],
            'video/x-msvideo': ['.avi'],
            'audio/wav': ['.wav'],
        },
        maxFiles: 1,
    });
    
    const handleRemoveFile = (e) => {
        e.stopPropagation(); // Ngăn sự kiện click mở lại cửa sổ chọn file
        setFile(null);
        setMetadata(prev => ({ ...prev, title: '' }));
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setMetadata(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!file) {
            toast.error("Vui lòng chọn một file để tải lên.");
            return;
        }

        setIsUploading(true);
        const toastId = toast.loading('Đang tải file lên server...');

        try {
            const result = await mockUploadFile(file, metadata);
            if (result.success) {
                toast.success('Tải lên thành công! Bắt đầu xử lý...', { id: toastId });
                // Chuyển hướng đến trang OCR để xử lý tiếp
                navigate(`/ocr?docId=${result.document.id}`);
            } else {
                toast.error('Tải lên thất bại.', { id: toastId });
            }
        } catch (error) {
            toast.error(`Đã xảy ra lỗi: ${error.message}`, { id: toastId });
        } finally {
            setIsUploading(false);
        }
    };

    return (
        <>
            <Toaster position="top-right" />
            <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
                <header className="text-center mb-8">
                    <h1 className="text-4xl font-bold text-blue-700">UC-39: Tải Lên Tài Liệu</h1>
                    <p className="text-gray-600">Bắt đầu quy trình bằng cách chọn file và cung cấp thông tin cơ bản.</p>
                </header>

                <form onSubmit={handleSubmit}>
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Cột chính: Form upload */}
                        <div className="lg:col-span-2 bg-white p-8 rounded-lg shadow-lg">
                            <h3 className="text-2xl font-bold text-gray-800 mb-6">Thông Tin Tài Liệu</h3>
                            <div className="space-y-6">
                                <InputField 
                                    label="Tên tài liệu"
                                    id="title"
                                    value={metadata.title}
                                    onChange={handleChange}
                                    required={true}
                                />

                                <div {...getRootProps()} className={`border-2 border-dashed rounded-lg p-10 text-center cursor-pointer transition-colors ${isDragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-blue-400'}`}>
                                    <input {...getInputProps()} />
                                    <DocumentArrowUpIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                                    {file ? (
                                        <div className="flex items-center justify-center bg-gray-100 p-2 rounded-md">
                                            <p className="font-semibold text-gray-700">{file.name}</p>
                                            <button type="button" onClick={handleRemoveFile} className="ml-4 text-red-500 hover:text-red-700">
                                                <XCircleIcon className="h-6 w-6"/>
                                            </button>
                                        </div>
                                    ) : (
                                        <p className="text-gray-500">Kéo thả file hoặc click để chọn</p>
                                    )}
                                    <p className="text-xs text-gray-500 mt-2">Hỗ trợ: PDF, DOCX, JPG, PNG, TIFF, MP4, MP3... (Tối đa 50MB)</p>
                                </div>

                                <SelectField
                                    label="Danh mục"
                                    id="category"
                                    value={metadata.category}
                                    onChange={handleChange}
                                    options={categories}
                                    required={true}
                                />
                                
                                <SelectField
                                    label="Loại truy cập"
                                    id="accessType"
                                    value={metadata.accessType}
                                    onChange={handleChange}
                                    options={[
                                        {id: 'private', name: 'Riêng tư'},
                                        {id: 'public', name: 'Công khai (72h)'},
                                        {id: 'paid', name: 'Trả phí'}
                                    ]}
                                    required={true}
                                />
                            </div>
                        </div>

                        {/* Cột phụ: Thông tin quyền và hướng dẫn */}
                        <div className="space-y-8">
                            <AccessInfo user={currentUser} />
                            <div className="bg-blue-50 border-l-4 border-blue-500 text-blue-800 p-4 rounded-r-lg">
                                <div className="flex">
                                    <div className="py-1"><InformationCircleIcon className="h-6 w-6 mr-3"/></div>
                                    <div>
                                        <p className="font-bold">Bước tiếp theo</p>
                                        <p className="text-sm">Sau khi tải lên, tài liệu sẽ được chuyển đến các bước xử lý tự động như OCR, gợi ý siêu dữ liệu và kiểm tra trùng lặp.</p>
                                    </div>
                                </div>
                            </div>
                             <button type="submit" disabled={isUploading} className="w-full bg-blue-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 transition-colors">
                                {isUploading ? 'Đang tải lên...' : 'Tải Lên và Bắt Đầu Xử Lý'}
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </>
    );
};

export default UploadPage;