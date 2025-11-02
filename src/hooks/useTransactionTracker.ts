import { useState, useEffect, useCallback } from 'react';

/**
 * Custom hook to track transaction progress
 * @param {Object} provider - Ethers.js provider
 * @returns {Object} - Transaction tracking utilities
 */
export const useTransactionTracker = (provider) => {
  const [transactions, setTransactions] = useState({});
  
  // Add a new transaction to track
  const trackTransaction = useCallback((txHash, description) => {
    setTransactions(prev => ({
      ...prev,
      [txHash]: {
        hash: txHash,
        description,
        status: 'pending',
        confirmations: 0,
        receipt: null,
        error: null,
        startTime: Date.now(),
      }
    }));
    
    return txHash;
  }, []);
  
  // Update transaction status
  const updateTransaction = useCallback((txHash, updates) => {
    setTransactions(prev => {
      if (!prev[txHash]) return prev;
      
      return {
        ...prev,
        [txHash]: {
          ...prev[txHash],
          ...updates,
        }
      };
    });
  }, []);
  
  // Listen for transaction confirmations
  useEffect(() => {
    if (!provider) return;
    
    const pendingTxHashes = Object.keys(transactions).filter(
      hash => transactions[hash].status === 'pending'
    );
    
    const listeners = {};
    
    // Set up listeners for each pending transaction
    pendingTxHashes.forEach(txHash => {
      if (!listeners[txHash]) {
        const onReceipt = (receipt) => {
          updateTransaction(txHash, {
            status: receipt.status === 1 ? 'success' : 'failed',
            receipt,
            confirmations: 1,
          });
        };
        
        const onError = (error) => {
          updateTransaction(txHash, {
            status: 'error',
            error: error.message,
          });
        };
        
        // Listen for transaction receipt
        provider.once(txHash, onReceipt);
        
        // Store listeners to clean up later
        listeners[txHash] = { onReceipt, onError };
        
        // Check transaction status immediately
        provider.getTransaction(txHash)
          .then(tx => {
            if (tx) {
              // Transaction found but not confirmed yet
              updateTransaction(txHash, { 
                status: 'pending',
                gasPrice: tx.gasPrice?.toString(),
              });
              
              // If transaction has a wait method, use it to get receipt
              if (tx.wait) {
                tx.wait()
                  .then(onReceipt)
                  .catch(onError);
              }
            } else {
              // Transaction not found - might be dropped or not broadcast
              updateTransaction(txHash, { 
                status: 'not_found',
              });
            }
          })
          .catch(onError);
      }
    });
    
    // Clean up listeners
    return () => {
      pendingTxHashes.forEach(txHash => {
        if (listeners[txHash]) {
          provider.removeListener(txHash, listeners[txHash].onReceipt);
        }
      });
    };
  }, [transactions, provider, updateTransaction]);
  
  // Get estimated confirmation time based on gas price
  const getEstimatedTime = useCallback(async (txHash) => {
    if (!provider || !transactions[txHash]) return null;
    
    try {
      const tx = transactions[txHash];
      
      // If we don't have gas price info yet, try to get it
      if (!tx.gasPrice) {
        const txData = await provider.getTransaction(txHash);
        if (txData && txData.gasPrice) {
          updateTransaction(txHash, { gasPrice: txData.gasPrice.toString() });
        } else {
          return null;
        }
      }
      
      // Get current gas prices from the network
      const feeData = await provider.getFeeData();
      if (!feeData || !feeData.gasPrice) return null;

      const txGasPrice = BigInt(tx.gasPrice || '0');
      const currentGasPrice = feeData.gasPrice;
      
      // Calculate estimated time based on gas price difference
      // This is a very rough estimation
      if (txGasPrice >= currentGasPrice) {
        return 'less than 1 minute';
      } else if (txGasPrice >= currentGasPrice * BigInt(80) / BigInt(100)) {
        return '1-2 minutes';
      } else if (txGasPrice >= currentGasPrice * BigInt(50) / BigInt(100)) {
        return '3-5 minutes';
      } else {
        return 'more than 5 minutes';
      }
    } catch (error) {
      console.error('Error estimating confirmation time:', error);
      return null;
    }
  }, [provider, transactions, updateTransaction]);
  
  return {
    transactions,
    trackTransaction,
    updateTransaction,
    getEstimatedTime,
    getTransaction: useCallback((txHash) => transactions[txHash], [transactions]),
  };
};

export default useTransactionTracker;
