import { useSignInWithGoogle } from 'react-firebase-hooks/auth';
import GoogleButton from 'react-google-button';
import { auth } from '../utils/firebase';
import { ReactComponent as GoogleIcon } from '../images/Google.svg';

function LogIn() {
  const [signInWithGoogle] = useSignInWithGoogle(auth);

  return (
    <GoogleButton type="dark" onClick={() => signInWithGoogle()}>
      <GoogleIcon />
      Sign in with Google
    </GoogleButton>
  );
}

export default LogIn;
