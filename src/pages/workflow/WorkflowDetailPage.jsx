import React, { useState, useEffect, useRef } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { 
  Row, 
  Col, 
  Card, 
  Spin, 
  Button, 
  Typography, 
  Tag, 
  Descriptions, 
  Steps,
  Result,
  Space
} from 'antd';
import { 
  ArrowLeftOutlined,
  FileTextOutlined,
  ArrowUpOutlined,
  ArrowDownOutlined,
  PlayCircleOutlined,
  UserOutlined,
  ClockCircleOutlined,
  EditOutlined,
  EyeOutlined,
  CaretRightOutlined,
  CheckOutlined,
  StopOutlined
} from '@ant-design/icons';
import BpmnViewer from 'bpmn-js/lib/Viewer';
import 'bpmn-js/dist/assets/diagram-js.css';
import 'bpmn-js/dist/assets/bpmn-font/css/bpmn.css';
import * as mockWorkflowApi from '../../api/mockWorkflowApi';
import WorkflowNavigation from '../../components/workflow/WorkflowNavigation';
import { useWorkflow } from '../../contexts/WorkflowContext';
import WorkflowLoading from '../../components/workflow/WorkflowLoading';

const { Title, Text, Paragraph } = Typography;

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

  // XML mặc định (giữ nguyên)
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
    if (id) fetchWorkflow();
  }, [id, dispatch]);

  useEffect(() => {
    // Khởi tạo và hủy BpmnViewer (giữ nguyên logic)
    if (diagramContainerRef.current) {
      viewerRef.current = new BpmnViewer({ container: diagramContainerRef.current });
      if (workflow) loadDiagram();
    }
    return () => {
      if (viewerRef.current) viewerRef.current.destroy();
    };
  }, [workflow]); // Phụ thuộc vào workflow

  // Load sơ đồ (giữ nguyên logic)
  const loadDiagram = async () => {
    if (!viewerRef.current) return;
    setDiagramLoading(true);
    setDiagramError(null);
    try {
      const bpmnXml = workflow.bpmnXml || initialDiagramXML;
      await viewerRef.current.importXML(bpmnXml);
      extractWorkflowStepsFromDiagram(bpmnXml);
      const canvas = viewerRef.current.get('canvas');
      canvas.zoom('fit-viewport');
    } catch (error) {
      console.error('Error loading diagram:', error);
      setDiagramError('Không thể tải sơ đồ workflow');
    } finally {
      setDiagramLoading(false);
    }
  };

  // Trích xuất các bước (giữ nguyên logic)
  const extractWorkflowStepsFromDiagram = (bpmnXml) => {
    try {
      // (Toàn bộ logic DOMParser của em giữ nguyên...)
      // ...
      // Giả sử sau khi parse, em có mảng orderedSteps
      const parser = new DOMParser();
      const xmlDoc = parser.parseFromString(bpmnXml, "text/xml");
      const elementMap = new Map();
      
      const startEvents = xmlDoc.getElementsByTagName('bpmn:startEvent');
      for (let i = 0; i < startEvents.length; i++) {
        const element = startEvents[i];
        elementMap.set(element.getAttribute('id'), { id: element.getAttribute('id'), name: element.getAttribute('name') || 'Bắt đầu', type: 'start-event', assignee: 'Hệ thống', duration: 'Tức thì' });
      }
      
      const tasks = xmlDoc.getElementsByTagName('bpmn:task');
      for (let i = 0; i < tasks.length; i++) {
        const element = tasks[i];
        elementMap.set(element.getAttribute('id'), { id: element.getAttribute('id'), name: element.getAttribute('name') || 'Nhiệm vụ', type: 'task', assignee: 'Hệ thống', duration: '3-5 giây' });
      }
      
      const endEvents = xmlDoc.getElementsByTagName('bpmn:endEvent');
      for (let i = 0; i < endEvents.length; i++) {
        const element = endEvents[i];
        elementMap.set(element.getAttribute('id'), { id: element.getAttribute('id'), name: element.getAttribute('name') || 'Kết thúc', type: 'end-event', assignee: 'Hệ thống', duration: 'Tức thì' });
      }
      
      const sequenceFlows = xmlDoc.getElementsByTagName('bpmn:sequenceFlow');
      const flowMap = new Map();
      for (let i = 0; i < sequenceFlows.length; i++) {
        const flow = sequenceFlows[i];
        flowMap.set(flow.getAttribute('sourceRef'), flow.getAttribute('targetRef'));
      }
      
      const orderedSteps = [];
      let currentId = Array.from(elementMap.values()).find(e => e.type === 'start-event')?.id;
      
      while (currentId && !orderedSteps.some(s => s.id === currentId)) {
        const currentElement = elementMap.get(currentId);
        if (currentElement) {
            orderedSteps.push(currentElement);
            currentId = flowMap.get(currentId);
        } else {
            currentId = null;
        }
      }
      
      setWorkflowSteps(orderedSteps);
    } catch (error) {
      // Fallback
      setWorkflowSteps([
        { id: 'start', name: 'Bắt đầu', type: 'start-event', assignee: 'Hệ thống', duration: 'Tức thì' },
        { id: 'task1', name: 'Kiểm tra', type: 'task', assignee: 'Hệ thống', duration: '1-2 giây' },
        { id: 'end', name: 'Kết thúc', type: 'end-event', assignee: 'Hệ thống', duration: 'Tức thì' },
      ]);
    }
  };

  // Helper functions (chuyển sang Antd Tag)
  const formatDate = (dateString) => new Date(dateString).toLocaleString('vi-VN');
  
  const getDocumentType = (type) => {
    if (type === '1') return <Tag icon={<ArrowUpOutlined />} color="blue">Văn bản đi</Tag>;
    if (type === '2') return <Tag icon={<ArrowDownOutlined />} color="green">Văn bản đến</Tag>;
    return <Tag icon={<FileTextOutlined />} color="default">Khác</Tag>;
  };
  
  const getStatusBadge = (status) => {
    if (status === 'published') return <Tag color="success">Đã xuất bản</Tag>;
    return <Tag color="warning">Bản nháp</Tag>;
  };
  
  const getStepIcon = (type) => {
    if (type === 'start-event') return <CaretRightOutlined style={{color: 'green'}}/>;
    if (type === 'end-event') return <CheckOutlined style={{color: 'red'}}/>;
    return <UserOutlined />;
  };

  // Render
  if (loading) {
    return (
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>
        <WorkflowNavigation />
        <WorkflowLoading message="Đang tải thông tin workflow..." />
      </div>
    );
  }

  if (!workflow) {
    return (
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>
        <WorkflowNavigation />
        <Result
          status="404"
          title="404"
          subTitle="Xin lỗi, không tìm thấy quy trình bạn yêu cầu."
          extra={<Button type="primary" onClick={() => navigate('/workflow-list')}>Quay về danh sách</Button>}
        />
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto' }}>
      <WorkflowNavigation />
      
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '24px' }}>
        <Button 
          type="text" 
          icon={<ArrowLeftOutlined />} 
          onClick={() => navigate('/workflow-list')} 
          style={{ marginRight: 16 }} 
        />
        <div>
          <Title level={3} style={{ margin: 0 }}>{workflow.name}</Title>
          <Text type="secondary">Chi tiết quy trình xử lý</Text>
        </div>
      </div>

      <Row gutter={[24, 24]}>
        {/* Cột thông tin */}
        <Col xs={24} lg={8}>
          <Card title="Thông tin quy trình">
            <Descriptions bordered column={1} size="small">
              <Descriptions.Item label="Mô tả">{workflow.description || 'Không có mô tả'}</Descriptions.Item>
              <Descriptions.Item label="Phiên bản">v{workflow.version}</Descriptions.Item>
              <Descriptions.Item label="Thể loại">{getDocumentType(workflow.documentType)}</Descriptions.Item>
              <Descriptions.Item label="Trạng thái">{getStatusBadge(workflow.status)}</Descriptions.Item>
              <Descriptions.Item label="Ngày tạo">{formatDate(workflow.createdAt)}</Descriptions.Item>
              <Descriptions.Item label="Cập nhật">{formatDate(workflow.updatedAt)}</Descriptions.Item>
            </Descriptions>
            
            <Divider />
            
            <Title level={5}>Hành động</Title>
            <Space direction="vertical" style={{ width: '100%' }}>
              <Button 
                icon={<EyeOutlined />} 
                onClick={() => navigate(`/bpmn-modeler/${workflow.id}`)}
                block
              >
                Xem sơ đồ (Viewer)
              </Button>
              <Button 
                type="primary" 
                icon={<EditOutlined />} 
                onClick={() => navigate(`/bpmn-modeler/${workflow.id}/edit`)}
                block
              >
                Chỉnh sửa (Modeler)
              </Button>
            </Space>
          </Card>
        </Col>

        {/* Cột Sơ đồ và Các bước */}
        <Col xs={24} lg={16}>
          <Space direction="vertical" style={{ width: '100%' }} size="large">
            <Card title="Sơ đồ quy trình (BPMN)">
              <Spin spinning={diagramLoading} tip="Đang tải sơ đồ...">
                {diagramError ? (
                  <Result status="error" title={diagramError} />
                ) : (
                  <div 
                    ref={diagramContainerRef} 
                    style={{ 
                      border: '1px solid #f0f0f0', 
                      borderRadius: '8px', 
                      height: 400, 
                      backgroundColor: '#fafafa' 
                    }}
                  />
                )}
              </Spin>
            </Card>

            <Card title="Các bước trong quy trình">
              <Steps direction="vertical" size="small">
                {workflowSteps.map((step, index) => (
                  <Steps.Step
                    key={step.id}
                    status="finish" // Giả sử tất cả đều "finish" vì đây là view chi tiết, không phải instance
                    icon={getStepIcon(step.type)}
                    title={<Text strong>{step.name}</Text>}
                    description={
                      <Space>
                        <Tag icon={<UserOutlined />}>{step.assignee}</Tag>
                        <Tag icon={<ClockCircleOutlined />}>{step.duration}</Tag>
                      </Space>
                    }
                  />
                ))}
              </Steps>
            </Card>
          </Space>
        </Col>
      </Row>
    </div>
  );
};

export default WorkflowDetailPage;