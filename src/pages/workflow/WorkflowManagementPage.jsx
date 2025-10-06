import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  PlusIcon, 
  PencilIcon, 
  TrashIcon, 
  EyeIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  DocumentTextIcon,
  CheckCircleIcon,
  PlayIcon
} from '@heroicons/react/24/outline';
import * as mockWorkflowApi from '../../api/mockWorkflowApi';
import WorkflowNavigation from '../../components/workflow/WorkflowNavigation';
import { useWorkflow } from '../../contexts/WorkflowContext';
import WorkflowLoading from '../../components/workflow/WorkflowLoading';
import WorkflowEmptyState from '../../components/workflow/WorkflowEmptyState';
import ApplyWorkflowModal from '../../components/workflow/ApplyWorkflowModal';

const WorkflowManagementPage = () => {
  const { state, dispatch } = useWorkflow();
  const { workflows, loading } = state;
  const [isApplyModalOpen, setIsApplyModalOpen] = useState(false);
  const [selectedWorkflow, setSelectedWorkflow] = useState(null);

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

  const handleDelete = async (workflow) => {
    // Check if workflow is deployed (in use)
    if (workflow.isDeployed) {
      alert(`Không thể xóa quy trình "${workflow.name}" vì đang được sử dụng.

Các task, process đang chạy:
- Kiểm tra quyền truy cập
- Xử lý OCR
- Kiểm tra trùng lặp`);
      return;
    }
    
    if (window.confirm(`Bạn có chắc chắn muốn xóa quy trình "${workflow.name}"?`)) {
      try {
        await mockWorkflowApi.deleteWorkflow(workflow.id);
        const updatedWorkflows = workflows.filter(w => w.id !== workflow.id);
        dispatch({ type: 'SET_WORKFLOWS', payload: updatedWorkflows });
        
        // Add success notification
        dispatch({
          type: 'ADD_NOTIFICATION',
          payload: {
            id: Date.now(),
            type: 'success',
            title: 'Thành công',
            message: 'Quy trình đã được xóa thành công',
            autoDismiss: true,
            dismissTime: 3000
          }
        });
      } catch (error) {
        console.error('Error deleting workflow:', error);
        const errorMessage = error.message || 'Có lỗi xảy ra khi xóa quy trình';
        
        // Add error notification
        dispatch({
          type: 'ADD_NOTIFICATION',
          payload: {
            id: Date.now(),
            type: 'error',
            title: 'Lỗi',
            message: errorMessage,
            autoDismiss: true,
            dismissTime: 5000
          }
        });
      }
    }
  };

  const handleApplyWorkflow = (workflow) => {
    setSelectedWorkflow(workflow);
    setIsApplyModalOpen(true);
  };

  const handleDeployWorkflow = async (workflow) => {
    if (window.confirm(`Bạn có chắc chắn muốn triển khai quy trình "${workflow.name}"?`)) {
      try {
        await mockWorkflowApi.deployWorkflow(workflow.id);
        // Refresh workflows
        const updatedWorkflows = await mockWorkflowApi.getWorkflows();
        dispatch({ type: 'SET_WORKFLOWS', payload: updatedWorkflows });
        
        // Add success notification
        dispatch({
          type: 'ADD_NOTIFICATION',
          payload: {
            id: Date.now(),
            type: 'success',
            title: 'Thành công',
            message: 'Quy trình đã được triển khai thành công',
            autoDismiss: true,
            dismissTime: 3000
          }
        });
      } catch (error) {
        console.error('Error deploying workflow:', error);
        const errorMessage = error.message || 'Có lỗi xảy ra khi triển khai quy trình';
        
        // Add error notification
        dispatch({
          type: 'ADD_NOTIFICATION',
          payload: {
            id: Date.now(),
            type: 'error',
            title: 'Lỗi',
            message: errorMessage,
            autoDismiss: true,
            dismissTime: 5000
          }
        });
      }
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString('vi-VN');
  };

  const getDocumentType = (type) => {
    if (type === '1') {
      return (
        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
          <ArrowUpIcon className="h-3 w-3 mr-1" />
          Văn bản đi
        </span>
      );
    } else if (type === '2') {
      return (
        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
          <ArrowDownIcon className="h-3 w-3 mr-1" />
          Văn bản đến
        </span>
      );
    } else {
      return (
        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
          <DocumentTextIcon className="h-3 w-3 mr-1" />
          Khác
        </span>
      );
    }
  };

  const getStatusBadge = (status) => {
    if (status === 'published') {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
          Đã xuất bản
        </span>
      );
    } else {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
          Bản nháp
        </span>
      );
    }
  };

  const handleActionSuccess = () => {
    // Refresh workflows after successful action
    const fetchWorkflows = async () => {
      try {
        const data = await mockWorkflowApi.getWorkflows();
        dispatch({ type: 'SET_WORKFLOWS', payload: data });
      } catch (error) {
        console.error('Error fetching workflows:', error);
        dispatch({ type: 'SET_ERROR', payload: 'Có lỗi xảy ra khi tải danh sách quy trình' });
      }
    };
    
    fetchWorkflows();
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto">
        <WorkflowNavigation />
        <WorkflowLoading message="Đang tải danh sách quy trình..." />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      <WorkflowNavigation />
      
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Quản lý Workflow</h1>
          <p className="mt-2 text-gray-600">Danh sách các quy trình xử lý</p>
        </div>
        <Link 
          to="/bpmn-modeler"
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          <PlusIcon className="h-5 w-5 mr-2" />
          Tạo mới
        </Link>
      </div>

      {workflows.length > 0 ? (
        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tên quy trình
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Mô tả
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Thể loại
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Trạng thái
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Cập nhật
                </th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Thao tác
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {workflows.map((workflow) => (
                <tr key={workflow.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{workflow.name}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-500">{workflow.description}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getDocumentType(workflow.documentType)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center space-x-2">
                      {getStatusBadge(workflow.status)}
                      {workflow.isDeployed && (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                          Đang sử dụng
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatDate(workflow.updatedAt)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex justify-end space-x-2">
                      <Link to={`/workflow-detail/${workflow.id}`} className="text-blue-600 hover:text-blue-900">
                        <EyeIcon className="h-5 w-5" />
                      </Link>
                      <Link to={`/bpmn-modeler/${workflow.id}`} className="text-indigo-600 hover:text-indigo-900">
                        <EyeIcon className="h-5 w-5" />
                      </Link>
                      <Link to={`/bpmn-modeler/${workflow.id}/edit`} className="text-indigo-600 hover:text-indigo-900">
                        <PencilIcon className="h-5 w-5" />
                      </Link>
                      {!workflow.isDeployed && (
                        <button 
                          onClick={() => handleApplyWorkflow(workflow)}
                          className="text-green-600 hover:text-green-900"
                          title="Áp dụng workflow"
                        >
                          <CheckCircleIcon className="h-5 w-5" />
                        </button>
                      )}
                      {!workflow.isDeployed && (
                        <button 
                          onClick={() => handleDeployWorkflow(workflow)}
                          className="text-purple-600 hover:text-purple-900"
                          title="Triển khai workflow"
                        >
                          <PlayIcon className="h-5 w-5" />
                        </button>
                      )}
                      <button 
                        onClick={() => handleDelete(workflow)}
                        className={`hover:text-red-900 ${workflow.isDeployed ? 'text-gray-400 cursor-not-allowed' : 'text-red-600'}`}
                        disabled={workflow.isDeployed}
                        title={workflow.isDeployed ? "Không thể xóa workflow đang sử dụng" : "Xóa workflow"}
                      >
                        <TrashIcon className="h-5 w-5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <WorkflowEmptyState 
          title="Không có quy trình nào" 
          description="Hãy tạo quy trình đầu tiên của bạn." 
          actionText="Tạo quy trình mới" 
          actionLink="/bpmn-modeler" 
        />
      )}
      
      <ApplyWorkflowModal
        open={isApplyModalOpen}
        workflow={selectedWorkflow}
        onClose={() => {
          setIsApplyModalOpen(false);
          setSelectedWorkflow(null);
        }}
        onSuccess={handleActionSuccess}
      />
    </div>
  );
};

export default WorkflowManagementPage;