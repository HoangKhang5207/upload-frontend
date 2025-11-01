import React from 'react';
import { Result, Button, Spin, Descriptions, Typography } from 'antd';
import { EyeOutlined, RedoOutlined } from '@ant-design/icons';

const { Text } = Typography;

const PaymentResult = ({ result, onViewDocument, onRetry }) => {
    // Điều kiện bảo vệ (giữ nguyên)
    if (!result) {
        return (
            <div style={{ textAlign: 'center', padding: '40px' }}>
                <Spin tip="Đang chờ kết quả thanh toán..." size="large" />
            </div>
        );
    }

    const { success, message, transactionId } = result;

    return (
        <Result
            status={success ? "success" : "error"}
            title={success ? "Thanh toán thành công!" : "Thanh toán thất bại"}
            subTitle={message}
            extra={
                success ? (
                    <Button 
                        type="primary" 
                        size="large" 
                        icon={<EyeOutlined />}
                        onClick={onViewDocument}
                    >
                        Xem tài liệu ngay
                    </Button>
                ) : (
                    <Button 
                        type="primary" 
                        size="large" 
                        icon={<RedoOutlined />}
                        onClick={onRetry} // Giả sử onRetry được truyền từ PaywallFlow
                    >
                        Thử lại
                    </Button>
                )
            }
        >
            {success && transactionId && (
                <Descriptions bordered column={1} size="small" style={{maxWidth: 400, margin: '0 auto'}}>
                    <Descriptions.Item label="Mã giao dịch">
                        <Text code>{transactionId}</Text>
                    </Descriptions.Item>
                </Descriptions>
            )}
        </Result>
    );
};

export default PaymentResult;