import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  PlusOutlined, 
  EditOutlined, 
  DeleteOutlined, 
  EyeOutlined,
  ArrowUpOutlined,
  ArrowDownOutlined,
  CopyOutlined,
  FileTextOutlined,
  CheckCircleOutlined,
  PlayCircleOutlined,
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
  App, // Import App để dùng notification
  Popconfirm // Dùng Popconfirm cho an toàn
} from 'antd';
import { getWorkflows, deployWorkflow, deleteWorkflow } from '../../api/workflowApi';
import WorkflowNavigation from '../../components/workflow/WorkflowNavigation';
import WorkflowLoading from '../../components/workflow/WorkflowLoading';
import WorkflowEmptyState from '../../components/workflow/WorkflowEmptyState';
import ApplyWorkflowModal from '../../components/workflow/ApplyWorkflowModal';
import DeployWorkflowModal from '../../components/workflow/DeployWorkflowModal';
import { useAuth } from '../../contexts/AuthContext'; // Import AuthContext

const { Title, Text } = Typography;
const { Option } = Select;

const WorkflowListPage = () => {
  const { user } = useAuth(); // Get user info including organization
  const navigate = useNavigate();
  const [workflows, setWorkflows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [isApplyModalOpen, setIsApplyModalOpen] = useState(false);
  const [selectedWorkflow, setSelectedWorkflow] = useState(null);
  const [isDeployModalOpen, setIsDeployModalOpen] = useState(false);

  // Lấy API notification từ Antd App Context
  const { notification } = App.useApp();

  useEffect(() => {
    const fetchWorkflows = async () => {
      if (!user?.organization_id) {
        console.error('No organization ID found in user info');
        return;
      }

      setLoading(true);
      try {
        const data = await getWorkflows(user.organization_id);
        setWorkflows(data);
      } catch (error) {
        console.error('Error fetching workflows:', error);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchWorkflows();
    }
  }, [user]);

  const handleDelete = async (workflow) => {
    if (workflow.isDeployed) {
      notification.warning({
        message: 'Không thể xóa',
        description: `Quy trình "${workflow.name}" đang được sử dụng và không thể xóa.`,
        placement: 'topRight',
      });
      return;
    }
    
    try {
      await deleteWorkflow(workflow.id);
      const updatedWorkflows = workflows.filter(w => w.id !== workflow.id);
      setWorkflows(updatedWorkflows);
      
      // THAY THẾ DISPATCH BẰNG NOTIFICATION CỦA ANTD
      notification.success({
        message: 'Thành công',
        description: 'Sơ đồ workflow đã được xóa thành công',
        placement: 'topRight',
      });

    } catch (error) {
      console.error('Error deleting workflow:', error);
      const errorMessage = error.message || 'Có lỗi xảy ra khi xóa sơ đồ workflow';
      
      // THAY THẾ DISPATCH BẰNG NOTIFICATION CỦA ANTD
      notification.error({
        message: 'Lỗi',
        description: errorMessage,
        placement: 'topRight',
      });
    }
  };

  const handleApplyWorkflow = (workflow) => {
    setSelectedWorkflow(workflow);
    setIsApplyModalOpen(true);
  };

  const handleDeployNewWorkflow = () => {
    setIsDeployModalOpen(true);
  };

  const handleDeployWorkflow = async (workflow) => {
    try {
      await deployWorkflow(workflow.id);
      // Refresh workflows
      const updatedWorkflows = await getWorkflows(user.organization_id);
      setWorkflows(updatedWorkflows);
      
      // THAY THẾ DISPATCH BẰNG NOTIFICATION CỦA ANTD
      notification.success({
        message: 'Thành công',
        description: 'Quy trình đã được triển khai thành công',
        placement: 'topRight',
      });
    } catch (error) {
      console.error('Error deploying workflow:', error);
      const errorMessage = error.message || 'Có lỗi xảy ra khi triển khai quy trình';
      
      // THAY THẾ DISPATCH BẰNG NOTIFICATION CỦA ANTD
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

  const getDocumentType = (type) => {
    if (type === '1') {
      return <Tag icon={<ArrowUpOutlined />} color="blue">Văn bản đi</Tag>;
    } else if (type === '2') {
      return <Tag icon={<ArrowDownOutlined />} color="green">Văn bản đến</Tag>;
    } else {
      return <Tag icon={<FileTextOutlined />} color="default">Khác</Tag>;
    }
  };

  const getStatusBadge = (status) => {
    if (status === 'published') {
      return <Tag color="success">Đã xuất bản</Tag>;
    } else {
      return <Tag color="warning">Bản nháp</Tag>;
    }
  };

  const handleActionSuccess = () => {
    // Refresh workflows after successful action
    const fetchWorkflows = async () => {
      try {
        const data = await getWorkflows(user.organization_id);
        setWorkflows(data);
      } catch (error) {
        console.error('Error fetching workflows:', error);
      }
    };
    
    fetchWorkflows();
  };

  // Filter workflows based on search term and status
  const filteredWorkflows = workflows.filter(workflow => {
    const matchesSearch = workflow.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          workflow.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || workflow.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const columns = [
    {
      title: 'Tên sơ đồ',
      dataIndex: 'name',
      key: 'name',
      render: (text, record) => <Link to={`/workflow-detail/${record.id}`} style={{ fontWeight: 500 }}>{text}</Link>,
    },
    {
      title: 'Mô tả',
      dataIndex: 'description',
      key: 'description',
      responsive: ['md'],
    },
    {
      title: 'Thể loại',
      dataIndex: 'documentType',
      key: 'documentType',
      render: getDocumentType,
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
      render: (record) => (
        <Space>
          {getStatusBadge(record.status)}
          {record.isDeployed && <Tag color="red">Đang sử dụng</Tag>}
        </Space>
      )
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
          <Button type="text" icon={<EyeOutlined />} onClick={() => navigate(`/workflow-detail/${record.id}`)} title="Xem chi tiết" />
          <Button type="text" icon={<CopyOutlined />} onClick={() => navigate(`/bpmn-modeler/${record.id}`)} title="Xem sơ đồ" />
          <Button type="text" icon={<EditOutlined />} onClick={() => navigate(`/bpmn-modeler/${record.id}/edit`)} title="Chỉnh sửa" />
          {!record.isDeployed && (
            <Button type="text" icon={<CheckCircleOutlined style={{color: 'green'}} />} onClick={() => handleApplyWorkflow(record)} title="Áp dụng" />
          )}
          {!record.isDeployed && (
            <Popconfirm
              title={`Triển khai quy trình "${record.name}"?`}
              onConfirm={() => handleDeployWorkflow(record)}
              okText="Đồng ý"
              cancelText="Hủy"
            >
              <Button type="text" icon={<PlayCircleOutlined style={{color: 'purple'}} />} title="Triển khai" />
            </Popconfirm>
          )}
          <Popconfirm
            title={`Xóa sơ đồ "${record.name}"?`}
            description="Hành động này không thể hoàn tác."
            onConfirm={() => handleDelete(record)}
            okText="Xóa"
            cancelText="Hủy"
            disabled={record.isDeployed}
          >
            <Button type="text" danger icon={<DeleteOutlined />} disabled={record.isDeployed} title={record.isDeployed ? "Không thể xóa" : "Xóa"} />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  if (loading) {
    return (
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>
        <WorkflowNavigation />
        <WorkflowLoading message="Đang tải danh sách workflow..." />
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto' }}>
      <WorkflowNavigation />
      
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <Title level={3} style={{ margin: 0 }}>Danh sách Workflow</Title>
          <Text type="secondary">Quản lý các sơ đồ quy trình xử lý tài liệu</Text>
        </div>
        <Button type="primary" icon={<PlusOutlined />} size="large" onClick={handleDeployNewWorkflow}>
            Triển khai quy trình
          </Button>
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

      {filteredWorkflows.length > 0 ? (
        <Card bodyStyle={{ padding: 0 }}>
          <Table
            columns={columns}
            dataSource={filteredWorkflows}
            rowKey="id"
            loading={loading}
          />
        </Card>
      ) : (
        <WorkflowEmptyState 
          title="Không tìm thấy workflow nào" 
          description="Không có workflow nào phù hợp với tiêu chí tìm kiếm." 
          actionText="Triển khai quy trình" 
          onAction={handleDeployNewWorkflow}
        />
      )}
      
      <ApplyWorkflowModal
        open={isApplyModalOpen}
        workflow={selectedWorkflow}
        onClose={() => {
          setIsApplyModalOpen(false);
          setSelectedWorkflow(null);
        }}
        onSuccess={handleActionSuccess}
      />
      
      <DeployWorkflowModal
        open={isDeployModalOpen}
        onClose={() => {
          setIsDeployModalOpen(false);
        }}
        onSuccess={handleActionSuccess}
      />
    </div>
  );
};

export default WorkflowListPage;