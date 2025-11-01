import React from 'react';
import { Link } from 'react-router-dom';
import { 
  ArrowLeftOutlined,
  DashboardOutlined, // Thay thế DocumentTextIcon
  EditOutlined, // Thay thế PencilIcon
  PlayCircleOutlined, // Thay thế PlayIcon
  UnorderedListOutlined // Thay thế ListBulletIcon
} from '@ant-design/icons';
import { Card, Row, Col, Typography, Button, Steps, Alert } from 'antd';
import WorkflowNavigation from '../../components/workflow/WorkflowNavigation';
import { useWorkflow } from '../../contexts/WorkflowContext';
import WorkflowLoading from '../../components/workflow/WorkflowLoading';

const { Title, Paragraph, Text } = Typography;

const WorkflowDocumentationPage = () => {
  const { state } = useWorkflow();
  
  const features = [
    {
      id: 1,
      title: 'Bảng điều khiển Workflow',
      description: 'Tổng quan về các quy trình và hoạt động gần đây trong hệ thống.',
      icon: <DashboardOutlined style={{ fontSize: '24px' }} />,
      path: '/workflow-dashboard'
    },
    {
      id: 2,
      title: 'Danh sách Workflow',
      description: 'Quản lý và xem danh sách tất cả các quy trình đã được tạo.',
      icon: <UnorderedListOutlined style={{ fontSize: '24px' }} />,
      path: '/workflow-list'
    },
    {
      id: 3,
      title: 'Thiết kế Workflow',
      description: 'Tạo và chỉnh sửa các sơ đồ quy trình xử lý tài liệu.',
      icon: <EditOutlined style={{ fontSize: '24px' }} />,
      path: '/bpmn-modeler'
    },
    {
      id: 4,
      title: 'Khởi tạo quy trình',
      description: 'Bắt đầu một quy trình mới dựa trên các sơ đồ đã thiết kế.',
      icon: <PlayCircleOutlined style={{ fontSize: '24px' }} />,
      path: '/start-workflow/1'
    }
  ];

  const steps = [
    {
      title: 'Tạo sơ đồ quy trình',
      description: 'Sử dụng công cụ thiết kế để tạo sơ đồ quy trình xử lý tài liệu.'
    },
    {
      title: 'Xuất bản sơ đồ',
      description: 'Xuất bản sơ đồ để có thể sử dụng trong việc khởi tạo quy trình.'
    },
    {
      title: 'Khởi tạo quy trình',
      description: 'Chọn sơ đồ đã xuất bản và khởi tạo một quy trình mới.'
    },
    {
      title: 'Theo dõi tiến trình',
      description: 'Theo dõi và quản lý các quy trình đang chạy trong hệ thống.'
    }
  ];

  if (state.loading) {
    return (
      <div style={{ maxWidth: 1100, margin: '0 auto' }}>
        <WorkflowNavigation />
        <WorkflowLoading message="Đang tải tài liệu hướng dẫn..." />
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto' }}>
      <WorkflowNavigation />
      
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '24px' }}>
        <Link to="/" style={{ marginRight: '16px', padding: '8px', borderRadius: '50%' }} className="hover:bg-gray-100">
           <ArrowLeftOutlined style={{ fontSize: '20px', color: '#555' }} />
        </Link>
        <div>
          <Title level={3} style={{ margin: 0 }}>Tài liệu hướng dẫn Workflow</Title>
          <Text type="secondary">Hướng dẫn sử dụng các tính năng quản lý workflow</Text>
        </div>
      </div>

      <Card style={{ marginBottom: 24 }}>
        <Title level={4}>Giới thiệu</Title>
        <Paragraph>
          Hệ thống quản lý workflow giúp bạn tạo, quản lý và theo dõi các quy trình xử lý tài liệu 
          trong tổ chức. Với các công cụ trực quan, bạn có thể thiết kế sơ đồ quy trình, khởi tạo 
          các quy trình mới và theo dõi tiến trình của chúng.
        </Paragraph>
        
        <Title level={4} style={{ marginTop: 32 }}>Các tính năng chính</Title>
        <Row gutter={[24, 24]}>
          {features.map((feature) => (
            <Col xs={24} md={12} key={feature.id}>
              <Card hoverable>
                <Card.Meta
                  avatar={feature.icon}
                  title={<Link to={feature.path} style={{color: '#1677ff'}}>{feature.title}</Link>}
                  description={feature.description}
                />
              </Card>
            </Col>
          ))}
        </Row>

        <Title level={4} style={{ marginTop: 32 }}>Hướng dẫn sử dụng</Title>
        <Steps direction="vertical" current={-1} items={steps} />
      </Card>

      <Alert
        message={<Title level={5}>Lưu ý quan trọng</Title>}
        description={
          <ul style={{ paddingLeft: 20, margin: 0 }}>
            <li>Chỉ những sơ đồ đã xuất bản mới có thể được sử dụng để khởi tạo quy trình.</li>
            <li>Hãy đảm bảo nhập đầy đủ thông tin khi tạo hoặc chỉnh sửa sơ đồ quy trình.</li>
            <li>Có thể xem lại và chỉnh sửa các quy trình đã khởi tạo trong phần quản lý workflow.</li>
            <li>Hệ thống tự động lưu phiên làm việc khi bạn thiết kế sơ đồ.</li>
          </ul>
        }
        type="info"
        showIcon
      />
    </div>
  );
};

export default WorkflowDocumentationPage;