import React from 'react';
import { ShieldCheckIcon, ShieldExclamationIcon, ClockIcon } from '@heroicons/react/24/solid';

const StatusIcon = ({ status }) => {
  if (status === 'Granted' || status === 'Valid') {
    return <ShieldCheckIcon className="h-6 w-6 text-green-500" />;
  }
  return <ShieldExclamationIcon className="h-6 w-6 text-red-500" />;
};

const AccessCheck = ({ permissions, isLoading, error }) => {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-12 bg-white rounded-lg shadow-md">
        <ClockIcon className="h-8 w-8 text-blue-500 animate-spin mr-4" />
        <span className="text-xl text-gray-700">Đang kiểm tra quyền truy cập...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-12 bg-white rounded-lg shadow-md text-center">
        <ShieldExclamationIcon className="h-16 w-16 text-red-500 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-red-700">Truy Cập Bị Từ Chối</h2>
        <p className="text-gray-600 mt-2">{error}</p>
      </div>
    );
  }
  
  if(!permissions) return null;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
      <div className="md:col-span-2 bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-2xl font-bold text-gray-800 border-b pb-4 mb-4">
          <span className="text-blue-600">1</span> Kiểm Tra Quyền Truy Cập
        </h2>
        <div className="space-y-4">
          {permissions.checks.map((check, index) => (
            <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
              <span className="font-medium text-gray-700">{check.name}</span>
              <div className="flex items-center space-x-2">
                <span className={`font-semibold ${check.status === 'Granted' || check.status === 'Valid' ? 'text-green-600' : 'text-red-600'}`}>
                  {check.status}
                </span>
                <StatusIcon status={check.status} />
              </div>
            </div>
          ))}
        </div>
        <div className="mt-6 p-4 bg-green-100 border border-green-300 text-green-800 rounded-lg flex items-center">
          <ShieldCheckIcon className="h-6 w-6 mr-3" />
          <p className="font-semibold">Quyền truy cập hợp lệ. Sẵn sàng upload tài liệu.</p>
        </div>
      </div>
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h3 className="text-xl font-bold text-gray-800 border-b pb-4 mb-4">Thông Tin Hệ Thống</h3>
        <div className="space-y-3 text-sm">
          <p><strong>Phiên bản:</strong> DMS v4</p>
          <p><strong>Ngày:</strong> {new Date().toLocaleDateString('vi-VN')}</p>
          <div className="pt-2">
            <h4 className="font-semibold mb-1">Use Cases:</h4>
            <ul className="list-disc list-inside text-gray-600">
              <li>UC-39: Upload File</li>
              <li>UC-73: Suggest Metadata</li>
              <li>UC-87: OCR Processing</li>
              <li>UC-88: Check Duplicates</li>
              <li>UC-84: Auto-route</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AccessCheck;