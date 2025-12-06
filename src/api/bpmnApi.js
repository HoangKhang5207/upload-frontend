import axios from 'axios';
import { API_BASE_URL, API_ENDPOINTS } from '../config/api';

// Lấy danh sách BPMN
export const getBpmnList = async (organization_id) => {
  try {
    const response = await axios.get(
      `${API_BASE_URL}${API_ENDPOINTS.BPMN.ORGANIZATION(organization_id)}`,
      { withCredentials: true }
    );
    // Trả về mảng data từ response
    return response.data?.data || [];
  } catch (error) {
    console.error('Error fetching BPMN list:', error);
    throw error;
  }
};

// Lấy danh sách BPMN đã xuất bản
export const getPublishedBpmnList = async (organization_id) => {
  try {
    const response = await axios.get(
      `${API_BASE_URL}${API_ENDPOINTS.BPMN.PUBLISHED(organization_id)}`,
      { withCredentials: true }
    );
    return response.data;
  } catch (error) {
    console.error('Error fetching published BPMN list:', error);
    throw error;
  }
};

// Lấy thông tin chi tiết BPMN
export const getBpmnInfo = async (bpmn_upload_id, organization_id, version) => {
  try {
    const response = await axios.get(
      `${API_BASE_URL}${API_ENDPOINTS.BPMN.BPMN_UPLOAD(organization_id, bpmn_upload_id)}`,
      {
        withCredentials: true,
        params: {
           ...(version && { version }) // Chỉ thêm version vào params nếu có giá trị
        }
      }
    );
    
    if (response.data && response.data.success && response.data.data) {
      return response.data.data;
    }
    
    throw new Error('Dữ liệu trả về không hợp lệ');
  } catch (error) {
    console.error('Error fetching BPMN info:', error);
    throw new Error(error.response?.data?.message || 'Không thể lấy thông tin BPMN');
  }
};

// Lấy lịch sử các phiên bản của BPMN
export const getBpmnVersions = async (organization_id, bpmn_upload_id) => {
  try {
    const response = await axios.get(
      `${API_BASE_URL}${API_ENDPOINTS.BPMN.VERSIONS(organization_id, bpmn_upload_id)}`,
      { withCredentials: true }
    );
    return response.data;
  } catch (error) {
    console.error('Error fetching BPMN versions:', error);
    throw error;
  }
};

// Lưu hoặc cập nhật BPMN
export const saveBpmn = async (organizationId, formData) => {
  try {
    // Ensure organizationId is a number or string, not an object
    const orgId = organizationId && typeof organizationId === 'object' 
      ? (organizationId.organization_id || organizationId.id || '') 
      : organizationId;
    
    if (!orgId) {
      throw new Error('Organization ID is required');
    }
    
    // Create a new FormData instance to ensure it's clean
    const formDataToSend = new FormData();
    
    // Copy all entries from the original formData
    if (formData instanceof FormData) {
      for (const [key, value] of formData.entries()) {
        formDataToSend.append(key, value);
      }
    } else if (typeof formData === 'object') {
      // If formData is a plain object, add its properties
      Object.entries(formData).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          formDataToSend.append(key, value);
        }
      });
    }
    
    // Make sure the URL is constructed correctly
    const url = `${API_BASE_URL}/api/v1/bpmn/organization/${orgId}/save`;
    
    const response = await axios.post(
      url,
      formDataToSend,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        withCredentials: true
      }
    );
    
    return response.data;
  } catch (error) {
    console.error('Error saving BPMN:', error);
    throw error;
  }
};

// Xóa BPMN
export const deleteBpmn = async (organization_id, bpmn_upload_id) => {
  try {
    const response = await axios.delete(
      `${API_BASE_URL}${API_ENDPOINTS.BPMN.BPMN_UPLOAD(organization_id, bpmn_upload_id)}`,
      { withCredentials: true }
    );
    return response.data;
  } catch (error) {
    console.error('Error deleting BPMN:', error);
    throw error;
  }
};

// Lấy nội dung file BPMN
export const getBpmnFile = async (filePath) => {
  try {
    const response = await axios.get(
      `${API_BASE_URL}${filePath}`,
      { 
        withCredentials: true,
        responseType: 'text'  // Important for getting the raw XML
      }
    );
    return response.data;
  } catch (error) {
    console.error('Error fetching BPMN file:', error);
    throw new Error('Không thể tải nội dung sơ đồ BPMN');
  }
};