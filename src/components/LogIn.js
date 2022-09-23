import { useSignInWithGoogle } from 'react-firebase-hooks/auth';
import { auth } from '../utils/firebase';

function LogIn() {
  const [signInWithGoogle] = useSignInWithGoogle(auth);

  return (
    <button type="button" onClick={() => signInWithGoogle()}>
      Log in
    </button>
  );
}

export default LogIn;
