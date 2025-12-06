import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  PlusOutlined, 
  EditOutlined, 
  DeleteOutlined, 
  EyeOutlined,
  FileTextOutlined,
  CheckCircleOutlined,
  SearchOutlined
} from '@ant-design/icons';
import { 
  Button, 
  Table, 
  Tag, 
  Space, 
  Input, 
  Select, 
  Card, 
  Typography,
  App,
  Popconfirm,
  message
} from 'antd';
import { getBpmnList, deleteBpmn } from '../../api/bpmnApi';
import BpmnNavigation from '../../components/bpmn/BpmnNavigation';
import { useAuth } from '../../contexts/AuthContext';

const { Title, Text } = Typography;
const { Option } = Select;

const BpmnManagementPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [bpmns, setBpmns] = useState(null);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const { notification } = App.useApp();

  useEffect(() => {
    const fetchBpmns = async () => {
      if (!user?.organization_id) {
        message.error('Không tìm thấy thông tin tổ chức');
        return;
      }

      setLoading(true);
      try {
        const data = await getBpmnList(user.organization_id);
        
        // Đảm bảo data là mảng
        const bpmnArray = Array.isArray(data) ? data : [];
        setBpmns(bpmnArray);
      } catch (error) {
        console.error('Error fetching BPMNs:', error);
        message.error('Có lỗi xảy ra khi tải danh sách sơ đồ BPMN: ' + (error.message || 'Lỗi không xác định'));
        setBpmns([]); // Đặt mảng rỗng nếu có lỗi
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchBpmns();
    }
  }, [user]);

  const handleDelete = async (bpmn) => {
    try {
      await deleteBpmn(user.organization_id, bpmn.id);
      const updatedBpmns = bpmns.filter(b => b.id !== bpmn.id);
      setBpmns(updatedBpmns);
      
      notification.success({
        message: 'Thành công',
        description: 'Sơ đồ BPMN đã được xóa thành công',
        placement: 'topRight',
      });
    } catch (error) {
      console.error('Error deleting BPMN:', error);
      const errorMessage = error.message || 'Có lỗi xảy ra khi xóa sơ đồ BPMN';
      
      notification.error({
        message: 'Lỗi',
        description: errorMessage,
        placement: 'topRight',
      });
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('vi-VN');
  };

  const getStatusBadge = (isPublished) => {
    if (isPublished) {
      return <Tag color="success">Đã xuất bản</Tag>;
    } else {
      return <Tag color="warning">Bản nháp</Tag>;
    }
  };

  // Filter BPMNs based on search term and status
  const filteredBpmns = (Array.isArray(bpmns) ? bpmns : []).filter(bpmn => {
    try {
      if (!bpmn) return false;
      
      const searchLower = searchTerm.toLowerCase();
      const nameMatch = bpmn.name && typeof bpmn.name === 'string' ? 
        bpmn.name.toLowerCase().includes(searchLower) : false;
      const descMatch = bpmn.description && typeof bpmn.description === 'string' ? 
        bpmn.description.toLowerCase().includes(searchLower) : false;
        
      const matchesSearch = nameMatch || descMatch;
      
      const matchesStatus = statusFilter === 'all' || 
        (statusFilter === 'published' && bpmn.isPublished) ||
        (statusFilter === 'draft' && !bpmn.isPublished);
        
      return matchesSearch && matchesStatus;
    } catch (error) {
      console.error('Error filtering BPMN:', error, bpmn);
      return false;
    }
  });

  const columns = [
    {
      title: 'Tên sơ đồ',
      dataIndex: 'name',
      key: 'name',
      render: (text, record) => (
        <Link to={`/bpmn-viewer/${record.id}?version=${record.version}`} style={{ fontWeight: 500 }}>
          {text}
        </Link>
      ),
    },
    {
      title: 'Mô tả',
      dataIndex: 'description',
      key: 'description',
      responsive: ['md'],
    },
    {
      title: 'Phiên bản',
      dataIndex: 'version',
      key: 'version',
      render: (text) => `v${text}`,
      responsive: ['lg'],
    },
    {
      title: 'Trạng thái',
      key: 'status',
      render: (record) => getStatusBadge(record.isPublished),
    },
    {
      title: 'Ngày tạo',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: formatDate,
      responsive: ['md'],
    },
    {
      title: 'Cập nhật',
      dataIndex: 'updatedAt',
      key: 'updatedAt',
      render: formatDate,
      responsive: ['md'],
    },
    {
      title: 'Thao tác',
      key: 'action',
      align: 'right',
      render: (record) => (
        <Space size="small">
          <Button type="text" icon={<EyeOutlined />} onClick={() => navigate(`/bpmn-viewer/${record.id}?version=${record.version}`)} title="Xem chi tiết" />
          <Button type="text" icon={<EditOutlined />} onClick={() => message.info('Chức năng chưa được triển khai')} title="Chỉnh sửa" />
          <Popconfirm
            title={`Xóa sơ đồ "${record.name}"?`}
            description="Hành động này không thể hoàn tác."
            onConfirm={() => handleDelete(record)}
            okText="Xóa"
            cancelText="Hủy"
          >
            <Button type="text" danger icon={<DeleteOutlined />} title="Xóa" />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto' }}>
      <BpmnNavigation />
      
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <Title level={3} style={{ margin: 0 }}>Quản lý Sơ đồ BPMN</Title>
          <Text type="secondary">Quản lý các sơ đồ quy trình xử lý tài liệu</Text>
        </div>
        <Link to="/bpmn-modeler">
          <Button type="primary" icon={<PlusOutlined />} size="large">
            Tạo mới
          </Button>
        </Link>
      </div>

      {/* Filters */}
      <Card style={{ marginBottom: 24 }}>
        <Space wrap>
          <Input
            placeholder="Tìm kiếm theo tên hoặc mô tả..."
            prefix={<SearchOutlined />}
            style={{ width: 300 }}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <Select
            defaultValue="all"
            style={{ width: 180 }}
            onChange={(value) => setStatusFilter(value)}
          >
            <Option value="all">Tất cả trạng thái</Option>
            <Option value="published">Đã xuất bản</Option>
            <Option value="draft">Bản nháp</Option>
          </Select>
        </Space>
      </Card>

      {filteredBpmns && filteredBpmns.length > 0 ? (
        <Card bodyStyle={{ padding: 0 }}>
          <Table
            columns={columns}
            dataSource={filteredBpmns}
            rowKey="id"
            loading={loading}
            locale={{
              emptyText: loading ? 'Đang tải...' : 'Không có dữ liệu'
            }}
          />
        </Card>
      ) : (
        <Card>
          <div style={{ textAlign: 'center', padding: '40px' }}>
            <FileTextOutlined style={{ fontSize: '48px', color: '#d9d9d9', marginBottom: '16px' }} />
            <Title level={4} type="secondary">Không tìm thấy sơ đồ BPMN nào</Title>
            <Text type="secondary">Không có sơ đồ nào phù hợp với tiêu chí tìm kiếm.</Text>
            <div style={{ marginTop: '16px' }}>
              <Link to="/bpmn-modeler">
                <Button type="primary" icon={<PlusOutlined />}>
                  Tạo sơ đồ mới
                </Button>
              </Link>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
};

export default BpmnManagementPage;
