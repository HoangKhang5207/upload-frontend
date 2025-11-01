import React, { useState, useEffect } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { Layout, Menu, Grid } from 'antd';
import {
  HomeOutlined,
  SyncOutlined,
  FileTextOutlined,
  PlayCircleOutlined,
} from '@ant-design/icons';
import { WorkflowProvider } from '../../contexts/WorkflowContext';
// import WorkflowNotificationContainer from '../../components/workflow/WorkflowNotificationContainer'; // <-- XÓA BỎ

const { Header, Content } = Layout;
const { useBreakpoint } = Grid;

// Định nghĩa các mục menu
const menuItems = [
  {
    key: '/workflow-dashboard',
    icon: <SyncOutlined />,
    label: <Link to="/workflow-dashboard">Workflow</Link>,
  },
  {
    key: '/workflow-list',
    icon: <FileTextOutlined />,
    label: <Link to="/workflow-list">Danh sách</Link>,
  },
  {
    key: '/start-workflow/1',
    icon: <PlayCircleOutlined />,
    label: <Link to="/start-workflow/1">Khởi tạo</Link>,
  },
  {
    key: '/',
    icon: <HomeOutlined />,
    label: <Link to="/">Trang chủ</Link>,
  },
];

const MainLayout = () => {
  const location = useLocation();
  const screens = useBreakpoint();
  const [current, setCurrent] = useState(location.pathname);

  useEffect(() => {
    // Xử lý trường hợp đặc biệt cho "Khởi tạo"
    if (location.pathname.startsWith('/start-workflow')) {
      setCurrent('/start-workflow/1');
    } 
    // Xử lý cho "Trang chủ"
    else if (location.pathname === '/') {
       setCurrent('/');
    }
    // Xử lý các trang con của workflow
    else if (location.pathname.startsWith('/workflow-list')) {
      setCurrent('/workflow-list');
    }
    else if (location.pathname.startsWith('/workflow-detail')) {
      setCurrent('/workflow-list'); // Vẫn highlight "Danh sách"
    }
    else if (location.pathname.startsWith('/bpmn-modeler')) {
       setCurrent('/workflow-list'); // Vẫn highlight "Danh sách"
    }
    else if (location.pathname.startsWith('/workflow-dashboard')) {
       setCurrent('/workflow-dashboard');
    }
    else {
      setCurrent(location.pathname);
    }
  }, [location.pathname]);

  // Lọc menu items dựa trên location
  const filteredMenuItems = menuItems.filter(item => {
    // Luôn hiển thị các item chính
    if (['/workflow-dashboard', '/workflow-list', '/start-workflow/1'].includes(item.key)) {
      return true;
    }
    // Chỉ hiển thị "Trang chủ" khi không ở trang chủ
    if (item.key === '/') {
      return location.pathname !== '/';
    }
    return false;
  });

  return (
    <WorkflowProvider>
      <Layout style={{ minHeight: '100vh' }}>
        <Header
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            backgroundColor: '#fff',
            borderBottom: '1px solid #f0f0f0',
            padding: screens.md ? '0 50px' : '0 20px',
            position: 'sticky', // Làm cho header dính ở trên
            top: 0,
            zIndex: 10,
          }}
        >
          {/* Logo */}
          <Link
            to="/"
            style={{
              fontSize: '24px',
              fontWeight: 'bold',
              background: 'linear-gradient(to right, #6b46c1, #3b82f6)', // Màu gradient từ-tím-đến-xanh
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              marginRight: '24px',
            }}
          >
            DMS Frontend
          </Link>

          {/* Menu Điều hướng */}
          <Menu
            onClick={(e) => setCurrent(e.key)}
            selectedKeys={[current]}
            mode="horizontal"
            items={filteredMenuItems}
            style={{
              flex: 1, // Làm cho menu chiếm hết không gian còn lại
              borderBottom: 'none', // Bỏ đường gạch chân của menu
              justifyContent: 'flex-end', // Đẩy menu về bên phải
            }}
          />
        </Header>
        <Content
          style={{
            padding: screens.md ? '24px 50px' : '16px 20px', // Thêm padding cho nội dung
            backgroundColor: '#f5f5f5', // Màu nền xám nhạt cho content
          }}
        >
          {/* Đây là nơi các trang con (HomePage, UC39_UploadPage...) được render */}
          <Outlet />
        </Content>
        {/* <WorkflowNotificationContainer /> */} {/* <-- XÓA BỎ HOÀN TOÀN */}
      </Layout>
    </WorkflowProvider>
  );
};

export default MainLayout;