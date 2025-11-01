import React, { useState } from 'react';
import { Form, Input, Button, Row, Col, Card, Typography, Alert, Spin } from 'antd';
import { CreditCardOutlined, LockOutlined, UserOutlined, MailOutlined, CalendarOutlined } from '@ant-design/icons';

const { Title, Paragraph, Text } = Typography;

const PaymentGateway = ({ amount, onPayment }) => {
    const [form] = Form.useForm();
    const [isProcessing, setIsProcessing] = useState(false);

    const onFinish = (values) => {
        setIsProcessing(true);
        // Giả lập độ trễ
        setTimeout(() => {
            onPayment(values);
            // setIsProcessing(false) // Không cần vì component cha sẽ chuyển bước
        }, 1500);
    };

    return (
        <div style={{ maxWidth: 450, margin: '0 auto' }}>
            <Title level={3} style={{ textAlign: 'center' }}>Cổng Thanh Toán</Title>
            <Paragraph type="secondary" style={{ textAlign: 'center' }}>
                Nhập thông tin thẻ để hoàn tất giao dịch.
            </Paragraph>
            
            <Spin spinning={isProcessing} tip="Đang xử lý thanh toán...">
                <Card>
                    <Alert
                        message={
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <Text strong>Số tiền thanh toán:</Text>
                                <Text strong style={{ fontSize: '20px', color: '#1677ff' }}>
                                    {amount.toLocaleString('vi-VN')} VNĐ
                                </Text>
                            </div>
                        }
                        type="info"
                        style={{ marginBottom: 24 }}
                    />
                    
                    <Form form={form} layout="vertical" onFinish={onFinish}>
                        <Form.Item
                            name="email"
                            label="Email nhận hóa đơn"
                            rules={[{ required: true, type: 'email', message: 'Vui lòng nhập email hợp lệ!' }]}
                        >
                            <Input prefix={<MailOutlined />} placeholder="your.email@example.com" />
                        </Form.Item>
                        
                        <Form.Item
                            name="number"
                            label="Số thẻ"
                            rules={[{ required: true, message: 'Vui lòng nhập số thẻ!' }]}
                        >
                            <Input prefix={<CreditCardOutlined />} placeholder="0000 0000 0000 0000" />
                        </Form.Item>

                        <Form.Item
                            name="name"
                            label="Tên trên thẻ"
                            rules={[{ required: true, message: 'Vui lòng nhập tên trên thẻ!' }]}
                        >
                            <Input prefix={<UserOutlined />} placeholder="NGUYEN VAN A" />
                        </Form.Item>

                        <Row gutter={16}>
                            <Col span={12}>
                                <Form.Item
                                    name="expiry"
                                    label="Ngày hết hạn"
                                    rules={[{ required: true, message: 'Nhập MM/YY!' }]}
                                >
                                    <Input prefix={<CalendarOutlined />} placeholder="MM/YY" />
                                </Form.Item>
                            </Col>
                            <Col span={12}>
                                <Form.Item
                                    name="cvc"
                                    label="CVC"
                                    rules={[{ required: true, message: 'Nhập CVC!' }]}
                                >
                                    <Input.Password prefix={<LockOutlined />} placeholder="123" maxLength={3} />
                                </Form.Item>
                            </Col>
                        </Row>

                        <Form.Item style={{ marginBottom: 0 }}>
                            <Button 
                                type="primary"
                                htmlType="submit"
                                loading={isProcessing}
                                size="large"
                                icon={<CreditCardOutlined />}
                                style={{ width: '100%' }}
                            >
                                {isProcessing ? 'Đang xử lý...' : 'Thanh toán'}
                            </Button>
                        </Form.Item>
                    </Form>
                </Card>
            </Spin>
            <Paragraph type="secondary" style={{ fontSize: 12, marginTop: 16, textAlign: 'center' }}>
                <LockOutlined /> Giao dịch của bạn được mã hóa và bảo mật.
            </Paragraph>
        </div>
    );
};

export default PaymentGateway;