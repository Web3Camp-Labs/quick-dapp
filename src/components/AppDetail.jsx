import styled from 'styled-components';
import { Tabs } from 'antd';
import { useEffect, useMemo, useState } from 'react';
import { useDappContext } from '../store/contextProvider';
import { useNavigate } from 'react-router-dom';
import AppMethod from './AppMethod';

const { TabPane } = Tabs;


// const ContractMethodNames = styled.div`
// `

const ContractMethods = styled.div`
    display: flex;
    justify-content: space-between;
    width: 100%;
    &>div{
        // border: 1px solid #f1f1f1;
        width: 49%;
        box-sizing: border-box;
        padding: 20px;
        box-shadow: 0 0 5px #e5e5e5;
        border-radius: 10px;
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
    // border: 1px solid #f1f1f1;
    padding: 20px 20px 5px;
    margin-bottom: 20px;
    box-shadow: 0 0 5px #e5e5e5;
    border-radius: 10px;
    dl {
        display: flex;
        dt {
            width: 100px;
        }
        dd {

        }
    }
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


export default function AppDetail() {

    const [readMethods, setReadMethods] = useState([]);
    const [writeMethods, setWriteMethods] = useState([]);

    const [activeTabKey, setActiveTabKey] = useState("read");

    const [readActiveIndex, setReadActive] = useState(0);
    const [writeActiveIndex, setWriteActive] = useState(0);


    const { state } = useDappContext();
    const { appData: { appName, appDesc, appAbi, appNetwork, appAddress } } = state;


    const navigate = useNavigate();

    useEffect(() => {
        console.log(readMethods);

        console.log(appName, appDesc, appAbi, appNetwork, appAddress);

        let reads = JSON.parse(appAbi).filter(e => e.type === 'function' && e.stateMutability === 'view');
        let rms = reads.map(e => '' + e.name + '(' + e.inputs.map(item => item.type).join(',') + ')');
        setReadMethods(rms);

        let writes = JSON.parse(appAbi).filter(e => e.type === 'function' && e.stateMutability !== 'view');
        let wms = writes.map(e => '' + e.name + '(' + e.inputs.map(item => item.type).join(',') + ')');
        setWriteMethods(wms);

        if (!appAbi || appAbi.length === 0) navigate("/");
    }, [appAbi]);

    const parseAbi = (abi) => {
        return JSON.parse(abi).filter(e => e.type === 'function').map(e=>e.name).join(',');
    }

    const onChoose = (index) => {
        if (activeTabKey === "read") {
            setReadActive(index);
        } else if (activeTabKey === "write") {
            setWriteActive(index);
        }
    }

    const onSwitchTab = (key) => {
        setActiveTabKey(key);
    }

    const choosedItem = useMemo(() => {
      if (activeTabKey === "read") {
        return readMethods.length ? readMethods[readActiveIndex] : undefined;
      } else if (activeTabKey === "write") {
        return writeMethods.length ? writeMethods[writeActiveIndex] : undefined;
      }
    }, [
      activeTabKey,
      readMethods,
      writeMethods,
      readActiveIndex,
      writeActiveIndex,
    ]);

    return <WD>
        <Title>{appName}</Title>
        <ContractInfo>
            <dl>
                <dt>Contract:</dt>
                <dd>{appAddress}</dd>
            </dl>
            <dl>
                <dt>ABI:</dt>
                <dd>{parseAbi(appAbi)}</dd>
            </dl>
        </ContractInfo>
        <ContractMethods>
            <div>
                <Tabs onChange={onSwitchTab} type="card" style={{ marginBottom: 32 }}>
                    <TabPane tab="Read" key="read">
                        {readMethods.map((item, index) => (<div className={index === readActiveIndex ? 'active wendy' : 'wendy'} key={`readMethods_${index}`}><span onClick={() => onChoose(index)}>{item}</span></div>))}
                    </TabPane>
                    <TabPane tab="Write" key="write">
                        {writeMethods.map((item, index) => (<div className={index === writeActiveIndex ? 'active wendy' : 'wendy'} key={`writeMethods_${index}`}><span onClick={() => onChoose(index)}>{item}</span></div>))}
                    </TabPane>
                </Tabs>
            </div>
            <div>
                {choosedItem && <AppMethod itemData={choosedItem}></AppMethod>}
            </div>
        </ContractMethods>
    </WD>
}