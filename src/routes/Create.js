import { Form, redirect, useNavigation } from 'react-router-dom';
import { createTable } from '../utils/firebase';
import Input from '../components/Input';
import Label from '../components/Label';
import Spinner from '../components/Spinner';
import Button from '../components/Button';
import Center from '../layouts/Center';

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
    <Center>
      <Form method="post">
        <Label htmlFor="buy-in">
          Buy in
          <Input
            type="number"
            name="buy-in"
            id="buy-in"
            inputMode="numeric"
            min="0"
            max="1000000000000"
          />
        </Label>
        <Button type="submit" fullWidth>
          Create
        </Button>
      </Form>
    </Center>
  );
}

export default Join;
