import React from 'react';
import { App, Tabs, Button, Table, Typography, Tooltip, Tag, Space, Card } from 'antd';
import { 
  FileTextOutlined, 
  DatabaseOutlined, 
  TableOutlined,
  CopyOutlined
} from '@ant-design/icons';

const { Text, Paragraph } = Typography;

const OcrResultTabs = ({ result }) => {
    const { message } = App.useApp();

    const copyToClipboard = (text) => {
        navigator.clipboard.writeText(text);
        message.success("Đã sao chép vào clipboard!");
    };

    // Cấu hình cột cho Key-Value Pairs
    const kvpColumns = [
        {
            title: 'Key',
            dataIndex: 'key',
            key: 'key',
            render: (text) => <Text strong>{text.replace(/_/g, ' ')}</Text>
        },
        {
            title: 'Value',
            dataIndex: 'value',
            key: 'value',
        },
        {
            title: 'Độ tin cậy',
            dataIndex: 'confidence',
            key: 'confidence',
            render: (conf) => <Tag color="blue">{conf.toFixed(1)}%</Tag>
        }
    ];

    // Cấu hình cột cho Bảng biểu
    const tableColumns = (headers) => headers.map(h => ({
        title: h,
        dataIndex: h,
        key: h,
    }));

    // Chuyển đổi dữ liệu bảng
    const tableDataSource = (headers, rows) => rows.map((row, index) => {
        let rowObj = { key: index };
        headers.forEach((h, i) => {
            rowObj[h] = row[i];
        });
        return rowObj;
    });


    const items = [
        {
            key: 'text',
            label: (
                <span>
                    <FileTextOutlined /> Văn bản trích xuất
                </span>
            ),
            children: (
                <div style={{ position: 'relative' }}>
                    <Button 
                        icon={<CopyOutlined />}
                        onClick={() => copyToClipboard(result.extractedText)} 
                        style={{ position: 'absolute', top: 16, right: 16, zIndex: 1 }}
                        ghost
                        type="primary"
                    >
                        Sao chép
                    </Button>
                    <Paragraph 
                        style={{ 
                            maxHeight: 500, 
                            overflowY: 'auto', 
                            padding: '24px', 
                            backgroundColor: '#fafafa',
                            borderRadius: '8px',
                            border: '1px solid #f0f0f0'
                        }}
                    >
                        <pre style={{ whiteSpace: 'pre-wrap', margin: 0, fontFamily: 'inherit' }}>
                            {result.extractedText}
                        </pre>
                    </Paragraph>
                </div>
            )
        },
        {
            key: 'kvp',
            label: (
                <span>
                    <DatabaseOutlined /> Key-Value Pairs
                </span>
            ),
            children: (
                <Table
                    columns={kvpColumns}
                    dataSource={result.keyValuePairs}
                    rowKey="key"
                    pagination={false}
                    bordered
                    size="small"
                />
            )
        },
        {
            key: 'tables',
            label: (
                <span>
                    <TableOutlined /> Bảng biểu
                </span>
            ),
            children: (
                <Space direction="vertical" style={{ width: '100%' }}>
                    {result.tables.map((table, i) => (
                        <Card key={i} title={table.name} size="small">
                            <Table
                                columns={tableColumns(table.headers)}
                                dataSource={tableDataSource(table.headers, table.rows)}
                                pagination={false}
                                bordered
                                size="small"
                                scroll={{ x: true }} // Cho phép cuộn ngang nếu bảng quá rộng
                            />
                        </Card>
                    ))}
                </Space>
            )
        }
    ];

    return (
        <Card bordered={false} style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
            <Tabs defaultActiveKey="text" items={items} />
        </Card>
    );
};

export default OcrResultTabs;