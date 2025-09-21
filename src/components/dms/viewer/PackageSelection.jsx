import React, { useState } from 'react';
import { ShieldCheckIcon } from '@heroicons/react/24/solid';

const PackageSelection = ({ document, packages, onSelectPackage }) => {
    // ✅ BƯỚC 2: KHỞI TẠO STATE
    // useState must always be called, even if packages is undefined or empty.
    const [selectedPackage, setSelectedPackage] = useState(packages && packages.length > 0 ? packages[0]?.id : '');

    // ✅ BƯỚC 1: THÊM ĐIỀU KIỆN BẢO VỆ
    // Nếu `packages` chưa được truyền xuống hoặc là một mảng rỗng,
    // component sẽ hiển thị một thông báo tải và dừng lại, không chạy code gây lỗi.
    if (!packages || packages.length === 0) {
        return <div className="text-center p-10 text-gray-500">Đang tải các gói cước...</div>;
    }

    const handleSelection = () => {
        if (!selectedPackage) {
            alert("Vui lòng chọn một gói truy cập.");
            return;
        }
        const chosenPackageObject = packages.find(p => p.id === selectedPackage);
        onSelectPackage(chosenPackageObject);
    };

    return (
        <div className="max-w-4xl mx-auto animate-fade-in">
            <h1 className="text-3xl font-bold text-gray-800 text-center">{document.name}</h1>
            <p className="text-center text-gray-500 mt-2">Tác giả: {document.author}</p>
            
            <div className="mt-8 p-6 bg-gray-50 border rounded-lg">
                <h2 className="text-xl font-semibold text-gray-700">Chọn gói truy cập</h2>
                <p className="text-sm text-gray-500 mt-1">Để xem toàn bộ nội dung ({document.totalPages} trang), vui lòng chọn một trong các gói dưới đây.</p>
                
                <div className="mt-6 space-y-4">
                    {packages.map((pkg) => (
                        <label key={pkg.id} htmlFor={pkg.id} className={`flex items-center p-4 border rounded-lg cursor-pointer transition-all ${selectedPackage === pkg.id ? 'bg-blue-50 border-blue-500 ring-2 ring-blue-300' : 'hover:bg-gray-100'}`}>
                            <input
                                type="radio"
                                id={pkg.id}
                                name="package"
                                value={pkg.id}
                                checked={selectedPackage === pkg.id}
                                onChange={(e) => setSelectedPackage(e.target.value)}
                                className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                            />
                            <div className="ml-4 flex-grow">
                                <span className="font-semibold text-gray-800">{pkg.name}</span>
                                <p className="text-sm text-gray-500">{pkg.description}</p>
                            </div>
                            <span className="text-lg font-bold text-blue-600">
                                {pkg.price.toLocaleString('vi-VN')} VNĐ
                            </span>
                        </label>
                    ))}
                </div>
            </div>

            <div className="mt-8 text-center">
                <button 
                    onClick={handleSelection} 
                    className="w-full max-w-xs px-8 py-3 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400"
                    disabled={!selectedPackage}
                >
                    Tiếp tục
                </button>
                <p className="text-xs text-gray-400 mt-3 flex items-center justify-center">
                    <ShieldCheckIcon className="h-4 w-4 mr-1"/> Giao dịch an toàn và bảo mật.
                </p>
            </div>
        </div>
    );
};

export default PackageSelection;