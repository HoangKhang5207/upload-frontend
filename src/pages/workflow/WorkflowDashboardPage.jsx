import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Row, 
  Col, 
  Card, 
  Statistic, 
  Table, 
  List, 
  Typography, 
  Tag, 
  Avatar,
  Space,
  Button
} from 'antd';
import { 
  FileTextOutlined, 
  EditOutlined, 
  PlayCircleOutlined,
  UnorderedListOutlined,
  LineChartOutlined, // Thay thế ArrowTrendingUpIcon
  CalendarOutlined,
  UsergroupAddOutlined, // Thay thế UserGroupIcon
  SyncOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined
} from '@ant-design/icons';
import * as mockWorkflowApi from '../../api/mockWorkflowApi';
import WorkflowNavigation from '../../components/workflow/WorkflowNavigation'; // Đã refactor
import { useWorkflow } from '../../contexts/WorkflowContext';
import WorkflowLoading from '../../components/workflow/WorkflowLoading'; // Đã refactor

const { Title, Text, Paragraph } = Typography;

// Dữ liệu stats với icon của Antd
const stats = [
  { id: 1, name: 'Tổng số quy trình', value: '12', icon: <FileTextOutlined />, color: '#1677ff' },
  { id: 2, name: 'Quy trình đang chạy', value: '5', icon: <LineChartOutlined />, color: '#52c41a' },
  { id: 3, name: 'Quy trình đã hoàn thành', value: '42', icon: <CalendarOutlined />, color: '#722ed1' },
  { id: 4, name: 'Người dùng', value: '24', icon: <UsergroupAddOutlined />, color: '#faad14' },
];

const recentWorkflows = [
  { id: 1, name: 'Quy trình xử lý văn bản đi', status: 'running', assignee: 'Nguyễn Văn A', dueDate: '2023-05-20' },
  { id: 2, name: 'Quy trình phê duyệt hợp đồng', status: 'completed', assignee: 'Trần Thị B', dueDate: '2023-05-18' },
  { id: 3, name: 'Quy trình xử lý đơn nghỉ phép', status: 'pending', assignee: 'Lê Văn C', dueDate: '2023-05-22' },
];

// Dữ liệu mock cho Hoạt động gần đây
const recentActivity = [
    { id: 1, user: 'Nguyễn Văn A', action: 'Đã cập nhật quy trình xử lý văn bản đi', time: '2 giờ trước', icon: <EditOutlined />, color: 'blue' },
    { id: 2, user: 'Trần Thị B', action: 'Đã khởi tạo quy trình phê duyệt hợp đồng', time: '5 giờ trước', icon: <PlayCircleOutlined />, color: 'green' },
];

// Dữ liệu mock cho Hành động nhanh
const quickActions = [
    { name: 'Danh sách Workflow', href: '/workflow-list', icon: <UnorderedListOutlined /> },
    { name: 'Thiết kế Workflow', href: '/bpmn-modeler', icon: <EditOutlined /> },
    { name: 'Khởi tạo quy trình', href: '/start-workflow/1', icon: <PlayCircleOutlined /> },
    { name: 'Quản lý Workflow', href: '/workflow-management', icon: <FileTextOutlined /> },
];

const getStatusBadge = (status) => {
  switch (status) {
    case 'running':
      return <Tag icon={<SyncOutlined spin />} color="processing">Đang chạy</Tag>;
    case 'completed':
      return <Tag icon={<CheckCircleOutlined />} color="success">Đã hoàn thành</Tag>;
    case 'pending':
      return <Tag icon={<ClockCircleOutlined />} color="warning">Chờ xử lý</Tag>;
    default:
      return <Tag color="default">Không xác định</Tag>;
  }
};

const WorkflowDashboardPage = () => {
  const { state, dispatch } = useWorkflow();

  useEffect(() => {
    const fetchWorkflows = async () => {
      dispatch({ type: 'SET_LOADING', payload: true });
      try {
        const data = await mockWorkflowApi.getWorkflows();
        dispatch({ type: 'SET_WORKFLOWS', payload: data });
      } catch (error) {
        console.error('Error fetching workflows:', error);
        dispatch({ type: 'SET_ERROR', payload: 'Có lỗi xảy ra khi tải danh sách quy trình' });
      } finally {
        dispatch({ type: 'SET_LOADING', payload: false });
      }
    };

    fetchWorkflows();
  }, [dispatch]);

  const columns = [
    { title: 'Tên quy trình', dataIndex: 'name', key: 'name', render: (text) => <Text strong>{text}</Text> },
    { title: 'Trạng thái', dataIndex: 'status', key: 'status', render: getStatusBadge },
    { title: 'Người phụ trách', dataIndex: 'assignee', key: 'assignee' },
    { title: 'Ngày hết hạn', dataIndex: 'dueDate', key: 'dueDate' },
  ];

  if (state.loading) {
    return (
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>
        <WorkflowNavigation />
        <WorkflowLoading message="Đang tải bảng điều khiển..." />
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto' }}>
      <WorkflowNavigation />
      
      <div style={{ marginBottom: 24 }}>
        <Title level={3} style={{ margin: 0 }}>Bảng điều khiển Workflow</Title>
        <Text type="secondary">Tổng quan về các quy trình và hoạt động gần đây</Text>
      </div>

      {/* Stats */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        {stats.map((stat) => (
          <Col xs={24} sm={12} lg={6} key={stat.id}>
            <Card>
              <Statistic
                title={stat.name}
                value={stat.value}
                prefix={<Avatar style={{ backgroundColor: stat.color }} icon={stat.icon} />}
              />
            </Card>
          </Col>
        ))}
      </Row>

      <Row gutter={[24, 24]}>
        {/* Recent Workflows */}
        <Col xs={24} lg={16}>
          <Card title="Quy trình gần đây">
            <Table
              columns={columns}
              dataSource={recentWorkflows}
              rowKey="id"
              pagination={false}
              size="small"
            />
          </Card>
        </Col>

        {/* Quick Actions & Recent Activity */}
        <Col xs={24} lg={8}>
          <Space direction="vertical" style={{ width: '100%' }} size="large">
            <Card title="Hành động nhanh">
              <List
                dataSource={quickActions}
                renderItem={(item) => (
                  <List.Item>
                    <Link to={item.href} style={{ width: '100%' }}>
                      <Button icon={item.icon} type="text" style={{ width: '100%', textAlign: 'left' }}>
                        {item.name}
                      </Button>
                    </Link>
                  </List.Item>
                )}
              />
            </Card>

            <Card title="Hoạt động gần đây">
              <List
                dataSource={recentActivity}
                renderItem={(item) => (
                  <List.Item>
                    <List.Item.Meta
                      avatar={<Avatar style={{ backgroundColor: item.color }} icon={item.icon} />}
                      title={<Text strong>{item.user}</Text>}
                      description={
                        <>
                          <Text>{item.action}</Text>
                          <br />
                          <Text type="secondary" style={{ fontSize: 12 }}>{item.time}</Text>
                        </>
                      }
                    />
                  </List.Item>
                )}
              />
            </Card>
          </Space>
        </Col>
      </Row>
    </div>
  );
};

export default WorkflowDashboardPage;