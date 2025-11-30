import React from 'react';
import { Tabs, Empty, Typography } from 'antd';

const { Paragraph } = Typography;

const OcrPagedViewer = ({ pages }) => {
    if (!pages || pages.length === 0) {
        return <Empty description="Chưa có nội dung OCR" image={Empty.PRESENTED_IMAGE_SIMPLE} />;
    }

    const items = pages.map((text, index) => ({
        key: index.toString(),
        label: `Trang ${index + 1}`,
        children: (
            <div style={{ 
                padding: '12px', 
                background: '#fafafa', 
                border: '1px solid #f0f0f0', 
                borderRadius: '4px',
                height: '300px', // Fixed height for scroll
                overflowY: 'auto',
                whiteSpace: 'pre-wrap',
                fontFamily: 'Consolas, Menlo, monospace',
                fontSize: '13px',
                color: '#333'
            }}>
                <Paragraph copyable={{ text: text }}>{text || "(Trang trắng)"}</Paragraph>
            </div>
        ),
    }));

    return <Tabs defaultActiveKey="0" items={items} type="card" size="small" />;
};

export default OcrPagedViewer;