import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Layout, Menu, Button, Typography } from 'antd';

const { Header: AntHeader } = Layout;
const { Text } = Typography;

const Header = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const menuItems = [
    {
      key: 'bpmn',
      label: 'BPMN',
      onClick: () => navigate('/bpmn')
    },
    {
      key: 'workflows',
      label: 'Workflows',
      onClick: () => navigate('/workflow')
    },
    {
      key: 'documents',
      label: 'Documents',
      onClick: () => navigate('/documents')
    },
    {
      key: 'projects',
      label: 'Projects',
      onClick: () => navigate('/projects')
    }
  ];

  return (
    <AntHeader style={{ 
      display: 'flex', 
      justifyContent: 'space-between', 
      alignItems: 'center',
      background: '#001529',
      padding: '0 24px'
    }}>
      <div style={{ display: 'flex', alignItems: 'center' }}>
        <Text style={{ color: 'white', fontSize: '18px', fontWeight: 'bold', marginRight: '32px' }}>
          Document Management
        </Text>
        <Menu
          theme="dark"
          mode="horizontal"
          items={menuItems}
          style={{ background: 'transparent', border: 'none' }}
        />
      </div>
      
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <Text style={{ color: 'white' }}>
          {user?.email}
        </Text>
        <Button 
          type="primary" 
          onClick={handleLogout}
        >
          Đăng xuất
        </Button>
      </div>
    </AntHeader>
  );
};

export default Header;
