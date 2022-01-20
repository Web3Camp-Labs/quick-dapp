import styled from 'styled-components';
import { Input, Button, notification, Tabs } from 'antd';
import { useEffect, useState } from 'react';
import { useDappContext } from '../store/contextProvider';
import { Navigate, useNavigate } from 'react-router-dom';

export default function AppMethod(props) {

    useEffect(() => {

    }, [])

    return <div>
        {props.itemData}
    </div>
}