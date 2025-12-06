import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Form, Input, Upload, message, Card, Row, Col } from 'antd';
import { UploadOutlined, SaveOutlined, ArrowLeftOutlined } from '@ant-design/icons';
import BpmnModeler from '../../components/bpmn/BpmnModeler';
import BpmnNavigation from '../../components/bpmn/BpmnNavigation';
import { saveBpmn } from '../../api/bpmnApi';
import { useAuth } from '../../contexts/AuthContext';

const { TextArea } = Input;

const BpmnCreatePage = () => {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const { user, organization } = useAuth();
  const [fileList, setFileList] = useState([]);
  const [svgFileList, setSvgFileList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [bpmnXml, setBpmnXml] = useState(null);

  const handleBpmnChange = (xml) => {
    setBpmnXml(xml);
  };

  const handleFileChange = ({ fileList: newFileList }) => {
    setFileList(newFileList);
  };

  const handleSvgChange = ({ fileList: newFileList }) => {
    setSvgFileList(newFileList);
  };

  const onFinish = async (values) => {
    if (!user) {
      message.error('Vui lòng đăng nhập để tiếp tục');
      return;
    }
    
    // Lấy organization_id từ organization context
    const organization_id = organization?.id || user.organization_id;
    
    if (!organization_id) {
      message.error('Không tìm thấy thông tin tổ chức. Vui lòng chọn tổ chức trước khi tạo BPMN.');
      return;
    }
    
    console.log('Form values:', values, 'Organization ID:', organization_id);

    try {
      setLoading(true);
      
      if (!bpmnXml && fileList.length === 0) {
        message.error('Vui lòng tạo hoặc tải lên file BPMN');
        return;
      }

      const formData = new FormData();
      formData.append('name', values.name);
      formData.append('description', values.description || '');
      
      // Add BPMN file
      if (fileList.length > 0) {
        formData.append('file', fileList[0].originFileObj);
      } else if (bpmnXml) {
        // Nếu tạo mới từ editor, tạo một file tạm từ nội dung XML
        const blob = new Blob([bpmnXml], { type: 'application/xml' });
        const file = new File(
          [blob], 
          `${values.name.replace(/[^a-z0-9]/gi, '_').toLowerCase() || 'diagram'}.bpmn`, 
          { type: 'application/xml' }
        );
        formData.append('file', file);
        
        // Tạo SVG preview nếu có thể
        try {
          const modeler = document.querySelector('.bpmn-modeler')?.__vue__;
          if (modeler) {
            const { svg } = await modeler.saveSVG();
            const svgBlob = new Blob([svg], { type: 'image/svg+xml' });
            const svgFile = new File(
              [svgBlob], 
              `${values.name.replace(/[^a-z0-9]/gi, '_').toLowerCase() || 'diagram'}.svg`,
              { type: 'image/svg+xml' }
            );
            formData.append('svgFile', svgFile);
          }
        } catch (e) {
          console.warn('Không thể tạo SVG preview:', e);
        }
      }

      // Add SVG file if uploaded
      if (svgFileList.length > 0) {
        formData.append('svgFile', svgFileList[0].originFileObj);
      }

      // Call the API to save the BPMN with the correct organization_id
      const response = await saveBpmn(organization_id, formData);
      console.log('Save BPMN response:', response);
      
      message.success('Tạo BPMN thành công');
      navigate('/bpmn');
    } catch (error) {
      console.error('Error creating BPMN:', error);
      message.error(error.response?.data?.message || 'Có lỗi xảy ra khi tạo BPMN');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bpmn-create-page">
      <BpmnNavigation 
        title="Tạo mới BPMN" 
        extra={[
          <Button 
            key="back" 
            icon={<ArrowLeftOutlined />} 
            onClick={() => navigate(-1)}
          >
            Quay lại
          </Button>,
          <Button 
            key="save" 
            type="primary" 
            icon={<SaveOutlined />} 
            onClick={() => form.submit()}
            loading={loading}
          >
            Lưu
          </Button>
        ]} 
      />
      
      <div style={{ marginTop: 16 }}>
        <Row gutter={16}>
          <Col span={12}>
            <Card title="Thông tin BPMN" style={{ marginBottom: 16 }}>
              <Form
                form={form}
                layout="vertical"
                onFinish={onFinish}
                initialValues={{
                  isPublished: false
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
                  <TextArea rows={4} placeholder="Nhập mô tả (nếu có)" />
                </Form.Item>

                <Form.Item
                  name="isPublished"
                  valuePropName="checked"
                >
                  <div className="ant-form-item-control-input">
                    <div className="ant-form-item-control-input-content">
                      <label>
                        <input 
                          type="checkbox" 
                          checked={form.getFieldValue('isPublished')} 
                          onChange={e => form.setFieldsValue({ isPublished: e.target.checked })} 
                        />
                        <span style={{ marginLeft: 8 }}>Xuất bản ngay</span>
                      </label>
                    </div>
                  </div>
                </Form.Item>

                <Form.Item
                  label="Tải lên file BPMN"
                  extra="Tải lên file .bpmn hoặc tạo mới bằng công cụ bên dưới"
                >
                  <Upload
                    accept=".bpmn,.xml"
                    fileList={fileList}
                    onChange={handleFileChange}
                    beforeUpload={() => false}
                  >
                    <Button icon={<UploadOutlined />}>Chọn file BPMN</Button>
                  </Upload>
                </Form.Item>

                <Form.Item
                  label="Tải lên hình ảnh đại diện (SVG)"
                  extra="Tải lên file SVG để hiển thị hình ảnh đại diện cho BPMN"
                >
                  <Upload
                    accept=".svg"
                    fileList={svgFileList}
                    onChange={handleSvgChange}
                    beforeUpload={() => false}
                  >
                    <Button icon={<UploadOutlined />}>Chọn file SVG</Button>
                  </Upload>
                </Form.Item>
              </Form>
            </Card>
          </Col>
          <Col span={12}>
            <Card title="Trình chỉnh sửa BPMN" style={{ height: '100%' }}>
              <div style={{ height: '600px', border: '1px solid #f0f0f0' }}>
                <BpmnModeler 
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

export default BpmnCreatePage;
