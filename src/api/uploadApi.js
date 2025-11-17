// API thực tế cho luồng Upload
const API_BASE_URL = 'http://localhost:8000'; // URL backend FastAPI

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
  
  try {
    const response = await fetch(`${API_BASE_URL}/file/process_upload`, {
      method: 'POST',
      body: formData,
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    console.log("Upload processing result:", data);
    return data;
  } catch (error) {
    console.error("Error processing upload:", error);
    throw error;
  }
};

/**
 * Gọi API /insert để hoàn tất quá trình upload
 * @param {File} file - File cần upload
 * @param {object} metadata - Metadata của file
 * @returns {Promise<object>} - Kết quả từ backend
 */
export const finalizeUpload = async (file, metadata) => {
  console.log("Finalizing upload for file:", file.name);
  
  const formData = new FormData();
  formData.append('upload_file', file);
  
  // Thêm các trường metadata
  formData.append('title', metadata.title);
  formData.append('category_id', metadata.category);
  formData.append('tags', metadata.tags || '');
  formData.append('access_type', metadata.accessType || 'private');
  formData.append('confidentiality', metadata.confidentiality || 'PUBLIC');
  formData.append('description', metadata.description || '');
  
  // Thêm các trường ẩn từ bước xử lý trước
  if (metadata.ocrContent) {
    formData.append('ocr_content', metadata.ocrContent);
  }
  if (metadata.total_pages) {
    formData.append('total_pages', metadata.total_pages);
  }
  if (metadata.key_values) {
    formData.append('key_values_json', JSON.stringify(metadata.key_values));
  }
  if (metadata.summary) {
    formData.append('summary', metadata.summary);
  }
  
  try {
    const response = await fetch(`${API_BASE_URL}/file/insert`, {
      method: 'POST',
      body: formData,
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    console.log("Finalize upload result:", data);
    return data;
  } catch (error) {
    console.error("Error finalizing upload:", error);
    throw error;
  }
};