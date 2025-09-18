import React, { useState } from 'react';
import { UserIcon, CalendarDaysIcon, DocumentTextIcon, StarIcon } from '@heroicons/react/24/solid';
import { CheckCircleIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

// Giả lập icon cho các phương thức thanh toán
const PaymentMethodIcon = ({ method }) => {
    const icons = {
        VCB: "https://seeklogo.com/images/V/vietcombank-logo-7872D24121-seeklogo.com.png",
        VNPay: "https://vnpay.vn/s1/statics/Images/logo_vnpay_new.svg",
        MoMo: "https://upload.wikimedia.org/wikipedia/vi/f/fe/MoMo_Logo.png"
    };
    return <img src={icons[method]} alt={`${method} logo`} className="h-8 object-contain" />;
};

const PackageSelection = ({ document, onProceed }) => {
    const [selectedPackage, setSelectedPackage] = useState('read');
    const [selectedMethod, setSelectedMethod] = useState('VCB');

    const handleSubmit = () => {
        if (!selectedPackage || !selectedMethod) {
            toast.error("Vui lòng chọn gói và phương thức thanh toán.");
            return;
        }
        onProceed(selectedPackage, selectedMethod);
    };

    const packageDetails = document.pricing[selectedPackage];

    return (
        <div className="bg-white rounded-2xl shadow-xl p-6 sm:p-10">
            {/* 1. Thông tin tài liệu */}
            <div className="border border-gray-200 rounded-lg p-4 mb-8">
                <h2 className="text-xl font-bold text-gray-800">{document.title}</h2>
                <div className="flex flex-wrap items-center text-sm text-gray-500 mt-2 gap-x-4 gap-y-1">
                    <span className="flex items-center"><UserIcon className="h-4 w-4 mr-1.5"/> Tác giả: {document.author}</span>
                    <span className="flex items-center"><CalendarDaysIcon className="h-4 w-4 mr-1.5"/> Ngày phát hành: {document.publishDate}</span>
                    <span className="flex items-center"><DocumentTextIcon className="h-4 w-4 mr-1.5"/> {document.pages} trang</span>
                    <span className="flex items-center"><StarIcon className="h-4 w-4 mr-1.5 text-yellow-500"/> {document.rating} ({document.reviews} đánh giá)</span>
                </div>
            </div>

            {/* 2. Chọn gói truy cập */}
            <div className="mb-8">
                <h3 className="text-lg font-semibold text-gray-700 mb-4 flex items-center">
                    <span className="text-white bg-purple-600 rounded-full h-6 w-6 text-sm flex items-center justify-center mr-3">2</span>
                    Chọn gói truy cập
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {Object.entries(document.pricing).map(([key, pkg]) => (
                        <div key={key} onClick={() => setSelectedPackage(key)} className={`p-5 border-2 rounded-lg cursor-pointer transition-all ${selectedPackage === key ? 'border-purple-500 bg-purple-50' : 'border-gray-300 hover:border-purple-400'}`}>
                            <div className="flex justify-between items-start">
                                <h4 className="font-bold text-lg text-gray-800">{key === 'read' ? 'Quyền đọc' : 'Quyền tải xuống'}</h4>
                                <p className="text-xl font-bold text-purple-600">{pkg.price.toLocaleString('vi-VN')}{pkg.currency}</p>
                            </div>
                            <p className="text-sm text-gray-600 mt-2 mb-4">{pkg.description}</p>
                            <ul className="text-sm space-y-2">
                                <li className="flex items-center text-gray-700"><CheckCircleIcon className="h-5 w-5 text-green-500 mr-2"/> {key === 'read' ? 'Truy cập 7 ngày' : 'Tải xuống vĩnh viễn'}</li>
                                <li className="flex items-center text-gray-700"><CheckCircleIcon className="h-5 w-5 text-green-500 mr-2"/> {key === 'read' ? 'Đọc online' : 'Không watermark'}</li>
                                <li className="flex items-center text-gray-700"><CheckCircleIcon className="h-5 w-5 text-green-500 mr-2"/> {key === 'read' ? 'Hỗ trợ mobile' : 'Chất lượng gốc'}</li>
                            </ul>
                        </div>
                    ))}
                </div>
            </div>

            {/* 3. Chọn phương thức thanh toán */}
            <div className="mb-8">
                 <h3 className="text-lg font-semibold text-gray-700 mb-4 flex items-center">
                    <span className="text-white bg-purple-600 rounded-full h-6 w-6 text-sm flex items-center justify-center mr-3">3</span>
                    Chọn phương thức thanh toán
                </h3>
                <div className="flex flex-wrap gap-4">
                    {['VCB', 'VNPay', 'MoMo'].map(method => (
                        <div key={method} onClick={() => setSelectedMethod(method)} className={`flex-1 min-w-[120px] p-4 border-2 rounded-lg cursor-pointer flex items-center justify-center transition-all ${selectedMethod === method ? 'border-purple-500 bg-purple-50' : 'border-gray-300 hover:border-purple-400'}`}>
                           <PaymentMethodIcon method={method} />
                        </div>
                    ))}
                </div>
            </div>

            {/* 4. Tổng kết và nút hành động */}
            <div className="bg-gray-100 p-4 rounded-lg flex flex-col sm:flex-row items-center justify-between">
                <div>
                    <p className="text-sm text-gray-600">Tổng số tiền thanh toán</p>
                    <p className="text-3xl font-bold text-purple-700">{packageDetails.price.toLocaleString('vi-VN')}{packageDetails.currency}</p>
                    <p className="text-xs text-gray-500">Đã bao gồm VAT và phí xử lý</p>
                </div>
                <div className="flex gap-4 mt-4 sm:mt-0">
                    <button type="button" onClick={() => alert("Hủy thao tác")} className="px-8 py-3 font-semibold rounded-lg bg-gray-200 text-gray-800 hover:bg-gray-300">Hủy bỏ</button>
                    <button type="button" onClick={handleSubmit} className="px-8 py-3 font-semibold rounded-lg bg-purple-600 text-white hover:bg-purple-700">Thanh toán</button>
                </div>
            </div>
        </div>
    );
};

export default PackageSelection;