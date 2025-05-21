import styled from 'styled-components';
import { Input, Button, notification, Alert, Typography, Form, Card, Tooltip } from 'antd';
import { InfoCircleOutlined, CheckCircleOutlined } from '@ant-design/icons';
import { useEffect, useMemo, useState } from 'react';
import { useDappContext } from '../store/contextProvider';
import { useNavigate } from 'react-router-dom';
import { ethers } from 'ethers';

const { Text, Title: AntTitle } = Typography;


const WD = styled.div`
    padding: 40px 5%;
    background-color: #ffffff;
    flex-grow: 1;
    box-shadow: 0 0 5px #e5e5e5;
    border-radius: 10px;
    max-width: 800px;
    margin: 0 auto;
`;

const Title = styled.h1`
  font-size: 24px;
  text-align: center;
  font-weight: bold;
  margin-bottom: 30px;
`;

const FormContainer = styled.div`
    margin-bottom: 30px;
`;

const FormItem = styled(Form.Item)`
    margin-bottom: 24px;
`;

const FieldLabel = styled.div`
    font-weight: 500;
    margin-bottom: 8px;
    display: flex;
    align-items: center;
    
    .required-mark {
        color: #ff4d4f;
        margin-left: 4px;
    }
    
    .info-icon {
        margin-left: 8px;
        color: #1890ff;
    }
`;

const FieldDescription = styled.div`
    color: #888;
    font-size: 12px;
    margin-bottom: 8px;
`;

const ValidationStatus = styled.div`
    display: flex;
    align-items: center;
    margin-top: 4px;
    
    &.valid {
        color: #52c41a;
    }
    
    &.invalid {
        color: #ff4d4f;
    }
`;

const ButtonContainer = styled.div`
    display: flex;
    justify-content: center;
    margin-top: 20px;
`;

export default function AppCreate() {
    const navigate = useNavigate();
    const [form] = Form.useForm();

    const [appName, setAppName] = useState('');
    const [appDesc, setAppDesc] = useState('');
    const [appAbi, setAppAbi] = useState('');
    const [contractAddress, setContractAddress] = useState('');
    const [networkName, setNetworkName] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [abiValidation, setAbiValidation] = useState({
        isValid: false,
        message: '',
        status: ''
    });
    const [addressValidation, setAddressValidation] = useState({
        isValid: false,
        message: '',
        status: ''
    });

    const { dispatch, state: { account } } = useDappContext();

    // Check for MetaMask on component mount
    useEffect(() => {
        const checkMetaMask = async () => {
            if (typeof window.ethereum === 'undefined') {
                notification.warning({
                    message: 'MetaMask Not Detected',
                    description: 'MetaMask is not installed. Some features may not work properly.',
                    duration: 10,
                });
            }
        };
        
        checkMetaMask();
    }, []);


    const onNameChange = (e) => {
        setAppName(e.target.value);
    }

    const onDescChange = (e) => {
        setAppDesc(e.target.value);
    }

    const onAbiChange = (e) => {
        const value = e.target.value;
        setAppAbi(value);
        
        // Validate ABI JSON format
        if (!value) {
            setAbiValidation({
                isValid: false,
                message: '',
                status: ''
            });
            return;
        }
        
        try {
            const parsed = JSON.parse(value);
            if (!Array.isArray(parsed)) {
                setAbiValidation({
                    isValid: false,
                    message: 'ABI must be a JSON array',
                    status: 'error'
                });
                return;
            }
            
            // Check if it contains function definitions
            const hasFunctions = parsed.some(item => item.type === 'function');
            if (!hasFunctions) {
                setAbiValidation({
                    isValid: false,
                    message: 'ABI must contain at least one function definition',
                    status: 'warning'
                });
                return;
            }
            
            setAbiValidation({
                isValid: true,
                message: 'ABI format is valid',
                status: 'success'
            });
        } catch (error) {
            setAbiValidation({
                isValid: false,
                message: 'Invalid JSON format',
                status: 'error'
            });
        }
    }

    const onAddressChange = (e) => {
        const value = e.target.value;
        setContractAddress(value);
        
        // Validate Ethereum address
        if (!value) {
            setAddressValidation({
                isValid: false,
                message: '',
                status: ''
            });
            return;
        }
        
        if (ethers.utils.isAddress(value)) {
            setAddressValidation({
                isValid: true,
                message: 'Valid Ethereum address',
                status: 'success'
            });
        } else {
            setAddressValidation({
                isValid: false,
                message: 'Invalid Ethereum address format',
                status: 'error'
            });
        }
    }

    const onNetworkNameChange = (e) => {
        setNetworkName(e.target.value);
    }

    const saveButtonDisabled = useMemo(() => {
        // Always enable in development mode for testing
        if (process.env.NODE_ENV === 'development') {
            return false;
        }
        
        // Check if required fields are valid
        if (appAbi && abiValidation.isValid && 
            contractAddress && addressValidation.isValid) {
            return false;
        }
        
        return true;
    }, [appAbi, contractAddress, abiValidation.isValid, addressValidation.isValid]);
    
    // Determine if we should show test data button
    const showTestDataButton = useMemo(() => {
        return process.env.NODE_ENV === 'development';
    }, []);
    
    // Function to fill test data
    const fillTestData = () => {
        const testAbi = '[{"inputs":[{"internalType":"string","name":"name","type":"string"},{"internalType":"string","name":"symbol","type":"string"},{"internalType":"uint256","name":"supply","type":"uint256"}],"stateMutability":"nonpayable","type":"constructor"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"owner","type":"address"},{"indexed":true,"internalType":"address","name":"spender","type":"address"},{"indexed":false,"internalType":"uint256","name":"value","type":"uint256"}],"name":"Approval","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"from","type":"address"},{"indexed":true,"internalType":"address","name":"to","type":"address"},{"indexed":false,"internalType":"uint256","name":"value","type":"uint256"}],"name":"Transfer","type":"event"},{"inputs":[{"internalType":"address","name":"owner","type":"address"},{"internalType":"address","name":"spender","type":"address"}],"name":"allowance","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"spender","type":"address"},{"internalType":"uint256","name":"amount","type":"uint256"}],"name":"approve","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"account","type":"address"}],"name":"balanceOf","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"decimals","outputs":[{"internalType":"uint8","name":"","type":"uint8"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"spender","type":"address"},{"internalType":"uint256","name":"subtractedValue","type":"uint256"}],"name":"decreaseAllowance","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"spender","type":"address"},{"internalType":"uint256","name":"addedValue","type":"uint256"}],"name":"increaseAllowance","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"user","type":"address"},{"internalType":"uint256","name":"amount","type":"uint256"}],"name":"mint","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"name","outputs":[{"internalType":"string","name":"","type":"string"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"symbol","outputs":[{"internalType":"string","name":"","type":"string"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"totalSupply","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"recipient","type":"address"},{"internalType":"uint256","name":"amount","type":"uint256"}],"name":"transfer","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"sender","type":"address"},{"internalType":"address","name":"recipient","type":"address"},{"internalType":"uint256","name":"amount","type":"uint256"}],"name":"transferFrom","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"nonpayable","type":"function"}]';
        const testAddress = '0xdAC17F958D2ee523a2206206994597C13D831ec7';
        const testName = 'My First Dapp';
        const testDesc = 'A simple ERC20 token contract';
        const testNetwork = 'homestead';
        
        setAppAbi(testAbi);
        setContractAddress(testAddress);
        setAppName(testName);
        setAppDesc(testDesc);
        setNetworkName(testNetwork);
        
        // Trigger validation
        onAbiChange({ target: { value: testAbi } });
        onAddressChange({ target: { value: testAddress } });
    };


    const saveApp = async () => {
        setIsSubmitting(true);
        
        try {
            // Check if MetaMask is installed
            if (typeof window.ethereum === 'undefined') {
                notification.error({
                    message: 'MetaMask Required',
                    description: 'MetaMask is not installed. Please install MetaMask to interact with the Ethereum blockchain.',
                    duration: 10,
                });
                return;
            }
            
            // Check if wallet is connected
            if (!account) {
                notification.warning({
                    message: 'Wallet Connection Required',
                    description: 'Please connect your wallet using the button in the header before creating a dApp.',
                    duration: 5,
                });
                return;
            }
            
            // Handle test data in development mode
            let abijson = appAbi;
            let contractAddr = contractAddress;
            let name = appName || 'Untitled dApp';
            
            // Use test data if fields are empty in development mode
            if ((!appAbi || !contractAddress) && process.env.NODE_ENV === 'development') {
                fillTestData();
                abijson = appAbi;
                contractAddr = contractAddress;
            }
            
            // Validate required fields
            if (!abijson) {
                notification.error({
                    message: 'Missing ABI',
                    description: 'Please provide a valid contract ABI.',
                });
                return;
            }
            
            if (!contractAddr) {
                notification.error({
                    message: 'Missing Contract Address',
                    description: 'Please provide a valid contract address.',
                });
                return;
            }
            
            if (!ethers.utils.isAddress(contractAddr)) {
                notification.error({
                    message: 'Invalid Address',
                    description: 'The contract address format is invalid.',
                });
                return;
            }
            
            // Validate ABI JSON format
            try {
                JSON.parse(abijson);
            } catch (error) {
                notification.error({
                    message: 'Invalid ABI Format',
                    description: 'The ABI is not a valid JSON. Please check the format.',
                });
                return;
            }
            
            // Optional network validation
            if (networkName) {
                const validNetworks = ['homestead', 'mainnet', 'goerli', 'sepolia', 'rinkeby', 'ropsten', 'kovan', 'polygon', 'mumbai', 'arbitrum', 'optimism'];
                if (!validNetworks.includes(networkName.toLowerCase()) && !networkName.startsWith('http')) {
                    notification.warning({
                        message: 'Network Warning',
                        description: `"${networkName}" is not a recognized network name. Make sure it's correct.`,
                    });
                }
            }
            
            // Dispatch data to context
            dispatch({
                type: 'set_appData',
                payload: {
                    appName: name,
                    appDesc,
                    appAbi: abijson,
                    appNetwork: networkName,
                    appAddress: contractAddr,
                }
            });
            
            notification.success({
                message: 'dApp Created',
                description: 'Your dApp has been created successfully!',
            });
            
            // Navigate to detail page
            navigate('/detail');
            
        } catch (error) {
            console.error('Error creating dApp:', error);
            notification.error({
                message: 'Error',
                description: `Failed to create dApp: ${error.message}`,
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <WD>
            <Title>Create your dApp</Title>
            
            {!account && (
                <Alert
                    message="Wallet Not Connected"
                    description="Please connect your wallet using the button in the header to create and interact with dApps."
                    type="warning"
                    showIcon
                    style={{ marginBottom: '20px' }}
                />
            )}
            
            <Form form={form} layout="vertical">
                <FormContainer>
                    <FormItem>
                        <FieldLabel>Name</FieldLabel>
                        <Input 
                            placeholder="My Awesome Dapp" 
                            value={appName} 
                            onChange={onNameChange} 
                        />
                    </FormItem>
                    
                    <FormItem>
                        <FieldLabel>Description</FieldLabel>
                        <Input.TextArea 
                            placeholder="A brief description of what your dApp does" 
                            value={appDesc} 
                            onChange={onDescChange} 
                            rows={2}
                        />
                    </FormItem>
                    
                    <FormItem>
                        <FieldLabel>
                            Contract ABI
                            <span className="required-mark">*</span>
                            <Tooltip title="The Application Binary Interface (ABI) defines how to interact with the smart contract. You can get this from your contract compilation or from Etherscan.">
                                <InfoCircleOutlined className="info-icon" />
                            </Tooltip>
                        </FieldLabel>
                        <Input.TextArea 
                            placeholder='[{"inputs":[],"name":"myFunction","outputs":[],"stateMutability":"view","type":"function"}]' 
                            value={appAbi} 
                            onChange={onAbiChange} 
                            rows={4}
                            status={abiValidation.status === 'error' ? 'error' : ''}
                        />
                        {abiValidation.message && (
                            <ValidationStatus className={abiValidation.isValid ? 'valid' : 'invalid'}>
                                {abiValidation.isValid ? <CheckCircleOutlined /> : null}
                                <span style={{ marginLeft: '5px' }}>{abiValidation.message}</span>
                            </ValidationStatus>
                        )}
                    </FormItem>
                    
                    <FormItem>
                        <FieldLabel>
                            Contract Address
                            <span className="required-mark">*</span>
                            <Tooltip title="The Ethereum address where your smart contract is deployed.">
                                <InfoCircleOutlined className="info-icon" />
                            </Tooltip>
                        </FieldLabel>
                        <Input 
                            placeholder="0x..." 
                            value={contractAddress} 
                            onChange={onAddressChange} 
                            status={addressValidation.status === 'error' ? 'error' : ''}
                        />
                        {addressValidation.message && (
                            <ValidationStatus className={addressValidation.isValid ? 'valid' : 'invalid'}>
                                {addressValidation.isValid ? <CheckCircleOutlined /> : null}
                                <span style={{ marginLeft: '5px' }}>{addressValidation.message}</span>
                            </ValidationStatus>
                        )}
                    </FormItem>
                    
                    <FormItem>
                        <FieldLabel>
                            Network Name
                            <Tooltip title="Specify the network where your contract is deployed. Use 'homestead' for Ethereum mainnet, or network names like 'goerli', 'sepolia', etc.">
                                <InfoCircleOutlined className="info-icon" />
                            </Tooltip>
                        </FieldLabel>
                        <FieldDescription>
                            Use "homestead" for Ethereum mainnet. Leave blank for a custom network.
                        </FieldDescription>
                        <Input 
                            placeholder="goerli" 
                            value={networkName} 
                            onChange={onNetworkNameChange} 
                        />
                    </FormItem>
                </FormContainer>
                
                <ButtonContainer>
                    {showTestDataButton && (
                        <Button 
                            onClick={fillTestData} 
                            style={{ marginRight: '10px' }}
                        >
                            Fill Test Data
                        </Button>
                    )}
                    
                    <Button 
                        type="primary" 
                        onClick={saveApp} 
                        disabled={saveButtonDisabled}
                        loading={isSubmitting}
                        size="large"
                    >
                        Create dApp
                    </Button>
                </ButtonContainer>
            </Form>
        </WD>
    );
}