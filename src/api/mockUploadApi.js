// Giả lập API cho luồng Upload

/**
 * BƯỚC 1: Kiểm tra quyền truy cập
 * Giả lập việc kiểm tra quyền RBAC và ABAC của người dùng.
 */
export const mockCheckPermissions = async (user) => {
  console.log("Checking permissions for:", user);
  await new Promise(resolve => setTimeout(resolve, 500));

  // Giả lập trường hợp thành công - luôn cho phép upload
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
};

/**
 * Hàm kiểm tra mâu thuẫn dữ liệu chi tiết
 */
export const checkDataConflicts = (keyValues) => {
    const conflicts = [];
    
    // Kiểm tra số lượng âm
    if (keyValues["so_luong"] !== undefined && keyValues["so_luong"] < 0) {
        conflicts.push({
            field: "so_luong",
            value: keyValues["so_luong"],
            message: "Số lượng không thể là số âm"
        });
    }
    
    // Kiểm tra giá trị âm
    if (keyValues["gia_tri"] !== undefined && keyValues["gia_tri"] < 0) {
        conflicts.push({
            field: "gia_tri",
            value: keyValues["gia_tri"],
            message: "Giá trị không thể là số âm"
        });
    }
    
    // Kiểm tra ngày vượt quá 20/08/2025
    if (keyValues["ngay_ban_hanh"]) {
        const datePattern = /(\d{2})\/(\d{2})\/(\d{4})/;
        const match = keyValues["ngay_ban_hanh"].match(datePattern);
        if (match) {
            const day = parseInt(match[1], 10);
            const month = parseInt(match[2], 10) - 1; // JavaScript months are 0-indexed
            const year = parseInt(match[3], 10);
            const documentDate = new Date(year, month, day);
            const cutoffDate = new Date(2025, 7, 20); // 20/08/2025
            
            if (documentDate > cutoffDate) {
                conflicts.push({
                    field: "ngay_ban_hanh",
                    value: keyValues["ngay_ban_hanh"],
                    message: "Ngày ban hành không thể vượt quá 20/08/2025"
                });
            }
        }
    }
    
    return conflicts;
};

// --- Các hàm xử lý riêng biệt ---

/**
 * Hàm giả lập OCR processing
 */
// export const mockOcrProcessing = async (file) => {
//     console.log("Processing OCR for file:", file.name);
//     // Giả lập thời gian xử lý OCR
//     await new Promise(resolve => setTimeout(resolve, 1500));
    
//     // Kiểm tra loại file để xử lý phù hợp
//     const fileName = file.name.toLowerCase();
//     const isVideo = fileName.endsWith('.mp4') || fileName.endsWith('.avi');
//     const isAudio = fileName.endsWith('.mp3') || fileName.endsWith('.wav');
    
//     // Nếu là video hoặc audio, xử lý trích xuất văn bản từ âm thanh
//     if (isVideo || isAudio) {
//         const transcript = isVideo 
//             ? "Cuộc họp phòng kinh doanh ngày 15/08/2025. Hôm nay chúng ta sẽ thảo luận về báo cáo tài chính quý III..."
//             : "Bản ghi âm cuộc gọi với khách hàng. Khách hàng yêu cầu cung cấp báo cáo tài chính quý III năm 2025...";
        
//         return {
//             success: true,
//             ocrContent: transcript,
//         };
//     }
    
//     // Giả lập kết quả OCR cho file hình ảnh/PDF
//     return {
//         success: true,
//         ocrContent: `BÁO CÁO TÀI CHÍNH QUẢN LÝ\nCÔNG TY INNOTECH\nQuý III năm 2025\nNgày ban hành: 15/08/2025...`,
//     };
// };

/**
 * Hàm giả lập kiểm tra trùng lặp
 * Chỉ phát hiện trùng lặp nếu tên file là "Dupli-Document" (bất kể đuôi file)
 */
// export const mockDuplicateCheck = async (file, checkDuplicates = true) => {
//     console.log("Checking duplicates for file:", file.name, "with checkDuplicates:", checkDuplicates);
//     // Giả lập thời gian kiểm tra trùng lặp
//     await new Promise(resolve => setTimeout(resolve, 1000));
    
//     // Kiểm tra xem tên file có chứa "Dupli-Document" không (không phân biệt đuôi)
//     const fileNameWithoutExtension = file.name.replace(/\.[^/.]+$/, "");
//     const isDuplicateFile = fileNameWithoutExtension === "Dupli-Document";
    
//     // Nếu bật kiểm tra trùng lặp và file có tên "Dupli-Document", giả lập phát hiện trùng lặp
//     if (checkDuplicates && isDuplicateFile) {
//         return {
//             success: false,
//             error: "409: Duplicate or conflicting document detected",
//             duplicateData: {
//                 similarity: "95%",
//                 existingDocument: {
//                     name: "Tài liệu mẫu đã tồn tại.pdf",
//                     id: "DOC99999"
//                 }
//             }
//         };
//     }
    
//     // Không tìm thấy trùng lặp
//     return {
//         success: true,
//     };
// };

/**
 * Hàm giả lập gợi ý metadata
 */
// export const mockMetadataSuggestion = async (file, ocrContent) => {
//     console.log("Suggesting metadata for file:", file.name);
//     // Giả lập thời gian gợi ý metadata
//     await new Promise(resolve => setTimeout(resolve, 1200));
    
//     const keyValues = {
//         "Số lượng": 1250,
//         "Ngày ban hành": "15/08/2025",
//         "Tác giả": null, // Giá trị thiếu
//         "Giá trị": -500, // Giá trị mâu thuẫn
//     };
    
//     return {
//         suggestedMetadata: {
//             title: file.name.replace(/\.[^/.]+$/, ""), // Bỏ đuôi file
//             tags: "tài chính, báo cáo, quarterly, 2025",
//             category: 1, // Giả sử ID của "Báo cáo tài chính"
//             key_values: keyValues
//         }
//     };
// };

/**
 * Hàm giả lập kiểm tra dữ liệu
 */
export const mockDataValidation = async (keyValues) => {
    console.log("Validating data");
    // Giả lập thời gian kiểm tra dữ liệu
    await new Promise(resolve => setTimeout(resolve, 800));
    
    // Kiểm tra mâu thuẫn dữ liệu
    const conflicts = checkDataConflicts(keyValues);
    
    return {
        warnings: [
            { field: "Tác giả", message: "Không xác định được tác giả từ nội dung." },
            ...conflicts.map(conflict => ({
                field: conflict.field,
                message: conflict.message
            }))
        ]
    };
};

/**
 * Hàm giả lập nhúng watermark
 */
// export const mockEmbedWatermark = async (file) => {
//     console.log("Embedding watermark for file:", file.name);
//     // Giả lập thời gian nhúng watermark
//     await new Promise(resolve => setTimeout(resolve, 1000));
    
//     // Trả về thông báo thành công
//     return {
//         success: true,
//         message: "Đã nhúng watermark vào tài liệu thành công",
//         watermarkedFile: {
//             name: `${file.name.replace(/\.[^/.]+$/, "")}_watermarked${file.name.match(/\.[^/.]+$/)[0]}`,
//             size: file.size * 1.05 // Kích thước tăng nhẹ do watermark
//         }
//     };
// };

/**
 * BƯỚC 3 & 3.1: Giả lập toàn bộ quá trình xử lý backend sau khi file được tải lên
 * Bao gồm OCR, kiểm tra trùng lặp, gợi ý metadata.
 * @param {File} file - File được tải lên
 * @param {boolean} checkDuplicates - Nếu true, thực hiện kiểm tra trùng lặp; nếu false, bỏ qua kiểm tra
 */
export const mockProcessFile = async (file, checkDuplicates = true) => {
    console.log("Processing file:", file.name);
    console.log("checkDuplicates parameter value:", checkDuplicates);
    
    try {
        // Step 1: OCR Processing
        const ocrResult = await mockOcrProcessing(file);
        if (!ocrResult.success) {
            throw new Error("OCR processing failed");
        }
        
        // Step 2: Duplicate Check
        const duplicateResult = await mockDuplicateCheck(file, checkDuplicates);
        if (!duplicateResult.success) {
            return duplicateResult; // Return duplicate error immediately
        }
        
        // Step 3: Metadata Suggestion
        const metadataResult = await mockMetadataSuggestion(file, ocrResult.ocrContent);
        
        // Step 4: Data Validation
        const validationResult = await mockDataValidation(metadataResult.suggestedMetadata.key_values);
        
        // Step 5: Embed Watermark (always successful in mock)
        const watermarkResult = await mockEmbedWatermark(file);
        
        // Combine all results
        return {
            success: true,
            ocrContent: ocrResult.ocrContent,
            suggestedMetadata: metadataResult.suggestedMetadata,
            warnings: validationResult.warnings,
            watermarkInfo: watermarkResult
        };
    } catch (error) {
        console.error("Error processing file:", error);
        return {
            success: false,
            error: "Có lỗi xảy ra trong quá trình xử lý file: " + error.message
        };
    }
};

/**
 * Xử lý file audio/video để trích xuất văn bản
 */
const processAudioVideoFile = async (file, isVideo, checkDuplicates = true) => {
    // Giả lập thời gian xử lý audio/video
    await new Promise(resolve => setTimeout(resolve, 4000));
    
    // Kiểm tra xem tên file có chứa "Dupli-Document" không (không phân biệt đuôi)
    const fileNameWithoutExtension = file.name.replace(/\.[^/.]+$/, "");
    const isDuplicateFile = fileNameWithoutExtension === "Dupli-Document";
    
    // Nếu bật kiểm tra trùng lặp và file có tên "Dupli-Document", giả lập phát hiện trùng lặp
    if (checkDuplicates && isDuplicateFile) {
        return {
            success: false,
            error: "409: Duplicate or conflicting document detected",
            duplicateData: {
                similarity: "95%",
                existingDocument: {
                    name: "Tài liệu mẫu đã tồn tại.pdf",
                    id: "DOC99999"
                }
            }
        };
    }
    
    // Giả lập kết quả trích xuất văn bản từ audio/video
    const transcript = isVideo 
        ? "Cuộc họp phòng kinh doanh ngày 15/08/2025. Hôm nay chúng ta sẽ thảo luận về báo cáo tài chính quý III..."
        : "Bản ghi âm cuộc gọi với khách hàng. Khách hàng yêu cầu cung cấp báo cáo tài chính quý III năm 2025...";
    
    const keyValues = {
        "Ngày": "15/08/2025",
        "Phòng ban": isVideo ? "Kinh doanh" : "Khách hàng",
        "Loại nội dung": isVideo ? "Cuộc họp" : "Cuộc gọi",
    };
    
    // Kiểm tra mâu thuẫn dữ liệu
    const conflicts = checkDataConflicts(keyValues);
    
    return {
        success: true,
        ocrContent: transcript,
        suggestedMetadata: {
            title: file.name.replace(/\.[^/.]+$/, ""),
            tags: isVideo ? "cuộc họp, video, kinh doanh" : "cuộc gọi, audio, khách hàng",
            category: isVideo ? 3 : 5, // Giả sử ID 3 là "Cuộc họp", ID 5 là "Cuộc gọi"
            key_values: keyValues
        },
        warnings: conflicts.map(conflict => ({
            field: conflict.field,
            message: conflict.message
        }))
    };
};

/**
 * BƯỚC 5, 6, 7: Giả lập việc lưu trữ và trả về kết quả cuối cùng
 */
// export const mockFinalizeUpload = async (file, metadata) => {
//     console.log("Finalizing upload for:", file.name, "with metadata:", metadata);
//     await new Promise(resolve => setTimeout(resolve, 1500));

//     const docId = 'DOC-' + Math.random().toString(36).substr(2, 9).toUpperCase();
// export const mockFinalizeUpload = async (file, metadata) => {
//     console.log("Finalizing upload for:", file.name, "with metadata:", metadata);
//     await new Promise(resolve => setTimeout(resolve, 1500));

//     // Nhúng watermark vào file
//     const watermarkResult = await mockEmbedWatermark(file);
    
//     const docId = 'DOC-' + Math.random().toString(36).substr(2, 9).toUpperCase();
    
// //     let response = {
// //         success: true,
// //         message: "Upload thành công!",
// //         document: {
// //             title: metadata.title,
// //             doc_id: docId,
// //             version: "1.0",
// //             status: "DRAFT",
// //         }
// //     };
//     let response = {
//         success: true,
//         message: "Upload thành công!",
//         document: {
//             title: metadata.title,
//             docId: docId,
//             version: "1.0",
//             status: "DRAFT",
//         }
//     };

//     // Tích hợp UC-84
//     if (metadata.category === 1) { // Giả sử ID 1 là "Báo cáo tài chính"
//         response.autoRouteInfo = {
//             message: "Đã chuyển đến phòng Tài chính để duyệt",
//             workflowName: "Duyệt Báo Cáo Tài Chính"
//         };
//     }
    
//     // Tích hợp UC-86
//     if(metadata.accessType === 'public') {
//         response.document.public_link = `https://dms.innotech.vn/share/${docId}`;
//     }

// //     // Tích hợp UC-85
// //     if(metadata.accessType === 'paid') {
// //         response.document.payment_required = true;
// //     }
//     // Tích hợp UC-85
//     if(metadata.accessType === 'paid') {
//         response.document.payment_required = true;
//     }
    
//     // Thêm thông tin watermark
//     response.watermarkInfo = {
//         success: watermarkResult.success,
//         message: watermarkResult.message,
//         watermarkedFile: watermarkResult.watermarkedFile
//     };
    
//     return response;
// }

/**
 * UC-88: Giả lập API kiểm tra trùng lặp chuyên sâu
 * Trả về danh sách các tài liệu có khả năng trùng lặp.
 * Chỉ phát hiện trùng lặp nếu tên file là "Dupli-Document" (bất kể đuôi file)
 */
export const mockDeepDuplicateCheck = async (file) => {
    console.log(`[UC-88] Performing deep duplicate check for: ${file.name}`);
    // Giả lập thời gian xử lý phức tạp (hashing, indexing, comparing...)
    await new Promise(resolve => setTimeout(resolve, 2500));

    // Kiểm tra xem tên file có chứa "Dupli-Document" không (không phân biệt đuôi)
    const fileNameWithoutExtension = file.name.replace(/\.[^/.]+$/, "");
    const isDuplicateFile = fileNameWithoutExtension === "Dupli-Document";

    // Nếu không phải file "Dupli-Document", không tìm thấy trùng lặp
    if (!isDuplicateFile) {
        return {
            hasDuplicates: false,
            message: "Không tìm thấy tài liệu nào trùng lặp.",
            duplicates: [],
        };
    }

    // Giả lập các kịch bản kết quả khác nhau cho file "Dupli-Document"
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
                name: "Dupli-Document-sample.pdf",
                similarity: 98.5, // Giống gần như hoàn toàn
                type: "exact_match", // hash, content
                owner: "Nguyen Van A",
                uploadDate: "2025-09-15T10:00:00Z",
                path: "/Finance/Reports/2025/",
            },
            {
                id: "DOC-X9Y8Z7W6",
                name: "Dupli-Document-draft-v2.docx",
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
                    name: "Dupli-Document-summary.pdf",
                    similarity: 55.8,
                    type: "content_similarity",
                    owner: "Le Van C",
                    uploadDate: "2025-09-10T09:00:00Z",
                    path: "/Management/Summaries/",
                },
                {
                    id: "DOC-P1Q2R3S4",
                    name: "Dupli-Document-final.pdf",
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

    // Kiểm tra loại file để xử lý phù hợp
    const fileName = file.name.toLowerCase();
    const isVideo = fileName.endsWith('.mp4') || fileName.endsWith('.avi');
    const isAudio = fileName.endsWith('.mp3') || fileName.endsWith('.wav');
    
    // Nếu là video hoặc audio, xử lý trích xuất văn bản từ âm thanh
    if (isVideo || isAudio) {
        const transcript = isVideo 
            ? "Cuộc họp phòng kinh doanh ngày 15/08/2025. Hôm nay chúng ta sẽ thảo luận về báo cáo tài chính quý III..."
            : "Bản ghi âm cuộc gọi với khách hàng. Khách hàng yêu cầu cung cấp báo cáo tài chính quý III năm 2025...";
        
        return {
            success: true,
            processingTime: 4.2, // seconds
            confidence: 92.5, // %
            language: "Vietnamese (vi)",
            extractedText: transcript,
            keyValuePairs: [
                { key: "ngay", value: "15/08/2025", confidence: 98.0 },
                { key: "phong_ban", value: isVideo ? "Kinh doanh" : "Khách hàng", confidence: 95.0 },
                { key: "loai_noi_dung", value: isVideo ? "Cuộc họp" : "Cuộc gọi", confidence: 90.0 },
            ],
            tables: [],
            warnings: [
                "Đây là trích xuất từ âm thanh, độ chính xác có thể thay đổi tùy chất lượng audio.",
            ]
        };
    }

    // Giả lập kết quả OCR cho một file hợp đồng lao động
    return {
        success: true,
        processingTime: 3.45, // seconds
        confidence: 96.8, // %
        language: "Vietnamese (vi)",
        extractedText: `CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM
Độc lập - Tự do - Hạnh phúc

HỢP ĐỒNG LAO ĐỘNG
Số: 123/2025/HĐLĐ-INNOTECH

Hôm nay, ngày 01 tháng 02 năm 2024, tại văn phòng Công ty TNHH INNOTECH Việt Nam, chúng tôi gồm:
BÊN A: CÔNG TY TNHH INNOTECH VIỆT NAM
- Địa chỉ: 123 Đường Nguyễn Văn Cừ, Quận 5, TP.HCM
...
BÊN B: NGƯỜI LAO ĐỘNG
- Họ và tên: Trần Thị Lan Anh
- Ngày sinh: 15/03/1990
...
ĐIỀU 3: MỨC LƯƠNG VÀ PHÚC LỢI
- Lương cơ bản: 25.000.000 VNĐ/tháng
- Phụ cấp: 2.000.000 VNĐ/tháng
...`,
        keyValuePairs: [
            { key: "so_hop_dong", value: "123/2025/HĐLĐ-INNOTECH", confidence: 99.5 },
            { key: "ngay_ky", value: "01/02/2024", confidence: 98.2 },
            { key: "ten_cong_ty", value: "CÔNG TY TNHH INNOTECH VIỆT NAM", confidence: 99.9 },
            { key: "ho_ten", value: "Trần Thị Lan Anh", confidence: 99.1 },
            { key: "ngay_sinh", value: "15/03/1990", confidence: 97.5 },
            { key: "so_cmnd", value: "0123456789", confidence: 96.8 },
            { key: "luong_co_ban", value: "25.000.000 VNĐ/tháng", confidence: 95.0 },
            { key: "thoi_han_hop_dong", value: "24 tháng", confidence: 92.3 },
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
// export const mockTriggerAutoRoute = async (file, metadata) => {
//     console.log(`[UC-84] Checking auto-route rules for: ${file.name} with metadata:`, metadata);
//     await new Promise(resolve => setTimeout(resolve, 1500));

//     const { category, title } = metadata;

//     // RULE 1: Hợp đồng (category=2) -> Gửi cho Trưởng phòng Pháp lý
//     if (category === "2") { // Giả sử ID 2 là "Hợp đồng"
//         return {
//             success: true,
//             triggered: true,
//             workflow: {
//                 name: "Quy trình duyệt Hợp đồng",
//                 id: "WF-CONTRACT-01",
//                 steps: [
//                     { name: "Tải lên", status: "completed", user: "Người dùng", date: new Date().toISOString() },
//                     { name: "Gửi đến Phòng Pháp lý", status: "completed", user: "Hệ thống", date: new Date().toISOString() },
//                     { name: "Chờ duyệt bởi TP Pháp lý", status: "pending", user: "Lê Minh Tuấn", date: null },
//                     { name: "Lưu trữ", status: "upcoming", user: null, date: null }
//                 ]
//             },
//             message: "Đã tự động gửi tài liệu đến quy trình duyệt Hợp đồng.",
//         };
//     }

//     // RULE 2: Báo cáo tài chính (category=1) -> Gửi cho Kế toán trưởng
//     if (category === "1") { // Giả sử ID 1 là "Báo cáo tài chính"
//         return {
//             success: true,
//             triggered: true,
//             workflow: {
//                 name: "Quy trình duyệt Báo cáo Tài chính",
//                 id: "WF-FINANCE-03",
//                 steps: [
//                     { name: "Tải lên", status: "completed", user: "Người dùng", date: new Date().toISOString() },
//                     { name: "Gửi đến Phòng Kế toán", status: "completed", user: "Hệ thống", date: new Date().toISOString() },
//                     { name: "Chờ duyệt bởi Kế toán trưởng", status: "pending", user: "Phan Thị Hoa", date: null },
//                     { name: "Phê duyệt cuối cùng bởi Giám đốc", status: "upcoming", user: "Nguyễn Văn Nam", date: null },
//                     { name: "Lưu trữ", status: "upcoming", user: null, date: null }
//                 ]
//             },
//             message: "Đã tự động gửi tài liệu đến quy trình duyệt Báo cáo Tài chính.",
//         };
//     }

//     // NO MATCHING RULE
//     return {
//         success: true,
//         triggered: false,
//         workflow: null,
//         message: "Tải lên thành công. Không tìm thấy quy trình tự động nào phù hợp. Tài liệu sẽ được lưu vào thư mục 'Chờ xử lý'.",
//     };
// };


// --- HELPER FUNCTIONS ---


/**
 * Hàm giả lập độ trễ mạng
 * @param {number} ms - Thời gian chờ (mili giây)
 */
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * (MỚI & QUAN TRỌNG) Hàm kiểm tra mâu thuẫn dữ liệu chi tiết
 * Dựa trên yêu cầu từ file "phan_loai_key_value_trich_xuat.pdf" và "Các Use Case về Upload tài liệu-v4.docx".
 * @param {object} keyValues - Các cặp key-value được trích xuất
 * @returns {{hasConflicts: boolean, conflicts: Array<{field: string, value: any, message: string}>}}
 */
export const mockDataConflictCheck = (keyValues) => {
    console.log("[UC-39 | MOCK] Checking for data conflicts:", keyValues);
    const conflicts = [];

    // Rule 1: Số lượng không được âm
    if (keyValues["so_luong"] !== undefined && keyValues["so_luong"] < 0) {
        conflicts.push({
            field: "so_luong",
            value: keyValues["so_luong"],
            message: "Số lượng không thể là giá trị âm."
        });
    }

    // Rule 2: Ngày ban hành không được vượt quá 20/08/2025
    if (keyValues["ngay_ban_hanh"]) {
        const datePattern = /(\d{2})\/(\d{2})\/(\d{4})/;
        const match = keyValues["ngay_ban_hanh"].match(datePattern);
        if (match) {
            const day = parseInt(match[1], 10);
            const month = parseInt(match[2], 10) - 1; // Tháng trong JS bắt đầu từ 0
            const year = parseInt(match[3], 10);
            const documentDate = new Date(year, month, day);
            const cutoffDate = new Date(2025, 7, 20); // 20/08/2025

            if (documentDate > cutoffDate) {
                conflicts.push({
                    field: "ngay_ban_hanh",
                    value: keyValues["ngay_ban_hanh"],
                    message: `Ngày ban hành (${keyValues["ngay_ban_hanh"]}) không hợp lệ, vượt quá ngày giới hạn 20/08/2025.`
                });
            }
        }
    }
    
    // Rule 3: Số hiệu không hợp lệ (ví dụ)
    if (keyValues["so_hieu"] && !keyValues["so_hieu"].includes('/')) {
        conflicts.push({
            field: "so_hieu",
            value: keyValues["so_hieu"],
            message: "Định dạng số hiệu văn bản có vẻ không đúng chuẩn (thường có dạng 'Số/Năm/Ký hiệu')."
        });
    }

    return {
        hasConflicts: conflicts.length > 0,
        conflicts: conflicts
    };
};


// --- INDIVIDUAL MOCK API FUNCTIONS (Mô phỏng từng microservice) ---

/**
 * (MỚI) BƯỚC 3: Giả lập khử nhiễu ảnh bằng AI
 * Dựa trên yêu cầu từ file "Bài tập AI-Khử nhiễu ảnh.pdf".
 * @param {File} file - File ảnh cần xử lý
 */
export const mockDenoiseImage = async (file) => {
    console.log("[UC-39 | MOCK] Denoising image:", file.name);
    
    // Chỉ áp dụng cho file ảnh theo yêu cầu
    if (!file.type.startsWith('image/')) {
        return { success: true, message: "Không phải file ảnh, bỏ qua khử nhiễu.", denoised: false };
    }
    
    await sleep(1500); // Giả lập thời gian xử lý AI
    
    return {
        success: true,
        message: "Khử nhiễu ảnh thành công bằng mô hình AI (DnCNN).",
        denoised: true,
        modelUsed: "DnCNN",
        denoisedFile: {
            name: `${file.name.split('.').slice(0, -1).join('.')}_denoised.png`,
            size: file.size * 0.9 // Giả lập kích thước thay đổi
        }
    };
};

/**
 * BƯỚC 3: Giả lập OCR để trích xuất văn bản.
 * @param {File} file - File cần OCR
 */
export const mockOcrProcessing = async (file) => {
    console.log("[UC-39 | MOCK] Processing OCR for:", file.name);
    await sleep(2000); // Giả lập thời gian OCR

    // Giả lập nội dung trích xuất dựa trên file mẫu
    if (file.name.includes('tb1017')) {
         return {
            success: true,
            ocrContent: `BỘ CÔNG THƯƠNG
TRƯỜNG ĐẠI HỌC CÔNG THƯƠNG
Số: 1017/TB-DCT
THÔNG BÁO
Về việc nhận hồ sơ xét học bổng sinh viên vượt khó học kỳ II năm học 2024-2025...`,
        };
    }

    return {
        success: true,
        ocrContent: `CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM
Độc lập - Tự do - Hạnh phúc
Số: 123/QĐ-BGDĐT
Ngày ban hành: 19/09/2025
QUYẾT ĐỊNH
V/v ban hành quy chế mới
...`,
    };
};

/**
 * BƯỚC 3.1: Giả lập kiểm tra trùng lặp (UC-88)
 * @param {File} file 
 * @param {boolean} checkEnabled - Biến để bật/tắt tính năng này cho demo
 */
export const mockDuplicateCheck = async (file, checkEnabled = true) => {
    console.log(`[UC-39 | MOCK] Checking duplicates for: ${file.name}. Enabled: ${checkEnabled}`);
    await sleep(2500); // Giả lập thời gian quét CSDL

    if (!checkEnabled) {
        return { success: true, isDuplicate: false };
    }
    
    // Giả lập kịch bản: Nếu tên file chứa "Dupli-Document", thì phát hiện trùng lặp
    if (file.name.toLowerCase().includes("dupli-document")) {
        return {
            success: false, // Trả về false để dừng luồng
            error: "409: Duplicate or conflicting document detected",
            isDuplicate: true,
            duplicateData: {
                similarity: "95.7%",
                existingDocument: {
                    name: "Tài liệu Kế hoạch Kinh doanh 2025.pdf",
                    id: "DOC-XYZ-123",
                    owner: "Phòng Kinh Doanh"
                }
            }
        };
    }
    
    return { success: true, isDuplicate: false, message: "Không phát hiện tài liệu trùng lặp." };
};


/**
 * BƯỚC 4: Giả lập Gợi ý Metadata & Trích xuất Key-Values (UC-73)
 * @param {string} ocrContent - Nội dung đã được OCR
 */
export const mockMetadataSuggestion = async (ocrContent) => {
    console.log("[UC-39 | MOCK] Suggesting metadata and extracting key-values...");
    await sleep(1800);

    let key_values = {};
    // Giả lập trích xuất key-value dựa trên nội dung OCR
    if (ocrContent.includes("1017/TB-DCT")) {
        key_values = {
            "so_hieu": "1017/TB-DCT",
            "loai_van_ban": "Thông báo",
            "ngay_ban_hanh": "19/09/2025", // Mâu thuẫn với yêu cầu
            "co_quan_ban_hanh": "TRƯỜNG ĐẠI HỌC CÔNG THƯƠNG",
            "trich_yeu": "V/v nhận hồ sơ xét học bổng sinh viên vượt khó...",
            "so_luong": -5 // Mâu thuẫn
        };
    } else {
        key_values = {
            "so_hieu": "123/QĐ-BGDĐT",
            "loai_van_ban": "Quyết định",
            "ngay_ban_hanh": "19/09/2025",
            "co_quan_ban_hanh": "Bộ Giáo dục và Đào tạo",
             "nguoi_ky": null, // Giá trị thiếu
        };
    }

    return {
        success: true,
        suggestedMetadata: {
            tags: "thông báo, học bổng, sinh viên, học phí",
            category: 1, // Giả sử ID 1 = "Hành chính"
            key_values: key_values
        },
        warnings: [ // Giả lập các cảnh báo thiếu thông tin
            { field: "Người ký", message: "Không xác định được người ký từ nội dung." }
        ]
    };
};

/**
 * BƯỚC 3.2: Giả lập nhúng Watermark
 * @param {File} file
 */
export const mockEmbedWatermark = async (file) => {
    console.log("[UC-39 | MOCK] Embedding watermark for:", file.name);
    await sleep(1000);

    return {
        success: true,
        message: "Đã nhúng watermark 'Confidential - INNOTECH' vào tài liệu.",
        watermarkedFile: {
            name: `${file.name.split('.').slice(0, -1).join('.')}_watermarked.pdf`,
            size: file.size * 1.02 // Kích thước tăng nhẹ
        }
    };
};

/**
 * BƯỚC 5-8: Giả lập bước cuối cùng: Lưu trữ, tạo bản ghi, và Auto-Route (UC-84)
 * @param {File} file 
 * @param {object} metadata 
 */
export const mockFinalizeUpload = async (file, metadata) => {
    console.log("[UC-39 | MOCK] Finalizing upload for:", file.name);
    await sleep(2000);

    const doc_id = 'DOC-' + Date.now().toString().slice(-6);
    
    // Tích hợp UC-84: Auto-Route Document After Upload
    const autoRouteResult = await mockTriggerAutoRoute(file, metadata);

    const response = {
        success: true,
        message: "Tài liệu đã được tải lên và xử lý thành công!",
        document: {
            doc_id,
            title: metadata.title,
            version: "1.0",
            status: autoRouteResult.triggered ? "PROCESSING_WORKFLOW" : "DRAFT",
            public_link: metadata.accessType === 'public' ? `https://dms.innotech.vn/share/${doc_id}` : null
        },
        autoRouteInfo: autoRouteResult, // Gắn kết quả auto-route vào response
    };
    
    return response;
};

/**
 * (MỚI) Giả lập API kích hoạt quy trình tự động (UC-84).
 */
export const mockTriggerAutoRoute = async (file, metadata) => {
    console.log(`[UC-84 | MOCK] Checking auto-route rules for category: ${metadata.category}`);
    await sleep(1000);

    // RULE 1: Danh mục "Hành chính" (ID=1) -> Gửi cho Trưởng phòng Hành chính
    if (String(metadata.category) === "1") {
        return {
            triggered: true,
            workflow: {
                name: "Quy trình duyệt Văn bản Hành chính",
                id: "WF-ADMIN-01",
                steps: [
                    { name: "Tải lên", status: "completed", user: "Người dùng", date: new Date().toISOString() },
                    { name: "Gửi đến TP Hành chính", status: "completed", user: "Hệ thống", date: new Date().toISOString() },
                    { name: "Chờ duyệt bởi TP Hành chính", status: "pending", user: "Nguyễn Văn A", date: null },
                    { name: "Lưu trữ", status: "upcoming", user: null, date: null }
                ]
            },
            message: "Tài liệu thuộc danh mục 'Hành chính', đã tự động gửi đến quy trình duyệt của Trưởng phòng Hành chính.",
        };
    }
    
    // NO MATCHING RULE
    return {
        triggered: false,
        workflow: null,
        message: "Không tìm thấy quy trình tự động nào phù hợp. Tài liệu được lưu dưới dạng bản nháp.",
    };
};


/**
 * UC-73: Giả lập API gợi ý metadata CHUYÊN SÂU cho trang demo
 * Phân tích và trả về các gợi ý chi tiết, bao gồm cả các trường hợp thiếu và mâu thuẫn.
 */
export const mockDetailedSuggestMetadata = async (file) => {
    console.log(`[UC-73 | MOCK] Analyzing file for detailed metadata suggestions: ${file.name}`);
    await sleep(2000); // Giả lập thời gian phân tích bằng AI

    // Kịch bản 1: File "hợp lệ"
    let result = {
        title: { value: "Hợp đồng lao động - Trần Thị Lan Anh", confidence: 95.2 },
        summary: { value: "Đây là bản tóm tắt tự động được tạo ra từ nội dung của tài liệu. Nội dung chính đề cập đến việc xét học bổng cho sinh viên có hoàn cảnh khó khăn.", confidence: 88.0 },
        category: { value: 1, confidence: 99.5 }, // ID 1 = "Hành chính"
        documentType: { value: 4, confidence: 95.0 }, // ID 4 = "Thông báo"
        tags: [
            { value: "học bổng", confidence: 99.1 },
            { value: "sinh viên", confidence: 98.3 },
            { value: "học phí", confidence: 92.0 },
            { value: "thông báo", confidence: 85.7 },
        ],
        key_values: {
            "so_hieu": "1017/TB-DCT",
            "loai_van_ban": "Thông báo",
            "ngay_ban_hanh": "19/09/2025", // Mâu thuẫn
            "co_quan_ban_hanh": "TRƯỜNG ĐẠI HỌC CÔNG THƯƠNG",
            "nguoi_ky": null, // Thiếu
        },
    };
    
    // Kiểm tra các trường hợp thiếu và mâu thuẫn
    const { conflicts } = mockDataConflictCheck(result.key_values);
    const warnings = [];
    if (result.key_values["nguoi_ky"] === null) {
        warnings.push({ field: "nguoi_ky", message: "Không tìm thấy thông tin người ký trong văn bản." });
    }

    return { 
        success: true, 
        suggestions: result,
        analysis: {
            conflicts,
            warnings
        }
    };
};

/**
 * (MỞ RỘNG) Giả lập API kiểm tra và kích hoạt quy trình tự động (Auto-Route).
 * Dựa trên metadata để tìm và bắt đầu một workflow, kiểm tra quyền RBAC/ABAC.
 */
export const mockTriggerAutoRoute = async (file, metadata) => {
    console.log(`[UC-84 | MOCK] Checking auto-route rules for: ${file.name} with metadata:`, metadata);
    await sleep(1500);

    const { category, confidentiality, urgency, security } = metadata;

    // Giả lập thông tin người dùng hiện tại (trong thực tế sẽ lấy từ Auth Context)
    const currentUser = {
        userId: 1,
        username: "nguyenvana",
        department: "PHONG_HANH_CHINH", // Phù hợp với category=1 (Hành chính)
        role: "TRUONG_PHONG", // Có quyền documents:distribute, documents:notify
        permissions: ["documents:distribute", "documents:notify"]
    };

    // Giả lập kiểm tra quyền RBAC
    const hasDistributePermission = currentUser.permissions.includes("documents:distribute");
    const hasNotifyPermission = currentUser.permissions.includes("documents:notify");

    // Giả lập kiểm tra quyền ABAC
    const canAccessDocument = (confidentiality === "PUBLIC") || 
                             (confidentiality === "INTERNAL" && currentUser.department === "PHONG_HANH_CHINH") ||
                             (currentUser.role === "TRUONG_PHONG");

    // Nếu không có quyền, trả về lỗi
    if (!hasDistributePermission || !canAccessDocument) {
        return {
            success: false,
            triggered: false,
            workflow: null,
            message: "Không đủ quyền để phân phối tài liệu này.",
            error: "INSUFFICIENT_PERMISSIONS"
        };
    }

    try {
        // RULE 1: Hợp đồng (category=2) -> Gửi cho Trưởng phòng Pháp lý
        if (String(category) === "2") { // Giả sử ID 2 là "Hợp đồng"
            return {
                success: true,
                triggered: true,
                action: "WORKFLOW_ACTIVATION",
                workflow: {
                    name: "Quy trình duyệt Hợp đồng",
                    id: "WF-CONTRACT-01",
                    processKey: "contract_approval_process",
                    stepOrder: 1,
                    candidateGroup: "PHONG_PHAP_LY",
                    pCondition: "contract_type=official",
                    steps: [
                        { name: "Tải lên", status: "completed", user: "Người dùng", date: new Date().toISOString() },
                        { name: "Gửi đến Phòng Pháp lý", status: "completed", user: "Hệ thống", date: new Date().toISOString() },
                        { name: "Chờ duyệt bởi TP Pháp lý", status: "pending", user: "Lê Minh Tuấn", date: null },
                        { name: "Lưu trữ", status: "upcoming", user: null, date: null }
                    ]
                },
                notifications: [
                    { 
                        type: "EMAIL", 
                        recipient: "leminhtuan@company.com", 
                        message: "Có hợp đồng mới cần duyệt: " + metadata.title,
                        sent: true
                    },
                    { 
                        type: "SYSTEM", 
                        recipient: "PHONG_PHAP_LY", 
                        message: "Hợp đồng mới cần xử lý: " + metadata.title,
                        sent: true
                    }
                ],
                tags: ["hợp_đồng", "pháp_lý", "duyệt"],
                message: "Đã tự động gửi tài liệu đến quy trình duyệt Hợp đồng.",
            };
        }

        // RULE 2: Báo cáo tài chính (category=1) -> Gửi cho Kế toán trưởng
        if (String(category) === "1") { // Giả sử ID 1 là "Báo cáo tài chính"
            // Kiểm tra độ khẩn
            const isUrgent = urgency === "Khẩn" || urgency === "Hỏa tốc";
            
            return {
                success: true,
                triggered: true,
                action: "WORKFLOW_ACTIVATION",
                workflow: {
                    name: "Quy trình duyệt Báo cáo Tài chính",
                    id: "WF-FINANCE-03",
                    processKey: "finance_report_process",
                    stepOrder: 1,
                    candidateGroup: "PHONG_KE_TOAN",
                    pCondition: isUrgent ? "priority=high" : "priority=normal",
                    steps: [
                        { name: "Tải lên", status: "completed", user: "Người dùng", date: new Date().toISOString() },
                        { name: "Gửi đến Phòng Kế toán", status: "completed", user: "Hệ thống", date: new Date().toISOString() },
                        { name: "Chờ duyệt bởi Kế toán trưởng", status: "pending", user: "Phan Thị Hoa", date: null },
                        { name: "Phê duyệt cuối cùng bởi Giám đốc", status: "upcoming", user: "Nguyễn Văn Nam", date: null },
                        { name: "Lưu trữ", status: "upcoming", user: null, date: null }
                    ]
                },
                notifications: [
                    { 
                        type: "EMAIL", 
                        recipient: "phanthihoa@company.com", 
                        message: `Có báo cáo tài chính ${isUrgent ? 'KHẨN ' : ''}cần duyệt: ` + metadata.title,
                        sent: true
                    },
                    { 
                        type: "SYSTEM", 
                        recipient: "PHONG_KE_TOAN", 
                        message: `Báo cáo tài chính ${isUrgent ? 'KHẨN ' : ''}cần xử lý: ` + metadata.title,
                        sent: true
                    }
                ],
                tags: ["báo_cáo", "tài_chính", "duyệt", ...(isUrgent ? ["khẩn"] : [])],
                message: `Đã tự động gửi tài liệu đến quy trình duyệt Báo cáo Tài chính${isUrgent ? ' (KHẨN)' : ''}.`,
            };
        }

        // RULE 3: Tài liệu mật -> Gửi thông báo bảo mật
        if (confidentiality === "LOCKED" || security === "Cao") {
            return {
                success: true,
                triggered: true,
                action: "SECURITY_NOTIFICATION",
                workflow: null,
                notifications: [
                    { 
                        type: "EMAIL", 
                        recipient: "security@company.com", 
                        message: "Tài liệu mật đã được tải lên: " + metadata.title,
                        sent: true
                    },
                    { 
                        type: "SYSTEM", 
                        recipient: "BAN_AN_NINH", 
                        message: "Tài liệu mật cần kiểm tra: " + metadata.title,
                        sent: true
                    }
                ],
                tags: ["bảo_mật", "hạn_chế_truy_cập"],
                message: "Tài liệu mật đã được ghi nhận và thông báo đến bộ phận an ninh.",
            };
        }

        // NO MATCHING RULE - Tự động phân loại theo danh mục
        const categoryMap = {
            "1": { name: "Hành chính", folder: "Danh mục Hành chính" },
            "2": { name: "Hợp đồng", folder: "Danh mục Hợp đồng" },
            "3": { name: "Kế toán", folder: "Danh mục Kế toán" },
            "4": { name: "Nhân sự", folder: "Danh mục Nhân sự" }
        };

        const categoryInfo = categoryMap[category] || { name: "Khác", folder: "Tài liệu chung" };

        return {
            success: true,
            triggered: true,
            action: "AUTO_CATEGORIZATION",
            targetFolder: categoryInfo.folder,
            workflow: null,
            notifications: hasNotifyPermission ? [
                { 
                    type: "SYSTEM", 
                    recipient: currentUser.username, 
                    message: `Tài liệu đã được tự động phân loại vào thư mục: ${categoryInfo.folder}`,
                    sent: true
                }
            ] : [],
            tags: [`danh_mục_${categoryInfo.name.toLowerCase()}`],
            message: `Tài liệu đã được tự động phân loại vào thư mục: ${categoryInfo.folder}`,
        };
    } catch (error) {
        // Xử lý lỗi với cơ chế retry
        console.error("[UC-84 | MOCK] Auto-route error:", error);
        
        // Trong thực tế sẽ có cơ chế retry, ở đây chỉ giả lập
        return {
            success: false,
            triggered: false,
            workflow: null,
            message: "Có lỗi xảy ra trong quá trình tự động phân loại. Tài liệu sẽ được lưu dưới dạng bản nháp.",
            error: "AUTO_ROUTE_FAILED",
            retryable: true // Có thể thử lại
        };
    }
};
