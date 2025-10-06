import React, { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { 
  ArrowLeftIcon,
  PaperAirplaneIcon,
  DocumentTextIcon,
  ArrowUpIcon,
  ArrowDownIcon
} from '@heroicons/react/24/outline';
import * as mockWorkflowApi from '../../api/mockWorkflowApi';
import WorkflowNavigation from '../../components/workflow/WorkflowNavigation';
import { useWorkflow } from '../../contexts/WorkflowContext';
import WorkflowLoading from '../../components/workflow/WorkflowLoading';

const StartWorkflowPage = () => {
  const { type } = useParams();
  const { state, dispatch } = useWorkflow();
  const { workflows } = state;
  const [documentTitle, setDocumentTitle] = useState('');
  const [documentDescription, setDocumentDescription] = useState('');
  const [selectedWorkflow, setSelectedWorkflow] = useState('');
  const [priority, setPriority] = useState('normal');
  const [attachments, setAttachments] = useState([]);

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

  // Filter workflows based on document type
  const filteredWorkflows = type ? 
    workflows.filter(workflow => workflow.documentType === type) : 
    workflows;

  const documentTypeLabel = type === '1' ? 'Văn bản đi' : type === '2' ? 'Văn bản đến' : 'Tất cả loại văn bản';
  const documentTypeIcon = type === '1' ? ArrowUpIcon : type === '2' ? ArrowDownIcon : DocumentTextIcon;

  const handleSubmit = async (e) => {
    e.preventDefault();
    dispatch({ type: 'SET_LOADING', payload: true });
    
    try {
      // Simulate starting workflow
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Add success notification
      dispatch({
        type: 'ADD_NOTIFICATION',
        payload: {
          id: Date.now(),
          type: 'success',
          title: 'Thành công',
          message: 'Quy trình đã được khởi tạo thành công',
          autoDismiss: true,
          dismissTime: 3000
        }
      });
    } catch (error) {
      console.error('Error starting workflow:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Có lỗi xảy ra khi khởi tạo quy trình' });
      
      // Add error notification
      dispatch({
        type: 'ADD_NOTIFICATION',
        payload: {
          id: Date.now(),
          type: 'error',
          title: 'Lỗi',
          message: 'Có lỗi xảy ra khi khởi tạo quy trình',
          autoDismiss: true,
          dismissTime: 5000
        }
      });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    setAttachments(prev => [...prev, ...files]);
  };

  const removeAttachment = (index) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
  };

  if (state.loading) {
    return (
      <div className="max-w-4xl mx-auto">
        <WorkflowNavigation />
        <WorkflowLoading message="Đang tải thông tin khởi tạo quy trình..." />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <WorkflowNavigation />
      
      <div className="flex items-center mb-6">
        <Link to="/workflow-management" className="mr-4 p-2 rounded-full hover:bg-gray-100">
          <ArrowLeftIcon className="h-6 w-6 text-gray-600" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Khởi tạo quy trình</h1>
          <p className="text-gray-600">Khởi tạo quy trình xử lý {documentTypeLabel.toLowerCase()}</p>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Loại văn bản
            </label>
            <div className="mt-1 relative rounded-md shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                {React.createElement(documentTypeIcon, { className: "h-5 w-5 text-gray-400" })}
              </div>
              <input
                type="text"
                value={documentTypeLabel}
                disabled
                className="block w-full pl-10 pr-12 py-3 border border-gray-300 rounded-md bg-gray-50 text-gray-500"
              />
            </div>
          </div>

          <div>
            <label htmlFor="documentTitle" className="block text-sm font-medium text-gray-700 mb-1">
              Tiêu đề văn bản
            </label>
            <input
              type="text"
              id="documentTitle"
              value={documentTitle}
              onChange={(e) => setDocumentTitle(e.target.value)}
              required
              className="block w-full px-4 py-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              placeholder="Nhập tiêu đề văn bản"
            />
          </div>

          <div>
            <label htmlFor="documentDescription" className="block text-sm font-medium text-gray-700 mb-1">
              Mô tả
            </label>
            <textarea
              id="documentDescription"
              rows={4}
              value={documentDescription}
              onChange={(e) => setDocumentDescription(e.target.value)}
              className="block w-full px-4 py-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              placeholder="Mô tả ngắn về nội dung văn bản"
            />
          </div>

          <div>
            <label htmlFor="workflow" className="block text-sm font-medium text-gray-700 mb-1">
              Chọn quy trình
            </label>
            <select
              id="workflow"
              value={selectedWorkflow}
              onChange={(e) => setSelectedWorkflow(e.target.value)}
              required
              className="block w-full px-4 py-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Chọn một quy trình</option>
              {filteredWorkflows.map(workflow => (
                <option key={workflow.id} value={workflow.id}>
                  {workflow.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Mức độ ưu tiên
            </label>
            <div className="grid grid-cols-3 gap-3">
              <label className="relative border rounded-md p-4 flex cursor-pointer focus:outline-none">
                <input
                  type="radio"
                  name="priority"
                  value="low"
                  checked={priority === 'low'}
                  onChange={() => setPriority('low')}
                  className="sr-only"
                />
                <div className="flex-1 flex">
                  <div className="flex flex-col">
                    <span className="block text-sm font-medium text-gray-900">Thấp</span>
                  </div>
                </div>
                {priority === 'low' && (
                  <div className="absolute -inset-px rounded-md border-2 border-blue-500 pointer-events-none" aria-hidden="true"></div>
                )}
              </label>
              <label className="relative border rounded-md p-4 flex cursor-pointer focus:outline-none">
                <input
                  type="radio"
                  name="priority"
                  value="normal"
                  checked={priority === 'normal'}
                  onChange={() => setPriority('normal')}
                  className="sr-only"
                />
                <div className="flex-1 flex">
                  <div className="flex flex-col">
                    <span className="block text-sm font-medium text-gray-900">Bình thường</span>
                  </div>
                </div>
                {priority === 'normal' && (
                  <div className="absolute -inset-px rounded-md border-2 border-blue-500 pointer-events-none" aria-hidden="true"></div>
                )}
              </label>
              <label className="relative border rounded-md p-4 flex cursor-pointer focus:outline-none">
                <input
                  type="radio"
                  name="priority"
                  value="high"
                  checked={priority === 'high'}
                  onChange={() => setPriority('high')}
                  className="sr-only"
                />
                <div className="flex-1 flex">
                  <div className="flex flex-col">
                    <span className="block text-sm font-medium text-gray-900">Cao</span>
                  </div>
                </div>
                {priority === 'high' && (
                  <div className="absolute -inset-px rounded-md border-2 border-blue-500 pointer-events-none" aria-hidden="true"></div>
                )}
              </label>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tệp đính kèm
            </label>
            <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
              <div className="space-y-1 text-center">
                <svg
                  className="mx-auto h-12 w-12 text-gray-400"
                  stroke="currentColor"
                  fill="none"
                  viewBox="0 0 48 48"
                  aria-hidden="true"
                >
                  <path
                    d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                    strokeWidth={2}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                <div className="flex text-sm text-gray-600">
                  <label
                    htmlFor="file-upload"
                    className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500"
                  >
                    <span>Upload một file</span>
                    <input
                      id="file-upload"
                      name="file-upload"
                      type="file"
                      className="sr-only"
                      onChange={handleFileChange}
                      multiple
                    />
                  </label>
                  <p className="pl-1">hoặc kéo và thả</p>
                </div>
                <p className="text-xs text-gray-500">PDF, DOC, JPG, PNG lên đến 10MB</p>
              </div>
            </div>
            
            {attachments.length > 0 && (
              <div className="mt-4">
                <h4 className="text-sm font-medium text-gray-700 mb-2">Tệp đã chọn:</h4>
                <ul className="border border-gray-200 rounded-md divide-y divide-gray-200">
                  {attachments.map((file, index) => (
                    <li key={index} className="pl-3 pr-4 py-3 flex items-center justify-between text-sm">
                      <div className="w-0 flex-1 flex items-center">
                        <DocumentTextIcon className="flex-shrink-0 h-5 w-5 text-gray-400" />
                        <span className="ml-2 flex-1 w-0 truncate">{file.name}</span>
                      </div>
                      <div className="ml-4 flex-shrink-0">
                        <button
                          onClick={() => removeAttachment(index)}
                          className="font-medium text-red-600 hover:text-red-500"
                        >
                          Xóa
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          <div className="flex justify-end">
            <button
              type="button"
              className="mr-3 inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={state.loading}
              className="inline-flex items-center px-6 py-3 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            >
              <PaperAirplaneIcon className="h-5 w-5 mr-2" />
              Khởi tạo quy trình
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default StartWorkflowPage;