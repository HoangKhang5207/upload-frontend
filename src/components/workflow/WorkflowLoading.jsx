import React from 'react';
import { Spin } from 'antd'; // Import Spin

const WorkflowLoading = ({ message = "Đang tải dữ liệu..." }) => {
  return (
    <div style={{ 
      textAlign: 'center', 
      padding: '48px 0', 
      width: '100%' 
    }}>
      <Spin size="large" tip={message} />
    </div>
  );
};

export default WorkflowLoading;