// import logo from './res/logo.png';
import './App.css';
import Header from './components/Header';
import Content from './components/Content';
import Footer from './components/Footer';
import GlobalStyle from './utils/ourstyle';
import { DappContextProvider } from './store/contextProvider';

import { Layout } from 'antd';

function App() {
  return (
    <DappContextProvider>
      <Layout>
        <Header></Header>
        <Content></Content>
        <Footer></Footer>
        <GlobalStyle />
      </Layout>
    </DappContextProvider>
  );
}

export default App;
