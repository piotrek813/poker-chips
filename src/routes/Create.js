import { Form, redirect } from 'react-router-dom';
import { createTable } from '../utils/firebase';
import Input from '../components/Input';

export const action = async ({ request }) => {
  const formData = await request.formData();
  const buyIn = Number(formData.get('buy-in'));
  const tableId = await createTable(buyIn);
  return redirect(`/t/${tableId}`);
};

function Join() {
  return (
    <Form method="post">
      <Input type="number" label="buy in" id="buy-in" required />
      <button type="submit">Join</button>
    </Form>
  );
}

export default Join;
