import React, { useEffect, useRef, useState } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import BpmnModeler from 'bpmn-js/lib/Viewer';
import { Button, Spin, Typography, Card, App, message, Space } from 'antd';
import { 
  ArrowLeftOutlined, 
  DownloadOutlined,
  ZoomInOutlined,
  ZoomOutOutlined,
  ExpandOutlined,
  DragOutlined
} from '@ant-design/icons';
import { getBpmnInfo, getBpmnFile } from '../../api/bpmnApi';
import BpmnNavigation from '../../components/bpmn/BpmnNavigation';
import { useAuth } from '../../contexts/AuthContext';
import 'bpmn-js/dist/assets/diagram-js.css';
import 'bpmn-js/dist/assets/bpmn-font/css/bpmn.css';

const { Title } = Typography;

const BpmnViewerPage = () => {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const modelerContainerRef = useRef(null);
  const [modeler, setModeler] = useState(null);
  const [bpmnInfo, setBpmnInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadingXml, setLoadingXml] = useState(false);

  // Get version from URL parameters
  const version = searchParams.get('version');

  // Initialize BPMN viewer
  useEffect(() => {
    let timeoutId;
    
    const initModeler = () => {
      if (!modelerContainerRef.current) {
        timeoutId = setTimeout(initModeler, 100);
        return;
      }

      // Clear any existing content in the container
      const container = modelerContainerRef.current;
      container.innerHTML = '';

      const m = new BpmnModeler({
        container: container,
        keyboard: { bindTo: window }
      });

      setModeler(m);
    };

    // Start initialization after a short delay to ensure DOM is ready
    timeoutId = setTimeout(initModeler, 100);

    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
      if (modeler) {
        modeler.destroy();
      }
    };
  }, []);

  // Load BPMN info
  useEffect(() => {
    const loadBpmnInfo = async () => {
      if (!id || !user?.organization_id) return;

      try {
        const data = await getBpmnInfo(id, user.organization_id, version);
        setBpmnInfo(data);
        setLoading(false);
      } catch (error) {
        message.error('Không thể tải thông tin sơ đồ BPMN');
        navigate('/bpmn');
      }
    };

    loadBpmnInfo();
  }, [id, user, navigate, version]);

  // Load and display BPMN diagram
  useEffect(() => {
    if (!modeler || !bpmnInfo?.path) return;

    const loadDiagram = async () => {
      setLoadingXml(true);
      try {
        // Get BPMN file content
        const response = await getBpmnFile(bpmnInfo.path);
        
        if (response) {
          await modeler.importXML(response);
          modeler.get('canvas').zoom('fit-viewport');
        } else {
          message.warning('Không tìm thấy nội dung sơ đồ BPMN');
        }
      } catch (error) {
        message.error('Không thể tải sơ đồ BPMN');
      } finally {
        setLoadingXml(false);
        setLoading(false);
      }
    };

    loadDiagram();
  }, [modeler, bpmnInfo]);

  const handleDownload = async () => {
    if (!bpmnInfo?.path) return;

    try {
      const response = await getBpmnFile(bpmnInfo.path);
      if (!response) {
        message.warning('Không có nội dung BPMN để tải xuống');
        return;
      }

      const blob = new Blob([response], { type: 'application/xml' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${bpmnInfo.name || 'diagram'}.bpmn`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Failed to download BPMN:', error);
      message.error('Không thể tải xuống sơ đồ BPMN');
    }
  };

  // Zoom and pan handlers
  const handleZoomIn = () => {
    if (modeler) {
      const canvas = modeler.get('canvas');
      const currentZoom = canvas.zoom();
      canvas.zoom(currentZoom + 0.1);
    }
  };

  const handleZoomOut = () => {
    if (modeler) {
      const canvas = modeler.get('canvas');
      const currentZoom = canvas.zoom();
      canvas.zoom(currentZoom - 0.1);
    }
  };

  const handleZoomFit = () => {
    if (modeler) {
      modeler.get('canvas').zoom('fit-viewport');
    }
  };

  const handleHandTool = () => {
    if (modeler) {
      const handTool = modeler.get('handTool');
      if (handTool.isActive()) {
        handTool.toggle();
      } else {
        handTool.activate();
      }
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: '50px' }}>
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '100%', padding: '0 24px' }}>
      <BpmnNavigation />
      
      <div style={{ marginBottom: 24 }}>
        <Button 
          type="text" 
          icon={<ArrowLeftOutlined />} 
          onClick={() => navigate(-1)}
          style={{ marginBottom: 16 }}
        >
          Quay lại
        </Button>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Title level={3} style={{ margin: 0 }}>
            {bpmnInfo?.name || 'Xem sơ đồ BPMN'}
          </Title>
          
          <Button 
            type="primary" 
            icon={<DownloadOutlined />} 
            onClick={handleDownload}
            loading={loadingXml}
          >
            Tải xuống
          </Button>
        </div>
      </div>

      <Card 
        style={{ 
          height: 'calc(100vh - 200px)', 
          minHeight: '500px',
          position: 'relative'
        }}
        bodyStyle={{ 
          padding: 0, 
          height: '100%',
          position: 'relative'
        }}
      >
        {/* Toolbar */}
        <div 
          style={{
            position: 'absolute',
            top: 16,
            left: 16,
            zIndex: 10,
            background: 'white',
            borderRadius: '6px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
            padding: '4px'
          }}
        >
          <Space size="small">
            <Button 
              type="text" 
              icon={<DragOutlined />} 
              onClick={handleHandTool}
              title="Công cụ tay (kéo/thả)"
              size="small"
            />
            <Button 
              type="text" 
              icon={<ZoomInOutlined />} 
              onClick={handleZoomIn}
              title="Phóng to"
              size="small"
            />
            <Button 
              type="text" 
              icon={<ZoomOutOutlined />} 
              onClick={handleZoomOut}
              title="Thu nhỏ"
              size="small"
            />
            <Button 
              type="text" 
              icon={<ExpandOutlined />} 
              onClick={handleZoomFit}
              title="Fit màn hình"
              size="small"
            />
          </Space>
        </div>

        <div 
          ref={modelerContainerRef} 
          style={{ 
            width: '100%', 
            height: '100%', 
            position: 'relative',
            border: '1px solid #f0f0f0',
            borderRadius: '8px'
          }}
        />
        
        {loadingXml && (
          <div 
            style={{ 
              position: 'absolute', 
              top: 0, 
              left: 0, 
              right: 0, 
              bottom: 0, 
              display: 'flex', 
              justifyContent: 'center', 
              alignItems: 'center',
              background: 'rgba(255, 255, 255, 0.7)'
            }}
          >
            <Spin size="large" />
          </div>
        )}
      </Card>
    </div>
  );
};

export default BpmnViewerPage;