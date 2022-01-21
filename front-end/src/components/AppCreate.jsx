import styled from 'styled-components';
import { Input, Button, notification } from 'antd';

import bgimg from "../res/couple.jpg";
import { useEffect, useState } from 'react';

import { useDappContext } from '../store/contextProvider';

import { useNavigate } from 'react-router-dom';


const WD = styled.div`
    padding: 40px 5%;
//   background: url(${bgimg});
    background-color: #ffffff;
    flex-grow: 1;
    box-shadow: 0 0 5px #e5e5e5;
    border-radius: 10px;
`;

const Title = styled.h1`
  font-size: 18px;
  text-align: center;
  text-weight: bold;
`;

const List = styled.ul`
li {
    margin-bottom: 20px;
    &>div {
        padding-bottom: 5px;
    }
}
`

export default function AppCreate() {
    const navigate = useNavigate();

    const [appName, setAppName] = useState('');
    const [appDesc, setAppDesc] = useState('');
    const [appAbi, setAppAbi] = useState('');
    const [contractAddress, setContractAddress] = useState('');
    const [networkName, setNetworkName] = useState('');

    const { dispatch, state } = useDappContext();

    useEffect(() => {
    }, [])


    const onNameChange = (e) => {
        setAppName(e.target.value);
    }

    const onDescChange = (e) => {
        setAppDesc(e.target.value);
    }

    const onAbiChange = (e) => {
        setAppAbi(e.target.value);
    }

    const onAddressChange = (e) => {
        setContractAddress(e.target.value);
    }

    const onNetworkNameChange = (e) => {
        setNetworkName(e.target.value);
    }

    const saveApp = () => {
        if ('undefined' === typeof window.ethereum) {
            console.log('Not installed!')

            notification.open({
                message: 'WTF?',
                description:
                    'Metamask is not installed. Please go to hell and download metamask before you come back.',
                onClick: () => {
                    console.log('Metamask not installed!');
                },
            });
            return;
        }

        //TODO: check data

        // test code here!!!
        let abijson = '[{"inputs":[{"internalType":"string","name":"name","type":"string"},{"internalType":"string","name":"symbol","type":"string"},{"internalType":"uint256","name":"supply","type":"uint256"}],"stateMutability":"nonpayable","type":"constructor"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"owner","type":"address"},{"indexed":true,"internalType":"address","name":"spender","type":"address"},{"indexed":false,"internalType":"uint256","name":"value","type":"uint256"}],"name":"Approval","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"from","type":"address"},{"indexed":true,"internalType":"address","name":"to","type":"address"},{"indexed":false,"internalType":"uint256","name":"value","type":"uint256"}],"name":"Transfer","type":"event"},{"inputs":[{"internalType":"address","name":"owner","type":"address"},{"internalType":"address","name":"spender","type":"address"}],"name":"allowance","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"spender","type":"address"},{"internalType":"uint256","name":"amount","type":"uint256"}],"name":"approve","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"account","type":"address"}],"name":"balanceOf","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"decimals","outputs":[{"internalType":"uint8","name":"","type":"uint8"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"spender","type":"address"},{"internalType":"uint256","name":"subtractedValue","type":"uint256"}],"name":"decreaseAllowance","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"spender","type":"address"},{"internalType":"uint256","name":"addedValue","type":"uint256"}],"name":"increaseAllowance","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"user","type":"address"},{"internalType":"uint256","name":"amount","type":"uint256"}],"name":"mint","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"name","outputs":[{"internalType":"string","name":"","type":"string"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"symbol","outputs":[{"internalType":"string","name":"","type":"string"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"totalSupply","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"recipient","type":"address"},{"internalType":"uint256","name":"amount","type":"uint256"}],"name":"transfer","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"sender","type":"address"},{"internalType":"address","name":"recipient","type":"address"},{"internalType":"uint256","name":"amount","type":"uint256"}],"name":"transferFrom","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"nonpayable","type":"function"}]'
        setAppAbi(abijson);

        let contractAddress = '0x387Bd586130a03e4c2ae3c9b9b5481C0993Bfb00';
        setContractAddress(contractAddress);

        let appName = 'My First Dapp';
        setAppName(appName);

        // Dispatch data
        dispatch({
            payload: {
                appName,
                appDesc,
                appAbi: abijson,
                appNetwork: networkName,
                appAddress: contractAddress,
            }
        });

        // Goto new page
        navigate(`/detail`);
    }

    return <WD>
        <Title>Create OneClickApp</Title>
        <List>
            <li>
                <div>Name</div>
                <div><Input placeholder="My awesome Dapp" value={appName} onChange={onNameChange} /></div>
            </li>
            <li>
                <div>Descripton</div>
                <div><Input placeholder="The description of dapp" value={appDesc} onChange={onDescChange} /></div>
            </li>
            <li>
                <div>Abi</div>
                <div><Input placeholder="[]" value={appAbi} onChange={onAbiChange} /></div>
            </li>
            <li>
                <div>Contract Address</div>
                <div><Input placeholder="0x" value={contractAddress} onChange={onAddressChange} /></div>
            </li>
            <li>
                <div>
                    <div>Network Name</div>
                    <div>Use "homestead" for ethereum mainnet. Leave blank for a custom network.</div>
                </div>
                <div><Input placeholder="goerli" value={networkName} onChange={onNetworkNameChange} /></div>
            </li>
        </List>
        <Button type='primary' onClick={() => saveApp()}>SAVE</Button>
    </WD>
}