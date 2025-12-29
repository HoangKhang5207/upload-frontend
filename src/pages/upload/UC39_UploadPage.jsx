import React, { useState, useEffect, useCallback } from 'react';
import { App, Upload, Spin, Row, Col, Card, Result, Button, Space, Typography, Switch, Form, Alert, Descriptions, Tag, Divider, DatePicker, Select, Steps, Timeline, Modal, Input, Tabs, Empty, List, Collapse, Radio, Checkbox } from 'antd';
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
    LoadingOutlined,
    SettingOutlined,
    InfoCircleOutlined,
    FolderOpenOutlined,
    WarningOutlined, BugOutlined,
    CloseCircleOutlined,
    ExperimentOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';

// --- Context và Actions ---
import { useUpload, actionTypes } from '../../contexts/UploadContext';

// --- Component Imports (ĐÃ ĐƯỢC REFACTOR) ---
import FileProgress from '../../components/dms/upload/FileProgress';
import ProcessingSteps from '../../components/dms/upload/ProcessingSteps';
import ProcessingResultDetails from '../../components/dms/upload/ProcessingResultDetails';
import OcrPagedViewer from '../../components/dms/upload/OcrPagedViewer';
import AutoRouteVisualization from '../../components/dms/upload/AutoRouteVisualization';
import DuplicateAnalysis from '../../components/dms/upload/DuplicateAnalysis';
import AdvancedSettingsPanel from '../../components/dms/upload/AdvancedSettingsPanel';
import DenoiseViewer from '../../components/dms/upload/DenoiseViewer';

// Thêm import API thực tế
import * as uploadApi from '../../api/uploadApi';
import UserInfoPanel from '../../components/dms/upload/UserInfoPanel';

const { Title, Paragraph, Text } = Typography;
const { Dragger } = Upload; // <-- Dùng Dragger của Antd
const { Option } = Select;
const { TextArea } = Input;
const { Panel } = Collapse;

// --- CẤU HÌNH DELAY (UX) ---
const STEP_DELAY_MS = 100000;

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

    // --- FEATURE TOGGLES STATE ---
    const [featureFlags, setFeatureFlags] = useState({
        enableDenoise: true,
        enableOcr: true,
        enableDuplicateCheck: true,
        enableMetadata: true,
        enableWatermark: true, // Mặc định bật Watermark
        ocrEngine: 'tesseract', // 'tesseract' or 'easyocr'
    });

    // State cục bộ
    const [uploadPermissionEnabled, setUploadPermissionEnabled] = useState(true);
    const [deviceType, setDeviceType] = useState('desktop');

    // State mới cho các yêu cầu bổ sung
    const [recipientUsers, setRecipientUsers] = useState([]); // List user thật từ API
    const [isOcrModalVisible, setIsOcrModalVisible] = useState(false); // Modal confirm OCR
    const [ocrPages, setOcrPages] = useState([]); // Lưu nội dung OCR theo trang
    const [showExpiryDate, setShowExpiryDate] = useState(false);
    const [originalFile, setOriginalFile] = useState(null);

    const [selectedCategoryName, setSelectedCategoryName] = useState("");

    // State quản lý mở/đóng Advanced Settings Panel để tránh re-render bị đóng
    const [advancedPanelActiveKey, setAdvancedPanelActiveKey] = useState([]);

    // --- STATE LOADING (Điều khiển hiển thị) ---
    const [isProcessing, setIsProcessing] = useState(false);
    const [processingMessage, setProcessingMessage] = useState("Đang khởi tạo...");

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
                //console.log("Fetched recipient users:", users);
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

        // Cập nhật tên danh mục khi metadata thay đổi (Trường hợp AI gợi ý)
        if (metadata.category && categories.length > 0) {
            const foundCat = categories.find(c => c.id === metadata.category);
            // Ưu tiên lấy tên từ AI suggestion nếu có, không thì lấy từ list
            const name = foundCat ? foundCat.name : (metadata.categoryName || "");
            setSelectedCategoryName(name);
        }

        // Check conditions to show fields immediately
        checkConditionalFields(metadata);
    }, [metadata, form, categories]);

    const checkConditionalFields = (currentMeta) => {
        // UC-39: Ngày hết hạn bắt buộc nếu LOCKED hoặc AccessType=Public (UC-86 expiration)
        const isLocked = currentMeta.confidentiality === 'LOCKED';
        const isPublic = currentMeta.accessType === 'public';
        setShowExpiryDate(isLocked || isPublic);
    };

    // Handler riêng cho việc chọn Category thủ công
    const handleCategoryChange = (value) => {
        const foundCat = categories.find(c => c.id === value);
        const catName = foundCat ? foundCat.name : "";

        setSelectedCategoryName(catName); // Update local state cho visualization

        // Update context
        dispatch({
            type: actionTypes.SET_METADATA,
            payload: { ...metadata, category: value, categoryName: catName }
        });
    };

    // --- UTILS: SLEEP FUNCTION ---
    const wait = (ms) => new Promise(resolve => setTimeout(resolve, ms));

    // --- STREAM PROCESSING LOGIC ---
    const processFile = useCallback(async (selectedFile, forceOcr = false, overrideOptions = {}) => {
        // A. HỢP NHẤT OPTIONS (Merge Feature Flags với lựa chọn từ Modal)
        const currentOptions = { ...featureFlags, ...overrideOptions };

        // B. CẤU HÌNH DANH SÁCH BƯỚC (STEPS CONFIG)
        // Lưu ý: Logic 'enabled' ở đây quyết định bước đó CÓ CHẠY hay không
        // Logic 'visible' (hiển thị trên UI) là luôn luôn hiển thị để user biết quy trình
        const stepsConfig = [
            {
                name: 'Khử nhiễu ảnh',
                key: 'denoise',
                // Chỉ chạy nếu user bật VÀ là file ảnh
                enabled: currentOptions.enableDenoise && selectedFile.type.startsWith('image/')
            },
            {
                name: 'Gắn Watermark',
                key: 'watermark',
                enabled: currentOptions.enableWatermark
            },
            {
                name: `OCR - Trích xuất văn bản`,
                key: 'ocr',
                // Chạy nếu user bật HOẶC bị ép buộc (Force)
                enabled: currentOptions.enableOcr || forceOcr
            },
            {
                name: 'Kiểm tra trùng lặp',
                key: 'duplicate',
                enabled: currentOptions.enableDuplicateCheck
            },
            {
                name: 'Gợi ý Metadata & Kiểm tra mâu thuẫn',
                key: 'metadata',
                enabled: currentOptions.enableMetadata
            },
            {
                name: 'Tổng hợp kết quả',
                key: 'final',
                enabled: true
            }
        ];

        // C. TÍNH TOÁN TIẾN ĐỘ
        const activeSteps = stepsConfig.filter(s => s.enabled);
        const progressPerStep = 100 / activeSteps.length;

        // D. KHỞI TẠO TRẠNG THÁI BAN ĐẦU CHO UI
        // Nếu overrideOptions tắt OCR, ta set trạng thái ban đầu của bước đó là 'skipped' ngay lập tức
        const initialStepsUI = stepsConfig.map(s => ({
            name: s.name,
            key: s.key,
            // Nếu bước bị disable do override (ví dụ Skip OCR), set status là skipped luôn
            status: s.enabled ? 'pending' : 'skipped',
            description: s.enabled ? 'Đang chờ...' : 'Đã bỏ qua theo yêu cầu'
        }));

        // Reset UI về trạng thái bắt đầu chạy
        dispatch({ type: actionTypes.UPDATE_PROGRESS, payload: 0 });
        dispatch({ type: actionTypes.SET_PROCESSING_STEPS, payload: initialStepsUI });

        setIsProcessing(true);
        setProcessingMessage("Đang khởi tạo quy trình xử lý...");

        try {
            // E. GỌI API STREAMING VỚI CALLBACK XỬ LÝ SỰ KIỆN
            const result = await uploadApi.processUploadStream(selectedFile, { ...currentOptions, forceOcr }, async (event) => {
                console.log("Stream Event:", event);

                // Bỏ qua event system/error để xử lý ở block catch/result check
                if (!event.step || event.step === 'system' || event.status === 'error' || event.status === 'warning') return;

                // Tìm index trong danh sách UI để update icon/text
                const uiIndex = stepsConfig.findIndex(s => s.key === event.step);
                // Tìm index trong danh sách Active để tính %
                const activeIndex = activeSteps.findIndex(s => s.key === event.step);

                if (uiIndex === -1) return;

                // --- XỬ LÝ TRẠNG THÁI ---
                // --- GIAI ĐOẠN 1: BẮT ĐẦU XỬ LÝ (Processing) ---
                if (event.status === 'processing') {
                    // 1. Cập nhật Message Top Center
                    setProcessingMessage(event.message || `Đang xử lý: ${stepsConfig[uiIndex].name}...`);

                    // 2. Cập nhật Step Icon -> Loading
                    dispatch({
                        type: actionTypes.UPDATE_STEP_STATUS,
                        payload: { stepIndex: uiIndex, status: 'processing', description: event.message }
                    });

                    // 3. Cập nhật Progress Bar (Nhích nhẹ để user biết đang chạy)
                    // Logic: Progress hiện tại = (Số bước đã xong * %) + (10% của bước đang chạy)
                    if (activeIndex !== -1) {
                        const currentBaseProgress = activeIndex * progressPerStep;
                        dispatch({ type: actionTypes.UPDATE_PROGRESS, payload: Math.round(currentBaseProgress + (progressPerStep * 0.1)) });
                    }

                    // 4. DELAY để user kịp đọc "Đang xử lý..."
                    await wait(STEP_DELAY_MS);
                }

                // --- GIAI ĐOẠN 2: HOÀN THÀNH XỬ LÝ (Completed/Skipped/Success) ---
                else if (['completed', 'skipped', 'success'].includes(event.status)) {
                    // Map status 'success' -> 'completed' cho UI Component hiểu
                    const uiStatus = event.status === 'success' ? 'completed' : event.status;

                    // 1. Cập nhật Message Top Center
                    setProcessingMessage(event.message || `Hoàn tất: ${stepsConfig[uiStatus].name}`);

                    // 2. Cập nhật Step Icon -> Done/Check
                    dispatch({
                        type: actionTypes.UPDATE_STEP_STATUS,
                        payload: { stepIndex: uiIndex, status: uiStatus, description: event.message }
                    });

                    // 3. Cập nhật Progress Bar (Full bước đó)
                    if (activeIndex !== -1) {
                        // Logic: (Index + 1) * % mỗi bước. 
                        // Nếu là bước cuối cùng (final) -> ép về 100%
                        let newPercent = Math.round((activeIndex + 1) * progressPerStep);
                        if (newPercent > 100) newPercent = 100; // Safety cap

                        dispatch({ type: actionTypes.UPDATE_PROGRESS, payload: newPercent });
                    }

                    // 4. DELAY để user kịp nhìn thấy Check xanh và thanh Progress chạy đầy
                    await wait(STEP_DELAY_MS);
                }
            });

            console.log("Final processing result:", result);

            // Xử lý kết quả cuối cùng
            if (result) {
                if (result.status === '200') {
                    // Force Step Cuối cùng thành Completed
                    const finalStepIndex = stepsConfig.findIndex(s => s.key === 'final');
                    if (finalStepIndex !== -1) {
                        dispatch({
                            type: actionTypes.UPDATE_STEP_STATUS,
                            payload: { stepIndex: finalStepIndex, status: 'completed', description: 'Hoàn tất toàn bộ.' }
                        });
                    }

                    //Force Progress 100%
                    dispatch({ type: actionTypes.UPDATE_PROGRESS, payload: 100 });
                    setProcessingMessage("Xử lý thành công! Đang chuyển hướng...");

                    // Delay cuối cùng trước khi chuyển màn hình
                    await wait(8000);

                    const fullData = result.data;

                    setOcrPages(fullData.ocrPages || []);
                    dispatch({ type: actionTypes.SET_API_RESPONSE, payload: fullData });

                    const metaWithSummary = {
                        ...fullData.suggestedMetadata,
                        summary: fullData.suggestedMetadata?.summary || '',
                        categoryName: fullData.suggestedMetadata?.category_name_suggestion
                    };
                    dispatch({ type: actionTypes.SET_METADATA, payload: metaWithSummary });

                    // Thông báo hoàn tất toàn bộ
                    notification.success({
                        message: 'Thành công',
                        description: 'Tài liệu đã được phân tích. Vui lòng kiểm tra lại thông tin.',
                        placement: 'bottomRight',
                        duration: 5
                    });
                    dispatch({ type: actionTypes.SET_STEP, payload: 3 });

                } else if (result.status === 'warning' && result.code === 'SCANNED_PDF') {
                    setIsOcrModalVisible(true);
                } else if (result.status === 'error' && result.code === 'DUPLICATE_FOUND') {
                    notification.warning({ message: 'Cảnh báo trùng lặp', description: result.message });
                    dispatch({ type: actionTypes.SET_API_RESPONSE, payload: { ...apiResponse, duplicateError: result.data } });
                } else {
                    throw new Error(result.message || "Lỗi không xác định");
                }
            }
        } catch (error) {
            console.error(error);
            setProcessingMessage("Xảy ra lỗi!");
            notification.error({ message: 'Lỗi xử lý', description: error.message });
            dispatch({ type: actionTypes.RESET_STATE });
        } finally {
            setIsProcessing(false);
        }
    }, [dispatch, featureFlags, apiResponse, notification]);

    // Handler khi User xác nhận chạy OCR cho PDF Scan
    const handleConfirmOcr = () => {
        setIsOcrModalVisible(false);
        processFile(file, true); // Gọi lại với forceOcr = true
    };

    const handleSkipOcr = () => {
        setIsOcrModalVisible(false);
        // Gọi lại processFile nhưng với overrideOptions tắt OCR
        // Logic mới trong processFile sẽ nhận diện override này và set bước OCR thành 'skipped' ngay từ đầu
        processFile(file, false, { enableOcr: false });
    };

    // Tạo hàm beforeUpload cho Antd. Handler xử lý file (từ Dragger)
    const handleBeforeUpload = (selectedFile) => {
        if (selectedFile.size > 50 * 1024 * 1024) {
            message.error("Lỗi: Kích thước file vượt quá 50MB.");
            return Upload.LIST_IGNORE;
        }

        setOriginalFile(selectedFile);

        dispatch({ type: actionTypes.UPDATE_PROGRESS, payload: 0 });
        dispatch({ type: actionTypes.SET_FILE, payload: selectedFile });
        dispatch({ type: actionTypes.SET_STEP, payload: 2 });

        // Bắt đầu xử lý ngay
        setTimeout(() => processFile(selectedFile), 100);
        return false;
    };

    const handleRemoveFile = () => {
        dispatch({ type: actionTypes.RESET_STATE });
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



    // ... (existing imports, but this replace will handle the user info panel import if I put it at top, but to be safe I will just use the panel in the component)

    const Step1_SelectFile = () => (
        <Card title="Bước 1: Chọn tài liệu" bordered={false} style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
            <Row gutter={24}>
                {/* Cột Trái: Upload & Cấu hình */}
                <Col xs={24} lg={16}>
                    <Space direction="vertical" style={{ width: '100%' }} size="middle">
                        {/* Feature Toggles UI */}
                        <AdvancedSettingsPanel
                            featureFlags={featureFlags}
                            setFeatureFlags={setFeatureFlags}
                            activeKey={advancedPanelActiveKey}
                            onChange={setAdvancedPanelActiveKey}
                        />

                        <Row justify="center">
                            <Col>
                                <Text strong>Quyền Upload (Giả lập)</Text>
                                <Switch checked={uploadPermissionEnabled} onChange={setUploadPermissionEnabled} style={{ marginLeft: 8 }} checkedChildren="Có quyền" unCheckedChildren="Không" />
                            </Col>
                        </Row>

                        {!uploadPermissionEnabled ? (
                            <Result
                                status="403"
                                title="Truy Cập Bị Từ Chối (403)"
                                subTitle="Bạn không có quyền `documents:upload`. Vui lòng liên hệ quản trị viên."
                            />
                        ) : (
                            <Dragger
                                // beforeUpload={handleBeforeUpload}
                                customRequest={({ file }) => setTimeout(() => handleBeforeUpload(file), 0)}
                                multiple={false}
                                showUploadList={false}
                                disabled={!uploadPermissionEnabled || step > 1}
                                style={{ padding: '40px', background: '#f5faff', borderColor: '#1677ff' }}
                            >
                                <p className="ant-upload-drag-icon"><UploadOutlined style={{ color: '#1677ff' }} /></p>
                                <p className="ant-upload-text">Kéo thả file hoặc nhấn để chọn</p>
                                <p className="ant-upload-hint">
                                    Hỗ trợ: PDF, DOCX, JPG, PNG, MP4, MP3... (Tối đa 50MB)
                                </p>
                                <Text type="secondary" style={{ fontSize: 12 }}>Thiết bị: {deviceType}</Text>
                            </Dragger>
                        )}
                    </Space>
                </Col>

                {/* Cột Phải: Thông tin người dùng */}
                <Col xs={24} lg={8}>
                    <UserInfoPanel />
                </Col>
            </Row>
        </Card>
    );

    const Step2_Processing = () => (
        <Card title="Bước 2: Đang xử lý tài liệu..." bordered={false}
            style={{ position: 'relative' }}>
            <div style={{
                height: '40px',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                marginBottom: '16px',
                opacity: isProcessing ? 1 : 0, // Fade effect
                transition: 'opacity 0.3s ease',
                visibility: isProcessing ? 'visible' : 'hidden'
            }}>
                <Space style={{
                    background: '#e6f7ff',
                    padding: '8px 24px',
                    borderRadius: '20px',
                    border: '1px solid #91d5ff',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                }}>
                    <LoadingOutlined style={{ fontSize: 20, color: '#1890ff' }} spin />
                    <Text strong style={{ color: '#1890ff' }}>{processingMessage}</Text>
                </Space>
            </div>

            <div style={{ padding: '0 24px' }}>
                <FileProgress
                    file={file}
                    progress={uploadProgress}
                    onRemove={() => dispatch({ type: actionTypes.RESET_STATE })}
                />
            </div>

            <div style={{ marginTop: 24 }}>
                <ProcessingSteps steps={processingSteps} />
            </div>

            {apiResponse?.duplicateError && (
                <div style={{ marginTop: 24 }}>
                    <DuplicateAnalysis duplicateError={apiResponse.duplicateError} />
                    <Button danger block onClick={() => dispatch({ type: actionTypes.RESET_STATE })} style={{ marginTop: 16 }}>Hủy bỏ & Chọn lại</Button>
                </div>
            )}
        </Card>
    );

    const Step3_Review = () => (
        <Card>
            <Title level={4} style={{ marginTop: 0, borderBottom: '1px solid #f0f0f0', paddingBottom: 16 }}>
                Bước 3: Xem lại, Chỉnh sửa & Hoàn tất
            </Title>
            <Form form={form} layout="vertical" onValuesChange={(changed, all) => dispatch({ type: actionTypes.SET_METADATA, payload: { ...metadata, ...all } })}>
                <Row gutter={24}>
                    {/* --- Cột trái: Form để người dùng tương tác --- */}
                    <Col xs={24} lg={13}>
                        <Card type="inner" title="Thông tin Metadata (AI Gợi ý)">
                            <Form.Item label="Tên tài liệu" name="title" rules={[{ required: true, message: 'Vui lòng nhập tên tài liệu' }]}>
                                <Input prefix={<FileTextOutlined />} placeholder="Nhập tên tài liệu" />
                            </Form.Item>

                            <Form.Item
                                label="Danh mục (Auto-Route)"
                                name="category"
                                rules={[{ required: true, message: 'Vui lòng chọn danh mục' }]}
                                help={metadata.category ? <Text type="success">AI đã chọn danh mục này dựa trên nội dung.</Text> : "Chọn danh mục để kích hoạt quy trình."}
                            >
                                <Select
                                    placeholder="Chọn danh mục"
                                    optionFilterProp="children"
                                    showSearch
                                    allowClear
                                    onChange={handleCategoryChange} // Gắn handler custom
                                >
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
                                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                                <span>{u.name} <Text type="secondary" style={{ fontSize: 11 }}>({u.email})</Text></span>
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
                        <Tabs defaultActiveKey="preview" type="card">
                            <Tabs.TabPane tab={<span><EyeOutlined /> Xem trước (Watermarked)</span>} key="preview">
                                <Card
                                    size="small"
                                    bodyStyle={{ padding: 0, height: '500px' }}
                                >
                                    {apiResponse?.previewUrl ? (
                                        <iframe
                                            src={`http://localhost:8000/file/preview-temp/${apiResponse.previewUrl.split('/').pop()}`}
                                            style={{ width: '100%', height: '100%', border: 'none' }}
                                            title="Watermark Preview"
                                        />
                                    ) : (
                                        <div style={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#8c8c8c' }}>
                                            <CloseCircleOutlined style={{ fontSize: 32, marginBottom: 8 }} />
                                            <p>Không có bản xem trước</p>
                                        </div>
                                    )}
                                </Card>
                            </Tabs.TabPane>

                            {/* THÊM TAB MỚI: KHỬ NHIỄU Ảnh/PDF Scan */}
                            <Tabs.TabPane
                                tab={<span><ExperimentOutlined /> Khử nhiễu Ảnh/PDF Scan</span>}
                                key="denoise"
                            >
                                <Card size="small" bordered={false} bodyStyle={{ padding: '0 12px' }}>
                                    <DenoiseViewer
                                        denoiseInfo={apiResponse?.denoiseInfo}
                                        originalFile={originalFile}
                                    />
                                </Card>
                            </Tabs.TabPane>

                            <Tabs.TabPane tab={<span><ScanOutlined /> Nội dung OCR ({ocrPages.length} trang)</span>} key="ocr">
                                <Card
                                    size="small"
                                    bodyStyle={{ padding: 0 }}
                                    bordered={false}
                                >
                                    <OcrPagedViewer pages={ocrPages} />
                                </Card>
                            </Tabs.TabPane>

                            <Tabs.TabPane tab={<span><InfoCircleOutlined /> Kết quả phân tích</span>} key="analysis">
                                <ProcessingResultDetails apiResponse={apiResponse} />
                            </Tabs.TabPane>
                        </Tabs>

                        <div style={{ marginTop: 16, textAlign: 'center' }}>
                            <Alert
                                message="Lưu ý về Auto-Route"
                                description="Sau khi nhấn 'Hoàn tất', hệ thống sẽ tự động quét Danh mục và Tags để kích hoạt quy trình BPMN phù hợp."
                                type="info"
                                showIcon
                            />
                        </div>
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
                            <Descriptions.Item label="Liên kết công khai" span={2}>
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
                                href={`http://localhost:8000/file/preview-temp/${document.file_url.split('/').pop()}`}
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
                    { title: 'Cấu hình & File', icon: <UploadOutlined /> },
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
                cancelText="Bỏ qua (Lưu không text)"
                closable={false} // Bắt buộc chọn
                maskClosable={false}
            >
                <Alert
                    message="Tài liệu này là file PDF dạng ảnh (Scan)."
                    description="Hệ thống không tìm thấy lớp văn bản gốc. Bạn có muốn bật tính năng OCR để trích xuất nội dung phục vụ tìm kiếm không? Quá trình này có thể mất thêm thời gian."
                    type="info"
                    showIcon
                />
            </Modal>

        </div>
    );
};

export default UC39_UploadPage;