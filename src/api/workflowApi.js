import axios from 'axios';

// Base URL for API requests
const API_BASE_URL = 'http://localhost:8098/api/v1';

// Create axios instance with base URL and common headers
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Send cookies with requests if needed
});

// Request interceptor to handle common request logic
apiClient.interceptors.request.use(
  (config) => {
    // Add auth token if available
    const token = sessionStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle common response/error logic
apiClient.interceptors.response.use(
  (response) => {
    // Handle successful responses
    if (response.data && response.data.success !== undefined) {
      return response.data.data || response.data;
    }
    return response.data;
  },
  (error) => {
    // Handle errors
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      console.error('API Error:', error.response.status, error.response.data);
      return Promise.reject({
        status: error.response.status,
        message: error.response.data?.message || 'An error occurred',
        data: error.response.data,
      });
    } else if (error.request) {
      // The request was made but no response was received
      console.error('No response from server:', error.request);
      return Promise.reject({
        message: 'No response from server. Please check your connection.',
      });
    } else {
      // Something happened in setting up the request that triggered an Error
      console.error('Request setup error:', error.message);
      return Promise.reject({
        message: 'Request setup error: ' + error.message,
      });
    }
  }
);

// Workflow API functions
export const getWorkflows = async (organizationId) => {
  try {
    if (!organizationId) {
      throw new Error('Organization ID is required');
    }
    const response = await apiClient.get(`/workflows/organization/${organizationId}`);
    
    // Handle undefined or null response
    if (!response || !response.data) {
      return [];
    }
    
    // Handle different response formats from BE
    let workflows = [];
    
    // Case 1: BaseResponseDto structure
    if (response.data.success && response.data.data) {
      workflows = response.data.data;
    }
    // Case 2: Direct array response
    else if (Array.isArray(response.data)) {
      workflows = response.data;
    }
    // Case 3: Direct array in response.data
    else if (Array.isArray(response.data.data)) {
      workflows = response.data.data;
    }
    // Case 4: Empty array or null
    else if (response.data.data && response.data.data.length === 0) {
      return [];
    }
    // Case 5: Response has success=false or no data field
    else if (response.data.success === false) {
      return [];
    }
    else {
      return [];
    }
    
    // Transform the response to match the expected format
    return workflows.map(workflow => ({
      ...workflow,
      isDeployed: workflow.isDeployed || false,
      status: workflow.isPublished ? 'published' : 'draft',
      documentType: workflow.documentType?.toString() || '1',
    }));
    
  } catch (error) {
    console.error('Error fetching workflows:', error);
    return [];
  }
};

export const getWorkflowById = async (id) => {
  try {
    const response = await apiClient.get(`/workflows/assigned/${id}`);
    // Transform the response to match the expected format from mock
    return {
      ...response,
      isDeployed: response.isDeployed || false,
      status: response.isPublished ? 'published' : 'draft',
      documentType: response.documentType?.toString() || '1',
    };
  } catch (error) {
    console.error(`Error fetching workflow with id ${id}:`, error);
    throw error;
  }
};

export const createWorkflow = async (formData, organizationId) => {
  try {
    // First upload BPMN files
    const response = await apiClient.post(`/bpmn/organization/${organizationId}/save`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    
    // After successful upload, create workflow record
    const bpmnUploadId = response.id;
    const workflowData = {
      name: formData.get('name'),
      documentType: '1', // Default to 'Văn bản đi'
      startedRole: 'USER',
      bpmnUploadId: bpmnUploadId
    };
    
    const workflowResponse = await apiClient.post('/workflows/create', workflowData);
    return workflowResponse;
  } catch (error) {
    console.error('Error creating workflow:', error);
    throw error;
  }
};

export const updateWorkflow = async (id, workflowData) => {
  try {
    const response = await apiClient.post(`/bpmn/organization/1/save`, workflowData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response;
  } catch (error) {
    console.error(`Error updating workflow with id ${id}:`, error);
    throw error;
  }
};

export const deleteWorkflow = async (id) => {
  try {
    await apiClient.delete(`/bpmn/organization/1/bpmn_upload/${id}`);
    return { success: true };
  } catch (error) {
    console.error(`Error deleting workflow with id ${id}:`, error);
    throw error;
  }
};

export const deployWorkflow = async (id) => {
  try {
    const workflow = await getWorkflowById(id);
    const response = await apiClient.post('/workflows/deploy', {
      id: workflow.id,
      bpmnUploadId: workflow.bpmnUpload?.id,
      name: workflow.name,
      description: workflow.description,
      documentType: workflow.documentType,
    });
    return response;
  } catch (error) {
    console.error(`Error deploying workflow with id ${id}:`, error);
    throw error;
  }
};

export const assignDepartments = async (workflowId, departmentIds) => {
  try {
    const response = await apiClient.post('/workflows/assign_dept', {
      id: workflowId,
      departmentIds,
    });
    return response;
  } catch (error) {
    console.error('Error assigning departments:', error);
    throw error;
  }
};

export const assignWorkflowElements = async (workflowId, elements) => {
  try {
    const response = await apiClient.post('/workflows/assign_ele', {
      id: workflowId,
      workflowEleDto: {
        categoryIds: elements.categoryIds || [],
        urgency: elements.urgency || [],
        security: elements.security || [],
      },
    });
    return response;
  } catch (error) {
    console.error('Error assigning workflow elements:', error);
    throw error;
  }
};

// Department and Category functions (mock for now, replace with real API calls)
export const getDepartments = async () => {
  try {
    // This is a mock implementation - replace with actual API call when available
    // Example: const response = await apiClient.get('/departments');
    return [
      { id: 1, name: 'Phòng Nhân sự' },
      { id: 2, name: 'Phòng Kỹ thuật' },
      { id: 3, name: 'Phòng Kế toán' },
    ];
  } catch (error) {
    console.error('Error fetching departments:', error);
    throw error;
  }
};

export const getDocumentCategories = async () => {
  try {
    // This is a mock implementation - replace with actual API call when available
    // Example: const response = await apiClient.get('/document-categories');
    return [
      { id: 1, name: 'Hợp đồng' },
      { id: 2, name: 'Báo cáo' },
      { id: 3, name: 'Đề xuất' },
    ];
  } catch (error) {
    console.error('Error fetching document categories:', error);
    throw error;
  }
};

// BPMN Diagram functions
export const getBpmnDiagrams = async () => {
  try {
    const response = await apiClient.get('/bpmn/organization/1');
    return response.map(diagram => ({
      ...diagram,
      isDeployed: diagram.isDeployed || false,
      status: diagram.isPublished ? 'published' : 'draft',
    }));
  } catch (error) {
    console.error('Error fetching BPMN diagrams:', error);
    throw error;
  }
};

export const getBpmnDiagramById = async (id) => {
  try {
    // Note: This is a simplified implementation. You might need to adjust based on your actual API
    const response = await apiClient.get(`/bpmn/organization/1/bpmn_upload/${id}`);
    return response;
  } catch (error) {
    console.error(`Error fetching BPMN diagram with id ${id}:`, error);
    throw error;
  }
};

export const createBpmnDiagram = async (diagramData) => {
  try {
    const formData = new FormData();
    Object.keys(diagramData).forEach(key => {
      formData.append(key, diagramData[key]);
    });
    
    const response = await apiClient.post('/bpmn/organization/1/save', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response;
  } catch (error) {
    console.error('Error creating BPMN diagram:', error);
    throw error;
  }
};

export const updateBpmnDiagram = async (id, diagramData) => {
  try {
    const formData = new FormData();
    formData.append('bpmnUploadId', id);
    Object.keys(diagramData).forEach(key => {
      formData.append(key, diagramData[key]);
    });
    
    const response = await apiClient.post('/bpmn/organization/1/save', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response;
  } catch (error) {
    console.error(`Error updating BPMN diagram with id ${id}:`, error);
    throw error;
  }
};

export const deleteBpmnDiagram = async (id) => {
  try {
    await apiClient.delete(`/bpmn/organization/1/bpmn_upload/${id}`);
    return { success: true };
  } catch (error) {
    console.error(`Error deleting BPMN diagram with id ${id}:`, error);
    throw error;
  }
};

export default {
  getWorkflows,
  getWorkflowById,
  createWorkflow,
  updateWorkflow,
  deleteWorkflow,
  deployWorkflow,
  assignDepartments,
  assignWorkflowElements,
  getDepartments,
  getDocumentCategories,
  getBpmnDiagrams,
  getBpmnDiagramById,
  createBpmnDiagram,
  updateBpmnDiagram,
  deleteBpmnDiagram,
};
