/**
 * Wallet utilities for multi-wallet support
 * Supports MetaMask, Coinbase Wallet, and other EIP-1193 providers
 */

/**
 * Wallet types
 */
export const WALLET_TYPES = {
    METAMASK: 'MetaMask',
    COINBASE: 'Coinbase Wallet',
    INJECTED: 'Injected Wallet',
};

/**
 * Detect available wallets in the browser
 * @returns {Array} List of available wallet providers
 */
export const detectWallets = () => {
    const wallets = [];

    // Check for MetaMask
    if (typeof window.ethereum !== 'undefined') {
        if (window.ethereum.isMetaMask && !window.ethereum.isCoinbaseWallet) {
            wallets.push({
                name: WALLET_TYPES.METAMASK,
                icon: '🦊',
                provider: window.ethereum,
                downloadUrl: 'https://metamask.io/download.html',
            });
        }
    }

    // Check for Coinbase Wallet
    if (typeof window.ethereum !== 'undefined' && window.ethereum.isCoinbaseWallet) {
        wallets.push({
            name: WALLET_TYPES.COINBASE,
            icon: '🔵',
            provider: window.ethereum,
            downloadUrl: 'https://www.coinbase.com/wallet',
        });
    }

    // Check for Coinbase Wallet via separate provider
    if (typeof window.coinbaseWalletExtension !== 'undefined') {
        wallets.push({
            name: WALLET_TYPES.COINBASE,
            icon: '🔵',
            provider: window.coinbaseWalletExtension,
            downloadUrl: 'https://www.coinbase.com/wallet',
        });
    }

    // Check for other injected wallets (Brave Wallet, Trust Wallet, etc.)
    if (typeof window.ethereum !== 'undefined' &&
        !window.ethereum.isMetaMask &&
        !window.ethereum.isCoinbaseWallet) {
        wallets.push({
            name: WALLET_TYPES.INJECTED,
            icon: '💼',
            provider: window.ethereum,
            downloadUrl: null,
        });
    }

    // If multiple providers exist via window.ethereum.providers (EIP-6963)
    if (window.ethereum?.providers?.length > 0) {
        const providers = [];
        window.ethereum.providers.forEach((provider) => {
            if (provider.isMetaMask) {
                providers.push({
                    name: WALLET_TYPES.METAMASK,
                    icon: '🦊',
                    provider: provider,
                    downloadUrl: 'https://metamask.io/download.html',
                });
            } else if (provider.isCoinbaseWallet) {
                providers.push({
                    name: WALLET_TYPES.COINBASE,
                    icon: '🔵',
                    provider: provider,
                    downloadUrl: 'https://www.coinbase.com/wallet',
                });
            }
        });

        if (providers.length > 0) {
            return providers;
        }
    }

    return wallets;
};

/**
 * Connect to a specific wallet
 * @param {Object} wallet - Wallet object from detectWallets()
 * @returns {Promise<string>} Connected account address
 */
export const connectWallet = async (wallet) => {
    try {
        if (!wallet || !wallet.provider) {
            throw new Error('Invalid wallet provider');
        }

        // Request accounts from the wallet
        const accounts = await wallet.provider.request({
            method: 'eth_requestAccounts',
        });

        if (accounts.length === 0) {
            throw new Error('No accounts found');
        }

        // Store selected wallet type in localStorage
        localStorage.setItem('selectedWallet', wallet.name);

        return accounts[0];
    } catch (error) {
        console.error('Error connecting wallet:', error);

        // User rejected the request
        if (error.code === 4001) {
            throw new Error('Connection request rejected');
        }

        throw error;
    }
};

/**
 * Get the currently selected wallet provider
 * @returns {Object|null} Wallet provider object
 */
export const getSelectedWallet = () => {
    const selectedWalletName = localStorage.getItem('selectedWallet');

    if (!selectedWalletName) {
        return null;
    }

    const wallets = detectWallets();
    return wallets.find(wallet => wallet.name === selectedWalletName) || null;
};

/**
 * Get the active provider (prioritizes selected wallet)
 * @returns {Object|null} Ethereum provider
 */
export const getProvider = () => {
    const selectedWallet = getSelectedWallet();

    if (selectedWallet) {
        return selectedWallet.provider;
    }

    // Fallback to window.ethereum
    if (typeof window.ethereum !== 'undefined') {
        return window.ethereum;
    }

    return null;
};

/**
 * Check if any wallet is available
 * @returns {boolean}
 */
export const isWalletAvailable = () => {
    const wallets = detectWallets();
    return wallets.length > 0;
};

/**
 * Disconnect wallet (clear stored preference)
 */
export const disconnectWallet = () => {
    localStorage.removeItem('selectedWallet');
};

/**
 * Format address for display
 * @param {string} address - Ethereum address
 * @returns {string} Formatted address
 */
export const formatAddress = (address) => {
    if (!address) return '';
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
};

/**
 * Get wallet icon URL or emoji
 * @param {string} walletName - Name of the wallet
 * @returns {string} Icon representation
 */
export const getWalletIcon = (walletName) => {
    switch (walletName) {
        case WALLET_TYPES.METAMASK:
            return '🦊';
        case WALLET_TYPES.COINBASE:
            return '🔵';
        default:
            return '💼';
    }
};
