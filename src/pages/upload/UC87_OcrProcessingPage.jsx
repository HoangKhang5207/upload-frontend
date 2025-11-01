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
    Statistic,
    Tag,
    Result
} from 'antd';
import { 
    ExperimentOutlined, 
    UploadOutlined, 
    RedoOutlined,
    FileTextOutlined,
    DownloadOutlined,
    WarningOutlined,
    CheckCircleOutlined,
    SyncOutlined
} from '@ant-design/icons';

// --- Mock API Import ---
import { mockOcrProcess } from '../../api/mockUploadApi';

// --- Component Imports (ĐÃ ĐƯỢC REFACTOR) ---
import OcrResultTabs from '../../components/dms/upload/OcrResultTabs';
import PdfViewer from '../../components/dms/upload/PdfViewer';
import HorizontalProcessingBar from '../../components/dms/upload/HorizontalProcessingBar';
import EditableMetadataForm from '../../components/dms/upload/EditableMetadataForm';

// --- Sample Data ---
import sampleData from '../../data/ocrSampleData.json';
import sampleData10Pages from '../../data/sampleData10Pages.json';
import processingStepsData from '../../data/processingStepsData.json';

const { Title, Paragraph, Text } = Typography;
const { Dragger } = Upload; // <-- Dùng Dragger của Antd

// --- Main Page Component ---
const UC87_OcrProcessingPage = () => {
    const [file, setFile] = useState(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [ocrResult, setOcrResult] = useState(null);
    const [useSampleData, setUseSampleData] = useState(false);
    const [useSampleData10Pages, setUseSampleData10Pages] = useState(false);
    const [processCompleted, setProcessCompleted] = useState(false);
    const [processingSteps, setProcessingSteps] = useState(processingStepsData);
    const [metadata, setMetadata] = useState({});

    const { message, notification } = App.useApp();

    const resetProcessingState = () => {
        setProcessingSteps(processingStepsData);
        setProcessCompleted(false);
    };

    const handleReset = () => {
        setFile(null);
        setOcrResult(null);
        setIsProcessing(false);
        setUseSampleData(false);
        setUseSampleData10Pages(false);
        setProcessCompleted(false);
        setProcessingSteps(processingStepsData);
        setMetadata({});
    };

    // Cập nhật tiến trình
    const updateProcessingStep = (stepId, status, details = "") => {
        setProcessingSteps(prevSteps => 
            prevSteps.map(step => 
                step.id === stepId 
                    ? { ...step, status, details } 
                    : step
            )
        );
    };

    useEffect(() => {
        // ... (Giữ nguyên logic của useEffect này)
        if (!isProcessing || (useSampleData || useSampleData10Pages)) return;
        const totalPages = sampleData.documentInfo.pages;
        const timer1 = setTimeout(() => updateProcessingStep(1, "completed", file.type.startsWith('image/') ? "Ảnh đơn" : `PDF ảnh (${totalPages} trang)`), 500);
        const timer2 = setTimeout(() => updateProcessingStep(2, "in-progress"), 1000);
        const timer3 = setTimeout(() => updateProcessingStep(2, "completed", "Áp dụng bộ lọc AI"), 2000);
        const timer4 = setTimeout(() => updateProcessingStep(3, "in-progress"), 2500);
        const timer5 = setTimeout(() => updateProcessingStep(3, "completed", "Độ chính xác 96.8%"), 6000);
        const timer6 = setTimeout(() => updateProcessingStep(4, "in-progress"), 6500);
        const timer7 = setTimeout(() => updateProcessingStep(4, "completed", "Đã gợi ý siêu dữ liệu"), 8000);
        const timer8 = setTimeout(() => updateProcessingStep(5, "in-progress"), 8500);
        const timer9 = setTimeout(() => updateProcessingStep(5, "completed", "Sẵn sàng review"), 9000);
        return () => {
            [timer1, timer2, timer3, timer4, timer5, timer6, timer7, timer8, timer9].forEach(clearTimeout);
        };
    }, [isProcessing, useSampleData, useSampleData10Pages, file]);

    // --- SỬA LỖI Ở ĐÂY ---
    // 1. Xóa bỏ onDrop và hook useDropzone
    // const onDrop = useCallback((acceptedFiles) => { ... }, [message, notification]);
    // const { getRootProps, getInputProps, isDragActive } = useDropzone({ ... });
    
    // 2. Tạo hàm beforeUpload cho Antd
    const handleBeforeUpload = (selectedFile) => {
        if (!selectedFile) return false;

        handleReset();
        setFile(selectedFile);
        setIsProcessing(true);
        resetProcessingState();
        
        message.loading({ content: 'AI đang phân tích và trích xuất dữ liệu...', key: 'ocr', duration: 0 });

        mockOcrProcess(selectedFile)
            .then((result) => {
                setOcrResult(result);
                message.success({ content: 'Trích xuất dữ liệu thành công!', key: 'ocr' });
            })
            .catch((err) => {
                setIsProcessing(false);
                message.error({ content: `Lỗi xử lý OCR: ${err.message}`, key: 'ocr' });
                notification.error({
                    message: 'Xử lý OCR thất bại',
                    description: err.message,
                    placement: 'topRight'
                });
            });
        
        return false; // Quan trọng: Ngăn Antd tự động upload
    };
    // --- KẾT THÚC SỬA LỖI ---
    
    const loadSampleData = (data) => {
        handleReset();
        const is10Pages = data.documentInfo.pages === 10;
        setUseSampleData(!is10Pages);
        setUseSampleData10Pages(is10Pages);
        setOcrResult(data.ocrResult);
        setFile({ name: data.documentInfo.name, type: data.documentInfo.type });
        setMetadata(data.metadataSuggestion);
        setProcessingSteps(data.processingSteps); 
        setProcessCompleted(true);
        setIsProcessing(false);
    };

    const exportJson = () => {
        if (!ocrResult) return;
        const dataStr = JSON.stringify(ocrResult, null, 2);
        const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
        const exportFileDefaultName = `${file.name.split('.')[0]}_ocr_result.json`;
    
        const linkElement = document.createElement('a');
        linkElement.setAttribute('href', dataUri);
        linkElement.setAttribute('download', exportFileDefaultName);
        linkElement.click();
        message.success("Đã xuất file JSON.");
    };

    const handleProcessComplete = () => {
        setProcessCompleted(true);
        setIsProcessing(false);
    };

    const handleSaveMetadata = (updatedMetadata) => {
        console.log("Saving metadata:", metadata);
        message.success("Đã cập nhật siêu dữ liệu!");
    };
    
    const getTotalPages = () => {
        if (useSampleData) return sampleData.documentInfo.pages;
        if (useSampleData10Pages) return sampleData10Pages.documentInfo.pages;
        if (file) return sampleData.documentInfo.pages;
        return 3;
    };

    const getCurrentData = () => {
        if (useSampleData) return sampleData;
        if (useSampleData10Pages) return sampleData10Pages;
        return sampleData; 
    };

    const currentData = getCurrentData();

    return (
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
            <div style={{ textAlign: 'center', marginBottom: 40 }}>
                <Title level={2} style={{ fontWeight: 800 }}>
                    <ExperimentOutlined style={{ color: '#1677ff' }} /> UC-87: Trích xuất Dữ liệu (OCR)
                </Title>
                <Paragraph style={{ fontSize: '16px' }} type="secondary">
                    Sử dụng AI để phân tích văn bản hành chính và trích xuất thông tin dưới dạng cấu trúc JSON.
                </Paragraph>
            </div>
            
            <Card style={{ minHeight: 600, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                
                {!file && !isProcessing && (
                    <div style={{ width: '100%', maxWidth: 600, textAlign: 'center' }}>
                        {/* --- SỬA LỖI Ở ĐÂY --- */}
                        <Dragger 
                            // {...getRootProps()} // <-- XÓA DÒNG NÀY
                            beforeUpload={handleBeforeUpload} // <-- THÊM PROP NÀY
                            multiple={false} // <-- THÊM PROP NÀY
                            showUploadList={false} // <-- THÊM PROP NÀY
                            disabled={isProcessing} // <-- Giữ nguyên
                            accept={{ 'image/jpeg': [], 'image/png': [], 'application/pdf': [] }} // <-- Thêm accept
                            style={{ 
                                padding: '48px', 
                                backgroundColor: '#fafafa' // <-- Xóa isDragActive
                            }}
                        >
                            <p className="ant-upload-drag-icon">
                                <UploadOutlined />
                            </p>
                            <p className="ant-upload-text">Kéo thả file PDF hoặc ảnh vào đây</p>
                            <p className="ant-upload-hint">
                                Hệ thống sẽ tự động xử lý và hiển thị kết quả chi tiết.
                            </p>
                        </Dragger>
                        {/* --- KẾT THÚC SỬA LỖI --- */}
                        
                        <Divider>Hoặc dùng dữ liệu mẫu</Divider>
                        <Space>
                            <Button onClick={() => loadSampleData(sampleData)}>5 trang (Hợp đồng)</Button>
                            <Button onClick={() => loadSampleData(sampleData10Pages)}>10 trang (Báo cáo)</Button>
                        </Space>
                    </div>
                )}
                
                {isProcessing && (
                    <Spin 
                        spinning={true} 
                        tip={<Title level={4} style={{marginTop: 16}}>Đang phân tích dữ liệu...</Title>} 
                        indicator={<SyncOutlined spin style={{ fontSize: 48 }} />}
                    >
                        <div style={{ width: 600, padding: 48, textAlign: 'center' }}>
                            <Paragraph type="secondary">AI đang xử lý và trích xuất thông tin từ:</Paragraph>
                            <Text strong>{file?.name}</Text>
                            
                            <div style={{ marginTop: 32 }}>
                                <HorizontalProcessingBar 
                                    steps={processingSteps} 
                                    onProcessComplete={handleProcessComplete}
                                    totalPages={getTotalPages()}
                                />
                            </div>
                        </div>
                    </Spin>
                )}

                {((ocrResult && !isProcessing && processCompleted) || useSampleData || useSampleData10Pages) && (
                    <div style={{width: '100%'}}>
                        <Result
                            icon={<CheckCircleOutlined />}
                            title="Phân tích hoàn tất!"
                            extra={
                                <Button 
                                    type="primary" 
                                    icon={<RedoOutlined />}
                                    onClick={handleReset}
                                >
                                    Phân tích file khác
                                </Button>
                            }
                        />
                        
                        <Row gutter={[24, 24]}>
                            <Col xs={24} lg={8}>
                                <div style={{ position: 'sticky', top: 100 }}>
                                    <PdfViewer 
                                        totalPages={currentData.documentInfo.pages} 
                                        fileName={currentData.documentInfo.name} 
                                    />
                                </div>
                            </Col>
                            
                            <Col xs={24} lg={16}>
                                <Space direction="vertical" size="large" style={{width: '100%'}}>
                                    <HorizontalProcessingBar 
                                        steps={(useSampleData || useSampleData10Pages) ? currentData.processingSteps : processingSteps} 
                                        onProcessComplete={handleProcessComplete}
                                        totalPages={getTotalPages()}
                                    />
                                    
                                    <Card title="Siêu dữ liệu gợi ý">
                                        <EditableMetadataForm 
                                            metadata={metadata}
                                            onValuesChange={(changedValues, allValues) => setMetadata(allValues)}
                                        />
                                        <Space style={{ marginTop: 24, justifyContent: 'flex-end', width: '100%' }}>
                                            <Button onClick={handleSaveMetadata}>Lưu thay đổi</Button>
                                        </Space>
                                    </Card>
                                    
                                    <Card title="Thông tin trích xuất chi tiết">
                                        <Row gutter={16} style={{marginBottom: 24}}>
                                            <Col span={8}>
                                                <Statistic title="Độ chính xác" value={currentData.ocrResult.confidence} suffix="%" />
                                            </Col>
                                            <Col span={8}>
                                                <Statistic title="Ngôn ngữ" value={currentData.ocrResult.language.toUpperCase()} />
                                            </Col>
                                            <Col span={8}>
                                                <Statistic title="Thời gian xử lý" value={currentData.ocrResult.processingTime} suffix="s" />
                                            </Col>
                                        </Row>
                                        
                                        {currentData.ocrResult.warnings.length > 0 && (
                                            <Alert
                                                message="Cảnh báo từ hệ thống"
                                                description={
                                                    <ul style={{ paddingLeft: 20, margin: 0 }}>
                                                        {currentData.ocrResult.warnings.map((w, i) => <li key={i}>{w}</li>)}
                                                    </ul>
                                                }
                                                type="warning"
                                                showIcon
                                                style={{ marginBottom: 24 }}
                                            />
                                        )}
                                        
                                        <OcrResultTabs result={currentData.ocrResult} />
                                    </Card>

                                    <div style={{ textAlign: 'right' }}>
                                        <Button 
                                            type="primary" 
                                            icon={<DownloadOutlined />}
                                            onClick={exportJson}
                                            ghost
                                        >
                                            Tải file JSON kết quả
                                        </Button>
                                    </div>
                                </Space>
                            </Col>
                        </Row>
                    </div>
                )}
            </Card>
        </div>
    );
};

export default UC87_OcrProcessingPage;