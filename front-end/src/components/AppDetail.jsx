import styled from 'styled-components';
import { Input, Button, notification, Tabs } from 'antd';
import bgimg from "../res/couple.jpg";
import { useEffect, useState } from 'react';
import { useDappContext } from '../store/contextProvider';
import { Navigate, useNavigate } from 'react-router-dom';
import AppMethod from './AppMethod';

const { TabPane } = Tabs;


const ContractMethodNames = styled.div`
`

const ContractMethods = styled.div`
    display: flex;
    justify-content: space-between;
    width: 100%;
    &>div{
        border: 1px solid #f1f1f1;
        width: 49%;
        box-sizing: border-box;
        padding: 20px;
    }

    .active{
        color:#FF0000;
        background-color: #f5f5f5;
    }

    .wendy{
        padding: 5px 10px;
        margin-bottom: 5px;
        cursor: pointer;
        &:hover{
            color: #FF0000;
        }
    }
`

const ContractInfo = styled.div`
    display: flex;
`

const WD = styled.div`
    padding: 20px 5%;
    background-color: #ffffff;
    flex-grow: 1;
`;

const Title = styled.h1`
  font-size: 18px;
  text-align: center;
//   color: palevioletred;
  text-weight: bold;
`;

const List = styled.ul`
`

export default function AppDetail() {

    const [readMethods, setReadMethods] = useState([]);
    const [writeMethods, setWriteMethods] = useState([]);
    const [choosedItem, setChoosedItem] = useState(null);

    const [readActiveIndex, setReadActive] = useState(0);
    const [writeActiveIndex, setWriteActive] = useState(0);


    const { state } = useDappContext();
    const { appData: { appName, appDesc, appAbi, appNetwork, appAddress } } = state;


    const navigate = useNavigate();

    useEffect(() => {

        console.log(readMethods);

        let reads = JSON.parse(appAbi).filter(e => e.type === 'function' && e.stateMutability === 'view');
        let rms = reads.map(e => '' + e.name + '(' + e.inputs.map(item => item.type).join(',') + ')');
        setReadMethods(rms);

        let writes = JSON.parse(appAbi).filter(e => e.type === 'function' && e.stateMutability !== 'view');
        let wms = writes.map(e => '' + e.name + '(' + e.inputs.map(item => item.type).join(',') + ')');
        setWriteMethods(wms);

        setChoosedItem(rms[0]);

        if (!appAbi || appAbi.length == 0) navigate("/");

    }, [])

    const parseAbi = (abi) => {
        return JSON.parse(abi).map(e => { if (e.type === 'function') return e.name; });
    }

    const onChoose = (item, index, tabname) => {
        console.log(item);
        setChoosedItem(item);

        if (tabname === 'Read') {
            setReadActive(index);
        } else {
            setWriteActive(index);
        }
    }

    return <WD>
        <Title>{appName}</Title>
        <ContractInfo>
            <div>Contract:</div>
            <div>{appAddress}</div>
        </ContractInfo>
        <ContractInfo>
            <div>ABI:</div>
            <div>{parseAbi(appAbi)}</div>
        </ContractInfo>
        <ContractMethods>
            <div>
                <Tabs onChange={() => { }} type="card" style={{ marginBottom: 32 }}>
                    <TabPane tab="Read" key="1">
                        {readMethods.map((item, index) => (<div className={index === readActiveIndex ? 'active wendy' : 'wendy'} key={`readMethods_${index}`}><span onClick={() => onChoose(item, index, 'Read')}>{item}</span></div>))}
                    </TabPane>
                    <TabPane tab="Write" key="2">
                        {writeMethods.map((item, index) => (<div className={index === writeActiveIndex ? 'active wendy' : 'wendy'} key={`writeMethods_${index}`}><span onClick={() => onChoose(item, index, 'Write')}>{item}</span></div>))}
                    </TabPane>
                </Tabs>
            </div>
            <div>
                <AppMethod itemData={choosedItem}></AppMethod>
            </div>
        </ContractMethods>
        <List>
        </List>

    </WD>
}