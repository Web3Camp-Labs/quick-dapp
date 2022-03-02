// import logo from './res/logo.png';
import './App.css';
import Header from './components/Header';
import Footer from './components/Footer';
import GlobalStyle from './utils/ourstyle';
import { DappContextProvider } from './store/contextProvider';

import { Layout } from 'antd';
import RouterPath from './router/router';
import { HashRouter as Router } from 'react-router-dom';
import styled from 'styled-components';

const GlobalLayout = styled('div')`
min-height: 100vh!important;
display: flex;
flex-direction: column;
justify-content: space-between;
`

const PanelLayout = styled('div')`
flex-grow: 1;
display:flex;
flex-direction:column;
justify-content:flex-start;
`

function App() {
  return (
    <DappContextProvider>
      <GlobalLayout>
        <Router>
          <Header></Header>
          <PanelLayout>
            <RouterPath></RouterPath>
          </PanelLayout>
          <Footer></Footer>
        </Router>
        <GlobalStyle />
      </GlobalLayout>
    </DappContextProvider>
  );
}

export default App;
