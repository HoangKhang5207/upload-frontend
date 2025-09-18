import React from 'react';
import { CheckCircleIcon, ExclamationCircleIcon, LightBulbIcon } from '@heroicons/react/24/solid';

const PaymentResult = ({ result, document, onRetry }) => {
    
    // Màn hình Thất bại
    if (!result || !result.success) {
        return (
            <div className="bg-white rounded-2xl shadow-xl p-6 sm:p-10 animate-fade-in text-center">
                <ExclamationCircleIcon className="h-20 w-20 text-red-400 mx-auto mb-4"/>
                <h2 className="text-3xl font-bold text-red-700">Giao dịch thất bại</h2>
                
                <div className="mt-6 bg-red-50 border border-red-200 p-4 rounded-lg text-left">
                    <p className="font-semibold text-red-800">Lỗi: {result?.error || "Đã có lỗi xảy ra."}</p>
                    {result?.errorCode && <p className="text-sm text-red-600">Mã lỗi: {result.errorCode}</p>}
                </div>
                
                {result?.suggestions && (
                    <div className="mt-6 bg-yellow-50 border border-yellow-200 p-4 rounded-lg text-left">
                        <h4 className="font-semibold text-yellow-800 flex items-center mb-2">
                            <LightBulbIcon className="h-5 w-5 mr-2"/> Gợi ý khắc phục
                        </h4>
                        <ul className="list-disc list-inside text-sm text-yellow-700 space-y-1">
                            {result.suggestions.map((s, i) => <li key={i}>{s}</li>)}
                        </ul>
                    </div>
                )}
                
                <div className="mt-8 flex justify-center space-x-4">
                     <button onClick={onRetry} className="px-8 py-3 font-semibold rounded-lg bg-blue-600 text-white hover:bg-blue-700">
                        Thử lại
                    </button>
                    <button onClick={() => alert("Mở form liên hệ hỗ trợ...")} className="px-8 py-3 font-semibold rounded-lg bg-red-600 text-white hover:bg-red-700">
                        Liên hệ hỗ trợ
                    </button>
                </div>
            </div>
        );
    }
    
    // Màn hình Thành công
    return (
         <div className="bg-white rounded-2xl shadow-xl p-6 sm:p-10 animate-fade-in text-center">
            <CheckCircleIcon className="h-20 w-20 text-green-500 mx-auto mb-4"/>
            <h2 className="text-3xl font-bold text-gray-800">Thanh toán thành công!</h2>
            <p className="text-gray-600 mt-2">Chúc mừng! Bạn đã có quyền truy cập tài liệu.</p>
            
            <div className="mt-8 text-left bg-gray-50 p-6 rounded-lg border space-y-3">
                <div className="flex justify-between">
                    <span className="text-gray-600">Tài liệu:</span> 
                    <span className="font-semibold text-gray-800">{document.title}</span>
                </div>
                <div className="flex justify-between">
                    <span className="text-gray-600">Quyền truy cập:</span> 
                    <span className="font-semibold text-gray-800">{result.accessType}</span>
                </div>
                <div className="flex justify-between">
                    <span className="text-gray-600">Hết hạn:</span> 
                    <span className="font-semibold text-gray-800">{result.expiryDate}</span>
                </div>
                 <div className="flex justify-between">
                    <span className="text-gray-600">Trạng thái:</span> 
                    <span className="font-bold text-green-600 bg-green-100 px-2 py-0.5 rounded-full">Đã thanh toán</span>
                </div>
                 <div className="flex justify-between">
                    <span className="text-gray-600">Mã giao dịch:</span> 
                    <span className="font-semibold text-gray-800 font-mono">{result.transactionId}</span>
                </div>
            </div>

            <div className="mt-6 p-4 bg-blue-50 text-blue-800 rounded-lg text-sm">
                Email xác nhận đã được gửi. Kiểm tra hộp thư của bạn để biết chi tiết.
            </div>
            
            <div className="mt-8 flex justify-center space-x-4">
                <button className="px-8 py-3 font-bold rounded-lg bg-green-600 text-white hover:bg-green-700">
                    Xem tài liệu ngay
                </button>
                <button onClick={() => window.location.href = '/'} className="px-8 py-3 font-semibold rounded-lg bg-gray-200 text-gray-800 hover:bg-gray-300">
                    Mua tài liệu khác
                </button>
            </div>
        </div>
    );
};

export default PaymentResult;