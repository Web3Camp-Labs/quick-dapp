import React from 'react';
import styled from 'styled-components';
import { Button, Result, Typography } from 'antd';
import { BugOutlined, ReloadOutlined, HomeOutlined } from '@ant-design/icons';

const { Paragraph, Text } = Typography;

const ErrorContainer = styled.div`
  min-height: 400px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2em;
`;

const ErrorDetails = styled.details`
  margin-top: 16px;
  padding: 16px;
  background-color: #f5f5f5;
  border-radius: 4px;
  max-width: 600px;

  summary {
    cursor: pointer;
    font-weight: 500;
    margin-bottom: 8px;
  }

  pre {
    margin: 0;
    padding: 8px;
    background-color: #fff;
    border: 1px solid #d9d9d9;
    border-radius: 4px;
    overflow-x: auto;
    font-size: 12px;
  }
`;

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // Log error to console
    console.error('Error caught by boundary:', error, errorInfo);

    // Update state with error details
    this.setState({
      error,
      errorInfo,
    });

    // You could also log the error to an error reporting service here
    // logErrorToService(error, errorInfo);
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  handleGoHome = () => {
    this.handleReset();
    window.location.href = '/';
  };

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <ErrorContainer>
          <Result
            status="error"
            icon={<BugOutlined />}
            title="Oops! Something went wrong"
            subTitle={
              this.props.fallbackMessage ||
              "We're sorry for the inconvenience. An unexpected error occurred."
            }
            extra={[
              <Button
                key="home"
                type="primary"
                icon={<HomeOutlined />}
                onClick={this.handleGoHome}
              >
                Go to Home
              </Button>,
              <Button
                key="reload"
                icon={<ReloadOutlined />}
                onClick={this.handleReload}
              >
                Reload Page
              </Button>,
              this.props.onReset && (
                <Button key="retry" onClick={() => {
                  this.handleReset();
                  this.props.onReset();
                }}>
                  Try Again
                </Button>
              ),
            ]}
          >
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <ErrorDetails>
                <summary>Error Details (Development Only)</summary>
                <Paragraph>
                  <Text strong>Error: </Text>
                  <Text>{this.state.error.toString()}</Text>
                </Paragraph>
                {this.state.errorInfo && (
                  <pre>
                    {this.state.errorInfo.componentStack}
                  </pre>
                )}
              </ErrorDetails>
            )}
          </Result>
        </ErrorContainer>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
