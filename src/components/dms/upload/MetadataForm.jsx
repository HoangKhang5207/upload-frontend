import React from 'react';
import { InformationCircleIcon, ExclamationTriangleIcon, LightBulbIcon } from '@heroicons/react/24/outline';
import InputField from '../../common/InputField';
import SelectField from '../../common/SelectField';

const MetadataForm = ({ metadata, setMetadata, categories, ocrData, warnings = [] }) => {
  const handleChange = (e) => {
    const { name, value } = e.target;
    setMetadata(prev => ({ ...prev, [name]: value }));
  };

  const handleTagsChange = (e) => {
    // Chuyển chuỗi tags thành mảng
    setMetadata(prev => ({ ...prev, tags: e.target.value.split(',').map(tag => tag.trim()) }));
  };

  const findWarning = (fieldName) => {
    return warnings.find(w => w.field === fieldName);
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h3 className="text-xl font-bold text-gray-800 mb-6 border-b pb-4">
        Gợi Ý Siêu Dữ Liệu (UC-73)
      </h3>
      
      <div className="space-y-6">
        {/* Hàng 1: Tiêu đề và Tác giả */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <InputField
            label="Tên tài liệu"
            id="title"
            value={metadata.title || ''}
            onChange={handleChange}
            required={true}
            helpText="AI gợi ý: Được trích xuất từ tiêu đề tài liệu."
          />
          <InputField
            label="Tác giả/Người nói"
            id="author"
            value={metadata.author || ''}
            onChange={handleChange}
            helpText="AI gợi ý: Phát hiện từ metadata và nội dung."
          />
        </div>

        {/* Từ khóa */}
        <InputField
          label="Từ khóa"
          id="tags"
          value={metadata.tags ? metadata.tags.join(', ') : ''}
          onChange={handleTagsChange}
          helpText="AI gợi ý: 5/10 từ khóa được phân tích từ nội dung. Phân cách bởi dấu phẩy."
        />

        {/* Tóm tắt */}
        <div>
          <label htmlFor="summary" className="block text-sm font-medium text-gray-700 mb-1">Tóm tắt</label>
          <textarea
            id="summary"
            name="summary"
            rows="4"
            value={metadata.summary || ''}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
          ></textarea>
          <p className="mt-1 text-xs text-gray-500">AI gợi ý: Tóm tắt tự động từ nội dung chính (247/500 ký tự).</p>
        </div>

        {/* Key-Value Pairs và Cảnh báo mâu thuẫn */}
        <div>
            <h4 className="text-md font-semibold text-gray-700 mb-2">Key-Value Pairs (Văn Bản Hành Chính)</h4>
            <div className="bg-gray-800 text-white p-4 rounded-md font-mono text-sm overflow-x-auto">
                <pre>{JSON.stringify(metadata.key_values || {}, null, 2)}</pre>
            </div>
            <p className="mt-1 text-xs text-gray-500 flex items-center">
                <LightBulbIcon className="h-4 w-4 mr-1 text-yellow-500" />
                AI gợi ý: Trích xuất tự động bằng PhoNER và UIT-VINER cho văn bản tiếng Việt.
            </p>
            {findWarning('ngay_ban_hanh') && (
                 <div className="mt-4 p-3 bg-yellow-100 border border-yellow-300 text-yellow-800 rounded-lg flex items-center">
                    <ExclamationTriangleIcon className="h-5 w-5 mr-2" />
                    <p className="text-sm">
                        <strong>Cảnh báo:</strong> {findWarning('ngay_ban_hanh').message}
                    </p>
                </div>
            )}
        </div>

        {/* Hàng cuối: Danh mục, Mức bảo mật, Loại truy cập */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <SelectField
            label="Danh mục"
            id="category"
            value={metadata.category || ''}
            onChange={handleChange}
            options={categories}
            required={true}
          />
          {/* BƯỚC 7: THIẾT LẬP QUYỀN TRUY CẬP */}
            <div>
                <label htmlFor="accessType" className="block text-sm font-medium text-gray-700 mb-1">
                    Loại truy cập <span className="text-red-500">*</span>
                </label>
                <select
                    id="accessType"
                    name="accessType"
                    value={metadata.accessType}
                    onChange={handleChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                >
                    <option value="private">Riêng tư</option>
                    <option value="public">Công khai (72h)</option>
                    <option value="paid">Trả phí</option>
                </select>
            </div>
        </div>
      </div>
    </div>
  );
};

export default MetadataForm;