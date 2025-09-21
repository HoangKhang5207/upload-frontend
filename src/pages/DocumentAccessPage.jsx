import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

// --- API ---
import { mockGetDocumentAccessDetails } from '../api/mockViewerApi';

// --- Components ---
import VisitorAccessViewer from '../components/dms/viewer/VisitorAccessViewer';
import PaywallFlow from '../components/dms/viewer/PaywallFlow';
import { ExclamationCircleIcon } from '@heroicons/react/24/solid';

const LoadingSpinner = () => (
    <div className="flex flex-col items-center justify-center h-full">
        <svg className="animate-spin -ml-1 mr-3 h-10 w-10 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        <p className="mt-4 text-gray-600">Đang kiểm tra quyền truy cập...</p>
    </div>
);

const ErrorMessage = ({ message }) => (
     <div className="text-center">
        <ExclamationCircleIcon className="h-16 w-16 mx-auto text-red-400" />
        <h2 className="mt-4 text-2xl font-bold text-gray-800">Không thể truy cập</h2>
        <p className="mt-2 text-gray-600">{message}</p>
    </div>
);


const DocumentAccessPage = () => {
    const { docId } = useParams();
    const [loading, setLoading] = useState(true);
    const [accessData, setAccessData] = useState(null);
    const [error, setError] = useState(null);

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
            } finally {
                setLoading(false);
            }
        };

        fetchAccess();
    }, [docId]);
    
    const renderContent = () => {
        if (loading) return <LoadingSpinner />;
        if (error) return <ErrorMessage message={error} />;
        if (!accessData) return <ErrorMessage message="Không có dữ liệu truy cập." />;

        switch (accessData.accessType) {
            case 'VISITOR':
                return <VisitorAccessViewer documentData={accessData.document} />;
            case 'PAYMENT_REQUIRED':
                return <PaywallFlow paywallData={accessData} />;
            default:
                return <ErrorMessage message={`Loại truy cập '${accessData.accessType}' không được hỗ trợ.`} />;
        }
    };

    return (
        <>
            <Toaster position="top-right" />
            <div className="bg-gray-100 min-h-screen flex items-center justify-center p-4">
                <div className="w-full max-w-6xl bg-white rounded-2xl shadow-xl min-h-[80vh] p-4 sm:p-8 flex flex-col justify-center">
                    {renderContent()}
                </div>
            </div>
        </>
    );
};

export default DocumentAccessPage;