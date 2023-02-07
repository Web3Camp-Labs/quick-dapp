import styled from "styled-components";
import GithubImg from "../res/github.png";
import TwitterImg from "../res/Twitter.png";

const Footer = styled.div`
  height: 80px;
  width: 90%;
  margin: 0 auto;
  padding-top: 15px;
  font-size: 14px;
  .midBox{
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  img{
    width: 40px;
    height: 40px;
  }
  .lft{
    padding-left: 10px;
  }
  a{
    display: inline-block;
    margin-left: 20px;
  }
`
export default function footerBox(){
    return  <Footer>
        <div>
            <div className="midBox">
                <a href="https://web3camp.us" target="_blank" rel="noreferrer">
                    <div className="lft">&copy; 2022 Web3camp.us</div>
                </a>

                <div>
                    <a href="https://github.com/Web3Camp-Labs/nft-checker" target="_blank" rel="noreferrer">
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
