import React, { useState } from 'react';
import styled from 'styled-components';
import { Button, Typography, message, Tag, Tooltip } from 'antd';
import { CopyOutlined, LinkOutlined, CheckOutlined } from '@ant-design/icons';
import { copyToClipboard, getTxExplorerUrl, formatNumber, formatTokenAmount } from '../utils/networkUtils';
import { ethers } from 'ethers';

const { Text, Link } = Typography;

const ResultContainer = styled.div<{ $isError: boolean }>`
  margin-top: 15px;
  padding: 16px;
  border-radius: 6px;
  background-color: ${props => props.$isError ? '#fff2f0' : '#f6ffed'};
  border: 1px solid ${props => props.$isError ? '#ffccc7' : '#b7eb8f'};
  word-break: break-word;
`;

const ResultHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
  flex-wrap: wrap;
  gap: 8px;
`;

const ResultTitle = styled.div<{ $isError: boolean }>`
  font-weight: 600;
  font-size: 14px;
  color: ${props => props.$isError ? '#cf1322' : '#52c41a'};
`;

const ResultValue = styled.div`
  background-color: white;
  padding: 12px;
  border-radius: 4px;
  border: 1px solid #eee;
  margin-top: 8px;
  max-height: 300px;
  overflow-y: auto;
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', 'Consolas', monospace;
  font-size: 13px;
  line-height: 1.6;
  position: relative;
  white-space: pre-wrap;
`;

const CopyButton = styled(Button)`
  position: absolute;
  top: 8px;
  right: 8px;
  opacity: 0.7;

  &:hover {
    opacity: 1;
  }
`;

const AddressLink = styled(Link)`
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', 'Consolas', monospace;
  font-size: 13px;
`;

const TxInfo = styled.div`
  margin-top: 12px;
  padding-top: 12px;
  border-top: 1px dashed #d9d9d9;
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const InfoRow = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
`;

/**
 * Enhanced result display component with formatting and copy functionality
 */
interface ResultDisplayProps {
  result: any;
  isError?: boolean;
  transactionHash?: string;
  blockNumber?: number;
  chainId?: number;
  methodName?: string;
  outputType?: any;
}

const ResultDisplay = ({
  result,
  isError = false,
  transactionHash,
  blockNumber,
  chainId,
  methodName,
  outputType,
}: ResultDisplayProps) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    const success = await copyToClipboard(formatResultForCopy(result));
    if (success) {
      setCopied(true);
      message.success('Copied to clipboard!');
      setTimeout(() => setCopied(false), 2000);
    } else {
      message.error('Failed to copy to clipboard');
    }
  };

  const formatResultForCopy = (value) => {
    if (typeof value === 'string') return value;
    if (typeof value === 'bigint') return value.toString();
    if (typeof value === 'object') {
      try {
        return JSON.stringify(value, (key, val) =>
          typeof val === 'bigint' ? val.toString() : val
        , 2);
      } catch {
        return String(value);
      }
    }
    return String(value);
  };

  const formatResultForDisplay = (value) => {
    if (value === undefined || value === null) {
      return String(value);
    }

    // Handle bigint values
    if (typeof value === 'bigint') {
      // Try to detect if it's a token amount (very large numbers)
      if (value > BigInt(10 ** 12)) {
        const formatted = formatTokenAmount(value, 18);
        return (
          <Tooltip title={`Raw value: ${value.toString()}`}>
            <span>{formatted} <Tag color="blue">~ETH format</Tag></span>
          </Tooltip>
        );
      }
      return formatNumber(value);
    }

    // Handle addresses
    if (typeof value === 'string' && ethers.isAddress(value)) {
      const explorerUrl = chainId ? getTxExplorerUrl(value, chainId) : null;
      return (
        <AddressLink href={explorerUrl} target="_blank" rel="noopener noreferrer">
          {value} {explorerUrl && <LinkOutlined />}
        </AddressLink>
      );
    }

    // Handle arrays
    if (Array.isArray(value)) {
      return (
        <div>
          {value.map((item, index) => (
            <div key={index} style={{ marginLeft: index > 0 ? '16px' : 0 }}>
              [{index}]: {formatResultForDisplay(item)}
            </div>
          ))}
        </div>
      );
    }

    // Handle objects
    if (typeof value === 'object') {
      try {
        const formatted = JSON.stringify(value, (key, val) =>
          typeof val === 'bigint' ? val.toString() : val
        , 2);
        return <pre style={{ margin: 0 }}>{formatted}</pre>;
      } catch {
        return String(value);
      }
    }

    // Handle booleans
    if (typeof value === 'boolean') {
      return <Tag color={value ? 'success' : 'default'}>{value.toString()}</Tag>;
    }

    // Default string representation
    return String(value);
  };

  const txExplorerUrl = transactionHash && chainId ? getTxExplorerUrl(transactionHash, chainId) : null;

  return (
    <ResultContainer $isError={isError}>
      <ResultHeader>
        <ResultTitle $isError={isError}>
          {isError ? 'Error' : 'Result'}
        </ResultTitle>
        {!isError && methodName && (
          <Text type="secondary" style={{ fontSize: '12px' }}>
            from {methodName}()
          </Text>
        )}
      </ResultHeader>

      <ResultValue>
        <CopyButton
          type="text"
          size="small"
          icon={copied ? <CheckOutlined /> : <CopyOutlined />}
          onClick={handleCopy}
        />
        {formatResultForDisplay(result)}
      </ResultValue>

      {!isError && (transactionHash || blockNumber) && (
        <TxInfo>
          {transactionHash && (
            <InfoRow>
              <Text type="secondary" style={{ fontSize: '12px' }}>Transaction:</Text>
              {txExplorerUrl ? (
                <AddressLink href={txExplorerUrl} target="_blank" rel="noopener noreferrer">
                  {transactionHash.substring(0, 10)}...{transactionHash.substring(transactionHash.length - 8)}
                  <LinkOutlined style={{ marginLeft: '4px' }} />
                </AddressLink>
              ) : (
                <Text code style={{ fontSize: '12px' }}>
                  {transactionHash.substring(0, 10)}...{transactionHash.substring(transactionHash.length - 8)}
                </Text>
              )}
            </InfoRow>
          )}
          {blockNumber && (
            <InfoRow>
              <Text type="secondary" style={{ fontSize: '12px' }}>Block:</Text>
              <Text code style={{ fontSize: '12px' }}>{blockNumber.toString()}</Text>
            </InfoRow>
          )}
        </TxInfo>
      )}
    </ResultContainer>
  );
};

export default ResultDisplay;
