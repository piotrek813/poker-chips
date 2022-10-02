import { Form, redirect, useNavigation } from 'react-router-dom';
import styled from 'styled-components';
import { joinTable } from '../utils/firebase';
import Spinner from '../components/Spinner';
import Center from '../layouts/Center';
import Button from '../components/Button';
import Input from '../components/Input';
import Label from '../components/Label';

export const action = async ({ request }) => {
  const formData = await request.formData();
  const tableId = formData.get('table-id');
  await joinTable(tableId);
  return redirect(`/t/${tableId}`);
};

function Join() {
  const navigation = useNavigation();

  if (navigation.state === 'submitting') return <Spinner />;
  return (
    <Center>
      <Form method="post">
        <Label htmlFor="table-id">
          Enter table <Span>#id</Span>
          <Input
            type="number"
            name="table-id"
            id="table-id"
            inputMode="numeric"
            min="0"
            max="9999"
          />
        </Label>
        <Button type="submit">Join</Button>
      </Form>
    </Center>
  );
}

const Span = styled.span`
  color: var(--c-red-1);
  font-weight: var(--font-weight-black);
`;

export default Join;
