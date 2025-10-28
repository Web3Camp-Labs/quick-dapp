import { Button, notification, Dropdown, Menu } from 'antd';
import { WalletOutlined, DisconnectOutlined, CopyOutlined, HomeOutlined } from '@ant-design/icons';
import { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import logo from '../res/logo.svg';
import { useDappContext } from '../store/contextProvider';
import { ethers } from 'ethers';
import WalletModal from './WalletModal';
import {
    connectWallet as connectToWallet,
    disconnectWallet as disconnectFromWallet,
    getProvider,
    getSelectedWallet,
    isWalletAvailable,
} from '../utils/walletUtils';

const HeaderTop = styled.div`
    display: flex;
    align-items: center;
    justify-content: space-between;
    width: 100%;
    min-height: 64px;
    padding: 0 5%;
    box-sizing: border-box;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
    background-color: #ffffff;
    position: sticky;
    top: 0;
    z-index: 1000;
    
    @media (max-width: 768px) {
        min-height: 56px;
        padding: 0 3%;
    }
`;

const Logo = styled.div`
    cursor: pointer;
    display: flex;
    align-items: center;
    height: 100%;
    padding: 8px 0;
    img {
        width: 80px;
        height: auto;
        
        @media (max-width: 768px) {
            width: 60px;
        }
    }
`;



const AccountDisplay = styled.div`
    display: flex;
    align-items: center;
    background-color: #f5f5f5;
    border-radius: 20px;
    padding: 5px 15px;
    cursor: pointer;
    transition: all 0.3s ease;
    height: 36px;
    
    &:hover {
        background-color: #e6f7ff;
    }
    
    .address {
        margin-left: 8px;
        font-size: 14px;
    }
    
    @media (max-width: 768px) {
        padding: 4px 10px;
        height: 32px;
        
        .address {
            font-size: 12px;
        }
    }
`;

const NetworkBadge = styled.div`
    background-color: ${props => props.color || '#52c41a'};
    color: white;
    font-size: 12px;
    padding: 2px 8px;
    border-radius: 10px;
    margin-right: 10px;
`;

const HeaderActions = styled.div`
    display: flex;
    align-items: center;
    gap: 15px;
    height: 100%;
    
    @media (max-width: 768px) {
        gap: 8px;
    }
`;

export default function Header() {
    const [account, setAccount] = useState('');
    const [network, setNetwork] = useState(null);
    const [isConnecting, setIsConnecting] = useState(false);
    const [showWalletModal, setShowWalletModal] = useState(false);
    const [selectedWalletName, setSelectedWalletName] = useState('');
    const [copied, setCopied] = useState(false);

    const { dispatch } = useDappContext();
    const navigate = useNavigate();

    // Check if account is already connected on component mount
    useEffect(() => {
        const checkConnection = async () => {
            const provider = getProvider();
            if (provider) {
                try {
                    // Get current accounts
                    const accounts = await provider.request({ method: 'eth_accounts' });
                    if (accounts.length > 0) {
                        setAccount(accounts[0]);
                        dispatch({ type: 'set_account', payload: accounts[0] });

                        // Get selected wallet name
                        const wallet = getSelectedWallet();
                        if (wallet) {
                            setSelectedWalletName(wallet.name);
                        }

                        // Get current network
                        await updateNetworkInfo();
                    }

                    // Listen for account changes
                    provider.on('accountsChanged', handleAccountsChanged);

                    // Listen for network changes
                    provider.on('chainChanged', handleChainChanged);
                } catch (error) {
                    console.error('Error checking wallet connection:', error);
                }
            }
        };

        checkConnection();

        // Cleanup listeners on unmount
        return () => {
            const provider = getProvider();
            if (provider) {
                provider.removeListener('accountsChanged', handleAccountsChanged);
                provider.removeListener('chainChanged', handleChainChanged);
            }
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);
    
    // Handle account changes
    const handleAccountsChanged = (accounts) => {
        if (accounts.length === 0) {
            // User disconnected their wallet
            setAccount('');
            dispatch({ type: 'set_account', payload: '' });
            notification.info({
                message: 'Wallet Disconnected',
                description: 'Your wallet has been disconnected.'
            });
        } else {
            // User switched accounts
            setAccount(accounts[0]);
            dispatch({ type: 'set_account', payload: accounts[0] });
        }
    };
    
    // Handle network changes
    const handleChainChanged = async () => {
        // Reload the page on network change as recommended by MetaMask
        window.location.reload();
    };
    
    // Get network information
    const updateNetworkInfo = async () => {
        const walletProvider = getProvider();
        if (walletProvider) {
            try {
                const provider = new ethers.BrowserProvider(walletProvider);
                const network = await provider.getNetwork();
                setNetwork(network);
            } catch (error) {
                console.error('Error getting network info:', error);
            }
        }
    };
    
    // Format address for display
    const formatAddress = (address) => {
        if (!address) return '';
        return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
    };
    
    // Open wallet selection modal
    const openWalletModal = () => {
        if (!isWalletAvailable()) {
            notification.warning({
                message: 'No Wallet Detected',
                description: 'Please install MetaMask, Coinbase Wallet, or another compatible wallet extension.',
                duration: 5,
            });
        }
        setShowWalletModal(true);
    };

    // Handle wallet connection from modal
    const handleWalletConnect = async (wallet) => {
        setIsConnecting(true);

        try {
            const connectedAccount = await connectToWallet(wallet);
            setAccount(connectedAccount);
            setSelectedWalletName(wallet.name);
            dispatch({ type: 'set_account', payload: connectedAccount });

            await updateNetworkInfo();

            setShowWalletModal(false);

            notification.success({
                message: 'Wallet Connected',
                description: `Successfully connected to ${wallet.name}!`,
                duration: 3,
            });
        } catch (error) {
            console.error('Error connecting wallet:', error);
            notification.error({
                message: 'Connection Failed',
                description: error.message || 'Failed to connect wallet. Please try again.',
            });
        } finally {
            setIsConnecting(false);
        }
    };

    // Navigate to home
    const backToHome = () => {
        navigate('/home');
    };
    
    // Copy address to clipboard
    const copyAddress = () => {
        if (account) {
            navigator.clipboard.writeText(account);
            setCopied(true);
            notification.success({
                message: 'Address Copied',
                description: 'Address copied to clipboard!',
                duration: 2,
            });
            setTimeout(() => setCopied(false), 2000);
        }
    };
    
    // Disconnect wallet
    const handleDisconnect = () => {
        disconnectFromWallet();
        setAccount('');
        setSelectedWalletName('');
        dispatch({ type: 'set_account', payload: '' });
        notification.info({
            message: 'Wallet Disconnected',
            description: 'Your wallet has been disconnected from this app.',
        });
    };
    
    // Get network display name and color
    const getNetworkInfo = () => {
        if (!network) return { name: 'Unknown', color: '#999999' };
        
        switch (network.chainId) {
            case 1:
                return { name: 'Ethereum', color: '#627EEA' };
            case 5:
                return { name: 'Goerli', color: '#3099f2' };
            case 11155111:
                return { name: 'Sepolia', color: '#5f4bb6' };
            case 137:
                return { name: 'Polygon', color: '#8247E5' };
            case 80001:
                return { name: 'Mumbai', color: '#92b5d8' };
            case 42161:
                return { name: 'Arbitrum', color: '#28a0f0' };
            case 10:
                return { name: 'Optimism', color: '#ff0420' };
            default:
                return { name: `Chain ID: ${network.chainId}`, color: '#f5a623' };
        }
    };
    
    // Wallet menu items
    const walletMenu = (
        <Menu>
            {selectedWalletName && (
                <Menu.Item key="wallet" disabled style={{ cursor: 'default' }}>
                    <span style={{ color: '#667eea', fontWeight: 600 }}>
                        {selectedWalletName}
                    </span>
                </Menu.Item>
            )}
            {selectedWalletName && <Menu.Divider />}
            <Menu.Item key="copy" onClick={copyAddress} icon={<CopyOutlined />}>
                Copy Address
            </Menu.Item>
            <Menu.Item key="disconnect" onClick={handleDisconnect} icon={<DisconnectOutlined />}>
                Disconnect
            </Menu.Item>
        </Menu>
    );

    return (
        <>
            <HeaderTop>
                <Logo onClick={backToHome}>
                    <img src={logo} alt="Quick dApp Logo" />
                </Logo>

                <HeaderActions>
                    <Button
                        type="text"
                        icon={<HomeOutlined />}
                        onClick={backToHome}
                    >
                        Home
                    </Button>

                    {!account ? (
                        <Button
                            type="primary"
                            icon={<WalletOutlined />}
                            onClick={openWalletModal}
                            loading={isConnecting}
                        >
                            Connect Wallet
                        </Button>
                    ) : (
                        <Dropdown overlay={walletMenu} trigger={['click']}>
                            <AccountDisplay>
                                {network && (
                                    <NetworkBadge color={getNetworkInfo().color}>
                                        {getNetworkInfo().name}
                                    </NetworkBadge>
                                )}
                                <WalletOutlined />
                                <span className="address">{formatAddress(account)}</span>
                            </AccountDisplay>
                        </Dropdown>
                    )}
                </HeaderActions>
            </HeaderTop>

            <WalletModal
                visible={showWalletModal}
                onCancel={() => setShowWalletModal(false)}
                onConnect={handleWalletConnect}
            />
        </>
    );
}