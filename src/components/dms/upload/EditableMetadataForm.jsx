import React, { useState, useEffect } from 'react';
import { Form, Input, Select, Tag, Button } from 'antd';
import { PlusOutlined, TagOutlined, FileTextOutlined, FolderOutlined, ProfileOutlined } from '@ant-design/icons';
import { documentCategories, documentTypes } from '../../../data/documentCategories';

const { Option } = Select;
const { TextArea } = Input;

const EditableMetadataForm = ({ metadata, onValuesChange }) => {
  const [form] = Form.useForm();
  const [newKeyword, setNewKeyword] = useState('');

  // Đồng bộ props `metadata` vào Form khi nó thay đổi từ bên ngoài
  useEffect(() => {
    form.setFieldsValue({
      ...metadata,
      keywords: metadata.keywords || [], // Đảm bảo keywords là mảng
    });
  }, [metadata, form]);

  const handleValuesChange = (changedValues, allValues) => {
    onValuesChange(allValues); // Gửi tất cả giá trị lên component cha
  };

  const addKeyword = (e) => {
    e.preventDefault();
    if (newKeyword.trim()) {
      const currentKeywords = form.getFieldValue('keywords') || [];
      if (!currentKeywords.includes(newKeyword.trim())) {
        const newKeywords = [...currentKeywords, newKeyword.trim()];
        form.setFieldsValue({ keywords: newKeywords });
        onValuesChange(form.getFieldsValue()); // Cập nhật cha
        setNewKeyword('');
      }
    }
  };

  const removeKeyword = (keywordToRemove) => {
    const currentKeywords = form.getFieldValue('keywords');
    const newKeywords = currentKeywords.filter(keyword => keyword !== keywordToRemove);
    form.setFieldsValue({ keywords: newKeywords });
    onValuesChange(form.getFieldsValue()); // Cập nhật cha
  };

  return (
    <Form
      form={form}
      layout="vertical"
      initialValues={metadata}
      onValuesChange={handleValuesChange}
    >
      <Form.Item
        name="title"
        label="Tiêu đề"
        rules={[{ required: true, message: 'Vui lòng nhập tiêu đề!' }]}
      >
        <Input prefix={<FileTextOutlined />} placeholder="Nhập tiêu đề tài liệu" />
      </Form.Item>

      <Form.Item
        name="description"
        label="Mô tả"
      >
        <TextArea rows={4} placeholder="Nhập mô tả chi tiết" />
      </Form.Item>

      <Form.Item
        name="category"
        label="Danh mục"
        rules={[{ required: true, message: 'Vui lòng chọn danh mục!' }]}
      >
        <Select placeholder="Chọn danh mục" prefix={<FolderOutlined />}>
          {documentCategories.map(category => (
            <Option key={category.id} value={category.id}>
              {category.name}
            </Option>
          ))}
        </Select>
      </Form.Item>

      <Form.Item
        name="documentType"
        label="Loại tài liệu"
        rules={[{ required: true, message: 'Vui lòng chọn loại tài liệu!' }]}
      >
        <Select placeholder="Chọn loại tài liệu" prefix={<ProfileOutlined />}>
          {documentTypes.map(type => (
            <Option key={type.id} value={type.id}>
              {type.name}
            </Option>
          ))}
        </Select>
      </Form.Item>

      <Form.Item
        label="Từ khóa"
      >
        <div>
          <div style={{ marginBottom: 8 }}>
            {(form.getFieldValue('keywords') || []).map((keyword) => (
              <Tag
                closable
                key={keyword}
                onClose={() => removeKeyword(keyword)}
                style={{ marginBottom: 4 }}
                icon={<TagOutlined />}
              >
                {keyword}
              </Tag>
            ))}
          </div>
          <Input.Group compact>
            <Input
              style={{ width: 'calc(100% - 90px)' }}
              value={newKeyword}
              onChange={(e) => setNewKeyword(e.target.value)}
              onPressEnter={addKeyword}
              placeholder="Thêm từ khóa mới"
            />
            <Button type="dashed" onClick={addKeyword} icon={<PlusOutlined />}>
              Thêm
            </Button>
          </Input.Group>
        </div>
      </Form.Item>
    </Form>
  );
};

export default EditableMetadataForm;