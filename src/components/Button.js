/* eslint-disable react/jsx-props-no-spreading */
import { Link } from 'react-router-dom';
import styled, { css } from 'styled-components';
import PropTypes from 'prop-types';

function Button({
  type,
  to,
  size,
  fullWidth,
  variant,
  boxShadow,
  children,
  onClick,
}) {
  const styleProps = {
    $size: size,
    $fullWidth: fullWidth,
    $variant: variant,
    $boxShadow: boxShadow,
  };
  if (type === 'button' || type === 'submit')
    return (
      <StyledButton as="button" type={type} onClick={onClick} {...styleProps}>
        {children}
      </StyledButton>
    );
  if (type === 'link')
    return (
      <StyledButton to={to} {...styleProps}>
        {children}
      </StyledButton>
    );
}
const StyledButton = styled(Link).attrs((props) => ({
  $type: props.type || 'link',
  $variant: props.$variant,
  $size: props.$size,
  $boxShadow: props.$boxShadow,
}))`
  &:hover {
    cursor: pointer;
  }

  ${({ $size }) => {
    switch ($size) {
      case 'small':
        return css`
          padding: 8px 10px;
          font-size: 16px;
          border-radius: 5px;
        `;
      case 'medium':
        return css`
          font-size: 20px;
          border-radius: 5px;
          padding: 10px 35px;
        `;
      default:
        return css`
          font-size: 20px;
          padding: 15px 40px;
          font-weight: 500;
          border-radius: 7px;
          display: block;
          text-align: center;
          text-decoration: none;
          margin-top: 17px;
        `;
    }
  }}

  ${({ type }) =>
    type !== 'link' &&
    css`
      border: none;
    `}

  ${({ boxShadow }) =>
    boxShadow &&
    css`
      box-shadow: var(--box-shadow-button);
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
          color: var(--c-white-1);
          border: solid 2px var(--c-white-1);
          background: none;
        `;
      case 'lightGrey':
        return css`
          color: var(--c-white-3);
          background: var(--c-grey-2);
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
  variant: PropTypes.oneOf(['secondary', 'borders', 'lightGrey', 'default']),
  type: PropTypes.oneOf(['link', 'button', 'submit']),
  size: PropTypes.oneOf(['small', 'medium', 'normal']),
  fullWidth: PropTypes.bool,
  boxShadow: PropTypes.bool,
};

Button.defaultProps = {
  to: '',
  type: 'link',
  variant: 'default',
  size: 'normal',
  fullWidth: false,
  boxShadow: false,
};

export default Button;
