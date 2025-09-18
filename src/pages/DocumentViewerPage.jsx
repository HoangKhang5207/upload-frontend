import React, { useState, useEffect } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { getDocumentDetails } from '../api/mockViewerApi';
import VisitorPreview from '../components/dms/viewer/VisitorPreview';
import PaymentGateway from '../components/dms/viewer/PaymentGateway';

const DocumentViewerPage = () => {
    const { docId } = useParams();
    const [searchParams] = useSearchParams();
    const [document, setDocument] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchDocument = async () => {
            const token = searchParams.get('token');
            setIsLoading(true);
            try {
                const response = await getDocumentDetails(docId, token);
                if (response.success) {
                    setDocument(response.data);
                } else {
                    setError(response.error);
                }
            } catch (err) {
                setError("Lỗi hệ thống, không thể tải tài liệu.");
            } finally {
                setIsLoading(false);
            }
        };

        fetchDocument();
    }, [docId, searchParams]);

    if (isLoading) {
        return <div className="flex justify-center items-center h-screen">Đang tải tài liệu...</div>;
    }

    if (error) {
        return <div className="flex justify-center items-center h-screen text-red-500">{error}</div>;
    }

    if (!document) {
        return null;
    }

    return (
        <div className="bg-gray-50 min-h-screen">
            {document.accessType === 'public' && <VisitorPreview document={document} />}
            {document.accessType === 'paid' && <PaymentGateway document={document} />}
        </div>
    );
};

export default DocumentViewerPage;