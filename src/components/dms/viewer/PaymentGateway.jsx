import React, { useState } from 'react';
import PackageSelection from './PackageSelection';
import PaymentConfirmation from './PaymentConfirmation';
import PaymentResult from './PaymentResult';
import { processPayment } from '../../../api/mockViewerApi';

const PaymentGateway = ({ document }) => {
    // Quản lý các bước của quy trình thanh toán
    // 1: Chọn gói, 2: Xác nhận thanh toán, 3: Kết quả
    const [step, setStep] = useState(1);

    // Lưu trữ lựa chọn của người dùng
    const [selectedPackage, setSelectedPackage] = useState(null);
    const [selectedMethod, setSelectedMethod] = useState(null);

    // Lưu kết quả giao dịch và trạng thái loading
    const [paymentResult, setPaymentResult] = useState(null);
    const [isProcessing, setIsProcessing] = useState(false);

    // Hàm xử lý khi người dùng chọn gói và phương thức
    const handleProceedToConfirmation = (pkg, method) => {
        setSelectedPackage(pkg);
        setSelectedMethod(method);
        setStep(2);
    };
    
    // Hàm xử lý khi người dùng xác nhận thanh toán
    const handleConfirmPayment = async (paymentDetails) => {
        setIsProcessing(true);
        try {
            const result = await processPayment(document.docId, selectedPackage, selectedMethod, paymentDetails);
            setPaymentResult(result);
        } catch (error) {
             setPaymentResult({ success: false, error: 'Lỗi hệ thống, không thể xử lý thanh toán.' });
        } finally {
            setIsProcessing(false);
            setStep(3);
        }
    };
    
    // Hàm để quay lại bước chọn gói
    const handleGoBack = () => {
        setStep(1);
        setSelectedPackage(null);
        setSelectedMethod(null);
    }

    // Hàm để thử lại thanh toán
    const handleRetry = () => {
        setStep(2); // Quay lại màn hình xác nhận của phương thức đã chọn
        setPaymentResult(null);
    }

    const renderCurrentStep = () => {
        switch (step) {
            case 1:
                return (
                    <PackageSelection
                        document={document}
                        onProceed={handleProceedToConfirmation}
                    />
                );
            case 2:
                return (
                    <PaymentConfirmation
                        document={document}
                        selectedPackage={selectedPackage}
                        selectedMethod={selectedMethod}
                        onConfirm={handleConfirmPayment}
                        onBack={handleGoBack}
                        isProcessing={isProcessing}
                    />
                );
            case 3:
                return (
                    <PaymentResult
                        result={paymentResult}
                        document={document}
                        onRetry={handleRetry}
                    />
                );
            default:
                return <PackageSelection document={document} onProceed={handleProceedToConfirmation} />;
        }
    };

    return (
        <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
            <div className="w-full max-w-4xl">
                {renderCurrentStep()}
            </div>
        </div>
    );
};

export default PaymentGateway;