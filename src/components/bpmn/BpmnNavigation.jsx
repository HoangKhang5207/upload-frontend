import React from 'react';
import { Breadcrumb, Row, Col, Typography } from 'antd';
import { HomeOutlined } from '@ant-design/icons';
import { Link } from 'react-router-dom';

const { Title } = Typography;

const BpmnNavigation = ({ title, extra = [] }) => {
  return (
    <div style={{ marginBottom: '16px' }}>
      <Row justify="space-between" align="middle">
        <Col>
          <Breadcrumb style={{ marginBottom: '8px' }}>
            <Breadcrumb.Item>
              <Link to="/">
                <HomeOutlined /> Trang chủ
              </Link>
            </Breadcrumb.Item>
            <Breadcrumb.Item>
              <Link to="/bpmn">Quản lý BPMN</Link>
            </Breadcrumb.Item>
            {title && <Breadcrumb.Item>{title}</Breadcrumb.Item>}
          </Breadcrumb>
          {title && <Title level={4} style={{ margin: 0 }}>{title}</Title>}
        </Col>
        {extra.length > 0 && (
          <Col>
            {extra.map((item, index) => (
              <React.Fragment key={index}>
                {item}
                {index < extra.length - 1 && <span style={{ margin: '0 8px' }} />}
              </React.Fragment>
            ))}
          </Col>
        )}
      </Row>
    </div>
  );
};

export default BpmnNavigation;
