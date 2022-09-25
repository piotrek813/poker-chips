function Input({ label, id, type, ...props }) {
  return (
    <label htmlFor={id}>
      {/* eslint-disable-next-line react/jsx-props-no-spreading */}
      {label} <input type={type || 'text'} id={id} name={id} {...props} />
    </label>
  );
}

export default Input;
