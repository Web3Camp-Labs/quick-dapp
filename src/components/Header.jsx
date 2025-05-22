import { Button, notification, Tooltip, Dropdown, Menu, Typography } from 'antd';
import { WalletOutlined, DisconnectOutlined, CopyOutlined, HomeOutlined } from '@ant-design/icons';
import { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import logo from '../res/quick-dapp.png';
import { useDappContext } from '../store/contextProvider';
import { ethers } from 'ethers';

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

const LogoText = styled(Typography.Title)`
    margin: 0 0 0 10px !important;
    font-size: 18px !important;
    
    @media (max-width: 768px) {
        font-size: 16px !important;
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
    const [copied, setCopied] = useState(false);

    const { dispatch, state } = useDappContext();
    const navigate = useNavigate();

    // Check if account is already connected on component mount
    useEffect(() => {
        const checkConnection = async () => {
            if (typeof window.ethereum !== 'undefined') {
                try {
                    // Get current accounts
                    const accounts = await window.ethereum.request({ method: 'eth_accounts' });
                    if (accounts.length > 0) {
                        setAccount(accounts[0]);
                        dispatch({ type: 'set_account', payload: accounts[0] });
                        
                        // Get current network
                        await updateNetworkInfo();
                    }
                    
                    // Listen for account changes
                    window.ethereum.on('accountsChanged', handleAccountsChanged);
                    
                    // Listen for network changes
                    window.ethereum.on('chainChanged', handleChainChanged);
                } catch (error) {
                    console.error('Error checking wallet connection:', error);
                }
            }
        };
        
        checkConnection();
        
        // Cleanup listeners on unmount
        return () => {
            if (window.ethereum) {
                window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
                window.ethereum.removeListener('chainChanged', handleChainChanged);
            }
        };
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
        if (typeof window.ethereum !== 'undefined') {
            try {
                const provider = new ethers.providers.Web3Provider(window.ethereum);
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
    
    // Connect wallet
    const connectWallet = async () => {
        if (typeof window.ethereum === 'undefined') {
            notification.error({
                message: 'MetaMask Required',
                description: 'Please install MetaMask to connect your wallet.',
                duration: 10,
                btn: (
                    <Button type="primary" onClick={() => window.open('https://metamask.io/download.html', '_blank')}>
                        Install MetaMask
                    </Button>
                ),
            });
            return;
        }
        
        setIsConnecting(true);
        
        try {
            const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
            setAccount(accounts[0]);
            dispatch({ type: 'set_account', payload: accounts[0] });
            
            await updateNetworkInfo();
            
            notification.success({
                message: 'Wallet Connected',
                description: 'Your wallet has been successfully connected!',
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
    
    // Disconnect wallet (for UI purposes)
    const disconnectWallet = () => {
        setAccount('');
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
            <Menu.Item key="copy" onClick={copyAddress} icon={<CopyOutlined />}>
                Copy Address
            </Menu.Item>
            <Menu.Item key="disconnect" onClick={disconnectWallet} icon={<DisconnectOutlined />}>
                Disconnect
            </Menu.Item>
        </Menu>
    );

    return (
        <HeaderTop>
            <Logo onClick={backToHome}>
                <img src={logo} alt="Quick dApp Logo" />
                <LogoText level={4}>Quick dApp</LogoText>
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
                        onClick={connectWallet} 
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
    )
}