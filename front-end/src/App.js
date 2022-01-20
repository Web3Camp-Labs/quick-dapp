// import logo from './res/logo.png';
import './App.css';
import Header from './components/Header';
import Footer from './components/Footer';
import GlobalStyle from './utils/ourstyle';
import { DappContextProvider } from './store/contextProvider';

import { Layout } from 'antd';
import RouterPath from './router/router';
import { HashRouter as Router } from 'react-router-dom';

function App() {
  return (
    <DappContextProvider>
      <Layout>
        <Header></Header>
        {/* <AppCreate></AppCreate> */}
        <Router>
          <RouterPath></RouterPath>
        </Router>
        <Footer></Footer>
        <GlobalStyle />
      </Layout>
    </DappContextProvider>
  );
}

export default App;
