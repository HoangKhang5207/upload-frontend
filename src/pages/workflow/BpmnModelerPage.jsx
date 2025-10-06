import React, { useEffect, useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import BpmnModeler from 'bpmn-js/lib/Modeler';

// Import thêm các module properties panel
import {
    BpmnPropertiesPanelModule,
    BpmnPropertiesProviderModule // Provider cơ bản
} from 'bpmn-js-properties-panel';
// Descriptor cần thiết để Modeler hiểu các thuộc tính của Camunda 7
import camundaModdleDescriptor from 'camunda-bpmn-moddle/resources/camunda.json';

import 'bpmn-js/dist/assets/diagram-js.css';
import 'bpmn-js/dist/assets/bpmn-font/css/bpmn.css';
import '@bpmn-io/properties-panel/dist/assets/properties-panel.css';

import { Button, Input, Spin, message, Typography, Switch, Form } from 'antd';
import { SaveOutlined, ArrowLeftOutlined } from '@ant-design/icons';
import * as mockWorkflowApi from '../../api/mockWorkflowApi';
import WorkflowNavigation from '../../components/workflow/WorkflowNavigation';
import { useWorkflow } from '../../contexts/WorkflowContext';

// XML template cho một sơ đồ BPMN trống
const newDiagramXML = `<?xml version="1.0" encoding="UTF-8"?>
<bpmn:definitions xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:bpmn="http://www.omg.org/spec/BPMN/20100524/MODEL" xmlns:bpmndi="http://www.omg.org/spec/BPMN/20100524/DI" xmlns:dc="http://www.omg.org/spec/DD/20100524/DC" xmlns:camunda="http://camunda.org/schema/1.0/bpmn" targetNamespace="http://bpmn.io/schema/bpmn" id="Definitions_1">
  <bpmn:process id="Process_1" isExecutable="true">
    <bpmn:startEvent id="StartEvent_1"/>
  </bpmn:process>
  <bpmndi:BPMNDiagram id="BPMNDiagram_1">
    <bpmndi:BPMNPlane id="BPMNPlane_1" bpmnElement="Process_1">
      <bpmndi:BPMNShape id="_BPMNShape_StartEvent_2" bpmnElement="StartEvent_1">
        <dc:Bounds x="179" y="159" width="36" height="36"/>
      </bpmndi:BPMNShape>
    </bpmndi:BPMNPlane>
  </bpmndi:BPMNDiagram>
</bpmn:definitions>`;

const BpmnModelerPage = () => {
    const { id } = useParams(); // Lấy ID từ URL
    const navigate = useNavigate();
    const isEditMode = !!id;

    const modelerContainerRef = useRef(null);
    const propertiesPanelRef = useRef(null);
    const [modeler, setModeler] = useState(null);

    const { state, dispatch } = useWorkflow();
    const [diagramName, setDiagramName] = useState('');
    const [loading, setLoading] = useState(true); // Luôn loading ban đầu
    const [saving, setSaving] = useState(false);
    const [isPublished, setIsPublished] = useState(false);

    // useEffect 1: Chỉ để khởi tạo và hủy Modeler. Chạy một lần duy nhất.
    useEffect(() => {
        if (!modelerContainerRef.current || !propertiesPanelRef.current) return;

        const m = new BpmnModeler({
            container: modelerContainerRef.current,
            // ** TÍCH HỢP PROPERTIES PANEL VÀO MODELER **
            propertiesPanel: {
                parent: propertiesPanelRef.current,
            },
            additionalModules: [
                BpmnPropertiesPanelModule,
                BpmnPropertiesProviderModule
            ],
            moddleExtensions: {
                camunda: camundaModdleDescriptor
            },
            // ** KẾT THÚC TÍCH HỢP **
        });

        setModeler(m); // <-- Lưu thực thể vào state

        return () => {
            m.destroy();
        };
    }, []); // <-- Mảng dependency rỗng đảm bảo chỉ chạy một lần

    // useEffect 2: Tải dữ liệu khi `id` hoặc `modeler` thay đổi.
    useEffect(() => {
        // Chỉ thực thi khi modeler đã được khởi tạo
        if (!modeler) {
            return;
        }

        const loadDiagram = async () => {
            setLoading(true);
            try {
                const handleImportDone = (event) => {
                    if (!event.error) {
                        try {
                            modeler.get('canvas').zoom('fit-viewport');
                        } catch (e) { console.error("Could not zoom to fit viewport", e); }
                    }
                    modeler.off('import.done', handleImportDone); // Gỡ listener sau khi dùng
                };
                modeler.on('import.done', handleImportDone);

                if (isEditMode) {
                    // Load existing workflow data
                    const workflow = await mockWorkflowApi.getWorkflowById(id);
                    if (workflow) {
                        setDiagramName(workflow.name);
                        setIsPublished(workflow.status === 'published');
                        
                        // Load the BPMN diagram if available
                        if (workflow.bpmnXml) {
                            await modeler.importXML(workflow.bpmnXml);
                        } else {
                            await modeler.importXML(newDiagramXML);
                        }
                    }
                } else {
                    setDiagramName('');
                    setIsPublished(false);
                    await modeler.importXML(newDiagramXML);
                }
            } catch (error) {
                console.error("Failed to load diagram:", error);
                message.error('Không thể tải dữ liệu sơ đồ.');
                navigate('/workflow-list'); // Quay về danh sách nếu có lỗi
            } finally {
                setLoading(false);
            }
        };

        loadDiagram();
    }, [id, modeler, isEditMode, navigate]); // <-- Phụ thuộc vào modeler instance

    const handleSave = async () => {
        if (!modeler) return;
        if (!diagramName.trim()) {
            message.warning('Vui lòng nhập tên cho sơ đồ.');
            return;
        }

        setSaving(true);

        try {
            const { xml } = await modeler.saveXML({ format: true });
            const { svg } = await modeler.saveSVG();
            if (!xml || !svg) { throw new Error("Could not save BPMN/SVG data."); }

            const workflowData = {
                name: diagramName,
                description: 'Mô tả quy trình xử lý tài liệu',
                documentType: '1',
                version: '1.0',
                status: isPublished ? 'published' : 'draft',
                bpmnXml: xml
            };

            if (isEditMode) {
                // Update existing workflow
                const updatedWorkflow = await mockWorkflowApi.updateWorkflow(id, workflowData);
                // Update the workflow in the context
                const updatedWorkflows = state.workflows.map(w => 
                    w.id === parseInt(id) ? updatedWorkflow : w
                );
                dispatch({ type: 'SET_WORKFLOWS', payload: updatedWorkflows });
            } else {
                // Create new workflow
                const newWorkflow = await mockWorkflowApi.createWorkflow(workflowData);
                // Add the new workflow to the context
                const updatedWorkflows = [...state.workflows, newWorkflow];
                dispatch({ type: 'SET_WORKFLOWS', payload: updatedWorkflows });
            }
            
            message.success(`Đã lưu thành công sơ đồ "${diagramName}"!`);
            navigate('/workflow-list');
        } catch (error) {
            message.error('Đã xảy ra lỗi khi lưu sơ đồ.');
            console.error('Save BPMN error:', error);
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="max-w-7xl mx-auto">
            <WorkflowNavigation />
            <Spin spinning={loading} tip="Đang tải sơ đồ...">
                <div style={{ background: '#fff', padding: '24px', borderBottom: '1px solid #f0f0f0' }}>
                    <Button
                        type="default"
                        onClick={() => navigate('/workflow-list')}
                        style={{ marginRight: 16, marginBottom: 16 }}>
                        <ArrowLeftOutlined /> Quay về
                    </Button>
                    <Typography.Title level={3} style={{ display: 'inline-block', margin: 0 }}>
                        {isEditMode ? `Chỉnh sửa: ${diagramName || ''}` : "Tạo mới sơ đồ luồng"}
                    </Typography.Title>
                    <Button
                        type="primary"
                        icon={<SaveOutlined />}
                        loading={saving}
                        onClick={handleSave}
                        style={{ float: 'right' }}
                    >
                        Lưu lại
                    </Button>
                    <Form layout="vertical">
                        <Form.Item label={<Typography.Text strong>Tên sơ đồ</Typography.Text>}>
                            <Input
                                placeholder="Nhập tên sơ đồ xử lý..."
                                value={diagramName}
                                onChange={(e) => setDiagramName(e.target.value)}
                                size="large" />
                        </Form.Item>
                        <Form.Item label={<Typography.Text strong>Trạng thái</Typography.Text>}>
                            <Switch
                                checkedChildren="Đã xuất bản"
                                unCheckedChildren="Bản nháp"
                                checked={isPublished}
                                onChange={setIsPublished} />
                        </Form.Item>
                    </Form>
                </div>
                {/* Container chính cho trình chỉnh sửa và panel */}
                <div
                    style={{
                        // Chiều cao sẽ linh hoạt dựa trên không gian còn lại
                        height: 'calc(100vh - 200px)', // Có thể điều chỉnh giá trị 200px cho phù hợp
                        marginTop: '16px',
                        display: 'flex'
                    }}
                >
                    {/* Container cho sơ đồ, chiếm toàn bộ không gian còn lại */}
                    <div
                        ref={modelerContainerRef}
                        style={{
                            flex: 1,
                            border: '1px solid #d9d9d9',
                            background: '#fff',
                            height: '100%' // Đảm bảo nó lấp đầy chiều cao của Flex container
                        }}
                    ></div>
                    {/* Container cho Properties Panel, có chiều rộng cố định */}
                    <div
                        ref={propertiesPanelRef}
                        style={{
                            width: '250px', // Tăng chiều rộng panel cho dễ nhìn
                            border: '1px solid #d9d9d9',
                            borderLeft: 'none',
                            background: '#f8f8f8',
                            height: '100%',
                            overflowY: 'auto' // Cho phép cuộn khi nội dung panel dài
                        }}
                    ></div>
                </div>
            </Spin>
        </div>
    );
};

export default BpmnModelerPage;