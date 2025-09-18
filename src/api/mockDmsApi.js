// Giả lập một "database" trên trình duyệt
let mockDocuments = [
    {
        id: 'DOC-2025-111111',
        title: 'Báo cáo tài chính đã xử lý.pdf',
        status: 'PROCESSED',
        ocrText: 'Nội dung báo cáo tài chính...',
        metadata: {
            title: 'Báo cáo tài chính Q1/2025',
            author: 'Phòng Kế toán',
            tags: ['báo cáo', 'tài chính', 'quý 1'],
            summary: 'Báo cáo chi tiết về tình hình tài chính quý 1 năm 2025.',
            category: 1,
            key_values: { so_hieu: 'BC-01/KT' }
        },
    },
    {
        id: 'DOC-2025-222222',
        title: 'Hợp đồng lao động mẫu.docx',
        status: 'UPLOADED',
        ocrText: null,
        metadata: { title: 'Hợp đồng lao động mẫu.docx' },
    }
];

// --- API Services ---

export const getMockDocuments = async () => {
    await new Promise(resolve => setTimeout(resolve, 300));
    return mockDocuments;
}

// UC-39: Upload File - API này giờ đơn giản hơn rất nhiều
export const mockUploadFile = async (file, basicMetadata) => {
    console.log("Uploading file:", file.name, "with metadata:", basicMetadata);
    await new Promise(resolve => setTimeout(resolve, 1500)); // Giả lập upload

    const newDoc = {
        id: `DOC-2025-${Math.floor(Math.random() * 1000000)}`,
        title: file.name,
        status: 'UPLOADED', // Trạng thái ban đầu
        ocrText: null,
        metadata: {
            title: basicMetadata.title || file.name,
            category: basicMetadata.category,
            accessType: basicMetadata.accessType,
        }
    };
    mockDocuments.push(newDoc);

    return { success: true, document: newDoc };
};

// UC-87: OCR Processing
export const mockOcrProcessing = async (docId) => {
    const doc = mockDocuments.find(d => d.id === docId);
    if (!doc) return { success: false, error: 'Document not found' };

    console.log(`Performing OCR for ${doc.title}...`);
    await new Promise(resolve => setTimeout(resolve, 3000)); // Giả lập thời gian OCR

    const ocrText = `CÔNG TY INNOTECH - QUY ĐỊNH NỘI BỘ\nSố: ${Math.floor(Math.random() * 100)}/QĐ-INNT\nNgày ban hành: ${new Date().toLocaleDateString('vi-VN')}\nNội dung chính...`;
    doc.ocrText = ocrText;
    doc.status = 'OCR_COMPLETED';

    return { success: true, ocrText: ocrText };
};


// UC-73: Suggest Metadata
export const mockSuggestMetadata = async (docId) => {
    const doc = mockDocuments.find(d => d.id === docId);
    if (!doc) return { success: false, error: 'Document not found' };

    console.log(`Suggesting metadata for ${doc.title}...`);
    await new Promise(resolve => setTimeout(resolve, 2000));

    const suggestedMetadata = {
        title: doc.metadata.title.replace(/\.[^/.]+$/, "") + " (v1.0)", // Bỏ phần extension
        author: "Phòng Hành chính",
        tags: ["quy định", "nội bộ", "hành chính", "nhân viên"],
        summary: "Đây là tóm tắt tự động được tạo ra cho tài liệu " + doc.metadata.title,
        key_values: {
            "so_hieu": `123/QĐ-INNT`,
            "ngay_ban_hanh": "25/08/2025",
            "loai_tai_lieu": "Quy định"
        },
    };
    
    // Gộp metadata cũ và mới
    doc.metadata = { ...doc.metadata, ...suggestedMetadata };
    doc.status = 'METADATA_SUGGESTED';

    return { success: true, suggestedMetadata: doc.metadata };
};

// UC-88: Check Duplicates
export const mockCheckDuplicates = async (file) => {
    console.log(`Checking duplicates for ${file.name}...`);
    await new Promise(resolve => setTimeout(resolve, 1500));

    // 50% cơ hội tìm thấy trùng lặp
    if (Math.random() > 0.5) {
        return {
            isDuplicate: true,
            message: "Phát hiện 1 tài liệu có nội dung tương đồng trên 85%.",
            duplicates: [
                {
                    docId: 'DOC-2025-111111',
                    title: 'Báo cáo tài chính đã xử lý.pdf',
                    similarity: '85%',
                    conflictingContent: 'Phần 3.1: Doanh thu quý 1 tăng 15% so với cùng kỳ năm trước...'
                }
            ]
        };
    }

    return {
        isDuplicate: false,
        message: "Không phát hiện tài liệu nào trùng lặp."
    };
};

export const mockGetCategories = async () => {
    await new Promise(resolve => setTimeout(resolve, 300));
    return [
      { id: 1, name: "Hành chính" },
      { id: 2, name: "Nhân sự" },
      { id: 3, name: "Đào tạo" },
      { id: 4, name: "Kế hoạch chiến lược" },
    ];
};