import React from 'react';
import { Link } from 'react-router-dom';
import { 
    ArrowUpOnSquareIcon, 
    LightBulbIcon, 
    ArrowRightCircleIcon, 
    SparklesIcon, 
    DocumentDuplicateIcon,
    LinkIcon,
    CreditCardIcon,
    // Adding new icon for workflow management
    ArrowPathIcon
} from '@heroicons/react/24/outline';

const useCases = [
    {
        path: '/uc39-upload-workflow',
        icon: ArrowUpOnSquareIcon,
        title: 'UC-39: Quy trình Upload Tổng thể',
        description: 'Luồng nghiệp vụ hoàn chỉnh, tích hợp tất cả các tính năng từ kiểm tra, xử lý, đến lưu trữ và định tuyến.',
        color: 'blue'
    },
    {
        path: '/uc73-suggest-metadata',
        icon: LightBulbIcon,
        title: 'UC-73: Gợi ý Metadata',
        description: 'Demo tính năng AI phân tích và tự động đề xuất siêu dữ liệu cho tài liệu.',
        color: 'green'
    },
    {
        path: '/uc84-auto-route',
        icon: ArrowRightCircleIcon,
        title: 'UC-84: Tự động Định tuyến',
        description: 'Tải lên và xem tài liệu được tự động gửi vào quy trình nghiệp vụ dựa trên danh mục.',
        color: 'purple'
    },
    {
        path: '/uc87-ocr-processing',
        icon: SparklesIcon,
        title: 'UC-87: Trích xuất Dữ liệu OCR',
        description: 'Demo khả năng nhận dạng và bóc tách văn bản, key-value từ file ảnh hoặc PDF.',
        color: 'indigo'
    },
    {
        path: '/uc88-duplicate-check',
        icon: DocumentDuplicateIcon,
        title: 'UC-88: Kiểm tra Trùng lặp',
        description: 'Tải lên một file để hệ thống phân tích sâu và tìm ra các tài liệu tương tự.',
        color: 'orange'
    },
    {
        path: '/document/access/visitor-123',
        icon: LinkIcon,
        title: 'UC-86: Truy cập Công khai',
        description: 'Mô phỏng truy cập một tài liệu được chia sẻ công khai có giới hạn thời gian.',
        color: 'teal'
    },
    {
        path: '/document/access/paid-456',
        icon: CreditCardIcon,
        title: 'UC-85: Yêu cầu Trả phí',
        description: 'Mô phỏng truy cập một tài liệu yêu cầu người dùng trả phí để có thể xem nội dung.',
        color: 'rose'
    },
    // New card for workflow management
    {
        path: '/workflow-dashboard',
        icon: ArrowPathIcon,
        title: 'Quản lý Workflow',
        description: 'Quản lý các quy trình xử lý tài liệu và workflow. Bao gồm: danh sách workflow, thiết kế workflow, khởi tạo quy trình và theo dõi tiến trình.',
        color: 'cyan'
    }
];

const FeatureCard = ({ path, icon: Icon, title, description, color }) => {
    const colorClasses = {
        blue: 'hover:border-blue-500 hover:bg-blue-50',
        green: 'hover:border-green-500 hover:bg-green-50',
        purple: 'hover:border-purple-500 hover:bg-purple-50',
        indigo: 'hover:border-indigo-500 hover:bg-indigo-50',
        orange: 'hover:border-orange-500 hover:bg-orange-50',
        teal: 'hover:border-teal-500 hover:bg-teal-50',
        rose: 'hover:border-rose-500 hover:bg-rose-50',
        cyan: 'hover:border-cyan-500 hover:bg-cyan-50'
    };

    return (
        <Link to={path} className={`block p-6 bg-white border border-gray-200 rounded-lg shadow-md transition-all duration-300 ${colorClasses[color]}`}>
            <Icon className={`h-8 w-8 mb-3 text-gray-500`} />
            <h5 className="mb-2 text-xl font-bold tracking-tight text-gray-900">{title}</h5>
            <p className="font-normal text-gray-600 text-sm">{description}</p>
        </Link>
    );
};


const HomePage = () => {
    return (
        <div className="max-w-7xl mx-auto">
            <header className="text-center mb-10">
                <h1 className="text-5xl font-extrabold text-gray-800">
                    DMS Upload Frontend
                </h1>
                <p className="mt-4 text-lg text-gray-600">
                    Dashboard demo các tính năng và quy trình nghiệp vụ đã được triển khai.
                </p>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {useCases.map((uc) => (
                    <FeatureCard key={uc.path} {...uc} />
                ))}
            </div>
            
            <div className="mt-12 bg-blue-50 rounded-lg p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Hướng dẫn sử dụng</h2>
                <p className="text-gray-600 mb-4">
                    Để bắt đầu với hệ thống quản lý workflow, hãy truy cập vào chức năng "Quản lý Workflow" 
                    và làm theo hướng dẫn trong tài liệu. Bạn có thể thiết kế sơ đồ quy trình, khởi tạo quy trình 
                    mới và theo dõi tiến trình của các quy trình đang chạy.
                </p>
                <Link 
                    to="/workflow-documentation"
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                    Xem tài liệu hướng dẫn
                </Link>
            </div>
        </div>
    );
};

export default HomePage;