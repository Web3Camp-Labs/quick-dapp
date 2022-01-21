import { Button, notification } from 'antd';
import { useEffect, useState } from 'react';
import { useDappContext } from '../store/contextProvider';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import logo from '../res/logo.png';

const HeaderTop = styled.div`
    display: flex;
    justify-content: space-between;
    width: 100vw;
    padding: 20px 5%;
    box-sizing: border-box;
`;

const Logo = styled.div`
  padding-top: .1rem;
  img {
       width: 2rem;
    }
`;

export default function Header() {

    const [account, setAccount] = useState('');

    const { state } = useDappContext();
    const navigate = useNavigate();

    const connectWallet = async () => {
        if ('undefined' !== typeof window.ethereum) {
            const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
            console.log(accounts);
            setAccount(accounts[0]);
        } else {
            notification.open({
                message: 'WTF?',
                description:
                    'Metamask is not installed. Please go to hell and download metamask before you come back.',
                onClick: () => {
                    console.log('Metamask not installed!');
                },
            });
        }
    };

    const backToHome = async() => {
        navigate('/home');
    }

    return <HeaderTop>
        <Logo>
            <img src={logo} alt="" onClick={()=>{backToHome()}}/>
        </Logo>

        {!account.length && <Button type='primary' onClick={() => connectWallet()}>Connect Metamask</Button>}
        {!!account.length && <div>{account}</div>}
    </HeaderTop>
}