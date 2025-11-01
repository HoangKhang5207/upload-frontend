import React from 'react';
import { Card, Button, Typography, Descriptions, Alert, Space } from 'antd';
import { ArrowLeftOutlined, CheckCircleOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;

const PaymentConfirmation = ({ document, selectedPackage, onConfirm, onBack }) => {
    // Điều kiện bảo vệ (giữ nguyên)
    if (!selectedPackage) {
        return (
            <Alert
                message="Lỗi: Không có gói thanh toán nào được chọn."
                type="error"
                showIcon
                action={
                    <Button size="small" type="primary" onClick={onBack}>
                        Quay lại
                    </Button>
                }
            />
        );
    }

    return (
        <div style={{ maxWidth: 600, margin: '0 auto' }}>
            <Title level={3} style={{ textAlign: 'center' }}>Xác nhận thanh toán</Title>
            
            <Card style={{ marginTop: 24 }}>
                <Descriptions bordered column={1}>
                    <Descriptions.Item label="Tài liệu">
                        <Text strong>{document.name}</Text>
                    </Descriptions.Item>
                    <Descriptions.Item label="Gói đã chọn">
                        <Text strong>{selectedPackage.name}</Text>
                        <br/>
                        <Text type="secondary">{selectedPackage.description}</Text>
                    </Descriptions.Item>
                    <Descriptions.Item label="Tổng cộng">
                        <Text strong style={{ fontSize: '24px', color: '#1677ff' }}>
                            {selectedPackage.price.toLocaleString('vi-VN')} VNĐ
                        </Text>
                    </Descriptions.Item>
                </Descriptions>
            </Card>

            <Space style={{ marginTop: 24, display: 'flex', justifyContent: 'space-between' }}>
                <Button 
                    icon={<ArrowLeftOutlined />}
                    onClick={onBack} 
                >
                    Quay lại chọn gói
                </Button>
                
                <Button 
                    type="primary"
                    size="large"
                    icon={<CheckCircleOutlined />}
                    onClick={onConfirm} 
                >
                    Xác nhận & Thanh toán
                </Button>
            </Space>
        </div>
    );
};

export default PaymentConfirmation;