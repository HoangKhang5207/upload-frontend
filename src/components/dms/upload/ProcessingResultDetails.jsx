import React from 'react';
import { CheckBadgeIcon, ExclamationTriangleIcon, DocumentTextIcon, SparklesIcon, ShieldCheckIcon, EyeSlashIcon } from '@heroicons/react/24/solid';

// Component con cho từng mục kết quả
const ResultSection = ({ title, icon, children }) => (
    <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
        <h4 className="flex items-center text-md font-bold text-gray-800 mb-3">
            {icon}
            {title}
        </h4>
        <div className="text-sm text-gray-700 space-y-2">
            {children}
        </div>
    </div>
);

const ProcessingResultDetails = ({ apiResponse }) => {
    if (!apiResponse) return null;

    const { denoiseInfo, ocrContent, suggestedMetadata, conflicts, watermarkInfo } = apiResponse;

    return (
        <div className="space-y-6 animate-fade-in">
            <h3 className="text-xl font-bold text-gray-900">Chi tiết Kết quả Xử lý Backend</h3>
            
            {/* 1. Kết quả Khử nhiễu ảnh (AI) */}
            {denoiseInfo && (
                <ResultSection title="1. Khử nhiễu ảnh (AI)" icon={<SparklesIcon className="h-5 w-5 mr-2 text-purple-500"/>}>
                    {denoiseInfo.denoised ? (
                        <>
                            <p className="flex items-center text-green-700"><CheckBadgeIcon className="h-5 w-5 mr-1"/> {denoiseInfo.message}</p>
                            <p><strong>Model sử dụng:</strong> {denoiseInfo.modelUsed}</p>
                            <p><strong>File sau xử lý:</strong> <span className="font-mono">{denoiseInfo.denoisedFile.name}</span></p>
                        </>
                    ) : (
                        <p className="flex items-center text-gray-500"><EyeSlashIcon className="h-5 w-5 mr-1"/> {denoiseInfo.message}</p>
                    )}
                </ResultSection>
            )}

            {/* 2. Kết quả OCR & Trích xuất văn bản */}
            <ResultSection title="2. OCR & Trích xuất văn bản" icon={<DocumentTextIcon className="h-5 w-5 mr-2 text-blue-500"/>}>
                <label className="block text-xs font-medium text-gray-500">Nội dung đã trích xuất:</label>
                <textarea
                    readOnly
                    value={ocrContent || "Không có nội dung được trích xuất."}
                    className="w-full h-32 p-2 border rounded-md bg-gray-50 font-mono text-xs"
                />
            </ResultSection>

            {/* 4. Gợi ý & Trích xuất Key-Values */}
            <ResultSection title="4. Gợi ý & Trích xuất Key-Values" icon={<SparklesIcon className="h-5 w-5 mr-2 text-yellow-500"/>}>
                 <label className="block text-xs font-medium text-gray-500">Các cặp Key-Value được nhận dạng:</label>
                <pre className="bg-gray-800 text-white p-3 rounded-md text-xs whitespace-pre-wrap max-h-48 overflow-y-auto">
                    {JSON.stringify(suggestedMetadata?.key_values || { "Lỗi": "Không thể trích xuất Key-Values." }, null, 2)}
                </pre>
            </ResultSection>
            
            {/* 5. Kết quả Kiểm tra mâu thuẫn dữ liệu */}
            <ResultSection title="5. Kiểm tra mâu thuẫn dữ liệu" icon={<ExclamationTriangleIcon className="h-5 w-5 mr-2 text-red-500"/>}>
                {conflicts && conflicts.length > 0 ? (
                    <div className="p-3 bg-red-50 border border-red-200 rounded-md">
                        <p className="font-semibold text-red-800">Phát hiện {conflicts.length} mâu thuẫn:</p>
                        <ul className="list-disc list-inside mt-2 text-red-700">
                            {conflicts.map((c, i) => (
                                <li key={i}>
                                    Trường "<strong>{c.field}</strong>" có giá trị "<em>{c.value}</em>": {c.message}
                                </li>
                            ))}
                        </ul>
                    </div>
                ) : (
                     <p className="flex items-center text-green-700"><CheckBadgeIcon className="h-5 w-5 mr-1"/> Không phát hiện mâu thuẫn dữ liệu nào.</p>
                )}
            </ResultSection>

             {/* 6. Kết quả Nhúng watermark bảo vệ */}
            {watermarkInfo && (
                <ResultSection title="6. Nhúng Watermark bảo vệ" icon={<ShieldCheckIcon className="h-5 w-5 mr-2 text-green-500"/>}>
                     <p className="flex items-center text-green-700"><CheckBadgeIcon className="h-5 w-5 mr-1"/> {watermarkInfo.message}</p>
                     <p><strong>File sau xử lý:</strong> <span className="font-mono">{watermarkInfo.watermarkedFile.name}</span></p>
                </ResultSection>
            )}
        </div>
    );
};

export default ProcessingResultDetails;