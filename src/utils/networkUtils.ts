/**
 * Network and block explorer utilities
 */

/**
 * Network configurations with block explorer URLs
 */
const NETWORK_CONFIG = {
  1: { name: 'Ethereum Mainnet', shortName: 'Ethereum', explorer: 'https://etherscan.io' },
  5: { name: 'Goerli Testnet', shortName: 'Goerli', explorer: 'https://goerli.etherscan.io' },
  11155111: { name: 'Sepolia Testnet', shortName: 'Sepolia', explorer: 'https://sepolia.etherscan.io' },
  137: { name: 'Polygon Mainnet', shortName: 'Polygon', explorer: 'https://polygonscan.com' },
  80001: { name: 'Mumbai Testnet', shortName: 'Mumbai', explorer: 'https://mumbai.polygonscan.com' },
  56: { name: 'BSC Mainnet', shortName: 'BSC', explorer: 'https://bscscan.com' },
  97: { name: 'BSC Testnet', shortName: 'BSC Testnet', explorer: 'https://testnet.bscscan.com' },
  42161: { name: 'Arbitrum One', shortName: 'Arbitrum', explorer: 'https://arbiscan.io' },
  421613: { name: 'Arbitrum Goerli', shortName: 'Arb Goerli', explorer: 'https://goerli.arbiscan.io' },
  10: { name: 'Optimism', shortName: 'Optimism', explorer: 'https://optimistic.etherscan.io' },
  420: { name: 'Optimism Goerli', shortName: 'OP Goerli', explorer: 'https://goerli-optimism.etherscan.io' },
  43114: { name: 'Avalanche C-Chain', shortName: 'Avalanche', explorer: 'https://snowtrace.io' },
  43113: { name: 'Avalanche Fuji', shortName: 'Fuji', explorer: 'https://testnet.snowtrace.io' },
  250: { name: 'Fantom Opera', shortName: 'Fantom', explorer: 'https://ftmscan.com' },
  4002: { name: 'Fantom Testnet', shortName: 'FTM Testnet', explorer: 'https://testnet.ftmscan.com' },
};

/**
 * Get network info by chain ID
 * @param {number|string} chainId - The chain ID
 * @returns {Object} - Network configuration
 */
export const getNetworkInfo = (chainId) => {
  const id = typeof chainId === 'string' ? parseInt(chainId) : chainId;
  return NETWORK_CONFIG[id] || { name: `Unknown Network (${id})`, shortName: 'Unknown', explorer: null };
};

/**
 * Get block explorer URL for a transaction
 * @param {string} txHash - Transaction hash
 * @param {number|string} chainId - Chain ID
 * @returns {string|null} - Block explorer URL or null
 */
export const getTxExplorerUrl = (txHash, chainId) => {
  const network = getNetworkInfo(chainId);
  if (!network.explorer) return null;
  return `${network.explorer}/tx/${txHash}`;
};

/**
 * Get block explorer URL for an address
 * @param {string} address - Ethereum address
 * @param {number|string} chainId - Chain ID
 * @returns {string|null} - Block explorer URL or null
 */
export const getAddressExplorerUrl = (address, chainId) => {
  const network = getNetworkInfo(chainId);
  if (!network.explorer) return null;
  return `${network.explorer}/address/${address}`;
};

/**
 * Format a large number with commas
 * @param {string|number|bigint} value - The value to format
 * @param {number} decimals - Number of decimal places
 * @returns {string} - Formatted number
 */
export const formatNumber = (value, decimals = 0) => {
  try {
    const num = typeof value === 'bigint' ? Number(value) : parseFloat(value);
    if (isNaN(num)) return value.toString();

    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 0,
      maximumFractionDigits: decimals,
    }).format(num);
  } catch (error) {
    return value.toString();
  }
};

/**
 * Detect if a value might be a token amount and format accordingly
 * @param {bigint|string} value - The value
 * @param {number} decimals - Token decimals (default 18 for ETH)
 * @returns {string} - Formatted value
 */
export const formatTokenAmount = (value, decimals = 18) => {
  try {
    const bigIntValue = typeof value === 'bigint' ? value : BigInt(value);
    const divisor = BigInt(10 ** decimals);
    const wholePart = bigIntValue / divisor;
    const fractionalPart = bigIntValue % divisor;

    if (fractionalPart === BigInt(0)) {
      return formatNumber(wholePart);
    }

    // Show up to 6 decimal places for fractional part
    const fractionalStr = fractionalPart.toString().padStart(decimals, '0');
    const trimmedFractional = fractionalStr.replace(/0+$/, '').substring(0, 6);

    if (trimmedFractional) {
      return `${formatNumber(wholePart)}.${trimmedFractional}`;
    }

    return formatNumber(wholePart);
  } catch (error) {
    return value.toString();
  }
};

/**
 * Copy text to clipboard
 * @param {string} text - Text to copy
 * @returns {Promise<boolean>} - Success status
 */
export const copyToClipboard = async (text) => {
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
      return true;
    } else {
      // Fallback for older browsers or non-secure contexts
      const textArea = document.createElement('textarea');
      textArea.value = text;
      textArea.style.position = 'fixed';
      textArea.style.left = '-999999px';
      document.body.appendChild(textArea);
      textArea.select();
      try {
        document.execCommand('copy');
        document.body.removeChild(textArea);
        return true;
      } catch (error) {
        document.body.removeChild(textArea);
        return false;
      }
    }
  } catch (error) {
    console.error('Failed to copy to clipboard:', error);
    return false;
  }
};
