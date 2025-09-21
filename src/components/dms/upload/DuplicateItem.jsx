import React from 'react';
import { EyeIcon } from '@heroicons/react/24/outline';
import SimilarityBadge from './SimilarityBadge';

const DuplicateItem = ({ item, index }) => (
    <div className="bg-white p-4 rounded-lg shadow-md border border-gray-200 hover:shadow-lg transition-shadow duration-300" style={{ animation: `fadeInUp 0.5s ease-out ${index * 0.1}s forwards`, opacity: 0 }}>
        <div className="flex justify-between items-start">
            <div>
                <h4 className="font-bold text-lg text-blue-800">{item.name}</h4>
                <p className="text-sm text-gray-500 mt-1">Chủ sở hữu: {item.owner} | Ngày tải lên: {new Date(item.uploadDate).toLocaleDateString('vi-VN')}</p>
                <p className="text-sm text-gray-500">Đường dẫn: <span className="font-mono text-gray-700">{item.path}</span></p>
            </div>
            <SimilarityBadge score={item.similarity} />
        </div>
        <div className="mt-3 flex justify-between items-center">
            <p className="text-sm text-gray-600">Loại trùng khớp: <span className="font-semibold">{item.type.replace('_', ' ')}</span></p>
            <button className="flex items-center text-sm px-3 py-1 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors">
                <EyeIcon className="h-4 w-4 mr-1" />
                Xem chi tiết
            </button>
        </div>
    </div>
);

export default DuplicateItem;