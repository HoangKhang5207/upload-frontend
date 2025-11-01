import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { App, Spin, Result, Button, Card, Layout } from 'antd'; // Import App, Spin, Result...

// --- API ---
import { mockGetDocumentAccessDetails } from '../api/mockViewerApi';

// --- Components (ĐÃ REFACTOR) ---
import VisitorAccessViewer from '../components/dms/viewer/VisitorAccessViewer';
import PaywallFlow from '../components/dms/viewer/PaywallFlow';

const { Content } = Layout;

const LoadingSpinner = () => (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
        <Spin size="large" tip="Đang kiểm tra quyền truy cập..." />
    </div>
);

const ErrorMessage = ({ message }) => (
     <Result
        status="error"
        title="Không thể truy cập"
        subTitle={message}
        extra={
            <Link to="/">
                <Button type="primary">Quay về trang chủ</Button>
            </Link>
        }
    />
);


const DocumentAccessPage = () => {
    const { docId } = useParams();
    const [loading, setLoading] = useState(true);
    const [accessData, setAccessData] = useState(null);
    const [error, setError] = useState(null);

    // Dùng notification của Antd (mặc dù API mock không dùng nhưng nên có sẵn)
    const { notification } = App.useApp();

    useEffect(() => {
        if (!docId) {
            setError("Không tìm thấy ID tài liệu.");
            setLoading(false);
            return;
        }

        const fetchAccess = async () => {
            setLoading(true);
            try {
                const result = await mockGetDocumentAccessDetails(docId);
                if (result.success) {
                    setAccessData(result);
                } else {
                    setError(result.message);
                }
            } catch (err) {
                setError("Đã có lỗi xảy ra khi kết nối tới máy chủ.");
                notification.error({
                    message: 'Lỗi máy chủ',
                    description: err.message,
                    placement: 'topRight'
                });
            } finally {
                setLoading(false);
            }
        };

        // Giả lập thời gian load
        setTimeout(fetchAccess, 500);
        
    }, [docId, notification]);
    
    const renderContent = () => {
        if (loading) return <LoadingSpinner />;
        if (error) return <ErrorMessage message={error} />;
        if (!accessData) return <ErrorMessage message="Không có dữ liệu truy cập." />;

        // Nếu là VISITOR, chúng ta không cần Card bao bọc vì VisitorAccessViewer đã là một Layout đầy đủ
        if (accessData.accessType === 'VISITOR') {
            return <VisitorAccessViewer documentData={accessData.document} />;
        }
        
        // Nếu là PAYWALL, chúng ta bọc trong Card
        if (accessData.accessType === 'PAYMENT_REQUIRED') {
             return (
                <Card style={{ width: '100%', maxWidth: '1000px', minHeight: '80vh' }}>
                    <PaywallFlow paywallData={accessData} />
                </Card>
             );
        }

        return <ErrorMessage message={`Loại truy cập '${accessData.accessType}' không được hỗ trợ.`} />;
    };

    return (
        // Trang này nằm ngoài MainLayout, nên ta tự tạo Layout
        <Layout style={{ minHeight: '100vh', backgroundColor: '#f0f2f5' }}>
            <Content style={{ 
                display: 'flex', 
                justifyContent: 'center', 
                alignItems: 'center', 
                padding: '24px' 
            }}>
                {renderContent()}
            </Content>
        </Layout>
    );
};

export default DocumentAccessPage;