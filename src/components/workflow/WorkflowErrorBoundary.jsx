import React from 'react';
import { Result, Button, Typography } from 'antd'; // Import Result
// import { ExclamationTriangleIcon } from '@heroicons/react/24/outline'; // Xóa

const { Paragraph, Text } = Typography;

class WorkflowErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error: error };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({
      error: error,
      errorInfo: errorInfo
    });
    console.error('Workflow Error Boundary caught an error:', error, errorInfo);
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <Result
          status="error"
          title="Đã xảy ra lỗi"
          subTitle="Đã xảy ra lỗi khi hiển thị phần này của ứng dụng."
          extra={[
            <Button type="primary" key="retry" onClick={this.handleRetry}>
              Thử lại
            </Button>,
          ]}
        >
          {process.env.NODE_ENV === 'development' && (
            <div className="desc">
              <Paragraph>
                <Text strong style={{ fontSize: 16 }}>
                  Chi tiết lỗi (Development Mode):
                </Text>
              </Paragraph>
              <Paragraph style={{ textAlign: 'left', backgroundColor: '#fff0f0', padding: 16 }}>
                <pre style={{ whiteSpace: 'pre-wrap' }}>
                  {this.state.error && this.state.error.toString()}
                  <br />
                  {this.state.errorInfo && this.state.errorInfo.componentStack}
                </pre>
              </Paragraph>
            </div>
          )}
        </Result>
      );
    }

    return this.props.children;
  }
}

export default WorkflowErrorBoundary;