import React from 'react';
import { Form, Input, Typography } from 'antd';
import { InfoCircleOutlined } from '@ant-design/icons';

const { Text } = Typography;

const InputField = ({ 
    label, 
    name, 
    rules = [], 
    required = false, 
    placeholder, 
    prefix, 
    helpText,
    disabled = false,
    onChange, // Propagate onChange for custom logic
    value     // Value prop for controlled component
}) => {
    // Tự động thêm rule required nếu prop required=true
    const finalRules = required 
        ? [{ required: true, message: `Vui lòng nhập ${label ? label.toLowerCase() : 'thông tin này'}!` }, ...rules]
        : rules;

    return (
        <Form.Item
            label={label}
            name={name}
            rules={finalRules}
            help={helpText && <Text type="secondary" style={{fontSize: 12}}><InfoCircleOutlined /> {helpText}</Text>}
        >
            <Input 
                placeholder={placeholder || `Nhập ${label}`} 
                prefix={prefix} 
                disabled={disabled}
                onChange={onChange}
                value={value}
            />
        </Form.Item>
    );
};

export default InputField;