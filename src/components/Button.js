import { Link } from 'react-router-dom';
import styled, { css } from 'styled-components';
import PropTypes from 'prop-types';

function Button({ type, to, small, fullWidth, variant, children, onClick }) {
  if (type === 'button' || type === 'submit')
    return (
      <StyledButton
        as="button"
        type={type}
        onClick={onClick}
        $variant={variant}
        $small={small}
        $fullWidth={fullWidth}
      >
        {children}
      </StyledButton>
    );
  if (type === 'link')
    return (
      <StyledButton
        to={to}
        $variant={variant}
        $small={small}
        $fullWidth={fullWidth}
      >
        {children}
      </StyledButton>
    );
}
const StyledButton = styled(Link).attrs((props) => ({
  $type: props.type || 'link',
  $variant: props.$variant,
  $small: props.$small || false,
}))`
  ${({ $small }) =>
    $small
      ? css`
          padding: 8px 10px;
          font-size: 16px;
          border-radius: 5px;
        `
      : css`
          font-size: 20px;
          padding: 15px 40px;
          font-weight: 500;
          border-radius: 7px;
          display: block;
          text-align: center;
          text-decoration: none;
          margin-top: 17px;
        `}

  ${({ type }) =>
    type !== 'link' &&
    css`
      border: none;
    `}

  ${({ $fullWidth }) =>
    $fullWidth &&
    css`
      width: 100%;
    `}

  ${({ $variant }) => {
    switch ($variant) {
      case 'secondary':
        return css`
          color: var(--c-white-2);
          background-color: var(--c-grey-1);
        `;
      case 'borders':
        return css`
          color: var(--white-1);
          border: solid 2px var(--c-white-1);
          background: none;
        `;
      default:
        return css`
          background-color: var(--c-purple-1);
          color: var(--c-white-3);
        `;
    }
  }}
`;

Button.propTypes = {
  to: PropTypes.string,
  children: PropTypes.string.isRequired,
  variant: PropTypes.oneOf(['secondary', 'borders', 'default']),
  type: PropTypes.oneOf(['link', 'button', 'submit']),
  small: PropTypes.bool,
  fullWidth: PropTypes.bool,
};

Button.defaultProps = {
  to: '',
  type: 'link',
  variant: 'default',
  small: false,
  fullWidth: false,
};

export default Button;
