import React from 'react';
import { DocumentDuplicateIcon } from '@heroicons/react/24/solid';

const KeyValuePairsDisplay = ({ keyValuePairs, onEdit }) => {
  // Chuyển đổi object thành mảng để dễ hiển thị
  const keyValueArray = Object.entries(keyValuePairs || {}).map(([key, value]) => ({
    key, // Giữ nguyên key snake_case
    originalKey: key,
    value: value === null ? '(Không có giá trị)' : String(value)
  }));

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
        <DocumentDuplicateIcon className="h-4 w-4 mr-2 text-green-500" />
        Key-Value Pairs Đã Trích Xuất
      </label>
      
      {keyValueArray.length > 0 ? (
        <div className="bg-white border border-gray-200 rounded-md overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Key</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Value</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Hành động</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {keyValueArray.map((item, index) => (
                <tr key={index} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm font-medium text-gray-900">{item.key}</td>
                  <td className="px-4 py-3 text-sm text-gray-700 max-w-xs break-words">{item.value}</td>
                  <td className="px-4 py-3 text-sm">
                    <button
                      onClick={() => onEdit && onEdit(item.originalKey, item.value)}
                      className="text-blue-600 hover:text-blue-900 font-medium"
                    >
                      Chỉnh sửa
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="bg-gray-50 border border-gray-200 rounded-md p-4 text-center text-gray-500">
          Không có key-value pairs nào được trích xuất
        </div>
      )}
    </div>
  );
};

export default KeyValuePairsDisplay;