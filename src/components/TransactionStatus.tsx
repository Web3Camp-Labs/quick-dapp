import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { Spin, Progress, Typography, Button } from 'antd';
import { CheckCircleFilled, CloseCircleFilled, LoadingOutlined, LinkOutlined } from '@ant-design/icons';

const { Text, Link } = Typography;

const StatusContainer = styled.div`
  margin-top: 15px;
  padding: 15px;
  border-radius: 5px;
  background-color: #f9f9f9;
  border: 1px solid #e8e8e8;
`;

const StatusHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
`;

const StatusDetails = styled.div`
  margin-top: 10px;
  font-size: 14px;
`;

const HashLink = styled(Link)`
  font-family: monospace;
  word-break: break-all;
`;

const StepItem = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 8px;
  
  .icon {
    margin-right: 8px;
  }
  
  .step-content {
    flex: 1;
  }
  
  .step-time {
    color: #999;
    font-size: 12px;
    margin-left: 8px;
  }
`;

/**
 * Component to display transaction status with progress indicators
 */
const TransactionStatus = ({ 
  txHash, 
  status, 
  blockNumber, 
  estimatedTime,
  networkName,
  error,
  startTime,
  onClose
}) => {
  const [elapsedTime, setElapsedTime] = useState(0);
  const [explorerUrl, setExplorerUrl] = useState('');
  
  // Update elapsed time every second
  useEffect(() => {
    if (status === 'pending' && startTime) {
      const timer = setInterval(() => {
        setElapsedTime(Math.floor((Date.now() - startTime) / 1000));
      }, 1000);
      
      return () => clearInterval(timer);
    }
  }, [status, startTime]);
  
  // Set explorer URL based on network
  useEffect(() => {
    if (!txHash) return;
    
    let baseUrl;
    switch(networkName?.toLowerCase()) {
      case 'mainnet':
        baseUrl = 'https://etherscan.io/tx/';
        break;
      case 'ropsten':
        baseUrl = 'https://ropsten.etherscan.io/tx/';
        break;
      case 'rinkeby':
        baseUrl = 'https://rinkeby.etherscan.io/tx/';
        break;
      case 'goerli':
        baseUrl = 'https://goerli.etherscan.io/tx/';
        break;
      case 'kovan':
        baseUrl = 'https://kovan.etherscan.io/tx/';
        break;
      case 'polygon':
      case 'matic':
        baseUrl = 'https://polygonscan.com/tx/';
        break;
      case 'mumbai':
        baseUrl = 'https://mumbai.polygonscan.com/tx/';
        break;
      case 'bsc':
      case 'binance':
        baseUrl = 'https://bscscan.com/tx/';
        break;
      case 'avalanche':
        baseUrl = 'https://snowtrace.io/tx/';
        break;
      case 'arbitrum':
        baseUrl = 'https://arbiscan.io/tx/';
        break;
      case 'optimism':
        baseUrl = 'https://optimistic.etherscan.io/tx/';
        break;
      default:
        baseUrl = 'https://etherscan.io/tx/';
    }
    
    setExplorerUrl(baseUrl + txHash);
  }, [txHash, networkName]);
  
  // Calculate progress percentage
  const getProgressPercent = () => {
    if (status === 'success') return 100;
    if (status === 'error' || status === 'failed') return 100;
    if (status === 'not_found') return 30;
    
    // For pending status, base progress on elapsed time
    // Assuming most transactions confirm within 2 minutes (120 seconds)
    const timeBasedProgress = Math.min(Math.floor(elapsedTime / 120 * 70), 70);
    return 30 + timeBasedProgress;
  };
  
  // Format elapsed time
  const formatElapsedTime = () => {
    if (elapsedTime < 60) return `${elapsedTime}s`;
    const minutes = Math.floor(elapsedTime / 60);
    const seconds = elapsedTime % 60;
    return `${minutes}m ${seconds}s`;
  };
  
  // Get progress status text
  const getStatusText = () => {
    switch(status) {
      case 'success':
        return 'Transaction Confirmed';
      case 'failed':
        return 'Transaction Failed';
      case 'error':
        return 'Transaction Error';
      case 'not_found':
        return 'Transaction Not Found';
      case 'pending':
      default:
        return 'Transaction Pending';
    }
  };
  
  // Get progress status color
  const getStatusColor = () => {
    switch(status) {
      case 'success':
        return '#52c41a';
      case 'failed':
      case 'error':
        return '#ff4d4f';
      case 'not_found':
        return '#faad14';
      case 'pending':
      default:
        return '#1890ff';
    }
  };
  
  return (
    <StatusContainer>
      <StatusHeader>
        <Text strong>{getStatusText()}</Text>
        {onClose && (
          <Button type="text" size="small" onClick={onClose}>
            Close
          </Button>
        )}
      </StatusHeader>
      
      <Progress 
        percent={getProgressPercent()} 
        status={status === 'error' || status === 'failed' ? 'exception' : 
               status === 'success' ? 'success' : 'active'} 
        strokeColor={getStatusColor()}
      />
      
      <StatusDetails>
        <StepItem>
          <div className="icon">
            {status !== 'not_found' ? (
              <CheckCircleFilled style={{ color: '#52c41a' }} />
            ) : (
              <CloseCircleFilled style={{ color: '#ff4d4f' }} />
            )}
          </div>
          <div className="step-content">Transaction Submitted</div>
          {startTime && (
            <div className="step-time">
              {new Date(startTime).toLocaleTimeString()}
            </div>
          )}
        </StepItem>
        
        <StepItem>
          <div className="icon">
            {status === 'pending' ? (
              <LoadingOutlined style={{ color: '#1890ff' }} />
            ) : status === 'success' ? (
              <CheckCircleFilled style={{ color: '#52c41a' }} />
            ) : status === 'failed' || status === 'error' ? (
              <CloseCircleFilled style={{ color: '#ff4d4f' }} />
            ) : (
              <CloseCircleFilled style={{ color: '#ff4d4f' }} />
            )}
          </div>
          <div className="step-content">
            {status === 'pending' ? (
              <>
                Waiting for confirmation
                {estimatedTime && ` (Est. ${estimatedTime})`}
                {elapsedTime > 0 && ` - ${formatElapsedTime()}`}
              </>
            ) : status === 'success' ? (
              `Confirmed in block #${blockNumber}`
            ) : status === 'failed' ? (
              'Transaction failed on-chain'
            ) : status === 'error' ? (
              `Error: ${error || 'Unknown error'}`
            ) : (
              'Transaction not found'
            )}
          </div>
        </StepItem>
        
        {txHash && (
          <div style={{ marginTop: 15 }}>
            <Text strong>Transaction Hash:</Text>
            <div style={{ display: 'flex', alignItems: 'center', marginTop: 5 }}>
              <HashLink href={explorerUrl} target="_blank">
                {txHash.substring(0, 10)}...{txHash.substring(txHash.length - 8)}
              </HashLink>
              <Button 
                type="link" 
                icon={<LinkOutlined />} 
                size="small"
                href={explorerUrl}
                target="_blank"
              >
                View on Explorer
              </Button>
            </div>
          </div>
        )}
      </StatusDetails>
    </StatusContainer>
  );
};

export default TransactionStatus;
