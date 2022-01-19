import { Button, notification } from 'antd';
import { useEffect, useState } from 'react';

export default function Header() {

    const [num, setNum] = useState(0);

    useEffect(
        () => {
            if(num % 3 === 0) {
                console.log(`Clicked 3 times`);
            }
        }, [num]
    )

    const connectWallet = async () => {
        if ('undefined' !== typeof window.ethereum) {
            console.log('Installed!')

            const accounts = await window.ethereum.request( {method: 'eth_requestAccounts'});
            console.log(accounts);

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
        setNum(num+1);
    };

    return <div><Button type='primary' onClick={() => connectWallet()}>Connect Metamask</Button></div>
}