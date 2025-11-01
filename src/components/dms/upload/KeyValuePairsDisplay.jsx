import React from 'react';
import { Table, Button, Tooltip, Typography, Space } from 'antd';
import { EditOutlined, CopyOutlined } from '@ant-design/icons';
import { App } from 'antd';

const { Text } = Typography;

// Helper function để chuyển snake_case thành Title Case (ví dụ: so_hieu -> Số Hiệu)
const formatKey = (key) => {
  if (!key) return '';
  return key
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

const KeyValuePairsDisplay = ({ keyValuePairs, onEdit }) => {
  const { message } = App.useApp(); // Dùng message của Antd

  const handleCopy = (text) => {
    navigator.clipboard.writeText(text);
    message.success('Đã sao chép vào clipboard!');
  };

  const columns = [
    {
      title: 'Key',
      dataIndex: 'key',
      key: 'key',
      render: (text) => <Text strong>{formatKey(text)}</Text>,
    },
    {
      title: 'Value',
      dataIndex: 'value',
      key: 'value',
      render: (text) => (
        <Tooltip title={text} placement="topLeft">
          <Text
            style={{ maxWidth: 250, display: 'inline-block' }}
            ellipsis={true}
          >
            {text}
          </Text>
        </Tooltip>
      ),
    },
    {
      title: 'Hành động',
      key: 'action',
      align: 'center',
      render: (_, record) => (
        <Space size="small">
          <Tooltip title="Chỉnh sửa">
            <Button 
              type="text" 
              icon={<EditOutlined />} 
              onClick={() => onEdit && onEdit(record.key, record.value)}
            />
          </Tooltip>
          <Tooltip title="Sao chép giá trị">
            <Button 
              type="text" 
              icon={<CopyOutlined />} 
              onClick={() => handleCopy(record.value)}
            />
          </Tooltip>
        </Space>
      ),
    },
  ];

  const dataSource = Object.entries(keyValuePairs || {}).map(([key, value]) => ({
    key: key,
    value: value === null ? <Text type="secondary">(Không có giá trị)</Text> : String(value),
  }));

  return (
    <Table
      columns={columns}
      dataSource={dataSource}
      pagination={false}
      bordered
      size="small"
      title={() => (
        <Text strong style={{ fontSize: '16px' }}>
          Key-Value Pairs Đã Trích Xuất
        </Text>
      )}
      summary={() => (
        <Table.Summary.Row>
          <Table.Summary.Cell colSpan={3}>
            <Text type="secondary" style={{ fontSize: '12px' }}>
              AI gợi ý: Trích xuất tự động bằng PhoNER và UIT-VINER.
            </Text>
          </Table.Summary.Cell>
        </Table.Summary.Row>
      )}
    />
  );
};

export default KeyValuePairsDisplay;