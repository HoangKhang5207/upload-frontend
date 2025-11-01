import React from 'react';
import { Steps, Spin, Typography } from 'antd';
import {
  CheckCircleOutlined,
  SyncOutlined,
  HourglassOutlined,
  UserOutlined,
  ClockCircleOutlined
} from '@ant-design/icons';

const { Title, Text } = Typography;

const WorkflowVisualizer = ({ workflow }) => {
  if (!workflow || !workflow.steps) {
    return <Text type="secondary">Không có thông tin quy trình.</Text>;
  }

  const getStepProps = (status) => {
    switch (status) {
      case 'completed':
        return { status: 'finish', icon: <CheckCircleOutlined /> };
      case 'pending':
        return { status: 'process', icon: <Spin indicator={<SyncOutlined spin />} /> };
      case 'upcoming':
        return { status: 'wait', icon: <HourglassOutlined /> };
      default:
        return { status: 'wait' };
    }
  };

  return (
    <div style={{ padding: '16px', backgroundColor: '#fafafa', borderRadius: '8px' }}>
      <Title level={5} style={{ margin: '0 0 16px 0' }}>
        Sơ đồ quy trình: {workflow.name}
      </Title>
      <Steps direction="vertical" size="small" current={workflow.steps.findIndex(s => s.status === 'pending')}>
        {workflow.steps.map((step, index) => (
          <Steps.Step
            key={index}
            {...getStepProps(step.status)}
            title={<Text strong>{step.name}</Text>}
            description={
              <div>
                <Text type="secondary" style={{ display: 'flex', alignItems: 'center' }}>
                  <UserOutlined style={{ marginRight: 4 }} /> 
                  {step.user ? `Người xử lý: ${step.user}` : 'Hành động hệ thống'}
                </Text>
                {step.date && (
                  <Text type="secondary" style={{ display: 'flex', alignItems: 'center', fontSize: 12 }}>
                    <ClockCircleOutlined style={{ marginRight: 4 }} />
                    {new Date(step.date).toLocaleString('vi-VN')}
                  </Text>
                )}
              </div>
            }
          />
        ))}
      </Steps>
    </div>
  );
};

export default WorkflowVisualizer;