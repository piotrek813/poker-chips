import { useRouteError } from 'react-router-dom';
import Wrapper from './layouts/Wrapper';
import Center from './layouts/Center';

export default function ErrorPage() {
  const error = useRouteError();
  // eslint-disable-next-line no-console
  console.error(error);

  return (
    <Wrapper>
      <Center vertically>
        <h1>Oops!</h1>
        <p>Sorry, an unexpected error has occurred.</p>
        <p>
          <i>{error.statusText || error.message}</i>
        </p>
      </Center>
    </Wrapper>
  );
}
