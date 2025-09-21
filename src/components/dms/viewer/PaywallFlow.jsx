import React, { useState } from 'react';
import { mockProcessPayment } from '../../../api/mockViewerApi';

// Import các component đã có từ source code
import PackageSelection from './PackageSelection';
import PaymentConfirmation from './PaymentConfirmation';
import PaymentGateway from './PaymentGateway';
import PaymentResult from './PaymentResult';

// Component mới để xem tài liệu sau khi thanh toán thành công
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
            setPaidDocumentData(result.document);
        }
        setStep('result');
    };
    
    const handleViewDocument = () => {
        // Thêm trường expiresAt để tái sử dụng VisitorAccessViewer
        const viewableDocument = {
            ...paidDocumentData,
            expiresAt: new Date(new Date().getTime() + 24 * 3600 * 1000).toISOString(), // Giả sử cho xem trong 24h
            sharedBy: 'Hệ thống thanh toán'
        }
        setPaidDocumentData(viewableDocument);
        setStep('success_view');
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
            return <PaymentResult result={paymentResult} onViewDocument={handleViewDocument} />;
        case 'success_view':
            return <VisitorAccessViewer documentData={paidDocumentData} />;
        default:
            return <div>Trạng thái không hợp lệ</div>;
    }
};

export default PaywallFlow;