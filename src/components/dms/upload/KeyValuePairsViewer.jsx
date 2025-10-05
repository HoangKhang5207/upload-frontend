import React from 'react';

const KeyValuePairsViewer = ({ pairs }) => {
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div className="p-4 border-b border-gray-200">
        <h3 className="text-lg font-bold text-gray-800">Key-Value Pairs</h3>
      </div>
      
      <div className="p-4 overflow-auto max-h-96">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Key</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Value</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Độ tin cậy</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {pairs.map((pair, index) => (
              <tr key={index} className="hover:bg-gray-50">
                <td className="px-4 py-3 text-sm font-semibold text-gray-800">{pair.key}</td>
                <td className="px-4 py-3 text-sm text-gray-600">{pair.value}</td>
                <td className="px-4 py-3 text-sm text-gray-600">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    {pair.confidence.toFixed(1)}%
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default KeyValuePairsViewer;