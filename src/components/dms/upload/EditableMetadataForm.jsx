import React, { useState } from 'react';
import { SparklesIcon, TagIcon, DocumentTextIcon, FolderIcon, BookmarkIcon, PencilIcon, CheckIcon, XMarkIcon } from '@heroicons/react/24/solid';
import { documentCategories, documentTypes } from '../../../data/documentCategories';

const EditableMetadataForm = ({ metadata, onSave, onCancel }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedMetadata, setEditedMetadata] = useState({
    title: metadata.title || '',
    keywords: metadata.keywords ? [...metadata.keywords] : [],
    description: metadata.description || '',
    category: metadata.category || '',
    documentType: metadata.documentType || ''
  });
  const [newKeyword, setNewKeyword] = useState('');

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleSave = () => {
    onSave(editedMetadata);
    setIsEditing(false);
  };

  const handleCancel = () => {
    // Reset về giá trị ban đầu
    setEditedMetadata({
      title: metadata.title || '',
      keywords: metadata.keywords ? [...metadata.keywords] : [],
      description: metadata.description || '',
      category: metadata.category || '',
      documentType: metadata.documentType || ''
    });
    setIsEditing(false);
    onCancel();
  };

  const handleInputChange = (field, value) => {
    setEditedMetadata(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const addKeyword = () => {
    if (newKeyword.trim() && !editedMetadata.keywords.includes(newKeyword.trim())) {
      setEditedMetadata(prev => ({
        ...prev,
        keywords: [...prev.keywords, newKeyword.trim()]
      }));
      setNewKeyword('');
    }
  };

  const removeKeyword = (keywordToRemove) => {
    setEditedMetadata(prev => ({
      ...prev,
      keywords: prev.keywords.filter(keyword => keyword !== keywordToRemove)
    }));
  };

  const getCategoryNameById = (id) => {
    const category = documentCategories.find(cat => cat.id === id);
    return category ? category.name : '';
  };

  const getTypeIdByName = (name) => {
    const type = documentTypes.find(t => t.name === name);
    return type ? type.id : null;
  };

  const getTypeNameById = (id) => {
    const type = documentTypes.find(t => t.id === id);
    return type ? type.name : '';
  };

  return (
    <div className="space-y-5">
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-bold text-gray-800 flex items-center">
          <SparklesIcon className="h-5 w-5 mr-2 text-purple-500" />
          Siêu dữ liệu
        </h3>
        {!isEditing ? (
          <button
            onClick={handleEdit}
            className="flex items-center text-sm px-3 py-1.5 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            <PencilIcon className="h-4 w-4 mr-1" />
            Chỉnh sửa
          </button>
        ) : (
          <div className="flex space-x-2">
            <button
              onClick={handleSave}
              className="flex items-center text-sm px-3 py-1.5 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
            >
              <CheckIcon className="h-4 w-4 mr-1" />
              Lưu
            </button>
            <button
              onClick={handleCancel}
              className="flex items-center text-sm px-3 py-1.5 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
            >
              <XMarkIcon className="h-4 w-4 mr-1" />
              Hủy
            </button>
          </div>
        )}
      </div>

      <div className="space-y-5">
        {/* Tiêu đề */}
        <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-5 border border-purple-100">
          <div className="flex items-start">
            <DocumentTextIcon className="h-5 w-5 text-purple-500 mt-0.5 flex-shrink-0" />
            <div className="ml-3 flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">Tiêu đề</label>
              {isEditing ? (
                <input
                  type="text"
                  value={editedMetadata.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  className="w-full p-3 bg-white rounded-md text-sm text-gray-800 shadow-sm border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              ) : (
                <div className="p-3 bg-white rounded-md text-sm text-gray-800 font-medium shadow-sm">
                  {editedMetadata.title}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Từ khóa */}
        <div className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-lg p-5 border border-blue-100">
          <div className="flex items-start">
            <TagIcon className="h-5 w-5 text-blue-500 mt-0.5 flex-shrink-0" />
            <div className="ml-3 flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">Từ khóa</label>
              {isEditing ? (
                <div className="space-y-3">
                  <div className="flex flex-wrap gap-2">
                    {editedMetadata.keywords.map((keyword, index) => (
                      <span 
                        key={index} 
                        className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-white text-blue-800 shadow-sm border border-blue-100"
                      >
                        {keyword}
                        <button 
                          onClick={() => removeKeyword(keyword)}
                          className="ml-2 text-blue-500 hover:text-blue-700"
                        >
                          <XMarkIcon className="h-3 w-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                  <div className="flex">
                    <input
                      type="text"
                      value={newKeyword}
                      onChange={(e) => setNewKeyword(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && addKeyword()}
                      className="flex-1 p-2 bg-white rounded-l-md text-sm text-gray-800 shadow-sm border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Nhập từ khóa mới"
                    />
                    <button
                      onClick={addKeyword}
                      className="px-3 bg-blue-600 text-white rounded-r-md hover:bg-blue-700 transition-colors"
                    >
                      Thêm
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {editedMetadata.keywords.map((keyword, index) => (
                    <span 
                      key={index} 
                      className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-white text-blue-800 shadow-sm border border-blue-100"
                    >
                      {keyword}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Mô tả */}
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-5 border border-green-100">
          <div className="flex items-start">
            <BookmarkIcon className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
            <div className="ml-3 flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">Mô tả</label>
              {isEditing ? (
                <textarea
                  value={editedMetadata.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  rows={3}
                  className="w-full p-3 bg-white rounded-md text-sm text-gray-800 shadow-sm border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              ) : (
                <div className="p-3 bg-white rounded-md text-sm text-gray-800 shadow-sm">
                  {editedMetadata.description}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Danh mục và Loại tài liệu */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Danh mục */}
          <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-lg p-5 border border-amber-100">
            <div className="flex items-start">
              <FolderIcon className="h-5 w-5 text-amber-500 mt-0.5 flex-shrink-0" />
              <div className="ml-3 flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">Danh mục</label>
                {isEditing ? (
                  <select
                    value={editedMetadata.category}
                    onChange={(e) => handleInputChange('category', e.target.value)}
                    className="w-full p-3 bg-white rounded-md text-sm text-gray-800 shadow-sm border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Chọn danh mục</option>
                    {documentCategories.map(category => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                ) : (
                  <div className="p-3 bg-white rounded-md text-sm text-gray-800 font-medium shadow-sm">
                    {getCategoryNameById(editedMetadata.category) || editedMetadata.category}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Loại tài liệu */}
          <div className="bg-gradient-to-r from-rose-50 to-pink-50 rounded-lg p-5 border border-rose-100">
            <div className="flex items-start">
              <DocumentTextIcon className="h-5 w-5 text-rose-500 mt-0.5 flex-shrink-0" />
              <div className="ml-3 flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">Loại tài liệu</label>
                {isEditing ? (
                  <select
                    value={editedMetadata.documentType}
                    onChange={(e) => handleInputChange('documentType', e.target.value)}
                    className="w-full p-3 bg-white rounded-md text-sm text-gray-800 shadow-sm border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Chọn loại tài liệu</option>
                    {documentTypes.map(type => (
                      <option key={type.id} value={type.id}>
                        {type.name}
                      </option>
                    ))}
                  </select>
                ) : (
                  <div className="p-3 bg-white rounded-md text-sm text-gray-800 font-medium shadow-sm">
                    {getTypeNameById(editedMetadata.documentType) || editedMetadata.documentType}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditableMetadataForm;