import React from 'react';
import { Steps, Spin } from 'antd';
import { LoadingOutlined } from '@ant-design/icons';

const ProcessingSteps = ({ steps }) => {
  const getStepStatus = (status) => {
    switch (status) {
      case 'completed': return 'finish';
      case 'processing': return 'process';
      case 'error': return 'error';
      default: return 'wait';
    }
  };

  return (
    <div style={{ padding: '24px', backgroundColor: '#fafafa', borderRadius: '8px' }}>
      <Steps direction="vertical" size="small" current={steps.findIndex(s => s.status === 'processing')}>
        {steps.map((step, index) => (
          <Steps.Step
            key={index}
            title={step.name}
            description={step.description}
            status={getStepStatus(step.status)}
            icon={step.status === 'processing' ? <Spin indicator={<LoadingOutlined spin />} /> : undefined}
          />
        ))}
      </Steps>
    </div>
  );
};

export default ProcessingSteps;