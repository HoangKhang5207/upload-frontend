import React, { useState } from 'react';
import { ArrowLeftIcon, LockClosedIcon, ShieldCheckIcon } from '@heroicons/react/24/solid';
import InputField from '../../common/InputField';

const PaymentConfirmation = ({ document, selectedPackage, selectedMethod, onConfirm, onBack, isProcessing }) => {
    const [transactionCode, setTransactionCode] = useState('');
    const [otp, setOtp] = useState('');

    const packageDetails = document.pricing[selectedPackage];

    const handleSubmit = (e) => {
        e.preventDefault();
        onConfirm({ transactionCode, otp });
    };

    const renderMethodSpecificFields = () => {
        switch (selectedMethod) {
            case 'VCB':
                return (
                    <div className="mt-6 space-y-4">
                        <InputField
                            label="Mã giao dịch Vietcombank"
                            id="transactionCode"
                            value={transactionCode}
                            onChange={(e) => setTransactionCode(e.target.value)}
                            required={true}
                            helpText="Nhập mã giao dịch có định dạng: VCB123456789"
                        />
                         <InputField
                            label="Mã OTP (nếu cần)"
                            id="otp"
                            value={otp}
                            onChange={(e) => setOtp(e.target.value)}
                            helpText="OTP chỉ yêu cầu cho giao dịch có giá trị cao"
                        />
                    </div>
                );
            case 'VNPay':
            case 'MoMo':
                 return (
                    <div className="mt-8 text-center p-6 border border-dashed rounded-lg">
                        <ShieldCheckIcon className="h-12 w-12 text-green-500 mx-auto mb-3"/>
                        <h3 className="font-semibold text-lg text-gray-800">Đang chuyển hướng đến {selectedMethod}</h3>
                        <p className="text-gray-600 mt-2">Bạn sẽ được chuyển đến trang thanh toán an toàn của {selectedMethod} để hoàn tất giao dịch.</p>
                    </div>
                 );
            default:
                return null;
        }
    }


    return (
        <div className="bg-white rounded-2xl shadow-xl p-6 sm:p-10 animate-fade-in">
            <div className="flex items-center mb-6">
                <button onClick={onBack} className="p-2 rounded-full hover:bg-gray-100 mr-4">
                    <ArrowLeftIcon className="h-6 w-6 text-gray-600"/>
                </button>
                <h2 className="text-2xl font-bold text-gray-800">Xác nhận thanh toán</h2>
            </div>
            
            <form onSubmit={handleSubmit}>
                <div className="bg-gray-50 border rounded-lg p-6 space-y-3">
                    <h3 className="font-bold text-lg mb-4">Chi tiết giao dịch</h3>
                    <div className="flex justify-between text-gray-700"><span>Tài liệu:</span> <span className="font-semibold text-right">{document.title}</span></div>
                    <div className="flex justify-between text-gray-700"><span>Gói:</span> <span className="font-semibold">{selectedPackage === 'read' ? 'Quyền đọc (7 ngày)' : 'Quyền tải xuống'}</span></div>
                    <div className="flex justify-between text-gray-700"><span>Phương thức:</span> <span className="font-semibold">{selectedMethod}</span></div>
                    <hr className="my-3"/>
                    <div className="flex justify-between text-gray-900">
                        <span className="font-semibold text-lg">Số tiền:</span> 
                        <span className="font-bold text-2xl text-purple-600">{packageDetails.price.toLocaleString('vi-VN')}{packageDetails.currency}</span>
                    </div>
                </div>

                {renderMethodSpecificFields()}

                <div className="mt-8 flex justify-end">
                    <button 
                        type="submit" 
                        disabled={isProcessing}
                        className="w-full sm:w-auto flex items-center justify-center px-8 py-3 font-semibold rounded-lg bg-purple-600 text-white hover:bg-purple-700 disabled:bg-gray-400"
                    >
                        <LockClosedIcon className="h-5 w-5 mr-2"/>
                        {isProcessing ? 'Đang xử lý...' : 'Xác nhận thanh toán'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default PaymentConfirmation;