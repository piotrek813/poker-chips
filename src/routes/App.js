import { useAuthState } from 'react-firebase-hooks/auth';
import { Outlet } from 'react-router-dom';
import { auth } from '../utils/firebase';
import LogIn from '../components/LogIn';
import LogOut from '../components/LogOut';
import '../styles/main.css';

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
      <div className="layout-wrapper">
        <nav>
          <section className="profile">
            <img
              referrerPolicy="no-referrer"
              className="avatar"
              src={user.photoURL}
              alt={`${user.displayName} avatar`}
            />
            Logged in as <b>{user.displayName}</b>
          </section>
          <LogOut />
        </nav>
        <header>
          <h1>Poker chips</h1>
        </header>
        <main>
          <Outlet />
        </main>
      </div>
    );
  }
  return <LogIn />;
}

export default App;
