import styled from 'styled-components';
import { Input, Button, notification, Tabs } from 'antd';
import { useEffect, useState } from 'react';
import { useDappContext } from '../store/contextProvider';
import { Navigate, useNavigate } from 'react-router-dom';

import { ethers } from 'ethers';
import { EtherscanProvider } from '@ethersproject/providers';

console.log(ethers);

const List = styled.ul`
`

export default function AppMethod(props) {

    const { state } = useDappContext();
    const { appData: { appName, appDesc, appAbi, appNetwork, appAddress } } = state;
    const [methodInputs, setMethodInputs] = useState([]);
    const [methodValues, setMethodValues] = useState([]);
    const [methodName, setMethodName] = useState('');

    useEffect(() => {
        if (!props.itemData) return;

        let name = props.itemData.split('(')[0];
        console.log(`methodName ${name}`);
        setMethodName(name);

        let method = JSON.parse(appAbi).filter(e => e.name === name)[0];
        console.error(method);

        setMethodInputs(method.inputs);
        setMethodValues(method.inputs.map(e => null));
    }, [props.itemData])

    const onValueChange = async (e, index) => {
        let values = [...methodValues];
        values[index] = e.target.value;
        setMethodValues(values);
        // console.log(`e ${e.target.value}, index ${index}, values ${values}`)
    }

    const onSubmit = async () => {
        console.log(`onSubmit`);

        //TODO: check all values

        //TODO: interact with wallet.

        let contract = new ethers.Contract(appAddress, appAbi);
        console.log(contract);

        console.log(contract[methodName]);

        let result = await contract.functions[methodName]();
        console.log(result);
    }

    return <div>
        <div>{props.itemData}</div>
        <div>
            <List>
                {methodInputs.map((item, index) => (<li key={`method_${index}`}><div>{item.name}</div><div><Input placeholder={item.type} value={methodValues[index]} onChange={(e) => onValueChange(e, index)} /></div></li>))}
            </List>
        </div>
        <div>
            <Button type='primary' onClick={() => onSubmit()}>SUBMIT</Button>
        </div>


    </div>
}