import React from 'react';
import { SparklesIcon, TagIcon, DocumentTextIcon, FolderIcon, BookmarkIcon } from '@heroicons/react/24/solid';

// Component này được giữ lại để tương thích với các phần khác của ứng dụng
// nhưng không được sử dụng trong UC87_OcrProcessingPage nữa

const MetadataSuggestionViewer = ({ metadata }) => {
  return (
    <div className="space-y-5">
      <h3 className="text-xl font-bold text-gray-800 flex items-center">
        <SparklesIcon className="h-5 w-5 mr-2 text-purple-500" />
        Gợi ý siêu dữ liệu
      </h3>
      
      <div className="space-y-5">
        <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-5 border border-purple-100">
          <div className="flex items-start">
            <DocumentTextIcon className="h-5 w-5 text-purple-500 mt-0.5 flex-shrink-0" />
            <div className="ml-3">
              <label className="block text-sm font-medium text-gray-700 mb-1">Tiêu đề</label>
              <div className="p-3 bg-white rounded-md text-sm text-gray-800 font-medium shadow-sm">
                {metadata.title}
              </div>
            </div>
          </div>
        </div>
        
        <div className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-lg p-5 border border-blue-100">
          <div className="flex items-start">
            <TagIcon className="h-5 w-5 text-blue-500 mt-0.5 flex-shrink-0" />
            <div className="ml-3 flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">Từ khóa</label>
              <div className="flex flex-wrap gap-2">
                {metadata.keywords.map((keyword, index) => (
                  <span 
                    key={index} 
                    className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-white text-blue-800 shadow-sm border border-blue-100"
                  >
                    {keyword}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
        
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-5 border border-green-100">
          <div className="flex items-start">
            <BookmarkIcon className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
            <div className="ml-3">
              <label className="block text-sm font-medium text-gray-700 mb-1">Mô tả</label>
              <div className="p-3 bg-white rounded-md text-sm text-gray-800 shadow-sm">
                {metadata.description}
              </div>
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-lg p-5 border border-amber-100">
            <div className="flex items-start">
              <FolderIcon className="h-5 w-5 text-amber-500 mt-0.5 flex-shrink-0" />
              <div className="ml-3">
                <label className="block text-sm font-medium text-gray-700 mb-1">Danh mục</label>
                <div className="p-3 bg-white rounded-md text-sm text-gray-800 font-medium shadow-sm">
                  {metadata.category}
                </div>
              </div>
            </div>
          </div>
          
          <div className="bg-gradient-to-r from-rose-50 to-pink-50 rounded-lg p-5 border border-rose-100">
            <div className="flex items-start">
              <DocumentTextIcon className="h-5 w-5 text-rose-500 mt-0.5 flex-shrink-0" />
              <div className="ml-3">
                <label className="block text-sm font-medium text-gray-700 mb-1">Loại tài liệu</label>
                <div className="p-3 bg-white rounded-md text-sm text-gray-800 font-medium shadow-sm">
                  {metadata.documentType}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MetadataSuggestionViewer;