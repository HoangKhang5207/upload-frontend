import React from 'react';
import { Form, Input } from 'antd';

const InputField = ({ label, id, value, onChange, type = 'text', required = false, helpText, name }) => (
  <Form.Item
    label={label}
    htmlFor={id}
    required={required}
    tooltip={helpText}
  >
    <Input
      id={id}
      name={name || id} // Đảm bảo 'name' tồn tại
      value={value}
      onChange={onChange}
      type={type}
      required={required}
    />
  </Form.Item>
);

export default InputField;