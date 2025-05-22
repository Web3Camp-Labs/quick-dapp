import { ethers } from 'ethers';

/**
 * Format contract parameter value based on its type
 * @param {string} type - The Solidity parameter type
 * @param {string} value - The user input value
 * @returns {any} - The formatted value ready for contract call
 */
export const formatTypeValue = (type, value) => {
  if (!value && value !== 0 && value !== false) {
    throw new Error(`Value is required for type ${type}`);
  }

  // Handle array types
  if (type.includes('[')) {
    try {
      // Parse the array from string input
      let arrayValue = value;
      if (typeof value === 'string') {
        // Handle both comma-separated values and JSON arrays
        if (value.trim().startsWith('[')) {
          arrayValue = JSON.parse(value);
        } else {
          arrayValue = value.split(',').map(item => item.trim());
        }
      }

      // Get the base type (without array brackets)
      const baseType = type.substring(0, type.indexOf('['));
      
      // Format each element in the array
      return arrayValue.map(item => formatTypeValue(baseType, item));
    } catch (error) {
      throw new Error(`Invalid array format for ${type}: ${error.message}`);
    }
  }

  // Handle tuple types
  if (type.startsWith('tuple')) {
    try {
      return JSON.parse(value);
    } catch (error) {
      throw new Error(`Invalid tuple format: ${error.message}`);
    }
  }

  // Handle address type
  if (type === 'address') {
    if (!ethers.utils.isAddress(value)) {
      throw new Error('Invalid Ethereum address');
    }
    return value;
  }

  // Handle boolean type
  if (type === 'bool') {
    if (typeof value === 'boolean') return value;
    if (value.toLowerCase() === 'true') return true;
    if (value.toLowerCase() === 'false') return false;
    throw new Error('Boolean value must be true or false');
  }

  // Handle integer types (uint/int)
  if (type.startsWith('uint') || type.startsWith('int')) {
    try {
      // Check if the value is a valid number
      if (isNaN(value)) {
        throw new Error(`Not a valid number for ${type}`);
      }
      return ethers.BigNumber.from(value);
    } catch (error) {
      throw new Error(`Invalid number format for ${type}: ${error.message}`);
    }
  }

  // Handle bytes types
  if (type.startsWith('bytes')) {
    if (type === 'bytes') {
      return ethers.utils.arrayify(value);
    }
    // Handle fixed-size bytes
    return value;
  }

  // Handle string type
  if (type === 'string') {
    return value;
  }

  // Default case
  return value;
};

/**
 * Format contract result for display
 * @param {any} result - The raw result from contract call
 * @param {Object} outputDef - The output definition from ABI
 * @returns {string} - Formatted result for display
 */
export const formatContractResult = (result, outputDef) => {
  if (result === undefined) {
    return 'No return value';
  }
  
  if (result === null) {
    return 'null';
  }
  
  if (result instanceof ethers.BigNumber) {
    // Check if it might be representing ETH
    if (outputDef && 
        (outputDef.type.includes('uint') || 
         (outputDef.name && outputDef.name.toLowerCase().includes('balance')))) {
      return result.toString();
    }
    return result.toString();
  }
  
  if (Array.isArray(result)) {
    return JSON.stringify(result, null, 2);
  }
  
  if (typeof result === 'boolean') {
    return result.toString();
  }
  
  if (typeof result === 'object') {
    try {
      return JSON.stringify(result, null, 2);
    } catch (e) {
      return 'Complex object: ' + Object.prototype.toString.call(result);
    }
  }
  
  if (typeof result === 'string') {
    return result;
  }
  
  return String(result);
};

/**
 * Parse and format blockchain errors
 * @param {Error} error - The error object from ethers.js
 * @returns {string} - User-friendly error message
 */
export const parseBlockchainError = (error) => {
  const errorMessage = error.message || 'Unknown error';
  
  // Check for common blockchain error patterns
  if (errorMessage.includes('insufficient funds')) {
    return 'Insufficient funds to complete this transaction';
  }
  
  if (errorMessage.includes('gas required exceeds allowance')) {
    return 'Transaction requires more gas than allowed';
  }
  
  if (errorMessage.includes('nonce too low')) {
    return 'Transaction nonce is too low. Try refreshing the page';
  }
  
  if (errorMessage.includes('replacement transaction underpriced')) {
    return 'Gas price too low for replacement transaction';
  }
  
  if (errorMessage.includes('execution reverted')) {
    // Extract custom error message if available
    const revertMatch = errorMessage.match(/execution reverted: (.*?)(?:,|$)/);
    if (revertMatch && revertMatch[1]) {
      return `Smart contract reverted: ${revertMatch[1]}`;
    }
    return 'Transaction reverted by the smart contract';
  }
  
  if (errorMessage.includes('user rejected')) {
    return 'Transaction was rejected in your wallet';
  }
  
  if (errorMessage.includes('network changed')) {
    return 'Network changed during transaction. Please refresh the page';
  }
  
  // Return original error if no specific pattern is matched
  return errorMessage;
};
