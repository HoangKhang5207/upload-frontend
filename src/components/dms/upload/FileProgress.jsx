import React from 'react';
import { Progress, Button, Typography, Space, Avatar } from 'antd';
import { 
    FilePdfTwoTone, 
    FileImageTwoTone, 
    FileWordTwoTone, 
    FileUnknownTwoTone, 
    DeleteOutlined,
    CheckCircleFilled 
} from '@ant-design/icons';

const { Text } = Typography;

// Helper: Format file size
const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

// Helper: Get Icon based on mimetype
const getFileIcon = (fileName) => {
    const ext = fileName?.split('.').pop().toLowerCase();
    if (['pdf'].includes(ext)) return <FilePdfTwoTone twoToneColor="#eb2f96" style={{ fontSize: 24 }} />;
    if (['jpg', 'jpeg', 'png', 'tiff'].includes(ext)) return <FileImageTwoTone twoToneColor="#52c41a" style={{ fontSize: 24 }} />;
    if (['doc', 'docx'].includes(ext)) return <FileWordTwoTone twoToneColor="#1890ff" style={{ fontSize: 24 }} />;
    return <FileUnknownTwoTone style={{ fontSize: 24 }} />;
};

const FileProgress = ({ file, progress, onRemove }) => {
    if (!file) return null;

    // Xác định màu sắc dựa trên tiến độ
    const isCompleted = progress === 100;
    const strokeColor = isCompleted ? '#52c41a' : { '0%': '#108ee9', '100%': '#87d068' };

    return (
        <div style={{ 
            background: '#fff', 
            padding: '16px', 
            borderRadius: '8px', 
            border: '1px solid #f0f0f0',
            boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
            marginBottom: '16px'
        }}>
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: 12 }}>
                {/* Icon File */}
                <div style={{ marginRight: 16 }}>
                    {getFileIcon(file.name)}
                </div>

                {/* Thông tin File */}
                <div style={{ flex: 1, overflow: 'hidden' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Text strong ellipsis style={{ maxWidth: '80%' }} title={file.name}>
                            {file.name}
                        </Text>
                        <Text type="secondary" style={{ fontSize: 12 }}>
                            {formatFileSize(file.size)}
                        </Text>
                    </div>
                    {/* Status Text nhỏ bên dưới tên file */}
                    <div>
                        {isCompleted ? (
                            <Text type="success" style={{ fontSize: 12 }}><CheckCircleFilled /> Sẵn sàng xử lý</Text>
                        ) : (
                            <Text type="secondary" style={{ fontSize: 12 }}>Đang tải lên và phân tích...</Text>
                        )}
                    </div>
                </div>

                {/* Nút Xóa (Chỉ hiện khi chưa xong hoặc muốn hủy) */}
                <div style={{ marginLeft: 16 }}>
                    <Button 
                        type="text" 
                        icon={<DeleteOutlined />} 
                        danger 
                        onClick={onRemove}
                        disabled={progress > 0 && progress < 100} // Disable khi đang chạy dở
                    />
                </div>
            </div>

            {/* Thanh Progress Bar */}
            <Progress 
                percent={progress} 
                status={isCompleted ? "success" : "active"}
                strokeColor={strokeColor}
                strokeWidth={8}
                // CSS Transition để mượt mà khi % thay đổi
                style={{ transition: 'all 0.3s ease-in-out' }} 
            />
        </div>
    );
};

export default FileProgress;