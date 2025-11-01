import React, { useState } from 'react';
import { Result } from 'antd';
import { mockProcessPayment } from '../../../api/mockViewerApi';

// Import các component đã được refactor
import PackageSelection from './PackageSelection';
import PaymentConfirmation from './PaymentConfirmation';
import PaymentGateway from './PaymentGateway';
import PaymentResult from './PaymentResult';

// Component mới để xem tài liệu sau khi thanh toán thành công (đã refactor)
import VisitorAccessViewer from './VisitorAccessViewer';

const PaywallFlow = ({ paywallData }) => {
    const [step, setStep] = useState('selection'); // selection, confirmation, gateway, result, success_view
    const [selectedPackage, setSelectedPackage] = useState(null);
    const [paymentResult, setPaymentResult] = useState(null);
    const [paidDocumentData, setPaidDocumentData] = useState(null);

    const handleSelectPackage = (pkg) => {
        setSelectedPackage(pkg);
        setStep('confirmation');
    };

    const handleConfirm = () => {
        setStep('gateway');
    };
    
    const handlePayment = async (details) => {
        const result = await mockProcessPayment(paywallData.document.id, selectedPackage.id, details);
        setPaymentResult(result);
        if(result.success) {
            // Chuẩn bị dữ liệu cho VisitorAccessViewer
            const viewableDocument = {
                ...result.document,
                expiresAt: new Date(new Date().getTime() + 24 * 3600 * 1000).toISOString(), // Giả sử cho xem trong 24h
                sharedBy: 'Hệ thống thanh toán', // Ghi đè người chia sẻ
                watermark: `PAID - ${details.email}` // Thêm watermark email người mua
            };
            setPaidDocumentData(viewableDocument);
        }
        setStep('result');
    };
    
    const handleViewDocument = () => {
        setStep('success_view');
    }

    const handleRetryPayment = () => {
        setStep('selection'); // Quay về bước chọn gói
        setPaymentResult(null);
    }

    switch (step) {
        case 'selection':
            return (
                <PackageSelection
                    document={paywallData.document}
                    packages={paywallData.packages}
                    onSelectPackage={handleSelectPackage}
                />
            );
        case 'confirmation':
            return (
                <PaymentConfirmation
                    document={paywallData.document}
                    selectedPackage={selectedPackage}
                    onConfirm={handleConfirm}
                    onBack={() => setStep('selection')}
                />
            );
        case 'gateway':
            return <PaymentGateway onPayment={handlePayment} amount={selectedPackage.price} />;
        case 'result':
            return (
                <PaymentResult 
                    result={paymentResult} 
                    onViewDocument={handleViewDocument}
                    onRetry={handleRetryPayment} // Thêm hàm retry
                />
            );
        case 'success_view':
            return <VisitorAccessViewer documentData={paidDocumentData} />;
        default:
            return <Result status="warning" title="Trạng thái không hợp lệ" />;
    }
};

export default PaywallFlow;