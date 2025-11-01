import React from 'react';
import { Form, Select } from 'antd';

const { Option } = Select;

const SelectField = ({ label, id, value, onChange, options, required = false, name }) => {
  
  // Xử lý sự kiện onChange của Antd Select (chỉ trả về value)
  const handleChange = (newValue) => {
    // Tạo một đối tượng sự kiện giả lập
    const event = {
      target: {
        name: name || id,
        value: newValue
      }
    };
    onChange(event); // Gọi hàm onChange gốc với sự kiện giả lập
  };

  return (
    <Form.Item
      label={label}
      htmlFor={id}
      required={required}
    >
      <Select
        id={id}
        name={name || id}
        value={value}
        onChange={handleChange} // Dùng hàm xử lý mới
        required={required}
        placeholder="-- Chọn --"
      >
        {options.map(opt => (
          <Option key={opt.id} value={opt.id}>{opt.name}</Option>
        ))}
      </Select>
    </Form.Item>
  );
};

export default SelectField;