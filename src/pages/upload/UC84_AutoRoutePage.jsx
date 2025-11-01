import React, { useState, useCallback, useEffect } from 'react';
// import { useDropzone } from 'react-dropzone'; // <-- XÓA DÒNG NÀY
import { 
  App, 
  Form,
  Input,
  Select,
  Upload, // <-- Đảm bảo đã import
  Spin,
  Card,
  Result,
  Button,
  Space,
  Typography,
  Row, // Thêm Row
  Col // Thêm Col
} from 'antd';
import { 
    ApartmentOutlined,
    FileTextOutlined,
    RedoOutlined,
    SettingOutlined,
    CheckCircleOutlined,
    InfoCircleOutlined,
    UploadOutlined,
    ArrowLeftOutlined
} from '@ant-design/icons';

// --- Mock API Imports ---
import { mockTriggerAutoRoute } from '../../api/mockUploadApi';
import { mockGetCategories } from '../../api/mockDmsApi';

// --- Component Import (ĐÃ REFACTOR) ---
import WorkflowVisualizer from '../../components/dms/upload/WorkflowVisualizer';

const { Title, Paragraph, Text } = Typography;
const { Option } = Select;
const { Dragger } = Upload; // <-- Dùng Dragger của Antd

// --- Main Page Component ---
const UC84_AutoRoutePage = () => {
    const [step, setStep] = useState(1); // 1: Upload, 2: Metadata, 3: Result
    const [file, setFile] = useState(null);
    const [categories, setCategories] = useState([]);
    const [isProcessing, setIsProcessing] = useState(false);
    const [result, setResult] = useState(null);
    
    const [form] = Form.useForm();
    const { message, notification } = App.useApp(); 

    useEffect(() => { 
        mockGetCategories().then(setCategories); 
    }, []);

    // --- SỬA LỖI Ở ĐÂY ---
    // 1. Xóa bỏ onDrop và hook useDropzone
    // const onDrop = useCallback((acceptedFiles) => { ... }, [form]);
    // const { getRootProps, getInputProps, isDragActive } = useDropzone({ ... });
    
    // 2. Tạo hàm beforeUpload cho Antd
    const handleBeforeUpload = (selectedFile) => {
        setResult(null);
        setFile(selectedFile);
        form.setFieldsValue({
            title: selectedFile.name.replace(/\.[^/.]+$/, "")
        });
        setStep(2);
        
        return false; // Quan trọng: Ngăn Antd tự động upload
    };
    // --- KẾT THÚC SỬA LỖI ---


    const handleReset = () => {
        setStep(1);
        setFile(null);
        form.resetFields();
        setResult(null);
        setIsProcessing(false);
    };

    const onFinish = async (values) => {
        if (!values.category) {
            message.error("Vui lòng chọn một danh mục để hệ thống định tuyến.");
            return;
        }
        setIsProcessing(true);
        const loadingKey = 'routing';
        message.loading({ content: 'Đang kiểm tra quy tắc và định tuyến...', key: loadingKey, duration: 0 });

        try {
            const apiResult = await mockTriggerAutoRoute(file, values);
            setResult(apiResult);
            setIsProcessing(false);
            setStep(3);
            if (apiResult.triggered) {
                message.success({ content: "Đã tìm thấy và kích hoạt workflow!", key: loadingKey });
            } else {
                message.info({ content: "Không có workflow phù hợp.", key: loadingKey });
            }
        } catch (err) {
            setIsProcessing(false);
            message.error({ content: `Lỗi: ${err.message}`, key: loadingKey });
            notification.error({
                message: 'Lỗi định tuyến',
                description: err.message,
                placement: 'topRight'
            });
        }
    };

    const renderContent = () => {
        switch(step) {
            case 1: // Chọn File
                 return (
                    // --- SỬA LỖI Ở ĐÂY ---
                    <Dragger 
                        // {...getRootProps()} // <-- XÓA DÒNG NÀY
                        beforeUpload={handleBeforeUpload} // <-- THÊM PROP NÀY
                        multiple={false} // <-- THÊM PROP NÀY
                        showUploadList={false} // <-- THÊM PROP NÀY
                        disabled={step > 1} // <-- Giữ nguyên
                        style={{ 
                            padding: '48px', 
                            backgroundColor: '#fafafa' // <-- Xóa isDragActive
                        }}
                    >
                        <p className="ant-upload-drag-icon">
                            <ApartmentOutlined />
                        </p>
                        <p className="ant-upload-text">Chọn file hoặc kéo thả để bắt đầu quy trình định tuyến</p>
                        <p className="ant-upload-hint">
                            Hệ thống sẽ dựa vào danh mục bạn chọn (ở bước sau) để tự động luân chuyển.
                        </p>
                    </Dragger>
                    // --- KẾT THÚC SỬA LỖI ---
                );
            case 2: // Điền Metadata
                return (
                    <Spin spinning={isProcessing} tip="Đang kiểm tra quy tắc...">
                        <Row gutter={[24, 24]}>
                            <Col xs={24} md={8}>
                                <Card title="File đã chọn">
                                    <FileTextOutlined style={{ fontSize: '48px', color: '#8c8c8c', display: 'block', textAlign: 'center' }} />
                                    <Text strong style={{ display: 'block', textAlign: 'center', marginTop: 16 }}>{file?.name}</Text>
                                    <Text type="secondary" style={{ display: 'block', textAlign: 'center', fontSize: 12 }}>
                                        Kích thước: {(file?.size / 1024).toFixed(2)} KB
                                    </Text>
                                    <Button 
                                        icon={<ArrowLeftOutlined />} 
                                        onClick={handleReset} 
                                        style={{ marginTop: 24, width: '100%' }}
                                    >
                                        Chọn file khác
                                    </Button>
                                </Card>
                            </Col>
                            <Col xs={24} md={16}>
                                <Card title="Thông tin định tuyến">
                                    <Form
                                        form={form}
                                        layout="vertical"
                                        onFinish={onFinish}
                                    >
                                        <Form.Item
                                            name="title"
                                            label="Tiêu đề tài liệu"
                                            rules={[{ required: true, message: 'Vui lòng nhập tiêu đề!' }]}
                                        >
                                            <Input size="large" />
                                        </Form.Item>
                                        <Form.Item
                                            name="category"
                                            label="Danh mục (Bắt buộc để định tuyến)"
                                            rules={[{ required: true, message: 'Vui lòng chọn danh mục!' }]}
                                            tooltip="Hệ thống sẽ dựa vào đây để kích hoạt quy trình."
                                        >
                                            <Select size="large" placeholder="-- Chọn danh mục --">
                                                {categories.map(c => <Option key={c.id} value={c.id}>{c.name}</Option>)}
                                            </Select>
                                        </Form.Item>
                                        <Form.Item style={{marginTop: 32, marginBottom: 0, textAlign: 'right'}}>
                                            <Button
                                                type="primary"
                                                htmlType="submit"
                                                size="large"
                                                icon={<SettingOutlined />}
                                                loading={isProcessing}
                                            >
                                                Tải lên & Định tuyến
                                            </Button>
                                        </Form.Item>
                                    </Form>
                                </Card>
                            </Col>
                        </Row>
                    </Spin>
                );
            case 3: { // Kết quả
                if (!result) return null;
                const isTriggered = result.triggered;
                return (
                    <Result
                        status={isTriggered ? "success" : "info"}
                        title={isTriggered ? "Kích hoạt quy trình thành công!" : "Tải lên hoàn tất"}
                        subTitle={result.message}
                        icon={isTriggered ? <CheckCircleOutlined /> : <InfoCircleOutlined />}
                        extra={[
                            isTriggered && result.workflow && (
                                <div style={{ maxWidth: 400, margin: '0 auto', textAlign: 'left' }} key="workflow">
                                    <WorkflowVisualizer workflow={result.workflow} />
                                </div>
                            ),
                            <Button 
                                type="primary" 
                                icon={<RedoOutlined />} 
                                onClick={handleReset} 
                                key="redo"
                                style={{marginTop: isTriggered ? 24 : 0}}
                            >
                                Thử với file khác
                            </Button>,
                        ]}
                    />
                );
            }
            default: return null;
        }
    }

    return (
        <div style={{ maxWidth: 900, margin: '0 auto' }}>
            <div style={{ textAlign: 'center', marginBottom: 40 }}>
                <Title level={2} style={{ fontWeight: 800 }}>
                    <ApartmentOutlined style={{ color: '#1677ff' }} /> UC-84: Tự Động Định Tuyến
                </Title>
                <Paragraph style={{ fontSize: '16px' }} type="secondary">
                    Dựa trên metadata để tự động gửi tài liệu vào các quy trình nghiệp vụ đã định sẵn.
                </Paragraph>
            </div>
            <Card style={{ minHeight: 450, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                {renderContent()}
            </Card>
        </div>
    );
};

export default UC84_AutoRoutePage;