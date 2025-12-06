import React from 'react';
import { Card, Descriptions, Tag, Typography, List, Collapse, Alert, Avatar } from 'antd';
import { UserOutlined, SafetyCertificateOutlined, TeamOutlined, DeploymentUnitOutlined, IdcardOutlined } from '@ant-design/icons';
import { useAuth } from '../../../contexts/AuthContext';

const { Text, Title } = Typography;
const { Panel } = Collapse;

const UserInfoPanel = () => {
    const { user, isAuthenticated } = useAuth();

    if (!isAuthenticated || !user) {
        return (
            <Card style={{ height: '100%' }}>
                <Alert
                    message="Chưa đăng nhập"
                    description="Vui lòng đăng nhập để xem thông tin người dùng."
                    type="warning"
                    showIcon
                />
            </Card>
        );
    }

    // Fallback display if specific fields aren't populated yet (e.g., waiting for backend update)
    const displayName = user.full_name || `${user.last_name || ''} ${user.first_name || ''}`.trim() || user.email;
    const deptName = user.department_name || (user.department_id ? `Department ID: ${user.department_id}` : 'Chưa cập nhật');
    const positionName = user.position_name || 'Chưa cập nhật';
    const roles = user.roles || [];
    const permissions = user.permissions || [];

    return (
        <Card
            title={<span><UserOutlined /> Thông tin người dùng</span>}
            style={{ height: '100%', overflowY: 'auto' }}
            bordered={false}
            headStyle={{ borderBottom: '1px solid #f0f0f0' }}
            bodyStyle={{ padding: '16px' }}
        >
            <div style={{ textAlign: 'center', marginBottom: 20 }}>
                <Avatar size={64} icon={<UserOutlined />} style={{ backgroundColor: '#1890ff', marginBottom: 10 }} />
                <Title level={4} style={{ margin: 0 }}>{displayName}</Title>
                <Text type="secondary">{user.email}</Text>
            </div>

            <Descriptions column={1} size="small" bordered>
                <Descriptions.Item label={<span><DeploymentUnitOutlined /> Phòng ban</span>}>
                    <Text strong>{deptName}</Text>
                </Descriptions.Item>
                <Descriptions.Item label={<span><IdcardOutlined /> Chức vụ</span>}>
                    <Text strong>{positionName}</Text>
                </Descriptions.Item>
                <Descriptions.Item label={<span><TeamOutlined /> Vai trò</span>}>
                    {roles.length > 0 ? (
                        roles.map((role, index) => (
                            <Tag color="blue" key={index} style={{ marginBottom: 4 }}>{role}</Tag>
                        ))
                    ) : (
                        <Text type="secondary">Không có vai trò</Text>
                    )}
                </Descriptions.Item>
            </Descriptions>

            <div style={{ marginTop: 20 }}>
                <Collapse ghost size="small">
                    <Panel header={<span><SafetyCertificateOutlined /> Danh sách quyền hạn ({permissions.length})</span>} key="1">
                        {permissions.length > 0 ? (
                            <List
                                dataSource={permissions}
                                renderItem={(item) => (
                                    <List.Item style={{ padding: '8px 0' }}>
                                        <Text style={{ fontSize: '14px' }}><SafetyCertificateOutlined style={{ fontSize: '14px', color: '#52c41a', marginRight: 8 }} /> {item}</Text>
                                    </List.Item>
                                )}
                                style={{ maxHeight: '300px', overflowY: 'auto' }}
                            />
                        ) : (
                            <Text type="secondary" style={{ fontStyle: 'italic', fontSize: '12px' }}>Không có quyền hạn cụ thể</Text>
                        )}
                    </Panel>
                </Collapse>
            </div>
        </Card>
    );
};

export default UserInfoPanel;
