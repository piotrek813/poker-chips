import styled from 'styled-components';
import { ReactComponent as Logo } from '../images/logo.svg';

const Header = styled.header`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
`;

const H1 = styled.h1`
  font-size: 44px;
`;

function MainHeader() {
  return (
    <Header>
      <Logo />
      <H1>Poker Chips</H1>
    </Header>
  );
}

export default MainHeader;
