import { Button, notification } from 'antd';
import { useEffect, useState } from 'react';
import { useDappContext } from '../store/contextProvider';
import styled from 'styled-components';
import logo from '../res/logo.png';

const HeaderTop = styled.div`
  user-select:none;
    height:  2rem;
    display: flex;
    justify-content: center;
    position: absolute;
    left: 0;
    top: 0;
    width: 100vw;
    z-index: 9999;
    .mainContent{
      display: flex;
      justify-content: space-between;
      align-items: center;
      width: 100%;
      padding: 0 20px;
      box-sizing: border-box;
    }
`;

const Logo = styled.div`
  padding-top: .1rem;
  img {
       width: 2rem;
    }
`;

export default function Header() {

    const [num, setNum] = useState(0);
    const [account, setAccount] = useState('');

    const { state } = useDappContext();

    useEffect(
        () => {
            if (num % 3 === 0) {
                console.log(`Clicked 3 times`);
            }
        }, [num]
    )

    useEffect(
        () => {
            console.log(state.appData.appName);
        }, [state.appData]
    )

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

        console.log(`on click connect!!!!!!! times: ${num}`);
        setNum(num + 1);
    };

    return <HeaderTop><div className='mainContent'>
        <Logo>
            <img src={logo} alt="" />
        </Logo>

        {!account.length && <Button type='primary' onClick={() => connectWallet()}>Connect Metamask</Button>}
        {!!account.length && <div>{account}</div>}
    </div>
    </HeaderTop>
}