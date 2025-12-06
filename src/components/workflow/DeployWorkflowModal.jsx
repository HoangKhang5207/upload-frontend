import React, { useState, useEffect } from 'react';
import { Modal, Form, Select, Input, Button, Spin, message, Card, Typography } from 'antd';
import { getBpmnList, getBpmnFile } from '../../api/bpmnApi';
import { useAuth } from '../../contexts/AuthContext';

const { Title, Text } = Typography;
const { Option } = Select;
const { TextArea } = Input;

const DeployWorkflowModal = ({ open, onClose, onSuccess }) => {
  const { user } = useAuth();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [bpmnList, setBpmnList] = useState([]);
  const [selectedBpmn, setSelectedBpmn] = useState(null);
  const [bpmnPreview, setBpmnPreview] = useState(null);
  const [previewLoading, setPreviewLoading] = useState(false);

  // Document types from BE Java enum
  const documentTypes = [
    { value: '1', label: 'Văn bản đi' },
    { value: '2', label: 'Văn bản đến' },
    { value: '3', label: 'Thông báo' },
    { value: '4', label: 'Quyết định' },
    { value: '5', label: 'Tài liệu đào tạo' },
    { value: '6', label: 'Khác' }
  ];

  useEffect(() => {
    if (open && user?.organization_id) {
      fetchBpmnList();
    }
  }, [open, user]);

  const fetchBpmnList = async () => {
    try {
      const data = await getBpmnList(user.organization_id);
      setBpmnList(data);
    } catch (error) {
      console.error('Error fetching BPMN list:', error);
      message.error('Không thể tải danh sách BPMN!');
    }
  };

  const handleBpmnChange = async (bpmnId) => {
    const bpmn = bpmnList.find(item => item.id === bpmnId);
    setSelectedBpmn(bpmn);
    
    if (bpmn) {
      setPreviewLoading(true);
      try {
        // Try to get BPMN SVG file for preview
        // Use bpmn.pathSvg field from API response
        let bpmnPreview = null;
        
        if (bpmn.pathSvg) {
          // Fetch SVG content
          const response = await fetch(`http://localhost:8080${bpmn.pathSvg}`, {
            credentials: 'include'
          });
          if (response.ok) {
            bpmnPreview = await response.text();
          }
        }
        
        setBpmnPreview(bpmnPreview);
      } catch (error) {
        console.error('Error loading BPMN SVG preview:', error);
        // Don't show error message, just set preview to null
        setBpmnPreview(null);
      } finally {
        setPreviewLoading(false);
      }
    } else {
      setBpmnPreview(null);
    }
  };

  const handleSubmit = async (values) => {
    if (!selectedBpmn) {
      message.warning('Vui lòng chọn biểu đồ BPMN!');
      return;
    }

    setLoading(true);
    try {
      // TODO: Call API to deploy workflow
      // For now, just show success message
      message.success('Triển khai quy trình thành công!');
      form.resetFields();
      setSelectedBpmn(null);
      setBpmnPreview(null);
      onSuccess();
      onClose();
    } catch (error) {
      console.error('Error deploying workflow:', error);
      message.error('Triển khai quy trình thất bại!');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    form.resetFields();
    setSelectedBpmn(null);
    setBpmnPreview(null);
    onClose();
  };

  return (
    <Modal
      title="Triển khai quy trình"
      open={open}
      onCancel={handleCancel}
      width={800}
      footer={null}
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
      >
        <Form.Item
          name="documentType"
          label="Loại văn bản"
          rules={[{ required: true, message: 'Vui lòng chọn loại văn bản!' }]}
        >
          <Select placeholder="Chọn loại văn bản">
            {documentTypes.map(type => (
              <Option key={type.value} value={type.value}>
                {type.label}
              </Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item
          name="name"
          label="Tên Quy trình"
          rules={[{ required: true, message: 'Vui lòng nhập tên quy trình!' }]}
        >
          <Input placeholder="Nhập tên quy trình" />
        </Form.Item>

        <Form.Item
          name="description"
          label="Mô tả"
          rules={[{ required: true, message: 'Vui lòng nhập mô tả!' }]}
        >
          <TextArea 
            rows={4} 
            placeholder="Nhập mô tả chi tiết về quy trình"
          />
        </Form.Item>

        <Form.Item
          name="bpmnUploadId"
          label="Biểu đồ"
          rules={[{ required: true, message: 'Vui lòng chọn biểu đồ!' }]}
        >
          <Select 
            placeholder="Chọn biểu đồ BPMN"
            onChange={handleBpmnChange}
            showSearch
            filterOption={(input, option) =>
              option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
            }
          >
            {bpmnList.map(bpmn => (
              <Option key={bpmn.id} value={bpmn.id}>
                {bpmn.name} (v{bpmn.version})
              </Option>
            ))}
          </Select>
        </Form.Item>

        {/* BPMN Preview */}
        {selectedBpmn && (
          <Card 
            title={`Preview: ${selectedBpmn.name}`}
            style={{ marginBottom: 16 }}
          >
            <Spin spinning={previewLoading}>
              {bpmnPreview ? (
                <div 
                  style={{ 
                    height: 300, 
                    overflow: 'auto',
                    border: '1px solid #d9d9d9',
                    borderRadius: 4,
                    padding: 8,
                    backgroundColor: '#fafafa',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center'
                  }}
                >
                  {/* Render SVG directly */}
                  <div 
                    dangerouslySetInnerHTML={{ __html: bpmnPreview }}
                    style={{ 
                      maxWidth: '100%',
                      maxHeight: '100%',
                      overflow: 'auto'
                    }}
                  />
                </div>
              ) : (
                <div style={{ 
                  textAlign: 'center', 
                  padding: 40, 
                  color: '#999',
                  height: 200,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexDirection: 'column'
                }}>
                  <div style={{ marginBottom: 16 }}>
                    <svg width="64" height="64" viewBox="0 0 24 24" fill="currentColor" style={{ opacity: 0.3 }}>
                      <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z" />
                    </svg>
                  </div>
                  <div>Preview không khả dụng</div>
                  <div style={{ fontSize: 12, marginTop: 8 }}>
                    Không thể tải nội dung BPMN
                  </div>
                </div>
              )}
            </Spin>
          </Card>
        )}

        <Form.Item style={{ marginBottom: 0, textAlign: 'right' }}>
          <Button style={{ marginRight: 8 }} onClick={handleCancel}>
            Hủy
          </Button>
          <Button type="primary" htmlType="submit" loading={loading}>
            Lưu Quy trình
          </Button>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default DeployWorkflowModal;
