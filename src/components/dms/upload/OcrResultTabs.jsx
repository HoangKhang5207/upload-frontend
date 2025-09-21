import React, { useState } from 'react';
import { toast } from 'react-hot-toast';
import { ClipboardDocumentIcon, ListBulletIcon, SparklesIcon, TableCellsIcon } from '@heroicons/react/24/solid';


const OcrResultTabs = ({ result }) => {
    const [activeTab, setActiveTab] = useState('text');

    const copyToClipboard = (text) => {
        navigator.clipboard.writeText(text);
        toast.success("Đã sao chép vào clipboard!");
    };

    const renderContent = () => {
        switch(activeTab) {
            case 'text':
                return (
                    <div>
                        <button onClick={() => copyToClipboard(result.extractedText)} className="absolute top-2 right-2 flex items-center text-xs px-2 py-1 bg-gray-600 text-white rounded-md hover:bg-gray-700">
                            <ClipboardDocumentIcon className="h-4 w-4 mr-1"/> Sao chép
                        </button>
                        <pre className="whitespace-pre-wrap text-sm text-gray-700 font-sans p-4 overflow-auto max-h-[400px]">
                            {result.extractedText}
                        </pre>
                    </div>
                );
            case 'kvp':
                return (
                     <div className="p-4 overflow-auto max-h-[400px]">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Key</th>
                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Value</th>
                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Confidence</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {result.keyValuePairs.map((kv, i) => (
                                    <tr key={i}>
                                        <td className="px-4 py-3 text-sm font-semibold text-gray-800">{kv.key}</td>
                                        <td className="px-4 py-3 text-sm text-gray-600">{kv.value}</td>
                                        <td className="px-4 py-3 text-sm text-gray-600">{kv.confidence.toFixed(1)}%</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                );
            case 'tables':
                 return (
                     <div className="p-4 overflow-auto max-h-[400px] space-y-6">
                         {result.tables.map((table, i) => (
                             <div key={i}>
                                 <h4 className="font-bold mb-2 text-gray-800">{table.name}</h4>
                                 <table className="min-w-full border">
                                     <thead className="bg-gray-100">
                                         <tr>
                                             {table.headers.map((h, j) => <th key={j} className="px-4 py-2 text-left text-sm font-semibold border-b">{h}</th>)}
                                         </tr>
                                     </thead>
                                     <tbody>
                                         {table.rows.map((row, k) => (
                                             <tr key={k} className="hover:bg-gray-50">
                                                 {row.map((cell, l) => <td key={l} className="px-4 py-2 text-sm border-b">{cell}</td>)}
                                             </tr>
                                         ))}
                                     </tbody>
                                 </table>
                             </div>
                         ))}
                     </div>
                 );
        }
    }
    
    const tabs = [
        { id: 'text', name: 'Văn bản trích xuất', icon: ListBulletIcon },
        { id: 'kvp', name: 'Key-Value Pairs', icon: SparklesIcon },
        { id: 'tables', name: 'Bảng biểu', icon: TableCellsIcon }
    ];

    return (
        <div>
            <div className="border-b border-gray-200">
                <nav className="-mb-px flex space-x-6" aria-label="Tabs">
                    {tabs.map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`${activeTab === tab.id ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}
                                        flex items-center whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm transition-colors`}
                        >
                            <tab.icon className="h-5 w-5 mr-2" /> {tab.name}
                        </button>
                    ))}
                </nav>
            </div>
            <div className="relative bg-gray-50 rounded-b-lg border border-t-0">
                {renderContent()}
            </div>
        </div>
    );
};

export default OcrResultTabs;