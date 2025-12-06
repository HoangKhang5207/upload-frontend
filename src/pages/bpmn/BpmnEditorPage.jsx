import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button, message, Card, Row, Col, Form, Input, Switch } from 'antd';
import { SaveOutlined, ArrowLeftOutlined } from '@ant-design/icons';
import BpmnModeler from '../../components/bpmn/BpmnModeler';
import BpmnNavigation from '../../components/bpmn/BpmnNavigation';
import { getBpmnInfo, saveBpmn } from '../../api/bpmnApi';
import { useAuth } from '../../contexts/AuthContext';

const { TextArea } = Input;

const BpmnEditorPage = () => {
  const [form] = Form.useForm();
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [bpmnXml, setBpmnXml] = useState(null);
  const [bpmnData, setBpmnData] = useState(null);

  // Lấy thông tin chi tiết BPMN
  useEffect(() => {
    const fetchBpmnDetail = async () => {
      if (!user || !id) return;
      
      try {
        setLoading(true);
        const data = await getBpmnInfo(user.organization_id, id);
        setBpmnData(data);
        form.setFieldsValue({
          name: data.name,
          description: data.description || '',
          isPublished: data.isPublished || false
        });
        
        // Nếu có XML, cập nhật state để hiển thị trong editor
        if (data.bpmnXml) {
          setBpmnXml(data.bpmnXml);
        }
      } catch (error) {
        console.error('Error fetching BPMN detail:', error);
        message.error('Không thể tải thông tin BPMN');
        navigate('/bpmn');
      } finally {
        setLoading(false);
      }
    };

    fetchBpmnDetail();
  }, [id, form, navigate]);

  const handleBpmnChange = (xml) => {
    setBpmnXml(xml);
  };

  const handlePublishToggle = async (checked) => {
    try {
      await togglePublishBpmn(id, checked);
      message.success(checked ? 'Đã xuất bản BPMN' : 'Đã hủy xuất bản BPMN');
      setBpmnData(prev => ({ ...prev, isPublished: checked }));
    } catch (error) {
      console.error('Error toggling publish status:', error);
      message.error('Có lỗi khi cập nhật trạng thái xuất bản');
    }
  };

  const handleSave = async (values) => {
    if (!user) return;
    
    try {
      setSaving(true);
      
      // Lấy XML từ BPMN modeler
      const { xml } = await bpmnModelerRef.current.saveXML({ format: true });
      
      // Tạo đối tượng FormData để gửi lên server
      const formData = new FormData();
      formData.append('name', values.name);
      formData.append('description', values.description || '');
      
      // Tạo file BPMN từ XML
      const bpmnBlob = new Blob([xml], { type: 'application/xml' });
      const bpmnFile = new File([bpmnBlob], `${values.name || 'diagram'}.bpmn`, { type: 'application/xml' });
      formData.append('file', bpmnFile);
      
      // Tạo SVG preview
      const { svg } = await bpmnModelerRef.current.saveSVG();
      const svgBlob = new Blob([svg], { type: 'image/svg+xml' });
      const svgFile = new File([svgBlob], `${values.name || 'diagram'}.svg`, { type: 'image/svg+xml' });
      formData.append('svgFile', svgFile);
      
      // Gọi API lưu BPMN
      const response = await saveBpmn(user.organization_id, formData);
      
      message.success('Lưu sơ đồ BPMN thành công');
      
      // Nếu là tạo mới, chuyển hướng đến trang chỉnh sửa
      if (!id && response.id) {
        navigate(`/bpmn/edit/${response.id}`);
      } else {
        // Làm mới dữ liệu
        const updatedData = await getBpmnInfo(user.organization_id, response.id || id);
        setBpmnData(updatedData);
      }
      
      return response;
    } catch (error) {
      console.error('Error saving BPMN:', error);
      message.error(error.response?.data?.message || 'Lỗi khi lưu sơ đồ BPMN');
      throw error;
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div>Đang tải...</div>;
  }

  if (!bpmnData) {
    return <div>Không tìm thấy thông tin BPMN</div>;
  }

  return (
    <div className="bpmn-editor-page">
      <BpmnNavigation 
        title={`Chỉnh sửa BPMN: ${bpmnData.name}`} 
        extra={[
          <Button 
            key="back" 
            icon={<ArrowLeftOutlined />} 
            onClick={() => navigate(-1)}
            style={{ marginRight: 8 }}
          >
            Quay lại
          </Button>,
          <Button 
            key="save" 
            type="primary" 
            icon={<SaveOutlined />} 
            onClick={() => form.submit()}
            loading={saving}
          >
            Lưu thay đổi
          </Button>
        ]} 
      />
      
      <div style={{ marginTop: 16 }}>
        <Row gutter={16}>
          <Col span={6}>
            <Card title="Thông tin BPMN" style={{ marginBottom: 16 }}>
              <Form
                form={form}
                layout="vertical"
                onFinish={onFinish}
                initialValues={{
                  name: bpmnData.name,
                  description: bpmnData.description,
                  isPublished: bpmnData.isPublished
                }}
              >
                <Form.Item
                  name="name"
                  label="Tên BPMN"
                  rules={[
                    { required: true, message: 'Vui lòng nhập tên BPMN' },
                    { max: 255, message: 'Tên không được vượt quá 255 ký tự' }
                  ]}
                >
                  <Input placeholder="Nhập tên BPMN" />
                </Form.Item>

                <Form.Item
                  name="description"
                  label="Mô tả"
                >
                  <TextArea rows={3} placeholder="Nhập mô tả (nếu có)" />
                </Form.Item>

                <Form.Item
                  label="Trạng thái"
                  name="isPublished"
                  valuePropName="checked"
                >
                  <div>
                    <Switch 
                      checkedChildren="Đã xuất bản" 
                      unCheckedChildren="Bản nháp" 
                      checked={bpmnData.isPublished}
                      onChange={handlePublishToggle}
                    />
                  </div>
                </Form.Item>

                <div style={{ marginTop: 24 }}>
                  <div style={{ marginBottom: 8 }}>
                    <strong>Ngày tạo:</strong> {new Date(bpmnData.createdAt).toLocaleString()}
                  </div>
                  <div>
                    <strong>Cập nhật lần cuối:</strong> {new Date(bpmnData.updatedAt).toLocaleString()}
                  </div>
                </div>
              </Form>
            </Card>
          </Col>
          <Col span={18}>
            <Card 
              title="Trình chỉnh sửa BPMN" 
              style={{ height: '100%' }}
              bodyStyle={{ padding: 0 }}
            >
              <div style={{ height: 'calc(100vh - 250px)', border: '1px solid #f0f0f0' }}>
                <BpmnModeler 
                  xml={bpmnData.xmlContent}
                  onXmlChange={handleBpmnChange} 
                  readOnly={false}
                />
              </div>
            </Card>
          </Col>
        </Row>
      </div>
    </div>
  );
};

export default BpmnEditorPage;
