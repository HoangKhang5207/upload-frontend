import React from 'react';
import { Link } from 'react-router-dom';
import { Button, Empty } from 'antd'; // Import Empty và Button
import { PlusOutlined } from '@ant-design/icons'; // Import icon

const WorkflowEmptyState = ({ 
  title = "Không có dữ liệu", 
  description = "Hiện tại không có dữ liệu để hiển thị.", 
  actionText = "Tạo mới", 
  actionLink,
  onAction 
}) => {
  return (
    <Empty
      image={Empty.PRESENTED_IMAGE_SIMPLE}
      description={
        <span>
          <strong style={{ display: 'block', fontSize: '16px' }}>{title}</strong>
          {description}
        </span>
      }
      style={{ padding: '48px 0' }}
    >
      {actionLink ? (
        <Link to={actionLink}>
          <Button type="primary" icon={<PlusOutlined />}>
            {actionText}
          </Button>
        </Link>
      ) : (
        <Button type="primary" icon={<PlusOutlined />} onClick={onAction}>
          {actionText}
        </Button>
      )}
    </Empty>
  );
};

export default WorkflowEmptyState;