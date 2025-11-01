import React from 'react';
import { Layout, Button, Pagination, Statistic, Tag, Typography, Space, Tooltip, Result } from 'antd';
import { UserOutlined, ClockCircleOutlined, DownloadOutlined, LockOutlined, LeftOutlined, RightOutlined } from '@ant-design/icons';

const { Header, Content, Footer } = Layout;
const { Title, Text, Paragraph } = Typography;
const { Countdown } = Statistic;

const VisitorAccessViewer = ({ documentData }) => {
    // Component này giờ nhận documentData đã được thanh toán (từ PaywallFlow) 
    // hoặc documentData công khai (từ DocumentAccessPage)
    const [currentPage, setCurrentPage] = React.useState(1);
    
    const onPageChange = (page) => {
        setCurrentPage(page);
    };

    const isPaid = documentData.sharedBy === 'Hệ thống thanh toán';
    const isExpired = new Date(documentData.expiresAt).getTime() < Date.now();

    if (isExpired) {
        return (
            <Result
                status="warning"
                title="Link truy cập đã hết hạn"
                subTitle="Vui lòng liên hệ người chia sẻ để có link mới."
            />
        );
    }

    return (
        <Layout style={{ height: '100%', backgroundColor: '#fff' }}>
            <Header style={{ backgroundColor: '#fff', borderBottom: '1px solid #f0f0f0', padding: '0 24px', height: 'auto' }}>
                <Space direction="vertical" style={{width: '100%', padding: '12px 0'}}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                        <Title level={4} style={{ margin: 0 }}>{documentData.name}</Title>
                        <Space>
                            <Tag icon={<UserOutlined />} color="blue">
                                Chia sẻ bởi: {documentData.sharedBy}
                            </Tag>
                            <Countdown 
                                title="Hết hạn sau" 
                                value={documentData.expiresAt} 
                                format="HH:mm:ss" 
                                valueStyle={{ fontSize: '16px', color: '#cf1322' }}
                            />
                        </Space>
                    </div>
                </Space>
            </Header>

            <Content style={{ backgroundColor: '#f0f2f5', padding: '24px', position: 'relative', overflow: 'hidden' }}>
                {/* Watermark */}
                <div style={{
                    position: 'absolute',
                    inset: 0,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    pointerEvents: 'none',
                    zIndex: 10,
                    overflow: 'hidden'
                }}>
                    <Text
                        style={{
                            fontSize: 'calc(5vw + 2rem)', // Responsive font size
                            fontWeight: 'bold',
                            color: 'rgba(0, 0, 0, 0.08)',
                            transform: 'rotate(-45deg)',
                            whiteSpace: 'nowrap',
                            userSelect: 'none'
                        }}
                    >
                        {documentData.watermark}
                    </Text>
                </div>
                
                {/* Document Content */}
                <div style={{ 
                    maxWidth: 800, 
                    margin: '0 auto', 
                    backgroundColor: '#fff', 
                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                    minHeight: '60vh',
                    padding: '24px 32px'
                }}>
                    <Paragraph>
                        <Text strong>Nội dung trang {currentPage} / {documentData.totalPages}</Text>
                        <br />
                        {documentData.pagesContent[currentPage - 1]}
                    </Paragraph>
                </div>
            </Content>

            <Footer style={{ backgroundColor: '#fff', borderTop: '1px solid #f0f0f0', padding: '16px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Space>
                    <Tooltip title={isPaid ? "Bạn đã mua tài liệu này" : "Tài liệu công khai, không thể tải xuống"}>
                        <Button icon={<DownloadOutlined />} disabled={!isPaid}>
                            Tải xuống
                        </Button>
                    </Tooltip>
                    <Tooltip title="Tính năng in bị vô hiệu hóa">
                        <Button icon={<LockOutlined />} disabled>
                            In
                        </Button>
                    </Tooltip>
                </Space>
                <Pagination
                    current={currentPage}
                    total={documentData.totalPages}
                    pageSize={1}
                    onChange={onPageChange}
                    size="small"
                />
            </Footer>
        </Layout>
    );
};

export default VisitorAccessViewer;