import React from 'react';
import { Steps, Typography } from 'antd';
import { 
    LoadingOutlined, 
    CheckCircleOutlined, 
    ClockCircleOutlined, 
    MinusCircleOutlined, 
    CloseCircleOutlined,
    WarningOutlined
} from '@ant-design/icons';

const { Text } = Typography;

const ProcessingSteps = ({ steps }) => {
    // Hàm map trạng thái từ logic nghiệp vụ sang Antd Steps
    const getStepStatus = (status) => {
        switch (status) {
            case 'processing': return 'process';
            case 'completed': return 'finish';
            case 'error': return 'error';
            case 'skipped': return 'wait'; // Dùng 'wait' nhưng custom style mờ đi
            case 'warning': return 'process'; // Warning vẫn là đang xử lý nhưng icon khác
            default: return 'wait';
        }
    };

    // Hàm chọn Icon phù hợp
    const getStepIcon = (status) => {
        switch (status) {
            case 'processing': 
                return <LoadingOutlined spin style={{ color: '#1890ff' }} />;
            case 'completed': 
                return <CheckCircleOutlined style={{ color: '#52c41a' }} />;
            case 'error': 
                return <CloseCircleOutlined style={{ color: '#ff4d4f' }} />;
            case 'skipped': 
                return <MinusCircleOutlined style={{ color: '#d9d9d9' }} />; // Icon gạch bỏ
            case 'warning':
                return <WarningOutlined style={{ color: '#faad14' }} />;
            default: 
                return <ClockCircleOutlined style={{ color: '#d9d9d9' }} />;
        }
    };

    // Hàm style cho text (làm mờ nếu skipped)
    const getTextStyle = (status) => {
        if (status === 'skipped') {
            return { color: '#bfbfbf', fontStyle: 'italic' };
        }
        if (status === 'processing') {
            return { fontWeight: 600, color: '#1890ff' };
        }
        return {};
    };

    return (
        <div style={{ padding: '0 12px' }}>
            <Steps 
                direction="vertical" 
                size="small"
                current={-1} // Hack: Để không có bước nào được highlight mặc định theo index, ta control bằng status từng item
            >
                {steps.map((step) => (
                    <Steps.Step
                        key={step.key || step.name}
                        title={
                            <span style={{ ...getTextStyle(step.status), fontSize: 14 }}>
                                {step.name}
                            </span>
                        }
                        description={
                            <span style={{ fontSize: 12, color: step.status === 'skipped' ? '#d9d9d9' : '#8c8c8c' }}>
                                {step.description}
                            </span>
                        }
                        status={getStepStatus(step.status)}
                        icon={getStepIcon(step.status)}
                    />
                ))}
            </Steps>
        </div>
    );
};

export default ProcessingSteps;