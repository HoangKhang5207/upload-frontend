import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  DocumentTextIcon, 
  PencilIcon, 
  PlayIcon,
  ListBulletIcon,
  ArrowTrendingUpIcon,
  CalendarIcon,
  UserGroupIcon
} from '@heroicons/react/24/outline';
import * as mockWorkflowApi from '../../api/mockWorkflowApi';
import WorkflowNavigation from '../../components/workflow/WorkflowNavigation';
import { useWorkflow } from '../../contexts/WorkflowContext';
import WorkflowLoading from '../../components/workflow/WorkflowLoading';

const stats = [
  { id: 1, name: 'Tổng số quy trình', value: '12', icon: DocumentTextIcon, color: 'bg-blue-500' },
  { id: 2, name: 'Quy trình đang chạy', value: '5', icon: ArrowTrendingUpIcon, color: 'bg-green-500' },
  { id: 3, name: 'Quy trình đã hoàn thành', value: '42', icon: CalendarIcon, color: 'bg-purple-500' },
  { id: 4, name: 'Người dùng', value: '24', icon: UserGroupIcon, color: 'bg-yellow-500' },
];

const recentWorkflows = [
  {
    id: 1,
    name: 'Quy trình xử lý văn bản đi',
    status: 'running',
    assignee: 'Nguyễn Văn A',
    dueDate: '2023-05-20',
  },
  {
    id: 2,
    name: 'Quy trình phê duyệt hợp đồng',
    status: 'completed',
    assignee: 'Trần Thị B',
    dueDate: '2023-05-18',
  },
  {
    id: 3,
    name: 'Quy trình xử lý đơn nghỉ phép',
    status: 'pending',
    assignee: 'Lê Văn C',
    dueDate: '2023-05-22',
  },
];

const getStatusBadge = (status) => {
  switch (status) {
    case 'running':
      return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">Đang chạy</span>;
    case 'completed':
      return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">Đã hoàn thành</span>;
    case 'pending':
      return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">Chờ xử lý</span>;
    default:
      return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">Không xác định</span>;
  }
};

const WorkflowDashboardPage = () => {
  const { state, dispatch } = useWorkflow();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchWorkflows = async () => {
      dispatch({ type: 'SET_LOADING', payload: true });
      try {
        const data = await mockWorkflowApi.getWorkflows();
        dispatch({ type: 'SET_WORKFLOWS', payload: data });
      } catch (error) {
        console.error('Error fetching workflows:', error);
        dispatch({ type: 'SET_ERROR', payload: 'Có lỗi xảy ra khi tải danh sách quy trình' });
      } finally {
        dispatch({ type: 'SET_LOADING', payload: false });
      }
    };

    fetchWorkflows();
  }, [dispatch]);

  if (state.loading) {
    return (
      <div className="max-w-7xl mx-auto">
        <WorkflowNavigation />
        <WorkflowLoading message="Đang tải bảng điều khiển..." />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      <WorkflowNavigation />
      
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Bảng điều khiển Workflow</h1>
        <p className="mt-2 text-gray-600">Tổng quan về các quy trình và hoạt động gần đây</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-8">
        {stats.map((stat) => (
          <div key={stat.id} className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className={`flex-shrink-0 rounded-md p-3 ${stat.color}`}>
                  <stat.icon className="h-6 w-6 text-white" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">{stat.name}</dt>
                    <dd className="flex items-baseline">
                      <div className="text-2xl font-semibold text-gray-900">{stat.value}</div>
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Workflows */}
        <div className="lg:col-span-2">
          <div className="bg-white shadow overflow-hidden sm:rounded-lg">
            <div className="px-4 py-5 sm:px-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900">Quy trình gần đây</h3>
              <p className="mt-1 text-sm text-gray-500">Danh sách các quy trình được khởi tạo gần đây</p>
            </div>
            <div className="border-t border-gray-200">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Tên quy trình
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Trạng thái
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Người phụ trách
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Ngày hết hạn
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {recentWorkflows.map((workflow) => (
                    <tr key={workflow.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {workflow.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getStatusBadge(workflow.status)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {workflow.assignee}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {workflow.dueDate}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div>
          <div className="bg-white shadow overflow-hidden sm:rounded-lg">
            <div className="px-4 py-5 sm:px-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900">Hành động nhanh</h3>
              <p className="mt-1 text-sm text-gray-500">Các thao tác thường dùng</p>
            </div>
            <div className="border-t border-gray-200">
              <nav className="space-y-1">
                <Link
                  to="/workflow-list"
                  className="flex items-center px-4 py-3 text-sm font-medium border-l-4 border-transparent hover:bg-gray-50 hover:border-gray-300"
                >
                  <ListBulletIcon className="flex-shrink-0 h-5 w-5 text-gray-400 mr-3" />
                  <span className="truncate">Danh sách Workflow</span>
                </Link>
                <Link
                  to="/bpmn-modeler"
                  className="flex items-center px-4 py-3 text-sm font-medium border-l-4 border-transparent hover:bg-gray-50 hover:border-gray-300"
                >
                  <PencilIcon className="flex-shrink-0 h-5 w-5 text-gray-400 mr-3" />
                  <span className="truncate">Thiết kế Workflow</span>
                </Link>
                <Link
                  to="/start-workflow/1"
                  className="flex items-center px-4 py-3 text-sm font-medium border-l-4 border-transparent hover:bg-gray-50 hover:border-gray-300"
                >
                  <PlayIcon className="flex-shrink-0 h-5 w-5 text-gray-400 mr-3" />
                  <span className="truncate">Khởi tạo quy trình</span>
                </Link>
                <Link
                  to="/workflow-management"
                  className="flex items-center px-4 py-3 text-sm font-medium border-l-4 border-transparent hover:bg-gray-50 hover:border-gray-300"
                >
                  <DocumentTextIcon className="flex-shrink-0 h-5 w-5 text-gray-400 mr-3" />
                  <span className="truncate">Quản lý Workflow</span>
                </Link>
              </nav>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="mt-6 bg-white shadow overflow-hidden sm:rounded-lg">
            <div className="px-4 py-5 sm:px-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900">Hoạt động gần đây</h3>
              <p className="mt-1 text-sm text-gray-500">Các thay đổi gần đây trong hệ thống</p>
            </div>
            <div className="border-t border-gray-200">
              <ul className="divide-y divide-gray-200">
                <li className="px-4 py-4">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                        <PencilIcon className="h-4 w-4 text-blue-600" />
                      </div>
                    </div>
                    <div className="ml-3">
                      <p className="text-sm font-medium text-gray-900">Nguyễn Văn A</p>
                      <p className="text-sm text-gray-500">Đã cập nhật quy trình xử lý văn bản đi</p>
                      <p className="text-xs text-gray-400">2 giờ trước</p>
                    </div>
                  </div>
                </li>
                <li className="px-4 py-4">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center">
                        <PlayIcon className="h-4 w-4 text-green-600" />
                      </div>
                    </div>
                    <div className="ml-3">
                      <p className="text-sm font-medium text-gray-900">Trần Thị B</p>
                      <p className="text-sm text-gray-500">Đã khởi tạo quy trình phê duyệt hợp đồng</p>
                      <p className="text-xs text-gray-400">5 giờ trước</p>
                    </div>
                  </div>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WorkflowDashboardPage;