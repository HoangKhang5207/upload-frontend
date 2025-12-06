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
    key: '/workflow',
    label: <Link to="/workflow">Danh sách Workflow</Link>,
    icon: <UnorderedListOutlined />,
  },
];

const WorkflowNavigation = () => {
  const location = useLocation();
  const [current, setCurrent] = useState(location.pathname);

  useEffect(() => {
    // Logic tìm key active
    if (location.pathname === '/workflow') {
      setCurrent('/workflow');
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