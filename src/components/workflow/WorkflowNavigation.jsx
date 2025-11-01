import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, Card } from 'antd'; // Import Menu và Card
import { 
  DashboardOutlined, // Thay thế DocumentTextIcon
  EditOutlined, // Thay thế PencilIcon
  PlayCircleOutlined, // Thay thế PlayIcon
  UnorderedListOutlined, // Thay thế ListBulletIcon
  BookOutlined // Thay thế BookOpenIcon
} from '@ant-design/icons';

const navigationItems = [
  {
    key: '/workflow-dashboard',
    label: <Link to="/workflow-dashboard">Bảng điều khiển</Link>,
    icon: <DashboardOutlined />,
  },
  {
    key: '/workflow-list',
    label: <Link to="/workflow-list">Danh sách Workflow</Link>,
    icon: <UnorderedListOutlined />,
  },
  {
    key: '/bpmn-modeler',
    label: <Link to="/bpmn-modeler">Thiết kế Workflow</Link>,
    icon: <EditOutlined />,
  },
  {
    key: '/start-workflow/1', // Key gốc
    label: <Link to="/start-workflow/1">Khởi tạo quy trình</Link>,
    icon: <PlayCircleOutlined />,
  },
  {
    key: '/workflow-documentation',
    label: <Link to="/workflow-documentation">Tài liệu hướng dẫn</Link>,
    icon: <BookOutlined />,
  },
];

const WorkflowNavigation = () => {
  const location = useLocation();
  const [current, setCurrent] = useState(location.pathname);

  useEffect(() => {
    // Logic tìm key active (giống như MainLayout)
    if (location.pathname.startsWith('/start-workflow')) {
      setCurrent('/start-workflow/1');
    } else if (location.pathname.startsWith('/bpmn-modeler')) {
      setCurrent('/bpmn-modeler');
    } else if (location.pathname.startsWith('/workflow-detail') || location.pathname === '/workflow-list') {
      setCurrent('/workflow-list');
    } else {
      setCurrent(location.pathname);
    }
  }, [location.pathname]);

  return (
    <Card style={{ marginBottom: 24 }} bodyStyle={{ padding: 0 }}>
      <Menu
        onClick={(e) => setCurrent(e.key)}
        selectedKeys={[current]}
        mode="horizontal"
        items={navigationItems}
        style={{ borderBottom: 'none' }} // Bỏ viền dưới của Menu khi nằm trong Card
      />
    </Card>
  );
};

export default WorkflowNavigation;