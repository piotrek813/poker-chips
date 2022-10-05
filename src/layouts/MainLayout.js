import { useAuthState } from 'react-firebase-hooks/auth';
import styled from 'styled-components';
import { auth } from '../utils/firebase';
import LogIn from '../components/LogIn';
import LogOut from '../components/LogOut';
import Wrapper from './Wrapper';
import Spinner from '../components/Spinner';
import Header from '../components/MainHeader';
import Center from './Center';

function MainLayout({ children }) {
  const [user, loading, error] = useAuthState(auth);

  if (loading) {
    return (
      <Wrapper>
        <Spinner />
      </Wrapper>
    );
  }
  if (error) {
    return (
      <Wrapper>
        <p>Error: {error}</p>
      </Wrapper>
    );
  }
  if (user) {
    return (
      <Wrapper>
        <Nav>
          <Profile>
            <Avatar
              referrerPolicy="no-referrer"
              className="avatar"
              src={user.photoURL}
              alt={`${user.displayName} avatar`}
            />
            <Span>Logged in as </Span>
            <b>{user.displayName}</b>
          </Profile>
          <LogOut />
        </Nav>
        {children}
      </Wrapper>
    );
  }
  return (
    <Wrapper>
      <Center vertically>
        <Header />
        <LogIn />
      </Center>
    </Wrapper>
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

export default MainLayout;
