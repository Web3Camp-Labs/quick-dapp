import styled from 'styled-components';
import { Button, Row, Col, Card, Typography, Space, Tag } from 'antd';
import { RocketOutlined, HistoryOutlined, DeleteOutlined } from '@ant-design/icons';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDappContext } from '../store/contextProvider';
import { getSavedDapps, deleteDapp, setRecentDapp } from '../utils/storage';

const { Title: AntTitle, Paragraph, Text } = Typography;

const WD = styled.div`
    padding: 0;
    background: linear-gradient(180deg, #ffffff 0%, #f8f9fa 100%);
    width: 100vw;
    flex-grow: 1;
    border-radius: 10px;
    min-height: 100vh;
`;

const HeroSection = styled.div`
    padding: 3em 2em;
    text-align: center;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    position: relative;
    overflow: hidden;
    border-radius: 10px 10px 0 0;

    &::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: radial-gradient(circle at 20% 50%, rgba(255, 255, 255, 0.1) 0%, transparent 50%),
                    radial-gradient(circle at 80% 80%, rgba(255, 255, 255, 0.1) 0%, transparent 50%);
        pointer-events: none;
    }

    @media (max-width: 768px) {
        padding: 2.5em 1em;
    }
`;

const HeroTitle = styled(AntTitle)`
    margin-bottom: 16px !important;
    font-size: 2.2rem !important;
    color: #ffffff !important;
    font-weight: 700 !important;
    text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    position: relative;
    z-index: 1;

    @media (max-width: 768px) {
        font-size: 1.8rem !important;
    }
`;

const HeroSubtitle = styled(Paragraph)`
    font-size: 1.1rem;
    max-width: 700px;
    margin: 0 auto 2rem auto !important;
    color: rgba(255, 255, 255, 0.95);
    line-height: 1.6;
    position: relative;
    z-index: 1;

    @media (max-width: 768px) {
        font-size: 1rem;
    }
`;

const HeroButton = styled(Button)`
    height: 56px;
    font-size: 18px;
    padding: 0 48px;
    border-radius: 28px;
    font-weight: 600;
    box-shadow: 0 8px 16px rgba(0, 0, 0, 0.2);
    transition: all 0.3s ease;
    border: none;
    background: #ffffff;
    color: #667eea;
    position: relative;
    z-index: 1;

    &:hover {
        transform: translateY(-3px);
        box-shadow: 0 12px 24px rgba(0, 0, 0, 0.3);
        background: #ffffff !important;
        color: #764ba2 !important;
    }

    &:active {
        transform: translateY(-1px);
    }
`;

const FeaturesSection = styled.div`
    padding: 2em 2em;
    background-color: transparent;

    @media (max-width: 768px) {
        padding: 1.5em 1em;
    }
`;

const ContentContainer = styled.div`
    max-width: 1200px;
    margin: 0 auto;
`;

const SectionTitle = styled(AntTitle)`
    text-align: center;
    margin-bottom: 1.5em !important;
    font-size: 1.5rem !important;
    font-weight: 700 !important;
    color: #2d3748 !important;
    position: relative;

    &::after {
        content: '';
        display: block;
        width: 50px;
        height: 3px;
        background: linear-gradient(90deg, #667eea 0%, #764ba2 100%);
        margin: 10px auto 0;
        border-radius: 2px;
    }
`;

const SavedDappsCard = styled(Card)`
    border-radius: 12px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
    transition: all 0.3s ease;
    border: 1px solid #e2e8f0;

    &:hover {
        transform: translateY(-4px);
        box-shadow: 0 8px 20px rgba(0, 0, 0, 0.12);
        border-color: #667eea;
    }

    .ant-card-head {
        background: linear-gradient(135deg, rgba(102, 126, 234, 0.05) 0%, rgba(118, 75, 162, 0.05) 100%);
        border-bottom: 1px solid #e2e8f0;
    }
`;

export default function AppHome() {
    const navigate = useNavigate();
    const { dispatch } = useDappContext();
    const [savedDapps, setSavedDapps] = useState([]);

    useEffect(() => {
        // Load saved dApps
        const dapps = getSavedDapps();
        setSavedDapps(dapps);
    }, []);

    const onClickStart = async () => {
        navigate(`/new`); // Navigate to App Create page
    };

    const onLoadDapp = (dapp) => {
        // Load dApp into context
        dispatch({
            type: 'set_appData',
            payload: {
                appName: dapp.appName,
                appDesc: dapp.appDesc,
                appAbi: dapp.appAbi,
                appNetwork: dapp.appNetwork,
                appAddress: dapp.appAddress,
            }
        });

        setRecentDapp(dapp);
        navigate('/detail');
    };

    const onDeleteDapp = (e, dappId) => {
        e.stopPropagation();
        deleteDapp(dappId);
        setSavedDapps(getSavedDapps());
    };

    return (
        <WD>
            <HeroSection>
                <ContentContainer>
                    <HeroTitle level={1}>Instantly Create dApps for Any Smart Contract</HeroTitle>
                    <HeroSubtitle>
                        Quick dApp is a tool that lets you create a simple dApp interface for any smart contract in seconds.
                        Just paste your contract's ABI and address to get started.
                    </HeroSubtitle>
                    <HeroButton size="large" icon={<RocketOutlined />} onClick={onClickStart}>
                        Create Your dApp Now
                    </HeroButton>
                </ContentContainer>
            </HeroSection>

            {savedDapps.length > 0 && (
                <FeaturesSection style={{ paddingTop: '3em', paddingBottom: '3em', background: 'linear-gradient(180deg, rgba(102, 126, 234, 0.02) 0%, transparent 100%)' }}>
                    <ContentContainer>
                        <SectionTitle level={2}>
                            <HistoryOutlined style={{ marginRight: '12px' }} /> Recently Saved dApps
                        </SectionTitle>
                        <Row gutter={[20, 20]}>
                            {savedDapps.slice(0, 6).map((dapp) => (
                                <Col xs={24} sm={12} lg={8} key={dapp.id}>
                                    <SavedDappsCard
                                        hoverable
                                        onClick={() => onLoadDapp(dapp)}
                                        title={<span style={{ color: '#2d3748', fontWeight: 600 }}>{dapp.appName || 'Untitled dApp'}</span>}
                                        extra={
                                            <Button
                                                type="text"
                                                danger
                                                size="small"
                                                icon={<DeleteOutlined />}
                                                onClick={(e) => onDeleteDapp(e, dapp.id)}
                                            />
                                        }
                                    >
                                        {dapp.appDesc && <Paragraph ellipsis={{ rows: 2 }} style={{ marginBottom: '16px' }}>{dapp.appDesc}</Paragraph>}
                                        <Space direction="vertical" size="small" style={{ width: '100%' }}>
                                            <Text type="secondary" style={{ fontSize: '12px', fontFamily: 'monospace' }}>
                                                {dapp.appAddress ? `${dapp.appAddress.substring(0, 8)}...${dapp.appAddress.substring(dapp.appAddress.length - 6)}` : 'No address'}
                                            </Text>
                                            {dapp.appNetwork && <Tag color="purple">{dapp.appNetwork}</Tag>}
                                            {dapp.lastAccessedAt && (
                                                <Text type="secondary" style={{ fontSize: '11px' }}>
                                                    Last accessed: {new Date(dapp.lastAccessedAt).toLocaleDateString()}
                                                </Text>
                                            )}
                                        </Space>
                                    </SavedDappsCard>
                                </Col>
                            ))}
                        </Row>
                        {savedDapps.length > 6 && (
                            <div style={{ textAlign: 'center', marginTop: '24px' }}>
                                <Text type="secondary" style={{ fontSize: '14px' }}>and {savedDapps.length - 6} more saved dApps...</Text>
                            </div>
                        )}
                    </ContentContainer>
                </FeaturesSection>
            )}
        </WD>
    );
}