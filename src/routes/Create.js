import { Form, redirect, useNavigation } from 'react-router-dom';
import { createTable } from '../utils/firebase';
import Input from '../components/Input';
import Spinner from '../components/Spinner';

export const action = async ({ request }) => {
  const formData = await request.formData();
  const buyIn = Number(formData.get('buy-in'));
  const tableId = await createTable(buyIn);
  return redirect(`/t/${tableId}`);
};

function Join() {
  const navigation = useNavigation();

  if (navigation.state === 'submitting') return <Spinner />;
  return (
    <Form method="post">
      <Input type="number" label="buy in" id="buy-in" required />
      <button type="submit" disabled={navigation.state === 'submitting'}>
        Create
      </button>
    </Form>
  );
}

export default Join;
