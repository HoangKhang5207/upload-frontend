import React from 'react';
import { Table, Tag, Typography } from 'antd';
import { WarningFilled } from '@ant-design/icons';
import SimilarityBadge from './SimilarityBadge'; // Component đã refactor ở Bước 1

const { Text } = Typography;

const StatisticsTable = ({ duplicates }) => {
  const columns = [
    {
      title: 'File',
      dataIndex: 'name',
      key: 'name',
      render: (text) => <Text strong>{text}</Text>,
    },
    {
      title: '% Trùng',
      dataIndex: 'similarity',
      key: 'similarity',
      align: 'center',
      render: (score) => <SimilarityBadge score={score} />,
    },
    {
      title: 'Số đoạn trùng',
      dataIndex: 'matched_segments',
      key: 'matched_segments',
      align: 'center',
      render: (segments) => <Text>{segments?.length || 1}</Text>,
    },
    {
      title: 'Cảnh báo',
      key: 'warning',
      dataIndex: 'similarity',
      render: (similarity) => (
        similarity > 30 ? (
          <Tag icon={<WarningFilled />} color="error">
            Vượt ngưỡng cho phép
          </Tag>
        ) : (
          <Tag color="success">An toàn</Tag>
        )
      ),
    },
  ];

  return (
    <Table
      columns={columns}
      dataSource={duplicates}
      rowKey="id"
      bordered
      title={() => <Text strong style={{ fontSize: '16px' }}>Bảng thống kê</Text>}
      pagination={false}
      style={{ marginTop: 24 }}
    />
  );
};

export default StatisticsTable;