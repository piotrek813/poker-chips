import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '../utils/firebase';
import LogIn from '../components/LogIn';
import Wrapper from './Wrapper';
import Spinner from '../components/Spinner';
import Header from '../components/MainHeader';
import Center from './Center';
import Button from '../components/Button';
import Navbar from '../components/Navbar';

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
        <Navbar />
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

export default MainLayout;
