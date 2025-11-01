import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  PlusOutlined, 
  EditOutlined, 
  DeleteOutlined, 
  EyeOutlined,
  ArrowUpOutlined,
  ArrowDownOutlined,
  FileTextOutlined,
  CheckCircleOutlined,
  PlayCircleOutlined
} from '@ant-design/icons';
import { 
  Button, 
  Table, 
  Tag, 
  Space, 
  Typography,
  App, // Import App để dùng notification
  Popconfirm,
  Card
} from 'antd';
import * as mockWorkflowApi from '../../api/mockWorkflowApi';
import WorkflowNavigation from '../../components/workflow/WorkflowNavigation';
import { useWorkflow } from '../../contexts/WorkflowContext';
import WorkflowLoading from '../../components/workflow/WorkflowLoading';
import WorkflowEmptyState from '../../components/workflow/WorkflowEmptyState';
import ApplyWorkflowModal from '../../components/workflow/ApplyWorkflowModal';

const { Title, Text } = Typography;

const WorkflowManagementPage = () => {
  const { state, dispatch } = useWorkflow();
  const { workflows, loading } = state;
  const [isApplyModalOpen, setIsApplyModalOpen] = useState(false);
  const [selectedWorkflow, setSelectedWorkflow] = useState(null);
  const navigate = useNavigate();

  // Lấy API notification từ Antd App Context
  const { notification } = App.useApp();

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
      await mockWorkflowApi.deleteWorkflow(workflow.id);
      const updatedWorkflows = workflows.filter(w => w.id !== workflow.id);
      dispatch({ type: 'SET_WORKFLOWS', payload: updatedWorkflows });
      
      // THAY THẾ DISPATCH BẰNG NOTIFICATION CỦA ANTD
      notification.success({
        message: 'Thành công',
        description: 'Quy trình đã được xóa thành công',
        placement: 'topRight',
      });

    } catch (error) {
      console.error('Error deleting workflow:', error);
      const errorMessage = error.message || 'Có lỗi xảy ra khi xóa quy trình';
      
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

  const handleDeployWorkflow = async (workflow) => {
    try {
      await mockWorkflowApi.deployWorkflow(workflow.id);
      const updatedWorkflows = await mockWorkflowApi.getWorkflows();
      dispatch({ type: 'SET_WORKFLOWS', payload: updatedWorkflows });
      
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
    // Refresh workflows
    const fetchWorkflows = async () => {
      try {
        const data = await mockWorkflowApi.getWorkflows();
        dispatch({ type: 'SET_WORKFLOWS', payload: data });
      } catch (error) {
        console.error('Error fetching workflows:', error);
        dispatch({ type: 'SET_ERROR', payload: 'Có lỗi xảy ra khi tải danh sách quy trình' });
      }
    };
    fetchWorkflows();
  };
  
  const columns = [
    {
      title: 'Tên quy trình',
      dataIndex: 'name',
      key: 'name',
      render: (text) => <Text strong>{text}</Text>,
    },
    {
      title: 'Mô tả',
      dataIndex: 'description',
      key: 'description',
    },
    {
      title: 'Thể loại',
      dataIndex: 'documentType',
      key: 'documentType',
      render: getDocumentType,
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
    },
    {
      title: 'Thao tác',
      key: 'action',
      align: 'right',
      render: (record) => (
        <Space size="small">
          <Button type="text" icon={<EyeOutlined />} onClick={() => navigate(`/workflow-detail/${record.id}`)} title="Xem chi tiết" />
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
            title={`Xóa quy trình "${record.name}"?`}
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
        <WorkflowLoading message="Đang tải danh sách quy trình..." />
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto' }}>
      <WorkflowNavigation />
      
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <Title level={3} style={{ margin: 0 }}>Quản lý Workflow</Title>
          <Text type="secondary">Danh sách các quy trình xử lý</Text>
        </div>
        <Link to="/bpmn-modeler">
          <Button type="primary" icon={<PlusOutlined />} size="large">
            Tạo mới
          </Button>
        </Link>
      </div>

      {workflows.length > 0 ? (
        <Card bodyStyle={{ padding: 0 }}>
          <Table
            columns={columns}
            dataSource={workflows}
            rowKey="id"
            loading={loading}
          />
        </Card>
      ) : (
        <WorkflowEmptyState 
          title="Không có quy trình nào" 
          description="Hãy tạo quy trình đầu tiên của bạn." 
          actionText="Tạo quy trình mới" 
          actionLink="/bpmn-modeler" 
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
    </div>
  );
};

export default WorkflowManagementPage;