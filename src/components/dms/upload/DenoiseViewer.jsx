import React, { useMemo } from 'react';
import { Card, Row, Col, Image, Tag, Button, Alert, Space, Typography, Empty } from 'antd';
import { 
    ExperimentOutlined, 
    DownloadOutlined, 
    ArrowRightOutlined,
    FilePdfOutlined,
    FileImageOutlined
} from '@ant-design/icons';

const { Text } = Typography;

const DenoiseViewer = ({ denoiseInfo, originalFile }) => {
    // 1. Kiểm tra dữ liệu
    if (!denoiseInfo) {
        return <Empty description="Chưa có thông tin khử nhiễu" />;
    }

    // 2. Tạo URL Preview cho file Gốc (Before) - Load từ Client Memory
    const originalPreviewUrl = useMemo(() => {
        if (originalFile && originalFile.type.startsWith('image/')) {
            return URL.createObjectURL(originalFile);
        }
        return null;
    }, [originalFile]);

    // 3. URL cho file Đã xử lý (After) - Load từ Backend Localhost
    const API_BASE_URL = 'http://localhost:8000'; // Cấu hình cứng cho Localhost
    const denoiseDownloadUrl = denoiseInfo.downloadUrl 
        ? `${API_BASE_URL}${denoiseInfo.downloadUrl}` 
        : null;

    const { denoised, isPdf, modelUsed, originalSize, denoisedSize, message } = denoiseInfo;

    return (
        <div style={{ padding: '10px 0' }}>
            {/* Thông báo trạng thái */}
            <Alert
                message={denoised ? "Khử nhiễu thành công" : "Không thực hiện khử nhiễu"}
                description={message}
                type={denoised ? "success" : "info"}
                showIcon
                icon={<ExperimentOutlined />}
                style={{ marginBottom: 24 }}
            />

            {denoised && (
                <>
                    <Row gutter={[24, 24]} align="middle">
                        {/* --- CỘT TRÁI: ẢNH GỐC (BEFORE) --- */}
                        <Col xs={24} md={11}>
                            <Card 
                                title={<Tag color="default">ẢNH GỐC (BEFORE)</Tag>} 
                                bordered={true}
                                size="small"
                                bodyStyle={{ padding: 0 }}
                            >
                                <div style={{ 
                                    height: 300, 
                                    background: '#fafafa', 
                                    display: 'flex', 
                                    alignItems: 'center', 
                                    justifyContent: 'center',
                                    overflow: 'hidden'
                                }}>
                                    {originalPreviewUrl ? (
                                        <Image 
                                            src={originalPreviewUrl} 
                                            height={280} 
                                            style={{ objectFit: 'contain' }} 
                                        />
                                    ) : (
                                        <div style={{ textAlign: 'center', color: '#999' }}>
                                            <FilePdfOutlined style={{ fontSize: 48, marginBottom: 8 }} />
                                            <div>File PDF/Gốc</div>
                                            <div style={{ fontSize: 12 }}>(Không hỗ trợ xem trước)</div>
                                        </div>
                                    )}
                                </div>
                                <div style={{ padding: '8px', textAlign: 'center', borderTop: '1px solid #f0f0f0' }}>
                                    <Text type="secondary">Size: {(originalSize / 1024).toFixed(2)} KB</Text>
                                </div>
                            </Card>
                        </Col>

                        {/* --- MŨI TÊN ĐIỀU HƯỚNG --- */}
                        <Col xs={24} md={2} style={{ textAlign: 'center' }}>
                            <ArrowRightOutlined style={{ fontSize: 24, color: '#1890ff' }} />
                        </Col>

                        {/* --- CỘT PHẢI: ẢNH SAU XỬ LÝ (AFTER) --- */}
                        <Col xs={24} md={11}>
                            <Card 
                                title={<Tag color="success">AI RESTORMER (AFTER)</Tag>} 
                                bordered={true}
                                size="small"
                                bodyStyle={{ padding: 0 }}
                                style={{ borderColor: '#b7eb8f' }}
                            >
                                <div style={{ 
                                    height: 300, 
                                    background: '#f6ffed', 
                                    display: 'flex', 
                                    alignItems: 'center', 
                                    justifyContent: 'center',
                                    overflow: 'hidden'
                                }}>
                                    {isPdf ? (
                                        <div style={{ textAlign: 'center', color: '#52c41a' }}>
                                            <FilePdfOutlined style={{ fontSize: 48, marginBottom: 8 }} />
                                            <div>File PDF Đã Xử Lý</div>
                                            <div>(Đã ghép trang)</div>
                                        </div>
                                    ) : (
                                        denoiseDownloadUrl ? (
                                            <Image 
                                                src={denoiseDownloadUrl} 
                                                height={280} 
                                                style={{ objectFit: 'contain' }} 
                                            />
                                        ) : <Empty description="Lỗi tải ảnh" />
                                    )}
                                </div>
                                <div style={{ padding: '8px', textAlign: 'center', borderTop: '1px solid #f0f0f0' }}>
                                    <Text strong style={{ color: '#52c41a' }}>Size: {(denoisedSize / 1024).toFixed(2)} KB</Text>
                                </div>
                            </Card>
                        </Col>
                    </Row>

                    {/* --- NÚT TẢI VỀ --- */}
                    <div style={{ marginTop: 24, textAlign: 'center' }}>
                        <Space>
                            <Button 
                                type="primary" 
                                size="large"
                                icon={<DownloadOutlined />} 
                                href={denoiseDownloadUrl} 
                                target="_blank"
                            >
                                Tải kết quả xử lý ({isPdf ? 'PDF' : 'Ảnh'})
                            </Button>
                            <Text type="secondary" style={{ marginLeft: 10 }}>
                                Model sử dụng: <Tag>{modelUsed}</Tag>
                            </Text>
                        </Space>
                    </div>
                </>
            )}
        </div>
    );
};

export default DenoiseViewer;