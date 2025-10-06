import React from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { HomeIcon, ArrowPathIcon, DocumentTextIcon, PlayIcon } from '@heroicons/react/24/solid';
import { WorkflowProvider } from '../../contexts/WorkflowContext';
import WorkflowNotificationContainer from '../../components/workflow/WorkflowNotificationContainer';

const MainLayout = () => {
    const location = useLocation();

    return (
        <WorkflowProvider>
            <div className="bg-slate-100 min-h-screen font-sans">
                <header className="bg-white shadow-md">
                    <nav className="container mx-auto px-6 py-3 flex justify-between items-center">
                        <Link to="/" className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-blue-600">
                            DMS Frontend
                        </Link>
                        <div className="flex items-center space-x-4">
                            <Link to="/workflow-dashboard" className="flex items-center text-gray-600 hover:text-blue-600 transition-colors">
                                <ArrowPathIcon className="h-5 w-5 mr-1" />
                                <span>Workflow</span>
                            </Link>
                            <Link to="/workflow-list" className="flex items-center text-gray-600 hover:text-blue-600 transition-colors">
                                <DocumentTextIcon className="h-5 w-5 mr-1" />
                                <span>Danh sách</span>
                            </Link>
                            <Link to="/start-workflow/1" className="flex items-center text-gray-600 hover:text-blue-600 transition-colors">
                                <PlayIcon className="h-5 w-5 mr-1" />
                                <span>Khởi tạo</span>
                            </Link>
                            {location.pathname !== '/' && (
                                <Link to="/" className="flex items-center text-gray-600 hover:text-blue-600 transition-colors">
                                    <HomeIcon className="h-5 w-5 mr-1" />
                                    <span>Trang chủ</span>
                                </Link>
                            )}
                        </div>
                    </nav>
                </header>
                <main className="container mx-auto p-4 sm:p-6 lg:p-8">
                    <Outlet />
                </main>
                <WorkflowNotificationContainer />
            </div>
        </WorkflowProvider>
    );
};

export default MainLayout;