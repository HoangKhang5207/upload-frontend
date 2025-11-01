import React, { useState, useEffect } from 'react';
import { Steps, Progress, Spin, Typography, Card } from 'antd';
import { LoadingOutlined } from '@ant-design/icons';

const { Text } = Typography;

const HorizontalProcessingBar = ({ steps, onProcessComplete, totalPages = 3 }) => {
  const [currentSteps, setCurrentSteps] = useState(steps);
  const [ocrProgress, setOcrProgress] = useState(0);
  const [allStepsCompleted, setAllStepsCompleted] = useState(false);

  useEffect(() => {
    setCurrentSteps(steps);
    
    const completedSteps = steps.filter(step => step.status === 'completed').length;
    const totalSteps = steps.length;
    const isCompleted = completedSteps === totalSteps && totalSteps > 0;
    
    if (isCompleted && !allStepsCompleted) {
      setAllStepsCompleted(true);
      if (onProcessComplete) {
        onProcessComplete();
      }
    }
  }, [steps, onProcessComplete, allStepsCompleted]);

  useEffect(() => {
    setOcrProgress(0); // Reset progress khi totalPages thay đổi
  }, [totalPages]);

  useEffect(() => {
    const ocrStep = currentSteps.find(step => step.name.includes("Đang xử lý OCR"));
    
    if (ocrStep && ocrStep.status === 'in-progress') {
      const interval = setInterval(() => {
        setOcrProgress(prev => {
          const newProgress = prev + (100 / totalPages);
          if (newProgress >= 100) {
            clearInterval(interval);
            return 100;
          }
          return newProgress;
        });
      }, 100); // Tốc độ mô phỏng
      
      return () => clearInterval(interval);
    } else if (ocrStep && ocrStep.status === 'completed') {
      setOcrProgress(100);
    } else {
      setOcrProgress(0);
    }
  }, [currentSteps, totalPages]);

  const getStepStatus = (status) => {
    switch (status) {
      case 'completed': return 'finish';
      case 'in-progress': return 'process';
      case 'error': return 'error';
      default: return 'wait';
    }
  };

  const getStepDescription = (step) => {
    if (step.name.includes("Đang xử lý OCR") && step.status === 'in-progress') {
      return (
        <div style={{ textAlign: 'center', marginTop: 8 }}>
          <Progress type="circle" percent={Math.round(ocrProgress)} size={40} />
          <Text type="secondary" style={{ display: 'block', fontSize: 12 }}>
            {Math.round(ocrProgress * totalPages / 100)}/{totalPages} trang
          </Text>
        </div>
      );
    }
    if (step.details && step.status === 'completed') {
       return <Text type="secondary" style={{fontSize: 12}}>{step.details}</Text>;
    }
    return null;
  };

  return (
    <Card bordered={false} style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
      <Steps direction="horizontal" size="small" items={currentSteps.map(step => ({
        title: step.name,
        status: getStepStatus(step.status),
        icon: step.status === 'in-progress' ? <Spin indicator={<LoadingOutlined spin />} /> : undefined,
        description: getStepDescription(step),
      }))} />
    </Card>
  );
};

export default HorizontalProcessingBar;