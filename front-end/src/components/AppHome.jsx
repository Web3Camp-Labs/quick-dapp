import styled from 'styled-components';
import { Input, Button, notification } from 'antd';

import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';


const WD = styled.div`
    padding: 4em;
background-color: #ffffff;
  width: 100vw;
    flex-grow:1;
    border-radius: 10px;
`;

const Title = styled.h1`
font-size: 18px;
  text-align: center;
  font-weight: bold;
`;

const BoxButton = styled.div`
margin-top: 50px;
    display: flex;
    justify-content: center;
`

export default function AppHome() {
    const navigate = useNavigate();

    useEffect(() => {
    }, [])

    const onClickStart = async () => {
        navigate(`/new`); // Navigate to App Create page
    }

    return <WD>
        <Title>Welcome to OneClickDapp!</Title>
        <BoxButton><Button type='primary' onClick={() => onClickStart()}>Get Start</Button></BoxButton>
    </WD>
}