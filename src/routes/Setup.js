import { Link } from 'react-router-dom';

function Setup() {
  return (
    <>
      <Link className="btn" to="create">
        Create a table
      </Link>
      <Link className="btn" to="join">
        Join a table
      </Link>
    </>
  );
}

export default Setup;
