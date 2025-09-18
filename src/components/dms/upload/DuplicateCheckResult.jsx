import React from 'react';
import { CheckCircleIcon, ExclamationTriangleIcon } from '@heroicons/react/24/solid';

const DuplicateCheckResult = ({ data }) => {
  if (!data) return null;

  const { isDuplicate, message } = data;

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h3 className="text-xl font-bold text-gray-800 mb-4 border-b pb-4">
        Kiểm Tra Trùng Lặp (UC-88)
      </h3>
      {isDuplicate ? (
        <div className="p-4 bg-red-100 border border-red-300 text-red-800 rounded-lg flex items-start">
          <ExclamationTriangleIcon className="h-6 w-6 mr-3 flex-shrink-0" />
          <div>
            <h4 className="font-bold">Phát hiện tài liệu có thể trùng lặp!</h4>
            <p className="text-sm mt-1">{message}</p>
            {/* Trong tương lai, đây là nơi hiển thị danh sách file trùng lặp */}
          </div>
        </div>
      ) : (
        <div className="p-4 bg-green-100 border border-green-300 text-green-800 rounded-lg flex items-center">
          <CheckCircleIcon className="h-6 w-6 mr-3" />
          <p className="font-semibold">{message}</p>
        </div>
      )}
    </div>
  );
};

export default DuplicateCheckResult;