import { Link } from 'react-router-dom';
import styled, { css } from 'styled-components';
import PropTypes from 'prop-types';

function Button({ type, to, secondary, children }) {
  if (type === 'button' || type === 'submit')
    return (
      <StyledButton as="button" $secondary={secondary} type={type}>
        {children}
      </StyledButton>
    );
  if (type === 'link')
    return (
      <StyledButton $secondary={secondary} to={to}>
        {children}
      </StyledButton>
    );
}
const StyledButton = styled(Link).attrs((props) => ({
  $type: props.type || 'link',
  $secondary: props.$secondary,
}))`
  font-size: 20px;
  padding: 15px 40px;
  font-weight: 500;
  border-radius: 7px;
  display: block;
  text-align: center;
  text-decoration: none;
  margin-top: 17px;

  ${({ type }) =>
    type !== 'link' &&
    css`
      display: block;
      border: none;
      width: 100%;
    `}

  ${({ $secondary }) => {
    if ($secondary)
      return css`
        background-color: var(--c-grey-1);
        color: var(--c-white-2);
      `;
    return css`
      background-color: var(--c-purple-1);
      color: var(--c-white-3);
    `;
  }}
`;

Button.propTypes = {
  to: PropTypes.string,
  children: PropTypes.string.isRequired,
  secondary: PropTypes.bool,
  type: PropTypes.oneOf(['link', 'button', 'submit']),
};

Button.defaultProps = {
  to: '',
  secondary: false,
  type: 'link',
};

export default Button;
