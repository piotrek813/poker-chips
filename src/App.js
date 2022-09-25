import './App.css';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from './utils/firebase';
import LogIn from './components/LogIn';
import LogOut from './components/LogOut';
import Setup from './components/Setup';

function App() {
  const [user, loading, error] = useAuthState(auth);

  if (loading) {
    return (
      <div>
        <p>Initialising User...</p>
      </div>
    );
  }
  if (error) {
    return (
      <div>
        <p>Error: {error}</p>
      </div>
    );
  }
  if (user) {
    return (
      <div>
        <LogOut />
        <Setup />
      </div>
    );
  }
  return <LogIn />;
}

export default App;
