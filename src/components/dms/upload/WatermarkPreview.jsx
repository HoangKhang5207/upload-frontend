import React from 'react';
import { Card, Alert, Typography, Space } from 'antd';
import { SafetyCertificateOutlined, EyeOutlined } from '@ant-design/icons';

const { Text } = Typography;

const WatermarkPreview = ({ watermarkInfo }) => {
    if (!watermarkInfo) return null;

    return (
        <Space direction="vertical" style={{ width: '100%' }} size="middle">
            <Card 
                title={
                    <Space>
                        <EyeOutlined />
                        <span>Xem trước Watermark</span>
                    </Space>
                } 
                size="small" 
                headStyle={{ backgroundColor: '#fafafa' }}
            >
                <Alert
                    message={watermarkInfo.message}
                    type="success"
                    showIcon
                    icon={<SafetyCertificateOutlined />}
                />
            </Card>
            
            {/* Phần nội dung xem */}
            <Card 
                title="Nội dung xem" 
                size="small" 
                style={{ backgroundColor: '#f9f9f9' }}
            >
                <Text>
                    Watermark sẽ được nhúng vào tài liệu để bảo vệ bản quyền. 
                    {watermarkInfo.type && ` Loại watermark: ${watermarkInfo.type}`}
                    {watermarkInfo.position && ` Vị trí: ${watermarkInfo.position}`}
                </Text>
            </Card>
        </Space>
    );
};

export default WatermarkPreview;
