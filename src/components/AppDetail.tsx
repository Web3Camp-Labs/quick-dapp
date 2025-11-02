import styled from 'styled-components';
import { Tabs, notification } from 'antd';
import { useEffect, useMemo, useState } from 'react';
import { useDappContext } from '../store/contextProvider';
import { useNavigate } from 'react-router-dom';
import AppMethod from './AppMethod';
import { ethers } from 'ethers';
import { getProvider } from '../utils/walletUtils';
import { FileTextOutlined, LinkOutlined } from '@ant-design/icons';
import { getRecentDapp } from '../utils/storage';

const { TabPane } = Tabs;

const WD = styled.div`
    padding: 3em 2em;
    background: linear-gradient(180deg, #ffffff 0%, #f8f9fa 100%);
    width: 100vw;
    flex-grow: 1;
    min-height: calc(100vh - 64px);

    @media (max-width: 1024px) {
        padding: 2em 1em;
    }
`;

const PageContainer = styled.div`
    max-width: 1400px;
    margin: 0 auto;
`;

const HeaderSection = styled.div`
    text-align: left;
    margin-bottom: 1em;
    padding: 12px 16px;
    background: linear-gradient(135deg, rgba(102, 126, 234, 0.05) 0%, rgba(118, 75, 162, 0.05) 100%);
    border-radius: 8px;
    border-left: 4px solid #667eea;
`;

const Title = styled.h1`
    font-size: 1.3rem;
    font-weight: 600;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    margin-bottom: 0;
    line-height: 1.3;

    @media (max-width: 768px) {
        font-size: 1.2rem;
    }
`;

const ContractInfo = styled.div`
    background: linear-gradient(135deg, rgba(102, 126, 234, 0.05) 0%, rgba(118, 75, 162, 0.05) 100%);
    border-radius: 12px;
    padding: 16px 20px;
    margin-bottom: 24px;
    border: 2px solid rgba(102, 126, 234, 0.1);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
`;

const InfoRow = styled.div`
    display: flex;
    align-items: flex-start;
    margin-bottom: 12px;

    &:last-child {
        margin-bottom: 0;
    }

    @media (max-width: 768px) {
        flex-direction: column;
    }
`;

const InfoLabel = styled.div`
    font-weight: 600;
    font-size: 13px;
    color: #667eea;
    min-width: 140px;
    display: flex;
    align-items: center;
    gap: 6px;

    svg {
        font-size: 14px;
    }

    @media (max-width: 768px) {
        margin-bottom: 6px;
    }
`;

const InfoValue = styled.div`
    font-size: 13px;
    color: #2d3748;
    font-family: 'Monaco', 'Menlo', monospace;
    word-break: break-all;
    flex: 1;
    background: #ffffff;
    padding: 6px 10px;
    border-radius: 6px;
`;

const ContractMethods = styled.div`
    display: grid;
    grid-template-columns: 380px 1fr;
    gap: 24px;

    @media (max-width: 1024px) {
        grid-template-columns: 1fr;
    }
`;

const MethodsListCard = styled.div`
    background: #ffffff;
    border-radius: 16px;
    padding: 0;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
    border: 2px solid transparent;
    overflow: hidden;
    height: fit-content;
    max-height: calc(100vh - 400px);
    display: flex;
    flex-direction: column;

    @media (max-width: 1024px) {
        max-height: none;
    }
`;

const StyledTabs = styled(Tabs)`
    .ant-tabs-nav {
        margin: 0;
        padding: 16px 16px 0;
        background: linear-gradient(135deg, rgba(102, 126, 234, 0.05) 0%, rgba(118, 75, 162, 0.05) 100%);
    }

    .ant-tabs-tab {
        border-radius: 8px 8px 0 0 !important;
        font-weight: 600;
        padding: 12px 24px !important;
        margin: 0 4px !important;

        &.ant-tabs-tab-active {
            background: #ffffff !important;

            .ant-tabs-tab-btn {
                color: #667eea !important;
            }
        }
    }

    .ant-tabs-ink-bar {
        background: linear-gradient(90deg, #667eea 0%, #764ba2 100%);
        height: 3px;
    }

    .ant-tabs-content-holder {
        overflow-y: auto;
        max-height: calc(100vh - 500px);

        @media (max-width: 1024px) {
            max-height: 400px;
        }
    }

    .ant-tabs-tabpane {
        padding: 8px;
    }
`;

const MethodItem = styled.div<{ $active: boolean }>`
    padding: 14px 16px;
    margin-bottom: 6px;
    cursor: pointer;
    border-radius: 10px;
    background: ${props => props.$active ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' : '#f8f9fa'};
    color: ${props => props.$active ? '#ffffff' : '#2d3748'};
    font-size: 14px;
    font-weight: ${props => props.$active ? '600' : '500'};
    transition: all 0.3s ease;
    border: 2px solid ${props => props.$active ? 'transparent' : 'transparent'};
    font-family: 'Monaco', 'Menlo', monospace;

    &:hover {
        background: ${props => props.$active ? 'linear-gradient(135deg, #764ba2 0%, #667eea 100%)' : '#e2e8f0'};
        transform: translateX(4px);
        border-color: ${props => props.$active ? 'transparent' : '#667eea'};
    }

    &:last-child {
        margin-bottom: 0;
    }
`;

const MethodDetailCard = styled.div`
    background: #ffffff;
    border-radius: 16px;
    padding: 32px;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
    border: 2px solid transparent;
    background: linear-gradient(white, white) padding-box,
                linear-gradient(135deg, rgba(102, 126, 234, 0.2) 0%, rgba(118, 75, 162, 0.2) 100%) border-box;
    min-height: 400px;

    @media (max-width: 768px) {
        padding: 24px;
    }
`;

const LoadingMessage = styled.div`
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 60px 20px;
    text-align: center;
    color: #718096;
    font-size: 15px;
`;

const EmptyState = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 60px 20px;
    text-align: center;
    color: #718096;

    svg {
        font-size: 48px;
        margin-bottom: 16px;
        color: #cbd5e0;
    }

    p {
        font-size: 15px;
        margin: 0;
    }
`;


export default function AppDetail() {

    const [readMethods, setReadMethods] = useState([]);
    const [writeMethods, setWriteMethods] = useState([]);

    const [activeTabKey, setActiveTabKey] = useState("read");

    const [readActiveIndex, setReadActive] = useState(0);
    const [writeActiveIndex, setWriteActive] = useState(0);

    const [contract, setContract] = useState<any>();
    const [isRestoring, setIsRestoring] = useState(false);

    const { state, dispatch } = useDappContext();
    const { appData: { appName, appDesc, appAbi, appNetwork, appAddress } } = state;

    const navigate = useNavigate();

    // Try to load recent dApp if context is empty (e.g., after page refresh)
    useEffect(() => {
        if (!appAbi || appAbi.length === 0) {
            const recentDapp = getRecentDapp();
            if (recentDapp && recentDapp.appAbi && recentDapp.appAddress) {
                console.log('Loading recent dApp from localStorage...');
                setIsRestoring(true);
                dispatch({
                    type: 'set_appData',
                    payload: recentDapp
                });
                notification.info({
                    message: 'dApp Restored',
                    description: 'Your last viewed dApp has been restored from browser storage.',
                    duration: 3,
                });
                // Reset restoring flag after state should be updated
                setTimeout(() => setIsRestoring(false), 100);
            } else {
                // No data to restore, can redirect immediately
                setIsRestoring(false);
            }
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        // Check if ABI exists before trying to parse
        if (!appAbi || appAbi.length === 0) {
            // Don't redirect if we're currently restoring data from localStorage
            if (isRestoring) {
                console.log('Waiting for data restoration...');
                return;
            }
            console.log('No ABI data found, redirecting to home...');
            navigate("/");
            return;
        }

        try {
            console.log(appName, appDesc, appAbi, appNetwork, appAddress);

            const parsedAbi = JSON.parse(appAbi);

            let reads = parsedAbi.filter(e => e.type === 'function' && e.stateMutability === 'view');
            let rms = reads.map(e => '' + e.name + '(' + e.inputs.map(item => item.type).join(',') + ')');
            setReadMethods(rms);

            let writes = parsedAbi.filter(e => e.type === 'function' && e.stateMutability !== 'view');
            let wms = writes.map(e => '' + e.name + '(' + e.inputs.map(item => item.type).join(',') + ')');
            setWriteMethods(wms);
        } catch (error) {
            console.error('Error parsing ABI:', error);
            navigate("/");
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [appAbi, navigate, isRestoring]);

    useEffect(() => {
        const initContract = async () => {
            try {
                const walletProvider = getProvider();
                if (!walletProvider) {
                    console.error('No wallet provider found');
                    return;
                }
                const provider = new ethers.BrowserProvider(walletProvider);
                const signer = await provider.getSigner();
                const _contract = new ethers.Contract(appAddress, JSON.parse(appAbi), signer);
                setContract(_contract);
            } catch (error) {
                console.error('Error initializing contract:', error);
                setContract(null);
            }
        };
        if (appAddress && appAbi) {
            initContract();
        }
    }, [appAddress, appAbi])

    const parseAbi = (abi) => {
        try {
            if (!abi) return 'No ABI loaded';
            return JSON.parse(abi).filter(e => e.type === 'function').map(e=>e.name).join(',');
        } catch (error) {
            console.error('Error parsing ABI for display:', error);
            return 'Invalid ABI';
        }
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

    return (
        <WD>
            <PageContainer>
                <HeaderSection>
                    <Title>{appName || 'Smart Contract Interface'}</Title>
                </HeaderSection>

                <ContractInfo>
                    <InfoRow>
                        <InfoLabel>
                            <LinkOutlined />
                            Contract Address
                        </InfoLabel>
                        <InfoValue>{appAddress}</InfoValue>
                    </InfoRow>
                    <InfoRow>
                        <InfoLabel>
                            <FileTextOutlined />
                            Available Methods
                        </InfoLabel>
                        <InfoValue>{parseAbi(appAbi)}</InfoValue>
                    </InfoRow>
                </ContractInfo>

                <ContractMethods>
                    <MethodsListCard>
                        <StyledTabs onChange={onSwitchTab} defaultActiveKey="read">
                            <TabPane
                                tab={
                                    <span>
                                        📖 Read ({readMethods.length})
                                    </span>
                                }
                                key="read"
                            >
                                {readMethods.length > 0 ? (
                                    readMethods.map((item, index) => (
                                        <MethodItem
                                            key={`readMethods_${index}`}
                                            $active={index === readActiveIndex}
                                            onClick={() => onChoose(index)}
                                        >
                                            {item}
                                        </MethodItem>
                                    ))
                                ) : (
                                    <EmptyState>
                                        <FileTextOutlined />
                                        <p>No read methods available</p>
                                    </EmptyState>
                                )}
                            </TabPane>
                            <TabPane
                                tab={
                                    <span>
                                        ✍️ Write ({writeMethods.length})
                                    </span>
                                }
                                key="write"
                            >
                                {writeMethods.length > 0 ? (
                                    writeMethods.map((item, index) => (
                                        <MethodItem
                                            key={`writeMethods_${index}`}
                                            $active={index === writeActiveIndex}
                                            onClick={() => onChoose(index)}
                                        >
                                            {item}
                                        </MethodItem>
                                    ))
                                ) : (
                                    <EmptyState>
                                        <FileTextOutlined />
                                        <p>No write methods available</p>
                                    </EmptyState>
                                )}
                            </TabPane>
                        </StyledTabs>
                    </MethodsListCard>

                    <MethodDetailCard>
                        {choosedItem && contract && (
                            <AppMethod itemData={choosedItem} contract={contract} />
                        )}
                        {choosedItem && !contract && (
                            <LoadingMessage>
                                Loading contract... Please wait.
                            </LoadingMessage>
                        )}
                        {!choosedItem && (
                            <EmptyState>
                                <FileTextOutlined />
                                <p>Select a method from the list to interact with it</p>
                            </EmptyState>
                        )}
                    </MethodDetailCard>
                </ContractMethods>
            </PageContainer>
        </WD>
    );
}