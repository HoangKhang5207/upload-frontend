// Cấu hình base URL cho API
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8098';

// Các endpoint API
export const API_ENDPOINTS = {
  // BPMN endpoints
  BPMN: {
    BASE: '/api/v1/bpmn',
    ORGANIZATION: (orgId) => `/api/v1/bpmn/organization/${orgId}`,
    BPMN_UPLOAD: (orgId, bpmnId) => `/api/v1/bpmn/organization/${orgId}/bpmn_upload/${bpmnId}`,
    VERSIONS: (orgId, bpmnId) => `/api/v1/bpmn/organization/${orgId}/bpmn_upload/${bpmnId}/versions`,
    PUBLISHED: (orgId) => `/api/v1/bpmn/organization/${orgId}/published`,
    SAVE: (orgId) => `/api/v1/bpmn/organization/${orgId}/save`
  },
  // Có thể thêm các endpoint khác ở đây
};

export { API_BASE_URL };
export default {
  API_BASE_URL,
  API_ENDPOINTS,
};
