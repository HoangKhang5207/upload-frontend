import React from 'react';
import { Card, Descriptions, Typography, Tag, Progress, Space, Divider, Alert } from 'antd';
import { WarningOutlined, FileTextOutlined, UserOutlined, PercentageOutlined } from '@ant-design/icons';

const { Text, Paragraph } = Typography;

const DuplicateAnalysis = ({ duplicateError }) => {
    if (!duplicateError || !duplicateError.duplicateData) return null;

    const { similarity, existingDocument, highlight, type, message } = duplicateError.duplicateData;
    
    // Parse similarity string "85.5%" -> number 85.5
    const percent = parseFloat(similarity?.replace('%', '')) || 0;
    
    // Màu sắc cảnh báo dựa trên độ trùng
    const statusColor = percent > 80 ? 'red' : percent > 50 ? 'orange' : 'gold';

    return (
        <Card 
            title={<span style={{color: '#faad14'}}><WarningOutlined /> Kết quả kiểm tra trùng lặp</span>}
            style={{ marginTop: 16, borderColor: '#faad14' }}
            headStyle={{ backgroundColor: '#fffbe6' }}
            size="small"
        >
            <Space direction="vertical" style={{ width: '100%' }}>
                <Alert message={message} type="warning" showIcon />

                <div style={{ display: 'flex', gap: '24px', marginTop: 12 }}>
                    {/* Cột 1: Chỉ số tương đồng */}
                    <div style={{ textAlign: 'center', width: '120px' }}>
                        <Progress type="circle" percent={percent} status="exception" width={80} strokeColor={statusColor} />
                        <div style={{marginTop: 8}}><Tag color={statusColor}>Mức độ trùng</Tag></div>
                    </div>

                    {/* Cột 2: Thông tin tài liệu gốc */}
                    <Descriptions column={1} size="small" style={{ flex: 1 }} bordered>
                        <Descriptions.Item label={<Space><FileTextOutlined /> Tài liệu gốc</Space>}>
                            <Text strong>{existingDocument?.name || 'N/A'}</Text>
                        </Descriptions.Item>
                        <Descriptions.Item label={<Space><UserOutlined /> Người tạo</Space>}>
                            {existingDocument?.owner || 'System'}
                        </Descriptions.Item>
                        <Descriptions.Item label="Phương pháp kiểm tra">
                            <Tag>{type === 'image_hash' ? 'So sánh ảnh (Perceptual Hash)' : 'So sánh ngữ nghĩa (Semantic)'}</Tag>
                        </Descriptions.Item>
                    </Descriptions>
                </div>

                {/* Phần hiển thị đoạn văn bản trùng (Highlight) */}
                {highlight && (
                    <>
                        <Divider plain style={{ margin: '12px 0' }}>Đoạn trùng lặp phát hiện được</Divider>
                        <div style={{ 
                            background: '#f5f5f5', 
                            padding: '12px', 
                            borderRadius: '6px', 
                            borderLeft: '4px solid #faad14',
                            fontStyle: 'italic',
                            maxHeight: '150px',
                            overflowY: 'auto'
                        }}>
                            <Paragraph style={{ marginBottom: 0 }}>
                                <div dangerouslySetInnerHTML={{ __html: highlight }} />
                            </Paragraph>
                        </div>
                    </>
                )}
            </Space>
        </Card>
    );
};

export default DuplicateAnalysis;