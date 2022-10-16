import styled from 'styled-components';
import LogOut from './LogOut';
import { auth } from '../utils/firebase';

function Navbar() {
  return (
    <Nav>
      <Profile>
        <Avatar
          referrerPolicy="no-referrer"
          className="avatar"
          src={auth.currentUser.photoURL}
          alt={`${auth.currentUser.displayName} avatar`}
        />
        <Span>Logged in as </Span>
        <b>{auth.currentUser.displayName}</b>
      </Profile>
      <LogOut />
    </Nav>
  );
}

const Nav = styled.nav`
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 50px;
`;

const Profile = styled.section`
  display: flex;
  flex-direction: row;
  align-items: center;

  & > * {
    margin: 0 5px;
  }
`;

const Avatar = styled.img`
  width: 50px;
  height: 50px;
  border-radius: 50%;
`;

const Span = styled.span`
  display: none;

  @media (min-width: 400px) {
    display: block;
  }
`;

export default Navbar;
