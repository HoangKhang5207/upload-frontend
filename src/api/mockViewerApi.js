// Giả lập dữ liệu cho một tài liệu công khai (UC-86)
const publicDocument = {
    docId: "DOC-2025-710706",
    title: "Báo cáo Tài chính Quý 3/2024",
    accessType: 'public',
    expiryTimestamp: new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString(), // Còn 48 giờ
    allowDownload: true,
    metadata: {
        type: 'PDF Document',
        size: '2.5 MB',
        pages: 15,
        createdBy: 'Nguyễn Văn A',
        createdAt: '2025-08-15T09:00:00Z',
    },
    previewUrl: '/sample-document.pdf' // Dùng file pdf tĩnh trong public folder
};

// Giả lập dữ liệu cho một tài liệu trả phí (UC-85)
const paidDocument = {
    docId: "DOC-2025-889901",
    title: "Hướng dẫn Phát triển Ứng dụng Web Hiện đại",
    accessType: 'paid',
    author: 'Nguyễn Văn A',
    publishDate: '15/01/2024',
    pages: 456,
    rating: 4.8,
    reviews: 1234,
    pricing: {
        read: { price: 50000, currency: 'đ', description: "Xem nội dung tài liệu trong 7 ngày với watermark bảo vệ." },
        download: { price: 100000, currency: 'đ', description: "Tải bản gốc chất lượng cao không watermark." }
    }
};


export const getDocumentDetails = async (docId, token) => {
    console.log(`Fetching details for docId: ${docId} with token: ${token}`);
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Logic giả lập: Dựa vào docId để trả về loại tài liệu tương ứng
    if (docId === 'DOC-2025-710706') {
        if (token === 'temp_public_token') {
            return { success: true, data: publicDocument };
        } else {
            return { success: false, error: "Link expired or invalid" };
        }
    }

    if (docId === 'DOC-2025-889901') {
         return { success: true, data: paidDocument };
    }

    return { success: false, error: "Document not found" };
};

// ...

export const processPayment = async (docId, packageType, paymentMethod, paymentDetails) => {
    console.log(`Processing payment for ${docId}, package: ${packageType}, method: ${paymentMethod}`);
    console.log("Details:", paymentDetails);
    
    // Giả lập loading
    await new Promise(resolve => setTimeout(resolve, 3000));

    // Giả lập lỗi mã giao dịch không hợp lệ cho VCB
    if (paymentMethod === 'VCB' && paymentDetails?.transactionCode !== 'VCB123456789') {
        return {
            success: false,
            error: "Mã giao dịch không hợp lệ hoặc đã hết hạn.",
            errorCode: "INVALID_TRANSACTION_CODE",
            suggestions: [
                "Kiểm tra lại mã giao dịch bạn đã nhập.",
                "Đảm bảo giao dịch đã được thực hiện thành công trên ứng dụng ngân hàng.",
                "Thử tạo một giao dịch mới nếu cần thiết."
            ]
        }
    }
    
    // Giả lập lỗi chung cho MoMo
    if (paymentMethod === 'MoMo') {
         return {
            success: false,
            error: "Giao dịch qua MoMo không thành công.",
            errorCode: "MOMO_FAILED_002",
            suggestions: [ "Vui lòng thử lại sau ít phút.", "Kiểm tra kết nối mạng của bạn." ]
        }
    }

    // Giả lập thành công cho các trường hợp còn lại
    return {
        success: true,
        transactionId: `#TXN20250806${Math.floor(Math.random() * 10000)}`,
        accessType: packageType === 'read' ? 'Đọc (7 ngày)' : 'Tải xuống vĩnh viễn',
        expiryDate: packageType === 'read' ? new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toLocaleString('vi-VN') : 'Không giới hạn',
    };
};