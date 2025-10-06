import React, { useState, useEffect, useRef } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeftIcon,
  DocumentTextIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  PlayIcon,
  UserIcon,
  ClockIcon
} from '@heroicons/react/24/outline';
import BpmnViewer from 'bpmn-js/lib/Viewer';
import 'bpmn-js/dist/assets/diagram-js.css';
import 'bpmn-js/dist/assets/bpmn-font/css/bpmn.css';
import * as mockWorkflowApi from '../../api/mockWorkflowApi';
import WorkflowNavigation from '../../components/workflow/WorkflowNavigation';
import { useWorkflow } from '../../contexts/WorkflowContext';
import WorkflowLoading from '../../components/workflow/WorkflowLoading';

const WorkflowDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { state, dispatch } = useWorkflow();
  const [workflow, setWorkflow] = useState(null);
  const [loading, setLoading] = useState(true);
  const [diagramLoading, setDiagramLoading] = useState(false);
  const [diagramError, setDiagramError] = useState(null);
  const [workflowSteps, setWorkflowSteps] = useState([]);
  const diagramContainerRef = useRef(null);
  const viewerRef = useRef(null);

  // Initial BPMN diagram XML for display
  const initialDiagramXML = `<?xml version="1.0" encoding="UTF-8"?>
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
</bpmn:definitions>`;

  useEffect(() => {
    const fetchWorkflow = async () => {
      dispatch({ type: 'SET_LOADING', payload: true });
      try {
        const data = await mockWorkflowApi.getWorkflowById(id);
        setWorkflow(data);
      } catch (error) {
        console.error('Error fetching workflow:', error);
        dispatch({ type: 'SET_ERROR', payload: 'Có lỗi xảy ra khi tải thông tin quy trình' });
      } finally {
        setLoading(false);
        dispatch({ type: 'SET_LOADING', payload: false });
      }
    };

    if (id) {
      fetchWorkflow();
    }
  }, [id, dispatch]);

  useEffect(() => {
    // Initialize the BPMN viewer when the component mounts
    if (diagramContainerRef.current) {
      viewerRef.current = new BpmnViewer({
        container: diagramContainerRef.current,
      });

      // Load the diagram when workflow data is available
      if (workflow) {
        loadDiagram();
      }
    }

    return () => {
      // Clean up the viewer when the component unmounts
      if (viewerRef.current) {
        viewerRef.current.destroy();
      }
    };
  }, [workflow]);

  const loadDiagram = async () => {
    if (!viewerRef.current) return;
    
    setDiagramLoading(true);
    setDiagramError(null);
    
    try {
      // Try to load the actual BPMN XML from the workflow
      // If not available, use the initial diagram
      const bpmnXml = workflow.bpmnXml || initialDiagramXML;
      await viewerRef.current.importXML(bpmnXml);
      
      // Extract workflow steps from the diagram
      extractWorkflowStepsFromDiagram(bpmnXml);
      
      // Zoom to fit the diagram
      const canvas = viewerRef.current.get('canvas');
      canvas.zoom('fit-viewport');
    } catch (error) {
      console.error('Error loading diagram:', error);
      setDiagramError('Không thể tải sơ đồ workflow');
    } finally {
      setDiagramLoading(false);
    }
  };

  const extractWorkflowStepsFromDiagram = (bpmnXml) => {
    try {
      // Parse the BPMN XML to extract steps
      const parser = new DOMParser();
      const xmlDoc = parser.parseFromString(bpmnXml, "text/xml");
      
      // Create a map of all elements
      const elementMap = new Map();
      
      // Get all start events
      const startEvents = xmlDoc.getElementsByTagName('bpmn:startEvent');
      for (let i = 0; i < startEvents.length; i++) {
        const element = startEvents[i];
        elementMap.set(element.getAttribute('id'), {
          id: element.getAttribute('id'),
          name: element.getAttribute('name') || 'Bắt đầu quy trình',
          type: 'start-event',
          description: 'Điểm bắt đầu của quy trình xử lý',
          assignee: 'Hệ thống',
          duration: 'Ngay lập tức'
        });
      }
      
      // Get all tasks
      const tasks = xmlDoc.getElementsByTagName('bpmn:task');
      for (let i = 0; i < tasks.length; i++) {
        const element = tasks[i];
        elementMap.set(element.getAttribute('id'), {
          id: element.getAttribute('id'),
          name: element.getAttribute('name') || 'Nhiệm vụ',
          type: 'task',
          description: 'Thực hiện nhiệm vụ trong quy trình',
          assignee: 'Hệ thống',
          duration: '3-5 giây'
        });
      }
      
      // Get all end events
      const endEvents = xmlDoc.getElementsByTagName('bpmn:endEvent');
      for (let i = 0; i < endEvents.length; i++) {
        const element = endEvents[i];
        elementMap.set(element.getAttribute('id'), {
          id: element.getAttribute('id'),
          name: element.getAttribute('name') || 'Kết thúc quy trình',
          type: 'end-event',
          description: 'Quy trình xử lý hoàn tất',
          assignee: 'Hệ thống',
          duration: 'Ngay lập tức'
        });
      }
      
      // Get all sequence flows to understand the order
      const sequenceFlows = xmlDoc.getElementsByTagName('bpmn:sequenceFlow');
      const flowMap = new Map();
      
      for (let i = 0; i < sequenceFlows.length; i++) {
        const flow = sequenceFlows[i];
        const id = flow.getAttribute('id');
        const sourceRef = flow.getAttribute('sourceRef');
        const targetRef = flow.getAttribute('targetRef');
        flowMap.set(id, { id, sourceRef, targetRef });
      }
      
      // Build the ordered list of steps by following the sequence flows
      const orderedSteps = [];
      const visited = new Set();
      
      // Find the start event
      let currentElement = null;
      for (let [id, element] of elementMap) {
        if (element.type === 'start-event') {
          currentElement = element;
          break;
        }
      }
      
      // If we found a start event, follow the sequence flows
      if (currentElement) {
        while (currentElement && !visited.has(currentElement.id)) {
          visited.add(currentElement.id);
          orderedSteps.push(currentElement);
          
          // Find the next element via sequence flow
          let nextElement = null;
          for (let [id, flow] of flowMap) {
            if (flow.sourceRef === currentElement.id) {
              nextElement = elementMap.get(flow.targetRef);
              break;
            }
          }
          
          currentElement = nextElement;
        }
      } else {
        // If no start event, just add all elements
        for (let [id, element] of elementMap) {
          orderedSteps.push(element);
        }
      }
      
      // Add step numbers
      const steps = orderedSteps.map((element, index) => ({
        ...element,
        stepNumber: index + 1
      }));
      
      setWorkflowSteps(steps);
    } catch (error) {
      console.error('Error extracting workflow steps:', error);
      // Fallback to mock data if parsing fails
      const mockSteps = [
        {
          id: 1,
          name: 'Bắt đầu quy trình',
          type: 'start-event',
          description: 'Điểm bắt đầu của quy trình xử lý',
          assignee: 'Hệ thống',
          duration: 'Ngay lập tức'
        },
        {
          id: 2,
          name: 'Kiểm tra quyền truy cập',
          type: 'task',
          description: 'Xác minh quyền truy cập của người dùng đối với tài liệu',
          assignee: 'Hệ thống',
          duration: '1-2 giây'
        },
        {
          id: 3,
          name: 'Xử lý OCR',
          type: 'task',
          description: 'Trích xuất văn bản từ tài liệu bằng công nghệ OCR',
          assignee: 'Hệ thống',
          duration: '5-10 giây'
        },
        {
          id: 4,
          name: 'Kiểm tra trùng lặp',
          type: 'task',
          description: 'So sánh với các tài liệu hiện có để phát hiện trùng lặp',
          assignee: 'Hệ thống',
          duration: '3-5 giây'
        },
        {
          id: 5,
          name: 'Kết thúc quy trình',
          type: 'end-event',
          description: 'Quy trình xử lý hoàn tất',
          assignee: 'Hệ thống',
          duration: 'Ngay lập tức'
        }
      ];
      
      setWorkflowSteps(mockSteps);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString('vi-VN');
  };

  const getDocumentType = (type) => {
    if (type === '1') {
      return (
        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
          <ArrowUpIcon className="h-3 w-3 mr-1" />
          Văn bản đi
        </span>
      );
    } else if (type === '2') {
      return (
        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
          <ArrowDownIcon className="h-3 w-3 mr-1" />
          Văn bản đến
        </span>
      );
    } else {
      return (
        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
          <DocumentTextIcon className="h-3 w-3 mr-1" />
          Khác
        </span>
      );
    }
  };

  const getStatusBadge = (status) => {
    if (status === 'published') {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
          Đã xuất bản
        </span>
      );
    } else {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
          Bản nháp
        </span>
      );
    }
  };

  const getStepIcon = (type) => {
    switch (type) {
      case 'start-event':
        return (
          <div className="flex-shrink-0 h-8 w-8 rounded-full bg-blue-200 flex items-center justify-center">
            <div className="h-3 w-3 rounded-full bg-blue-600"></div>
          </div>
        );
      case 'end-event':
        return (
          <div className="flex-shrink-0 h-8 w-8 rounded-full bg-red-200 flex items-center justify-center">
            <div className="h-3 w-3 rounded-full bg-red-600"></div>
          </div>
        );
      case 'task':
      default:
        return (
          <div className="flex-shrink-0 h-8 w-8 rounded-md bg-green-200 flex items-center justify-center">
            <PlayIcon className="h-4 w-4 text-green-600" />
          </div>
        );
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto">
        <WorkflowNavigation />
        <WorkflowLoading message="Đang tải thông tin workflow..." />
      </div>
    );
  }

  if (!workflow) {
    return (
      <div className="max-w-7xl mx-auto">
        <WorkflowNavigation />
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-center py-12">
            <DocumentTextIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">Không tìm thấy workflow</h3>
            <p className="mt-1 text-sm text-gray-500">Workflow bạn đang tìm kiếm không tồn tại.</p>
            <div className="mt-6">
              <Link 
                to="/workflow-list"
                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <ArrowLeftIcon className="h-5 w-5 mr-2" />
                Quay về danh sách
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      <WorkflowNavigation />
      
      <div className="flex items-center mb-6">
        <Link to="/workflow-list" className="mr-4 p-2 rounded-full hover:bg-gray-100">
          <ArrowLeftIcon className="h-6 w-6 text-gray-600" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{workflow.name}</h1>
          <p className="text-gray-600">Chi tiết quy trình xử lý</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Workflow Information Panel */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <h2 className="text-lg font-medium text-gray-900">Thông tin quy trình</h2>
                <div className="flex space-x-2">
                  {getDocumentType(workflow.documentType)}
                  {getStatusBadge(workflow.status)}
                </div>
              </div>
            </div>
            
            <div className="p-6">
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide">Mô tả</h3>
                  <p className="mt-1 text-sm text-gray-900">{workflow.description || 'Không có mô tả'}</p>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide">Phiên bản</h3>
                  <p className="mt-1 text-sm text-gray-900">v{workflow.version}</p>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide">Ngày tạo</h3>
                  <p className="mt-1 text-sm text-gray-900">{formatDate(workflow.createdAt)}</p>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide">Cập nhật lần cuối</h3>
                  <p className="mt-1 text-sm text-gray-900">{formatDate(workflow.updatedAt)}</p>
                </div>
              </div>
              
              <div className="mt-8">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Hành động</h3>
                <div className="flex flex-col space-y-3">
                  <Link
                    to={`/bpmn-modeler/${workflow.id}`}
                    className="inline-flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    Xem sơ đồ
                  </Link>
                  <Link
                    to={`/bpmn-modeler/${workflow.id}/edit`}
                    className="inline-flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    Chỉnh sửa
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Diagram and Steps Panel */}
        <div className="lg:col-span-2 space-y-6">
          {/* BPMN Diagram */}
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-medium text-gray-900">Sơ đồ quy trình</h2>
            </div>
            
            <div className="p-6">
              {diagramLoading ? (
                <div className="flex justify-center items-center h-64">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
                </div>
              ) : diagramError ? (
                <div className="text-center py-8 text-red-500">
                  <p>{diagramError}</p>
                </div>
              ) : (
                <div 
                  ref={diagramContainerRef} 
                  className="border border-gray-300 rounded-lg h-96 bg-gray-50"
                >
                  {/* BPMN Viewer will render here */}
                </div>
              )}
            </div>
          </div>

          {/* Workflow Steps */}
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-medium text-gray-900">Các bước trong quy trình</h2>
            </div>
            
            <div className="p-6">
              <ul className="space-y-4">
                {workflowSteps.map((step, index) => (
                  <li key={step.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors duration-150">
                    <div className="flex items-start">
                      <div className="flex items-center mr-4">
                        <div className="flex flex-col items-center">
                          <div className="flex items-center justify-center h-8 w-8 rounded-full bg-blue-100 text-blue-800 text-sm font-medium">
                            {index + 1}
                          </div>
                          {index < workflowSteps.length - 1 && (
                            <div className="h-8 w-0.5 bg-gray-200 mt-1"></div>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start">
                          {getStepIcon(step.type)}
                          <div className="ml-3">
                            <h3 className="text-sm font-medium text-gray-900">{step.name}</h3>
                            <p className="text-sm text-gray-500 mt-1">{step.description}</p>
                            
                            <div className="mt-2 flex flex-wrap gap-2">
                              <div className="inline-flex items-center text-xs text-gray-500">
                                <UserIcon className="h-4 w-4 mr-1" />
                                {step.assignee}
                              </div>
                              <div className="inline-flex items-center text-xs text-gray-500">
                                <ClockIcon className="h-4 w-4 mr-1" />
                                {step.duration}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WorkflowDetailPage;