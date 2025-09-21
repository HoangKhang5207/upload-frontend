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

// Giả lập API để lấy thông tin truy cập tài liệu dựa trên một ID
export const mockGetDocumentAccessDetails = async (docId) => {
    console.log(`[UC-85/86] Fetching access details for docId: ${docId}`);
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Kịch bản 1: Link không hợp lệ hoặc hết hạn
    if (docId === 'expired-link' || docId === 'invalid-id') {
        return {
            success: false,
            error: "404 Not Found",
            message: "Đường dẫn không hợp lệ hoặc tài liệu đã hết hạn truy cập.",
        };
    }

    // Kịch bản 2: Truy cập công khai có giới hạn (UC-86)
    if (docId.startsWith('visitor-')) {
        const expiryTimestamp = new Date().getTime() + 72 * 3600 * 1000; // Còn 72 giờ
        return {
            success: true,
            accessType: 'VISITOR',
            document: {
                id: docId,
                name: "Báo cáo phân tích thị trường Q3-2025.pdf",
                owner: "Phòng Marketing",
                sharedBy: "hoang.ln@innotech.vn",
                sharedAt: new Date().toISOString(),
                expiresAt: new Date(expiryTimestamp).toISOString(),
                watermark: `CONFIDENTIAL - ${docId}`,
                totalPages: 15,
                // Giả lập nội dung trang
                pagesContent: Array(15).fill(null).map((_, i) => `Đây là nội dung trang ${i + 1} của tài liệu. Nội dung này được bảo mật.`),
            }
        };
    }

    // Kịch bản 3: Yêu cầu trả phí để xem (UC-85)
    if (docId.startsWith('paid-')) {
        return {
            success: true,
            accessType: 'PAYMENT_REQUIRED',
            document: {
                id: docId,
                name: "Tài liệu nghiên cứu chuyên sâu về AI.docx",
                author: "Viện Nghiên Cứu INNOTECH",
                price: 250000, // Giá gốc
                previewPages: 3,
                totalPages: 50,
                // Giả lập nội dung trang preview (bị làm mờ)
                pagesContent: Array(3).fill(null).map((_, i) => `Đây là nội dung trang preview ${i + 1}. Mua để xem toàn bộ nội dung.`),
            },
            packages: [
                { id: 'view_once', name: 'Xem 1 lần', price: 50000, description: 'Truy cập xem trong 24h.' },
                { id: 'buy_copy', name: 'Mua bản sao', price: 250000, description: 'Tải xuống bản PDF không giới hạn.' },
                { id: 'subscribe', name: 'Gói thuê bao', price: 500000, description: 'Truy cập toàn bộ tài liệu trong 1 tháng.' }
            ]
        };
    }
    
    // Mặc định là lỗi
    return { success: false, error: "400 Bad Request", message: "Định dạng ID tài liệu không được hỗ trợ." };
};


// API giả lập thanh toán
export const mockProcessPayment = async (docId, packageId, paymentDetails) => {
    console.log(`[UC-85] Processing payment for docId: ${docId}, package: ${packageId}`, paymentDetails);
    await new Promise(resolve => setTimeout(resolve, 2500));
    
    // 80% thành công
    if (Math.random() < 0.8) {
        return {
            success: true,
            transactionId: `TRX-${Date.now()}`,
            message: "Thanh toán thành công! Bạn có thể truy cập tài liệu ngay bây giờ.",
            // Trả về document data đầy đủ sau khi thanh toán
            document: {
                 id: docId,
                name: "Tài liệu nghiên cứu chuyên sâu về AI.docx",
                author: "Viện Nghiên Cứu INNOTECH",
                totalPages: 50,
                watermark: `PAID - ${paymentDetails.email}`,
                pagesContent: Array(50).fill(null).map((_, i) => `Đây là nội dung đầy đủ của trang ${i + 1}. Cảm ơn bạn đã mua tài liệu.`),
            }
        };
    } else {
        return {
            success: false,
            message: "Thanh toán thất bại. Vui lòng thử lại hoặc liên hệ hỗ trợ."
        };
    }
};