import React, { useState, useEffect, useMemo } from 'react';
import { 
    Carousel, 
    Button, 
    Card, 
    Image, 
    Space, 
    Typography, 
    Tag, 
    Row, 
    Col, 
    Empty,
    Tooltip
} from 'antd';
import { 
    DownloadOutlined, 
    LeftOutlined, 
    RightOutlined, 
    FilePdfOutlined, 
    FileImageOutlined,
    ZoomInOutlined
} from '@ant-design/icons';

const { Text, Title } = Typography;

/**
 * Component hiển thị so sánh kết quả Khử nhiễu (Denoise).
 * Yêu cầu: 
 * - Carousel slide: Gốc -> Đã khử nhiễu.
 * - Hỗ trợ xem trước PDF Scan trên trình duyệt.
 * - Nút tải về phải tải file về máy (Force Download).
 */
const DenoiseViewer = ({ denoiseInfo, originalFile }) => {
    const [originalPreviewUrl, setOriginalPreviewUrl] = useState(null);
    const [currentSlide, setCurrentSlide] = useState(0);

    // --- 1. Xử lý File Gốc (Local File Object) ---
    useEffect(() => {
        if (originalFile) {
            // Tạo URL Blob cho file gốc để preview ngay lập tức
            const objectUrl = URL.createObjectURL(originalFile);
            setOriginalPreviewUrl(objectUrl);

            // Cleanup memory khi unmount
            return () => URL.revokeObjectURL(objectUrl);
        }
    }, [originalFile]);

    // --- 2. Xử lý thông tin File đã khử nhiễu (Server Response) ---
    // denoiseInfo thường có dạng: { downloadUrl: "...", denoised: true, modelUsed: "...", ... }
    // API Backend trả về đường dẫn tương đối, cần ghép với Base URL của API
    const API_BASE_URL = import.meta.env.VITE_FILE_SERVICE_URL || 'http://localhost:8000/api/v1/file';
    
    // Parse tên file từ downloadUrl cũ để dùng cho endpoint mới
    // Giả sử downloadUrl backend trả về dạng: /static/denoised_results/filename.pdf
    const denoisedFileName = useMemo(() => {
        if (!denoiseInfo?.downloadUrl) return null;
        return denoiseInfo.downloadUrl.split('/').pop();
    }, [denoiseInfo]);

    // Tạo URL hiển thị (Preview - Inline)
    const denoisedPreviewUrl = useMemo(() => {
        if (!denoisedFileName) return null;
        return `${API_BASE_URL}/preview-temp/${denoisedFileName}`;
    }, [denoisedFileName, API_BASE_URL]);

    // Tạo URL tải về (Download - Attachment)
    const realDownloadUrl = useMemo(() => {
        if (!denoisedFileName) return null;
        return `${API_BASE_URL}/download-temp/${denoisedFileName}`;
    }, [denoisedFileName, API_BASE_URL]);

    // Xác định loại file (dựa trên file gốc hoặc extension)
    const isPdf = originalFile?.type === 'application/pdf' || denoiseInfo?.isPdf;
    const modelUsed = denoiseInfo?.modelUsed || 'NAFNet (Auto)';

    // --- 3. Render Content cho từng Slide ---
    const renderContent = (url, label, isOriginal = false) => {
        if (!url) return <Empty description="Không có dữ liệu hình ảnh" />;

        return (
            <div style={{ padding: '0 20px' }}>
                <div style={{ marginBottom: 10, textAlign: 'center' }}>
                    <Tag color={isOriginal ? "blue" : "green"} style={{ fontSize: 14, padding: '4px 10px' }}>
                        {label.toUpperCase()}
                    </Tag>
                </div>

                <div style={{ 
                    height: '450px', 
                    background: '#f0f2f5', 
                    borderRadius: '8px', 
                    overflow: 'hidden',
                    border: '1px solid #d9d9d9',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                }}>
                    {isPdf ? (
                        // Logic hiển thị PDF: Dùng iframe để browser tự render
                        <iframe 
                            src={`${url}#toolbar=0&view=FitH`} // Tắt toolbar PDF mặc định của browser cho gọn
                            title={label}
                            width="100%" 
                            height="100%" 
                            style={{ border: 'none' }} 
                        />
                    ) : (
                        // Logic hiển thị Ảnh: Dùng Antd Image để có tính năng Zoom xịn
                        <Image 
                            src={url} 
                            alt={label}
                            style={{ objectFit: 'contain', maxHeight: '450px' }}
                            height="100%"
                        />
                    )}
                </div>
            </div>
        );
    };

    // --- 4. Handler Tải về (Universal) ---
    const handleDownload = () => {
        const urlToDownload = currentSlide === 0 ? originalPreviewUrl : realDownloadUrl;
        const fileName = currentSlide === 0 ? originalFile.name : `Denoised_${denoisedFileName || originalFile.name}`;

        if (currentSlide === 0) {
            // Tải file gốc (Blob)
            const link = document.createElement('a');
            link.href = urlToDownload;
            link.download = fileName;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        } else {
            // Tải file từ Server (Force Download Endpoint)
            // Mở link này sẽ kích hoạt header attachment từ backend
            window.location.href = realDownloadUrl; 
        }
    };

    if (!originalFile && !denoiseInfo) return <Empty description="Chưa có thông tin xử lý" />;

    return (
        <div className="denoise-viewer-container">
            {/* Header thông tin */}
            <Row justify="space-between" align="middle" style={{ marginBottom: 16 }}>
                <Col>
                    <Space>
                        {isPdf ? <FilePdfOutlined style={{ fontSize: 20, color: '#ff4d4f' }} /> : <FileImageOutlined style={{ fontSize: 20, color: '#1890ff' }} />}
                        <Text strong>Trình xem khử nhiễu AI ({modelUsed})</Text>
                    </Space>
                </Col>
                <Col>
                    <Text type="secondary" style={{ fontSize: 12 }}>
                        Sử dụng mũi tên bên dưới để so sánh
                    </Text>
                </Col>
            </Row>

            {/* Carousel Content */}
            <Carousel 
                arrows 
                prevArrow={<LeftOutlined style={{ fontSize: 24, color: '#1890ff', fontWeight: 'bold' }} />}
                nextArrow={<RightOutlined style={{ fontSize: 24, color: '#1890ff', fontWeight: 'bold' }} />}
                dots={{ className: 'custom-dots' }}
                afterChange={(current) => setCurrentSlide(current)}
                style={{ background: '#fff', paddingBottom: 30 }}
            >
                {/* SLIDE 1: GỐC */}
                <div>
                    {renderContent(originalPreviewUrl, "Tài liệu Gốc (Original)", true)}
                </div>

                {/* SLIDE 2: ĐÃ XỬ LÝ */}
                <div>
                    {renderContent(denoisedPreviewUrl, "Kết quả Khử Nhiễu (AI Denoised)", false)}
                </div>
            </Carousel>

            {/* Action Buttons Footer */}
            <div style={{ marginTop: 16, textAlign: 'center', borderTop: '1px solid #f0f0f0', paddingTop: 16 }}>
                <Space size="large">
                    <div style={{ textAlign: 'left' }}>
                        <Text type="secondary" style={{ display: 'block', fontSize: 12 }}>Trạng thái đang xem:</Text>
                        <Text strong style={{ color: currentSlide === 0 ? '#1890ff' : '#52c41a' }}>
                            {currentSlide === 0 ? "Bản gốc chưa xử lý" : "Bản đã khử nhiễu & tối ưu"}
                        </Text>
                    </div>

                    <Button 
                        type="primary" 
                        icon={<DownloadOutlined />} 
                        size="large"
                        onClick={handleDownload}
                        style={{ minWidth: 200 }}
                    >
                        Tải về máy ({currentSlide === 0 ? 'Bản gốc' : 'Bản xử lý'})
                    </Button>
                </Space>
            </div>
            
            {/* CSS Styles cho Carousel Arrows (Inline hoặc đưa vào file css riêng) */}
            <style jsx="true">{`
                .ant-carousel .slick-prev,
                .ant-carousel .slick-next {
                    font-size: 20px;
                    color: #1890ff;
                    z-index: 2;
                    width: 40px;
                    height: 40px;
                    line-height: 40px;
                    background: rgba(255, 255, 255, 0.8);
                    border-radius: 50%;
                    box-shadow: 0 2px 8px rgba(0,0,0,0.15);
                }
                .ant-carousel .slick-prev:hover,
                .ant-carousel .slick-next:hover {
                    background: #1890ff;
                    color: #fff;
                }
                .ant-carousel .slick-prev {
                    left: 10px;
                }
                .ant-carousel .slick-next {
                    right: 10px;
                }
                .ant-carousel .slick-prev::before,
                .ant-carousel .slick-next::before {
                    content: ''; /* Remove default slick content */
                }
            `}</style>
        </div>
    );
};

export default DenoiseViewer;