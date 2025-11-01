import React, { useState, useCallback } from 'react';
// import { useDropzone } from 'react-dropzone'; // <-- XÓA DÒNG NÀY
import { 
    App,
    Upload, // <-- Đảm bảo đã import
    Spin, 
    Row, 
    Col, 
    Card, 
    Alert, 
    Typography, 
    Button, 
    Space,
    InputNumber,
    Radio,
    Result,
    Divider,
    Form // <-- Import Form
} from 'antd';
import { 
    FileSearchOutlined,
    UploadOutlined,
    RedoOutlined,
    FilePdfOutlined,
    FileDoneOutlined,
    WarningFilled,
    DownloadOutlined
} from '@ant-design/icons';

// --- Mock API Import ---
import { mockDeepDuplicateCheck } from '../../api/mockUploadApi';

// --- Component Imports (ĐÃ ĐƯỢC REFACTOR) ---
import DuplicateDetails from '../../components/dms/upload/DuplicateDetails';
import StatisticsTable from '../../components/dms/upload/StatisticsTable';

const { Title, Paragraph, Text } = Typography;
const { Dragger } = Upload; // <-- Dùng Dragger của Antd

// --- Main Page Component ---
const UC88_DuplicateCheckPage = () => {
    const [file, setFile] = useState(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [result, setResult] = useState(null);
    const [error, setError] = useState(null);
    const [threshold, setThreshold] = useState(30); 
    const [method, setMethod] = useState('fast'); 

    const { message } = App.useApp();

    const handleReset = () => {
        setFile(null);
        setIsProcessing(false);
        setResult(null);
        setError(null);
    };
    
    // --- SỬA LỖI Ở ĐÂY ---
    // 1. Xóa bỏ onDrop và hook useDropzone
    // const onDrop = useCallback((acceptedFiles) => { ... }, []);
    // const { getRootProps, getInputProps, isDragActive } = useDropzone({ ... });
    
    // 2. Tạo hàm beforeUpload cho Antd
    const handleBeforeUpload = (selectedFile) => {
        handleReset();
        setFile(selectedFile);
        return false; // Quan trọng: Ngăn Antd tự động upload
    };
    // --- KẾT THÚC SỬA LỖI ---


    const handleCheck = () => {
        if (!file) {
            message.error("Vui lòng chọn một file để kiểm tra.");
            return;
        }
        setIsProcessing(true);
        setResult(null);
        setError(null);

        message.loading({ content: 'Đang phân tích sâu và đối chiếu toàn bộ CSDL...', key: 'check', duration: 0 });

        mockDeepDuplicateCheck(file)
            .then((apiResult) => {
                setResult(apiResult);
                setIsProcessing(false);
                message.success({ content: 'Phân tích hoàn tất!', key: 'check' });
            })
            .catch((err) => {
                setError(err.message || 'Đã có lỗi xảy ra.');
                setIsProcessing(false);
                message.error({ content: 'Phân tích thất bại.', key: 'check' });
            });
    }
    
    return (
        <div style={{ maxWidth: 1000, margin: '0 auto' }}>
            <div style={{ textAlign: 'center', marginBottom: 40 }}>
                <Title level={2} style={{ fontWeight: 800 }}>
                    <FileSearchOutlined style={{ color: '#1677ff' }} /> UC-88: Kiểm Tra Trùng Lặp Văn Bản
                </Title>
                <Paragraph style={{ fontSize: '16px' }} type="secondary">
                    Phân tích sâu để đảm bảo tính duy nhất của tài liệu trong hệ thống.
                </Paragraph>
            </div>
            
            <Card>
                {!result && !error && ( // Thêm điều kiện !error
                    <Spin spinning={isProcessing} tip="Đang phân tích...">
                        <Row gutter={[24, 24]} align="middle">
                            <Col xs={24} md={12}>
                                {/* Bọc trong Form.Item để có label */}
                                <Form.Item label="Tải lên văn bản cần kiểm tra:" required style={{marginBottom: 0}}>
                                    {/* --- SỬA LỖI Ở ĐÂY --- */}
                                    <Dragger 
                                        // {...getRootProps()} // <-- XÓA DÒNG NÀY
                                        beforeUpload={handleBeforeUpload} // <-- THÊM PROP NÀY
                                        multiple={false} // <-- THÊM PROP NÀY
                                        showUploadList={false} // <-- THÊM PROP NÀY
                                        disabled={isProcessing} // <-- Giữ nguyên
                                        style={{ 
                                            padding: '24px', 
                                            backgroundColor: '#fafafa' // <-- Xóa isDragActive
                                        }}
                                    >
                                        <p className="ant-upload-drag-icon">
                                            <UploadOutlined />
                                        </p>
                                        {file ? (
                                            <>
                                                <p className="ant-upload-text" style={{color: '#1677ff', fontWeight: 600}}>{file.name}</p>
                                                <p className="ant-upload-hint">Click hoặc kéo file khác để thay thế</p>
                                            </>
                                        ) : (
                                            <>
                                                <p className="ant-upload-text">Kéo thả file hoặc click để chọn</p>
                                                <p className="ant-upload-hint">Hỗ trợ: PDF, DOCX, TXT</p>
                                            </>
                                        )}
                                    </Dragger>
                                    {/* --- KẾT THÚC SỬA LỖI --- */}
                                </Form.Item>
                            </Col>
                            <Col xs={24} md={12}>
                                <Form layout="vertical"> {/* Thêm Form để các Form.Item có layout */}
                                    <Form.Item label="Ngưỡng phát hiện (%):" style={{ margin: 0 }}>
                                        <InputNumber 
                                            value={threshold} 
                                            onChange={setThreshold} 
                                            min={10} max={100} 
                                            style={{ width: '100%' }} 
                                            size="large"
                                        />
                                    </Form.Item>
                                    <Form.Item label="Phương pháp so sánh:" style={{ margin: 0, marginTop: 16 }}>
                                        <Radio.Group 
                                            value={method} 
                                            onChange={(e) => setMethod(e.target.value)}
                                            optionType="button"
                                            buttonStyle="solid"
                                            style={{ width: '100%' }}
                                        >
                                            <Radio.Button value="fast" style={{ width: '50%', textAlign: 'center' }}>⚡️ Thường (Nhanh)</Radio.Button>
                                            <Radio.Button value="deep" style={{ width: '50%', textAlign: 'center' }}>🧠 Sâu (Chính xác)</Radio.Button>
                                        </Radio.Group>
                                    </Form.Item>
                                </Form>
                            </Col>
                        </Row>
                        <Divider />
                        <div style={{ textAlign: 'center' }}>
                            <Button 
                                type="primary" 
                                size="large" 
                                icon={<FileSearchOutlined />}
                                onClick={handleCheck} 
                                disabled={isProcessing || !file}
                            >
                                Kiểm tra ngay
                            </Button>
                            <Paragraph type="secondary" style={{fontSize: 12, marginTop: 8}}>
                                Lưu ý: Chỉ file có tên "Dupli-Document" mới được giả lập là có trùng lặp.
                            </Paragraph>
                        </div>
                    </Spin>
                )}
                
                {result && !isProcessing && (
                    <div>
                        <Result
                            status={result.hasDuplicates ? "error" : "success"}
                            title={result.hasDuplicates ? "Phát hiện trùng lặp!" : "Không phát hiện trùng lặp"}
                            subTitle={result.hasDuplicates ? result.message : "Tài liệu này là duy nhất trong hệ thống."}
                            icon={result.hasDuplicates ? <WarningFilled /> : <FileDoneOutlined />}
                            extra={[
                                <Button 
                                    type="primary" 
                                    key="redo" 
                                    icon={<RedoOutlined />}
                                    onClick={handleReset}
                                >
                                    Kiểm tra file khác
                                </Button>,
                                <Button 
                                    key="report" 
                                    icon={<DownloadOutlined />}
                                    disabled={!result.hasDuplicates}
                                >
                                    Tải báo cáo PDF
                                </Button>,
                            ]}
                        >
                            {result.hasDuplicates && (
                                <div style={{ textAlign: 'left', maxWidth: 800, margin: '0 auto' }}>
                                    <StatisticsTable duplicates={result.duplicates} />
                                    <DuplicateDetails duplicates={result.duplicates} />
                                </div>
                            )}
                        </Result>
                    </div>
                )}

                {error && (
                    <Result
                        status="error"
                        title="Phân tích thất bại"
                        subTitle={error}
                        extra={[
                            <Button type="primary" key="redo" icon={<RedoOutlined />} onClick={handleReset}>
                                Thử lại
                            </Button>
                        ]}
                    />
                )}
            </Card>
        </div>
    );
};

export default UC88_DuplicateCheckPage;