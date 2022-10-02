import { Outlet } from 'react-router-dom';
import MainLayout from './MainLayout';

function Home() {
  return (
    <MainLayout>
      <Outlet />
    </MainLayout>
  );
}

export default Home;
