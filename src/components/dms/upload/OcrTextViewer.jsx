import React from 'react';
import { ClipboardDocumentIcon } from '@heroicons/react/24/solid';

const OcrTextViewer = ({ text, onCopy }) => {
  const handleCopy = () => {
    navigator.clipboard.writeText(text);
    if (onCopy) onCopy();
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div className="p-4 border-b border-gray-200 flex justify-between items-center">
        <h3 className="text-lg font-bold text-gray-800">Văn bản trích xuất</h3>
        <button
          onClick={handleCopy}
          className="flex items-center text-sm px-3 py-1.5 bg-gray-600 text-white rounded-md hover:bg-gray-700"
        >
          <ClipboardDocumentIcon className="h-4 w-4 mr-1.5" />
          Sao chép
        </button>
      </div>
      
      <div className="p-4">
        <pre className="whitespace-pre-wrap text-sm text-gray-700 font-sans p-4 bg-gray-50 rounded-lg overflow-auto max-h-96">
          {text}
        </pre>
      </div>
    </div>
  );
};

export default OcrTextViewer;