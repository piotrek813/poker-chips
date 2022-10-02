import Button from '../components/Button';
import MainLayout from '../layouts/MainLayout';
import Header from '../components/MainHeader';

function Home() {
  return (
    <MainLayout>
      <Header />
      <main>
        <Button to="create">Create a table</Button>
        <Button secondary to="join">
          Join a table
        </Button>
      </main>
    </MainLayout>
  );
}

export default Home;
