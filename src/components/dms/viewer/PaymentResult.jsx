import React from 'react';
import { CheckCircleIcon, XCircleIcon, EyeIcon, ArrowPathIcon } from '@heroicons/react/24/solid';

const PaymentResult = ({ result, onViewDocument, onRetry }) => {
    // Điều kiện bảo vệ nếu chưa có kết quả
    if (!result) {
        return <div className="text-center p-10">Đang chờ kết quả thanh toán...</div>;
    }

    const { success, message, transactionId } = result;

    return (
        <div className="max-w-xl mx-auto text-center animate-fade-in">
            {success ? (
                <CheckCircleIcon className="h-20 w-20 text-green-500 mx-auto" />
            ) : (
                <XCircleIcon className="h-20 w-20 text-red-500 mx-auto" />
            )}
            
            <h2 className={`mt-6 text-3xl font-bold ${success ? 'text-gray-800' : 'text-red-700'}`}>
                {success ? 'Thanh toán thành công!' : 'Thanh toán thất bại'}
            </h2>
            
            <p className="mt-2 text-gray-600">{message}</p>
            
            {success && transactionId && (
                <div className="mt-4 text-sm text-gray-500">
                    Mã giao dịch: <span className="font-mono bg-gray-100 p-1 rounded">{transactionId}</span>
                </div>
            )}
            
            <div className="mt-8">
                {success ? (
                    <button 
                        onClick={onViewDocument} 
                        className="px-8 py-3 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 flex items-center justify-center mx-auto"
                    >
                        <EyeIcon className="h-5 w-5 mr-2" />
                        Xem tài liệu ngay
                    </button>
                ) : (
                    <button 
                        onClick={onRetry} 
                        className="px-8 py-3 bg-gray-600 text-white font-bold rounded-lg hover:bg-gray-700 flex items-center justify-center mx-auto"
                    >
                        <ArrowPathIcon className="h-5 w-5 mr-2" />
                        Thử lại
                    </button>
                )}
            </div>
        </div>
    );
};

export default PaymentResult;