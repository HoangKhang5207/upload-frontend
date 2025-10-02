import React from "react";
import { CheckIcon, LightBulbIcon } from '@heroicons/react/24/solid';

const SuggestionField = ({ label, suggestion, children, onAccept }) => (
    <div>
        <label className="block text-sm font-medium text-gray-700">{label}</label>
        <div className="mt-1 relative group">
            {children}
            {suggestion && (
                <div className="absolute -top-2 -right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center">
                     <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full mr-2 shadow-sm">
                        <LightBulbIcon className="h-4 w-4 inline-block mr-1"/>
                        {String(suggestion.value)} ({suggestion.confidence}%)
                    </span>
                    <button onClick={onAccept} title="Chấp nhận gợi ý" className="p-1.5 bg-green-500 text-white rounded-full shadow-md hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500">
                        <CheckIcon className="h-4 w-4" />
                    </button>
                </div>
            )}
        </div>
    </div>
);

export default SuggestionField;