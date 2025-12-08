import React from 'react';
import { Card, Alert, List, Tag, Typography, Space, Collapse } from 'antd';
import {
    CheckCircleOutlined,
    WarningOutlined,
    InfoCircleOutlined,
    BugOutlined,
    FileTextOutlined,
    ExperimentOutlined,
    SafetyCertificateOutlined,
    StopOutlined
} from '@ant-design/icons';

// Import các component mới
import WatermarkPreview from './WatermarkPreview';
import OcrContent from './OcrContent';
import AnalysisResult from './AnalysisResult';

const { Text, Title, Paragraph } = Typography;
const { Panel } = Collapse;

const ProcessingResultDetails = ({ apiResponse }) => {
    if (!apiResponse) return null;

    const { denoiseInfo, suggestedMetadata, conflicts, warnings, watermarkInfo } = apiResponse;

    return (
        <Space direction="vertical" style={{ width: '100%' }} size="large">
            <Title level={4}>Chi tiết Kết quả Xử lý</Title>
            
            {/* Phần 1: Xem trước Watermark */}
            <WatermarkPreview watermarkInfo={watermarkInfo} />

            {/* Phần 2: Nội dung OCR */}
            <OcrContent denoiseInfo={denoiseInfo} />

            {/* Phần 3: Kết quả phân tích */}
            <AnalysisResult suggestedMetadata={suggestedMetadata?.key_values || suggestedMetadata} />
            
            {/* 3. Kết quả Kiểm tra mâu thuẫn dữ liệu */}
            {conflicts && conflicts.length > 0 && (
                <Card 
                    title={<span style={{color: '#cf1322'}}><BugOutlined /> Mâu thuẫn dữ liệu</span>} 
                    size="small"
                    headStyle={{backgroundColor: '#fff1f0', borderColor: '#ffa39e'}}
                    style={{borderColor: '#ffa39e'}}
                >
                    <List
                        size="small"
                        dataSource={conflicts}
                        renderItem={item => (
                            <List.Item>
                                <Text type="danger"><WarningOutlined /> {item.message || item}</Text>
                            </List.Item>
                        )}
                    />
                </Card>
            )}

            {/* 4. Cảnh báo thiếu thông tin (UC-73) */}
            {warnings && warnings.length > 0 && (
                <Collapse ghost size="small">
                    <Panel header={<Text type="warning"><WarningOutlined /> {warnings.length} Cảnh báo thiếu dữ liệu</Text>} key="1">
                        <List
                            size="small"
                            dataSource={warnings}
                            renderItem={item => (
                                <List.Item>
                                    <Text type="secondary">{item.message}</Text>
                                </List.Item>
                            )}
                        />
                    </Panel>
                </Collapse>
            )}
        </Space>
    );
};

export default ProcessingResultDetails;