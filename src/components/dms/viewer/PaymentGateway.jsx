import React, { useState } from 'react';
import { CreditCardIcon, LockClosedIcon } from '@heroicons/react/24/solid';

const PaymentGateway = ({ amount, onPayment }) => {
    const [cardInfo, setCardInfo] = useState({
        number: '',
        name: '',
        expiry: '',
        cvc: '',
        email: ''
    });
    const [isProcessing, setIsProcessing] = useState(false);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setCardInfo(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        // Thêm một chút validation đơn giản
        if (!cardInfo.number || !cardInfo.name || !cardInfo.expiry || !cardInfo.cvc || !cardInfo.email) {
            alert("Vui lòng điền đầy đủ thông tin thanh toán.");
            return;
        }
        
        setIsProcessing(true);
        // Gọi hàm `onPayment` được truyền từ PaywallFlow
        // Giả lập một chút độ trễ để người dùng thấy trạng thái "đang xử lý"
        setTimeout(() => {
            onPayment(cardInfo);
            // Không cần setIsProcessing(false) ở đây vì component cha sẽ chuyển sang bước khác
        }, 1000);
    };

    return (
        <div className="max-w-md mx-auto animate-fade-in">
            <h2 className="text-2xl font-bold text-center text-gray-800">Cổng Thanh Toán</h2>
            <p className="text-center text-gray-500 mt-2">Nhập thông tin thẻ để hoàn tất giao dịch.</p>
            
            <form onSubmit={handleSubmit} className="mt-8 p-6 bg-white border rounded-lg shadow-sm space-y-4">
                <div className="flex justify-between items-center bg-gray-50 p-3 rounded-md">
                    <span className="font-semibold text-gray-700">Số tiền thanh toán:</span>
                    <span className="text-2xl font-bold text-blue-600">
                        {amount.toLocaleString('vi-VN')} VNĐ
                    </span>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700">Email nhận hóa đơn</label>
                    <input type="email" name="email" value={cardInfo.email} onChange={handleInputChange} className="mt-1 block w-full px-3 py-2 border rounded-md" placeholder="your.email@example.com" required />
                </div>
                
                <div>
                    <label className="block text-sm font-medium text-gray-700">Số thẻ</label>
                    <input type="text" name="number" value={cardInfo.number} onChange={handleInputChange} className="mt-1 block w-full px-3 py-2 border rounded-md" placeholder="0000 0000 0000 0000" required />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700">Tên trên thẻ</label>
                    <input type="text" name="name" value={cardInfo.name} onChange={handleInputChange} className="mt-1 block w-full px-3 py-2 border rounded-md" placeholder="NGUYEN VAN A" required />
                </div>

                <div className="flex gap-4">
                    <div className="flex-1">
                        <label className="block text-sm font-medium text-gray-700">Ngày hết hạn (MM/YY)</label>
                        <input type="text" name="expiry" value={cardInfo.expiry} onChange={handleInputChange} className="mt-1 block w-full px-3 py-2 border rounded-md" placeholder="MM/YY" required />
                    </div>
                    <div className="flex-1">
                        <label className="block text-sm font-medium text-gray-700">CVC</label>
                        <input type="text" name="cvc" value={cardInfo.cvc} onChange={handleInputChange} className="mt-1 block w-full px-3 py-2 border rounded-md" placeholder="123" required />
                    </div>
                </div>

                <button 
                    type="submit"
                    disabled={isProcessing}
                    className="w-full mt-4 px-6 py-3 bg-green-600 text-white font-bold rounded-lg hover:bg-green-700 flex items-center justify-center disabled:bg-gray-400"
                >
                    {isProcessing ? (
                        <>
                            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Đang xử lý...
                        </>
                    ) : (
                        <>
                            <CreditCardIcon className="h-5 w-5 mr-2" />
                            Thanh toán
                        </>
                    )}
                </button>
            </form>
            <p className="text-xs text-gray-400 mt-4 flex items-center justify-center">
                <LockClosedIcon className="h-4 w-4 mr-1"/> Giao dịch của bạn được mã hóa và bảo mật.
            </p>
        </div>
    );
};

export default PaymentGateway;