import styled from 'styled-components';
import { signOut } from 'firebase/auth';
import { auth } from '../utils/firebase';

const Button = styled.button`
  background: none;
  padding: 8px 10px;
  font-size: 16px;
  border-radius: 5px;
  color: var(--white-1);
  border: solid 2px var(--c-white-1);
`;

function LogOut() {
  return (
    <Button type="button" onClick={() => signOut(auth)}>
      Log out
    </Button>
  );
}

export default LogOut;
