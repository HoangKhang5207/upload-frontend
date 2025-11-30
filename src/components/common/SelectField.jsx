import React from 'react';
import { Form, Select, Typography } from 'antd';
import { InfoCircleOutlined } from '@ant-design/icons';

const { Option } = Select;
const { Text } = Typography;

const SelectField = ({ 
    label, 
    name, 
    options = [], 
    rules = [], 
    required = false, 
    placeholder, 
    mode, 
    helpText,
    disabled = false,
    onChange
}) => {
    const finalRules = required 
        ? [{ required: true, message: `Vui lòng chọn ${label ? label.toLowerCase() : 'thông tin này'}!` }, ...rules]
        : rules;

    console.log("Rendering SelectField:", { label, name, options, required, disabled });

    return (
        <Form.Item
            label={label}
            name={name}
            rules={finalRules}
            help={helpText && <Text type="secondary" style={{fontSize: 12}}><InfoCircleOutlined /> {helpText}</Text>}
        >
            <Select
                mode={mode}
                placeholder={placeholder || `Chọn ${label}`}
                disabled={disabled}
                onChange={onChange}
                allowClear
                showSearch
                optionFilterProp="children"
            >
                {options && options.map((opt) => (
                    <Option key={opt.id} value={opt.id} label={opt.name}>
                        {opt.name}
                    </Option>
                ))}
            </Select>
        </Form.Item>
    );
};

export default SelectField;