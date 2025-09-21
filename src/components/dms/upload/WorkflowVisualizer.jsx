import React from 'react';

const WorkflowVisualizer = ({ workflow }) => {
    const getStatusStyles = (status) => {
        switch (status) {
            case 'completed': return { bg: 'bg-green-500', text: 'text-white', icon: '✓' };
            case 'pending': return { bg: 'bg-yellow-500', text: 'text-white', icon: '...' };
            case 'upcoming': return { bg: 'bg-gray-300', text: 'text-gray-600', icon: '○' };
            default: return { bg: 'bg-gray-200', text: 'text-gray-500' };
        }
    };

    return (
        <div className="mt-4">
            <h4 className="font-bold text-gray-800 mb-4">Sơ đồ quy trình: {workflow.name}</h4>
            <div className="relative">
                {/* Connecting line */}
                <div className="absolute left-5 top-5 h-[calc(100%-2rem)] w-0.5 bg-gray-300"></div>
                
                {workflow.steps.map((step, index) => {
                    const styles = getStatusStyles(step.status);
                    return (
                        <div key={index} className="flex items-start mb-6 relative">
                            <div className={`z-10 w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg ${styles.bg} ${styles.text}`}>
                                {styles.icon}
                            </div>
                            <div className="ml-4">
                                <p className="font-semibold text-gray-900">{step.name}</p>
                                <p className="text-sm text-gray-500">
                                    {step.user ? `Người xử lý: ${step.user}` : 'Hành động hệ thống'}
                                </p>
                                {step.date && <p className="text-xs text-gray-400">Thời gian: {new Date(step.date).toLocaleString('vi-VN')}</p>}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default WorkflowVisualizer;