import { signOut } from 'firebase/auth';
import { auth } from '../utils/firebase';

function LogOut() {
  return (
    <button type="button" onClick={() => signOut(auth)}>
      Log out
    </button>
  );
}

export default LogOut;
