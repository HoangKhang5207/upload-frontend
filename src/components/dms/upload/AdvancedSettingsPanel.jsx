import React from 'react';
import { Card, Collapse, Row, Col, Radio, Checkbox, Divider, Typography } from 'antd';
import { SettingOutlined } from '@ant-design/icons';
const { Panel } = Collapse;
const { Text } = Typography;

const AdvancedSettingsPanel = ({ featureFlags, setFeatureFlags }) => {
    // Handler helper để code gọn hơn
    const handleChange = (key, value) => {
        setFeatureFlags(prev => ({ ...prev, [key]: value }));
    };

    return (
        <Card title="Cấu hình xử lý (Tùy chọn)" size="small" style={{ marginBottom: 20, background: '#f9f9f9' }}>
            <Collapse ghost>
                <Panel 
                    header={<span style={{fontWeight: 600}}><SettingOutlined /> Tùy chọn nâng cao (OCR, AI Metadata Suggest, Kiểm tra trùng lặp, mâu thuẫn...)</span>} 
                    key="1"
                >
                    <div style={{ padding: '0 12px' }}>
                        <Row gutter={[16, 16]}>
                            <Col span={24}>
                                <Text strong>Chọn Engine OCR (Trích xuất văn bản):</Text>
                                <div style={{ marginTop: 8 }}>
                                    <Radio.Group 
                                        value={featureFlags.ocrEngine} 
                                        onChange={(e) => handleChange('ocrEngine', e.target.value)}
                                        disabled={!featureFlags.enableOcr}
                                    >
                                        <Radio value="tesseract">Tesseract (Nhanh, Tiêu chuẩn)</Radio>
                                        <Radio value="easyocr">EasyOCR (Chậm, Hỗ trợ Deep Learning)</Radio>
                                    </Radio.Group>
                                </div>
                            </Col>
                            <Divider style={{ margin: '12px 0' }} />
                            
                            <Col span={12}>
                                <Checkbox 
                                    checked={featureFlags.enableOcr}
                                    onChange={(e) => handleChange('enableOcr', e.target.checked)}
                                >
                                    Thực hiện OCR (Trích xuất văn bản)
                                </Checkbox>
                            </Col>
                            <Col span={12}>
                                <Checkbox 
                                    checked={featureFlags.enableDenoise}
                                    onChange={(e) => handleChange('enableDenoise', e.target.checked)}
                                    disabled={!featureFlags.enableOcr} // Logic: Thường khử nhiễu chỉ phục vụ OCR
                                >
                                    Khử nhiễu ảnh (AI Denoise)
                                </Checkbox>
                            </Col>
                            <Col span={12}>
                                <Checkbox 
                                    checked={featureFlags.enableDuplicateCheck}
                                    onChange={(e) => handleChange('enableDuplicateCheck', e.target.checked)}
                                >
                                    Kiểm tra trùng lặp (Duplicate Check)
                                </Checkbox>
                            </Col>
                            <Col span={12}>
                                <Checkbox 
                                    checked={featureFlags.enableMetadata}
                                    onChange={(e) => handleChange('enableMetadata', e.target.checked)}
                                >
                                    Gợi ý Metadata & Check Mâu thuẫn
                                </Checkbox>
                            </Col>
                        </Row>
                    </div>
                </Panel>
            </Collapse>
        </Card>
    );
};

export default AdvancedSettingsPanel;