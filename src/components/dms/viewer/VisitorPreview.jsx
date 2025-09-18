import React, { useState, useEffect } from 'react';
import { ClockIcon, DocumentArrowDownIcon, ShieldCheckIcon, ShoppingCartIcon } from '@heroicons/react/24/outline';

const CountdownTimer = ({ expiryTimestamp }) => {
    const calculateTimeLeft = () => {
        const difference = +new Date(expiryTimestamp) - +new Date();
        let timeLeft = {};

        if (difference > 0) {
            timeLeft = {
                hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
                minutes: Math.floor((difference / 1000 / 60) % 60),
                seconds: Math.floor((difference / 1000) % 60),
            };
        }
        return timeLeft;
    };

    const [timeLeft, setTimeLeft] = useState(calculateTimeLeft());

    useEffect(() => {
        const timer = setTimeout(() => {
            setTimeLeft(calculateTimeLeft());
        }, 1000);
        return () => clearTimeout(timer);
    });

    const timerComponents = Object.keys(timeLeft).length
        ? `Còn hiệu lực: ${timeLeft.hours} giờ ${timeLeft.minutes} phút`
        : "Đã hết hạn";

    return <span className="text-sm">{timerComponents}</span>;
};


const VisitorPreview = ({ document }) => {

    return (
        <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
            <header className="bg-white shadow-sm rounded-lg p-4 mb-6">
                <div className="flex items-center justify-between">
                    <div>
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-yellow-100 text-yellow-800">
                           <ShieldCheckIcon className="h-4 w-4 mr-1.5"/> GUEST ACCESS
                        </span>
                        <h1 className="text-2xl font-bold text-gray-900 mt-2">{document.title}</h1>
                    </div>
                    <div className="flex items-center text-gray-500">
                        <ClockIcon className="h-5 w-5 mr-2"/>
                        <CountdownTimer expiryTimestamp={document.expiryTimestamp} />
                    </div>
                </div>
            </header>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Cột trái: Preview tài liệu */}
                <div className="lg:col-span-2 bg-gray-200 rounded-lg p-4 relative h-[80vh]">
                    <p className="text-center text-gray-500 mb-2">Xem trước tài liệu</p>
                    <div className="relative w-full h-full border bg-white">
                        <iframe src={document.previewUrl} className="w-full h-full" title="Document Preview"/>
                        {/* Watermark Overlay */}
                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                            <div className="text-gray-400 text-6xl font-bold opacity-20 transform -rotate-45 select-none">
                                GUEST ACCESS
                            </div>
                        </div>
                    </div>
                </div>

                {/* Cột phải: Thông tin và hành động */}
                <aside className="space-y-6">
                     <div className="bg-white shadow-sm rounded-lg p-5">
                        <h3 className="text-lg font-semibold text-gray-800 mb-4">Tải xuống</h3>
                        <button disabled={!document.allowDownload} className="w-full flex items-center justify-center px-4 py-3 border border-transparent text-base font-medium rounded-md text-white bg-green-600 hover:bg-green-700 disabled:bg-gray-300">
                           <DocumentArrowDownIcon className="h-5 w-5 mr-2"/> Tải bản PDF đầy đủ
                        </button>
                        <p className="text-xs text-gray-500 mt-2 text-center">
                            {document.allowDownload ? "* Tài liệu công khai - không cần thanh toán" : "* Tải xuống không được phép cho tài liệu này."}
                        </p>
                    </div>
                    <div className="bg-white shadow-sm rounded-lg p-5">
                        <h3 className="text-lg font-semibold text-gray-800 mb-4">Yêu cầu quyền nâng cao</h3>
                        <button className="w-full flex items-center justify-center px-4 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700">
                           <ShieldCheckIcon className="h-5 w-5 mr-2"/> Yêu cầu quyền truy cập
                        </button>
                         <p className="text-xs text-gray-500 mt-2 text-center">
                            * Gửi yêu cầu đến quản trị viên để được cấp quyền đọc không giới hạn
                        </p>
                    </div>
                    <div className="bg-white shadow-sm rounded-lg p-5">
                        <h3 className="text-lg font-semibold text-gray-800 mb-4">Mua quyền truy cập</h3>
                        <button className="w-full flex items-center justify-center px-4 py-3 border border-transparent text-base font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700">
                           <ShoppingCartIcon className="h-5 w-5 mr-2"/> Thanh toán - 50,000 VND
                        </button>
                    </div>
                    <div className="bg-white shadow-sm rounded-lg p-5 text-sm text-gray-700 space-y-2">
                        <div className="flex justify-between"><span>Loại tài liệu:</span> <span className="font-semibold">{document.metadata.type}</span></div>
                        <div className="flex justify-between"><span>Kích thước:</span> <span className="font-semibold">{document.metadata.size}</span></div>
                        <div className="flex justify-between"><span>Số trang:</span> <span className="font-semibold">{document.metadata.pages}</span></div>
                        <div className="flex justify-between"><span>Ngày tạo:</span> <span className="font-semibold">{new Date(document.metadata.createdAt).toLocaleDateString('vi-VN')}</span></div>
                    </div>
                </aside>
            </div>
        </div>
    );
};

export default VisitorPreview;