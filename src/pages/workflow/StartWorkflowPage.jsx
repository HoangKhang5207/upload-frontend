import React, { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeftOutlined,
  SendOutlined,
  FileTextOutlined,
  ArrowUpOutlined,
  ArrowDownOutlined,
  PaperClipOutlined,
  LoadingOutlined
} from '@ant-design/icons';
import {
  Button,
  Form,
  Input,
  Select,
  Radio,
  Upload,
  message, // Sẽ dùng message của Antd
  App, // Import App để dùng notification
  Spin,
  Typography,
  Tag,
  List
} from 'antd';
import * as mockWorkflowApi from '../../api/mockWorkflowApi';
import WorkflowNavigation from '../../components/workflow/WorkflowNavigation';
import { useWorkflow } from '../../contexts/WorkflowContext';
import WorkflowLoading from '../../components/workflow/WorkflowLoading';

const { Option } = Select;
const { Dragger } = Upload;
const { Title, Text } = Typography;

const StartWorkflowPage = () => {
  const { type } = useParams();
  const navigate = useNavigate();
  const [form] = Form.useForm(); // Sử dụng Form hook của Antd
  const { state, dispatch } = useWorkflow();
  const { workflows } = state;
  const [attachments, setAttachments] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

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

  // Filter workflows based on document type
  const filteredWorkflows = type ? 
    workflows.filter(workflow => workflow.documentType === type) : 
    workflows;

  let documentTypeLabel = 'Tất cả loại văn bản';
  let documentTypeIcon = <FileTextOutlined />;
  if (type === '1') {
    documentTypeLabel = 'Văn bản đi';
    documentTypeIcon = <ArrowUpOutlined />;
  } else if (type === '2') {
    documentTypeLabel = 'Văn bản đến';
    documentTypeIcon = <ArrowDownOutlined />;
  }

  const onFinish = async (values) => {
    setIsSubmitting(true);
    dispatch({ type: 'SET_LOADING', payload: true });
    
    console.log('Form values:', values);
    console.log('Attachments:', attachments);

    try {
      // Simulate starting workflow
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // THAY THẾ DISPATCH BẰNG NOTIFICATION CỦA ANTD
      notification.success({
        message: 'Thành công',
        description: 'Quy trình đã được khởi tạo thành công',
        placement: 'topRight',
      });
      
      // Reset form
      form.resetFields();
      setAttachments([]);

    } catch (error) {
      console.error('Error starting workflow:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Có lỗi xảy ra khi khởi tạo quy trình' });
      
      // THAY THẾ DISPATCH BẰNG NOTIFICATION CỦA ANTD
      notification.error({
        message: 'Lỗi',
        description: 'Có lỗi xảy ra khi khởi tạo quy trình',
        placement: 'topRight',
      });
    } finally {
      setIsSubmitting(false);
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const uploadProps = {
    multiple: true,
    onRemove: (file) => {
      const newAttachments = attachments.filter((f) => f.uid !== file.uid);
      setAttachments(newAttachments);
    },
    beforeUpload: (file) => {
      setAttachments([...attachments, file]);
      return false; // Ngăn Antd tự động upload
    },
    fileList: attachments,
  };

  if (state.loading && !isSubmitting) {
    return (
      <div style={{ maxWidth: 900, margin: '0 auto' }}>
        <WorkflowNavigation />
        <WorkflowLoading message="Đang tải thông tin khởi tạo quy trình..." />
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 900, margin: '0 auto' }}>
      <WorkflowNavigation />
      
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '24px' }}>
        <Link to="/workflow-management" style={{ marginRight: '16px', padding: '8px', borderRadius: '50%', transition: 'background 0.3s' }} className="hover:bg-gray-100">
          <ArrowLeftOutlined style={{ fontSize: '20px', color: '#555' }} />
        </Link>
        <div>
          <Title level={3} style={{ margin: 0 }}>Khởi tạo quy trình</Title>
          <Text type="secondary">Khởi tạo quy trình xử lý {documentTypeLabel.toLowerCase()}</Text>
        </div>
      </div>

      <Spin spinning={isSubmitting} tip="Đang khởi tạo...">
        <Form
          form={form}
          layout="vertical"
          onFinish={onFinish}
          style={{ backgroundColor: '#fff', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)', padding: '24px' }}
        >
          <Form.Item label="Loại văn bản">
            <Input
              prefix={documentTypeIcon}
              value={documentTypeLabel}
              disabled
              size="large"
            />
          </Form.Item>

          <Form.Item
            name="documentTitle"
            label="Tiêu đề văn bản"
            rules={[{ required: true, message: 'Vui lòng nhập tiêu đề!' }]}
          >
            <Input size="large" placeholder="Nhập tiêu đề văn bản" />
          </Form.Item>

          <Form.Item
            name="documentDescription"
            label="Mô tả"
          >
            <Input.TextArea rows={4} placeholder="Mô tả ngắn về nội dung văn bản" />
          </Form.Item>

          <Form.Item
            name="workflow"
            label="Chọn quy trình"
            rules={[{ required: true, message: 'Vui lòng chọn quy trình!' }]}
          >
            <Select size="large" placeholder="Chọn một quy trình">
              {filteredWorkflows.map(workflow => (
                <Option key={workflow.id} value={workflow.id}>
                  {workflow.name} {workflow.isDeployed && <Tag color="red" style={{marginLeft: 8}}>Đang sử dụng</Tag>}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="priority"
            label="Mức độ ưu tiên"
            initialValue="normal"
          >
            <Radio.Group>
              <Radio.Button value="low">Thấp</Radio.Button>
              <Radio.Button value="normal">Bình thường</Radio.Button>
              <Radio.Button value="high">Cao</Radio.Button>
            </Radio.Group>
          </Form.Item>

          <Form.Item
            label="Tệp đính kèm"
          >
            <Dragger {...uploadProps}>
              <p className="ant-upload-drag-icon">
                <PaperClipOutlined />
              </p>
              <p className="ant-upload-text">Click hoặc kéo file vào đây để đính kèm</p>
              <p className="ant-upload-hint">
                Hỗ trợ PDF, DOC, JPG... Tối đa 10MB.
              </p>
            </Dragger>
          </Form.Item>

          <Form.Item style={{ textAlign: 'right', marginTop: '32px', marginBottom: 0 }}>
            <Button onClick={() => navigate('/workflow-list')} style={{ marginRight: 12 }}>
              Hủy
            </Button>
            <Button
              type="primary"
              htmlType="submit"
              size="large"
              icon={isSubmitting ? <LoadingOutlined /> : <SendOutlined />}
              disabled={isSubmitting}
            >
              Khởi tạo quy trình
            </Button>
          </Form.Item>
        </Form>
      </Spin>
    </div>
  );
};

export default StartWorkflowPage;