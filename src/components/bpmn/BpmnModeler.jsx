import React, { useEffect, useRef, useState } from 'react';
import { Spin, message } from 'antd';
import BpmnJS from 'bpmn-js/dist/bpmn-modeler.production.min.js';
import 'bpmn-js/dist/assets/diagram-js.css';
import 'bpmn-js/dist/assets/bpmn-font/css/bpmn.css';
import 'bpmn-js/dist/assets/bpmn-font/css/bpmn-codes.css';
import 'bpmn-js/dist/assets/bpmn-font/css/bpmn-embedded.css';

const BpmnModeler = ({ xml, onXmlChange, readOnly = false }) => {
  const containerRef = useRef(null);
  const bpmnModelerRef = useRef(null);
  const [loading, setLoading] = useState(true);

  // Khởi tạo BPMN Modeler
  useEffect(() => {
    if (!containerRef.current) return;

    // Khởi tạo BPMN Modeler
    const bpmnModeler = new BpmnJS({
      container: containerRef.current,
      keyboard: { bindTo: document },
      additionalModules: [
        // Các module bổ sung nếu cần
      ]
    });

    bpmnModelerRef.current = bpmnModeler;

    // Xử lý sự kiện khi model thay đổi
    const handleChange = () => {
      if (onXmlChange) {
        bpmnModeler.saveXML({ format: true }, (err, xml) => {
          if (!err && xml) {
            onXmlChange(xml);
          }
        });
      }
    };

    bpmnModeler.on('commandStack.changed', handleChange);

    // Nếu có XML ban đầu, tải nó vào modeler
    const loadDiagram = async () => {
      try {
        setLoading(true);
        if (xml) {
          await bpmnModeler.importXML(xml);
        } else {
          // Tạo một diagram mới nếu không có XML
          await bpmnModeler.createDiagram();
        }
        
        // Đặt chế độ chỉ đọc nếu cần
        if (readOnly) {
          const canvas = bpmnModeler.get('canvas');
          canvas.zoom('fit-viewport');
        }
      } catch (err) {
        console.error('Error loading BPMN diagram:', err);
        message.error('Không thể tải BPMN diagram');
      } finally {
        setLoading(false);
      }
    };

    loadDiagram();

    // Dọn dẹp khi component unmount
    return () => {
      if (bpmnModeler) {
        bpmnModeler.destroy();
      }
    };
  }, [xml, readOnly, onXmlChange]);

  // Xử lý thay đổi chế độ readOnly
  useEffect(() => {
    if (!bpmnModelerRef.current) return;
    
    const modeling = bpmnModelerRef.current.get('modeling');
    const elementRegistry = bpmnModelerRef.current.get('elementRegistry');
    const eventBus = bpmnModelerRef.current.get('eventBus');
    
    // Bật/tắt chế độ chỉ đọc
    const setReadOnly = (readOnly) => {
      const elements = elementRegistry.getAll();
      
      elements.forEach(element => {
        modeling.setColor(element, {
          fill: readOnly ? '#f8f8f8' : null,
          stroke: readOnly ? '#ccc' : null
        });
      });
      
      // Vô hiệu hóa tương tác nếu ở chế độ chỉ đọc
      if (readOnly) {
        eventBus.on('element.click', 5000, function(event) {
          event.originalEvent.stopPropagation();
          return false;
        });
      }
    };
    
    setReadOnly(readOnly);
    
    return () => {
      // Dọn dẹp event listeners
      if (eventBus) {
        eventBus.off('element.click');
      }
    };
  }, [readOnly]);

  return (
    <div style={{ height: '100%', position: 'relative' }}>
      {loading && (
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'rgba(255, 255, 255, 0.7)',
          zIndex: 10
        }}>
          <Spin size="large" />
        </div>
      )}
      <div 
        ref={containerRef} 
        style={{ 
          height: '100%',
          width: '100%',
          cursor: readOnly ? 'not-allowed' : 'default'
        }} 
      />
    </div>
  );
};

export default BpmnModeler;
