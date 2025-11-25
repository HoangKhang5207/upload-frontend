// API thực tế cho luồng Upload
const API_BASE_URL = 'http://localhost:8000/api/document'; // Cập nhật đúng prefix router Backend

/**
 * Gọi API /process_upload để xử lý file
 * @param {File} file - File cần xử lý
 * @param {boolean} duplicateCheckEnabled - Có bật kiểm tra trùng lặp không
 * @returns {Promise<object>} - Kết quả xử lý từ backend
 */
export const processUpload = async (file, duplicateCheckEnabled = true) => {
  console.log("Processing upload for file:", file.name);
  
  const formData = new FormData();
  formData.append('upload_file', file);
  formData.append('duplicate_check_enabled', duplicateCheckEnabled);

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
  
  // Mapping Metadata từ UI sang Backend Field names
  formData.append('title', metadata.title);
  formData.append('category_id', metadata.category); // Backend cần int
  formData.append('tags', metadata.tags || '');
  formData.append('access_type', metadata.accessType || 'private');
  formData.append('confidentiality', metadata.confidentiality || 'INTERNAL');
  formData.append('description', metadata.description || '');
  
  // Các trường ẩn từ Phase 1
  if (metadata.ocrContent) formData.append('ocr_content', metadata.ocrContent);
  if (metadata.total_pages) formData.append('total_pages', metadata.total_pages);
  if (metadata.key_values) formData.append('key_values_json', JSON.stringify(metadata.key_values));
  if (metadata.summary) formData.append('summary', metadata.summary);
  
  const response = await fetch(`${API_BASE_URL}/insert`, {
    method: 'POST',
    body: formData,
  });
  
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
  }
  return await response.json();
};

// Thêm API lấy danh mục thật
export const getCategories = async () => {
    const response = await fetch(`${API_BASE_URL}/categories`);
    if (!response.ok) throw new Error("Failed to fetch categories");
    const res = await response.json();
    return res.data; // Trả về mảng [{id, name}, ...]
};