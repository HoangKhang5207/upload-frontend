import React, { useState } from 'react';
import { ChevronLeftIcon, ChevronRightIcon, DocumentTextIcon } from '@heroicons/react/24/solid';

const PdfViewer = ({ totalPages, fileName }) => {
  const [currentPage, setCurrentPage] = useState(1);

  const goToPrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const goToNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  return (
    <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl shadow-lg overflow-hidden">
      <div className="p-5 border-b border-gray-200 bg-white">
        <h3 className="text-lg font-bold text-gray-800 flex items-center">
          <DocumentTextIcon className="h-5 w-5 mr-2 text-blue-500" />
          Xem trước tài liệu
        </h3>
      </div>
      
      <div className="p-5">
        {/* PDF Viewer Area */}
        <div className="w-full h-80 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg flex items-center justify-center mb-5 border-2 border-dashed border-gray-300">
          <div className="text-center">
            <DocumentTextIcon className="h-12 w-12 mx-auto text-gray-400" />
            <p className="mt-3 text-gray-600 font-medium">{fileName}</p>
            <p className="text-sm text-gray-500 mt-1">Trang {currentPage} của {totalPages}</p>
          </div>
        </div>
        
        {/* Page Navigation */}
        <div className="flex items-center justify-between bg-white rounded-lg p-3 shadow-sm">
          <button
            onClick={goToPrevPage}
            disabled={currentPage === 1}
            className={`p-2 rounded-lg ${currentPage === 1 ? 'text-gray-400 cursor-not-allowed' : 'text-gray-700 hover:bg-gray-100'}`}
          >
            <ChevronLeftIcon className="h-5 w-5" />
          </button>
          
          <span className="text-sm font-medium text-gray-700 px-3">
            Trang <span className="font-bold">{currentPage}</span> / <span className="font-bold">{totalPages}</span>
          </span>
          
          <button
            onClick={goToNextPage}
            disabled={currentPage === totalPages}
            className={`p-2 rounded-lg ${currentPage === totalPages ? 'text-gray-400 cursor-not-allowed' : 'text-gray-700 hover:bg-gray-100'}`}
          >
            <ChevronRightIcon className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default PdfViewer;