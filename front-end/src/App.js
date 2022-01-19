import logo from './logo.svg';
import './App.css';
import Header from './components/Header';
import Content from './components/Content';
import Footer from './components/Footer';
import GlobalStyle from './utils/ourstyle';

import { Layout } from 'antd';

function App() {
  return (<Layout>
    <Header>Header</Header>
    <Content>Content</Content>
    <Footer>Footer</Footer>
    <GlobalStyle/>
  </Layout>);
}

export default App;
