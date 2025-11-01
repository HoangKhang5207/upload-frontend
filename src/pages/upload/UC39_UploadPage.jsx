import React, { useState, useEffect, useCallback } from 'react';
// import { useDropzone } from 'react-dropzone'; // <-- XÓA DÒNG NÀY
import { App, Upload, Spin, Row, Col, Card, Result, Button, Space, Typography, Switch, Form, Alert, Descriptions, Tag, Divider } from 'antd'; // Thêm Descriptions, Tag, Divider
import {
    UploadOutlined,
    CheckCircleOutlined,
    WarningFilled,
    SecurityScanOutlined,
    ApartmentOutlined
} from '@ant-design/icons';

// --- Context và Actions ---
import { useUpload, actionTypes } from '../../contexts/UploadContext';

// --- Component Imports (ĐÃ ĐƯỢC REFACTOR) ---
import InputField from '../../components/common/InputField';
import SelectField from '../../components/common/SelectField';
import FileProgress from '../../components/dms/upload/FileProgress';
import ProcessingSteps from '../../components/dms/upload/ProcessingSteps';
import WorkflowVisualizer from '../../components/dms/upload/WorkflowVisualizer';
import ProcessingResultDetails from '../../components/dms/upload/ProcessingResultDetails';

// --- Mock API Imports ---
import * as uploadApi from '../../api/mockUploadApi';
import { mockGetCategories } from '../../api/mockDmsApi';

const { Title, Paragraph, Text } = Typography;
const { Dragger } = Upload; // <-- Dùng Dragger của Antd

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
        categories,
    } = state;

    // State cục bộ
    const [duplicateCheckEnabled, setDuplicateCheckEnabled] = useState(true);
    const [uploadPermissionEnabled, setUploadPermissionEnabled] = useState(true);
    const [deviceType, setDeviceType] = useState('desktop');

    // Antd hooks
    const { message, notification } = App.useApp();
    const [form] = Form.useForm();

    // --- Effects ---
    useEffect(() => {
        const initialize = async () => {
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
    
    useEffect(() => {
        form.setFieldsValue({
            ...metadata,
            tags: Array.isArray(metadata.tags) ? metadata.tags.join(', ') : metadata.tags,
        });
    }, [metadata, form]);

    // --- Logic xử lý file (Thay thế toast bằng message/notification) ---
    const processFile = useCallback(async (selectedFile) => {
        // ... (Giữ nguyên toàn bộ logic của hàm processFile)
        const loadingKey = 'processing';
        message.loading({ content: 'Đang xử lý file...', key: loadingKey, duration: 0 });

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
            updateStepStatus(0, 'processing');
            const denoiseResult = await uploadApi.mockDenoiseImage(selectedFile);
            updateStepStatus(0, 'completed');

            updateStepStatus(1, 'processing');
            const ocrResult = await uploadApi.mockOcrProcessing(selectedFile);
            if (!ocrResult.success) throw new Error("OCR processing failed");
            updateStepStatus(1, 'completed');

            updateStepStatus(2, 'processing');
            const duplicateResult = await uploadApi.mockDuplicateCheck(selectedFile, duplicateCheckEnabled);
            if (!duplicateResult.success) {
                updateStepStatus(2, 'error');
                message.destroy(loadingKey);
                notification.error({
                    message: 'Phát hiện trùng lặp!',
                    description: duplicateResult.error,
                    duration: 6,
                    placement: 'topRight'
                });
                dispatch({ type: actionTypes.SET_API_RESPONSE, payload: { ...state.apiResponse, duplicateError: duplicateResult } });
                return;
            }
            updateStepStatus(2, 'completed');

            updateStepStatus(3, 'processing');
            const metadataResult = await uploadApi.mockMetadataSuggestion(ocrResult.ocrContent);
            dispatch({ type: actionTypes.SET_METADATA, payload: metadataResult.suggestedMetadata });
            updateStepStatus(3, 'completed');

            updateStepStatus(4, 'processing');
            const conflictResult = uploadApi.mockDataConflictCheck(metadataResult.suggestedMetadata.key_values);
            updateStepStatus(4, 'completed');

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
            
            message.success({ content: 'Xử lý file thành công. Vui lòng xem lại thông tin.', key: loadingKey, duration: 4 });
            dispatch({ type: actionTypes.SET_STEP, payload: 3 });

        } catch (error) {
            message.error({ content: `Có lỗi xảy ra: ${error.message}`, key: loadingKey, duration: 5 });
            notification.error({
                message: 'Lỗi xử lý file',
                description: error.message,
                placement: 'topRight'
            });
            dispatch({ type: actionTypes.RESET_STATE });
        }
    }, [dispatch, duplicateCheckEnabled, message, notification, state.apiResponse]);

    // --- SỬA LỖI Ở ĐÂY ---
    // 1. Xóa bỏ hook useDropzone
    // const { getRootProps, getInputProps, isDragActive } = useDropzone({ ... });
    
    // 2. Tạo hàm beforeUpload cho Antd
    const handleBeforeUpload = (selectedFile) => {
        if (selectedFile.size > 50 * 1024 * 1024) {
            message.error("Lỗi: Kích thước file vượt quá 50MB.");
            return Upload.LIST_IGNORE; // Ngăn Antd xử lý file
        }
        
        dispatch({ type: actionTypes.SET_FILE, payload: selectedFile });
        dispatch({ type: actionTypes.SET_STEP, payload: 2 });
        
        let progress = 0;
        const interval = setInterval(() => {
            progress += Math.random() * 25;
            if (progress >= 100) {
                progress = 100;
                clearInterval(interval);
                processFile(selectedFile); // Bắt đầu xử lý logic
            }
            dispatch({ type: actionTypes.UPDATE_PROGRESS, payload: progress });
        }, 300);

        return false; // Quan trọng: Ngăn Antd tự động upload
    };
    // --- KẾT THÚC SỬA LỖI ---


    const handleRemoveFile = () => {
        dispatch({ type: actionTypes.RESET_STATE });
    };

    const handleMetadataChange = (e) => {
        const { name, value } = e.target;
        form.setFieldsValue({ [name]: value });
        dispatch({ type: actionTypes.UPDATE_METADATA_FIELD, payload: { field: name, value } });
    };

    const handleFinalize = async () => {
        try {
            const values = await form.validateFields();
            
            dispatch({ type: actionTypes.SET_STEP, payload: 4 });
            const loadingKey = 'finalize';
            message.loading({ content: 'Đang lưu trữ, định tuyến và hoàn tất...', key: loadingKey, duration: 0 });

            const finalMetadata = {
                ...metadata,
                ...values,
                tags: values.tags ? values.tags.split(',').map(tag => tag.trim()) : []
            };

            const result = await uploadApi.mockFinalizeUpload(file, finalMetadata);
            dispatch({ type: actionTypes.SET_UPLOAD_RESULT, payload: result });
            message.success({ content: 'Hoàn tất thành công!', key: loadingKey });
        
        } catch (errInfo) {
            console.log('Validate Failed:', errInfo);
            notification.error({
                message: 'Thông tin không hợp lệ',
                description: 'Vui lòng kiểm tra lại các trường thông tin bắt buộc.'
            });
        }
    };

    
    // --- Render Logic ---
    const Step1_SelectFile = () => (
         <Card>
            <Space direction="vertical" style={{width: '100%'}} size="large">
                <Row gutter={16} justify="center" align="middle">
                    <Col>
                        <Text strong>Quyền Upload</Text>
                        <Switch checked={uploadPermissionEnabled} onChange={setUploadPermissionEnabled} style={{marginLeft: 8}} />
                    </Col>
                    <Col>
                        <Text strong>Kiểm tra trùng lặp</Text>
                        <Switch checked={duplicateCheckEnabled} onChange={setDuplicateCheckEnabled} style={{marginLeft: 8}} />
                    </Col>
                </Row>

                {!uploadPermissionEnabled ? (
                    <Result
                        status="403"
                        title="Truy Cập Bị Từ Chối (403)"
                        subTitle="Bạn không có quyền `documents:upload`. Vui lòng liên hệ quản trị viên."
                    />
                ) : (
                    // --- SỬA LỖI Ở ĐÂY ---
                    <Dragger 
                        // {...getRootProps()} // <-- XÓA DÒNG NÀY
                        beforeUpload={handleBeforeUpload} // <-- THÊM PROP NÀY
                        multiple={false} // <-- THÊM PROP NÀY
                        showUploadList={false} // <-- THÊM PROP NÀY
                        disabled={!uploadPermissionEnabled || step > 1} // <-- Giữ nguyên
                        style={{ 
                            padding: '48px', 
                            backgroundColor: '#fafafa' // <-- Xóa isDragActive
                        }}
                    >
                        <p className="ant-upload-drag-icon">
                            <UploadOutlined />
                        </p>
                        <p className="ant-upload-text">Kéo thả file hoặc click để chọn</p>
                        <p className="ant-upload-hint">
                            Hỗ trợ: PDF, DOCX, JPG, PNG, MP4, MP3... (Tối đa 50MB)
                        </p>
                        <Text type="secondary" style={{fontSize: 12}}>Thiết bị: {deviceType}</Text>
                    </Dragger>
                    // --- KẾT THÚC SỬA LỖI ---
                )}
            </Space>
        </Card>
    );
    
    // (Các hàm Step2, Step3, Step4 không thay đổi, giữ nguyên)
    const Step2_Processing = () => (
        <Card>
            {file && <FileProgress file={file} progress={uploadProgress} onRemove={handleRemoveFile} />}
            {uploadProgress === 100 && (
                <div style={{ marginTop: 24 }}>
                    <ProcessingSteps steps={processingSteps} />
                </div>
            )}
            {apiResponse?.duplicateError && (
                 <Alert
                    message="Phát hiện trùng lặp! (409 Conflict)"
                    description={
                        <Text>
                            Tài liệu có {apiResponse.duplicateError.duplicateData.similarity} tương đồng với: 
                            <Text strong> {apiResponse.duplicateError.duplicateData.existingDocument.name}</Text>
                        </Text>
                    }
                    type="error"
                    showIcon
                    action={
                        <Button size="small" danger onClick={handleRemoveFile}>
                            Tải lên file khác
                        </Button>
                    }
                    style={{ marginTop: 24 }}
                />
            )}
        </Card>
    );
    
    const Step3_Review = () => (
        <Card>
            <Title level={4} style={{marginTop: 0, borderBottom: '1px solid #f0f0f0', paddingBottom: 16}}>
                Bước 3: Xem lại, Chỉnh sửa & Hoàn tất
            </Title>
            <Form form={form} layout="vertical">
                <Row gutter={[24, 24]}>
                    {/* --- Cột trái: Form để người dùng tương tác --- */}
                    <Col xs={24} lg={12}>
                        <Card title="Thông tin Metadata" bordered={false}>
                            <InputField 
                                label="Tên tài liệu" 
                                id="title" 
                                name="title"
                                value={metadata.title} 
                                onChange={handleMetadataChange} 
                                required 
                            />
                            <SelectField 
                                label="Danh mục" 
                                id="category" 
                                name="category"
                                value={metadata.category} 
                                onChange={handleMetadataChange} 
                                options={categories} 
                                required 
                            />
                            <InputField 
                                label="Tags & Keywords (phân cách bởi dấu phẩy)" 
                                id="tags" 
                                name="tags"
                                value={Array.isArray(metadata.tags) ? metadata.tags.join(', ') : metadata.tags} 
                                onChange={handleMetadataChange}
                                helpText="AI đã gợi ý các tags dựa trên nội dung."
                            />
                            <SelectField 
                                label="Loại truy cập (UC-85/86)" 
                                id="accessType" 
                                name="accessType"
                                value={metadata.accessType} 
                                options={[{id: 'private', name: 'Riêng tư'}, {id: 'public', name: 'Công khai (72h)'}, {id: 'paid', name: 'Trả phí'}]} 
                                onChange={handleMetadataChange} 
                                required 
                            />
                            <SelectField 
                                label="Mức bảo mật" 
                                id="confidentiality" 
                                name="confidentiality"
                                value={metadata.confidentiality} 
                                options={[{id: 'PUBLIC', name: 'Công khai'}, {id: 'INTERNAL', name: 'Nội bộ'}, {id: 'LOCKED', name: 'Bảo mật'}]} 
                                onChange={handleMetadataChange} 
                                required 
                            />
                        </Card>
                    </Col>

                    {/* --- Cột phải: Hiển thị chi tiết kết quả xử lý --- */}
                    <Col xs={24} lg={12}>
                        <ProcessingResultDetails apiResponse={apiResponse} />
                    </Col>
                </Row>
                <Divider />
                <Form.Item style={{ textAlign: 'right', marginBottom: 0 }}>
                    <Space>
                        <Button onClick={handleRemoveFile}>
                            Hủy bỏ
                        </Button>
                        <Button type="primary" size="large" onClick={handleFinalize}>
                            Hoàn tất & Lưu trữ
                        </Button>
                    </Space>
                </Form.Item>
            </Form>
        </Card>
    );
    
    const Step4_Result = () => {
        if (!uploadResult) { 
            return (
                <Card style={{ textAlign: 'center' }}>
                    <Spin tip="Đang lưu trữ và hoàn tất..." size="large" />
                </Card>
            );
        }

        return (
            <Result
                status="success"
                title="Hoàn tất!"
                subTitle={uploadResult.message}
                extra={[
                    <Button type="primary" key="upload" onClick={handleRemoveFile}>
                        Tải lên file khác
                    </Button>
                ]}
            >
                <div style={{ maxWidth: 600, margin: '0 auto', textAlign: 'left' }}>
                    <Descriptions bordered column={1} size="small">
                        <Descriptions.Item label="ID Tài liệu">
                            <Text code>{uploadResult.document.doc_id}</Text>
                        </Descriptions.Item>
                        <Descriptions.Item label="Tên">{uploadResult.document.title}</Descriptions.Item>
                        <Descriptions.Item label="Phiên bản">{uploadResult.document.version}</Descriptions.Item>
                        <Descriptions.Item label="Trạng thái">
                            <Tag color="processing">{uploadResult.document.status}</Tag>
                        </Descriptions.Item>
                        {uploadResult.document.public_link && (
                            <Descriptions.Item label="Link công khai (UC-86)">
                                <Text copyable ellipsis>{uploadResult.document.public_link}</Text>
                            </Descriptions.Item>
                        )}
                    </Descriptions>

                    {uploadResult.autoRouteInfo?.triggered && (
                        <Card 
                            title="Tài liệu đã được tự động định tuyến (UC-84)" 
                            size="small" 
                            style={{marginTop: 24}}
                            headStyle={{backgroundColor: '#e6f4ff', borderBottom: '1px solid #91caff'}}
                        >
                            <Paragraph>{uploadResult.autoRouteInfo.message}</Paragraph>
                            {uploadResult.autoRouteInfo.workflow && (
                                <WorkflowVisualizer workflow={uploadResult.autoRouteInfo.workflow} />
                            )}
                        </Card>
                    )}
                </div>
            </Result>
        );
    };

    return (
        <div style={{ maxWidth: 1000, margin: '0 auto' }}>
            <div style={{ textAlign: 'center', marginBottom: 40 }}>
                <Title level={2} style={{ fontWeight: 800 }}>
                    <SecurityScanOutlined style={{ color: '#1677ff' }} /> UC-39: Quy trình Upload Tổng thể
                </Title>
                <Paragraph style={{ fontSize: '16px' }} type="secondary">
                    Luồng nghiệp vụ hoàn chỉnh, tích hợp tất cả các tính năng từ kiểm tra, xử lý, đến lưu trữ và định tuyến.
                </Paragraph>
            </div>
            
            {step === 1 && <Step1_SelectFile />}
            {step === 2 && <Step2_Processing />}
            {step === 3 && <Step3_Review />}
            {step === 4 && <Step4_Result />}

        </div>
    );
};

export default UC39_UploadPage;