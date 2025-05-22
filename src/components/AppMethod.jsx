import styled from 'styled-components';
import { Input, Button, notification, Spin, Typography, Divider } from 'antd';
import { useEffect, useState, useRef } from 'react';
import { useDappContext } from '../store/contextProvider';
import { ethers } from 'ethers';

const { Text } = Typography;

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

const ResultContainer = styled.div`
    margin-top: 15px;
    padding: 15px;
    border-radius: 5px;
    background-color: #f9f9f9;
    word-break: break-all;
    border: 1px solid #e8e8e8;
`;

const ErrorText = styled(Text)`
    color: #ff4d4f;
    font-size: 14px;
`;

const SuccessText = styled(Text)`
    color: #52c41a;
    font-size: 14px;
    white-space: pre-wrap;
`;

const ResultTitle = styled.div`
    font-weight: bold;
    margin-bottom: 10px;
    display: flex;
    justify-content: space-between;
    align-items: center;
`;

const ResultValue = styled.div`
    background-color: white;
    padding: 10px;
    border-radius: 4px;
    border: 1px solid #eee;
    margin-top: 5px;
    max-height: 200px;
    overflow-y: auto;
    font-family: monospace;
`;

export default function AppMethod({ itemData, contract }) {

    const { state } = useDappContext();
    const { appData: { appName, appDesc, appAbi, appNetwork, appAddress } } = state;
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
    
    // Use a ref to track if component is mounted
    const isMounted = useRef(true);

    // Set isMounted to false when component unmounts
    useEffect(() => {
        return () => {
            isMounted.current = false;
        };
    }, []);
    
    // Store the previous itemData to detect actual changes
    const prevItemDataRef = useRef('');
    
    useEffect(() => {
        // Only reset results if the method actually changed
        if (itemData !== prevItemDataRef.current) {
            console.log('Method changed from', prevItemDataRef.current, 'to', itemData);
            prevItemDataRef.current = itemData;
            
            // Reset result when method changes
            setCallResult('');
            setDisplayResult('');
            setResultType(null);
            setShowResult(false);
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
                return ethers.BigNumber.from(value.toString());
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
            if (!ethers.utils.isAddress(value)) {
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
        setIsLoading(true);
        setCallResult('');
        setDisplayResult('');
        setShowResult(false);
        setResultType(null);
        
        try {
            // Parse the ABI to get the method details
            const method = JSON.parse(appAbi).find(e => e.name === methodName);
            if (!method) {
                throw new Error(`Method ${methodName} not found in ABI`);
            }
            
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
                        const result = await contract.functions[methodName](...values);
                        console.log('Raw result:', result);
                        
                        // Format the result based on its type
                        let formattedResult;
                        
                        // Handle different result types
                        if (result[0] === undefined) {
                            formattedResult = 'No return value';
                        } else if (result[0] === null) {
                            formattedResult = 'null';
                        } else if (result[0] instanceof ethers.BigNumber) {
                            // Check if it might be representing ETH
                            if (method.outputs && method.outputs[0] && 
                                (method.outputs[0].type.includes('uint') || method.outputs[0].name.toLowerCase().includes('balance'))) {
                                formattedResult = `${result[0].toString()}`;
                            } else {
                                formattedResult = result[0].toString();
                            }
                        } else if (Array.isArray(result[0])) {
                            formattedResult = JSON.stringify(result[0], null, 2);
                        } else if (typeof result[0] === 'boolean') {
                            formattedResult = result[0].toString();
                        } else if (typeof result[0] === 'object') {
                            try {
                                formattedResult = JSON.stringify(result[0], null, 2);
                            } catch (e) {
                                formattedResult = 'Complex object: ' + Object.prototype.toString.call(result[0]);
                            }
                        } else if (typeof result[0] === 'string') {
                            formattedResult = result[0];
                        } else {
                            formattedResult = String(result[0]);
                        }
                        
                        console.log('Formatted result:', formattedResult);
                        // Make sure we're setting a string value that can be displayed
                        let displayResult;
                        if (formattedResult === undefined) {
                            displayResult = 'No result';
                        } else if (formattedResult === null) {
                            displayResult = 'null';
                        } else if (typeof formattedResult === 'object') {
                            try {
                                displayResult = JSON.stringify(formattedResult, null, 2);
                            } catch (e) {
                                displayResult = 'Complex object (see console)';
                            }
                        } else {
                            // Ensure we have a string
                            displayResult = String(formattedResult);
                        }
                        
                        // Debug the actual value
                        console.log('Display result type:', typeof displayResult);
                        console.log('Display result value:', displayResult);
                        
                        console.log('Setting call result to:', displayResult);
                        // Force a string value and ensure it's not empty
                        const finalResult = displayResult || 'Empty result';
                        console.log('Final result value:', finalResult, 'type:', typeof finalResult);
                        
                        // Make sure component is still mounted before updating state
                        if (isMounted.current) {
                            // Create a global variable for debugging
                            window.lastResult = finalResult;
                        
                        // Update state in a specific order to ensure UI updates
                        setIsLoading(false);
                        
                        // Use a single state update batch with a timeout to avoid React batching issues
                        setTimeout(() => {
                            if (isMounted.current) {
                                setResultType('success');
                                setDisplayResult(finalResult);
                                setCallResult(finalResult);
                                setShowResult(true);
                                
                                // Create a direct DOM element to show the result
                                const debugElement = document.getElementById('debug-result');
                                if (debugElement) {
                                    debugElement.textContent = finalResult;
                                }
                            }
                        }, 0);
                        }
                        
                        notification.success({
                            message: 'Call Successful',
                            description: 'The read operation completed successfully.'
                        });
                    } catch (error) {
                        console.error('Error calling view function:', error);
                        if (isMounted.current) {
                            setDisplayResult(error.message);
                            setCallResult(error.message);
                            setShowResult(true);
                            setResultType('error');
                            
                            // Force a UI update with a small timeout
                            setTimeout(() => {
                                if (isMounted.current) {
                                    setShowResult(true);
                                }
                            }, 50);
                        }
                        
                        notification.error({
                            message: 'Call Failed',
                            description: `Error: ${error.message}`
                        });
                    }
                }
                
                // State-changing function call (non-payable)
                else if (method.stateMutability === "nonpayable") {
                    const result = await contract.functions[methodName](...values);
                    
                    notification.info({
                        message: 'Transaction Submitted',
                        description: 'Waiting for confirmation...'
                    });
                    
                    const receipt = await result.wait();
                    
                    const txResult = `Transaction confirmed in block ${receipt.blockNumber}\nTransaction hash: ${receipt.transactionHash}`;
                    if (isMounted.current) {
                        setCallResult(txResult);
                        setDisplayResult(txResult);
                        setResultType('success');
                        setShowResult(true);
                        setTransactionHash(receipt.transactionHash);
                        setBlockNumber(receipt.blockNumber);
                    }
                    
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
                    
                    const result = await contract.functions[methodName](
                        ...values, 
                        { value: ethers.utils.parseEther(payableValue) }
                    );
                    
                    notification.info({
                        message: 'Transaction Submitted',
                        description: `Sending ${payableValue} ETH. Waiting for confirmation...`
                    });
                    
                    const receipt = await result.wait();
                    
                    const txResult = `Transaction confirmed in block ${receipt.blockNumber}\nTransaction hash: ${receipt.transactionHash}\nSent ${payableValue} ETH`;
                    if (isMounted.current) {
                        setCallResult(txResult);
                        setDisplayResult(txResult);
                        setResultType('success');
                        setShowResult(true);
                        setTransactionHash(receipt.transactionHash);
                        setBlockNumber(receipt.blockNumber);
                    }
                    
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
            if (isMounted.current) {
                setCallResult(error.message);
                setDisplayResult(error.message);
                setResultType('error');
                setShowResult(true);
            }
            
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
        
        <ResultContainer>
            <ResultTitle>
                <span>Result</span>
                {isLoading && <Spin size="small" />}
            </ResultTitle>
            
            {/* Hidden debug info */}
            <div style={{ display: 'none' }}>
                Debug: showResult={showResult ? 'true' : 'false'}, 
                resultType={resultType || 'none'}, 
                callResult={callResult ? `"${callResult}"` : 'empty'}
            </div>
            
            {showResult ? (
                <div>
                    <Text type={resultType === 'error' ? 'danger' : 'success'}>
                        {resultType === 'error' ? 'Error' : 'Success'}
                    </Text>
                    
                    <ResultValue>
                        <div style={{ fontWeight: 'bold', marginBottom: '5px' }}>
                            Output:
                        </div>
                        
                        {/* Single result display */}
                        <pre style={{ margin: 0, whiteSpace: 'pre-wrap', wordBreak: 'break-word', backgroundColor: '#f0f0f0', padding: '10px', borderRadius: '4px' }}>
                            {window.lastResult || displayResult || 'No result data available'}
                        </pre>
                    </ResultValue>
                    
                    {/* Only show additional details for transactions, not for simple function calls */}
                    {transactionHash && (
                        <div style={{ marginTop: '10px', padding: '10px', backgroundColor: '#f9f9f9', borderRadius: '4px' }}>
                            <div style={{ fontWeight: 'bold', marginBottom: '5px' }}>
                                Transaction Details:
                            </div>
                            <div style={{ margin: 0, whiteSpace: 'pre-wrap', wordBreak: 'break-word', backgroundColor: '#fff', padding: '8px', border: '1px solid #eee', borderRadius: '4px' }}>
                                <div><strong>Hash:</strong> {transactionHash}</div>
                                {blockNumber && <div><strong>Block:</strong> {blockNumber}</div>}
                            </div>
                        </div>
                    )}
                </div>
            ) : (
                <div style={{ color: '#999', padding: '10px 0' }}>
                    {isLoading ? 'Processing transaction...' : 'No result yet. Click Submit to call the function.'}
                </div>
            )}
        </ResultContainer>
    </div>
}