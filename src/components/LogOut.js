import { signOut } from 'firebase/auth';
import { auth } from '../utils/firebase';
import Button from './Button';

function LogOut() {
  return (
    <Button type="button" small variant="borders" onClick={() => signOut(auth)}>
      Log out
    </Button>
  );
}

export default LogOut;
