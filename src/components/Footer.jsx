import styled from "styled-components";
import GithubImg from "../res/github.png";
import TwitterImg from "../res/Twitter.png";

const Footer = styled.div`
  height: 80px;
  width: 100%;
  margin: 0 auto;
  padding: 15px 5%;
  font-size: 14px;
  background-color: #ffffff;
  box-shadow: 0 -2px 8px rgba(0, 0, 0, 0.06);
  
  .midBox{
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  
  img{
    width: 32px;
    height: 32px;
    transition: opacity 0.3s ease;
    
    &:hover {
      opacity: 0.8;
    }
  }
  
  .lft{
    padding-left: 10px;
    color: #666;
  }
  
  a{
    display: inline-block;
    margin-left: 20px;
    text-decoration: none;
    color: #1890ff;
    
    &:hover {
      color: #40a9ff;
    }
  }
  
  @media (max-width: 768px) {
    height: 70px;
    padding: 10px 3%;
    
    img {
      width: 28px;
      height: 28px;
    }
    
    .lft {
      font-size: 12px;
    }
  }
`
export default function footerBox(){
    return  <Footer>
        <div>
            <div className="midBox">
                <a href="https://web3camp.us" target="_blank" rel="noreferrer">
                    <div className="lft">&copy; 2022-2025 Web3Camp.us</div>
                </a>

                <div>
                    <a href="https://github.com/Web3Camp-Labs/quick-dapp" target="_blank" rel="noreferrer">
                        <img src={GithubImg} alt=""/>
                    </a>
                    <a href="https://twitter.com/Web3Camp" target="_blank" rel="noreferrer">
                        <img src={TwitterImg} alt=""/>
                    </a>
                </div>
            </div>
        </div>
    </Footer>
}
