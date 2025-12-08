import React from 'react';
import { Card, Alert, Typography, Space } from 'antd';
import { ExperimentOutlined, CheckCircleOutlined, FileTextOutlined } from '@ant-design/icons';

const { Text } = Typography;

const OcrContent = ({ denoiseInfo }) => {
    if (!denoiseInfo) return null;

    return (
        <Space direction="vertical" style={{ width: '100%' }} size="middle">
            <Card 
                title={
                    <Space>
                        <FileTextOutlined />
                        <span>Nội dung OCR</span>
                    </Space>
                } 
                size="small" 
                headStyle={{ backgroundColor: '#fafafa' }}
            >
                {denoiseInfo.denoised ? (
                    <Alert
                        message={denoiseInfo.message}
                        description={<Text code>Model: {denoiseInfo.modelUsed}</Text>}
                        type="success"
                        showIcon
                        icon={<ExperimentOutlined />}
                    />
                ) : (
                    <Alert
                        message={denoiseInfo.message}
                        type="info"
                        showIcon
                        icon={<CheckCircleOutlined />}
                    />
                )}
            </Card>
            
            {/* Phần nội dung xem */}
            <Card 
                title="Nội dung xem" 
                size="small" 
                style={{ backgroundColor: '#f9f9f9' }}
            >
                <Text>
                    {denoiseInfo.denoised 
                        ? `Đã xử lý ảnh bằng AI model ${denoiseInfo.modelUsed} để cải thiện chất lượng OCR.`
                        : 'Tài liệu không cần xử lý khử nhiễu, OCR sẽ thực hiện trực tiếp trên tài liệu gốc.'
                    }
                    {denoiseInfo.confidence && ` Độ tin cậy: ${denoiseInfo.confidence}%`}
                    {denoiseInfo.pages && ` Số trang đã xử lý: ${denoiseInfo.pages}`}
                </Text>
            </Card>
        </Space>
    );
};

export default OcrContent;
