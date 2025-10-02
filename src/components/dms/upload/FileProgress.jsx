import React from 'react';
import { DocumentTextIcon, XCircleIcon } from '@heroicons/react/24/solid';

const FileProgress = ({ file, progress, onRemove }) => (
    <div className="mt-4 bg-slate-50 p-4 rounded-lg border border-slate-200 shadow-sm">
        <div className="flex items-center justify-between">
            <div className="flex items-center">
                <DocumentTextIcon className="h-10 w-10 text-slate-500" />
                <div className="ml-3 text-left">
                    <p className="font-semibold text-slate-800">{file.name}</p>
                    <p className="text-sm text-slate-500">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                </div>
            </div>
            <button onClick={onRemove} className="text-slate-400 hover:text-red-500">
                <XCircleIcon className="h-6 w-6" />
            </button>
        </div>
        <div className="mt-3">
            <div className="flex justify-between text-sm text-slate-600 mb-1">
                <span>Đang tải lên</span>
                <span>{Math.round(progress)}%</span>
            </div>
            <div className="w-full bg-slate-200 rounded-full h-2.5">
                <div 
                    className="bg-gradient-to-r from-blue-500 to-purple-500 h-2.5 rounded-full transition-all duration-300 ease-out" 
                    style={{ width: `${progress}%` }}
                ></div>
            </div>
        </div>
    </div>
);

export default FileProgress;