import React from 'react';
import { ExclamationTriangleIcon } from '@heroicons/react/24/solid';
import SimilarityBadge from './SimilarityBadge';

const StatisticsTable = ({ duplicates }) => (
    <div className="mt-8">
        <h3 className="text-xl font-bold text-gray-800 mb-4">Bảng thống kê</h3>
        <div className="overflow-x-auto">
            <table className="min-w-full bg-white border border-gray-300">
                <thead className="bg-gray-800 text-white">
                    <tr>
                        <th className="text-left py-3 px-4 uppercase font-semibold text-sm">File</th>
                        <th className="text-center py-3 px-4 uppercase font-semibold text-sm">% Trùng</th>
                        <th className="text-center py-3 px-4 uppercase font-semibold text-sm">Số đoạn trùng</th>
                        <th className="text-left py-3 px-4 uppercase font-semibold text-sm">Cảnh báo</th>
                    </tr>
                </thead>
                <tbody className="text-gray-700">
                    {duplicates.map(item => (
                        <tr key={item.id} className="border-b hover:bg-gray-50">
                            <td className="text-left py-3 px-4 font-medium">{item.name}</td>
                            <td className="text-center py-3 px-4"><SimilarityBadge score={item.similarity} /></td>
                            <td className="text-center py-3 px-4 font-medium">{item.matched_segments?.length || 0}</td>
                            <td className="text-left py-3 px-4">
                                {item.similarity > 30 ? (
                                    <span className="text-red-600 font-bold flex items-center">
                                        <ExclamationTriangleIcon className="h-5 w-5 mr-1"/> Vượt ngưỡng cho phép
                                    </span>
                                ) : (
                                    <span className="text-green-600 font-semibold">An toàn</span>
                                )}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    </div>
);

export default StatisticsTable;