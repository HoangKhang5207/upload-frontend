import React from 'react';

const PaymentConfirmation = ({ document, selectedPackage, onConfirm, onBack }) => {
    // Thêm một điều kiện bảo vệ để tránh lỗi nếu không có gói nào được chọn
    if (!selectedPackage) {
        return (
            <div className="text-center p-8">
                <p className="text-red-600">Lỗi: Không có gói thanh toán nào được chọn.</p>
                <button onClick={onBack} className="mt-4 text-sm font-medium text-blue-600 hover:underline">
                    &larr; Quay lại để chọn gói
                </button>
            </div>
        );
    }

    return (
        <div className="max-w-2xl mx-auto animate-fade-in">
            <h2 className="text-2xl font-bold text-center text-gray-800">Xác nhận thanh toán</h2>
            
            <div className="mt-6 p-6 bg-white border rounded-lg shadow-sm">
                <h3 className="font-semibold text-lg text-gray-900">Chi tiết đơn hàng</h3>
                <div className="mt-4 space-y-3 text-sm">
                    <div className="flex justify-between">
                        <span className="text-gray-500">Tài liệu:</span>
                        <span className="font-medium text-gray-800 text-right">{document.name}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-gray-500">Gói đã chọn:</span>
                        <span className="font-medium text-gray-800">{selectedPackage.name}</span>
                    </div>
                    <div className="flex justify-between border-t pt-3 mt-3">
                        <span className="text-gray-500 font-bold">Tổng cộng:</span>
                        <span className="font-bold text-xl text-blue-600">
                            {selectedPackage.price.toLocaleString('vi-VN')} VNĐ
                        </span>
                    </div>
                </div>
            </div>

            <div className="mt-8 flex justify-between items-center">
                {/* Nút này LUÔN LUÔN gọi hàm onBack */}
                <button 
                    onClick={onBack} 
                    className="text-sm font-medium text-gray-600 hover:text-gray-800"
                >
                    &larr; Quay lại chọn gói
                </button>
                
                {/* ✅ Đảm bảo nút này LUÔN LUÔN gọi hàm onConfirm */}
                <button 
                    onClick={onConfirm} 
                    className="px-6 py-3 bg-green-600 text-white font-bold rounded-lg hover:bg-green-700"
                >
                    Xác nhận & Thanh toán
                </button>
            </div>
        </div>
    );
};

export default PaymentConfirmation;