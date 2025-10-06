import React from 'react';
import { Link } from 'react-router-dom';
import { 
  ArrowLeftIcon,
  DocumentTextIcon, 
  PencilIcon, 
  PlayIcon,
  ListBulletIcon
} from '@heroicons/react/24/outline';
import WorkflowNavigation from '../../components/workflow/WorkflowNavigation';
import { useWorkflow } from '../../contexts/WorkflowContext';
import WorkflowLoading from '../../components/workflow/WorkflowLoading';

const WorkflowDocumentationPage = () => {
  const { state } = useWorkflow();
  
  const features = [
    {
      id: 1,
      title: 'Bảng điều khiển Workflow',
      description: 'Tổng quan về các quy trình và hoạt động gần đây trong hệ thống.',
      icon: DocumentTextIcon,
      path: '/workflow-dashboard'
    },
    {
      id: 2,
      title: 'Danh sách Workflow',
      description: 'Quản lý và xem danh sách tất cả các quy trình đã được tạo.',
      icon: ListBulletIcon,
      path: '/workflow-list'
    },
    {
      id: 3,
      title: 'Thiết kế Workflow',
      description: 'Tạo và chỉnh sửa các sơ đồ quy trình xử lý tài liệu.',
      icon: PencilIcon,
      path: '/bpmn-modeler'
    },
    {
      id: 4,
      title: 'Khởi tạo quy trình',
      description: 'Bắt đầu một quy trình mới dựa trên các sơ đồ đã thiết kế.',
      icon: PlayIcon,
      path: '/start-workflow/1'
    }
  ];

  const steps = [
    {
      id: 1,
      title: 'Tạo sơ đồ quy trình',
      description: 'Sử dụng công cụ thiết kế để tạo sơ đồ quy trình xử lý tài liệu.'
    },
    {
      id: 2,
      title: 'Xuất bản sơ đồ',
      description: 'Xuất bản sơ đồ để có thể sử dụng trong việc khởi tạo quy trình.'
    },
    {
      id: 3,
      title: 'Khởi tạo quy trình',
      description: 'Chọn sơ đồ đã xuất bản và khởi tạo một quy trình mới.'
    },
    {
      id: 4,
      title: 'Theo dõi tiến trình',
      description: 'Theo dõi và quản lý các quy trình đang chạy trong hệ thống.'
    }
  ];

  if (state.loading) {
    return (
      <div className="max-w-7xl mx-auto">
        <WorkflowNavigation />
        <WorkflowLoading message="Đang tải tài liệu hướng dẫn..." />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      <WorkflowNavigation />
      
      <div className="flex items-center mb-6">
        <Link to="/" className="mr-4 p-2 rounded-full hover:bg-gray-100">
          <ArrowLeftIcon className="h-6 w-6 text-gray-600" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Tài liệu hướng dẫn Workflow</h1>
          <p className="text-gray-600">Hướng dẫn sử dụng các tính năng quản lý workflow</p>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6 mb-8">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Giới thiệu</h2>
        <p className="text-gray-600 mb-4">
          Hệ thống quản lý workflow giúp bạn tạo, quản lý và theo dõi các quy trình xử lý tài liệu 
          trong tổ chức. Với các công cụ trực quan, bạn có thể thiết kế sơ đồ quy trình, khởi tạo 
          các quy trình mới và theo dõi tiến trình của chúng.
        </p>
        
        <h2 className="text-xl font-bold text-gray-900 mb-4">Các tính năng chính</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {features.map((feature) => (
            <div key={feature.id} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
              <div className="flex items-center mb-4">
                <div className="flex-shrink-0 h-10 w-10 rounded-md bg-blue-100 flex items-center justify-center">
                  <feature.icon className="h-6 w-6 text-blue-600" />
                </div>
                <h3 className="ml-4 text-lg font-medium text-gray-900">{feature.title}</h3>
              </div>
              <p className="text-gray-600 mb-4">{feature.description}</p>
              <Link 
                to={feature.path}
                className="inline-flex items-center text-blue-600 hover:text-blue-800 font-medium"
              >
                Truy cập tính năng
                <svg className="ml-1 h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </Link>
            </div>
          ))}
        </div>

        <h2 className="text-xl font-bold text-gray-900 mb-4">Hướng dẫn sử dụng</h2>
        <div className="space-y-6">
          {steps.map((step) => (
            <div key={step.id} className="flex">
              <div className="flex-shrink-0">
                <div className="flex items-center justify-center h-8 w-8 rounded-full bg-blue-600 text-white">
                  {step.id}
                </div>
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-medium text-gray-900">{step.title}</h3>
                <p className="mt-2 text-gray-600">{step.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-blue-50 rounded-lg p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Lưu ý quan trọng</h2>
        <ul className="list-disc pl-5 space-y-2 text-gray-600">
          <li>Chỉ những sơ đồ đã xuất bản mới có thể được sử dụng để khởi tạo quy trình</li>
          <li>Hãy đảm bảo nhập đầy đủ thông tin khi tạo hoặc chỉnh sửa sơ đồ quy trình</li>
          <li>Có thể xem lại và chỉnh sửa các quy trình đã khởi tạo trong phần quản lý workflow</li>
          <li>Hệ thống tự động lưu phiên làm việc khi bạn thiết kế sơ đồ</li>
        </ul>
      </div>
    </div>
  );
};

export default WorkflowDocumentationPage;