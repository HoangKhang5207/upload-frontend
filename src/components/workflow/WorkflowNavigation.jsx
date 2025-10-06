import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  DocumentTextIcon, 
  PencilIcon, 
  PlayIcon,
  ListBulletIcon,
  BookOpenIcon
} from '@heroicons/react/24/outline';

const navigationItems = [
  {
    name: 'Bảng điều khiển',
    href: '/workflow-dashboard',
    icon: DocumentTextIcon,
  },
  {
    name: 'Danh sách Workflow',
    href: '/workflow-list',
    icon: ListBulletIcon,
  },
  {
    name: 'Thiết kế Workflow',
    href: '/bpmn-modeler',
    icon: PencilIcon,
  },
  {
    name: 'Khởi tạo quy trình',
    href: '/start-workflow/1',
    icon: PlayIcon,
  },
  {
    name: 'Tài liệu hướng dẫn',
    href: '/workflow-documentation',
    icon: BookOpenIcon,
  },
];

const WorkflowNavigation = () => {
  const location = useLocation();

  return (
    <div className="bg-white shadow rounded-lg mb-6">
      <div className="px-4 py-5 sm:px-6">
        <nav className="flex space-x-8 overflow-x-auto">
          {navigationItems.map((item) => {
            const isActive = location.pathname === item.href || 
                            (item.href === '/start-workflow/1' && location.pathname.startsWith('/start-workflow'));
            
            return (
              <Link
                key={item.name}
                to={item.href}
                className={`flex items-center whitespace-nowrap pb-4 px-1 border-b-2 font-medium text-sm ${
                  isActive
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <item.icon className="flex-shrink-0 mr-2 h-5 w-5" />
                {item.name}
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
};

export default WorkflowNavigation;