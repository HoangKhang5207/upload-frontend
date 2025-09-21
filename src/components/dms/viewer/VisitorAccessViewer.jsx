import React, { useState, useEffect } from 'react';
import { ClockIcon, UserCircleIcon, ShareIcon, ArrowLeftIcon, ArrowRightIcon, LockClosedIcon } from '@heroicons/react/24/solid';

// Custom hook for countdown timer
const useCountdown = (targetDate) => {
    const countDownDate = new Date(targetDate).getTime();
    const [countDown, setCountDown] = useState(countDownDate - new Date().getTime());

    useEffect(() => {
        const interval = setInterval(() => {
            setCountDown(countDownDate - new Date().getTime());
        }, 1000);
        return () => clearInterval(interval);
    }, [countDownDate]);

    const days = Math.floor(countDown / (1000 * 60 * 60 * 24));
    const hours = Math.floor((countDown % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((countDown % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((countDown % (1000 * 60)) / 1000);

    return { days, hours, minutes, seconds, isExpired: countDown < 0 };
};


const VisitorAccessViewer = ({ documentData }) => {
    const [currentPage, setCurrentPage] = useState(1);
    const { days, hours, minutes, seconds, isExpired } = useCountdown(documentData.expiresAt);
    
    const nextPage = () => setCurrentPage(p => Math.min(p + 1, documentData.totalPages));
    const prevPage = () => setCurrentPage(p => Math.max(p - 1, 1));
    
    if (isExpired) {
        return <div className="text-center text-red-600 font-bold text-2xl">Link đã hết hạn!</div>;
    }

    return (
        <div className="flex flex-col h-full animate-fade-in">
            {/* Header */}
            <header className="flex flex-wrap justify-between items-center p-4 border-b">
                <h1 className="text-2xl font-bold text-gray-800">{documentData.name}</h1>
                <div className="flex items-center gap-4 text-sm text-gray-600">
                    <div className="flex items-center"><UserCircleIcon className="h-5 w-5 mr-1 text-gray-400"/> <span>Chia sẻ bởi: <strong>{documentData.sharedBy}</strong></span></div>
                    <div className="flex items-center text-red-600 font-semibold"><ClockIcon className="h-5 w-5 mr-1"/> <span>Hết hạn sau: {days}d {hours}h {minutes}m {seconds}s</span></div>
                </div>
            </header>

            {/* Viewer Area */}
            <main className="flex-grow flex items-center justify-center bg-gray-200 relative p-4 overflow-hidden">
                {/* Watermark */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
                    <p className="text-7xl md:text-9xl font-black text-black opacity-10 transform -rotate-45 select-none">{documentData.watermark}</p>
                </div>
                
                {/* Document Content */}
                <div className="bg-white w-full max-w-4xl h-[60vh] shadow-lg p-8 text-gray-700 relative overflow-auto">
                    <p>{documentData.pagesContent[currentPage - 1]}</p>
                </div>
            </main>

            {/* Footer / Controls */}
            <footer className="flex justify-between items-center p-4 border-t">
                <div className="flex gap-2">
                    <button disabled className="px-4 py-2 bg-gray-300 text-gray-500 rounded-lg flex items-center cursor-not-allowed" title="Tính năng bị vô hiệu hóa">
                        <LockClosedIcon className="h-5 w-5 mr-2"/> Tải xuống
                    </button>
                     <button disabled className="px-4 py-2 bg-gray-300 text-gray-500 rounded-lg flex items-center cursor-not-allowed" title="Tính năng bị vô hiệu hóa">
                        In
                    </button>
                </div>
                <div className="flex items-center gap-4">
                    <button onClick={prevPage} disabled={currentPage === 1} className="p-2 rounded-full hover:bg-gray-200 disabled:opacity-50"><ArrowLeftIcon className="h-6 w-6"/></button>
                    <span>Trang <strong>{currentPage}</strong> / {documentData.totalPages}</span>
                    <button onClick={nextPage} disabled={currentPage === documentData.totalPages} className="p-2 rounded-full hover:bg-gray-200 disabled:opacity-50"><ArrowRightIcon className="h-6 w-6"/></button>
                </div>
            </footer>
        </div>
    );
};

export default VisitorAccessViewer;