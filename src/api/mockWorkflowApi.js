// Mock API functions for workflow management

// Mock data for workflows
const mockWorkflows = [
  {
    id: 1,
    name: 'Quy trình xử lý văn bản đi',
    description: 'Quy trình xử lý các văn bản đi từ phòng hành chính',
    documentType: '1',
    version: '1.0',
    status: 'published',
    bpmnUploadId: 1,
    isDeployed: true, // This workflow is currently in use
    departmentIds: [1, 2], // Applied to departments
    workflowEleDto: {
      categoryIds: [1, 2, 3],
      urgency: ['Thường', 'Khẩn'],
      security: ['Thường', 'Mật']
    },
    bpmnXml: `<?xml version="1.0" encoding="UTF-8"?>
<bpmn:definitions xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:bpmn="http://www.omg.org/spec/BPMN/20100524/MODEL" xmlns:bpmndi="http://www.omg.org/spec/BPMN/20100524/DI" xmlns:dc="http://www.omg.org/spec/DD/20100524/DC" xmlns:camunda="http://camunda.org/schema/1.0/bpmn" targetNamespace="http://bpmn.io/schema/bpmn" id="Definitions_1">
  <bpmn:process id="Process_1" isExecutable="true">
    <bpmn:startEvent id="StartEvent_1">
      <bpmn:outgoing>SequenceFlow_1</bpmn:outgoing>
    </bpmn:startEvent>
    <bpmn:task id="Task_1" name="Kiểm tra quyền truy cập">
      <bpmn:incoming>SequenceFlow_1</bpmn:incoming>
      <bpmn:outgoing>SequenceFlow_2</bpmn:outgoing>
    </bpmn:task>
    <bpmn:task id="Task_2" name="Xử lý OCR">
      <bpmn:incoming>SequenceFlow_2</bpmn:incoming>
      <bpmn:outgoing>SequenceFlow_3</bpmn:outgoing>
    </bpmn:task>
    <bpmn:task id="Task_3" name="Kiểm tra trùng lặp">
      <bpmn:incoming>SequenceFlow_3</bpmn:incoming>
      <bpmn:outgoing>SequenceFlow_4</bpmn:outgoing>
    </bpmn:task>
    <bpmn:endEvent id="EndEvent_1">
      <bpmn:incoming>SequenceFlow_4</bpmn:incoming>
    </bpmn:endEvent>
    <bpmn:sequenceFlow id="SequenceFlow_1" sourceRef="StartEvent_1" targetRef="Task_1" />
    <bpmn:sequenceFlow id="SequenceFlow_2" sourceRef="Task_1" targetRef="Task_2" />
    <bpmn:sequenceFlow id="SequenceFlow_3" sourceRef="Task_2" targetRef="Task_3" />
    <bpmn:sequenceFlow id="SequenceFlow_4" sourceRef="Task_3" targetRef="EndEvent_1" />
  </bpmn:process>
  <bpmndi:BPMNDiagram id="BPMNDiagram_1">
    <bpmndi:BPMNPlane id="BPMNPlane_1" bpmnElement="Process_1">
      <bpmndi:BPMNShape id="StartEvent_1_di" bpmnElement="StartEvent_1">
        <dc:Bounds x="179" y="159" width="36" height="36"/>
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Task_1_di" bpmnElement="Task_1">
        <dc:Bounds x="250" y="135" width="100" height="80"/>
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Task_2_di" bpmnElement="Task_2">
        <dc:Bounds x="390" y="135" width="100" height="80"/>
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Task_3_di" bpmnElement="Task_3">
        <dc:Bounds x="530" y="135" width="100" height="80"/>
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="EndEvent_1_di" bpmnElement="EndEvent_1">
        <dc:Bounds x="680" y="159" width="36" height="36"/>
      </bpmndi:BPMNShape>
      <bpmndi:BPMNEdge id="SequenceFlow_1_di" bpmnElement="SequenceFlow_1">
        <dc:Waypoint x="215" y="177"/>
        <dc:Waypoint x="250" y="177"/>
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="SequenceFlow_2_di" bpmnElement="SequenceFlow_2">
        <dc:Waypoint x="350" y="177"/>
        <dc:Waypoint x="390" y="177"/>
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="SequenceFlow_3_di" bpmnElement="SequenceFlow_3">
        <dc:Waypoint x="490" y="177"/>
        <dc:Waypoint x="530" y="177"/>
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="SequenceFlow_4_di" bpmnElement="SequenceFlow_4">
        <dc:Waypoint x="630" y="177"/>
        <dc:Waypoint x="680" y="177"/>
      </bpmndi:BPMNEdge>
    </bpmndi:BPMNPlane>
  </bpmndi:BPMNDiagram>
</bpmn:definitions>`,
    createdAt: '2023-05-15T10:30:00Z',
    updatedAt: '2023-05-15T10:30:00Z'
  },
  {
    id: 2,
    name: 'Quy trình xử lý văn bản đến',
    description: 'Quy trình xử lý các văn bản đến từ các phòng ban khác',
    documentType: '2',
    version: '2.1',
    status: 'published',
    bpmnUploadId: 2,
    isDeployed: false, // This workflow is not in use
    departmentIds: [], // Not applied to any departments yet
    workflowEleDto: {
      categoryIds: [],
      urgency: [],
      security: []
    },
    bpmnXml: `<?xml version="1.0" encoding="UTF-8"?>
<bpmn:definitions xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:bpmn="http://www.omg.org/spec/BPMN/20100524/MODEL" xmlns:bpmndi="http://www.omg.org/spec/BPMN/20100524/DI" xmlns:dc="http://www.omg.org/spec/DD/20100524/DC" xmlns:camunda="http://camunda.org/schema/1.0/bpmn" targetNamespace="http://bpmn.io/schema/bpmn" id="Definitions_2">
  <bpmn:process id="Process_2" isExecutable="true">
    <bpmn:startEvent id="StartEvent_2">
      <bpmn:outgoing>SequenceFlow_5</bpmn:outgoing>
    </bpmn:startEvent>
    <bpmn:task id="Task_4" name="Nhận văn bản">
      <bpmn:incoming>SequenceFlow_5</bpmn:incoming>
      <bpmn:outgoing>SequenceFlow_6</bpmn:outgoing>
    </bpmn:task>
    <bpmn:task id="Task_5" name="Phân loại văn bản">
      <bpmn:incoming>SequenceFlow_6</bpmn:incoming>
      <bpmn:outgoing>SequenceFlow_7</bpmn:outgoing>
    </bpmn:task>
    <bpmn:task id="Task_6" name="Chuyển bộ phận xử lý">
      <bpmn:incoming>SequenceFlow_7</bpmn:incoming>
      <bpmn:outgoing>SequenceFlow_8</bpmn:outgoing>
    </bpmn:task>
    <bpmn:endEvent id="EndEvent_2">
      <bpmn:incoming>SequenceFlow_8</bpmn:incoming>
    </bpmn:endEvent>
    <bpmn:sequenceFlow id="SequenceFlow_5" sourceRef="StartEvent_2" targetRef="Task_4" />
    <bpmn:sequenceFlow id="SequenceFlow_6" sourceRef="Task_4" targetRef="Task_5" />
    <bpmn:sequenceFlow id="SequenceFlow_7" sourceRef="Task_5" targetRef="Task_6" />
    <bpmn:sequenceFlow id="SequenceFlow_8" sourceRef="Task_6" targetRef="EndEvent_2" />
  </bpmn:process>
  <bpmndi:BPMNDiagram id="BPMNDiagram_2">
    <bpmndi:BPMNPlane id="BPMNPlane_2" bpmnElement="Process_2">
      <bpmndi:BPMNShape id="StartEvent_2_di" bpmnElement="StartEvent_2">
        <dc:Bounds x="179" y="159" width="36" height="36"/>
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Task_4_di" bpmnElement="Task_4">
        <dc:Bounds x="250" y="135" width="100" height="80"/>
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Task_5_di" bpmnElement="Task_5">
        <dc:Bounds x="390" y="135" width="100" height="80"/>
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Task_6_di" bpmnElement="Task_6">
        <dc:Bounds x="530" y="135" width="100" height="80"/>
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="EndEvent_2_di" bpmnElement="EndEvent_2">
        <dc:Bounds x="680" y="159" width="36" height="36"/>
      </bpmndi:BPMNShape>
      <bpmndi:BPMNEdge id="SequenceFlow_5_di" bpmnElement="SequenceFlow_5">
        <dc:Waypoint x="215" y="177"/>
        <dc:Waypoint x="250" y="177"/>
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="SequenceFlow_6_di" bpmnElement="SequenceFlow_6">
        <dc:Waypoint x="350" y="177"/>
        <dc:Waypoint x="390" y="177"/>
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="SequenceFlow_7_di" bpmnElement="SequenceFlow_7">
        <dc:Waypoint x="490" y="177"/>
        <dc:Waypoint x="530" y="177"/>
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="SequenceFlow_8_di" bpmnElement="SequenceFlow_8">
        <dc:Waypoint x="630" y="177"/>
        <dc:Waypoint x="680" y="177"/>
      </bpmndi:BPMNEdge>
    </bpmndi:BPMNPlane>
  </bpmndi:BPMNDiagram>
</bpmn:definitions>`,
    createdAt: '2023-05-14T14:45:00Z',
    updatedAt: '2023-05-14T14:45:00Z'
  },
  {
    id: 3,
    name: 'Quy trình phê duyệt hợp đồng',
    description: 'Quy trình phê duyệt các hợp đồng quan trọng',
    documentType: '1',
    version: '1.5',
    status: 'draft',
    bpmnUploadId: 3,
    isDeployed: false, // This workflow is not in use
    departmentIds: [], // Not applied to any departments yet
    workflowEleDto: {
      categoryIds: [],
      urgency: [],
      security: []
    },
    bpmnXml: `<?xml version="1.0" encoding="UTF-8"?>
<bpmn:definitions xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:bpmn="http://www.omg.org/spec/BPMN/20100524/MODEL" xmlns:bpmndi="http://www.omg.org/spec/BPMN/20100524/DI" xmlns:dc="http://www.omg.org/spec/DD/20100524/DC" xmlns:camunda="http://camunda.org/schema/1.0/bpmn" targetNamespace="http://bpmn.io/schema/bpmn" id="Definitions_3">
  <bpmn:process id="Process_3" isExecutable="true">
    <bpmn:startEvent id="StartEvent_3">
      <bpmn:outgoing>SequenceFlow_9</bpmn:outgoing>
    </bpmn:startEvent>
    <bpmn:task id="Task_7" name="Nhận yêu cầu phê duyệt">
      <bpmn:incoming>SequenceFlow_9</bpmn:incoming>
      <bpmn:outgoing>SequenceFlow_10</bpmn:outgoing>
    </bpmn:task>
    <bpmn:task id="Task_8" name="Kiểm tra pháp lý">
      <bpmn:incoming>SequenceFlow_10</bpmn:incoming>
      <bpmn:outgoing>SequenceFlow_11</bpmn:outgoing>
    </bpmn:task>
    <bpmn:task id="Task_9" name="Phê duyệt cấp 1">
      <bpmn:incoming>SequenceFlow_11</bpmn:incoming>
      <bpmn:outgoing>SequenceFlow_12</bpmn:outgoing>
    </bpmn:task>
    <bpmn:task id="Task_10" name="Phê duyệt cấp 2">
      <bpmn:incoming>SequenceFlow_12</bpmn:incoming>
      <bpmn:outgoing>SequenceFlow_13</bpmn:outgoing>
    </bpmn:task>
    <bpmn:endEvent id="EndEvent_3">
      <bpmn:incoming>SequenceFlow_13</bpmn:incoming>
    </bpmn:endEvent>
    <bpmn:sequenceFlow id="SequenceFlow_9" sourceRef="StartEvent_3" targetRef="Task_7" />
    <bpmn:sequenceFlow id="SequenceFlow_10" sourceRef="Task_7" targetRef="Task_8" />
    <bpmn:sequenceFlow id="SequenceFlow_11" sourceRef="Task_8" targetRef="Task_9" />
    <bpmn:sequenceFlow id="SequenceFlow_12" sourceRef="Task_9" targetRef="Task_10" />
    <bpmn:sequenceFlow id="SequenceFlow_13" sourceRef="Task_10" targetRef="EndEvent_3" />
  </bpmn:process>
  <bpmndi:BPMNDiagram id="BPMNDiagram_3">
    <bpmndi:BPMNPlane id="BPMNPlane_3" bpmnElement="Process_3">
      <bpmndi:BPMNShape id="StartEvent_3_di" bpmnElement="StartEvent_3">
        <dc:Bounds x="179" y="159" width="36" height="36"/>
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Task_7_di" bpmnElement="Task_7">
        <dc:Bounds x="250" y="135" width="100" height="80"/>
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Task_8_di" bpmnElement="Task_8">
        <dc:Bounds x="390" y="135" width="100" height="80"/>
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Task_9_di" bpmnElement="Task_9">
        <dc:Bounds x="530" y="135" width="100" height="80"/>
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Task_10_di" bpmnElement="Task_10">
        <dc:Bounds x="670" y="135" width="100" height="80"/>
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="EndEvent_3_di" bpmnElement="EndEvent_3">
        <dc:Bounds x="820" y="159" width="36" height="36"/>
      </bpmndi:BPMNShape>
      <bpmndi:BPMNEdge id="SequenceFlow_9_di" bpmnElement="SequenceFlow_9">
        <dc:Waypoint x="215" y="177"/>
        <dc:Waypoint x="250" y="177"/>
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="SequenceFlow_10_di" bpmnElement="SequenceFlow_10">
        <dc:Waypoint x="350" y="177"/>
        <dc:Waypoint x="390" y="177"/>
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="SequenceFlow_11_di" bpmnElement="SequenceFlow_11">
        <dc:Waypoint x="490" y="177"/>
        <dc:Waypoint x="530" y="177"/>
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="SequenceFlow_12_di" bpmnElement="SequenceFlow_12">
        <dc:Waypoint x="630" y="177"/>
        <dc:Waypoint x="670" y="177"/>
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="SequenceFlow_13_di" bpmnElement="SequenceFlow_13">
        <dc:Waypoint x="770" y="177"/>
        <dc:Waypoint x="820" y="177"/>
      </bpmndi:BPMNEdge>
    </bpmndi:BPMNPlane>
  </bpmndi:BPMNDiagram>
</bpmn:definitions>`,
    createdAt: '2023-05-10T09:15:00Z',
    updatedAt: '2023-05-12T11:20:00Z'
  }
];

// Mock data for departments
const mockDepartments = [
  { id: 1, name: 'Phòng Hành chính', description: 'Phòng quản lý hành chính', organizationId: 1 },
  { id: 2, name: 'Phòng Kế toán', description: 'Phòng quản lý tài chính', organizationId: 1 },
  { id: 3, name: 'Phòng Nhân sự', description: 'Phòng quản lý nhân sự', organizationId: 1 },
  { id: 4, name: 'Phòng Kỹ thuật', description: 'Phòng kỹ thuật và phát triển', organizationId: 1 },
  { id: 5, name: 'Phòng Marketing', description: 'Phòng marketing và truyền thông', organizationId: 1 }
];

// Mock data for document categories
const documentCategories = [
  { id: 1, name: 'Báo cáo tuần' },
  { id: 2, name: 'Báo cáo tháng' },
  { id: 3, name: 'Công văn' },
  { id: 4, name: 'Nghị quyết' },
  { id: 5, name: 'Biên bản' },
  { id: 6, name: 'Công điện' }
];

// Mock data for BPMN diagrams
const mockBpmnDiagrams = [
  {
    id: 1,
    name: 'Sơ đồ xử lý văn bản đi',
    pathSvg: '/preview1.svg',
    status: 'published'
  },
  {
    id: 2,
    name: 'Sơ đồ xử lý văn bản đến',
    pathSvg: '/preview2.svg',
    status: 'published'
  },
  {
    id: 3,
    name: 'Sơ đồ phê duyệt hợp đồng',
    pathSvg: '/preview3.svg',
    status: 'draft'
  }
];

// Function to get all workflows
export const getWorkflows = () => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(mockWorkflows);
    }, 500);
  });
};

// Function to get a workflow by ID
export const getWorkflowById = (id) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const workflow = mockWorkflows.find(w => w.id === parseInt(id));
      resolve(workflow || null);
    }, 300);
  });
};

// Function to create a new workflow
export const createWorkflow = (workflowData) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const newWorkflow = {
        id: mockWorkflows.length + 1,
        ...workflowData,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      mockWorkflows.push(newWorkflow);
      resolve(newWorkflow);
    }, 500);
  });
};

// Function to update a workflow
export const updateWorkflow = (id, workflowData) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const index = mockWorkflows.findIndex(w => w.id === parseInt(id));
      if (index !== -1) {
        mockWorkflows[index] = {
          ...mockWorkflows[index],
          ...workflowData,
          updatedAt: new Date().toISOString()
        };
        resolve(mockWorkflows[index]);
      } else {
        resolve(null);
      }
    }, 500);
  });
};

// Function to delete a workflow
export const deleteWorkflow = (id) => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const workflow = mockWorkflows.find(w => w.id === parseInt(id));
      
      // Check if workflow is deployed (in use)
      if (workflow && workflow.isDeployed) {
        reject(new Error('Workflow đang được sử dụng và không thể xóa. Các task, process đang chạy: Kiểm tra quyền truy cập, Xử lý OCR, Kiểm tra trùng lặp'));
        return;
      }
      
      const index = mockWorkflows.findIndex(w => w.id === parseInt(id));
      if (index !== -1) {
        const deletedWorkflow = mockWorkflows.splice(index, 1)[0];
        resolve(deletedWorkflow);
      } else {
        resolve(null);
      }
    }, 300);
  });
};

// Function to deploy a workflow
export const deployWorkflow = (id) => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const index = mockWorkflows.findIndex(w => w.id === parseInt(id));
      if (index !== -1) {
        // Check if workflow has been applied to departments and categories
        const workflow = mockWorkflows[index];
        if (!workflow.departmentIds || workflow.departmentIds.length === 0) {
          reject(new Error('Workflow chưa được áp dụng cho bất kỳ phòng ban nào. Vui lòng áp dụng trước khi triển khai.'));
          return;
        }
        
        mockWorkflows[index] = {
          ...mockWorkflows[index],
          isDeployed: true,
          updatedAt: new Date().toISOString()
        };
        resolve(mockWorkflows[index]);
      } else {
        reject(new Error('Không tìm thấy workflow'));
      }
    }, 500);
  });
};

// Function to assign departments to a workflow
export const assignDepartments = (id, departmentIds) => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const index = mockWorkflows.findIndex(w => w.id === parseInt(id));
      if (index !== -1) {
        mockWorkflows[index] = {
          ...mockWorkflows[index],
          departmentIds: departmentIds,
          updatedAt: new Date().toISOString()
        };
        resolve(mockWorkflows[index]);
      } else {
        reject(new Error('Không tìm thấy workflow'));
      }
    }, 500);
  });
};

// Function to assign workflow elements (categories, urgency, security)
export const assignWorkflowElements = (id, elements) => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const index = mockWorkflows.findIndex(w => w.id === parseInt(id));
      if (index !== -1) {
        mockWorkflows[index] = {
          ...mockWorkflows[index],
          workflowEleDto: elements,
          updatedAt: new Date().toISOString()
        };
        resolve(mockWorkflows[index]);
      } else {
        reject(new Error('Không tìm thấy workflow'));
      }
    }, 500);
  });
};

// Function to get all departments
export const getDepartments = () => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(mockDepartments);
    }, 500);
  });
};

// Function to get document categories
export const getDocumentCategories = () => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(documentCategories);
    }, 500);
  });
};

// Function to get all BPMN diagrams
export const getBpmnDiagrams = () => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(mockBpmnDiagrams);
    }, 500);
  });
};

// Function to get a BPMN diagram by ID
export const getBpmnDiagramById = (id) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const diagram = mockBpmnDiagrams.find(d => d.id === parseInt(id));
      resolve(diagram || null);
    }, 300);
  });
};

// Function to create a new BPMN diagram
export const createBpmnDiagram = (diagramData) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const newDiagram = {
        id: mockBpmnDiagrams.length + 1,
        ...diagramData
      };
      mockBpmnDiagrams.push(newDiagram);
      resolve(newDiagram);
    }, 500);
  });
};

// Function to update a BPMN diagram
export const updateBpmnDiagram = (id, diagramData) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const index = mockBpmnDiagrams.findIndex(d => d.id === parseInt(id));
      if (index !== -1) {
        mockBpmnDiagrams[index] = {
          ...mockBpmnDiagrams[index],
          ...diagramData
        };
        resolve(mockBpmnDiagrams[index]);
      } else {
        resolve(null);
      }
    }, 500);
  });
};

// Function to delete a BPMN diagram
export const deleteBpmnDiagram = (id) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const index = mockBpmnDiagrams.findIndex(d => d.id === parseInt(id));
      if (index !== -1) {
        const deletedDiagram = mockBpmnDiagrams.splice(index, 1)[0];
        resolve(deletedDiagram);
      } else {
        resolve(null);
      }
    }, 300);
  });
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
  deleteBpmnDiagram
};