import styled from 'styled-components';
import { Input, Button, notification } from 'antd';

import bgimg from "../res/couple.jpg";
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';


const WD = styled.div`
    padding: 4em;
  background: papayawhip;
`;

const Title = styled.h1`
  font-size: 1em;
  text-align: center;
  color: palevioletred;
`;

const List = styled.ul`
`

export default function AppHome() {
    const navigate = useNavigate();

    useEffect(() => {
    }, [])

    const onClickStart = async()=>{
        // Navigate to App Create page
        navigate(`/new`);
    }

    return <WD>
        <Title>Welcome to Wendy's OneClickDapp! Be yourself</Title>
        <Button type='primary' onClick={() => onClickStart()}>Get Start</Button>
    </WD>
}