import React, { useState } from 'react';
import { Card, Radio, Button, Typography, Space, Spin, Alert } from 'antd';
import { SafetyCertificateOutlined } from '@ant-design/icons';

const { Title, Paragraph, Text } = Typography;

const PackageSelection = ({ document, packages, onSelectPackage }) => {
    // Điều kiện bảo vệ (giữ nguyên)
    if (!packages) {
        return (
            <div style={{ textAlign: 'center', padding: '40px' }}>
                <Spin tip="Đang tải các gói cước..." size="large" />
            </div>
        );
    }
    
    if (packages.length === 0) {
        return (
             <Alert
                message="Lỗi tải gói cước"
                description="Không tìm thấy gói cước nào cho tài liệu này. Vui lòng thử lại sau."
                type="error"
                showIcon
            />
        );
    }

    // Bug fix từ file gốc: Lấy id của gói đầu tiên làm giá trị mặc định
    const [selectedPackageId, setSelectedPackageId] = useState(packages[0]?.id);

    const handleSelection = () => {
        if (!selectedPackageId) {
            alert("Vui lòng chọn một gói truy cập."); // Sẽ thay bằng message.warning sau
            return;
        }
        const chosenPackageObject = packages.find(p => p.id === selectedPackageId);
        onSelectPackage(chosenPackageObject);
    };

    return (
        <div style={{ maxWidth: 700, margin: '0 auto' }}>
            <div style={{ textAlign: 'center' }}>
                <Title level={3}>{document.name}</Title>
                <Paragraph type="secondary">Tác giả: {document.author} | {document.totalPages} trang</Paragraph>
            </div>
            
            <Card style={{ marginTop: 24 }}>
                <Title level={4}>Chọn gói truy cập</Title>
                <Paragraph type="secondary">Để xem toàn bộ nội dung, vui lòng chọn một trong các gói dưới đây.</Paragraph>
                
                <Radio.Group 
                    onChange={(e) => setSelectedPackageId(e.target.value)} 
                    value={selectedPackageId}
                    style={{ width: '100%' }}
                >
                    <Space direction="vertical" style={{ width: '100%' }}>
                        {packages.map((pkg) => (
                            <Radio 
                                key={pkg.id} 
                                value={pkg.id} 
                                style={{ 
                                    width: '100%', 
                                    padding: '16px', 
                                    border: '1px solid #d9d9d9', 
                                    borderRadius: '8px',
                                    transition: 'all 0.3s'
                                }}
                                className={selectedPackageId === pkg.id ? 'ant-radio-wrapper-checked-custom' : ''}
                            >
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <div>
                                        <Text strong>{pkg.name}</Text>
                                        <br/>
                                        <Text type="secondary">{pkg.description}</Text>
                                    </div>
                                    <Text strong style={{ fontSize: '18px', color: '#1677ff' }}>
                                        {pkg.price.toLocaleString('vi-VN')} VNĐ
                                    </Text>
                                </div>
                            </Radio>
                        ))}
                    </Space>
                </Radio.Group>
            </Card>

            <div style={{ marginTop: 24, textAlign: 'center' }}>
                <Button 
                    type="primary"
                    size="large"
                    onClick={handleSelection} 
                    disabled={!selectedPackageId}
                    style={{ minWidth: 200 }}
                >
                    Tiếp tục
                </Button>
                <Paragraph type="secondary" style={{ fontSize: 12, marginTop: 12 }}>
                    <SafetyCertificateOutlined /> Giao dịch an toàn và bảo mật.
                </Paragraph>
            </div>
            {/* CSS để làm Radio giống Card hơn */}
            <style>{`
                .ant-radio-wrapper-checked-custom {
                    border-color: #1677ff !important;
                    box-shadow: 0 0 0 2px rgba(22, 119, 255, 0.2);
                    background-color: #f0f6ff;
                }
                .ant-radio {
                    display: none; // Ẩn nút radio tròn
                }
            `}</style>
        </div>
    );
};

export default PackageSelection;