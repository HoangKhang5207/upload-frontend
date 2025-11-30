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

const { Text, Title, Paragraph } = Typography;
const { Panel } = Collapse;

const ProcessingResultDetails = ({ apiResponse }) => {
    if (!apiResponse) return null;

    const { denoiseInfo, suggestedMetadata, conflicts, warnings, watermarkInfo } = apiResponse;

    return (
        <Space direction="vertical" style={{ width: '100%' }} size="large">
            <Title level={4}>Chi tiết Kết quả Xử lý</Title>
            
            {/* 1. Kết quả Khử nhiễu ảnh (AI) */}
            {denoiseInfo && (
                <Card title="Khử nhiễu ảnh (AI)" size="small" headStyle={{backgroundColor: '#fafafa'}}>
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
                        />
                    )}
                </Card>
            )}

            {/* 2. Gợi ý & Trích xuất Key-Values */}
            <Card title="Gợi ý & Trích xuất Key-Values" size="small" headStyle={{backgroundColor: '#fafafa'}}>
                 <Text type="secondary">Các cặp Key-Value được nhận dạng:</Text>
                <pre style={{ 
                    backgroundColor: '#282c34', 
                    color: '#abb2bf', 
                    padding: '12px', 
                    borderRadius: '4px', 
                    marginTop: 8, 
                    maxHeight: 150, 
                    overflowY: 'auto' 
                }}>
                    {JSON.stringify(suggestedMetadata?.key_values || { "Info": "Không trích xuất được Key-Values." }, null, 2)}
                </pre>
            </Card>
            
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

             {/* 5. Kết quả Nhúng watermark bảo vệ */}
            {watermarkInfo && (
                <Card title="Nhúng Watermark bảo vệ" size="small" headStyle={{backgroundColor: '#fafafa'}}>
                     <Alert
                        message={watermarkInfo.message}
                        type="success"
                        showIcon
                        icon={<SafetyCertificateOutlined />}
                    />
                </Card>
            )}
        </Space>
    );
};

export default ProcessingResultDetails;