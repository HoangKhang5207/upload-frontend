import React from 'react';
import { Card, Alert, Input, Typography, Space } from 'antd';
import {
    CheckCircleOutlined,
    WarningOutlined,
    FileTextOutlined,
    ExperimentOutlined,
    SafetyCertificateOutlined,
    StopOutlined
} from '@ant-design/icons';

const { Text, Title, Paragraph } = Typography;
const { TextArea } = Input;

const ProcessingResultDetails = ({ apiResponse }) => {
    if (!apiResponse) return null;

    const { denoiseInfo, ocrContent, suggestedMetadata, conflicts, watermarkInfo } = apiResponse;

    return (
        <Space direction="vertical" style={{ width: '100%' }} size="large">
            <Title level={4}>Chi tiết Kết quả Xử lý Backend</Title>
            
            {/* 1. Kết quả Khử nhiễu ảnh (AI) */}
            {denoiseInfo && (
                <Card title="1. Khử nhiễu ảnh (AI)" size="small" headStyle={{backgroundColor: '#fafafa'}}>
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

            {/* 2. Kết quả OCR & Trích xuất văn bản */}
            <Card title="2. OCR & Trích xuất văn bản" size="small" headStyle={{backgroundColor: '#fafafa'}}>
                <Text type="secondary">Nội dung đã trích xuất:</Text>
                <TextArea
                    readOnly
                    value={ocrContent || "Không có nội dung được trích xuất."}
                    rows={4}
                    style={{ marginTop: 8, backgroundColor: '#f5f5f5', color: '#555' }}
                />
            </Card>

            {/* 4. Gợi ý & Trích xuất Key-Values */}
            <Card title="4. Gợi ý & Trích xuất Key-Values" size="small" headStyle={{backgroundColor: '#fafafa'}}>
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
            
            {/* 5. Kết quả Kiểm tra mâu thuẫn dữ liệu */}
            <Card title="5. Kiểm tra mâu thuẫn dữ liệu" size="small" headStyle={{backgroundColor: '#fafafa'}}>
                {conflicts && conflicts.length > 0 ? (
                    <Alert
                        message={`Phát hiện ${conflicts.length} mâu thuẫn:`}
                        description={
                            <ul>
                                {conflicts.map((c, i) => (
                                    <li key={i}>
                                        Trường "<strong>{c.field}</strong>" (<em>{c.value}</em>): {c.message}
                                    </li>
                                ))}
                            </ul>
                        }
                        type="error"
                        showIcon
                        icon={<WarningOutlined />}
                    />
                ) : (
                     <Alert
                        message="Không phát hiện mâu thuẫn dữ liệu nào."
                        type="success"
                        showIcon
                        icon={<CheckCircleOutlined />}
                    />
                )}
            </Card>

             {/* 6. Kết quả Nhúng watermark bảo vệ */}
            {watermarkInfo && (
                <Card title="6. Nhúng Watermark bảo vệ" size="small" headStyle={{backgroundColor: '#fafafa'}}>
                     <Alert
                        message={watermarkInfo.message}
                        description={<Text>File đã nhúng: <Text code>{watermarkInfo.watermarkedFile?.name || "Không có thông tin file"}</Text></Text>}
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