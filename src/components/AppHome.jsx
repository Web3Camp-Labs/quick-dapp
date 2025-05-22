import styled from 'styled-components';
import { Button, Row, Col, Card, Typography, Space } from 'antd';
import { RocketOutlined, CodeOutlined, MobileOutlined, ApiOutlined, TeamOutlined, GlobalOutlined } from '@ant-design/icons';
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import logo from '../res/logo.svg';

const { Title: AntTitle, Paragraph, Text } = Typography;

const WD = styled.div`
    padding: 0;
    background-color: #ffffff;
    width: 100vw;
    flex-grow: 1;
    border-radius: 10px;
`;

const HeroSection = styled.div`
    padding: 4em 2em;
    text-align: center;
    background: linear-gradient(135deg, #f5f7fa 0%, #e4e8f0 100%);
    border-radius: 10px 10px 0 0;

    @media (max-width: 768px) {
        padding: 3em 1em;
    }
`;

const HeroTitle = styled(AntTitle)`
    margin-bottom: 16px !important;
    font-size: 2.5rem !important;
    
    @media (max-width: 768px) {
        font-size: 2rem !important;
    }
`;

const HeroSubtitle = styled(Paragraph)`
    font-size: 1.2rem;
    max-width: 700px;
    margin: 0 auto 2rem auto !important;
    color: #555;
    
    @media (max-width: 768px) {
        font-size: 1rem;
    }
`;

const Logo = styled.img`
    width: 120px;
    margin-bottom: 20px;
    
    @media (max-width: 768px) {
        width: 100px;
    }
`;

const FeaturesSection = styled.div`
    padding: 4em 2em;
    background-color: white;
    
    @media (max-width: 768px) {
        padding: 2em 1em;
    }
`;

const SectionTitle = styled(AntTitle)`
    text-align: center;
    margin-bottom: 2em !important;
`;

const FeatureCard = styled(Card)`
    height: 100%;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
    transition: all 0.3s ease;
    
    &:hover {
        transform: translateY(-5px);
        box-shadow: 0 8px 20px rgba(0, 0, 0, 0.1);
    }
    
    .ant-card-head-title {
        font-weight: 600;
    }
    
    .ant-card-body {
        padding: 24px;
    }
`;

const IconWrapper = styled.div`
    font-size: 36px;
    margin-bottom: 16px;
    color: #1890ff;
`;

const CTASection = styled.div`
    padding: 3em 2em;
    text-align: center;
    background: linear-gradient(135deg, #e6f7ff 0%, #bae7ff 100%);
    border-radius: 0 0 10px 10px;
`;

const CTAButton = styled(Button)`
    height: 50px;
    font-size: 16px;
    padding: 0 32px;
    border-radius: 25px;
`;

export default function AppHome() {
    const navigate = useNavigate();

    useEffect(() => {
    }, [])

    const onClickStart = async () => {
        navigate(`/new`); // Navigate to App Create page
    }

    const features = [
        {
            title: 'Instant dApp Creation',
            description: 'Create a dApp interface for any smart contract in seconds with just the ABI and contract address.',
            icon: <RocketOutlined />
        },
        {
            title: 'Multi-Network Support',
            description: 'Support for Ethereum, Polygon, Arbitrum, Optimism and other EVM-compatible networks.',
            icon: <GlobalOutlined />
        },
        {
            title: 'Mobile Compatible',
            description: 'Access your dApp on any device using your favorite Ethereum wallet.',
            icon: <MobileOutlined />
        },
        {
            title: 'Developer Friendly',
            description: 'Clear error messages and transaction status updates for a better development experience.',
            icon: <CodeOutlined />
        },
        {
            title: 'No Coding Required',
            description: 'Generate a complete interface without writing a single line of code.',
            icon: <ApiOutlined />
        },
        {
            title: 'Open Source',
            description: 'Built by the Web3Camp community, free to use and open for contributions.',
            icon: <TeamOutlined />
        }
    ];

    return (
        <WD>
            <HeroSection>
                <Logo src={logo} alt="Quick dApp Logo" />
                <HeroTitle level={1}>Instantly Create dApps for Any Smart Contract</HeroTitle>
                <HeroSubtitle>
                    Quick dApp is a tool that lets you create a simple dApp interface for any smart contract in seconds. 
                    Just paste your contract's ABI and address to get started.
                </HeroSubtitle>
                <CTAButton type="primary" size="large" icon={<RocketOutlined />} onClick={onClickStart}>
                    Create Your dApp
                </CTAButton>
            </HeroSection>
            
            <FeaturesSection>
                <SectionTitle level={2}>Features</SectionTitle>
                <Row gutter={[24, 24]}>
                    {features.map((feature, index) => (
                        <Col xs={24} sm={12} lg={8} key={index}>
                            <FeatureCard>
                                <IconWrapper>{feature.icon}</IconWrapper>
                                <AntTitle level={4}>{feature.title}</AntTitle>
                                <Paragraph>{feature.description}</Paragraph>
                            </FeatureCard>
                        </Col>
                    ))}
                </Row>
            </FeaturesSection>
            
            <CTASection>
                <Space direction="vertical" size="large">
                    <AntTitle level={3}>Ready to build your dApp?</AntTitle>
                    <CTAButton type="primary" size="large" onClick={onClickStart}>
                        Get Started Now
                    </CTAButton>
                </Space>
            </CTASection>
        </WD>
    );
}