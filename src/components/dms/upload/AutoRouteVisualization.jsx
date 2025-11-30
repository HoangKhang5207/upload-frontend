import React from 'react';
import { Card, Alert, Timeline, Tag, Typography, Row, Col, Steps, Spin } from 'antd';
import { RobotOutlined, SendOutlined, ClockCircleOutlined } from '@ant-design/icons';

const { Text } = Typography;

const AutoRouteVisualization = ({ routeInfo, docInfo }) => {
        if (!routeInfo || !routeInfo.triggered) {
            return (
                <Alert 
                    message="Tài liệu được lưu ở trạng thái Nháp (Draft)" 
                    description="Không có quy tắc luân chuyển tự động nào khớp với metadata của tài liệu này."
                    type="warning" 
                    showIcon
                />
            );
        }

        const { workflow } = routeInfo;

        return (
            <Card 
            title={<span style={{color: '#1677ff'}}><RobotOutlined /> Kết quả Auto-Route</span>} 
            bordered={true} 
            style={{ marginTop: 16, borderColor: '#91caff' }}
            headStyle={{ backgroundColor: '#e6f4ff' }}
            >
            <Row gutter={24}>
                <Col span={12}>
                <Timeline
                    items={[
                    {
                        color: 'green',
                        children: (
                        <>
                            <Text strong>1. Phân tích Metadata</Text><br/>
                            <Text type="secondary">Danh mục - Category: {docInfo.category_name || '...'}</Text><br/>
                            <Text type="secondary">Các từ khóa - Tags: {docInfo.tags_json || 'None'}</Text>
                        </>
                        ),
                    },
                    {
                        color: 'blue',
                        children: (
                        <>
                            <Text strong>2. Tìm thấy Quy tắc khớp (Rule Match)</Text><br/>
                            <Tag color="blue">Độ ưu tiên: {workflow.priority || 'Normal'}</Tag>
                        </>
                        ),
                    },
                    {
                        color: 'purple',
                        dot: <SendOutlined style={{ fontSize: '16px' }} />,
                        children: (
                        <>
                            <Text strong>3. Kích hoạt Workflow</Text><br/>
                            <Text code>{workflow.name}</Text><br/>
                            <Text>Chuyển đến nhóm: <Tag color="purple">{workflow.candidate_group}</Tag></Text>
                        </>
                        ),
                    },
                    ]}
                />
                </Col>
                <Col span={12}>
                <Alert
                    message="Trạng thái hiện tại"
                    description={
                    <div style={{marginTop: 8}}>
                        <Steps
                        direction="vertical"
                        size="small"
                        current={1}
                        items={[
                            { title: 'Tải lên', status: 'finish' },
                            { title: 'Xử lý Quy trình', status: 'process', icon: <Spin indicator={<ClockCircleOutlined spin />} /> },
                            { title: 'Phê duyệt', status: 'wait' },
                        ]}
                        />
                        <div style={{marginTop: 16}}>
                        <Text>Thông báo (Notify) đã được gửi đến nhóm <b>{workflow.candidate_group}</b>.</Text>
                        </div>
                    </div>
                    }
                    type="success"
                />
                </Col>
            </Row>
            </Card>
        );
    };

export default AutoRouteVisualization;