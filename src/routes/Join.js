import { Form, redirect } from 'react-router-dom';
import { joinTable } from '../utils/firebase';
import Input from '../components/Input';

export const action = async ({ request }) => {
  const formData = await request.formData();
  const tableId = formData.get('table-id');
  await joinTable(tableId);
  return redirect(`/t/${tableId}`);
};

function Join() {
  return (
    <Form method="post">
      <Input label="Table id" id="table-id" required />
      <button type="submit">Join</button>
    </Form>
  );
}

export default Join;
