import React from 'react';
import { ClipboardDocumentCheckIcon, ArrowUpOnSquareIcon, ArrowPathIcon, CogIcon, LinkIcon } from '@heroicons/react/24/solid';
import toast from 'react-hot-toast';

const UploadResult = ({ result, onNewUpload }) => {
  if (!result) return null;

  const copyLink = (link) => {
    navigator.clipboard.writeText(link);
    toast.success('Đã sao chép liên kết!');
  };

  return (
    <div className="bg-white p-8 rounded-lg shadow-lg max-w-3xl mx-auto text-center">
      <ClipboardDocumentCheckIcon className="h-20 w-20 text-green-500 mx-auto mb-4" />
      <h2 className="text-3xl font-bold text-gray-800">Upload Thành Công!</h2>
      
      <div className="mt-6 text-left bg-gray-50 p-6 rounded-lg border space-y-3">
        <p><strong>Tài liệu:</strong> {result.title}</p>
        <p><strong>ID:</strong> <span className="font-mono text-blue-600">{result.doc_id}</span></p>
        <p><strong>Phiên bản:</strong> {result.version}</p>
        <p><strong>Trạng thái:</strong> <span className="font-semibold text-orange-600">{result.status}</span></p>
        
        {/* UC-84: Hiển thị thông tin Auto-Route */}
        {result.workflow?.applied && (
          <div className="p-3 bg-blue-100 border border-blue-300 rounded-md flex items-start">
            <CogIcon className="h-6 w-6 text-blue-600 mr-3 flex-shrink-0 mt-1"/>
            <div>
                <h4 className="font-semibold text-blue-800">Tự Động Luân Chuyển (UC-84)</h4>
                <p className="text-sm text-blue-700">
                    <strong>Workflow áp dụng:</strong> {result.workflow.name}
                </p>
                 <p className="text-xs text-gray-600">
                    Thời gian xử lý: {result.workflow.processingTime}
                </p>
            </div>
          </div>
        )}

        {/* UC-86: Hiển thị link Public */}
        {result.public_link && (
          <div className="p-3 bg-green-100 border border-green-300 rounded-md">
            <h4 className="font-semibold text-green-800 flex items-center mb-2"><LinkIcon className="h-5 w-5 mr-2"/>Liên kết công khai (UC-86)</h4>
            <div className="flex items-center">
                <input type="text" readOnly value={result.public_link} className="flex-grow p-2 border rounded bg-gray-200 text-sm"/>
                <button onClick={() => copyLink(result.public_link)} className="ml-2 p-2 bg-gray-200 hover:bg-gray-300 rounded" title="Sao chép">
                    <ArrowUpOnSquareIcon className="h-5 w-5"/>
                </button>
            </div>
            <p className="text-xs text-gray-600 mt-1">Liên kết sẽ hết hạn sau 72 giờ.</p>
          </div>
        )}

        {/* UC-85: Thông báo cần thanh toán */}
        {result.requires_payment && (
            <div className="p-3 bg-yellow-100 border border-yellow-300 text-yellow-800 rounded-md">
                <h4 className="font-semibold">Tài liệu trả phí (UC-85)</h4>
                <p className="text-sm">Tài liệu này yêu cầu thanh toán để có thể xem hoặc tải xuống.</p>
            </div>
        )}
      </div>
      
      <div className="mt-8 flex justify-center space-x-4">
        <button 
          onClick={() => alert("Chuyển đến trang danh sách tài liệu...")}
          className="bg-gray-700 text-white font-bold py-2 px-6 rounded-lg hover:bg-gray-800 transition-colors"
        >
          Xem Danh Sách
        </button>
        <button 
          onClick={onNewUpload}
          className="bg-blue-600 text-white font-bold py-2 px-6 rounded-lg hover:bg-blue-700 transition-colors flex items-center"
        >
          <ArrowPathIcon className="h-5 w-5 mr-2"/>
          Upload File Khác
        </button>
      </div>
    </div>
  );
};

export default UploadResult;