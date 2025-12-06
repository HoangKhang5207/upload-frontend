import React from 'react';
import { Link } from 'react-router-dom';
import { 
  UploadOutlined, 
  BulbOutlined, 
  ApartmentOutlined, 
  ExperimentOutlined, 
  CopyOutlined,
  LinkOutlined,
  CreditCardOutlined,
  SyncOutlined, // Thay thế ArrowPathIcon
  BookOutlined, // Thay thế cho documentation
  RightCircleOutlined // Thay thế ArrowRightCircleIcon
} from '@ant-design/icons';
import { Card, Row, Col, Typography, Button, Alert } from 'antd';

const { Title, Paragraph } = Typography;
const { Meta } = Card;

const useCases = [
    {
        path: '/uc39-upload-workflow',
        icon: <UploadOutlined style={{ fontSize: '24px' }} />,
        title: 'UC-39: Quy trình Upload Tổng thể',
        description: 'Luồng nghiệp vụ hoàn chỉnh, tích hợp tất cả các tính năng từ kiểm tra, xử lý, đến lưu trữ và định tuyến.',
    },
    {
        path: '/uc73-suggest-metadata',
        icon: <BulbOutlined style={{ fontSize: '24px' }} />,
        title: 'UC-73: Gợi ý Metadata',
        description: 'Demo tính năng AI phân tích và tự động đề xuất siêu dữ liệu cho tài liệu.',
    },
    {
        path: '/uc84-auto-route',
        icon: <RightCircleOutlined style={{ fontSize: '24px' }} />,
        title: 'UC-84: Tự động Định tuyến',
        description: 'Tải lên và xem tài liệu được tự động gửi vào quy trình nghiệp vụ dựa trên danh mục.',
    },
    {
        path: '/uc87-ocr-processing',
        icon: <ExperimentOutlined style={{ fontSize: '24px' }} />,
        title: 'UC-87: Trích xuất Dữ liệu OCR',
        description: 'Demo khả năng nhận dạng và bóc tách văn bản, key-value từ file ảnh hoặc PDF.',
    },
    {
        path: '/uc88-duplicate-check',
        icon: <CopyOutlined style={{ fontSize: '24px' }} />,
        title: 'UC-88: Kiểm tra Trùng lặp',
        description: 'Tải lên một file để hệ thống phân tích sâu và tìm ra các tài liệu tương tự.',
    },
    {
        path: '/document/access/visitor-123',
        icon: <LinkOutlined style={{ fontSize: '24px' }} />,
        title: 'UC-86: Truy cập Công khai',
        description: 'Mô phỏng truy cập một tài liệu được chia sẻ công khai có giới hạn thời gian.',
    },
    {
        path: '/document/access/paid-456',
        icon: <CreditCardOutlined style={{ fontSize: '24px' }} />,
        title: 'UC-85: Yêu cầu Trả phí',
        description: 'Mô phỏng truy cập một tài liệu yêu cầu người dùng trả phí để có thể xem nội dung.',
    },
    {
        path: '/workflows',
        icon: <SyncOutlined style={{ fontSize: '24px' }} />,
        title: 'Quản lý Workflow',
        description: 'Quản lý các quy trình xử lý tài liệu và workflow. Bao gồm: danh sách workflow, thiết kế workflow, khởi tạo quy trình và theo dõi tiến trình.',
    }
];

const FeatureCard = ({ path, icon, title, description }) => {
    return (
        <Col xs={24} md={12} lg={8}>
            <Link to={path}>
                <Card hoverable style={{ height: '100%' }}>
                    <Meta
                        avatar={icon}
                        title={<Title level={5}>{title}</Title>}
                        description={description}
                    />
                </Card>
            </Link>
        </Col>
    );
};


const HomePage = () => {
    return (
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
            <div style={{ textAlign: 'center', marginBottom: 40 }}>
                <Title level={1} style={{ 
                    fontWeight: 800, 
                    margin: 0,
                    background: 'linear-gradient(to right, #6b46c1, #3b82f6)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                }}>
                    DMS Upload Frontend
                </Title>
                <Paragraph style={{ fontSize: '18px', color: '#555', marginTop: 8 }}>
                    Dashboard demo các tính năng và quy trình nghiệp vụ đã được triển khai.
                </Paragraph>
            </div>

            <Row gutter={[24, 24]}>
                {useCases.map((uc) => (
                    <FeatureCard key={uc.path} {...uc} />
                ))}
            </Row>
            
            <Alert
                message={<Title level={4}>Hướng dẫn sử dụng</Title>}
                description={
                    <Paragraph>
                        Để bắt đầu với hệ thống quản lý workflow, hãy truy cập vào chức năng "Quản lý Workflow" 
                        và làm theo hướng dẫn trong tài liệu. Bạn có thể thiết kế sơ đồ quy trình, khởi tạo quy trình 
                        mới và theo dõi tiến trình của các quy trình đang chạy.
                    </Paragraph>
                }
                type="info"
                showIcon
                style={{ marginTop: 40 }}
                action={
                    <Link to="/workflow-documentation">
                        <Button type="primary" icon={<BookOutlined />}>
                            Xem tài liệu hướng dẫn
                        </Button>
                    </Link>
                }
            />
        </div>
    );
};

export default HomePage;