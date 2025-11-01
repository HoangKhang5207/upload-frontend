import React, { useState } from 'react';
import { Card, Pagination, Typography, Empty } from 'antd';
import { FilePdfOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;

const PdfViewer = ({ totalPages, fileName }) => {
  const [currentPage, setCurrentPage] = useState(1);

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  return (
    <Card
      title={
        <Title level={5} style={{ margin: 0, display: 'flex', alignItems: 'center' }}>
          <FilePdfOutlined style={{ marginRight: 8 }} />
          Xem trước tài liệu
        </Title>
      }
      bordered={false}
      style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}
    >
      {/* PDF Viewer Area - Giả lập */}
      <div 
        style={{ 
          height: 320, 
          backgroundColor: '#f0f2f5', 
          borderRadius: 8, 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          border: '1px dashed #d9d9d9',
          padding: 16,
          textAlign: 'center'
        }}
      >
        <div>
          <Empty 
            image={<FilePdfOutlined style={{ fontSize: 60, color: '#8c8c8c' }} />}
            description={false}
          />
          <Text strong style={{ display: 'block', marginTop: 16 }}>{fileName}</Text>
          <Text type="secondary">Đang hiển thị trang {currentPage} / {totalPages}</Text>
        </div>
      </div>
      
      {/* Page Navigation */}
      <div style={{ display: 'flex', justifyContent: 'center', marginTop: 16 }}>
        <Pagination
          current={currentPage}
          total={totalPages}
          pageSize={1} // Mỗi lần chỉ 1 trang
          onChange={handlePageChange}
          size="small"
        />
      </div>
    </Card>
  );
};

export default PdfViewer;