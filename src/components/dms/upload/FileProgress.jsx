import React from 'react';
import { Card, Progress, Button, Typography, Space } from 'antd';
import { FileTextOutlined, CloseCircleOutlined } from '@ant-design/icons';

const { Text } = Typography;

const FileProgress = ({ file, progress, onRemove }) => (
    <Card bordered={false} style={{ backgroundColor: '#fafafa' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Space align="start">
                <FileTextOutlined style={{ fontSize: '32px', color: '#1677ff' }} />
                <div style={{ marginLeft: 8, textAlign: 'left' }}>
                    <Text strong>{file.name}</Text>
                    <br />
                    <Text type="secondary">{(file.size / 1024 / 1024).toFixed(2)} MB</Text>
                </div>
            </Space>
            <Button 
                onClick={onRemove} 
                type="text" 
                danger 
                icon={<CloseCircleOutlined />} 
            />
        </div>
        <div style={{ marginTop: 12 }}>
            <Progress 
                percent={Math.round(progress)} 
                strokeColor={{
                    from: '#108ee9',
                    to: '#87d068',
                }}
            />
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px' }}>
                <Text type="secondary">Đang tải lên...</Text>
                <Text strong>{Math.round(progress)}%</Text>
            </div>
        </div>
    </Card>
);

export default FileProgress;