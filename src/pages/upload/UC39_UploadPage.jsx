import React, { useState, useEffect, useCallback } from 'react';
import { App, Upload, Spin, Row, Col, Card, Result, Button, Space, Typography, Switch, Form, Alert, Descriptions, Tag, Divider, DatePicker, Select, Steps, Timeline, Modal, Input } from 'antd';
import {
    UploadOutlined,
    CheckCircleOutlined,
    SecurityScanOutlined,
    RobotOutlined,
    FileDoneOutlined,
    SendOutlined,
    ClockCircleOutlined,
    UsergroupAddOutlined,
    ScanOutlined, 
    SafetyCertificateOutlined, 
    EyeOutlined,
    FileTextOutlined,
    InfoCircleOutlined,
    FolderOpenOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';

// --- Context và Actions ---
import { useUpload, actionTypes } from '../../contexts/UploadContext';

// --- Component Imports (ĐÃ ĐƯỢC REFACTOR) ---
// import InputField from '../../components/common/InputField';
// import SelectField from '../../components/common/SelectField';
import FileProgress from '../../components/dms/upload/FileProgress';
import ProcessingSteps from '../../components/dms/upload/ProcessingSteps';
import ProcessingResultDetails from '../../components/dms/upload/ProcessingResultDetails';
import OcrPagedViewer from '../../components/dms/upload/OcrPagedViewer';
import AutoRouteVisualization from '../../components/dms/upload/AutoRouteVisualization';

console.log("DEBUG IMPORT CHECK:");
// console.log("InputField:", InputField);
// console.log("SelectField:", SelectField);
console.log("OcrPagedViewer:", OcrPagedViewer);
console.log("AutoRouteVisualization:", AutoRouteVisualization);
console.log("ProcessingResultDetails:", ProcessingResultDetails);

// --- Mock API Imports ---
import { mockGetCategories } from '../../api/mockDmsApi';
// Thêm import API thực tế
import * as uploadApi from '../../api/uploadApi';
import * as mockUploadApi from '../../api/mockUploadApi';

const { Title, Paragraph, Text } = Typography;
const { Dragger } = Upload; // <-- Dùng Dragger của Antd
const { Option } = Select;
const { TextArea } = Input;

// Mock Data cho Người nhận (Recipients) - Vì chưa có API User List đầy đủ
// const MOCK_USERS = [
//     { id: 101, name: 'Nguyễn Văn A (Trưởng phòng)', department: 'Hành chính' },
//     { id: 102, name: 'Trần Thị B (Chuyên viên)', department: 'Nhân sự' },
//     { id: 103, name: 'Lê Văn C (Giám đốc)', department: 'Ban Giám Đốc' },
//     { id: 104, name: 'Phạm Thị D (Kế toán trưởng)', department: 'Tài chính' },
// ];

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

    // State mới cho các yêu cầu bổ sung
    const [recipientUsers, setRecipientUsers] = useState([]); // List user thật từ API
    const [isOcrModalVisible, setIsOcrModalVisible] = useState(false); // Modal confirm OCR
    const [ocrPages, setOcrPages] = useState([]); // Lưu nội dung OCR theo trang

    // Antd hooks
    const [showExpiryDate, setShowExpiryDate] = useState(false);
    const { message, notification } = App.useApp();
    const [form] = Form.useForm();

    // --- Effects ---
    useEffect(() => {
        const initialize = async () => {
            // Chỉ load nếu chưa có category
            try {
                // Load Categories
                if (categories.length === 0) {
                    const realCategories = await uploadApi.getCategories();
                    const formattedCategories = realCategories.map(cat => ({ id: cat.id, name: cat.name }));
                    dispatch({ 
                        type: actionTypes.SET_INITIAL_DATA, 
                        payload: { categories: formattedCategories, permissions: { canUpload: true } } 
                    });
                }
                
                // Load Users theo Department (ABAC) - Yêu cầu số 3
                const users = await uploadApi.fetchUsersByDepartment();
                console.log("Fetched recipient users:", users);
                setRecipientUsers(users);

            } catch (error) {
                message.error("Lỗi khởi tạo dữ liệu: " + error.message);
            }
        };
        initialize();

        const userAgent = navigator.userAgent;
        if (/mobile/i.test(userAgent)) setDeviceType('mobile');
        else if (/tablet/i.test(userAgent)) setDeviceType('tablet');
        else setDeviceType('desktop');

    }, [dispatch, categories.length, message]);
    
    // Sync Metadata to Form & Handle Conditional Logic
    useEffect(() => {
        // Logic mapping: Nếu description trống, lấy từ summary của AI
        const descriptionValue = metadata.description || metadata.summary || '';

        form.setFieldsValue({
            ...metadata,
            description: descriptionValue, // <-- Map Summary vào Description
            tags: Array.isArray(metadata.tags) ? metadata.tags.join(', ') : metadata.tags,
            // Convert ISO string date back to dayjs object for Antd DatePicker if needed
            expiryDate: metadata.expiryDate ? dayjs(metadata.expiryDate) : null
        });
        
        // Check conditions to show fields immediately
        checkConditionalFields(metadata);
    }, [metadata, form]);

    const checkConditionalFields = (currentMeta) => {
        // UC-39: Ngày hết hạn bắt buộc nếu LOCKED hoặc AccessType=Public (UC-86 expiration)
        const isLocked = currentMeta.confidentiality === 'LOCKED';
        const isPublic = currentMeta.accessType === 'public';
        setShowExpiryDate(isLocked || isPublic);
    };

    // --- Logic xử lý file (Thay thế toast bằng message/notification) ---
    const processFile = useCallback(async (selectedFile, forceOcr = false) => {
        const loadingKey = 'processing';
        message.loading({ content: 'Đang xử lý file (OCR, Check trùng)...', key: loadingKey, duration: 0 });

        const steps = [
            { name: 'Khử nhiễu ảnh (AI)', status: 'pending', description: 'Cải thiện chất lượng ảnh scan' },
            { name: 'OCR & Trích xuất văn bản', status: 'pending', description: 'Trích xuất nội dung từ tài liệu' },
            { name: 'Kiểm tra trùng lặp (CSDL)', status: 'pending', description: 'So sánh với các tài liệu đã có' },
            { name: 'Gợi ý & Trích xuất Key-Values', status: 'pending', description: 'Phân tích và đề xuất thông tin' },
            { name: 'Kiểm tra mâu thuẫn dữ liệu', status: 'pending', description: 'Xác minh tính hợp lệ của metadata' },
            { name: 'Nhúng watermark bảo vệ', status: 'pending', description: 'Bảo vệ bản quyền tài liệu' }
        ];
        dispatch({ type: actionTypes.SET_PROCESSING_STEPS, payload: steps });

        const updateStepStatus = (stepIndex, status) => {
            dispatch({ type: actionTypes.UPDATE_STEP_STATUS, payload: { stepIndex, status } });
        };

        try {
            // Gọi API thực tế để xử lý file
            const result = await uploadApi.processUpload(selectedFile, duplicateCheckEnabled, forceOcr);
            
            // Case 1: PDF Scan Detected (Backend trả về cờ isScannedPdf)
            if (result.data?.isScannedPdf) {
                message.destroy(loadingKey);
                setIsOcrModalVisible(true); // Hiển thị Modal hỏi ý kiến User
                return;
            }

            // Case 2: Duplicate Error
            if (result.status === "409") {
                // Phát hiện trùng lặp
                updateStepStatus(0, 'completed');
                updateStepStatus(1, 'completed');
                updateStepStatus(2, 'error');
                message.destroy(loadingKey);
                notification.error({
                    message: 'Phát hiện trùng lặp!',
                    description: result.message,
                    duration: 6,
                    placement: 'topRight'
                });
                dispatch({ type: actionTypes.SET_API_RESPONSE, payload: { ...state.apiResponse, duplicateError: result } });
                return;
            }
            
            // Case 3: Success
            if (result.status === "200") {
                // Xử lý thành công, cập nhật tất cả các bước
                steps.forEach((_, index) => updateStepStatus(index, 'completed'));
                
                // Tạo đối tượng phản hồi tương tự như mock
                const fullApiResponse = {
                    ocrContent: result.data.ocrContent,
                    total_pages: result.data.total_pages,
                    suggestedMetadata: result.data.suggestedMetadata,
                    warnings: result.data.warnings || [],
                    conflicts: result.data.conflicts || [],
                    denoiseInfo: result.data.denoiseInfo || { denoised: false, message: "Không phải file ảnh, bỏ qua khử nhiễu." },
                    watermarkInfo: result.data.watermarkInfo || { success: true, message: "Sẵn sàng nhúng watermark 'Confidential - INNOTECH' (nếu cần)." }
                };

                // Lưu OCR Pages vào State riêng để hiển thị UI
                setOcrPages(result.data.ocrPages || []);

                dispatch({ type: actionTypes.SET_API_RESPONSE, payload: fullApiResponse });
                
                const suggestedMeta = result.data.suggestedMetadata || {};
                // Đảm bảo summary tồn tại trong object metadata
                const metaWithSummary = {
                    ...suggestedMeta,
                    summary: suggestedMeta.summary || '' // Lưu summary gốc
                };

                // Cập nhật metadata trong state
                dispatch({ type: actionTypes.SET_METADATA, payload: metaWithSummary });
                
                if (suggestedMeta.category) {
                    message.success({ 
                        content: `AI gợi ý: ${suggestedMeta.category_name_suggestion}`, 
                        key: loadingKey, duration: 4 
                    });
                } else {
                    message.success({ content: 'Xử lý hoàn tất', key: loadingKey });
                }

                message.success({ content: 'Xử lý file thành công. Vui lòng xem lại thông tin.', key: loadingKey, duration: 4 });
                dispatch({ type: actionTypes.SET_STEP, payload: 3 });
            } else {
                throw new Error(result.message || "Có lỗi xảy ra trong quá trình xử lý file");
            }

        } catch (error) {
            // Xử lý lỗi
            steps.forEach((_, index) => updateStepStatus(index, 'error'));
            
            message.error({ content: `Có lỗi xảy ra: ${error.message}`, key: loadingKey, duration: 5 });
            notification.error({
                message: 'Lỗi xử lý file',
                description: error.message,
                placement: 'topRight'
            });
            dispatch({ type: actionTypes.RESET_STATE });
        }
    }, [dispatch, duplicateCheckEnabled, message, notification, state.apiResponse]);

    // Handler khi User xác nhận chạy OCR cho PDF Scan
    const handleConfirmOcr = () => {
        setIsOcrModalVisible(false);
        processFile(file, true); // Gọi lại với forceOcr = true
    };

    const handleSkipOcr = () => {
        setIsOcrModalVisible(false);
        // Có thể cho phép tiếp tục mà không có content (chỉ Metadata file) hoặc hủy
        message.warning("Đã bỏ qua OCR. Tài liệu sẽ không thể tìm kiếm nội dung.");
        dispatch({ type: actionTypes.SET_STEP, payload: 3 }); 
    };

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

    // const handleMetadataChange = (e) => {
    //     const { name, value } = e.target;
    //     form.setFieldsValue({ [name]: value });
    //     dispatch({ type: actionTypes.UPDATE_METADATA_FIELD, payload: { field: name, value } });
    // };

    const handleFormValuesChange = (changedValues, allValues) => {
        // Update state
        dispatch({ type: actionTypes.SET_METADATA, payload: { ...metadata, ...allValues } });
        
        // Logic hiển thị trường dynamic
        if ('confidentiality' in changedValues || 'accessType' in changedValues) {
            const conf = changedValues.confidentiality || allValues.confidentiality;
            const access = changedValues.accessType || allValues.accessType;
            setShowExpiryDate(conf === 'LOCKED' || access === 'public');
        }
    };

    const handleFinalize = async () => {
        try {
            const values = await form.validateFields();
            
            dispatch({ type: actionTypes.SET_STEP, payload: 4 });
            const loadingKey = 'finalize';
            message.loading({ content: 'Đang lưu trữ, nhúng watermark và kích hoạt Định tuyến...', key: loadingKey, duration: 0 });

            const finalMetadata = {
                ...metadata,
                ...values,
                tags: values.tags ? values.tags.split(',').map(tag => tag.trim()) : [],
                expiryDate: values.expiryDate ? values.expiryDate.toISOString() : null,
                // Thêm các trường dữ liệu từ bước xử lý trước
                ocrContent: apiResponse?.ocrContent || '',
                total_pages: apiResponse?.total_pages || 1,
                key_values: apiResponse?.suggestedMetadata?.key_values || {},
                summary: apiResponse?.suggestedMetadata?.summary || '',
                // Sử dụng giá trị mặc định cho các trường bắt buộc
                category: values.category || metadata.category || 1,
                accessType: values.accessType || metadata.accessType || 'public',
                confidentiality: values.confidentiality || metadata.confidentiality || 'PUBLIC'
            };

            // Sử dụng API thực tế thay vì mock
            const result = await uploadApi.finalizeUpload(file, finalMetadata);
            dispatch({ type: actionTypes.SET_UPLOAD_RESULT, payload: result });
            message.success({ content: 'Tải lên và xử lý hoàn tất!', key: loadingKey });
        
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
         <Card title="Bước 1: Chọn tài liệu" bordered={false} style={{boxShadow: '0 2px 8px rgba(0,0,0,0.1)'}}>
            <Space direction="vertical" style={{width: '100%'}} size="large">
                <Row gutter={16} justify="center" align="middle">
                    <Col>
                        <Text strong>Quyền Upload</Text>
                        <Switch checked={uploadPermissionEnabled} onChange={setUploadPermissionEnabled} style={{marginLeft: 8}} checkedChildren="Có quyền" unCheckedChildren="Không" />
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
                        beforeUpload={handleBeforeUpload} // <-- THÊM PROP NÀY
                        multiple={false} // <-- THÊM PROP NÀY
                        showUploadList={false} // <-- THÊM PROP NÀY
                        disabled={!uploadPermissionEnabled || step > 1} // <-- Giữ nguyên
                        style={{ padding: '40px', background: '#f5faff', borderColor: '#1677ff' }}
                    >
                        <p className="ant-upload-drag-icon"><UploadOutlined style={{color: '#1677ff'}} /></p>
                        <p className="ant-upload-text">Kéo thả file hoặc nhấn để chọn</p>
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
        <Card title="Bước 2: Xử lý AI & Nghiệp vụ" bordered={false}>
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
                        <div>
                            <Text>Hệ thống phát hiện tài liệu tương đồng <b>{apiResponse.duplicateError.duplicateData.similarity}</b>.</Text>
                            <br/>
                            <Text type="secondary">Tài liệu gốc: {apiResponse.duplicateError.duplicateData.existingDocument.name}</Text>
                        </div>
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
            <Form form={form} layout="vertical" onValuesChange={(changed, all) => dispatch({type: actionTypes.SET_METADATA, payload: {...metadata, ...all}})}>
                <Row gutter={24}>
                    {/* --- Cột trái: Form để người dùng tương tác --- */}
                    <Col xs={24} lg={13}>
                        <Card type="inner" title="Thông tin Metadata (AI Gợi ý)">
                            <Form.Item label="Tên tài liệu" name="title" rules={[{required: true, message: 'Vui lòng nhập tên tài liệu'}]}>
                                <Input prefix={<FileTextOutlined />} placeholder="Nhập tên tài liệu"/>
                            </Form.Item>
                            
                            <Form.Item 
                                label="Danh mục (Auto-Route)" 
                                name="category" 
                                rules={[{required: true, message: 'Vui lòng chọn danh mục'}]}
                                help={metadata.category ? <Text type="success">AI đã chọn danh mục này dựa trên nội dung.</Text> : "Chọn danh mục để kích hoạt quy trình."}
                            >
                                <Select placeholder="Chọn danh mục" optionFilterProp="children" showSearch>
                                    {categories.map(c => <Option key={c.id} value={c.id}>{c.name}</Option>)}
                                </Select>
                            </Form.Item>
                            
                            <Form.Item label="Tags" name="tags">
                                <Input prefix={<RobotOutlined />} placeholder="tag1, tag2..." />
                            </Form.Item>

                            <Row gutter={16}>
                                <Col span={12}>
                                    <Form.Item label="Loại truy cập" name="accessType" initialValue="private">
                                        <Select>
                                            <Option value="private">Riêng tư</Option>
                                            <Option value="public">Công khai (Link)</Option>
                                            <Option value="paid">Trả phí (Paid)</Option>
                                        </Select>
                                    </Form.Item>
                                </Col>
                                <Col span={12}>
                                    <Form.Item label="Độ bảo mật" name="confidentiality" initialValue="INTERNAL">
                                        <Select>
                                            <Option value="PUBLIC">PUBLIC (Logo Watermark)</Option>
                                            <Option value="INTERNAL">INTERNAL (Text Watermark)</Option>
                                            <Option value="LOCKED">LOCKED (Hạn chế)</Option>
                                        </Select>
                                    </Form.Item>
                                </Col>
                            </Row>

                            {/* Trường có điều kiện: Expiry Date */}
                            {showExpiryDate && (
                                <Form.Item 
                                    label="Ngày hết hạn (Bắt buộc cho LOCKED/Public)" 
                                    name="expiryDate" 
                                    rules={[{ required: true, message: 'Vui lòng chọn ngày hết hạn' }]}
                                    style={{ background: '#fff1f0', padding: 10, borderRadius: 6 }}
                                >
                                    <DatePicker style={{ width: '100%' }} showTime placeholder="Chọn ngày giờ hết hạn" />
                                </Form.Item>
                            )}

                            {/* Trường: Người nhận (Auto-route/Notify) */}
                            <Form.Item 
                                label={<span><UsergroupAddOutlined /> Người nhận</span>} 
                                name="recipients"
                            >
                                <Select
                                    mode="multiple"
                                    placeholder="Chọn người nhận trong phòng ban hoặc quản lý"
                                    style={{ width: '100%' }}
                                    optionLabelProp="label"
                                >
                                    {recipientUsers.map(u => (
                                        <Option key={u.id} value={u.id} label={u.name}>
                                            <div style={{display: 'flex', justifyContent: 'space-between'}}>
                                                <span>{u.name} <Text type="secondary" style={{fontSize: 11}}>({u.email})</Text></span>
                                                <Tag color={u.role === 'Manager' ? 'gold' : 'blue'}>{u.department}</Tag>
                                            </div>
                                        </Option>
                                    ))}
                                </Select>
                            </Form.Item>

                            <Form.Item label="Mô tả / Tóm tắt" name="description" help="Nội dung được AI tóm tắt tự động (nếu có).">
                                <TextArea rows={3} />
                            </Form.Item>
                        </Card>
                    </Col>

                    {/* --- Cột phải: Hiển thị chi tiết kết quả xử lý --- */}
                    <Col xs={24} lg={11}>
                        <Space direction="vertical" style={{width: '100%'}} size="middle">
                            {/* 1. OCR Viewer (Quan trọng nhất - Để trên cùng) */}
                            <Card 
                                title={<span><ScanOutlined /> Nội dung trích xuất</span>}
                                size="small"
                                bodyStyle={{ padding: 0 }}
                                extra={<Tag color="blue">{ocrPages.length} trang</Tag>}
                            >
                                <OcrPagedViewer pages={ocrPages} />
                            </Card>

                            {/* 2. Kết quả phân tích (Warnings, Conflicts...) */}
                            <ProcessingResultDetails apiResponse={apiResponse} />
                        
                            <div style={{ marginTop: 16, textAlign: 'center' }}>
                                <Alert 
                                    message="Lưu ý về Auto-Route"
                                    description="Sau khi nhấn 'Hoàn tất', hệ thống sẽ tự động quét Danh mục và Tags để kích hoạt quy trình BPMN phù hợp."
                                    type="info" 
                                    showIcon 
                                />
                            </div>
                        </Space>
                    </Col>
                </Row>
                <Divider />
                <Row justify="end">
                    <Space>
                        <Button onClick={handleRemoveFile}>Hủy bỏ</Button>
                        <Button type="primary" size="large" icon={<FileDoneOutlined />} onClick={handleFinalize}>
                            Hoàn tất & Kích hoạt Auto-Route
                        </Button>
                    </Space>
                </Row>
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

        const { document, autoRouteInfo } = uploadResult;

        // Xác định loại watermark dựa trên confidentiality
        const watermarkType = metadata.confidentiality === 'PUBLIC' ? 'Logo INNOTECH' : 'Text "Confidential"';
        const watermarkColor = metadata.confidentiality === 'PUBLIC' ? 'green' : 'red';

        return (
            <Result
                status="success"
                title="Upload và Xử lý Hoàn tất!"
                subTitle={`Document ID: ${document.doc_id} | Version: ${document.version}`}
                extra={[
                    <Button type="primary" key="new" onClick={handleRemoveFile}>Upload File Khác</Button>,
                    <Button key="view">Xem Chi tiết Tài liệu</Button>
                ]}
            >
                <div style={{ maxWidth: 800, margin: '0 auto', textAlign: 'left' }}>
                    {/* Thông tin cơ bản */}
                    <Descriptions title="Thông tin tài liệu" bordered size="small" column={2}>
                        <Descriptions.Item label="Tiêu đề">{document.title}</Descriptions.Item>
                        <Descriptions.Item label="Trạng thái">
                            <Tag color={document.status === 'PROCESSING_WORKFLOW' ? 'processing' : 'default'}>
                                {document.status}
                            </Tag>
                        </Descriptions.Item>
                        {document.public_link && (
                            <Descriptions.Item label="Public Link" span={2}>
                                <Typography.Link href={document.public_link} target="_blank" copyable>
                                    {document.public_link}
                                </Typography.Link> <Tag color="orange">Hết hạn sau 72h</Tag>
                            </Descriptions.Item>
                        )}
                        <Descriptions.Item label="Trạng thái Watermark">
                            <Space>
                                <SafetyCertificateOutlined style={{ color: watermarkColor }} />
                                <Text strong>{watermarkType}</Text>
                                <Tag color="success">Đã nhúng</Tag>
                            </Space>
                        </Descriptions.Item>
                        <Descriptions.Item label="Xem trước">
                            {/* Link xem file đã nhúng watermark */}
                            <Button 
                                type="link" 
                                icon={<EyeOutlined />} 
                                href={`http://localhost:8000${document.file_url}`} 
                                target="_blank"
                            >
                                Mở file (Đã Watermark)
                            </Button>
                        </Descriptions.Item>
                    </Descriptions>

                    {/* Visualizing Auto-Route */}
                    <AutoRouteVisualization 
                        routeInfo={autoRouteInfo} 
                        docInfo={{ category_name: metadata.categoryName, tags_json: metadata.tags }} 
                    />
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

            <Steps 
                current={step - 1} 
                items={[
                    { title: 'Chọn File', icon: <UploadOutlined /> },
                    { title: 'Xử lý AI', icon: <RobotOutlined /> },
                    { title: 'Review & Metadata', icon: <FileDoneOutlined /> },
                    { title: 'Kết quả & Auto-Route', icon: <SendOutlined /> },
                ]}
                style={{ marginBottom: 40 }}
            />
            
            {step === 1 && <Step1_SelectFile />}
            {step === 2 && <Step2_Processing />}
            {step === 3 && <Step3_Review />}
            {step === 4 && <Step4_Result />}

            {/* Modal Xác nhận OCR (UC-87) */}
            <Modal
                title="Phát hiện tài liệu dạng Scan"
                open={isOcrModalVisible}
                onOk={handleConfirmOcr}
                onCancel={handleSkipOcr}
                okText="Chạy OCR (Trích xuất văn bản)"
                cancelText="Bỏ qua (Chỉ lưu file)"
            >
                <p>File PDF này chỉ chứa hình ảnh (không có lớp văn bản). Bạn có muốn hệ thống chạy OCR để trích xuất nội dung phục vụ tìm kiếm không?</p>
                <Alert message="Lưu ý: Quá trình OCR có thể mất thêm vài giây." type="info" showIcon />
            </Modal>

        </div>
    );
};

export default UC39_UploadPage;