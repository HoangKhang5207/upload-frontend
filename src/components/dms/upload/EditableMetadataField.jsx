import React from 'react';
import { CheckIcon, LightBulbIcon } from '@heroicons/react/24/solid';

const EditableMetadataField = ({ 
  label, 
  value, 
  onChange, 
  suggestion, 
  onAcceptSuggestion, 
  type = 'text',
  options = [],
  placeholder = '',
  required = false
}) => {
  const renderInput = () => {
    if (type === 'select') {
      return (
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="">{placeholder}</option>
          {options.map((option) => (
            <option key={option.id} value={option.id}>
              {option.name}
            </option>
          ))}
        </select>
      );
    }

    if (type === 'textarea') {
      return (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          rows="4"
          className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
        />
      );
    }

    return (
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
      />
    );
  };

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <div className="mt-1 relative group">
        {renderInput()}
        {suggestion && (
          <div className="absolute -top-2 -right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center">
            <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full mr-2 shadow-sm">
              <LightBulbIcon className="h-4 w-4 inline-block mr-1"/>
              {type === 'select' 
                ? options.find(opt => opt.id === suggestion.value)?.name || suggestion.value 
                : suggestion.value} ({suggestion.confidence}%)
            </span>
            <button 
              onClick={() => onAcceptSuggestion(suggestion.value)}
              title="Chấp nhận gợi ý" 
              className="p-1.5 bg-green-500 text-white rounded-full shadow-md hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
            >
              <CheckIcon className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default EditableMetadataField;