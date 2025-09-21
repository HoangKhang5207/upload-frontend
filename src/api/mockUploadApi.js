// Giả lập API cho luồng Upload

/**
 * BƯỚC 1: Kiểm tra quyền truy cập
 * Giả lập việc kiểm tra quyền RBAC và ABAC của người dùng.
 */
export const mockCheckPermissions = async (user) => {
  console.log("Checking permissions for:", user);
  await new Promise(resolve => setTimeout(resolve, 500));

  // Giả lập trường hợp thành công
  if (user && user.department.includes("PHONG_HANH_CHINH")) {
    return {
      granted: true,
      message: "Quyền truy cập hợp lệ.",
      checks: [
        { name: "RBAC - documents:upload", status: "Granted" },
        { name: "RBAC - documents:create", status: "Granted" },
        { name: "ABAC - Department", status: "Valid" },
        { name: "ABAC - Position", status: "Valid" },
      ],
    };
  }

  // Giả lập trường hợp thất bại
  return {
    granted: false,
    message: "403: Insufficient permissions. Không đủ quyền để tải lên.",
    checks: [
        { name: "RBAC - documents:upload", status: "Denied" },
    ],
  };
};


/**
 * BƯỚC 3 & 3.1: Giả lập toàn bộ quá trình xử lý backend sau khi file được tải lên
 * Bao gồm OCR, kiểm tra trùng lặp, gợi ý metadata.
 */
export const mockProcessFile = async (file) => {
    console.log("Processing file:", file.name);
    // Giả lập thời gian xử lý
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    const isDuplicate = Math.random() > 0.7; // 30% tỷ lệ trùng
    
    if (isDuplicate) {
        return {
            success: false,
            error: "409: Duplicate or conflicting document detected",
            duplicateData: {
                similarity: "35%",
                existingDocument: {
                    name: "Bao_cao_tai_chinh_Q2_2025.pdf",
                    id: "DOC12345"
                }
            }
        };
    }

    // Giả lập kết quả xử lý thành công
    return {
        success: true,
        ocrContent: `BÁO CÁO TÀI CHÍNH QUẢN LÝ\nCÔNG TY INNOTECH\nQuý III năm 2025\nNgày ban hành: 15/08/2025...`,
        suggestedMetadata: {
            title: file.name.replace(/\.[^/.]+$/, ""), // Bỏ đuôi file
            tags: "tài chính, báo cáo, quarterly, 2025",
            category: 1, // Giả sử ID của "Báo cáo tài chính"
            key_values: {
                "Số lượng": 1250,
                "Ngày ban hành": "15/08/2025",
                "Tác giả": null, // Giá trị thiếu
                "Giá trị": -500, // Giá trị mâu thuẫn
            }
        },
        warnings: [
            { field: "Tác giả", message: "Không xác định được tác giả từ nội dung." },
            { field: "Giá trị", message: "Số âm không hợp lệ." },
        ]
    };
};

/**
 * BƯỚC 5, 6, 7: Giả lập việc lưu trữ và trả về kết quả cuối cùng
 */
export const mockFinalizeUpload = async (file, metadata) => {
    console.log("Finalizing upload for:", file.name, "with metadata:", metadata);
    await new Promise(resolve => setTimeout(resolve, 1500));

    const docId = 'DOC-' + Math.random().toString(36).substr(2, 9).toUpperCase();
    
    let response = {
        success: true,
        message: "Upload thành công!",
        document: {
            title: metadata.title,
            doc_id: docId,
            version: "1.0",
            status: "DRAFT",
        }
    };

    // Tích hợp UC-84
    if (metadata.category === 1) { // Giả sử ID 1 là "Báo cáo tài chính"
        response.autoRouteInfo = {
            message: "Đã chuyển đến phòng Tài chính để duyệt",
            workflowName: "Duyệt Báo Cáo Tài Chính"
        };
    }
    
    // Tích hợp UC-86
    if(metadata.accessType === 'public') {
        response.document.public_link = `https://dms.innotech.vn/share/${docId}`;
    }

    // Tích hợp UC-85
    if(metadata.accessType === 'paid') {
        response.document.payment_required = true;
    }
    
    return response;
}

/**
 * UC-88: Giả lập API kiểm tra trùng lặp chuyên sâu
 * Trả về danh sách các tài liệu có khả năng trùng lặp.
 */
export const mockDeepDuplicateCheck = async (file) => {
    console.log(`[UC-88] Performing deep duplicate check for: ${file.name}`);
    // Giả lập thời gian xử lý phức tạp (hashing, indexing, comparing...)
    await new Promise(resolve => setTimeout(resolve, 2500));

    // Giả lập các kịch bản kết quả khác nhau
    const randomScenario = Math.random();

    if (randomScenario < 0.2) { // 20% không tìm thấy trùng lặp
        return {
            hasDuplicates: false,
            message: "Không tìm thấy tài liệu nào trùng lặp.",
            duplicates: [],
        };
    }
    
    // 80% tìm thấy trùng lặp
    return {
        hasDuplicates: true,
        message: `Phát hiện ${randomScenario < 0.7 ? 2 : 4} tài liệu có khả năng trùng lặp.`,
        duplicates: [
            {
                id: "DOC-A1B2C3D4",
                name: "Bao_cao_tai_chinh_Q3_2025_final.pdf",
                similarity: 98.5, // Giống gần như hoàn toàn
                type: "exact_match", // hash, content
                owner: "Nguyen Van A",
                uploadDate: "2025-09-15T10:00:00Z",
                path: "/Finance/Reports/2025/",
            },
            {
                id: "DOC-X9Y8Z7W6",
                name: "Q3_Financial_Statement_draft_v2.docx",
                similarity: 76.2, // Tương đồng cao về nội dung
                type: "content_similarity", // semantic, keyword
                owner: "Tran Thi B",
                uploadDate: "2025-09-14T15:30:00Z",
                path: "/Finance/Drafts/",
            },
            // Thêm 2 kết quả nữa nếu randomScenario > 0.7
            ...(randomScenario >= 0.7 ? [
                {
                    id: "DOC-K5L6M7N8",
                    name: "financial_report_q3_summary.pdf",
                    similarity: 55.8,
                    type: "content_similarity",
                    owner: "Le Van C",
                    uploadDate: "2025-09-10T09:00:00Z",
                    path: "/Management/Summaries/",
                },
                {
                    id: "DOC-P1Q2R3S4",
                    name: "BaoCaoTaiChinh_Q3_2025.pdf",
                    similarity: 99.1, // Trùng lặp về tên file
                    type: "filename_match",
                    owner: "Nguyen Van A",
                    uploadDate: "2025-09-15T11:00:00Z",
                    path: "/Finance/Reports/2025/",
                },
            ] : [])
        ].sort((a, b) => b.similarity - a.similarity), // Sắp xếp theo độ tương đồng giảm dần
    };
};

/**
 * UC-87: Giả lập API xử lý OCR chuyên sâu
 * Trích xuất văn bản, key-value, và bảng biểu từ file ảnh hoặc PDF.
 */
export const mockOcrProcess = async (file) => {
    console.log(`[UC-87] Performing OCR process for: ${file.name}`);
    // Giả lập thời gian xử lý OCR
    await new Promise(resolve => setTimeout(resolve, 3500));

    // Giả lập kết quả OCR cho một file hợp đồng lao động
    return {
        success: true,
        processingTime: 3.45, // seconds
        confidence: 96.8, // %
        language: "Vietnamese (vi)",
        extractedText: `CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM\nĐộc lập - Tự do - Hạnh phúc\n\nHỢP ĐỒNG LAO ĐỘNG\nSố: 123/2025/HĐLĐ-INNOTECH\n\nHôm nay, ngày 01 tháng 02 năm 2024, tại văn phòng Công ty TNHH INNOTECH Việt Nam, chúng tôi gồm:\nBÊN A: CÔNG TY TNHH INNOTECH VIỆT NAM\n- Địa chỉ: 123 Đường Nguyễn Văn Cừ, Quận 5, TP.HCM\n...\nBÊN B: NGƯỜI LAO ĐỘNG\n- Họ và tên: Trần Thị Lan Anh\n- Ngày sinh: 15/03/1990\n...\nĐIỀU 3: MỨC LƯƠNG VÀ PHÚC LỢI\n- Lương cơ bản: 25.000.000 VNĐ/tháng\n- Phụ cấp: 2.000.000 VNĐ/tháng\n...`,
        keyValuePairs: [
            { key: "Số hợp đồng", value: "123/2025/HĐLĐ-INNOTECH", confidence: 99.5 },
            { key: "Ngày ký", value: "01/02/2024", confidence: 98.2 },
            { key: "Tên công ty (Bên A)", value: "CÔNG TY TNHH INNOTECH VIỆT NAM", confidence: 99.9 },
            { key: "Họ tên (Bên B)", value: "Trần Thị Lan Anh", confidence: 99.1 },
            { key: "Ngày sinh (Bên B)", value: "15/03/1990", confidence: 97.5 },
            { key: "Lương cơ bản", value: "25.000.000 VNĐ/tháng", confidence: 95.0 },
            { key: "Thời hạn hợp đồng", value: "24 tháng", confidence: 92.3 },
        ],
        tables: [
            {
                name: "Bảng Chi Tiết Phúc Lợi",
                headers: ["Khoản mục", "Giá trị", "Ghi chú"],
                rows: [
                    ["Lương cơ bản", "25.000.000 VNĐ", "Gross"],
                    ["Phụ cấp ăn trưa", "1.000.000 VNĐ", "Hàng tháng"],
                    ["Phụ cấp đi lại", "1.000.000 VNĐ", "Hàng tháng"],
                    ["Bảo hiểm xã hội", "Theo quy định", "Đóng 100%"]
                ]
            }
        ],
        warnings: [
            "Chất lượng ảnh ở góc dưới bên phải hơi mờ, độ chính xác có thể giảm.",
            "Phát hiện chữ viết tay ở phần chữ ký không thể nhận dạng.",
        ]
    };
};

/**
 * UC-73: Giả lập API gợi ý metadata từ nội dung file.
 * Phân tích và trả về các gợi ý chi tiết.
 */
export const mockSuggestMetadata = async (file) => {
    console.log(`[UC-73] Analyzing file for metadata suggestions: ${file.name}`);
    // Giả lập thời gian phân tích bằng AI
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Dựa vào tên file để giả lập các kịch bản khác nhau
    let result;
    if (file.name.toLowerCase().includes('hop_dong')) {
        result = {
            title: { value: "Hợp đồng lao động - Trần Thị Lan Anh", confidence: 95.2 },
            summary: { value: "Hợp đồng lao động xác định thời hạn 24 tháng giữa công ty INNOTECH và bà Trần Thị Lan Anh, quy định về mức lương, phúc lợi và các điều khoản lao động khác.", confidence: 98.0 },
            category: { value: 2, confidence: 99.5 }, // Giả sử ID 2 là "Hợp đồng"
            tags: [
                { value: "hợp đồng lao động", confidence: 99.1 },
                { value: "nhân sự", confidence: 95.3 },
                { value: "2024", confidence: 92.0 },
                { value: "chính thức", confidence: 85.7 },
            ],
            confidentiality: { value: "LOCKED", confidence: 97.8, reason: "Chứa thông tin nhạy cảm như lương, CCCD." },
            retention_policy: { value: "7_years", confidence: 91.5, reason: "Theo chính sách lưu trữ hồ sơ nhân sự." },
        };
    } else { // Kịch bản mặc định cho các file khác
        result = {
            title: { value: file.name.replace(/\.[^/.]+$/, ""), confidence: 88.0 },
            summary: { value: "Đây là bản tóm tắt tự động được tạo ra từ nội dung của tài liệu. Vui lòng xem lại và chỉnh sửa nếu cần thiết để đảm bảo tính chính xác.", confidence: 75.0 },
            category: { value: 4, confidence: 82.1 }, // Giả sử ID 4 là "Tài liệu chung"
            tags: [
                { value: "tài liệu", confidence: 90.0 },
                { value: "báo cáo", confidence: 78.5 },
                { value: "nội bộ", confidence: 70.2 },
            ],
            confidentiality: { value: "INTERNAL", confidence: 85.0, reason: "Dựa trên các từ khóa thông thường trong tài liệu." },
            retention_policy: { value: "3_years", confidence: 76.4, reason: "Chính sách mặc định cho tài liệu chung." },
        };
    }
    
    return { success: true, suggestions: result };
};

/**
 * UC-84: Giả lập API kiểm tra và kích hoạt quy trình tự động (Auto-Route).
 * Dựa trên metadata để tìm và bắt đầu một workflow.
 */
export const mockTriggerAutoRoute = async (file, metadata) => {
    console.log(`[UC-84] Checking auto-route rules for: ${file.name} with metadata:`, metadata);
    await new Promise(resolve => setTimeout(resolve, 1500));

    const { category, title } = metadata;

    // RULE 1: Hợp đồng (category=2) -> Gửi cho Trưởng phòng Pháp lý
    if (category === "2") { // Giả sử ID 2 là "Hợp đồng"
        return {
            success: true,
            triggered: true,
            workflow: {
                name: "Quy trình duyệt Hợp đồng",
                id: "WF-CONTRACT-01",
                steps: [
                    { name: "Tải lên", status: "completed", user: "Người dùng", date: new Date().toISOString() },
                    { name: "Gửi đến Phòng Pháp lý", status: "completed", user: "Hệ thống", date: new Date().toISOString() },
                    { name: "Chờ duyệt bởi TP Pháp lý", status: "pending", user: "Lê Minh Tuấn", date: null },
                    { name: "Lưu trữ", status: "upcoming", user: null, date: null }
                ]
            },
            message: "Đã tự động gửi tài liệu đến quy trình duyệt Hợp đồng.",
        };
    }

    // RULE 2: Báo cáo tài chính (category=1) -> Gửi cho Kế toán trưởng
    if (category === "1") { // Giả sử ID 1 là "Báo cáo tài chính"
        return {
            success: true,
            triggered: true,
            workflow: {
                name: "Quy trình duyệt Báo cáo Tài chính",
                id: "WF-FINANCE-03",
                steps: [
                    { name: "Tải lên", status: "completed", user: "Người dùng", date: new Date().toISOString() },
                    { name: "Gửi đến Phòng Kế toán", status: "completed", user: "Hệ thống", date: new Date().toISOString() },
                    { name: "Chờ duyệt bởi Kế toán trưởng", status: "pending", user: "Phan Thị Hoa", date: null },
                    { name: "Phê duyệt cuối cùng bởi Giám đốc", status: "upcoming", user: "Nguyễn Văn Nam", date: null },
                    { name: "Lưu trữ", status: "upcoming", user: null, date: null }
                ]
            },
            message: "Đã tự động gửi tài liệu đến quy trình duyệt Báo cáo Tài chính.",
        };
    }

    // NO MATCHING RULE
    return {
        success: true,
        triggered: false,
        workflow: null,
        message: "Tải lên thành công. Không tìm thấy quy trình tự động nào phù hợp. Tài liệu sẽ được lưu vào thư mục 'Chờ xử lý'.",
    };
};