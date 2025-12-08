import React from 'react';
import { Card, Descriptions, Tag, Space, Typography } from 'antd';
import {
    FileTextOutlined,
    NumberOutlined,
    CalendarOutlined,
    UserOutlined,
    TagOutlined,
    BarChartOutlined
} from '@ant-design/icons';

const { Text } = Typography;

const AnalysisResult = ({ suggestedMetadata }) => {
    if (!suggestedMetadata || Object.keys(suggestedMetadata).length === 0) return null;

    // Hàm xác định icon phù hợp cho từng loại key
    const getFieldIcon = (key) => {
        const keyLower = key.toLowerCase();
        if (keyLower.includes('date') || keyLower.includes('ngày')) {
            return <CalendarOutlined style={{ color: '#722ed1' }} />;
        }
        if (keyLower.includes('name') || keyLower.includes('tên')) {
            return <UserOutlined style={{ color: '#13c2c2' }} />;
        }
        if (keyLower.includes('number') || keyLower.includes('số')) {
            return <NumberOutlined style={{ color: '#fa8c16' }} />;
        }
        if (keyLower.includes('type') || keyLower.includes('loại')) {
            return <TagOutlined style={{ color: '#52c41a' }} />;
        }
        return <FileTextOutlined style={{ color: '#1890ff' }} />;
    };

    // Hàm định dạng giá trị
    const formatValue = (value) => {
        if (value === null || value === undefined) return 'Không có dữ liệu';
        if (typeof value === 'object') return JSON.stringify(value);
        return value;
    };

    return (
        <Space direction="vertical" style={{ width: '100%' }} size="middle">
            <Card 
                title={
                    <Space>
                        <BarChartOutlined />
                        <span>Kết quả phân tích</span>
                    </Space>
                } 
                size="small" 
                headStyle={{ backgroundColor: '#fafafa' }}
            >
                <Descriptions 
                    bordered 
                    size="small" 
                    column={1}
                    labelStyle={{ 
                        fontWeight: 600,
                        width: '200px',
                        backgroundColor: '#fafafa'
                    }}
                >
                    {Object.entries(suggestedMetadata).map(([key, value]) => (
                        <Descriptions.Item 
                            key={key} 
                            label={
                                <Space>
                                    {getFieldIcon(key)}
                                    <span>{key}</span>
                                </Space>
                            }
                        >
                            {Array.isArray(value) ? (
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                                    {value.map((item, index) => (
                                        <Tag color="blue" key={index}>
                                            {formatValue(item)}
                                        </Tag>
                                    ))}
                                </div>
                            ) : (
                                <span>{formatValue(value)}</span>
                            )}
                        </Descriptions.Item>
                    ))}
                </Descriptions>
            </Card>
            
            {/* Phần nội dung xem */}
            <Card 
                title="Nội dung xem" 
                size="small" 
                style={{ backgroundColor: '#f9f9f9' }}
            >
                <Text>
                    Đã trích xuất thành công {Object.keys(suggestedMetadata).length} trường thông tin từ tài liệu.
                    Các thông tin này bao gồm: {Object.keys(suggestedMetadata).join(', ')}.
                    Bạn có thể xem chi tiết các giá trị đã được trích xuất ở trên và chỉnh sửa nếu cần.
                </Text>
            </Card>
        </Space>
    );
};

export default AnalysisResult;
