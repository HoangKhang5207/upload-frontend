import React from 'react';
import { CheckIcon } from '@heroicons/react/24/solid';

const SuggestionInput = ({ label, suggestion, onAccept, children }) => (
    <div>
        <label className="block text-sm font-medium text-gray-700">{label}</label>
        <div className="mt-1 relative">
            {children}
            {suggestion && (
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                     <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded-md mr-2">
                        Gợi ý: {suggestion.value} ({suggestion.confidence}%)
                    </span>
                    <button onClick={onAccept} className="p-1 bg-green-100 text-green-700 rounded-full hover:bg-green-200">
                        <CheckIcon className="h-4 w-4" />
                    </button>
                </div>
            )}
        </div>
    </div>
);

export default SuggestionInput;