import React, { useState, useCallback, useEffect } from 'react';
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
  Divider,
  Result,
  Form // Thêm Form
} from 'antd';
import { 
  ExperimentOutlined, 
  UploadOutlined, 
  RedoOutlined,
  FileTextOutlined,
  SaveOutlined,
  CloseOutlined
} from '@ant-design/icons';

// --- Mock API Imports ---
import { mockDetailedSuggestMetadata } from '../../api/mockUploadApi';
// import { mockGetCategories } from '../../api/mockDmsApi'; // Không cần ở đây

// --- Component Imports (đã được refactor) ---
import KeyValuePairsDisplay from '../../components/dms/upload/KeyValuePairsDisplay';
import EditableMetadataForm from '../../components/dms/upload/EditableMetadataForm';

const { Title, Paragraph } = Typography;
const { Dragger } = Upload; // <-- Dùng Dragger của Antd

// --- Main Page Component ---
const UC73_SuggestMetadataPage = () => {
    const [file, setFile] = useState(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [analysisResult, setAnalysisResult] = useState(null);
    const [metadata, setMetadata] = useState({});
    
    const { message } = App.useApp();

    const resetState = () => {
        setFile(null);
        setIsProcessing(false);
        setAnalysisResult(null);
        setMetadata({});
    };

    // --- SỬA LỖI Ở ĐÂY ---
    // 1. Xóa bỏ onDrop và hook useDropzone
    // const onDrop = useCallback((acceptedFiles) => { ... }, [message]);
    // const { getRootProps, getInputProps, isDragActive } = useDropzone({ ... });

    // 2. Tạo hàm beforeUpload cho Antd
    const handleBeforeUpload = (selectedFile) => {
        resetState();
        setFile(selectedFile);
        setIsProcessing(true);

        message.loading({ content: 'AI đang phân tích và đề xuất metadata...', key: 'process', duration: 0 });

        mockDetailedSuggestMetadata(selectedFile)
            .then((res) => {
                if (res.success) {
                    setAnalysisResult(res);
                    setMetadata({
                        title: res.suggestions.title?.value || selectedFile.name.replace(/\.[^/.]+$/, ""),
                        description: res.suggestions.summary?.value || '',
                        keywords: res.suggestions.tags?.map(tag => tag.value) || [],
                        category: res.suggestions.category?.value || '',
                        documentType: res.suggestions.documentType?.value || ''
                    });
                    setIsProcessing(false);
                    message.success({ content: 'Phân tích thành công!', key: 'process' });
                } else {
                    throw new Error("Phân tích thất bại");
                }
            })
            .catch((err) => {
                setIsProcessing(false);
                message.error({ content: `Lỗi: ${err.message}`, key: 'process' });
            });
        
        return false; // Quan trọng: Ngăn Antd tự động upload
    };
    // --- KẾT THÚC SỬA LỖI ---
    
    const handleSaveMetadata = () => {
        console.log("Dữ liệu đã lưu:", metadata);
        message.success("Đã lưu metadata thành công!");
    };

    const handleCancelMetadata = () => {
        if (analysisResult) {
            setMetadata({
                title: analysisResult.suggestions.title?.value || file.name.replace(/\.[^/.]+$/, ""),
                description: analysisResult.suggestions.summary?.value || '',
                keywords: analysisResult.suggestions.tags?.map(tag => tag.value) || [],
                category: analysisResult.suggestions.category?.value || '',
                documentType: analysisResult.suggestions.documentType?.value || ''
            });
        }
        message.info("Đã hủy các thay đổi.");
    };

    const handleEditKeyValue = (key, value) => {
        message.info(`Đang chỉnh sửa key: ${key}`);
    };

    return (
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
            <div style={{ textAlign: 'center', marginBottom: 40 }}>
                <Title level={2} style={{ fontWeight: 800 }}>
                    <ExperimentOutlined style={{ color: '#1677ff' }} /> UC-73: Gợi Ý Metadata Thông Minh
                </Title>
                <Paragraph style={{ fontSize: '16px' }} type="secondary">
                    Sử dụng AI để tự động điền thông tin, tiết kiệm thời gian và đảm bảo nhất quán.
                </Paragraph>
            </div>
            
            <Card>
                {!analysisResult && (
                    <Spin spinning={isProcessing} tip="AI đang phân tích file...">
                        {/* --- SỬA LỖI Ở ĐÂY --- */}
                        <Dragger 
                            // {...getRootProps()} // <-- XÓA DÒNG NÀY
                            beforeUpload={handleBeforeUpload} // <-- THÊM PROP NÀY
                            multiple={false} // <-- THÊM PROP NÀY
                            showUploadList={false} // <-- THÊM PROP NÀY
                            disabled={isProcessing} // <-- Giữ nguyên
                            style={{ 
                                padding: '48px', 
                                backgroundColor: '#fafafa' // <-- Xóa isDragActive
                            }}
                        >
                            <p className="ant-upload-drag-icon">
                                <UploadOutlined />
                            </p>
                            <p className="ant-upload-text">Chọn file hoặc kéo thả file vào đây để AI phân tích</p>
                            <p className="ant-upload-hint">
                                Hệ thống sẽ tự động trích xuất và gợi ý các thông tin quan trọng.
                            </p>
                        </Dragger>
                        {/* --- KẾT THÚC SỬA LỖI --- */}
                    </Spin>
                )}

                {analysisResult && (
                    <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                            <Title level={4} style={{ margin: 0, display: 'flex', alignItems: 'center' }}>
                                <FileTextOutlined style={{ marginRight: 12 }} />
                                {file.name}
                            </Title>
                            <Button
                                icon={<RedoOutlined />}
                                onClick={resetState}
                            >
                                Phân tích file khác
                            </Button>
                        </div>
                        
                        <Row gutter={[24, 24]}>
                            {/* Cột trái: Key-Value Pairs và Cảnh báo */}
                            <Col xs={24} lg={12}>
                                <Space direction="vertical" style={{ width: '100%' }} size="large">
                                    <KeyValuePairsDisplay 
                                        keyValuePairs={analysisResult.suggestions.key_values}
                                        onEdit={handleEditKeyValue}
                                    />
                                    
                                    {analysisResult.analysis.conflicts.length > 0 && (
                                        <Alert
                                            message="Phát hiện mâu thuẫn"
                                            description={
                                                <ul>
                                                    {analysisResult.analysis.conflicts.map((c, i) => (
                                                        <li key={i}>
                                                            <strong>{c.field}:</strong> {c.message}
                                                        </li>
                                                    ))}
                                                </ul>
                                            }
                                            type="error"
                                            showIcon
                                        />
                                    )}
                                    
                                    {analysisResult.analysis.warnings.length > 0 && (
                                        <Alert
                                            message="Cảnh báo thiếu thông tin"
                                            description={
                                                <ul>
                                                    {analysisResult.analysis.warnings.map((w, i) => (
                                                        <li key={i}>
                                                            <strong>{w.field}:</strong> {w.message}
                                                        </li>
                                                    ))}
                                                </ul>
                                            }
                                            type="warning"
                                            showIcon
                                        />
                                    )}
                                </Space>
                            </Col>
                            
                            {/* Cột phải: Metadata có thể chỉnh sửa */}
                            <Col xs={24} lg={12}>
                                <Card title="Gợi ý Metadata (Có thể chỉnh sửa)">
                                    <EditableMetadataForm 
                                        metadata={metadata}
                                        onValuesChange={(changedValues, allValues) => setMetadata(allValues)}
                                    />
                                </Card>
                            </Col>
                        </Row>
                        
                        <Divider />
                        
                        <Space style={{ display: 'flex', justifyContent: 'flex-end' }}>
                            <Button 
                                icon={<CloseOutlined />}
                                onClick={handleCancelMetadata}
                            >
                                Hủy thay đổi
                            </Button>
                            <Button 
                                type="primary"
                                icon={<SaveOutlined />}
                                onClick={handleSaveMetadata} 
                            >
                                Lưu Metadata
                            </Button>
                        </Space>
                    </div>
                )}
            </Card>
        </div>
    );
};

export default UC73_SuggestMetadataPage;