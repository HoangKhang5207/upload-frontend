const API_BASE_URL = import.meta.env.VITE_FILE_SERVICE_URL; // Cập nhật đúng prefix router Backend

/**
 * Helper: Lấy Header Authentication chuẩn
 * Lưu ý: Với FormData, KHÔNG set 'Content-Type', browser sẽ tự set boundary.
 */
const getAuthHeaders = () => {
    const token = sessionStorage.getItem('access_token');
    return token ? { 'Authorization': `Bearer ${token}` } : {};
};

/**
 * Helper: Xử lý lỗi HTTP response chuẩn Production
 */
const handleHttpError = async (response) => {
    let errorMessage = `HTTP Error ${response.status}`;
    let errorData = {};
    
    try {
        errorData = await response.json();
        // Ưu tiên lấy message từ detail (FastAPI standard) hoặc message
        errorMessage = errorData.detail || errorData.message || errorMessage;
    } catch (e) {
        // Fallback nếu response không phải JSON
        console.error("Error parsing error response JSON:", e);
    }

    const error = new Error(errorMessage);
    error.status = response.status;
    error.data = errorData; // Gắn data để UI có thể đọc code lỗi (VD: code='SCANNED_PDF')
    
    // Đặc biệt: Đánh dấu lỗi Auth để UI xử lý logout/redirect nếu cần
    if (response.status === 401) error.code = 'UNAUTHORIZED';
    if (response.status === 403) error.code = 'FORBIDDEN';

    throw error;
};

/**
 * Gọi API /process_upload với Streaming Response
 * @param {File} file - File upload
 * @param {Object} options - Các tùy chọn bật/tắt tính năng
 * @param {Function} onProgress - Callback khi nhận được event stream
 * @returns {Promise<Object>} - Kết quả cuối cùng
 */
export const processUploadStream = async (file, options, onProgress) => {
    const formData = new FormData();
    formData.append('upload_file', file);

    // Append các option toggles
    formData.append('enable_denoise', options.enableDenoise);
    formData.append('enable_ocr', options.enableOcr);
    formData.append('enable_duplicate_check', options.enableDuplicateCheck);
    formData.append('enable_metadata', options.enableMetadata);
    formData.append('enable_watermark', options.enableWatermark); // New parameter
    formData.append('ocr_engine', options.ocrEngine); // 'tesseract' or 'easyocr'
    formData.append('force_ocr', options.forceOcr || false);

    // Append params resume nếu có
    if (options.manual_ocr_content) formData.append('manual_ocr_content', options.manual_ocr_content);
    if (options.manual_ocr_pages) formData.append('manual_ocr_pages', options.manual_ocr_pages);
    if (options.manual_total_pages) formData.append('manual_total_pages', options.manual_total_pages);
    if (options.manual_denoise_info) formData.append('manual_denoise_info', options.manual_denoise_info);

    const headers = getAuthHeaders();
    // Lưu ý: Không set 'Content-Type' ở đây khi dùng FormData

    const response = await fetch(`${API_BASE_URL}/process_upload`, {
        method: 'POST',
        headers: headers, // Inject Token
        body: formData,
    });

    if (!response.ok) {
        await handleHttpError(response); // Ném lỗi 401/403/500 ngay tại đây
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder("utf-8");
    let buffer = "";
    let finalResult = null;

    while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");

        // Xử lý từng dòng JSON (NDJSON)
        buffer = lines.pop(); // Giữ lại phần chưa hoàn thiện

        for (const line of lines) {
            if (!line.trim()) continue;
            try {
                const event = JSON.parse(line);

                // Gọi callback để update UI
                if (onProgress) onProgress(event);

                // --- XỬ LÝ CÁC TRẠNG THÁI TRẢ VỀ TỪ STREAM ---

                // 1. Lỗi hệ thống (System Error)
                if (event.status === 'failed') {
                    throw new Error(event.message);
                }

                // 2. Lỗi nghiệp vụ (VD: Trùng lặp - Duplicate)
                if (event.status === 'error') {
                    // Trả về ngay lập tức để UI xử lý (dừng process)
                    return {
                        status: 'error',
                        code: event.code,
                        data: event.data,
                        message: event.message
                    };
                }

                // 3. Cảnh báo (VD: PDF Scan - Cần hỏi ý kiến User)
                if (event.code === 'SCANNED_PDF') {
                    // Backend sẽ dừng stream sau event này, nên ta return luôn
                    return {
                        status: 'warning',
                        code: event.code,
                        message: event.message
                    };
                }

                // 4. Kết quả thành công cuối cùng (Final Result)
                if (event.step === 'final' && event.status === 'success') {
                    finalResult = { status: '200', data: event.data };
                }

            } catch (e) {
                console.error("Error parsing stream JSON:", e);
                // Nếu lỗi do throw Error phía trên thì throw tiếp
                if (e.message) throw e;
            }
        }
    }

    return finalResult;
};

/**
 * Gọi API /process_upload để xử lý file
 * @param {File} file - File cần xử lý
 * @param {boolean} duplicateCheckEnabled - Có bật kiểm tra trùng lặp không
 * @returns {Promise<object>} - Kết quả xử lý từ backend
 */
export const processUpload = async (file, duplicateCheckEnabled = true, forceOcr = false) => {
    console.log("Processing upload for file:", file.name);

    const formData = new FormData();
    formData.append('upload_file', file);
    formData.append('duplicate_check_enabled', duplicateCheckEnabled);
    formData.append('force_ocr', forceOcr);

    // Gọi endpoint: POST http://localhost:8000/api/document/process_upload
    const response = await fetch(`${API_BASE_URL}/process_upload`, {
        method: 'POST',
        body: formData,
    });

    if (!response.ok) {
        const errorData = await response.json();
        // Ném lỗi để UI catch (đặc biệt là lỗi 409 Duplicate)
        const error = new Error(errorData.message || `HTTP error! status: ${response.status}`);
        error.data = errorData; // Gắn data để lấy chi tiết duplicate
        throw error;
    }
    return await response.json();
};

/**
 * Gọi API /insert để hoàn tất quá trình upload
 * @param {File} file - File cần upload
 * @param {object} metadata - Metadata của file
 * @returns {Promise<object>} - Kết quả từ backend
 */
export const finalizeUpload = async (file, metadata) => {
    const formData = new FormData();
    formData.append('upload_file', file);

    // 1. Mapping Data Fields theo UC-39 3.2.39.4
    formData.append('title', metadata.title);
    formData.append('category_id', metadata.category);
    // Convert mảng tags thành string phân cách phẩy
    const tagsString = Array.isArray(metadata.tags) ? metadata.tags.join(',') : (metadata.tags || '');
    formData.append('tags', tagsString);

    formData.append('access_type', metadata.accessType || 'private');
    formData.append('confidentiality', metadata.confidentiality || 'INTERNAL');
    formData.append('description', metadata.description || '');

    // 2. Các trường MỚI bổ sung
    if (metadata.expiryDate) {
        formData.append('expiry_date', metadata.expiryDate); // ISO string
    }
    if (metadata.recipients) {
        // Backend mong đợi JSON string cho mảng ID
        formData.append('recipients_json', JSON.stringify(metadata.recipients));
    }

    // 3. Hidden fields from Phase 1 (Metadata Suggestion)
    if (metadata.ocrContent) formData.append('ocr_content', metadata.ocrContent);
    if (metadata.total_pages) formData.append('total_pages', metadata.total_pages);
    if (metadata.key_values) formData.append('key_values_json', JSON.stringify(metadata.key_values));
    if (metadata.summary) formData.append('summary', metadata.summary);

    const headers = getAuthHeaders();

    const response = await fetch(`${API_BASE_URL}/insert`, {
        method: 'POST',
        headers: headers,
        body: formData,
    });

    if (!response.ok) {
        await handleHttpError(response);
    }
    return await response.json();
};

// Thêm API lấy danh mục thật
export const getCategories = async () => {
    const headers = getAuthHeaders();
    // Thêm Content-Type json cho GET request
    headers['Content-Type'] = 'application/json';

    const response = await fetch(`${API_BASE_URL}/categories`, {
        method: 'GET',
        headers: headers
    });

    if (!response.ok) await handleHttpError(response);
    const res = await response.json();
    return res.data;
};

// API lấy User
export const fetchUsersByDepartment = async () => {
    try {
        const headers = getAuthHeaders();
        headers['Content-Type'] = 'application/json';
        
        const response = await fetch(`${API_BASE_URL}/users/suggestion`, {
            method: 'GET',
            headers: headers
        });
        
        if (!response.ok) {
            // Log warning thôi, không chặn flow chính nếu không load được user gợi ý
            console.warn("Could not fetch user suggestions:", response.statusText);
            return [];
        }
        const res = await response.json();
        return res.data || [];
    } catch (e) {
        console.error("Failed to load users", e);
        return [];
    }
};