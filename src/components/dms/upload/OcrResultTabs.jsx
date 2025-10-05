import React, { useState } from 'react';
import { toast } from 'react-hot-toast';
import { 
  DocumentTextIcon, 
  ListBulletIcon, 
  SparklesIcon, 
  TableCellsIcon,
  ClipboardDocumentIcon
} from '@heroicons/react/24/solid';

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
                    <div className="relative">
                        <button 
                            onClick={() => copyToClipboard(result.extractedText)} 
                            className="absolute top-4 right-4 z-10 flex items-center text-xs px-3 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition-colors shadow-md"
                        >
                            <ClipboardDocumentIcon className="h-4 w-4 mr-1"/> Sao chép
                        </button>
                        <pre className="whitespace-pre-wrap text-sm text-gray-700 font-sans p-6 overflow-auto max-h-[500px] bg-gray-50 rounded-b-lg">
                            {result.extractedText}
                        </pre>
                    </div>
                );
            case 'kvp':
                return (
                     <div className="p-6 overflow-auto max-h-[500px]">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-100">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Key</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Value</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Độ tin cậy</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {result.keyValuePairs.map((kv, i) => (
                                    <tr key={i} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 text-sm font-semibold text-gray-800">{kv.key}</td>
                                        <td className="px-6 py-4 text-sm text-gray-600">{kv.value}</td>
                                        <td className="px-6 py-4 text-sm">
                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                                {kv.confidence.toFixed(1)}%
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                );
            case 'tables':
                 return (
                     <div className="p-6 overflow-auto max-h-[500px] space-y-6">
                         {result.tables.map((table, i) => (
                             <div key={i} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                                 <div className="bg-gray-50 px-6 py-3 border-b border-gray-200">
                                     <h4 className="font-bold text-gray-800">{table.name}</h4>
                                 </div>
                                 <div className="overflow-x-auto">
                                     <table className="min-w-full">
                                         <thead className="bg-gray-100">
                                             <tr>
                                                 {table.headers.map((h, j) => (
                                                     <th key={j} className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                                                         {h}
                                                     </th>
                                                 ))}
                                             </tr>
                                         </thead>
                                         <tbody className="divide-y divide-gray-200">
                                             {table.rows.map((row, k) => (
                                                 <tr key={k} className="hover:bg-gray-50">
                                                     {row.map((cell, l) => (
                                                         <td key={l} className="px-6 py-4 text-sm text-gray-600 whitespace-nowrap">
                                                             {cell}
                                                         </td>
                                                     ))}
                                                 </tr>
                                             ))}
                                         </tbody>
                                     </table>
                                 </div>
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
        <div className="rounded-xl overflow-hidden shadow-md">
            <div className="border-b border-gray-200 bg-white">
                <nav className="-mb-px flex" aria-label="Tabs">
                    {tabs.map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`${activeTab === tab.id 
                                ? 'border-blue-500 text-blue-600 bg-blue-50' 
                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 hover:bg-gray-50'}
                                flex items-center justify-center whitespace-nowrap py-4 px-6 border-b-2 font-medium text-sm transition-colors duration-200 flex-1`}
                        >
                            <tab.icon className="h-5 w-5 mr-2" /> {tab.name}
                        </button>
                    ))}
                </nav>
            </div>
            <div className="bg-white rounded-b-lg">
                {renderContent()}
            </div>
        </div>
    );
};

export default OcrResultTabs;