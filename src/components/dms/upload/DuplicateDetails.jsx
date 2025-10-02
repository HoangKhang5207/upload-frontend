import React from 'react';
import { DocumentTextIcon } from '@heroicons/react/24/solid';
import SimilarityBadge from './SimilarityBadge';

const DuplicateDetails = ({ duplicates }) => (
    <div className="mt-8">
        <h3 className="text-xl font-bold text-gray-800 mb-4">Chi tiết các đoạn trùng lặp</h3>
        <div className="space-y-6">
            {duplicates.map(item => (
                <div key={item.id} className="bg-white border border-gray-200 rounded-lg p-4">
                    <div className="flex justify-between items-center mb-3">
                        <p className="font-bold text-blue-700 flex items-center">
                            <DocumentTextIcon className="h-5 w-5 mr-2" />
                            {item.name}
                        </p>
                        <SimilarityBadge score={item.similarity} />
                    </div>
                    <div className="border-t pt-3 space-y-3">
                         {item.matched_segments && item.matched_segments.length > 0 ? (
                            item.matched_segments.map((segment, index) => (
                                <div key={index} className="border-l-4 border-red-400 pl-3 text-sm text-gray-700 bg-red-50 p-2 rounded-r-md">
                                    <p>"{segment.text}"</p>
                                    <p className="text-xs text-gray-500 mt-1">Vị trí: {segment.start_pos} - {segment.end_pos}</p>
                                </div>
                            ))
                        ) : (
                             <p className="text-sm text-gray-500 italic">Không có chi tiết đoạn trùng lặp cho file này.</p>
                        )}
                    </div>
                </div>
            ))}
        </div>
    </div>
);

export default DuplicateDetails;