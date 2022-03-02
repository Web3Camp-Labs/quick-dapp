import styled from "styled-components";

const BoxFooter = styled('div')`
    text-align: center;
    padding: 20px 0;
`

export default function Footer() {
    return <BoxFooter><div>© Taoist 2022</div><div>Supported by Wendy with ❤️❤️</div></BoxFooter>
}