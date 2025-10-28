import styled from 'styled-components';
import { Input, Button, notification, Spin, Divider } from 'antd';
import { useEffect, useState, useRef } from 'react';
import { useDappContext } from '../store/contextProvider';
import { ethers } from 'ethers';
import ResultDisplay from './ResultDisplay';
import { getProvider } from '../utils/walletUtils';

// const StyleMethods = styled.div`

// `

const MButtonBox = styled.div`
    display: flex;
    justify-content: center;
`;

const MButton = styled(Button)`
    margin: 10px auto 20px;
`
const MName = styled.div`
    font-size: 1.5em;
    text-align: center;
    font-weight: bold;
    border-bottom: 1px solid #DDDDDD;
    padding-bottom: 10px;
`;

const List = styled.ul`
    margin-top: 10px;
    li {
        margin-bottom: 10px;
    }
`

export default function AppMethod({ itemData, contract }) {

    const { state } = useDappContext();
    const { appData: { appAbi } } = state;
    const [methodInputs, setMethodInputs] = useState([]);
    const [methodValues, setMethodValues] = useState([]);
    const [methodStateMutability, setMethodStateMutability] = useState('');
    const [methodName, setMethodName] = useState('');
    const [payableValue, setPayableValue] = useState('0');
    
    // Result state management
    const [callResult, setCallResult] = useState('');
    const [displayResult, setDisplayResult] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [resultType, setResultType] = useState(null); // 'success', 'error', or null
    const [showResult, setShowResult] = useState(false);
    const [transactionHash, setTransactionHash] = useState(null);
    const [blockNumber, setBlockNumber] = useState(null);
    const [chainId, setChainId] = useState(null);

    // Use a ref to track if component is mounted
    const isMounted = useRef(true);

    // Set isMounted to false when component unmounts
    useEffect(() => {
        return () => {
            isMounted.current = false;
        };
    }, []);

    // Fetch chain ID for block explorer links
    useEffect(() => {
        const fetchChainId = async () => {
            try {
                const walletProvider = getProvider();
                if (walletProvider) {
                    const provider = new ethers.BrowserProvider(walletProvider);
                    const network = await provider.getNetwork();
                    setChainId(Number(network.chainId));
                }
            } catch (error) {
                console.error('Error fetching chain ID:', error);
            }
        };
        fetchChainId();
    }, []);

    // Store the previous itemData to detect actual changes
    const prevItemDataRef = useRef('');
    
    useEffect(() => {
        console.log('useEffect triggered - itemData:', itemData, 'prevItemData:', prevItemDataRef.current);

        // Only reset results if the method actually changed
        if (itemData !== prevItemDataRef.current) {
            console.log('Method changed from', prevItemDataRef.current, 'to', itemData);
            console.log('Resetting result state');
            prevItemDataRef.current = itemData;

            // Reset result when method changes
            setCallResult('');
            setDisplayResult('');
            setResultType(null);
            setShowResult(false);
        } else {
            console.log('Method did not change, keeping existing results');
        }

        if (!itemData) return;

        try {
            let name = itemData.split('(')[0];
            setMethodName(name);

            let method = JSON.parse(appAbi).filter(e => e.name === name)[0];
            if (!method) {
                notification.error({
                    message: 'Method Error',
                    description: `Method ${name} not found in ABI`,
                });
                return;
            }

            setMethodInputs(method.inputs);
            setMethodValues(method.inputs.map(e => null));
            setMethodStateMutability(method.stateMutability);
        } catch (error) {
            notification.error({
                message: 'Error',
                description: `Failed to parse method: ${error.message}`,
            });
        }
    }, [itemData, appAbi]);

    const formatTypeValue = (type, value) => {
        if (!value && value !== 0) {
            throw new Error(`Value for type ${type} is empty or undefined`);
        }
        
        if (type.startsWith("uint") || type.startsWith("int")) {
            try {
                return BigInt(value.toString());
            } catch (error) {
                throw new Error(`Invalid number format for ${type}: ${error.message}`);
            }
        } else if (type.endsWith("[]")) {
            try {
                const list = JSON.parse(value);
                if (!Array.isArray(list)) {
                    throw new Error(`Expected array for type ${type}`);
                }
                const itemType = type.replace("[]", "");
                return list.map(item => formatTypeValue(itemType, item));
            } catch (error) {
                throw new Error(`Invalid array format for ${type}: ${error.message}`);
            }
        } else if (type === "address") {
            if (!ethers.isAddress(value)) {
                throw new Error(`Invalid Ethereum address: ${value}`);
            }
            return value;
        } else if (type === "bool") {
            const lowerValue = value.toString().toLowerCase();
            if (!(lowerValue === 'true' || lowerValue === 'false' || lowerValue === '1' || lowerValue === '0')) {
                throw new Error(`Invalid boolean value: ${value}. Use true/false or 1/0`);
            }
            return lowerValue === 'true' || lowerValue === '1';
        } else {
            return value;
        }
    }

    const onValueChange = (e, index) => {
        const values = [...methodValues];
        values[index] = e.target.value;
        setMethodValues(values);
    }
    
    const onPayableValueChange = (e) => {
        const value = e.target.value;
        // Only allow numbers and decimals
        if (value === '' || /^\d*\.?\d*$/.test(value)) {
            setPayableValue(value);
        }
    }

    const onSubmit = async () => {
        console.log('=== onSubmit called ===');
        console.log('Method name:', methodName);
        console.log('Method inputs:', methodInputs);
        console.log('Method values:', methodValues);
        console.log('Contract exists:', !!contract);

        setIsLoading(true);
        setCallResult('');
        setDisplayResult('');
        setShowResult(false);
        setResultType(null);

        try {
            // Check if contract is initialized
            if (!contract) {
                throw new Error('Contract is not initialized. Please wait or refresh the page.');
            }

            // Parse the ABI to get the method details
            const method = JSON.parse(appAbi).find(e => e.name === methodName);
            if (!method) {
                throw new Error(`Method ${methodName} not found in ABI`);
            }

            console.log('Method details:', method);
            
            // Validate all inputs before proceeding
            const values = [];
            for (let i = 0; i < method.inputs.length; i++) {
                const inputDef = method.inputs[i];
                const inputValue = methodValues[i];
                
                // Check if required inputs are provided
                if (inputValue === null || inputValue === undefined || inputValue === '') {
                    throw new Error(`Parameter ${inputDef.name || i+1} (${inputDef.type}) is required`);
                }
                
                try {
                    values.push(formatTypeValue(inputDef.type, inputValue));
                } catch (error) {
                    throw new Error(`Parameter ${inputDef.name || i+1}: ${error.message}`);
                }
            }
            
            // Execute the contract call based on method type
            if (method?.type === "function") {
                // Read-only function call
                if (method.stateMutability === "view" || method.stateMutability === "pure") {
                    try {
                        console.log('Calling view function:', methodName, 'with values:', values);
                        const result = await contract[methodName](...values);
                        console.log('Raw result:', result);
                        
                        // Format the result based on its type
                        let formattedResult;

                        // In ethers v6, results can be:
                        // - Direct value for single return
                        // - Result object (array-like) for multiple returns
                        // - Result object with named properties
                        let actualResult;

                        if (result && typeof result === 'object' && result.length !== undefined && result.length > 0) {
                            // Result object with multiple values - extract first value for single returns
                            actualResult = result.length === 1 ? result[0] : result;
                        } else {
                            // Direct value
                            actualResult = result;
                        }

                        console.log('Actual result after extraction:', actualResult, 'Type:', typeof actualResult);

                        // Handle different result types
                        if (actualResult === undefined) {
                            formattedResult = 'No return value';
                        } else if (actualResult === null) {
                            formattedResult = 'null';
                        } else if (typeof actualResult === 'bigint') {
                            // BigInt handling (ethers v6 uses native BigInt)
                            formattedResult = actualResult.toString();
                        } else if (Array.isArray(actualResult)) {
                            // Handle array results (multiple return values)
                            const formatted = actualResult.map(item =>
                                typeof item === 'bigint' ? item.toString() : item
                            );
                            formattedResult = JSON.stringify(formatted, null, 2);
                        } else if (typeof actualResult === 'boolean') {
                            formattedResult = actualResult.toString();
                        } else if (typeof actualResult === 'object' && actualResult.length !== undefined) {
                            // Result object - convert to array
                            const arr = [];
                            for (let i = 0; i < actualResult.length; i++) {
                                arr.push(actualResult[i]);
                            }
                            const formatted = arr.map(item =>
                                typeof item === 'bigint' ? item.toString() : item
                            );
                            formattedResult = JSON.stringify(formatted, null, 2);
                        } else if (typeof actualResult === 'object') {
                            try {
                                // Convert bigints in objects to strings for JSON
                                const replacer = (key, value) =>
                                    typeof value === 'bigint' ? value.toString() : value;
                                formattedResult = JSON.stringify(actualResult, replacer, 2);
                            } catch (e) {
                                formattedResult = 'Complex object: ' + Object.prototype.toString.call(actualResult);
                            }
                        } else if (typeof actualResult === 'string') {
                            formattedResult = actualResult;
                        } else {
                            formattedResult = String(actualResult);
                        }
                        
                        console.log('Formatted result:', formattedResult);

                        // Ensure we have a string for display
                        const finalResult = String(formattedResult);
                        console.log('Final result value:', finalResult);
                        console.log('Final result type:', typeof finalResult);
                        console.log('Final result length:', finalResult.length);

                        // Update state - React 18 will batch these automatically
                        console.log('About to update state, isMounted:', isMounted.current);
                        // Remove isMounted check - React 18 handles unmounted updates safely
                        console.log('Updating state with result:', finalResult);
                        setIsLoading(false);
                        setCallResult(finalResult);
                        setDisplayResult(finalResult);
                        setResultType('success');
                        setShowResult(true);
                        console.log('State update calls completed');

                        notification.success({
                            message: 'Call Successful',
                            description: 'The read operation completed successfully.'
                        });
                    } catch (error) {
                        console.error('Error calling view function:', error);
                        // Remove isMounted check - React 18 handles this safely
                        setIsLoading(false);
                        setCallResult(error.message);
                        setDisplayResult(error.message);
                        setResultType('error');
                        setShowResult(true);

                        notification.error({
                            message: 'Call Failed',
                            description: `Error: ${error.message}`
                        });
                    }
                }
                
                // State-changing function call (non-payable)
                else if (method.stateMutability === "nonpayable") {
                    const tx = await contract[methodName](...values);
                    
                    notification.info({
                        message: 'Transaction Submitted',
                        description: 'Waiting for confirmation...'
                    });

                    const receipt = await tx.wait();

                    const txResult = `Transaction confirmed in block ${receipt.blockNumber}\nTransaction hash: ${receipt.transactionHash}`;
                    setCallResult(txResult);
                    setDisplayResult(txResult);
                    setResultType('success');
                    setShowResult(true);
                    setTransactionHash(receipt.transactionHash);
                    setBlockNumber(receipt.blockNumber);

                    notification.success({
                        message: 'Transaction Confirmed',
                        description: `Transaction completed in block ${receipt.blockNumber}`
                    });
                }
                
                // Payable function call
                else if (method.stateMutability === "payable") {
                    // Validate ETH value
                    if (!payableValue || isNaN(parseFloat(payableValue))) {
                        throw new Error('Please enter a valid ETH amount');
                    }

                    const tx = await contract[methodName](
                        ...values,
                        { value: ethers.parseEther(payableValue) }
                    );

                    notification.info({
                        message: 'Transaction Submitted',
                        description: `Sending ${payableValue} ETH. Waiting for confirmation...`
                    });

                    const receipt = await tx.wait();

                    const txResult = `Transaction confirmed in block ${receipt.blockNumber}\nTransaction hash: ${receipt.transactionHash}\nSent ${payableValue} ETH`;
                    setCallResult(txResult);
                    setDisplayResult(txResult);
                    setResultType('success');
                    setShowResult(true);
                    setTransactionHash(receipt.transactionHash);
                    setBlockNumber(receipt.blockNumber);
                    
                    notification.success({
                        message: 'Transaction Confirmed',
                        description: `Transaction with ${payableValue} ETH completed in block ${receipt.blockNumber}`
                    });
                }
            } else {
                throw new Error(`Unsupported method type: ${method.type}`);
            }
        } catch (error) {
            console.error('Contract interaction error:', error);
            setCallResult(error.message);
            setDisplayResult(error.message);
            setResultType('error');
            setShowResult(true);

            notification.error({
                message: 'Error',
                description: error.message
            });
        } finally {
            setIsLoading(false);
        }
    }

    // For debugging
    useEffect(() => {
        console.log('Result state:', {
            callResult,
            displayResult,
            resultType,
            showResult
        });
    }, [callResult, displayResult, resultType, showResult]);
    
    return <div>
        <MName>{itemData}</MName>
        <div>
            <List>
                {methodInputs.map((item, index) => (
                    <li key={`method_${index}`}>
                        <div>{item.name || `Parameter ${index+1}`} <span style={{color: '#999'}}>({item.type})</span></div>
                        <div>
                            <Input 
                                placeholder={item.type} 
                                value={methodValues[index] || ''} 
                                onChange={(e) => onValueChange(e, index)} 
                                status={methodValues[index] === '' ? 'error' : ''}
                            />
                        </div>
                    </li>
                ))}
                { methodStateMutability === "payable" && (
                    <li key='ether_value'>
                        <div>ETH Value</div>
                        <div>
                            <Input 
                                placeholder='0' 
                                value={payableValue} 
                                onChange={onPayableValueChange} 
                                addonAfter="ETH"
                            />
                        </div>
                    </li>
                )}
            </List>
        </div>
        <MButtonBox>
            <MButton 
                type='primary' 
                onClick={onSubmit} 
                loading={isLoading}
                disabled={isLoading || (methodInputs.length > 0 && methodValues.some(v => v === null || v === undefined || v === ''))}
            >
                {isLoading ? 'PROCESSING' : 'SUBMIT'}
            </MButton>
        </MButtonBox>
        
        {isLoading && (
            <div style={{ textAlign: 'center', marginTop: '20px' }}>
                <Spin tip="Processing transaction..." />
            </div>
        )}
                {/* Result section */}
        <Divider style={{ margin: '20px 0 10px' }} />

        {showResult ? (
            <ResultDisplay
                result={displayResult || callResult}
                isError={resultType === 'error'}
                transactionHash={transactionHash}
                blockNumber={blockNumber}
                chainId={chainId}
                methodName={methodName}
            />
        ) : (
            <div style={{ color: '#999', padding: '10px 0', textAlign: 'center' }}>
                {isLoading ? 'Processing transaction...' : 'No result yet. Click Submit to call the function.'}
            </div>
        )}
    </div>
}