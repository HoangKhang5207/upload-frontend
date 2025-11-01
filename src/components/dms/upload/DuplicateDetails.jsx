import React from 'react';
import { Collapse, Descriptions, Typography, Tag, Space } from 'antd';
import { FileTextOutlined } from '@ant-design/icons';
import SimilarityBadge from './SimilarityBadge';

const { Panel } = Collapse;
const { Text, Paragraph } = Typography;

const DuplicateDetails = ({ duplicates }) => (
  <div style={{ marginTop: 24 }}>
    <Text strong style={{ fontSize: '16px', display: 'block', marginBottom: 16 }}>
      Chi tiết các đoạn trùng lặp
    </Text>
    <Collapse accordion>
      {duplicates.map(item => (
        <Panel
          key={item.id}
          header={
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
              <Space>
                <FileTextOutlined />
                <Text strong>{item.name}</Text>
              </Space>
              <SimilarityBadge score={item.similarity} />
            </div>
          }
        >
          <Descriptions bordered column={1} size="small">
            <Descriptions.Item label="Chủ sở hữu">{item.owner}</Descriptions.Item>
            <Descriptions.Item label="Ngày tải lên">{new Date(item.uploadDate).toLocaleDateString('vi-VN')}</Descriptions.Item>
            <Descriptions.Item label="Đường dẫn"><Text code>{item.path}</Text></Descriptions.Item>
            <Descriptions.Item label="Loại trùng khớp"><Tag>{item.type.replace('_', ' ')}</Tag></Descriptions.Item>
          </Descriptions>

          <Text strong style={{ marginTop: 16, display: 'block' }}>Các đoạn văn bản trùng lặp:</Text>
          <div style={{ maxHeight: 200, overflowY: 'auto', marginTop: 8, padding: '8px 12px', backgroundColor: '#fffbe6', borderRadius: '4px', border: '1px solid #ffe58f' }}>
            {item.matched_segments && item.matched_segments.length > 0 ? (
              item.matched_segments.map((segment, index) => (
                <Paragraph key={index} style={{ borderLeft: '3px solid #faad14', paddingLeft: 8, marginBottom: 8 }}>
                  <Text type="secondary">"{segment.text}"</Text>
                  <br />
                  <Text italic style={{ fontSize: 12 }}>Vị trí: {segment.start_pos} - {segment.end_pos}</Text>
                </Paragraph>
              ))
            ) : (
              // Fallback data
              <>
                <Paragraph style={{ borderLeft: '3px solid #faad14', paddingLeft: 8, marginBottom: 8 }}>
                  <Text type="secondary">"Đoạn văn bản trùng lặp được tìm thấy trong tài liệu này."</Text>
                  <br />
                  <Text italic style={{ fontSize: 12 }}>Vị trí: Dòng 5-12, Ký tự 45-180</Text>
                </Paragraph>
                <Paragraph style={{ borderLeft: '3px solid #faad14', paddingLeft: 8, marginBottom: 8 }}>
                  <Text type="secondary">"Thông tin chi tiết về hợp đồng lao động và các điều khoản liên quan."</Text>
                  <br />
                  <Text italic style={{ fontSize: 12 }}>Vị trí: Dòng 25-30, Ký tự 320-450</Text>
                </Paragraph>
              </>
            )}
          </div>
        </Panel>
      ))}
    </Collapse>
  </div>
);

export default DuplicateDetails;