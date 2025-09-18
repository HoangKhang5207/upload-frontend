import React from 'react';
import { Link } from 'react-router-dom';
import { 
    ArrowUpTrayIcon, 
    DocumentMagnifyingGlassIcon, 
    SparklesIcon, 
    DocumentDuplicateIcon 
} from '@heroicons/react/24/outline';

const FeatureCard = ({ to, icon: Icon, title, description }) => (
    <Link to={to} className="block p-6 bg-white rounded-lg shadow-md hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
        <Icon className="h-10 w-10 text-blue-600 mb-4" />
        <h3 className="text-xl font-bold text-gray-800">{title}</h3>
        <p className="text-gray-600 mt-2">{description}</p>
    </Link>
);

const HomePage = () => {
  return (
    <div className="p-8">
      <header className="text-center mb-12">
        <h1 className="text-5xl font-extrabold text-blue-700">Hệ Thống Quản Lý Tài Liệu (DMS)</h1>
        <p className="text-xl text-gray-600 mt-2">Chọn một chức năng để bắt đầu</p>
      </header>
      <main className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8">
        <FeatureCard 
            to="/upload" 
            icon={ArrowUpTrayIcon} 
            title="UC-39: Upload Tài Liệu"
            description="Tải lên tài liệu mới, thiết lập quyền truy cập và siêu dữ liệu ban đầu."
        />
        <FeatureCard 
            to="/ocr" 
            icon={DocumentMagnifyingGlassIcon} 
            title="UC-87: Xử Lý OCR"
            description="Trích xuất văn bản từ tài liệu hình ảnh hoặc file PDF dạng ảnh."
        />
        <FeatureCard 
            to="/suggest-metadata" 
            icon={SparklesIcon} 
            title="UC-73: Gợi Ý Siêu Dữ Liệu"
            description="Phân tích tài liệu đã tải lên để AI tự động gợi ý các siêu dữ liệu quan trọng."
        />
         <FeatureCard 
            to="/check-duplicates" 
            icon={DocumentDuplicateIcon} 
            title="UC-88: Kiểm Tra Trùng Lặp"
            description="So sánh một tài liệu mới với kho dữ liệu hiện có để phát hiện sự trùng lặp."
        />
      </main>
    </div>
  );
};

export default HomePage;