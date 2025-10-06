import React from 'react';

const WorkflowLoading = ({ message = "Đang tải dữ liệu..." }) => {
  return (
    <div className="flex flex-col items-center justify-center py-12">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      <p className="mt-4 text-gray-600">{message}</p>
    </div>
  );
};

export default WorkflowLoading;