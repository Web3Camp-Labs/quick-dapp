import styled from 'styled-components';
import { Input, Button, notification, Alert, Form, Tooltip } from 'antd';
import { InfoCircleOutlined, CheckCircleOutlined } from '@ant-design/icons';
import { useEffect, useMemo, useState } from 'react';
import { useDappContext } from '../store/contextProvider';
import { useNavigate } from 'react-router-dom';
import { ethers } from 'ethers';
import { saveDapp } from '../utils/storage';


const WD = styled.div`
    padding: 2em 2em;
    background: linear-gradient(180deg, #ffffff 0%, #f8f9fa 100%);
    width: 100vw;
    flex-grow: 1;
    min-height: calc(100vh - 64px);

    @media (max-width: 768px) {
        padding: 1.5em 1em;
    }
`;

const PageContainer = styled.div`
    max-width: 900px;
    margin: 0 auto;
`;

const HeaderSection = styled.div`
    text-align: center;
    margin-bottom: 1.2em;
`;

const Title = styled.h1`
    font-size: 1.4rem;
    font-weight: 700;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    margin-bottom: 4px;

    @media (max-width: 768px) {
        font-size: 1.3rem;
    }
`;

const FormCard = styled.div`
    background: #ffffff;
    border-radius: 12px;
    padding: 2em;
    box-shadow: 0 8px 30px rgba(0, 0, 0, 0.08);
    border: 2px solid transparent;
    background: linear-gradient(white, white) padding-box,
                linear-gradient(135deg, rgba(102, 126, 234, 0.2) 0%, rgba(118, 75, 162, 0.2) 100%) border-box;

    @media (max-width: 768px) {
        padding: 1.5em 1.2em;
    }
`;

const FormContainer = styled.div`
    margin-bottom: 24px;
`;

const FormItem = styled(Form.Item)`
    margin-bottom: 20px;
`;

const FieldLabel = styled.div`
    font-weight: 600;
    font-size: 14px;
    color: #2d3748;
    margin-bottom: 8px;
    display: flex;
    align-items: center;

    .required-mark {
        color: #667eea;
        margin-left: 4px;
        font-size: 16px;
    }

    .info-icon {
        margin-left: 8px;
        color: #667eea;
        cursor: help;
        transition: all 0.3s ease;

        &:hover {
            color: #764ba2;
            transform: scale(1.1);
        }
    }
`;

const FieldDescription = styled.div`
    color: #718096;
    font-size: 13px;
    margin-bottom: 8px;
    line-height: 1.5;
`;

const StyledInput = styled(Input)`
    border-radius: 8px;
    border: 2px solid #e2e8f0;
    padding: 10px 14px;
    font-size: 14px;
    transition: all 0.3s ease;

    &:hover {
        border-color: #667eea;
    }

    &:focus {
        border-color: #667eea;
        box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
    }
`;

const StyledTextArea = styled(Input.TextArea)`
    border-radius: 8px;
    border: 2px solid #e2e8f0;
    padding: 10px 14px;
    font-size: 14px;
    transition: all 0.3s ease;

    &:hover {
        border-color: #667eea;
    }

    &:focus {
        border-color: #667eea;
        box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
    }
`;

const ValidationStatus = styled.div`
    display: flex;
    align-items: center;
    margin-top: 8px;
    font-size: 13px;
    font-weight: 500;

    &.valid {
        color: #48bb78;
    }

    &.invalid {
        color: #f56565;
    }

    svg {
        margin-right: 6px;
    }
`;

const ButtonContainer = styled.div`
    display: flex;
    justify-content: center;
    gap: 16px;
    margin-top: 30px;
`;

const CreateButton = styled(Button)`
    height: 45px;
    font-size: 15px;
    font-weight: 600;
    padding: 0 36px;
    border-radius: 22px;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    border: none;
    box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
    transition: all 0.3s ease;

    &:hover:not(:disabled) {
        transform: translateY(-2px);
        box-shadow: 0 6px 20px rgba(102, 126, 234, 0.5);
        background: linear-gradient(135deg, #764ba2 0%, #667eea 100%) !important;
    }

    &:active {
        transform: translateY(0);
    }

    &:disabled {
        background: #cbd5e0;
        box-shadow: none;
    }
`;

const TestButton = styled(Button)`
    height: 45px;
    font-size: 15px;
    font-weight: 600;
    padding: 0 32px;
    border-radius: 22px;
    border: 2px solid #667eea;
    color: #667eea;
    background: transparent;
    transition: all 0.3s ease;

    &:hover {
        background: rgba(102, 126, 234, 0.1);
        border-color: #764ba2;
        color: #764ba2;
        transform: translateY(-2px);
    }
`;

const StyledAlert = styled(Alert)`
    border-radius: 10px;
    border: 2px solid #fbd38d;
    margin-bottom: 20px;
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
        
        if (ethers.isAddress(value)) {
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
            
            if (!ethers.isAddress(contractAddr)) {
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
            
            const dappData = {
                appName: name,
                appDesc,
                appAbi: abijson,
                appNetwork: networkName,
                appAddress: contractAddr,
            };

            // Dispatch data to context
            dispatch({
                type: 'set_appData',
                payload: dappData
            });

            // Save to localStorage
            const saved = saveDapp(dappData);

            notification.success({
                message: 'dApp Created',
                description: saved
                    ? 'Your dApp has been created and saved successfully!'
                    : 'Your dApp has been created successfully! (Note: Could not save to browser storage)',
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
            <PageContainer>
                <HeaderSection>
                    <Title>Create Your dApp</Title>
                </HeaderSection>

                {!account && (
                    <StyledAlert
                        message="Wallet Not Connected"
                        description="Please connect your wallet using the button in the header to create and interact with dApps."
                        type="warning"
                        showIcon
                    />
                )}

                <FormCard>
                    <Form form={form} layout="vertical">
                        <FormContainer>
                            <FormItem>
                                <FieldLabel>Name</FieldLabel>
                                <FieldDescription>
                                    Give your dApp a memorable name (optional)
                                </FieldDescription>
                                <StyledInput
                                    placeholder="My Awesome dApp"
                                    value={appName}
                                    onChange={onNameChange}
                                    size="large"
                                />
                            </FormItem>

                            <FormItem>
                                <FieldLabel>Description</FieldLabel>
                                <FieldDescription>
                                    Briefly describe what your dApp does (optional)
                                </FieldDescription>
                                <StyledTextArea
                                    placeholder="A decentralized application for..."
                                    value={appDesc}
                                    onChange={onDescChange}
                                    rows={3}
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
                                <FieldDescription>
                                    Paste the JSON ABI from your contract compilation or block explorer
                                </FieldDescription>
                                <StyledTextArea
                                    placeholder='[{"inputs":[],"name":"myFunction","outputs":[],"stateMutability":"view","type":"function"}]'
                                    value={appAbi}
                                    onChange={onAbiChange}
                                    rows={6}
                                    status={abiValidation.status === 'error' ? 'error' : ''}
                                />
                                {abiValidation.message && (
                                    <ValidationStatus className={abiValidation.isValid ? 'valid' : 'invalid'}>
                                        {abiValidation.isValid && <CheckCircleOutlined />}
                                        <span>{abiValidation.message}</span>
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
                                <FieldDescription>
                                    Enter the deployed contract address (starts with 0x)
                                </FieldDescription>
                                <StyledInput
                                    placeholder="0x1234567890abcdef1234567890abcdef12345678"
                                    value={contractAddress}
                                    onChange={onAddressChange}
                                    status={addressValidation.status === 'error' ? 'error' : ''}
                                    size="large"
                                />
                                {addressValidation.message && (
                                    <ValidationStatus className={addressValidation.isValid ? 'valid' : 'invalid'}>
                                        {addressValidation.isValid && <CheckCircleOutlined />}
                                        <span>{addressValidation.message}</span>
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
                                    Use "homestead" for Ethereum mainnet, or specify testnet name (goerli, sepolia, etc.)
                                </FieldDescription>
                                <StyledInput
                                    placeholder="homestead"
                                    value={networkName}
                                    onChange={onNetworkNameChange}
                                    size="large"
                                />
                            </FormItem>
                        </FormContainer>

                        <ButtonContainer>
                            {showTestDataButton && (
                                <TestButton
                                    onClick={fillTestData}
                                >
                                    Fill Test Data
                                </TestButton>
                            )}

                            <CreateButton
                                type="primary"
                                onClick={saveApp}
                                disabled={saveButtonDisabled}
                                loading={isSubmitting}
                            >
                                Create dApp
                            </CreateButton>
                        </ButtonContainer>
                    </Form>
                </FormCard>
            </PageContainer>
        </WD>
    );
}